import { schedulerDatabase } from "./database.js";
let cached;
async function accessToken() {
  if (cached && cached.expiresAt > Date.now() + 60000) return cached.value;
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET)
    throw Error(
      "Configure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and the ZOOM_CLIENT_SECRET secret.",
    );
  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "account_credentials",
      account_id: ZOOM_ACCOUNT_ID,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw Error(
      `Zoom authorization failed (${response.status}). Check the activated Server-to-Server OAuth app.`,
    );
  const data = await response.json();
  if (!data.access_token) throw Error("Zoom did not return an access token.");
  cached = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  return cached.value;
}
export async function ensureZoom(
  booking,
  id,
  store = schedulerDatabase(),
  personalAccess = null,
) {
  const access = personalAccess || (await accessToken()),
    ref = store.collection("scheduler_zoom").doc(`${id}_${booking.revision}`);
  const existing = await store.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (s.data()?.meetingId) return s.data();
    if (s.exists && s.data().status !== "failed")
      throw Error(
        "Zoom creation needs administrator verification before retrying; no duplicate meeting will be created. Check scheduler_zoom and the Zoom account.",
      );
    tx.set(ref, {
      status: "creating",
      ownerId: booking.ownerId,
      bookingId: id,
      revision: booking.revision,
      requestedAt: Date.now(),
    });
    return null;
  });
  if (existing) return { id: existing.meetingId, url: existing.joinUrl };
  let response;
  try {
    response = await fetch(
      `https://api.zoom.us/v2/users/${encodeURIComponent(personalAccess ? "me" : booking.hostEmail)}/meetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: booking.eventTitle,
          type: 2,
          start_time: new Date(booking.startAt).toISOString(),
          duration: Math.ceil((booking.endAt - booking.startAt) / 60000),
          timezone: "UTC",
          agenda: `Meetly booking ${id}; revision ${booking.revision}`,
          settings: { waiting_room: true, join_before_host: false },
        }),
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok) {
      await ref.update({
        status:
          response.status >= 400 && response.status < 500
            ? "failed"
            : "uncertain",
        httpStatus: response.status,
      });
      throw Error(
        `Zoom meeting creation failed (${response.status}). Check the host's Zoom account and API permissions.`,
      );
    }
    const meeting = await response.json();
    if (!meeting.id || !meeting.join_url)
      throw Error(
        "Zoom returned an incomplete meeting response; administrator verification is required.",
      );
    await ref.update({
      status: "created",
      meetingId: String(meeting.id),
      joinUrl: meeting.join_url,
      completedAt: Date.now(),
    });
    return { id: String(meeting.id), url: meeting.join_url };
  } catch (e) {
    if (!response) await ref.update({ status: "uncertain" });
    throw e;
  }
}
export async function removeZoom(id, personalAccess = null) {
  const access = personalAccess || (await accessToken());
  const response = await fetch(
    `https://api.zoom.us/v2/meetings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}` },
      signal: AbortSignal.timeout(20000),
    },
  );
  if (!response.ok && response.status !== 404)
    throw Error(`Zoom meeting removal failed (${response.status}).`);
}
