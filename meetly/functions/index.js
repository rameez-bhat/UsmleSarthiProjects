import { slotsForMonth } from "./month-availability.js";
import {
  normalizeHostSlots,
  availableHostSlots,
  participatingHosts,
  hostSlotGroups,
  hostSlotReason,
} from "./host-slots.js";
import { dispatchMailDraft } from "./mail-bridge.js";
import {
  notificationSettings,
  emailAllowed,
  hostRecipients,
  mailSummary,
} from "./notifications.js";
import { selectedUsers } from "./selected-users.js";
import { searchHosts } from "./host-search.js";
import { registerParticipant, registrationReceipt } from "./registrations.js";
import { searchUsers } from "./user-search.js";
import { jitsiToken } from "./rooms.js";
import {
  responseStatus,
  confirmedParticipants,
  respondToInvitation,
  chooseRoundRobin,
  canEnterRoom,
} from "./invitations.js";
import { isDeepStrictEqual } from "node:util";
import {
  selectedUids,
  resolveParticipants,
  personalMeeting,
} from "./participants.js";
import crypto from "node:crypto";
import {
  assertAttendeeAccess,
  attendeeDetails,
  attendeeRoster,
} from "./attendee-details.js";
import { applyEventPolicy, assertBookingAudience } from "./event-policy.js";
import { schedulerOrigin } from "./oauth-config.js";
import { accessForUid, requireHost, requireAdmin } from "./access.js";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { DATABASE_ID, schedulerDatabase } from "./database.js";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { DateTime } from "luxon";
import {
  defaultSchedule,
  validateSchedule,
  slotsForDay,
  lockDates,
  overlap,
} from "./scheduling.js";
import {
  authorization,
  exchange,
  seal,
  unseal,
  hash,
  busyForHost,
  connections,
  createExternal,
  updateExternalAttendees,
  removeExternal,
} from "./calendars.js";
if (!getApps().length) initializeApp();
const db = schedulerDatabase();
const region = process.env.FUNCTIONS_REGION || "asia-south1";
const calendarConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID,
);
const secrets = [
  "OAUTH_TOKEN_KEY",
  ...(process.env.GOOGLE_CLIENT_ID ? ["GOOGLE_CLIENT_SECRET"] : []),
  ...(process.env.ZOOM_CLIENT_ID ? ["ZOOM_CLIENT_SECRET"] : []),
  ...(process.env.ZOOM_OAUTH_CLIENT_ID ? ["ZOOM_OAUTH_CLIENT_SECRET"] : []),
  ...(process.env.JITSI_JWT_APP_ID ? ["JITSI_JWT_SECRET"] : []),
  ...(process.env.MICROSOFT_CLIENT_ID ? ["MICROSOFT_CLIENT_SECRET"] : []),
];
const origin = () => schedulerOrigin();
const opts = {
  region,
  enforceAppCheck: process.env.ENFORCE_APP_CHECK === "true",
  maxInstances: 20,
};
const collection = (name) => db.collection(`scheduler_${name}`);
const bad = (message) => {
  throw new HttpsError("invalid-argument", message);
};
const text = (v, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function user(r) {
  if (!r.auth) throw new HttpsError("unauthenticated", "Please sign in.");
  return r.auth.uid;
}
function verified(r) {
  const uid = user(r);
  if (!r.auth.token.email_verified)
    throw new HttpsError(
      "failed-precondition",
      "Verify your email, then sign in again.",
    );
  return uid;
}
async function hostUser(r) {
  const uid = verified(r);
  await requireHost(uid);
  return uid;
}
const safeId = (v) => {
  if (typeof v !== "string" || !/^[a-zA-Z0-9_-]{1,120}$/.test(v))
    bad("Invalid identifier.");
  return v;
};
const wrap = (fn, withSecrets = false) =>
  onCall({ ...opts, ...(withSecrets ? { secrets } : {}) }, async (r) => {
    try {
      return await fn(r);
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      logger.error(e.message);
      throw new HttpsError(
        "internal",
        "The request could not be completed. Please try again or reconnect your calendar.",
      );
    }
  });
const calendarWrap = (fn) => wrap(fn, true);
const slotWrap = (fn) =>
  wrap(
    fn,
    calendarConfigured ||
      Boolean(process.env.ZOOM_CLIENT_ID) ||
      Boolean(process.env.ZOOM_OAUTH_CLIENT_ID),
  );
async function throttle(r, kind, limit = 60) {
  const minute = Math.floor(Date.now() / 60000),
    ip = r.rawRequest.ip || "unknown";
  const ref = collection("limits").doc(hash(`${ip}:${kind}:${minute}`));
  await db.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if ((s.data()?.count || 0) >= limit)
      throw new HttpsError(
        "resource-exhausted",
        "Too many requests. Please try again shortly.",
      );
    tx.set(ref, {
      count: (s.data()?.count || 0) + 1,
      expiresAt: new Date(Date.now() + 3600000),
    });
  });
}
function eventInput(v, uid) {
  const e = {
    ownerId: uid,
    title: text(v.title, 80),
    description: text(v.description, 2000),
    duration: Number(v.duration),
    minNotice: Number(v.minNotice ?? 120),
    horizonDays: Number(v.horizonDays ?? 60),
    bufferBefore: Number(v.bufferBefore ?? 0),
    bufferAfter: Number(v.bufferAfter ?? 10),
    dailyLimit: Number(v.dailyLimit ?? 8),
    capacity: Number(v.capacity ?? 100),
    cancelHours: Number(v.cancelHours ?? 0),
    location: v.location || "custom",
    locationValue: text(v.locationValue, 500),
    color: /^#[0-9a-f]{6}$/i.test(v.color) ? v.color : "#187b68",
    active: v.active !== false,
    notifications: notificationSettings(v.notifications),
    questions: Array.isArray(v.questions)
      ? v.questions
          .slice(0, 10)
          .map((q) => ({ label: text(q.label, 160), required: !!q.required }))
      : [],
  };
  const bounds = {
    duration: [15, 240],
    minNotice: [0, 10080],
    horizonDays: [1, 365],
    bufferBefore: [0, 120],
    bufferAfter: [0, 120],
    dailyLimit: [1, 50],
    capacity: [1, 1000],
    cancelHours: [0, 72],
  };
  if (
    !e.title ||
    ![
      "custom",
      "phone",
      "in-person",
      "google-meet",
      "teams",
      "meetly",
      "zoom",
    ].includes(e.location)
  )
    bad("Enter an event title and a supported location.");
  for (const [k, [a, b]] of Object.entries(bounds))
    if (!Number.isInteger(e[k]) || e[k] < a || e[k] > b) bad(`Invalid ${k}.`);
  if (e.questions.some((q) => !q.label))
    bad("Question labels cannot be empty.");
  if (
    e.location === "custom" &&
    e.locationValue &&
    !/^https:\/\//.test(e.locationValue)
  )
    bad("Use an https meeting link.");
  if (
    e.location === "google-meet" &&
    e.locationValue &&
    !/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/.test(
      e.locationValue,
    )
  )
    bad(
      "Enter a valid Google Meet link, such as https://meet.google.com/abc-defg-hij.",
    );
  if (
    e.location === "zoom" &&
    e.locationValue &&
    !/^https:\/\/([a-z0-9-]+\.)?zoom\.us\/j\/\d+(\?[^\s]*)?$/i.test(
      e.locationValue,
    )
  )
    bad("Enter a valid Zoom participant join link.");
  if (
    e.location === "zoom" &&
    !e.locationValue &&
    !process.env.ZOOM_OAUTH_CLIENT_ID &&
    (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID)
  )
    bad(
      "Configure your Zoom Server-to-Server OAuth app or paste an existing Zoom link.",
    );
  if (e.location === "meetly" && !process.env.JITSI_SERVER_URL)
    bad(
      "Configure JITSI_SERVER_URL in the Functions environment to enable Meetly video rooms.",
    );
  return e;
}
// No role claims supplied by the browser are accepted.
export const schedulerAccess = wrap(async (r) => accessForUid(user(r)));
export const schedulerWorkspace = wrap(async (r) => {
  const uid = await hostUser(r);
  const [host, events, bookings, links, organized] = await Promise.all([
    collection("hosts").doc(uid).get(),
    collection("events").where("ownerId", "==", uid).get(),
    collection("bookings").where("ownerId", "==", uid).get(),
    collection("connections").where("ownerId", "==", uid).get(),
    collection("bookings").where("organizerId", "==", uid).get(),
  ]);
  return {
    profile: host.exists ? host.data() : null,
    events: events.docs
      .filter((d) => !d.data().deletedAt)
      .map((d) => ({ id: d.id, ...d.data() })),
    bookings: [
      ...new Map(
        [...bookings.docs, ...organized.docs].map((d) => [d.id, d]),
      ).values(),
    ]
      .map((d) => {
        const { tokenHash, tokenCipher, roomKey, ...b } = d.data();
        return { id: d.id, ...b };
      })
      .sort((a, b) => a.startAt - b.startAt),
    connections: links.docs.map((d) => d.data().provider),
  };
});
export const schedulerAdminBookings = wrap(async (r) => {
  await requireAdmin(verified(r));
  let q = collection("bookings").orderBy("__name__").limit(100);
  if (r.data?.after) q = q.startAfter(safeId(r.data.after));
  const snapshot = await q.get();
  return {
    bookings: snapshot.docs.map((d) => {
      const { tokenHash, tokenCipher, roomKey, ...b } = d.data();
      return { id: d.id, ...b };
    }),
    next: snapshot.size === 100 ? snapshot.docs.at(-1).id : null,
  };
});
export const schedulerAttendeeDetails = wrap(async (request) => {
  const uid = verified(request),
    access = await requireHost(uid);
  const snapshot = await collection("bookings")
    .doc(safeId(request.data?.id))
    .get();
  if (!snapshot.exists) throw new HttpsError("not-found", "Booking not found.");
  const booking = snapshot.data();
  assertAttendeeAccess(uid, access, booking);
  if (booking.participants?.length) {
    if (!request.data.participantUid)
      return attendeeRoster(snapshot.id, booking);
    const participant = booking.participants.find(
      (p) => p.uid === request.data.participantUid,
    );
    if (!participant)
      throw new HttpsError(
        "permission-denied",
        "This user is not an attendee.",
      );
    let registration = {};
    if (participant.registrationId) {
      const saved = await collection("registrations")
        .doc(safeId(participant.registrationId))
        .get();
      if (saved.exists && saved.data().bookingId === snapshot.id)
        registration = saved.data();
    }
    return attendeeDetails(
      {
        ...booking,
        notes: registration.notes || "",
        answers: registration.answers || [],
        questionLabels: registration.questionLabels || [],
        attendeeUid: participant.uid,
        attendeeName: participant.name,
        attendeeEmail: participant.email,
        attendeeIdentityVerified:
          participant.identityVerified === true || !participant.registrationId,
      },
      getFirestore(),
    );
  }
  return attendeeDetails(booking, getFirestore());
});
export const schedulerSaveProfile = wrap(async (r) => {
  const uid = await hostUser(r),
    v = r.data || {},
    slug = text(v.slug, 60).toLowerCase();
  if (
    !/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug) ||
    !text(v.name, 80) ||
    !DateTime.now().setZone(v.timezone).isValid
  )
    bad(
      "Enter a name, a valid time zone and a link slug of 3–60 letters/numbers/hyphens.",
    );
  const profile = collection("hosts").doc(uid),
    slugRef = collection("slugs").doc(slug);
  await db.runTransaction(async (tx) => {
    const [old, claim] = await Promise.all([tx.get(profile), tx.get(slugRef)]);
    if (claim.exists && claim.data().ownerId !== uid)
      throw new HttpsError(
        "already-exists",
        "That booking link is already taken.",
      );
    const data = {
      name: text(v.name, 80),
      bio: text(v.bio, 500),
      slug,
      timezone: v.timezone,
      email: r.auth.token.email,
      updatedAt: Date.now(),
    };
    if (!old.exists) {
      data.schedule = defaultSchedule();
      data.overrides = {};
      data.createdAt = Date.now();
      tx.create(
        collection("events").doc(`${uid}_intro`),
        eventInput({ title: "Introductory call", duration: 30 }, uid),
      );
    }
    if (old.exists && old.data().slug !== slug)
      tx.delete(collection("slugs").doc(old.data().slug));
    tx.set(slugRef, { ownerId: uid });
    tx.set(profile, data, { merge: true });
  });
  return { ok: true };
});
export const schedulerSaveAvailability = wrap(async (r) => {
  const uid = await hostUser(r);
  const { schedule, overrides = {} } = r.data;
  try {
    validateSchedule(schedule, overrides);
  } catch (e) {
    bad(e.message);
  }
  const ref = collection("hosts").doc(uid);
  if (!(await ref.get()).exists) bad("Complete your profile first.");
  await ref.update({ schedule, overrides, updatedAt: Date.now() });
  return { ok: true };
});
// Directory reads stay on the server; the browser receives only basic identity fields.
export const schedulerSelectedUsers = wrap(async (r) => {
  await hostUser(r);
  return selectedUsers(getFirestore(), r.data?.uids);
});
export const schedulerSearchUsers = wrap(async (r) => {
  await hostUser(r);
  return searchUsers(getFirestore(), r.data?.search);
});
export const schedulerMyMeetings = wrap(async (r) => {
  const uid = verified(r);
  const users = await getFirestore()
    .collection("Users")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (users.size !== 1)
    throw new HttpsError(
      "permission-denied",
      "A registered Users account is required.",
    );
  const pages = await Promise.all([
    collection("bookings")
      .where("participantUids", "array-contains", uid)
      .get(),
    collection("bookings").where("attendeeUid", "==", uid).get(),
  ]);
  const meetings = new Map();
  for (const page of pages)
    for (const doc of page.docs) {
      const b = doc.data();
      meetings.set(doc.id, personalMeeting(doc.id, b, uid));
    }
  return {
    meetings: [...meetings.values()].sort((a, b) => a.startAt - b.startAt),
  };
});
function queueRosterSync(tx, ref, booking, participants) {
  const revision = booking.revision + 1,
    reuse = booking.syncStatus === "synced";
  tx.update(ref, {
    participants,
    revision,
    syncStatus: "pending",
    externalIds: reuse ? booking.externalIds || {} : {},
    meetingUrl:
      reuse || booking.location === "meetly"
        ? booking.meetingUrl
        : booking.locationValue || "",
    updatedAt: Date.now(),
  });
  tx.create(collection("jobs").doc(`${ref.id}_${revision}`), {
    bookingId: ref.id,
    revision,
    action: reuse ? "response" : "sync",
    oldIds: reuse ? {} : booking.externalIds || {},
    status: "pending",
  });
}
export const schedulerJoinMeeting = calendarWrap(async (r) => {
  await throttle(r, "join", 12);
  const input = r.data || {},
    eventId = safeId(input.eventId),
    id = safeId(input.requestId),
    registrationRef = collection("registrations").doc(id),
    bookingRef = collection("bookings").doc(`${eventId}_assigned`);
  const eventSnapshot = await collection("events").doc(eventId).get();
  if (!eventSnapshot.exists) bad("Meeting not found.");
  const event = eventSnapshot.data(),
    account = await assertBookingAudience(
      event.location === "meetly"
        ? { ...event, audience: "registered" }
        : event,
      r,
    );
  const name = text(input.name, 100),
    email = (account.email || text(input.email, 254)).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    bad("Enter your name and a valid email address.");
  if (
    event.location === "meetly" &&
    (!r.auth?.token.email_verified || !account.uid)
  )
    throw new HttpsError(
      "unauthenticated",
      "Sign in with a verified registered account for this meeting room.",
    );
  const verifiedUid =
    r.auth?.token.email_verified && r.auth.token.email?.toLowerCase() === email
      ? r.auth.uid
      : null;
  const participantUid = verifiedUid || `guest_${hash(id)}`,
    token = crypto.randomBytes(32).toString("base64url");
  const answers = Array.isArray(input.answers)
    ? input.answers.slice(0, 10).map((a) => text(a, 1500))
    : [];
  if ((event.questions || []).some((q, i) => q.required && !answers[i]))
    bad("Please answer the required questions.");
  await requireHost(event.ownerId);
  const result = await db.runTransaction(async (tx) => {
    const [currentEvent, booking, old] = await Promise.all([
      tx.get(eventSnapshot.ref),
      tx.get(bookingRef),
      tx.get(registrationRef),
    ]);
    if (!booking.exists) bad("This meeting is unavailable.");
    if (old.exists) {
      const saved = old.data();
      if (
        saved.bookingId !== bookingRef.id ||
        saved.email !== email ||
        saved.name !== name
      )
        throw new HttpsError(
          "already-exists",
          "This request identifier is already in use.",
        );
      return { registration: saved, booking: booking.data() };
    }
    if (
      !currentEvent.exists ||
      !currentEvent.data().active ||
      !isDeepStrictEqual(currentEvent.data(), event)
    )
      throw new HttpsError(
        "aborted",
        "Meeting settings changed. Reload and try again.",
      );
    if (booking.data().startAt <= Date.now() + event.minNotice * 60000)
      throw new HttpsError(
        "failed-precondition",
        "Registration has closed for this meeting.",
      );
    const b = booking.data(),
      participants = registerParticipant(
        b,
        {
          uid: participantUid,
          name,
          email,
          registrationId: id,
          identityVerified: !!verifiedUid,
        },
        Date.now(),
        event.capacity || 100,
      );
    const registration = {
      bookingId: bookingRef.id,
      participantUid,
      name,
      email,
      answers,
      questionLabels: (event.questions || []).map((q) => q.label),
      notes: text(input.notes, 2000),
      tokenHash: hash(token),
      tokenCipher: seal({ token }),
      createdAt: Date.now(),
    };
    queueRosterSync(tx, bookingRef, b, participants);
    if (verifiedUid)
      tx.update(bookingRef, {
        participantUids: FieldValue.arrayUnion(verifiedUid),
      });
    tx.create(registrationRef, registration);
    tx.create(collection("audit").doc(), {
      bookingId: bookingRef.id,
      action: "public-registration",
      actorUid: verifiedUid,
      registrationId: id,
      at: Date.now(),
    });
    if (emailAllowed(notificationSettings(event.notifications), "confirmation"))
      tx.create(collection("mail").doc(`${id}_registration`), {
        bookingId: bookingRef.id,
        notificationKind: "registration",
        recipientRole: "attendee",
        createdAt: Date.now(),
        to: [email],
        message: {
          subject: `Registration confirmed: ${b.eventTitle}`,
          text: `You are registered for ${b.eventTitle}.\nView joining details or cancel: ${origin()}/registration/${id}?token=${encodeURIComponent(token)}`,
        },
      });
    return { registration, booking: { ...b, participants } };
  });
  const savedToken = unseal(result.registration.tokenCipher).token;
  return {
    ...registrationReceipt(id, result.registration, result.booking),
    token: savedToken,
    url: `${origin()}/registration/${id}?token=${encodeURIComponent(savedToken)}`,
  };
});
export const schedulerRegistration = wrap(async (r) => {
  await throttle(r, "registration", 60);
  const ref = collection("registrations").doc(safeId(r.data?.id)),
    token = text(r.data?.token, 200);
  return db.runTransaction(async (tx) => {
    const registration = await tx.get(ref);
    if (
      !registration.exists ||
      !token ||
      hash(token) !== registration.data().tokenHash
    )
      throw new HttpsError(
        "permission-denied",
        "This private registration link is invalid.",
      );
    const data = registration.data(),
      bookingRef = collection("bookings").doc(data.bookingId),
      snapshot = await tx.get(bookingRef);
    if (!snapshot.exists) bad("Meeting not found.");
    let booking = snapshot.data();
    if (
      r.data.cancel &&
      registrationReceipt(ref.id, data, booking).status !== "cancelled"
    ) {
      if (Date.now() >= booking.startAt - booking.cancelHours * 3600000)
        throw new HttpsError(
          "failed-precondition",
          "The cancellation window has closed. Contact the host.",
        );
      const participants = booking.participants.map((p) =>
        p.uid === data.participantUid
          ? { ...p, response: "declined", respondedAt: Date.now() }
          : p,
      );
      queueRosterSync(tx, bookingRef, booking, participants);
      tx.update(ref, { cancelledAt: Date.now() });
      tx.create(collection("audit").doc(), {
        bookingId: bookingRef.id,
        registrationId: ref.id,
        action: "registration-cancelled",
        actorUid: data.participantUid,
        at: Date.now(),
      });
      booking = { ...booking, participants };
    }
    return registrationReceipt(ref.id, data, booking);
  });
});
export const schedulerSearchHosts = wrap(async (r) => {
  await hostUser(r);
  return searchHosts(getFirestore(), db, r.data?.search);
});
export const schedulerRespondInvitation = wrap(async (r) => {
  const uid = verified(r),
    ref = collection("bookings").doc(safeId(r.data?.id));
  const users = await getFirestore()
    .collection("Users")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (users.size !== 1)
    throw new HttpsError(
      "permission-denied",
      "A registered Users account is required.",
    );
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists)
      throw new HttpsError("not-found", "Invitation not found.");
    const booking = snapshot.data(),
      participants = respondToInvitation(booking, uid, r.data.response);
    if (!participants) return;
    const revision = booking.revision + 1,
      reuse = booking.syncStatus === "synced";
    tx.update(ref, {
      externalIds: reuse ? booking.externalIds || {} : {},
      meetingUrl:
        reuse || booking.location === "meetly"
          ? booking.meetingUrl
          : booking.locationValue || "",
      participants,
      revision,
      syncStatus: "pending",
      updatedAt: Date.now(),
    });
    tx.create(collection("jobs").doc(`${ref.id}_${revision}`), {
      bookingId: ref.id,
      revision,
      action: reuse ? "response" : "sync",
      oldIds: reuse ? {} : booking.externalIds || {},
      notifyUid: uid,
      status: "pending",
    });
    tx.create(collection("audit").doc(), {
      bookingId: ref.id,
      actorUid: uid,
      action: r.data.response,
      at: Date.now(),
      originalStartAt: booking.startAt,
    });
  });
  return { ok: true };
});
export const schedulerRoom = wrap(async (r) => {
  const uid = verified(r),
    snap = await collection("bookings").doc(safeId(r.data?.id)).get();
  if (!snap.exists || !canEnterRoom(snap.data(), uid))
    throw new HttpsError(
      "permission-denied",
      "Accept your invitation and sign in to join this meeting.",
    );
  const b = snap.data();
  if (b.location !== "meetly" || !b.roomKey)
    bad("This meeting does not use a Meetly room.");
  let base;
  try {
    base = new URL(process.env.JITSI_SERVER_URL);
  } catch {
    bad("Configure JITSI_SERVER_URL for your video service.");
  }
  if (base.protocol !== "https:" || base.username || base.password)
    bad("Use an HTTPS Jitsi server URL.");
  return {
    title: b.eventTitle,
    url: `${base.origin}/${b.roomKey}${process.env.JITSI_JWT_APP_ID ? `?jwt=${encodeURIComponent(jitsiToken(b, r.auth, base.hostname))}` : ""}`,
    hostName: b.hostName,
  };
}, Boolean(process.env.JITSI_JWT_APP_ID));
export const schedulerSaveEvent = slotWrap(async (r) => {
  const uid = await hostUser(r),
    id = r.data.id ? safeId(r.data.id) : crypto.randomUUID(),
    ref = collection("events").doc(id);
  const participantUids = selectedUids(r.data.participantUids),
    resolved = await resolveParticipants(participantUids, getFirestore());
  const hostSnapshot = await collection("hosts").doc(uid).get();
  if (!hostSnapshot.exists) bad("Complete your profile first.");
  const organizer = hostSnapshot.data(),
    data = eventInput(r.data, uid);
  Object.assign(data, applyEventPolicy(r.data, data, organizer), {
    participantUids,
    assignmentMode: r.data.assignmentMode || "named",
    teamHostUids: selectedUids(r.data.teamHostUids),
  });

  if (
    data.schedulingMode === "host-slots" ||
    data.assignmentMode === "round-robin"
  ) {
    data.teamHostUids = participatingHosts(uid, data.teamHostUids);
  }
  if (data.schedulingMode === "host-slots") {
    if (
      resolved.length ||
      !data.teamHostUids.length ||
      data.teamHostUids.length > 20
    ) {
      bad(
        "Host-specific booking requires 1–20 hosts and no preassigned invitees.",
      );
    }
    data.assignmentMode = "host-choice";
    const profiles = new Map(
      await Promise.all(
        data.teamHostUids.map(async (hostId) => {
          await requireHost(hostId);
          const profile = await collection("hosts").doc(hostId).get();
          if (!profile.exists)
            bad("Every host must complete their profile first.");
          return [hostId, profile.data()];
        }),
      ),
    );
    data.hostSlots = normalizeHostSlots(
      r.data.hostSlots,
      data.teamHostUids,
      profiles,
      data,
    );
  }
  if (!["named", "round-robin", "host-choice"].includes(data.assignmentMode))
    bad("Choose a supported host assignment.");
  if (
    data.assignmentMode === "host-choice" &&
    data.schedulingMode !== "host-slots"
  )
    bad("Host choice requires host-specific times.");
  if (resolved.length && (data.schedulingMode !== "fixed" || !data.active))
    bad("Invite users to an active meeting with a specific date and time.");
  if (
    data.assignmentMode === "round-robin" &&
    (!resolved.length ||
      data.schedulingMode !== "fixed" ||
      !data.teamHostUids.length ||
      data.teamHostUids.length > 20)
  )
    bad(
      "Round robin requires a dated invitation meeting and between 1 and 20 team hosts.",
    );
  if (
    data.location === "meetly" &&
    !resolved.length &&
    data.audience !== "registered"
  )
    bad("Meetly rooms require registered attendees.");
  const bookingRef = collection("bookings").doc(`${id}_assigned`),
    previous = await bookingRef.get();
  if (previous.exists) {
    const existing = await ref.get();
    if (existing.data()?.ownerId !== uid)
      throw new HttpsError(
        "permission-denied",
        "This event belongs to another host.",
      );
    const comparable = {
      assignmentMode: "named",
      teamHostUids: [],
      ...existing.data(),
    };
    if (isDeepStrictEqual(comparable, data)) return { id };
    throw new HttpsError(
      "failed-precondition",
      "Cancel the saved meeting and create a new meeting to change its settings or invitees.",
    );
  }
  const start = data.fixedStartAt,
    end = start + data.duration * 60000,
    lockStart = start - data.bufferBefore * 60000,
    lockEnd = end + data.bufferAfter * 60000;
  const candidates = resolved.length
    ? await Promise.all(
        (data.assignmentMode === "round-robin" ? data.teamHostUids : [uid]).map(
          async (hostUid) => {
            await requireHost(hostUid);
            const snapshot = await collection("hosts").doc(hostUid).get();
            if (!snapshot.exists)
              bad("A selected host has not completed their profile.");
            const host = snapshot.data(),
              providers = await connections(hostUid);
            if (providers.some((p) => p !== "zoom") && !calendarConfigured)
              bad("Configure calendar OAuth before scheduling team meetings.");
            const providerReady =
              (data.location !== "google-meet" ||
                data.locationValue ||
                providers.includes("google")) &&
              (data.location !== "teams" || providers.includes("microsoft")) &&
              (data.location !== "zoom" ||
                data.locationValue ||
                providers.includes("zoom") ||
                (process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID));
            const busy = providerReady
              ? await busyForHost(hostUid, lockStart, lockEnd)
              : [];
            const date = DateTime.fromMillis(start, {
              zone: host.timezone,
            }).toISODate();
            const hoursReady =
              data.assignmentMode !== "round-robin" ||
              slotsForDay({
                date,
                host,
                event: {
                  ...data,
                  schedulingMode: "recurring",
                  horizonDays: 365,
                },
                busy: [],
              }).some((s) => s.start === start);
            return {
              uid: hostUid,
              host,
              available:
                !!providerReady &&
                hoursReady &&
                !busy.some((b) =>
                  overlap({ start: lockStart, end: lockEnd }, b),
                ),
              date,
            };
          },
        ),
      )
    : [];
  const rotationRef = collection("rotations").doc(
    hash([...data.teamHostUids].sort().join("|")),
  );
  await db.runTransaction(async (tx) => {
    const [old, currentHost, assigned, rotation] = await Promise.all([
      tx.get(ref),
      tx.get(collection("hosts").doc(uid)),
      tx.get(bookingRef),
      tx.get(rotationRef),
    ]);
    if (old.data()?.deletedAt)
      throw new HttpsError("failed-precondition", "This event was deleted.");
    if (old.exists && old.data().ownerId !== uid)
      throw new HttpsError(
        "permission-denied",
        "This event belongs to another host.",
      );
    if (assigned.exists) {
      if (isDeepStrictEqual(old.data(), data)) return;
      throw new HttpsError(
        "already-exists",
        "The meeting was already created.",
      );
    }
    if (
      !currentHost.exists ||
      !isDeepStrictEqual(currentHost.data(), organizer)
    )
      throw new HttpsError("aborted", "Host settings changed. Try again.");
    let chosen;
    const locks = [];
    if (resolved.length) {
      const checked = await Promise.all(
        candidates.map(async (c) => {
          const refs = lockDates(lockStart, lockEnd).map((date) =>
            collection("locks").doc(`${c.uid}_${date}`),
          );
          locks.push(...refs);
          const [hostNow, bookings] = await Promise.all([
            tx.get(collection("hosts").doc(c.uid)),
            tx.get(collection("bookings").where("ownerId", "==", c.uid)),
            ...refs.map((l) => tx.get(l)),
          ]);
          const confirmed = bookings.docs
            .map((d) => d.data())
            .filter((b) => b.status === "confirmed");
          return {
            ...c,
            available:
              c.available &&
              hostNow.exists &&
              isDeepStrictEqual(hostNow.data(), c.host) &&
              !confirmed.some((b) =>
                overlap(
                  { start: lockStart, end: lockEnd },
                  { start: b.lockStart, end: b.lockEnd },
                ),
              ) &&
              confirmed.filter(
                (b) =>
                  DateTime.fromMillis(b.startAt, {
                    zone: c.host.timezone,
                  }).toISODate() === c.date,
              ).length < data.dailyLimit,
          };
        }),
      );
      chosen = chooseRoundRobin(
        checked.filter((c) => c.available),
        rotation.data()?.counts,
      );
      if (!chosen)
        throw new HttpsError(
          "already-exists",
          "No selected host is available at this time. Check calendars, weekly hours and daily booking limits.",
        );
      for (const l of locks)
        tx.set(
          l,
          { version: FieldValue.increment(1), updatedAt: Date.now() },
          { merge: true },
        );
      if (data.assignmentMode === "round-robin")
        tx.set(rotationRef, {
          counts: {
            ...rotation.data()?.counts,
            [chosen.uid]: (rotation.data()?.counts?.[chosen.uid] || 0) + 1,
          },
          updatedAt: Date.now(),
        });
      const roomKey =
        data.location === "meetly"
          ? `meetly-${crypto.randomBytes(24).toString("hex")}`
          : null;
      const meetingUrl =
        data.location === "meetly"
          ? `${origin()}/room/${bookingRef.id}`
          : data.locationValue;
      tx.create(bookingRef, {
        ownerId: chosen.uid,
        organizerId: uid,
        organizerEmail: organizer.email,
        organizerName: organizer.name,
        notifications: data.notifications,
        eventId: id,
        eventTitle: data.title,
        hostName: chosen.host.name,
        hostEmail: chosen.host.email,
        timezone: organizer.timezone,
        attendeeTimezone: organizer.timezone,
        attendeeName: resolved.map((p) => p.name).join(", "),
        attendeeEmail: resolved[0].email,
        participants: resolved.map((p) => ({
          ...p,
          response: "invited",
          invitedAt: Date.now(),
        })),
        participantUids,
        startAt: start,
        endAt: end,
        lockStart,
        lockEnd,
        status: "confirmed",
        location: data.location,
        locationValue: data.locationValue,
        meetingUrl,
        roomKey,
        cancelHours: data.cancelHours,
        revision: 1,
        syncStatus: "pending",
        externalIds: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      if (emailAllowed(data.notifications, "invitation"))
        for (const p of resolved)
          tx.create(
            collection("mail").doc(`${bookingRef.id}_invitation_${p.uid}`),
            {
              to: [p.email],
              bookingId: bookingRef.id,
              notificationKind: "invitation",
              recipientRole: "attendee",
              createdAt: Date.now(),
              message: {
                subject: `Invitation: ${data.title}`,
                text: `You are invited to ${data.title} with ${chosen.host.name}.\n${DateTime.fromMillis(start, { zone: organizer.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}\nAccept or decline: ${origin()}/book/${organizer.slug}/${id}\nJoining details are shared after you accept.`,
              },
            },
          );
      if (emailAllowed(data.notifications, "invitation", true))
        for (const staff of hostRecipients({
          hostEmail: chosen.host.email,
          hostName: chosen.host.name,
          organizerEmail: organizer.email,
          organizerName: organizer.name,
        }))
          tx.create(
            collection("mail").doc(`${bookingRef.id}_assignment_${staff.uid}`),
            {
              to: [staff.email],
              bookingId: bookingRef.id,
              notificationKind: "assignment",
              recipientRole: staff.uid,
              createdAt: Date.now(),
              message: {
                subject: `${staff.uid === "host" ? "Meeting assigned to you" : "Meeting scheduled"}: ${data.title}`,
                text: `${data.title}\nAssigned host: ${chosen.host.name}\n${DateTime.fromMillis(start, { zone: organizer.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}\nInvited users: ${resolved.map((p) => p.name).join(", ")}\nView invitations and bookings: ${origin()}/bookings`,
              },
            },
          );
      tx.create(collection("jobs").doc(`${bookingRef.id}_1`), {
        bookingId: bookingRef.id,
        revision: 1,
        action: "sync",
        oldIds: {},
        status: "pending",
      });
    }
    tx.set(ref, data);
  });
  return { id };
});
export const schedulerDeleteEvent = wrap(async (r) => {
  const uid = await hostUser(r);
  const ref = collection("events").doc(safeId(r.data.id));
  await db.runTransaction(async (tx) => {
    const [event, bookings] = await Promise.all([
      tx.get(ref),
      tx.get(collection("bookings").where("eventId", "==", ref.id)),
    ]);
    if (!event.exists) throw new HttpsError("not-found", "Event not found.");
    if (event.data().ownerId !== uid)
      throw new HttpsError(
        "permission-denied",
        "Only the event organizer can delete this event.",
      );
    if (
      bookings.docs.some(
        (doc) =>
          doc.data().startAt > Date.now() &&
          (doc.data().status === "confirmed" ||
            ["pending", "error"].includes(doc.data().syncStatus)),
      )
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Cancel upcoming bookings and wait for calendar cancellation to finish before deleting this event.",
      );
    }
    tx.update(ref, { active: false, deletedAt: Date.now(), deletedBy: uid });
    tx.create(collection("audit").doc(), {
      action: "event-deleted",
      eventId: ref.id,
      actor: uid,
      at: Date.now(),
    });
  });
  return { ok: true };
});
function publicEvent(doc) {
  const {
    participantUids = [],
    teamHostUids,
    locationValue,
    ...event
  } = doc.data();
  return {
    id: doc.id,
    ...event,
    locationValue: "",
    assignedCount: participantUids.length,
  };
}
export const schedulerPublicPage = wrap(async (r) => {
  await throttle(r, "page");
  const s = await collection("slugs").doc(safeId(r.data.slug)).get();
  if (!s.exists) throw new HttpsError("not-found", "Booking page not found.");
  const host = await collection("hosts").doc(s.data().ownerId).get();
  if (!host.exists) throw new HttpsError("not-found", "Host not found.");
  await requireHost(host.id);
  const h = host.data(),
    events = await collection("events")
      .where("ownerId", "==", host.id)
      .where("active", "==", true)
      .get();
  return {
    host: {
      id: host.id,
      name: h.name,
      bio: h.bio,
      slug: h.slug,
      timezone: h.timezone,
    },
    events: events.docs.map(publicEvent),
  };
});
export const schedulerPublicEvent = wrap(async (r) => {
  await throttle(r, "page");
  const s = await collection("events").doc(safeId(r.data.eventId)).get();
  if (!s.exists || !s.data().active)
    throw new HttpsError("not-found", "Event unavailable.");
  const h = await collection("hosts").doc(s.data().ownerId).get();
  if (!h.exists) throw new HttpsError("not-found", "Host unavailable.");
  await requireHost(h.id);
  const p = h.data();
  return {
    host: {
      id: h.id,
      name: p.name,
      bio: p.bio,
      slug: p.slug,
      timezone: p.timezone,
    },
    events: [publicEvent(s)],
  };
});
async function context(
  eventId,
  date,
  ignoreId = null,
  selectedHostId = null,
  wholeMonth = false,
) {
  const ev = await collection("events").doc(safeId(eventId)).get();
  if (!ev.exists || !ev.data().active)
    throw new HttpsError("not-found", "This event is unavailable.");
  const event = ev.data();
  const hostId =
    event.schedulingMode === "host-slots" ? selectedHostId : event.ownerId;
  if (
    !hostId ||
    (event.schedulingMode === "host-slots" &&
      !participatingHosts(event.ownerId, event.teamHostUids || []).includes(
        hostId,
      ))
  )
    bad("Choose a participating host.");
  const hs = await collection("hosts").doc(hostId).get();
  if (!hs.exists) bad("Host is unavailable.");
  await requireHost(hostId);
  const host = hs.data();
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !DateTime.fromISO(date, { zone: host.timezone }).isValid
  )
    bad("Invalid date.");
  const day = DateTime.fromISO(date, { zone: host.timezone }),
    start = day.startOf("day").toMillis(),
    end = day.endOf(wholeMonth ? "month" : "day").toMillis();
  const query = collection("bookings")
    .where("ownerId", "==", hostId)
    .where("startAt", ">=", start - 86400000)
    .where("startAt", "<=", end + 86400000);
  const providerConnections = (await connections(hostId)).filter(
    (p) => p !== "zoom",
  );
  for (const provider of providerConnections) {
    if (
      !process.env[
        provider === "zoom"
          ? "ZOOM_OAUTH_CLIENT_ID"
          : provider === "google"
            ? "GOOGLE_CLIENT_ID"
            : "MICROSOFT_CLIENT_ID"
      ] ||
      !process.env.OAUTH_TOKEN_KEY
    )
      throw new HttpsError(
        "failed-precondition",
        "This host has a connected calendar. Configure its OAuth client ID and backend secrets, then redeploy schedulerSlots before offering times.",
      );
  }
  if (
    (event.location === "google-meet" &&
      !event.locationValue &&
      !providerConnections.includes("google")) ||
    (event.location === "teams" && !providerConnections.includes("microsoft"))
  ) {
    throw new HttpsError(
      "failed-precondition",
      "This host must connect the meeting's calendar provider before offering times.",
    );
  }
  const [booked, busy] = await Promise.all([
    query.get(),
    busyForHost(hostId, start - 86400000, end + 86400000),
  ]);
  const existing = booked.docs
    .filter((d) => d.id !== ignoreId && d.data().status === "confirmed")
    .map((d) => d.data());
  const today = existing.filter(
    (b) =>
      DateTime.fromMillis(b.startAt, { zone: host.timezone }).toISODate() ===
      date,
  );
  const blocked = [
    ...busy,
    ...existing.map((b) => ({ start: b.lockStart, end: b.lockEnd })),
  ];
  return {
    host,
    hostId,
    event,
    eventId: ev.id,
    query,
    date,
    busy,
    existing,
    todayCount: today.length,
    start,
    end,
    slots:
      today.length >= event.dailyLimit
        ? []
        : event.schedulingMode === "host-slots"
          ? availableHostSlots({ date, host, hostId, event, busy: blocked })
          : slotsForDay({ date, host, event, busy: blocked }),
  };
}
export const schedulerSlots = slotWrap(async (r) => {
  await throttle(r, "slots", 120);
  const event = await collection("events").doc(safeId(r.data.eventId)).get();
  if (!event.exists || !event.data().active) bad("Event is unavailable.");
  if (event.data().schedulingMode === "host-slots") {
    const data = event.data();
    const hostIds = participatingHosts(data.ownerId, data.teamHostUids || []);
    const snapshots = await db.getAll(
      ...hostIds.map((uid) => collection("hosts").doc(uid)),
    );
    const profiles = new Map(
      snapshots.filter((s) => s.exists).map((s) => [s.id, s.data()]),
    );
    const diagnosticsAllowed =
      r.data.diagnostics === true && r.auth?.uid === data.ownerId;
    if (diagnosticsAllowed) await hostUser(r);
    const results = await Promise.all(
      hostSlotGroups(data, profiles).map(async (group) => {
        const rows = (data.hostSlots || []).filter(
          (s) =>
            s.hostUid === group.hostUid &&
            DateTime.fromMillis(s.startAt, {
              zone: profiles.get(s.hostUid).timezone,
            }).toISODate() === group.date,
        );
        try {
          const c = await context(event.id, group.date, null, group.hostUid);
          return {
            slots: c.slots,
            diagnostics: rows.map((s) => ({
              hostUid: group.hostUid,
              hostName: c.host.name,
              startAt: s.startAt,
              reason: hostSlotReason(s, data, c),
            })),
          };
        } catch (error) {
          logger.warn("Team host availability check failed", {
            eventId: event.id,
            hostUid: group.hostUid,
            code: error.code || error.status || "unknown",
          });
          const reason =
            error.code === "failed-precondition"
              ? "calendar_configuration"
              : error.code === "permission-denied"
                ? "host_access"
                : "availability_check_failed";
          return {
            slots: [],
            diagnostics: rows.map((s) => ({
              hostUid: group.hostUid,
              hostName: profiles.get(group.hostUid).name || "Host",
              startAt: s.startAt,
              reason,
            })),
          };
        }
      }),
    );
    const slots = results
      .flatMap((result) => result.slots)
      .sort((a, b) => a.start - b.start);
    const hosts = hostIds.map((uid) => ({
      uid,
      name: profiles.get(uid)?.name || "Host unavailable",
      organizer: uid === data.ownerId,
      publishedCount: (data.hostSlots || []).filter((s) => s.hostUid === uid)
        .length,
      availableCount: slots.filter((s) => s.hostUid === uid).length,
    }));
    return {
      timezone: "UTC",
      slots,
      hosts,
      ...(diagnosticsAllowed
        ? { diagnostics: results.flatMap((result) => result.diagnostics) }
        : {}),
    };
  }
  if (r.data.month !== undefined) {
    if (!/^\d{4}-\d{2}$/.test(r.data.month))
      bad("Choose a valid calendar month.");
    const requested = DateTime.fromISO(`${r.data.month}-01`, { zone: "UTC" });
    if (!requested.isValid) bad("Choose a valid calendar month.");
    if (
      requested.endOf("month").toMillis() < Date.now() - 86400000 ||
      (event.data().schedulingMode !== "fixed" &&
        requested.toMillis() >
          Date.now() + (event.data().horizonDays + 2) * 86400000)
    )
      return { timezone: "UTC", slots: [] };
    const c = await context(event.id, `${r.data.month}-01`, null, null, true);
    const slots = slotsForMonth({
      month: r.data.month,
      host: c.host,
      event: c.event,
      existing: c.existing,
      busy: c.busy,
    }).map((slot) => ({ ...slot, hostUid: c.hostId, hostName: c.host.name }));
    return {
      timezone: c.host.timezone,
      slots,
      hosts: [{ uid: c.hostId, name: c.host.name, organizer: true }],
    };
  }
  const c = await context(r.data.eventId, r.data.date);
  return { timezone: c.host.timezone, slots: c.slots };
});
async function manageAllowed(r, b) {
  if (r.auth?.uid === b.ownerId || r.auth?.uid === b.organizerId) {
    await requireHost(r.auth.uid);
    return;
  }
  const token = text(r.data.token, 200);
  if (!token || hash(token) !== b.tokenHash)
    throw new HttpsError("permission-denied", "This booking link is invalid.");
}
export const schedulerGetBooking = wrap(async (r) => {
  await throttle(r, "manage");
  const id = safeId(r.data.id),
    s = await collection("bookings").doc(id).get();
  if (!s.exists) throw new HttpsError("not-found", "Booking not found.");
  const b = s.data();
  await manageAllowed(r, b);
  const { tokenHash, tokenCipher, roomKey, ...publicData } = b;
  return { id, ...publicData };
});
async function book(r, reschedule = false) {
  await throttle(r, "book", 12);
  const v = r.data || {};
  let old = null,
    ref;
  if (reschedule) {
    ref = collection("bookings").doc(safeId(v.id));
    const s = await ref.get();
    if (!s.exists) throw new HttpsError("not-found", "Booking not found.");
    old = s.data();
    await manageAllowed(r, old);
    if (
      old.status !== "confirmed" ||
      Date.now() > old.startAt - old.cancelHours * 3600000
    )
      throw new HttpsError(
        "failed-precondition",
        "The rescheduling window has closed.",
      );
  }
  if (v.timezone && !DateTime.now().setZone(v.timezone).isValid)
    bad("Invalid attendee time zone.");
  const eventId = old?.eventId || v.eventId,
    startAt = Number(v.startAt);
  if (!Number.isFinite(startAt)) bad("Choose a valid time.");
  const ev = await collection("events").doc(safeId(eventId)).get();
  if (!ev.exists) bad("Event is unavailable.");
  if (ev.data().participantUids?.length)
    throw new HttpsError(
      "permission-denied",
      "This meeting already has assigned attendees. Sign in to My meetings.",
    );
  const attendee = await assertBookingAudience(ev.data(), r);
  if (
    old &&
    ev.data().audience === "registered" &&
    old.attendeeUid !== attendee.uid
  )
    throw new HttpsError(
      "permission-denied",
      "Sign in with the account that originally booked this meeting.",
    );
  // A retry after a lost response returns the original booking, not a second reservation.
  if (!reschedule && v.requestId) {
    const s = await collection("bookings").doc(safeId(v.requestId)).get();
    if (s.exists) {
      const b = s.data();
      if (
        (ev.data().audience === "registered" &&
          b.attendeeUid !== attendee.uid) ||
        b.attendeeEmail !==
          (attendee.email || text(v.email, 254).toLowerCase()) ||
        b.eventId !== v.eventId ||
        b.startAt !== Number(v.startAt) ||
        (ev.data().schedulingMode === "host-slots" && b.ownerId !== v.hostUid)
      )
        throw new HttpsError(
          "already-exists",
          "Request identifier is already used.",
        );
      const token = unseal(b.tokenCipher).token;
      return {
        id: s.id,
        token,
        url: `${origin()}/manage/${s.id}?token=${encodeURIComponent(token)}`,
      };
    }
  }
  const selectedHostId =
    ev.data().schedulingMode === "host-slots"
      ? safeId(v.hostUid || old?.ownerId)
      : ev.data().ownerId;
  if (old && old.ownerId !== selectedHostId)
    bad("Cancel and make a new booking to change hosts.");
  const hs = await collection("hosts").doc(selectedHostId).get();
  if (!hs.exists) bad("Host is unavailable.");
  const organizerSnapshot =
    selectedHostId === ev.data().ownerId
      ? hs
      : await collection("hosts").doc(ev.data().ownerId).get();
  const organizerProfile = organizerSnapshot.data() || {};
  const date = DateTime.fromMillis(startAt, {
      zone: hs.data().timezone,
    }).toISODate(),
    c = await context(eventId, date, old ? ref.id : null, selectedHostId);
  if (JSON.stringify(c.event) !== JSON.stringify(ev.data()))
    throw new HttpsError(
      "aborted",
      "Meeting settings changed. Refresh and try again.",
    );
  if (!c.slots.some((s) => s.start === startAt))
    throw new HttpsError(
      "already-exists",
      "That time is no longer available. Choose another time.",
    );
  const ps = await connections(c.hostId);
  if (
    c.event.location === "zoom" &&
    !c.event.locationValue &&
    !ps.includes("zoom") &&
    (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID)
  ) {
    throw new HttpsError(
      "failed-precondition",
      "This host must connect Zoom or provide a Zoom meeting link.",
    );
  }
  if (
    c.event.location === "google-meet" &&
    !c.event.locationValue &&
    !ps.includes("google")
  )
    throw new HttpsError(
      "failed-precondition",
      "This host must connect Google Calendar first.",
    );
  if (c.event.location === "teams" && !ps.includes("microsoft"))
    throw new HttpsError(
      "failed-precondition",
      "This host must connect Outlook first.",
    );
  const attendeeName = old?.attendeeName || text(v.name, 100),
    attendeeEmail =
      old?.attendeeEmail || attendee.email || text(v.email, 254).toLowerCase();
  if (!attendeeName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail))
    bad("Enter your name and a valid email.");
  const answers =
    old?.answers ||
    (Array.isArray(v.answers)
      ? v.answers.slice(0, 10).map((a) => text(a, 1500))
      : []);
  if (c.event.questions.some((q, i) => q.required && !answers[i]))
    bad("Please answer all required questions.");
  const id = old ? ref.id : safeId(v.requestId),
    token = old
      ? unseal(old.tokenCipher).token
      : crypto.randomBytes(32).toString("base64url");
  ref = ref || collection("bookings").doc(id);
  const event = c.event,
    endAt = startAt + event.duration * 60000,
    lockStart = startAt - event.bufferBefore * 60000,
    lockEnd = endAt + event.bufferAfter * 60000;
  const dates = [
    ...new Set([
      ...lockDates(lockStart, lockEnd),
      ...(old ? lockDates(old.lockStart, old.lockEnd) : []),
    ]),
  ];
  const data = {
    ownerId: c.hostId,
    eventId,
    eventTitle: event.title,
    hostName: c.host.name,
    hostEmail: c.host.email,
    timezone: c.host.timezone,
    attendeeTimezone: text(v.timezone, 80) || c.host.timezone,
    organizerId: event.ownerId,
    organizerEmail: organizerProfile.email || c.host.email,
    organizerName: organizerProfile.name || c.host.name,
    notifications: event.notifications || notificationSettings(),
    attendeeName,
    attendeeEmail,
    notes: text(v.notes ?? old?.notes, 2000),
    answers,
    attendeeUid: old?.attendeeUid || attendee.uid,
    attendeeIdentityVerified:
      old?.attendeeIdentityVerified === true ||
      Boolean(
        attendee.uid &&
          r.auth?.token.email_verified &&
          r.auth.token.email?.toLowerCase() === attendeeEmail,
      ),
    questionLabels:
      old?.questionLabels || event.questions.map((question) => question.label),
    bookingAudience: event.audience || "anyone",
    startAt,
    endAt,
    lockStart,
    lockEnd,
    status: "confirmed",
    location: event.location,
    locationValue: event.locationValue,
    cancelHours: event.cancelHours,
    revision: (old?.revision || 0) + 1,
    tokenHash: hash(token),
    tokenCipher: old?.tokenCipher || seal({ token }),
    syncStatus: "pending",
    externalIds: {},
    meetingUrl:
      event.location === "meetly"
        ? `${origin()}/room/${id}`
        : event.locationValue,
    roomKey:
      event.location === "meetly"
        ? `meetly-${crypto.randomBytes(24).toString("hex")}`
        : null,
    createdAt: old?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  const reserved = await db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (!old && current.exists) {
      if (
        current.data().attendeeEmail === attendeeEmail &&
        current.data().startAt === startAt &&
        current.data().eventId === eventId &&
        current.data().ownerId === c.hostId
      )
        return current.data();
      throw new HttpsError(
        "already-exists",
        "A booking with this request identifier already exists.",
      );
    }
    if (
      old &&
      (!current.exists ||
        current.data().revision !== old.revision ||
        current.data().status !== "confirmed")
    )
      throw new HttpsError(
        "aborted",
        "This booking changed. Refresh and try again.",
      );
    const locks = dates.map((d) => collection("locks").doc(`${c.hostId}_${d}`));
    await Promise.all(locks.map((l) => tx.get(l)));
    const [hostNow, eventNow, bookings] = await Promise.all([
      tx.get(collection("hosts").doc(c.hostId)),
      tx.get(ev.ref),
      tx.get(c.query),
    ]);
    if (!hostNow.exists || !eventNow.exists || !eventNow.data().active)
      throw new HttpsError("failed-precondition", "Event is unavailable.");
    if (JSON.stringify(hostNow.data()) !== JSON.stringify(c.host))
      throw new HttpsError(
        "aborted",
        "Host availability changed. Choose a time again.",
      );
    if (JSON.stringify(eventNow.data()) !== JSON.stringify(event))
      throw new HttpsError(
        "aborted",
        "Event settings changed. Choose a time again.",
      );
    const others = bookings.docs
      .filter((d) => d.id !== id && d.data().status === "confirmed")
      .map((d) => d.data());
    if (
      others.filter(
        (b) =>
          DateTime.fromMillis(b.startAt, {
            zone: hostNow.data().timezone,
          }).toISODate() === date,
      ).length >= event.dailyLimit ||
      !(
        event.schedulingMode === "host-slots" ? availableHostSlots : slotsForDay
      )({
        hostId: c.hostId,
        date,
        host: hostNow.data(),
        event,
        busy: [
          ...c.busy,
          ...others.map((b) => ({ start: b.lockStart, end: b.lockEnd })),
        ],
      }).some((s) => s.start === startAt)
    )
      throw new HttpsError(
        "already-exists",
        "That time was just booked. Choose another time.",
      );
    for (const l of locks)
      tx.set(
        l,
        { version: FieldValue.increment(1), updatedAt: Date.now() },
        { merge: true },
      );
    tx.set(ref, data);
    tx.create(collection("jobs").doc(`${id}_${data.revision}`), {
      bookingId: id,
      revision: data.revision,
      action: "sync",
      oldIds: old?.externalIds || {},
      oldStart: old?.startAt || null,
      status: "pending",
    });
    return data;
  });
  const reservedToken = unseal(reserved.tokenCipher).token;
  return {
    id,
    token: reservedToken,
    url: `${origin()}/manage/${id}?token=${encodeURIComponent(reservedToken)}`,
  };
}
export const schedulerBook = calendarWrap((r) => book(r));
export const schedulerReschedule = calendarWrap((r) => book(r, true));
export const schedulerCancel = wrap(async (r) => {
  await throttle(r, "cancel", 20);
  const ref = collection("bookings").doc(safeId(r.data.id));
  await db.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) throw new HttpsError("not-found", "Booking not found.");
    const b = s.data();
    await manageAllowed(r, b);
    if (b.status === "cancelled") return;
    if (
      r.auth?.uid !== b.ownerId &&
      r.auth?.uid !== b.organizerId &&
      Date.now() > b.startAt - b.cancelHours * 3600000
    )
      throw new HttpsError(
        "failed-precondition",
        "The cancellation window has closed. Contact the host.",
      );
    const revision = b.revision + 1;
    tx.update(ref, {
      status: "cancelled",
      revision,
      syncStatus: "pending",
      updatedAt: Date.now(),
    });
    tx.create(collection("jobs").doc(`${ref.id}_${revision}`), {
      bookingId: ref.id,
      revision,
      action: "cancel",
      oldIds: b.externalIds || {},
      status: "pending",
    });
  });
  return { ok: true };
});
export const schedulerConnect = wrap(async (r) => {
  const uid = await hostUser(r),
    provider = r.data.provider;
  if (!["google", "microsoft", "zoom"].includes(provider))
    bad("Unsupported integration.");
  try {
    origin();
  } catch (e) {
    throw new HttpsError("failed-precondition", e.message);
  }
  if (
    !process.env[
      provider === "zoom"
        ? "ZOOM_OAUTH_CLIENT_ID"
        : provider === "google"
          ? "GOOGLE_CLIENT_ID"
          : "MICROSOFT_CLIENT_ID"
    ] ||
    !process.env.OAUTH_REDIRECT_URI
  )
    throw new HttpsError(
      "failed-precondition",
      `Configure ${provider === "zoom" ? "ZOOM_OAUTH_CLIENT_ID" : provider === "google" ? "GOOGLE_CLIENT_ID" : "MICROSOFT_CLIENT_ID"} and OAUTH_REDIRECT_URI in the Functions environment, then redeploy schedulerConnect.`,
    );
  const state = crypto.randomBytes(32).toString("base64url"),
    verifier = crypto.randomBytes(48).toString("base64url");
  const url = authorization(provider, state, verifier);
  await collection("oauth")
    .doc(hash(state))
    .set({ ownerId: uid, provider, verifier, expiresAt: Date.now() + 600000 });
  return { url };
});
export const schedulerOAuthCallback = onRequest(
  { region, secrets, maxInstances: 5 },
  async (req, res) => {
    let returnOrigin = null,
      stage = "configuration",
      provider = null;
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    try {
      returnOrigin = origin();
      if (
        Buffer.from(process.env.OAUTH_TOKEN_KEY || "", "base64").length !== 32
      )
        throw Error("OAUTH_TOKEN_KEY must be a base64-encoded 32-byte key.");
      stage = "state-validation";
      const state = text(req.query.state, 200);
      if (!state || typeof req.query.code !== "string")
        throw Error(
          "Consent was cancelled or state is missing. Start again from Integrations.",
        );
      const ref = collection("oauth").doc(hash(state));
      let pending;
      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists || snapshot.data().expiresAt < Date.now())
          throw Error(
            "Calendar authorization expired. Start a fresh connection from Integrations.",
          );
        pending = snapshot.data();
        tx.delete(ref);
      });
      provider = pending.provider;
      stage = "host-authorization";
      await requireHost(pending.ownerId);
      stage = "token-exchange";
      if (
        !process.env[
          provider === "zoom"
            ? "ZOOM_OAUTH_CLIENT_ID"
            : provider === "google"
              ? "GOOGLE_CLIENT_ID"
              : "MICROSOFT_CLIENT_ID"
        ] ||
        !process.env[
          provider === "zoom"
            ? "ZOOM_OAUTH_CLIENT_SECRET"
            : provider === "google"
              ? "GOOGLE_CLIENT_SECRET"
              : "MICROSOFT_CLIENT_SECRET"
        ] ||
        !process.env.OAUTH_REDIRECT_URI
      )
        throw Error(
          "OAuth client ID, client secret or redirect URI is missing from the deployed callback configuration.",
        );
      const tokens = await exchange(provider, req.query.code, pending.verifier),
        id = `${pending.ownerId}_${provider}`;
      stage = "save-connection";
      const batch = db.batch();
      batch.set(collection("private").doc(id), {
        tokens: seal(tokens),
        ownerId: pending.ownerId,
      });
      batch.set(collection("connections").doc(id), {
        ownerId: pending.ownerId,
        provider,
        connectedAt: Date.now(),
        status: "connected",
      });
      await batch.commit();
      res.redirect(`${returnOrigin}/integrations?calendar=connected`);
    } catch (error) {
      // Log only controlled error text and allowlisted OAuth error codes. Never log req.query, tokens, authorization codes or provider response bodies.
      logger.warn("Scheduler OAuth callback failed", {
        stage,
        provider,
        reason: error.message,
        oauthError: error.oauthError || null,
        httpStatus: error.status || null,
        config: {
          appOriginPresent: Boolean(process.env.APP_ORIGIN),
          googleClientIdPresent: Boolean(process.env.GOOGLE_CLIENT_ID),
          microsoftClientIdPresent: Boolean(process.env.MICROSOFT_CLIENT_ID),
          redirectUriPresent: Boolean(process.env.OAUTH_REDIRECT_URI),
          encryptionKeyValid:
            Buffer.from(process.env.OAUTH_TOKEN_KEY || "", "base64").length ===
            32,
        },
      });
      if (!returnOrigin) {
        res
          .status(500)
          .type("text/plain")
          .send(
            "Scheduler configuration error: APP_ORIGIN is missing or invalid in the deployed schedulerOAuthCallback. Set APP_ORIGIN in the backend Functions environment and redeploy schedulerConnect and schedulerOAuthCallback. Then start a new connection from Integrations.",
          );
        return;
      }
      const reason = error.oauthError || stage;
      res.redirect(
        `${returnOrigin}/integrations?calendar=error&reason=${encodeURIComponent(reason)}`,
      );
    }
  },
);
export const schedulerDisconnect = wrap(async (r) => {
  const uid = await hostUser(r);
  if (!["google", "microsoft", "zoom"].includes(r.data.provider))
    bad("Invalid provider.");
  const id = `${uid}_${r.data.provider}`;
  await db.runTransaction(async (tx) => {
    const jobs = await tx.get(
      collection("bookings")
        .where("ownerId", "==", uid)
        .where("startAt", ">=", Date.now()),
    );
    if (
      jobs.docs.some(
        (d) =>
          d.data().status === "confirmed" &&
          d.data().externalIds?.[r.data.provider],
      )
    )
      throw new HttpsError(
        "failed-precondition",
        "This calendar has upcoming synced bookings. Keep it connected until those bookings finish or are cancelled.",
      );
    tx.delete(collection("private").doc(id));
    tx.delete(collection("connections").doc(id));
  });
  return { ok: true };
});
function esc(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
async function bookingEmailSettings(b) {
  const event = await collection("events").doc(b.eventId).get();
  return notificationSettings(event.data()?.notifications || b.notifications);
}
async function mail(b, id, kind) {
  const settings = await bookingEmailSettings(b);
  if (!settings.enabled) return;
  const staff = hostRecipients(b);
  if (b.organizerId && !b.organizerEmail && b.organizerId !== b.ownerId) {
    const organizer = await collection("hosts").doc(b.organizerId).get();
    const email = organizer.data()?.email;
    if (
      email &&
      !staff.some((p) => p.email.toLowerCase() === email.toLowerCase())
    )
      staff.push({ uid: "organizer", email, name: organizer.data().name });
  }
  let participants;
  if (b.participants?.length)
    participants = b.participants.filter(
      (p) =>
        kind === "cancel" ||
        (kind.startsWith("reminder")
          ? responseStatus(p) === "accepted"
          : responseStatus(p) !== "invited"),
    );
  else
    participants = [
      { uid: "attendee", email: b.attendeeEmail, response: "accepted" },
    ];
  const recipients = [
    ...participants.map((p) => ({ ...p, staff: false })),
    ...staff.map((p) => ({ ...p, staff: true, response: "accepted" })),
  ];
  for (const person of recipients) {
    const state = responseStatus(person),
      effectiveKind =
        !person.staff && state === "declined" && kind !== "cancel"
          ? "declined"
          : kind;
    if (!emailAllowed(settings, effectiveKind, person.staff)) continue;
    const title =
      kind === "cancel"
        ? "Meeting cancelled"
        : kind.startsWith("reminder")
          ? "Meeting reminder"
          : person.staff
            ? "Meeting update"
            : state === "declined"
              ? "Invitation declined"
              : b.participants?.length || b.revision === 1
                ? "Meeting confirmed"
                : "Booking rescheduled";
    const time = DateTime.fromMillis(b.startAt, {
      zone: person.staff ? b.timezone : b.attendeeTimezone || b.timezone,
    }).toFormat("cccc, dd LLL yyyy · HH:mm ZZZZ");
    let managementUrl = `${origin()}/${person.staff ? "bookings" : "my-meetings"}`;
    if (!person.staff && person.registrationId) {
      const registration = await collection("registrations")
        .doc(person.registrationId)
        .get();
      if (registration.exists)
        managementUrl = `${origin()}/registration/${person.registrationId}?token=${encodeURIComponent(unseal(registration.data().tokenCipher).token)}`;
    } else if (!person.staff && !b.participants?.length)
      managementUrl = `${origin()}/manage/${id}?token=${encodeURIComponent(unseal(b.tokenCipher).token)}`;
    const link =
      state === "accepted" && kind !== "cancel"
        ? b.meetingUrl || b.locationValue || ""
        : "";
    const roster =
      person.staff && b.participants?.length
        ? `\nAttendees: ${b.participants.map((p) => `${p.name} (${responseStatus(p)})`).join(", ")}`
        : "";
    const suffix = person.staff
      ? b.participants?.length && kind.startsWith("reminder")
        ? `${kind}_${person.uid}`
        : `${b.revision}_${kind}_${person.uid}`
      : b.participants?.length
        ? `${kind.startsWith("reminder") || kind === "cancel" ? kind : state}_${person.uid}`
        : `${b.revision}_${kind}_attendee`;
    try {
      await collection("mail")
        .doc(`${id}_${suffix}`)
        .create({
          to: [person.email],
          bookingId: id,
          notificationKind: effectiveKind,
          recipientRole: person.staff ? person.uid : "attendee",
          createdAt: Date.now(),
          message: {
            subject: `${title}: ${b.eventTitle}`,
            text: `${title}\n${b.eventTitle}\n${time}\nWith ${b.hostName}\n${link}${roster}\nView details: ${managementUrl}`,
          },
        });
    } catch (e) {
      if (e.code !== 6) throw e;
    }
  }
}
export const schedulerSaveNotifications = wrap(async (r) => {
  const uid = await hostUser(r),
    access = await accessForUid(uid),
    eventRef = collection("events").doc(safeId(r.data?.eventId)),
    notifications = notificationSettings(r.data?.notifications);
  await db.runTransaction(async (tx) => {
    const [event, bookings] = await Promise.all([
      tx.get(eventRef),
      tx.get(collection("bookings").where("eventId", "==", eventRef.id)),
    ]);
    if (!event.exists) bad("Meeting not found.");
    if (
      !access.isAdmin &&
      event.data().ownerId !== uid &&
      !bookings.docs.some((d) => d.data().ownerId === uid)
    )
      throw new HttpsError(
        "permission-denied",
        "You cannot change this meeting's notifications.",
      );
    tx.update(eventRef, { notifications });
    tx.create(collection("audit").doc(), {
      eventId: eventRef.id,
      actorUid: uid,
      action: "notification-settings-updated",
      notifications,
      at: Date.now(),
    });
  });
  return { ok: true };
});
export const schedulerMeetingEmails = wrap(async (r) => {
  const uid = await hostUser(r),
    access = await accessForUid(uid),
    bookingId = safeId(r.data?.id),
    ref = collection("bookings").doc(bookingId),
    snapshot = await ref.get();
  if (!snapshot.exists) bad("Meeting not found.");
  const booking = snapshot.data();
  assertAttendeeAccess(uid, access, booking);
  const settings = await bookingEmailSettings(booking);
  if (r.data?.action === "retry") {
    const mailId = text(r.data.mailId, 512);
    if (!/^[a-zA-Z0-9_-]{1,512}$/.test(mailId))
      bad("Invalid email identifier.");
    const messageRef = collection("mail").doc(mailId),
      message = await messageRef.get();
    if (!message.exists || message.data().bookingId !== bookingId)
      throw new HttpsError(
        "permission-denied",
        "Email not found for this meeting.",
      );
    const target = await getFirestore()
      .collection("mail")
      .doc(message.data().defaultMailId || `meetly_${messageRef.id}`)
      .get();
    if (
      !message.data().dispatchError &&
      target.data()?.delivery?.state !== "ERROR"
    )
      bad("Only failed email jobs can be retried.");
    if (
      !emailAllowed(
        settings,
        message.data().notificationKind || "confirmation",
        message.data().recipientRole !== "attendee",
      )
    )
      bad("Enable this email type in the meeting settings before retrying.");
    if (message.data().dispatchError && !message.data().forwardedAt)
      await dispatchMailDraft(messageRef);
    else {
      const original = message.data(),
        retryRef = collection("mail").doc(`retry_${hash(messageRef.id)}`);
      try {
        await retryRef.create({
          to: original.to,
          message: original.message,
          bookingId,
          notificationKind: original.notificationKind || "confirmation",
          recipientRole: original.recipientRole || "attendee",
          createdAt: Date.now(),
          retryOf: messageRef.id,
        });
      } catch (e) {
        if (e.code !== 6) throw e;
      }
      await dispatchMailDraft(retryRef);
    }
  } else if (r.data?.action === "invitations") {
    if (booking.status !== "confirmed" || booking.startAt <= Date.now())
      bad("This meeting is closed. Invitations cannot be sent.");
    if (!emailAllowed(settings, "invitation"))
      bad("Enable invitation emails in the meeting settings first.");
    for (const p of booking.participants || [])
      if (responseStatus(p) === "invited") {
        try {
          await collection("mail")
            .doc(`${bookingId}_invitation_${p.uid}`)
            .create({
              to: [p.email],
              bookingId,
              notificationKind: "invitation",
              recipientRole: "attendee",
              createdAt: Date.now(),
              message: {
                subject: `Invitation: ${booking.eventTitle}`,
                text: `You are invited to ${booking.eventTitle} with ${booking.hostName}.\n${DateTime.fromMillis(booking.startAt, { zone: booking.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}\nAccept or decline: ${origin()}/my-meetings`,
              },
            });
        } catch (e) {
          if (e.code !== 6) throw e;
          await collection("mail").doc(`${bookingId}_invitation_${p.uid}`).set(
            {
              bookingId,
              notificationKind: "invitation",
              recipientRole: "attendee",
            },
            { merge: true },
          );
        }
      }
  }
  if (r.data?.action === "invitations") {
    const drafts = await collection("mail")
      .where("bookingId", "==", bookingId)
      .get();
    await Promise.all(
      drafts.docs
        .filter((d) => !d.data().forwardedAt)
        .map((d) => dispatchMailDraft(d.ref)),
    );
  }
  const messages = await collection("mail")
    .where("bookingId", "==", bookingId)
    .get();
  const targets = messages.docs.length
    ? await getFirestore().getAll(
        ...messages.docs.map((d) =>
          getFirestore()
            .collection("mail")
            .doc(d.data().defaultMailId || `meetly_${d.id}`),
        ),
      )
    : [];
  return {
    settings,
    eventId: booking.eventId,
    emailEnabled: true,
    messages: messages.docs
      .map((d, i) =>
        mailSummary(d.id, {
          ...d.data(),
          delivery: targets[i]?.data()?.delivery,
          forwardedAt:
            d.data().forwardedAt || (targets[i]?.exists ? Date.now() : null),
        }),
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
  };
});
export const schedulerDispatchMail = onDocumentCreated(
  {
    document: "scheduler_mail/{id}",
    database: DATABASE_ID,
    region,
    retry: true,
    maxInstances: 5,
  },
  async (event) => {
    if (!event.data) return;
    try {
      await dispatchMailDraft(event.data.ref);
    } catch (e) {
      await event.data.ref.update({ dispatchError: true });
      logger.error(`Meeting email forwarding failed (${e.code || "unknown"}).`);
      throw e;
    }
  },
);
export const schedulerSyncBooking = onDocumentCreated(
  {
    document: "scheduler_jobs/{id}",
    database: DATABASE_ID,
    region,
    secrets,
    retry: true,
    maxInstances: 10,
  },
  async (event) => {
    const fresh = await event.data.ref.get();
    if (
      !fresh.exists ||
      ["complete", "superseded"].includes(fresh.data().status) ||
      (fresh.data().attempts || 0) >= 5
    )
      return;
    const job = fresh.data(),
      ref = collection("bookings").doc(job.bookingId),
      snap = await ref.get();
    if (!snap.exists) return;
    const leaseRef = collection("sync_locks").doc(job.bookingId),
      leaseToken = crypto.randomUUID();
    await db.runTransaction(async (tx) => {
      const lease = await tx.get(leaseRef);
      if ((lease.data()?.expiresAt || 0) > Date.now())
        throw new Error(
          "Another synchronization is processing this meeting. Retry shortly.",
        );
      tx.set(leaseRef, { token: leaseToken, expiresAt: Date.now() + 120000 });
    });
    try {
      const latest = await ref.get();
      if (!latest.exists) return;
      let b = latest.data();
      await event.data.ref.update({ attempts: FieldValue.increment(1) });
      // Older jobs never create stale events. Cleanup is still safe for old IDs.
      try {
        await removeExternal(b.ownerId, job.oldIds);
        if (b.revision !== job.revision) {
          await removeExternal(b.ownerId, job.partialIds || {});
          await event.data.ref.update({ status: "superseded" });
          return;
        }
        if (job.action === "cancel") {
          await ref.update({ syncStatus: "synced", externalIds: {} });
          await mail(b, ref.id, "cancel");
        } else {
          const synced = await createExternal(
            { ...b, externalIds: { ...b.externalIds, ...job.partialIds } },
            ref.id,
            async (progress) => {
              await event.data.ref.update({ partialIds: progress.ids });
              await db.runTransaction(async (tx) => {
                const latest = await tx.get(ref);
                if (latest.data()?.revision === job.revision)
                  tx.update(ref, {
                    externalIds: progress.ids,
                    meetingUrl: progress.meetingUrl,
                  });
              });
            },
          );
          const applied = await db.runTransaction(async (tx) => {
            const latest = await tx.get(ref);
            if (latest.data()?.revision !== job.revision) return false;
            tx.update(ref, {
              externalIds: synced.ids,
              meetingUrl: synced.meetingUrl,
              syncStatus: "synced",
              syncedAt: Date.now(),
              syncedCalendars: Object.keys(synced.ids).filter(
                (provider) => provider !== "zoom",
              ),
            });
            return true;
          });
          if (!applied) {
            await removeExternal(b.ownerId, synced.ids);
            return;
          }
          b = { ...b, externalIds: synced.ids, meetingUrl: synced.meetingUrl };
          if (b.participants?.length) await updateExternalAttendees(b);
          await mail(b, ref.id, "confirmation");
        }
        await event.data.ref.update({
          status: "complete",
          completedAt: Date.now(),
        });
      } catch (e) {
        logger.warn(`Calendar sync ${ref.id}: ${e.message}`);
        await db.runTransaction(async (tx) => {
          const s = await tx.get(ref);
          if (s.data()?.revision === job.revision)
            tx.update(ref, { syncStatus: "error" });
          tx.update(event.data.ref, { status: "error", message: e.message });
        });
        throw e;
      }
    } finally {
      await db.runTransaction(async (tx) => {
        const lease = await tx.get(leaseRef);
        if (lease.data()?.token === leaseToken) tx.delete(leaseRef);
      });
    }
  },
);
export const schedulerRetrySync = wrap(async (r) => {
  const uid = await hostUser(r),
    ref = collection("bookings").doc(safeId(r.data.id)),
    s = await ref.get();
  if (!s.exists || (s.data().ownerId !== uid && s.data().organizerId !== uid))
    throw new HttpsError("permission-denied", "Booking not found.");
  const b = s.data();
  await collection("jobs")
    .doc(`${ref.id}_${b.revision}_retry_${Date.now()}`)
    .set({
      bookingId: ref.id,
      revision: b.revision,
      action: b.status === "cancelled" ? "cancel" : "sync",
      oldIds: {},
      status: "pending",
    });
  return { ok: true };
});
export const schedulerReminders = onSchedule(
  { schedule: "every 5 minutes", region, secrets, maxInstances: 1 },
  async () => {
    const now = Date.now(),
      s = await collection("bookings")
        .where("status", "==", "confirmed")
        .where("startAt", ">", now)
        .where("startAt", "<=", now + 86400000)
        .get();
    for (const d of s.docs) {
      const b = d.data(),
        minutes = (b.startAt - now) / 60000;
      for (const offset of (await bookingEmailSettings(b)).reminderMinutes)
        if (minutes <= offset && minutes > offset - 10)
          await mail(b, d.id, `reminder_${offset}`);
    }
  },
);
