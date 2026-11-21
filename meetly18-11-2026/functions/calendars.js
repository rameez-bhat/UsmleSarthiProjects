import { ensureZoom, removeZoom } from "./zoom.js";
import { confirmedParticipants } from "./invitations.js";
import crypto from "node:crypto";
import { safeOAuthError } from "./oauth-config.js";
import { schedulerDatabase } from "./database.js";
const db = schedulerDatabase;
export const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");
const key = () => {
  const k = Buffer.from(process.env.OAUTH_TOKEN_KEY || "", "base64");
  if (k.length !== 32)
    throw Error("OAUTH_TOKEN_KEY must be a base64-encoded 32-byte key.");
  return k;
};
export function seal(value) {
  const iv = crypto.randomBytes(12),
    c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([
    c.update(JSON.stringify(value), "utf8"),
    c.final(),
  ]);
  return [
    iv.toString("base64"),
    c.getAuthTag().toString("base64"),
    body.toString("base64"),
  ].join(".");
}
export function unseal(value) {
  const [iv, tag, body] = value.split(".");
  const c = crypto.createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64"),
  );
  c.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      c.update(Buffer.from(body, "base64")),
      c.final(),
    ]).toString(),
  );
}
export async function request(url, options = {}) {
  const r = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(20000),
  });
  let data;
  try {
    data = await r.json();
  } catch {
    data = {};
  }
  if (!r.ok) {
    const error = Error(
      `Calendar request failed (${r.status}). Reconnect your calendar if authorization expired.`,
    );
    error.status = r.status;
    error.oauthError = safeOAuthError(data.error);
    throw error;
  }
  return data;
}
const tokenUrl = (p) =>
  p === "zoom"
    ? "https://zoom.us/oauth/token"
    : p === "google"
      ? "https://oauth2.googleapis.com/token"
      : "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const clientId = (p) =>
  process.env[
    p === "zoom"
      ? "ZOOM_OAUTH_CLIENT_ID"
      : p === "google"
        ? "GOOGLE_CLIENT_ID"
        : "MICROSOFT_CLIENT_ID"
  ];
const clientSecret = (p) =>
  process.env[
    p === "zoom"
      ? "ZOOM_OAUTH_CLIENT_SECRET"
      : p === "google"
        ? "GOOGLE_CLIENT_SECRET"
        : "MICROSOFT_CLIENT_SECRET"
  ];
export function authorization(provider, state, verifier) {
  if (!clientId(provider) || !process.env.OAUTH_REDIRECT_URI)
    throw Error("Calendar OAuth is not configured by the administrator.");
  if (provider === "zoom") {
    return (
      "https://zoom.us/oauth/authorize?" +
      new URLSearchParams({
        client_id: clientId(provider),
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        response_type: "code",
        state,
      })
    );
  }
  const google = provider === "google";
  const q = new URLSearchParams({
    client_id: clientId(provider),
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    response_type: "code",
    state,
    scope: google
      ? "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy"
      : "offline_access User.Read Calendars.ReadWrite",
    code_challenge: hashBase64(verifier),
    code_challenge_method: "S256",
    ...(google
      ? { access_type: "offline", prompt: "consent" }
      : { prompt: "select_account" }),
  });
  return (
    (google
      ? "https://accounts.google.com/o/oauth2/v2/auth?"
      : "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?") + q
  );
}
const hashBase64 = (v) =>
  crypto.createHash("sha256").update(v).digest("base64url");
export async function exchange(provider, code, verifier) {
  const tokens = await request(tokenUrl(provider), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(provider === "zoom"
        ? {
            Authorization: `Basic ${Buffer.from(`${clientId(provider)}:${clientSecret(provider)}`).toString("base64")}`,
          }
        : {}),
    },
    body: new URLSearchParams({
      ...(provider === "zoom"
        ? {}
        : {
            client_id: clientId(provider),
            client_secret: clientSecret(provider),
          }),
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
      ...(provider === "zoom" ? {} : { code_verifier: verifier }),
    }),
  });
  if (!tokens.refresh_token)
    throw Error(
      "Offline calendar access was not granted. Please reconnect and consent.",
    );
  return { ...tokens, expiresAt: Date.now() + tokens.expires_in * 1000 };
}
async function token(uid, provider) {
  const ref = db().doc(`scheduler_private/${uid}_${provider}`),
    s = await ref.get();
  if (!s.exists) throw Error("Calendar connection is missing.");
  let t = unseal(s.data().tokens);
  if (t.expiresAt < Date.now() + 120000) {
    if (provider === "zoom") return refreshZoomToken(uid, ref);
    const next = await request(tokenUrl(provider), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(provider === "zoom"
          ? {
              Authorization: `Basic ${Buffer.from(`${clientId(provider)}:${clientSecret(provider)}`).toString("base64")}`,
            }
          : {}),
      },
      body: new URLSearchParams({
        client_id: clientId(provider),
        client_secret: clientSecret(provider),
        refresh_token: t.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    t = { ...t, ...next, expiresAt: Date.now() + next.expires_in * 1000 };
    await ref.update({ tokens: seal(t) });
  }
  return t.access_token;
}
async function refreshZoomToken(uid, ref) {
  const leaseRef = db().doc(`scheduler_token_locks/${uid}_zoom`);
  const leaseId = crypto.randomUUID();
  const existing = await db().runTransaction(async (tx) => {
    const [saved, lease] = await Promise.all([tx.get(ref), tx.get(leaseRef)]);
    if (!saved.exists) throw Error("Reconnect your Zoom account.");
    const tokens = unseal(saved.data().tokens);
    if (tokens.expiresAt > Date.now() + 120000) return tokens.access_token;
    if (lease.data()?.expiresAt > Date.now())
      throw Error("Zoom token refresh is in progress. Retry shortly.");
    tx.set(leaseRef, { leaseId, expiresAt: Date.now() + 60000 });
    return null;
  });
  if (existing) return existing;
  try {
    const saved = await ref.get();
    const current = unseal(saved.data().tokens);
    const next = await request(tokenUrl("zoom"), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId("zoom")}:${clientSecret("zoom")}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: current.refresh_token,
      }),
    });
    if (!next.access_token || !next.refresh_token)
      throw Error(
        "Reconnect Zoom: token refresh returned incomplete credentials.",
      );
    await ref.update({
      tokens: seal({
        ...current,
        ...next,
        expiresAt: Date.now() + Number(next.expires_in) * 1000,
      }),
    });
    return next.access_token;
  } finally {
    await db().runTransaction(async (tx) => {
      const lease = await tx.get(leaseRef);
      if (lease.data()?.leaseId === leaseId) tx.delete(leaseRef);
    });
  }
}
export async function connections(uid) {
  const s = await db()
    .collection("scheduler_connections")
    .where("ownerId", "==", uid)
    .get();
  return s.docs.map((d) => d.data().provider);
}
export async function busyForHost(uid, start, end) {
  const providers = (await connections(uid)).filter((p) => p !== "zoom");
  const lists = await Promise.all(
    providers.map(async (p) => {
      const access = await token(uid, p),
        headers = {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        };
      if (p === "google") {
        const result = await request(
          "https://www.googleapis.com/calendar/v3/freeBusy",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              timeMin: new Date(start).toISOString(),
              timeMax: new Date(end).toISOString(),
              items: [{ id: "primary" }],
            }),
          },
        );
        const c = result.calendars?.primary;
        if (!c || c.errors?.length)
          throw Error("Google busy-time lookup failed.");
        return (c.busy || []).map((x) => ({
          start: Date.parse(x.start),
          end: Date.parse(x.end),
        }));
      }
      let url =
        "https://graph.microsoft.com/v1.0/me/calendarView?" +
        new URLSearchParams({
          startDateTime: new Date(start).toISOString(),
          endDateTime: new Date(end).toISOString(),
          $select: "start,end,showAs,isCancelled",
          $top: "1000",
        });
      const busy = [];
      for (let page = 0; url; page++) {
        if (page >= 10 || new URL(url).origin !== "https://graph.microsoft.com")
          throw Error("Outlook busy-time lookup is incomplete.");
        const result = await request(url, {
          headers: { ...headers, Prefer: 'outlook.timezone="UTC"' },
        });
        for (const x of result.value || [])
          if (!x.isCancelled && x.showAs !== "free")
            busy.push({
              start: Date.parse(x.start.dateTime.replace(/Z$/, "") + "Z"),
              end: Date.parse(x.end.dateTime.replace(/Z$/, "") + "Z"),
            });
        url = result["@odata.nextLink"];
      }
      return busy;
    }),
  );
  return lists.flat();
}
export async function removeExternal(uid, ids = {}) {
  for (const [p, id] of Object.entries(ids)) {
    if (p === "zoom") {
      await removeZoom(
        typeof id === "object" ? id.id : id,
        typeof id === "object" && id.mode === "oauth"
          ? await token(uid, "zoom")
          : null,
      );
      continue;
    }
    const access = await token(uid, p);
    const url =
      p === "google"
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(id)}?sendUpdates=all`
        : `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(id)}`;
    const r = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok && r.status !== 404 && r.status !== 410)
      throw Error("Could not remove a previous calendar event.");
  }
}
export async function createExternal(booking, id, progress = async () => {}) {
  const ids = { ...booking.externalIds },
    providers = await connections(booking.ownerId);
  let meetingUrl = booking.meetingUrl || booking.locationValue || "";
  if (booking.location === "zoom" && !booking.locationValue && !ids.zoom) {
    const personal = providers.includes("zoom");
    const zoom = await ensureZoom(
      booking,
      id,
      undefined,
      personal ? await token(booking.ownerId, "zoom") : null,
    );
    ids.zoom = personal ? { id: zoom.id, mode: "oauth" } : zoom.id;
    meetingUrl = zoom.url;
    await progress({ ids, meetingUrl });
  }
  if (
    booking.location === "google-meet" &&
    !booking.locationValue &&
    !providers.includes("google")
  )
    throw Error("Connect Google Calendar to use Google Meet.");
  if (booking.location === "teams" && !providers.includes("microsoft"))
    throw Error("Connect Outlook to use Microsoft Teams.");
  for (const p of providers.filter((p) => p !== "zoom")) {
    if (ids[p]) continue;
    const access = await token(booking.ownerId, p),
      headers = {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      };
    const stable = hash(`${id}-${booking.revision}`);
    if (p === "google") {
      const body = {
        id: stable,
        summary: booking.eventTitle,
        description: `Meeting with ${booking.attendeeName}.\n${booking.notes || ""}`,
        start: { dateTime: new Date(booking.startAt).toISOString() },
        end: { dateTime: new Date(booking.endAt).toISOString() },
        attendees: (booking.participants
          ? confirmedParticipants(booking)
          : [{ email: booking.attendeeEmail }]
        ).map((p) => ({ email: p.email })),
        location: meetingUrl,
      };
      if (booking.location === "google-meet" && !booking.locationValue)
        body.conferenceData = {
          createRequest: {
            requestId: stable,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      let data;
      try {
        data = await request(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1",
          { method: "POST", headers, body: JSON.stringify(body) },
        );
      } catch (e) {
        if (e.status !== 409) throw e;
        data = await request(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${stable}`,
          { headers },
        );
      }
      ids[p] = data.id;
      if (booking.location === "google-meet" && !booking.locationValue)
        meetingUrl = data.hangoutLink || meetingUrl;
      if (
        booking.location === "google-meet" &&
        !booking.locationValue &&
        !data.hangoutLink
      )
        throw Error(
          "Google Meet link is not ready. Calendar synchronization will retry.",
        );
    } else {
      const transactionId = `${stable.slice(0, 8)}-${stable.slice(8, 12)}-${stable.slice(12, 16)}-${stable.slice(16, 20)}-${stable.slice(20, 32)}`;
      const body = {
        subject: booking.eventTitle,
        transactionId,
        body: {
          contentType: "text",
          content: `Meeting with ${booking.attendeeName}.\n${booking.notes || ""}\n${meetingUrl}`,
        },
        start: {
          dateTime: new Date(booking.startAt).toISOString().replace("Z", ""),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(booking.endAt).toISOString().replace("Z", ""),
          timeZone: "UTC",
        },
        attendees: (booking.participants
          ? confirmedParticipants(booking)
          : [{ email: booking.attendeeEmail, name: booking.attendeeName }]
        ).map((p) => ({
          emailAddress: { address: p.email, name: p.name },
          type: "required",
        })),
        ...(booking.location === "teams"
          ? { isOnlineMeeting: true, onlineMeetingProvider: "teamsForBusiness" }
          : {}),
      };
      const data = await request("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      ids[p] = data.id;
      if (booking.location === "teams")
        meetingUrl = data.onlineMeeting?.joinUrl || meetingUrl;
      if (booking.location === "teams" && !data.onlineMeeting?.joinUrl)
        throw Error(
          "Microsoft Teams link is unavailable. Confirm that this account supports Teams meetings.",
        );
    }
    await progress({ ids: { ...ids }, meetingUrl });
  }
  return { ids, meetingUrl };
}

export async function updateExternalAttendees(booking) {
  const people = confirmedParticipants(booking);
  for (const [provider, id] of Object.entries(booking.externalIds || {})) {
    if (provider === "zoom") continue;
    const access = await token(booking.ownerId, provider);
    const url =
      provider === "google"
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(id)}?sendUpdates=all`
        : `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(id)}`;
    const attendees =
      provider === "google"
        ? people.map((p) => ({ email: p.email, responseStatus: "accepted" }))
        : people.map((p) => ({
            emailAddress: { address: p.email, name: p.name },
            type: "required",
          }));
    await request(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendees }),
    });
  }
}
