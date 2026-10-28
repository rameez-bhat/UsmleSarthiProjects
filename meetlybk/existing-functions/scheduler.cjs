var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, {
          get: () => from[key2],
          enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// functions/index.js
var index_exports = {};
__export(index_exports, {
  schedulerAccess: () => schedulerAccess,
  schedulerAdminBookings: () => schedulerAdminBookings,
  schedulerAttendeeDetails: () => schedulerAttendeeDetails,
  schedulerBook: () => schedulerBook,
  schedulerCancel: () => schedulerCancel,
  schedulerConnect: () => schedulerConnect,
  schedulerDeleteEvent: () => schedulerDeleteEvent,
  schedulerDisconnect: () => schedulerDisconnect,
  schedulerDispatchMail: () => schedulerDispatchMail,
  schedulerGetBooking: () => schedulerGetBooking,
  schedulerJoinMeeting: () => schedulerJoinMeeting,
  schedulerMeetingEmails: () => schedulerMeetingEmails,
  schedulerMyMeetings: () => schedulerMyMeetings,
  schedulerOAuthCallback: () => schedulerOAuthCallback,
  schedulerPublicEvent: () => schedulerPublicEvent,
  schedulerPublicPage: () => schedulerPublicPage,
  schedulerRegistration: () => schedulerRegistration,
  schedulerReminders: () => schedulerReminders,
  schedulerReschedule: () => schedulerReschedule,
  schedulerRespondInvitation: () => schedulerRespondInvitation,
  schedulerRetrySync: () => schedulerRetrySync,
  schedulerRoom: () => schedulerRoom,
  schedulerSaveAvailability: () => schedulerSaveAvailability,
  schedulerSaveEvent: () => schedulerSaveEvent,
  schedulerSaveNotifications: () => schedulerSaveNotifications,
  schedulerSaveProfile: () => schedulerSaveProfile,
  schedulerSearchHosts: () => schedulerSearchHosts,
  schedulerSearchUsers: () => schedulerSearchUsers,
  schedulerSelectedUsers: () => schedulerSelectedUsers,
  schedulerSlots: () => schedulerSlots,
  schedulerSyncBooking: () => schedulerSyncBooking,
  schedulerWorkspace: () => schedulerWorkspace,
});
module.exports = __toCommonJS(index_exports);

// functions/month-availability.js
var import_luxon2 = require("luxon");

// functions/scheduling.js
var import_luxon = require("luxon");
var defaultSchedule = () =>
  Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [
      String(i + 1),
      i < 5 ? [{ start: "09:00", end: "17:00" }] : [],
    ]),
  );
var overlap = (a, b) => a.start < b.end && b.start < a.end;
function validateSchedule(schedule, overrides = {}) {
  const intervals = (r) =>
    Array.isArray(r) &&
    r.length <= 6 &&
    r.every(
      (v, i) =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(v.start) &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(v.end) &&
        v.start < v.end &&
        (i === 0 || r[i - 1].end <= v.start),
    );
  if (
    !schedule ||
    Object.keys(schedule).length !== 7 ||
    !Object.keys(schedule).every((k) => /^[1-7]$/.test(k)) ||
    !Object.values(schedule).every(intervals)
  )
    throw Error(
      "Use seven weekdays with ordered, non-overlapping time ranges.",
    );
  if (
    Object.keys(overrides).length > 180 ||
    !Object.entries(overrides).every(
      ([d, r]) =>
        import_luxon.DateTime.fromISO(d).isValid &&
        /^\d{4}-\d{2}-\d{2}$/.test(d) &&
        intervals(r),
    )
  )
    throw Error("Invalid date overrides.");
}
function slotsForDay({ date, host, event, busy = [], now = Date.now() }) {
  const day = import_luxon.DateTime.fromISO(date, { zone: host.timezone });
  if (!day.isValid) return [];
  if (event.schedulingMode === "fixed") {
    const start = Number(event.fixedStartAt),
      end = start + event.duration * 6e4;
    if (
      !Number.isSafeInteger(start) ||
      import_luxon.DateTime.fromMillis(start, {
        zone: host.timezone,
      }).toISODate() !== date ||
      start < now + event.minNotice * 6e4
    )
      return [];
    return busy.some((b) =>
      overlap(
        {
          start: start - event.bufferBefore * 6e4,
          end: end + event.bufferAfter * 6e4,
        },
        b,
      ),
    )
      ? []
      : [{ start, end }];
  }
  const schedule =
    host.overrides?.[date] ?? host.schedule?.[String(day.weekday)] ?? [];
  const min = now + event.minNotice * 6e4,
    max = now + event.horizonDays * 864e5;
  const slots = [];
  const before = event.bufferBefore * 6e4,
    after = event.bufferAfter * 6e4;
  for (const range of schedule) {
    let start = import_luxon.DateTime.fromISO(`${date}T${range.start}`, {
      zone: host.timezone,
    });
    const end = import_luxon.DateTime.fromISO(`${date}T${range.end}`, {
      zone: host.timezone,
    });
    if (
      start.toFormat("HH:mm") !== range.start ||
      end.toFormat("HH:mm") !== range.end
    )
      continue;
    for (
      ;
      start.plus({ minutes: event.duration }).toMillis() <= end.toMillis();
      start = start.plus({ minutes: 15 })
    ) {
      const ms = start.toMillis(),
        finish = ms + event.duration * 6e4;
      const candidate = { start: ms - before, end: finish + after };
      if (ms >= min && ms <= max && !busy.some((b) => overlap(candidate, b)))
        slots.push({ start: ms, end: finish });
    }
  }
  return [...new Map(slots.map((s) => [s.start, s])).values()];
}
function lockDates(start, end) {
  const dates = [];
  let d = import_luxon.DateTime.fromMillis(start, { zone: "utc" }).startOf(
    "day",
  );
  while (d.toMillis() < end) {
    dates.push(d.toISODate());
    d = d.plus({ days: 1 });
  }
  return dates;
}

// functions/month-availability.js
function slotsForMonth({
  month,
  host,
  event,
  existing = [],
  busy = [],
  now = Date.now(),
}) {
  const first = import_luxon2.DateTime.fromISO(`${month}-01`, {
    zone: host.timezone,
  });
  if (!first.isValid) return [];
  const blocked = [
    ...busy,
    ...existing.map((b) => ({ start: b.lockStart, end: b.lockEnd })),
  ];
  const slots = [];
  for (let offset = -1; offset <= first.daysInMonth; offset++) {
    const date = first.plus({ days: offset }).toISODate();
    const bookedToday = existing.filter(
      (b) =>
        import_luxon2.DateTime.fromMillis(b.startAt, {
          zone: host.timezone,
        }).toISODate() === date,
    ).length;
    if (bookedToday >= event.dailyLimit) continue;
    slots.push(...slotsForDay({ date, host, event, busy: blocked, now }));
  }
  return slots;
}

// functions/host-slots.js
var import_luxon3 = require("luxon");
var import_https = require("firebase-functions/v2/https");
function normalizeHostSlots(input, hostIds, profiles, event) {
  if (!Array.isArray(input) || !input.length || input.length > 100) {
    throw new import_https.HttpsError(
      "invalid-argument",
      "Add between 1 and 100 host meeting times.",
    );
  }
  const seen = /* @__PURE__ */ new Set();
  const slots = input.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new import_https.HttpsError(
        "invalid-argument",
        "Invalid host meeting time.",
      );
    const host = profiles.get(value.hostUid);
    const local = `${value.date}T${value.time}`;
    const start = import_luxon3.DateTime.fromISO(local, {
      zone: value.timezone || host?.timezone || "UTC",
    });
    if (
      !hostIds.includes(value.hostUid) ||
      !host ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.date || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time || "") ||
      !start.isValid ||
      start.toFormat("yyyy-MM-dd'T'HH:mm") !== local
    ) {
      throw new import_https.HttpsError(
        "invalid-argument",
        "Choose a valid host, date and time for every slot.",
      );
    }
    const startAt = start.toMillis();
    const key2 = `${value.hostUid}_${startAt}`;
    if (seen.has(key2))
      throw new import_https.HttpsError(
        "invalid-argument",
        "Remove duplicate host times.",
      );
    seen.add(key2);
    return {
      hostUid: value.hostUid,
      hostName: host.name,
      date: value.date,
      time: value.time,
      timezone: value.timezone || host.timezone,
      hostDate: import_luxon3.DateTime.fromMillis(startAt, {
        zone: host.timezone,
      }).toISODate(),
      startAt,
    };
  });
  for (const slot of slots) {
    if (
      slots.some(
        (other) =>
          other !== slot &&
          other.hostUid === slot.hostUid &&
          slot.startAt - event.bufferBefore * 6e4 <
            other.startAt + (event.duration + event.bufferAfter) * 6e4 &&
          other.startAt - event.bufferBefore * 6e4 <
            slot.startAt + (event.duration + event.bufferAfter) * 6e4,
      )
    ) {
      throw new import_https.HttpsError(
        "invalid-argument",
        "Times for the same host overlap, including buffers.",
      );
    }
  }
  if (
    hostIds.some(
      (uid) =>
        uid !== event.ownerId && !slots.some((slot) => slot.hostUid === uid),
    )
  ) {
    throw new import_https.HttpsError(
      "invalid-argument",
      "Add at least one time for every selected host.",
    );
  }
  return slots.sort((a, b) => a.startAt - b.startAt);
}
function availableHostSlots({
  event,
  hostId,
  date,
  host,
  busy = [],
  now = Date.now(),
}) {
  return (event.hostSlots || [])
    .filter(
      (s) =>
        s.hostUid === hostId &&
        import_luxon3.DateTime.fromMillis(s.startAt, {
          zone: host.timezone,
        }).toISODate() === date &&
        s.startAt > now &&
        s.startAt >= now + event.minNotice * 6e4 &&
        !busy.some(
          (b) =>
            s.startAt - event.bufferBefore * 6e4 < b.end &&
            b.start < s.startAt + (event.duration + event.bufferAfter) * 6e4,
        ),
    )
    .map((s) => ({
      start: s.startAt,
      end: s.startAt + event.duration * 6e4,
      hostUid: hostId,
      hostName: host.name,
      timezone: host.timezone,
    }));
}
function participatingHosts(organizerUid, selected = []) {
  return [.../* @__PURE__ */ new Set([organizerUid, ...selected])];
}
function hostSlotGroups(event, profiles) {
  const groups = /* @__PURE__ */ new Map();
  for (const slot of event.hostSlots || []) {
    const host = profiles.get(slot.hostUid);
    if (!host || !Number.isFinite(slot.startAt)) continue;
    const date = import_luxon3.DateTime.fromMillis(slot.startAt, {
      zone: host.timezone,
    }).toISODate();
    const key2 = `${slot.hostUid}_${date}`;
    if (!groups.has(key2)) groups.set(key2, { hostUid: slot.hostUid, date });
  }
  return [...groups.values()];
}
function hostSlotReason(slot, event, context2, now = Date.now()) {
  if (slot.startAt <= now) return "past";
  if (slot.startAt < now + event.minNotice * 6e4) return "minimum_notice";
  if (context2.todayCount >= event.dailyLimit) return "daily_limit";
  const start = slot.startAt - event.bufferBefore * 6e4;
  const end = slot.startAt + (event.duration + event.bufferAfter) * 6e4;
  if (
    (context2.existing || []).some(
      (b) => start < b.lockEnd && b.lockStart < end,
    )
  )
    return "existing_booking";
  if ((context2.busy || []).some((b) => start < b.end && b.start < end))
    return "calendar_busy";
  return "available";
}

// functions/mail-bridge.js
var import_firestore = require("firebase-admin/firestore");
var escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function existingMailPayload(draft) {
  const to = Array.isArray(draft.to) ? draft.to.join(", ") : draft.to;
  if (typeof to !== "string" || !to.trim() || !draft.message?.subject)
    throw Error("Invalid meeting email draft.");
  const subject = String(draft.message.subject).replace(/[\r\n]+/g, " ");
  const content = String(draft.message.text || "")
    .split(/(https?:\/\/[^\s]+)/g)
    .map((part) =>
      /^https?:\/\//.test(part)
        ? `<a href="${escapeHtml(part)}">${escapeHtml(part)}</a>`
        : escapeHtml(part).replace(/\n/g, "<br>"),
    )
    .join("");
  const html =
    draft.message.html ||
    `<html><body style="font-family:Arial,sans-serif;padding:20px;line-height:1.6;"><h2>${escapeHtml(subject)}</h2><p>${content}</p><p>Thanks &amp; Regards,<br>USMLE Sarthi Team</p></body></html>`;
  return { to, message: { subject, html } };
}
async function dispatchMailDraft(
  ref,
  defaultDb = (0, import_firestore.getFirestore)(),
) {
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data().forwardedAt) return;
  const target = defaultDb.collection("mail").doc(`meetly_${ref.id}`);
  try {
    await target.create(existingMailPayload(snapshot.data()));
  } catch (e) {
    if (e.code !== 6) throw e;
  }
  await ref.update({
    forwardedAt: Date.now(),
    defaultMailId: target.id,
    dispatchError: false,
  });
}

// functions/notifications.js
var import_https2 = require("firebase-functions/v2/https");
function notificationSettings(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new import_https2.HttpsError(
      "invalid-argument",
      "Invalid notification settings.",
    );
  const settings = {};
  for (const key2 of [
    "enabled",
    "invitations",
    "confirmations",
    "cancellations",
    "hostUpdates",
  ]) {
    if (input[key2] !== void 0 && typeof input[key2] !== "boolean")
      throw new import_https2.HttpsError(
        "invalid-argument",
        `Invalid email setting: ${key2}.`,
      );
    settings[key2] = input[key2] ?? true;
  }
  const reminders = input.reminderMinutes ?? [1440, 60];
  if (
    !Array.isArray(reminders) ||
    reminders.some((n) => ![1440, 60, 15].includes(n))
  )
    throw new import_https2.HttpsError(
      "invalid-argument",
      "Choose supported email reminder times.",
    );
  settings.reminderMinutes = [...new Set(reminders)].sort((a, b) => b - a);
  return settings;
}
function emailAllowed(settings, kind, staff = false) {
  if (!settings.enabled || (staff && !settings.hostUpdates)) return false;
  if (kind.startsWith("reminder_"))
    return settings.reminderMinutes.includes(Number(kind.slice(9)));
  if (kind === "cancel" || kind === "declined") return settings.cancellations;
  if (staff) return true;
  return kind === "invitation" ? settings.invitations : settings.confirmations;
}
function hostRecipients(booking) {
  const people = [
    { uid: "host", email: booking.hostEmail, name: booking.hostName },
    {
      uid: "organizer",
      email: booking.organizerEmail,
      name: booking.organizerName,
    },
  ];
  const unique = /* @__PURE__ */ new Map();
  for (const person of people)
    if (typeof person.email === "string" && person.email)
      unique.set(
        person.email.toLowerCase(),
        unique.get(person.email.toLowerCase()) || person,
      );
  return [...unique.values()];
}
function mailSummary(id, data) {
  return {
    id,
    to: Array.isArray(data.to) ? data.to : [],
    subject: data.message?.subject || "Meeting notification",
    kind: data.notificationKind || "notification",
    createdAt: data.createdAt || null,
    state:
      data.delivery?.state ||
      (data.forwardedAt
        ? "FORWARDED"
        : data.dispatchError
          ? "ERROR"
          : "PENDING"),
    attempts: data.delivery?.attempts || 0,
    hasError: !!data.delivery?.error || !!data.dispatchError,
  };
}

// functions/invitations.js
var import_https3 = require("firebase-functions/v2/https");
var responseStatus = (participant) => participant?.response || "invited";
var confirmedParticipants = (booking) =>
  (booking.participants || []).filter((p) => responseStatus(p) === "accepted");
function respondToInvitation(booking, uid, response, now = Date.now()) {
  if (!["accepted", "declined"].includes(response))
    throw new import_https3.HttpsError(
      "invalid-argument",
      "Choose Accept or Decline.",
    );
  const participant = booking.participants?.find((p) => p.uid === uid);
  if (!participant)
    throw new import_https3.HttpsError(
      "permission-denied",
      "This invitation belongs to another user.",
    );
  if (booking.status !== "confirmed" || booking.startAt <= now)
    throw new import_https3.HttpsError(
      "failed-precondition",
      "This invitation is closed.",
    );
  if (responseStatus(participant) === response) return null;
  if (responseStatus(participant) !== "invited")
    throw new import_https3.HttpsError(
      "failed-precondition",
      "You have already responded. Contact the host to change your response.",
    );
  return booking.participants.map((p) =>
    p.uid === uid ? { ...p, response, respondedAt: now } : p,
  );
}
function chooseRoundRobin(candidates, counts = {}) {
  return (
    [...candidates].sort(
      (a, b) =>
        (counts[a.uid] || 0) - (counts[b.uid] || 0) ||
        a.uid.localeCompare(b.uid),
    )[0] || null
  );
}
function canEnterRoom(booking, uid) {
  return (
    booking.status === "confirmed" &&
    (booking.ownerId === uid ||
      booking.organizerId === uid ||
      booking.attendeeUid === uid ||
      confirmedParticipants(booking).some((p) => p.uid === uid))
  );
}

// functions/participants.js
var import_https4 = require("firebase-functions/v2/https");
function selectedUids(input = []) {
  if (
    !Array.isArray(input) ||
    input.length > 100 ||
    input.some(
      (uid) => typeof uid !== "string" || !/^[a-zA-Z0-9_-]{1,110}$/.test(uid),
    )
  ) {
    throw new import_https4.HttpsError(
      "invalid-argument",
      "Select up to 100 registered users.",
    );
  }
  return [...new Set(input)];
}
async function resolveParticipants(uids, identityDb) {
  return Promise.all(
    selectedUids(uids).map(async (uid) => {
      const result = await identityDb
        .collection("Users")
        .where("uid", "==", uid)
        .limit(2)
        .get();
      if (result.docs.length !== 1)
        throw new import_https4.HttpsError(
          "invalid-argument",
          "A selected user is missing or has duplicate identity records.",
        );
      const user2 = result.docs[0].data();
      if (
        typeof user2.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user2.email)
      )
        throw new import_https4.HttpsError(
          "invalid-argument",
          "A selected user has no valid email.",
        );
      return {
        uid,
        name:
          typeof user2.displayName === "string" && user2.displayName.trim()
            ? user2.displayName.trim().slice(0, 160)
            : user2.email,
        email: user2.email.trim().toLowerCase(),
      };
    }),
  );
}
function personalMeeting(id, booking, uid) {
  if (booking.attendeeUid !== uid && !booking.participantUids?.includes(uid))
    throw new import_https4.HttpsError(
      "permission-denied",
      "This meeting belongs to another attendee.",
    );
  return {
    id,
    eventTitle: booking.eventTitle,
    hostName: booking.hostName,
    startAt: booking.startAt,
    endAt: booking.endAt,
    timezone: booking.timezone,
    status:
      booking.status === "cancelled"
        ? "cancelled"
        : booking.participants?.some((p) => p.uid === uid)
          ? responseStatus(booking.participants.find((p) => p.uid === uid)) ===
            "accepted"
            ? "confirmed"
            : responseStatus(booking.participants.find((p) => p.uid === uid))
          : booking.status,
    meetingUrl:
      booking.status === "confirmed" &&
      (!booking.participants?.length ||
        responseStatus(booking.participants.find((p) => p.uid === uid)) ===
          "accepted")
        ? booking.meetingUrl || booking.locationValue || ""
        : "",
    location: booking.location,
    syncStatus: booking.syncStatus,
  };
}

// functions/selected-users.js
async function selectedUsers(identityDb, input) {
  const uids = selectedUids(input);
  if (!uids.length) return { users: [] };
  const queries = [];
  for (let i = 0; i < uids.length; i += 10)
    queries.push(
      identityDb
        .collection("Users")
        .where("uid", "in", uids.slice(i, i + 10))
        .select("uid", "displayName", "email")
        .get(),
    );
  const records = /* @__PURE__ */ new Map();
  for (const page of await Promise.all(queries))
    for (const doc of page.docs) {
      const data = doc.data();
      records.set(data.uid, [...(records.get(data.uid) || []), data]);
    }
  return {
    users: uids
      .filter((uid) => records.get(uid)?.length === 1)
      .map((uid) => {
        const user2 = records.get(uid)[0];
        return {
          uid,
          name: typeof user2.displayName === "string" ? user2.displayName : "",
          email: typeof user2.email === "string" ? user2.email : "",
        };
      }),
  };
}

// functions/access.js
var import_firestore2 = require("firebase-admin/firestore");
var import_https5 = require("firebase-functions/v2/https");
var ADMIN_ROLES = Object.freeze(["Admin", "CustomerSupport", "SuperAdmin"]);
var HOST_ROLES = Object.freeze(["Mentor", "Journalist", ...ADMIN_ROLES]);
function permissions(role) {
  return {
    role: typeof role === "string" ? role : null,
    isAdmin: ADMIN_ROLES.includes(role),
    canHost: HOST_ROLES.includes(role),
  };
}
async function accessForUid(
  uid,
  identityDb = (0, import_firestore2.getFirestore)(),
) {
  const records = await identityDb
    .collection("UsersRoles")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (records.docs.length !== 1) return permissions(null);
  return permissions(records.docs[0].data().Role);
}
async function requireHost(uid) {
  const access = await accessForUid(uid);
  if (!access.canHost)
    throw new import_https5.HttpsError(
      "permission-denied",
      "Your existing UsersRoles account is not authorized to host meetings. Contact an administrator.",
    );
  return access;
}
async function requireAdmin(uid) {
  const access = await accessForUid(uid);
  if (!access.isAdmin)
    throw new import_https5.HttpsError(
      "permission-denied",
      "Administrator access is required.",
    );
  return access;
}

// functions/user-search.js
async function searchUsers(identityDb, input) {
  const value = String(input || "")
    .trim()
    .slice(0, 120);
  if (value.length < 2) return { users: [], next: null };
  const snapshots = await Promise.all(
    ["displayName", "email"].map((field) =>
      identityDb
        .collection("Users")
        .orderBy(field)
        .startAt(value)
        .endAt(value + "\uF8FF")
        .limit(20)
        .select("uid", "displayName", "email")
        .get(),
    ),
  );
  const users = /* @__PURE__ */ new Map();
  for (const snapshot of snapshots)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      users.set(doc.id, {
        uid: data.uid || doc.id,
        name: data.displayName || data.email || "",
        email: data.email || "",
      });
    }
  return {
    users: [...users.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    ),
    next: null,
  };
}

// functions/host-search.js
async function searchHosts(identityDb, schedulerDb, input) {
  const result = await searchUsers(identityDb, input);
  const candidates = [
    ...new Map(
      result.users
        .filter((u) => typeof u.uid === "string" && u.uid)
        .map((u) => [u.uid, u]),
    ).values(),
  ];
  if (!candidates.length) return { users: [], next: null };
  const batches = [];
  for (let offset = 0; offset < candidates.length; offset += 10) {
    batches.push(
      identityDb
        .collection("UsersRoles")
        .where(
          "uid",
          "in",
          candidates.slice(offset, offset + 10).map((u) => u.uid),
        )
        .select("uid", "Role")
        .get(),
    );
  }
  const roles = /* @__PURE__ */ new Map();
  for (const page of await Promise.all(batches))
    for (const doc of page.docs) {
      const role = doc.data();
      roles.set(role.uid, [...(roles.get(role.uid) || []), role.Role]);
    }
  const eligible = candidates.filter(
    (u) =>
      roles.get(u.uid)?.length === 1 &&
      HOST_ROLES.includes(roles.get(u.uid)[0]),
  );
  if (!eligible.length) return { users: [], next: null };
  const profiles = await schedulerDb.getAll(
    ...eligible.map((u) =>
      schedulerDb.collection("scheduler_hosts").doc(u.uid),
    ),
  );
  const ready = new Set(profiles.filter((p) => p.exists).map((p) => p.id));
  return {
    users: eligible
      .filter((u) => ready.has(u.uid))
      .map((u) => ({ ...u, role: roles.get(u.uid)[0] })),
    next: null,
  };
}

// functions/registrations.js
var import_https6 = require("firebase-functions/v2/https");
function registrationReceipt(id, registration, booking) {
  const participant = booking.participants?.find(
    (p) => p.uid === registration.participantUid,
  );
  const status =
    booking.status === "cancelled" || participant?.response !== "accepted"
      ? "cancelled"
      : "confirmed";
  return {
    id,
    eventTitle: booking.eventTitle,
    hostName: booking.hostName,
    startAt: booking.startAt,
    endAt: booking.endAt,
    timezone: booking.timezone,
    status,
    attendeeName: registration.name,
    attendeeEmail: registration.email,
    meetingUrl:
      status === "confirmed"
        ? (booking.syncStatus === "synced"
            ? booking.meetingUrl
            : booking.locationValue) || ""
        : "",
    syncStatus: booking.syncStatus,
    cancelHours: booking.cancelHours,
  };
}
function registerParticipant(
  booking,
  participant,
  now = Date.now(),
  capacity = 100,
) {
  if (booking.status !== "confirmed" || booking.startAt <= now)
    throw new import_https6.HttpsError(
      "failed-precondition",
      "This meeting is no longer open for registration.",
    );
  const existing = booking.participants.find((p) => p.uid === participant.uid);
  if (existing) {
    if (existing.response === "declined")
      throw new import_https6.HttpsError(
        "failed-precondition",
        "You declined this invitation. Contact the host to change your response.",
      );
    return booking.participants.map((p) =>
      p.uid === participant.uid
        ? { ...p, ...participant, response: "accepted", respondedAt: now }
        : p,
    );
  }
  if (
    booking.participants.some(
      (p) => p.email.toLowerCase() === participant.email.toLowerCase(),
    )
  )
    throw new import_https6.HttpsError(
      "already-exists",
      "This email already has an invitation or registration. Sign in to accept your invitation, or use your confirmation link.",
    );
  if (
    booking.participants.filter((p) => p.response !== "declined").length >=
      capacity ||
    booking.participants.length >= 1e3
  )
    throw new import_https6.HttpsError(
      "resource-exhausted",
      "This meeting is full.",
    );
  return [
    ...booking.participants,
    { ...participant, response: "accepted", respondedAt: now },
  ];
}

// functions/rooms.js
var import_node_crypto = __toESM(require("node:crypto"), 1);
function jitsiToken(
  booking,
  auth,
  hostname,
  env = process.env,
  now = Date.now(),
) {
  if (!env.JITSI_JWT_SECRET || !env.JITSI_JWT_APP_ID)
    throw Error(
      "Configure JITSI_JWT_APP_ID and JITSI_JWT_SECRET for your secured Jitsi server.",
    );
  const at = Math.floor(now / 1e3),
    moderator =
      auth.uid === booking.ownerId || auth.uid === booking.organizerId;
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: env.JITSI_JWT_APP_ID,
      aud: "jitsi",
      sub: hostname,
      room: booking.roomKey,
      iat: at,
      nbf: at - 10,
      exp: at + 7200,
      context: {
        user: {
          id: auth.uid,
          name: auth.token?.name || auth.token?.email || "Participant",
          email: auth.token?.email || "",
          moderator: String(moderator),
        },
      },
    }),
  ).toString("base64url");
  const body = `${header}.${payload}`;
  return `${body}.${import_node_crypto.default.createHmac("sha256", env.JITSI_JWT_SECRET).update(body).digest("base64url")}`;
}

// functions/index.js
var import_node_util = require("node:util");
var import_node_crypto3 = __toESM(require("node:crypto"), 1);

// functions/attendee-details.js
var import_https7 = require("firebase-functions/v2/https");
function assertAttendeeAccess(uid, access, booking) {
  if (
    !access.canHost ||
    (!access.isAdmin && booking.ownerId !== uid && booking.organizerId !== uid)
  )
    throw new import_https7.HttpsError(
      "permission-denied",
      "You can view attendee details only for bookings on your own links.",
    );
}
function trustedAttendeeUid(booking) {
  return typeof booking.attendeeUid === "string" &&
    (booking.attendeeIdentityVerified === true ||
      booking.bookingAudience === "registered")
    ? booking.attendeeUid
    : null;
}
function safeProfile(value) {
  if (value === null || value === void 0) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(safeProfile);
  if (typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key2]) =>
            !/(password|secret|token|privatekey|apikey|authorization|credential)/i.test(
              key2.replace(/[^a-z]/gi, ""),
            ),
        )
        .map(([key2, item]) => [key2, safeProfile(item)]),
    );
  return value;
}
async function attendeeDetails(booking, identityDb) {
  const uid = trustedAttendeeUid(booking);
  const details = {
    booking: {
      eventTitle: booking.eventTitle,
      hostName: booking.hostName,
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      timezone: booking.timezone,
      attendeeTimezone: booking.attendeeTimezone || booking.timezone,
      notes: booking.notes || "",
      answers: (booking.answers || []).map((answer, index) => ({
        question: booking.questionLabels?.[index] || `Question ${index + 1}`,
        answer,
      })),
    },
    profile: null,
    account: null,
    profileState: "not-linked",
  };
  if (!uid) return details;
  const [users, roles] = await Promise.all([
    identityDb.collection("Users").where("uid", "==", uid).limit(2).get(),
    identityDb.collection("UsersRoles").where("uid", "==", uid).limit(2).get(),
  ]);
  details.profileState = users.docs.length === 1 ? "linked" : "unavailable";
  if (users.docs.length === 1)
    details.profile = safeProfile(users.docs[0].data());
  if (roles.docs.length === 1)
    details.account = safeProfile(roles.docs[0].data());
  return details;
}
function attendeeRoster(id, booking) {
  return {
    booking: {
      id,
      eventTitle: booking.eventTitle,
      attendeeName: booking.attendeeName,
    },
    participants: booking.participants.map((p) => ({
      uid: p.uid,
      name: p.name,
      email: p.email,
      response: p.response || "invited",
    })),
    profile: null,
    account: null,
  };
}

// functions/event-policy.js
var import_luxon4 = require("luxon");
var import_firestore3 = require("firebase-admin/firestore");
var import_https8 = require("firebase-functions/v2/https");
function applyEventPolicy(input, event, host, now = Date.now()) {
  const schedulingMode =
    input.multipleHostTimes === true
      ? "host-slots"
      : (input.schedulingMode ?? "recurring");
  const audience = input.audience ?? "anyone";
  if (
    !["recurring", "fixed", "host-slots"].includes(schedulingMode) ||
    !["anyone", "registered"].includes(audience)
  )
    throw new import_https8.HttpsError(
      "invalid-argument",
      "Choose a valid meeting schedule and booking audience.",
    );
  const policy = { schedulingMode, audience };
  if (input.multipleHostTimes === true) {
    const category =
      input.scheduleCategory || input.schedulingMode || "recurring";
    if (!["recurring", "fixed", "host-slots"].includes(category))
      throw new import_https8.HttpsError(
        "invalid-argument",
        "Invalid schedule category.",
      );
    Object.assign(policy, {
      multipleHostTimes: true,
      scheduleCategory: category,
    });
  }
  if (schedulingMode === "fixed") {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.meetingDate || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.meetingTime || "")
    )
      throw new import_https8.HttpsError(
        "invalid-argument",
        "Choose the meeting date and start time.",
      );
    const local = `${input.meetingDate}T${input.meetingTime}`;
    const start = import_luxon4.DateTime.fromISO(local, {
      zone: host.timezone,
    });
    if (!start.isValid || start.toFormat("yyyy-MM-dd'T'HH:mm") !== local)
      throw new import_https8.HttpsError(
        "invalid-argument",
        "This local meeting time does not exist in the host time zone.",
      );
    if (event.active && start.toMillis() <= now + event.minNotice * 6e4)
      throw new import_https8.HttpsError(
        "invalid-argument",
        "Choose a meeting time after the configured minimum booking notice, or reduce that notice.",
      );
    Object.assign(policy, {
      meetingDate: input.meetingDate,
      meetingTime: input.meetingTime,
      meetingTimezone: host.timezone,
      fixedStartAt: start.toMillis(),
    });
  }
  return policy;
}
async function assertBookingAudience(
  event,
  request2,
  identityDb = (0, import_firestore3.getFirestore)(),
) {
  if (event.audience !== "registered")
    return { uid: request2.auth?.uid || null, email: null };
  const auth = request2.auth;
  if (!auth)
    throw new import_https8.HttpsError(
      "unauthenticated",
      "Sign in with your registered USMLESarthi account to book this meeting.",
    );
  if (
    !auth.token?.email_verified ||
    typeof auth.token.email !== "string" ||
    !auth.token.email
  )
    throw new import_https8.HttpsError(
      "failed-precondition",
      "Verify your account email, then sign in again before booking.",
    );
  const users = await identityDb
    .collection("Users")
    .where("uid", "==", auth.uid)
    .limit(2)
    .get();
  if (users.docs.length !== 1)
    throw new import_https8.HttpsError(
      "permission-denied",
      "This meeting is available only to existing registered USMLESarthi users. Contact support if your account is missing.",
    );
  return { uid: auth.uid, email: auth.token.email.toLowerCase() };
}

// functions/oauth-config.js
function schedulerOrigin(value = process.env.APP_ORIGIN) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw Error(
      "APP_ORIGIN is missing or invalid. Set it to the scheduler address, including http:// or https://, and redeploy both OAuth functions.",
    );
  }
  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  )
    throw Error(
      "APP_ORIGIN must be an HTTP or HTTPS scheduler address without credentials.",
    );
  return parsed.origin;
}
function safeOAuthError(value) {
  const allowed = [
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "invalid_scope",
    "access_denied",
    "temporarily_unavailable",
    "server_error",
    "invalid_resource",
    "interaction_required",
    "consent_required",
  ];
  return allowed.includes(value) ? value : null;
}

// functions/index.js
var import_app = require("firebase-admin/app");
var import_firestore5 = require("firebase-admin/firestore");

// functions/database.js
var import_firestore4 = require("firebase-admin/firestore");
var DATABASE_ID = "calendly";
var schedulerDatabase = () => (0, import_firestore4.getFirestore)(DATABASE_ID);

// functions/index.js
var import_https9 = require("firebase-functions/v2/https");
var import_firestore6 = require("firebase-functions/v2/firestore");
var import_scheduler = require("firebase-functions/v2/scheduler");
var import_firebase_functions = require("firebase-functions");
var import_luxon5 = require("luxon");

// functions/zoom.js
var cached;
async function accessToken() {
  if (cached && cached.expiresAt > Date.now() + 6e4) return cached.value;
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
    signal: AbortSignal.timeout(2e4),
  });
  if (!response.ok)
    throw Error(
      `Zoom authorization failed (${response.status}). Check the activated Server-to-Server OAuth app.`,
    );
  const data = await response.json();
  if (!data.access_token) throw Error("Zoom did not return an access token.");
  cached = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1e3,
  };
  return cached.value;
}
async function ensureZoom(
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
          duration: Math.ceil((booking.endAt - booking.startAt) / 6e4),
          timezone: "UTC",
          agenda: `Meetly booking ${id}; revision ${booking.revision}`,
          settings: { waiting_room: true, join_before_host: false },
        }),
        signal: AbortSignal.timeout(2e4),
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
async function removeZoom(id, personalAccess = null) {
  const access = personalAccess || (await accessToken());
  const response = await fetch(
    `https://api.zoom.us/v2/meetings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}` },
      signal: AbortSignal.timeout(2e4),
    },
  );
  if (!response.ok && response.status !== 404)
    throw Error(`Zoom meeting removal failed (${response.status}).`);
}

// functions/calendars.js
var import_node_crypto2 = __toESM(require("node:crypto"), 1);
var db = schedulerDatabase;
var hash = (v) =>
  import_node_crypto2.default.createHash("sha256").update(v).digest("hex");
var key = () => {
  const k = Buffer.from(process.env.OAUTH_TOKEN_KEY || "", "base64");
  if (k.length !== 32)
    throw Error("OAUTH_TOKEN_KEY must be a base64-encoded 32-byte key.");
  return k;
};
function seal(value) {
  const iv = import_node_crypto2.default.randomBytes(12),
    c = import_node_crypto2.default.createCipheriv("aes-256-gcm", key(), iv);
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
function unseal(value) {
  const [iv, tag, body] = value.split(".");
  const c = import_node_crypto2.default.createDecipheriv(
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
async function request(url, options = {}) {
  const r = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(2e4),
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
var tokenUrl = (p) =>
  p === "zoom"
    ? "https://zoom.us/oauth/token"
    : p === "google"
      ? "https://oauth2.googleapis.com/token"
      : "https://login.microsoftonline.com/common/oauth2/v2.0/token";
var clientId = (p) =>
  process.env[
    p === "zoom"
      ? "ZOOM_OAUTH_CLIENT_ID"
      : p === "google"
        ? "GOOGLE_CLIENT_ID"
        : "MICROSOFT_CLIENT_ID"
  ];
var clientSecret = (p) =>
  process.env[
    p === "zoom"
      ? "ZOOM_OAUTH_CLIENT_SECRET"
      : p === "google"
        ? "GOOGLE_CLIENT_SECRET"
        : "MICROSOFT_CLIENT_SECRET"
  ];
function authorization(provider, state, verifier) {
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
var hashBase64 = (v) =>
  import_node_crypto2.default
    .createHash("sha256")
    .update(v)
    .digest("base64url");
async function exchange(provider, code, verifier) {
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
  return { ...tokens, expiresAt: Date.now() + tokens.expires_in * 1e3 };
}
async function token(uid, provider) {
  const ref = db().doc(`scheduler_private/${uid}_${provider}`),
    s = await ref.get();
  if (!s.exists) throw Error("Calendar connection is missing.");
  let t = unseal(s.data().tokens);
  if (t.expiresAt < Date.now() + 12e4) {
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
    t = { ...t, ...next, expiresAt: Date.now() + next.expires_in * 1e3 };
    await ref.update({ tokens: seal(t) });
  }
  return t.access_token;
}
async function refreshZoomToken(uid, ref) {
  const leaseRef = db().doc(`scheduler_token_locks/${uid}_zoom`);
  const leaseId = import_node_crypto2.default.randomUUID();
  const existing = await db().runTransaction(async (tx) => {
    const [saved, lease] = await Promise.all([tx.get(ref), tx.get(leaseRef)]);
    if (!saved.exists) throw Error("Reconnect your Zoom account.");
    const tokens = unseal(saved.data().tokens);
    if (tokens.expiresAt > Date.now() + 12e4) return tokens.access_token;
    if (lease.data()?.expiresAt > Date.now())
      throw Error("Zoom token refresh is in progress. Retry shortly.");
    tx.set(leaseRef, { leaseId, expiresAt: Date.now() + 6e4 });
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
        expiresAt: Date.now() + Number(next.expires_in) * 1e3,
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
async function connections(uid) {
  const s = await db()
    .collection("scheduler_connections")
    .where("ownerId", "==", uid)
    .get();
  return s.docs.map((d) => d.data().provider);
}
async function busyForHost(uid, start, end) {
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
async function removeExternal(uid, ids = {}) {
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
      signal: AbortSignal.timeout(2e4),
    });
    if (!r.ok && r.status !== 404 && r.status !== 410)
      throw Error("Could not remove a previous calendar event.");
  }
}
async function createExternal(booking, id, progress = async () => {}) {
  const ids = { ...booking.externalIds },
    providers = await connections(booking.ownerId);
  let meetingUrl = booking.meetingUrl || booking.locationValue || "";
  if (booking.location === "zoom" && !booking.locationValue && !ids.zoom) {
    const personal = providers.includes("zoom");
    const zoom = await ensureZoom(
      booking,
      id,
      void 0,
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
  for (const p of providers.filter((p2) => p2 !== "zoom")) {
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
        description: `Meeting with ${booking.attendeeName}.
${booking.notes || ""}`,
        start: { dateTime: new Date(booking.startAt).toISOString() },
        end: { dateTime: new Date(booking.endAt).toISOString() },
        attendees: (booking.participants
          ? confirmedParticipants(booking)
          : [{ email: booking.attendeeEmail }]
        ).map((p2) => ({ email: p2.email })),
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
          content: `Meeting with ${booking.attendeeName}.
${booking.notes || ""}
${meetingUrl}`,
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
        ).map((p2) => ({
          emailAddress: { address: p2.email, name: p2.name },
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
async function updateExternalAttendees(booking) {
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

// functions/index.js
if (!(0, import_app.getApps)().length) (0, import_app.initializeApp)();
var db2 = schedulerDatabase();
var region = process.env.FUNCTIONS_REGION || "asia-south1";
var calendarConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID,
);
var secrets = [
  "OAUTH_TOKEN_KEY",
  ...(process.env.GOOGLE_CLIENT_ID ? ["GOOGLE_CLIENT_SECRET"] : []),
  ...(process.env.ZOOM_CLIENT_ID ? ["ZOOM_CLIENT_SECRET"] : []),
  ...(process.env.ZOOM_OAUTH_CLIENT_ID ? ["ZOOM_OAUTH_CLIENT_SECRET"] : []),
  ...(process.env.JITSI_JWT_APP_ID ? ["JITSI_JWT_SECRET"] : []),
  ...(process.env.MICROSOFT_CLIENT_ID ? ["MICROSOFT_CLIENT_SECRET"] : []),
];
var origin = () => schedulerOrigin();
var opts = {
  region,
  enforceAppCheck: process.env.ENFORCE_APP_CHECK === "true",
  maxInstances: 20,
};
var collection = (name) => db2.collection(`scheduler_${name}`);
var bad = (message) => {
  throw new import_https9.HttpsError("invalid-argument", message);
};
var text = (v, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
function user(r) {
  if (!r.auth)
    throw new import_https9.HttpsError("unauthenticated", "Please sign in.");
  return r.auth.uid;
}
function verified(r) {
  const uid = user(r);
  if (!r.auth.token.email_verified)
    throw new import_https9.HttpsError(
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
var safeId = (v) => {
  if (typeof v !== "string" || !/^[a-zA-Z0-9_-]{1,120}$/.test(v))
    bad("Invalid identifier.");
  return v;
};
var wrap = (fn, withSecrets = false) =>
  (0, import_https9.onCall)(
    { ...opts, ...(withSecrets ? { secrets } : {}) },
    async (r) => {
      try {
        return await fn(r);
      } catch (e) {
        if (e instanceof import_https9.HttpsError) throw e;
        import_firebase_functions.logger.error(e.message);
        throw new import_https9.HttpsError(
          "internal",
          "The request could not be completed. Please try again or reconnect your calendar.",
        );
      }
    },
  );
var calendarWrap = (fn) => wrap(fn, true);
var slotWrap = (fn) =>
  wrap(
    fn,
    calendarConfigured ||
      Boolean(process.env.ZOOM_CLIENT_ID) ||
      Boolean(process.env.ZOOM_OAUTH_CLIENT_ID),
  );
async function throttle(r, kind, limit = 60) {
  const minute = Math.floor(Date.now() / 6e4),
    ip = r.rawRequest.ip || "unknown";
  const ref = collection("limits").doc(hash(`${ip}:${kind}:${minute}`));
  await db2.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if ((s.data()?.count || 0) >= limit)
      throw new import_https9.HttpsError(
        "resource-exhausted",
        "Too many requests. Please try again shortly.",
      );
    tx.set(ref, {
      count: (s.data()?.count || 0) + 1,
      expiresAt: new Date(Date.now() + 36e5),
    });
  });
}
function eventInput(v, uid) {
  const e = {
    ownerId: uid,
    title: text(v.title, 80),
    description: text(v.description, 2e3),
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
    capacity: [1, 1e3],
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
var schedulerAccess = wrap(async (r) => accessForUid(user(r)));
var schedulerWorkspace = wrap(async (r) => {
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
var schedulerAdminBookings = wrap(async (r) => {
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
var schedulerAttendeeDetails = wrap(async (request2) => {
  const uid = verified(request2),
    access = await requireHost(uid);
  const snapshot = await collection("bookings")
    .doc(safeId(request2.data?.id))
    .get();
  if (!snapshot.exists)
    throw new import_https9.HttpsError("not-found", "Booking not found.");
  const booking = snapshot.data();
  assertAttendeeAccess(uid, access, booking);
  if (booking.participants?.length) {
    if (!request2.data.participantUid)
      return attendeeRoster(snapshot.id, booking);
    const participant = booking.participants.find(
      (p) => p.uid === request2.data.participantUid,
    );
    if (!participant)
      throw new import_https9.HttpsError(
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
      (0, import_firestore5.getFirestore)(),
    );
  }
  return attendeeDetails(booking, (0, import_firestore5.getFirestore)());
});
var schedulerSaveProfile = wrap(async (r) => {
  const uid = await hostUser(r),
    v = r.data || {},
    slug = text(v.slug, 60).toLowerCase();
  if (
    !/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug) ||
    !text(v.name, 80) ||
    !import_luxon5.DateTime.now().setZone(v.timezone).isValid
  )
    bad(
      "Enter a name, a valid time zone and a link slug of 3\u201360 letters/numbers/hyphens.",
    );
  const profile = collection("hosts").doc(uid),
    slugRef = collection("slugs").doc(slug);
  await db2.runTransaction(async (tx) => {
    const [old, claim] = await Promise.all([tx.get(profile), tx.get(slugRef)]);
    if (claim.exists && claim.data().ownerId !== uid)
      throw new import_https9.HttpsError(
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
var schedulerSaveAvailability = wrap(async (r) => {
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
var schedulerSelectedUsers = wrap(async (r) => {
  await hostUser(r);
  return selectedUsers((0, import_firestore5.getFirestore)(), r.data?.uids);
});
var schedulerSearchUsers = wrap(async (r) => {
  await hostUser(r);
  return searchUsers((0, import_firestore5.getFirestore)(), r.data?.search);
});
var schedulerMyMeetings = wrap(async (r) => {
  const uid = verified(r);
  const users = await (0, import_firestore5.getFirestore)()
    .collection("Users")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (users.size !== 1)
    throw new import_https9.HttpsError(
      "permission-denied",
      "A registered Users account is required.",
    );
  const pages = await Promise.all([
    collection("bookings")
      .where("participantUids", "array-contains", uid)
      .get(),
    collection("bookings").where("attendeeUid", "==", uid).get(),
  ]);
  const meetings = /* @__PURE__ */ new Map();
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
var schedulerJoinMeeting = calendarWrap(async (r) => {
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
    throw new import_https9.HttpsError(
      "unauthenticated",
      "Sign in with a verified registered account for this meeting room.",
    );
  const verifiedUid =
    r.auth?.token.email_verified && r.auth.token.email?.toLowerCase() === email
      ? r.auth.uid
      : null;
  const participantUid = verifiedUid || `guest_${hash(id)}`,
    token2 = import_node_crypto3.default.randomBytes(32).toString("base64url");
  const answers = Array.isArray(input.answers)
    ? input.answers.slice(0, 10).map((a) => text(a, 1500))
    : [];
  if ((event.questions || []).some((q, i) => q.required && !answers[i]))
    bad("Please answer the required questions.");
  await requireHost(event.ownerId);
  const result = await db2.runTransaction(async (tx) => {
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
        throw new import_https9.HttpsError(
          "already-exists",
          "This request identifier is already in use.",
        );
      return { registration: saved, booking: booking.data() };
    }
    if (
      !currentEvent.exists ||
      !currentEvent.data().active ||
      !(0, import_node_util.isDeepStrictEqual)(currentEvent.data(), event)
    )
      throw new import_https9.HttpsError(
        "aborted",
        "Meeting settings changed. Reload and try again.",
      );
    if (booking.data().startAt <= Date.now() + event.minNotice * 6e4)
      throw new import_https9.HttpsError(
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
      notes: text(input.notes, 2e3),
      tokenHash: hash(token2),
      tokenCipher: seal({ token: token2 }),
      createdAt: Date.now(),
    };
    queueRosterSync(tx, bookingRef, b, participants);
    if (verifiedUid)
      tx.update(bookingRef, {
        participantUids: import_firestore5.FieldValue.arrayUnion(verifiedUid),
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
          text: `You are registered for ${b.eventTitle}.
View joining details or cancel: ${origin()}/registration/${id}?token=${encodeURIComponent(token2)}`,
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
var schedulerRegistration = wrap(async (r) => {
  await throttle(r, "registration", 60);
  const ref = collection("registrations").doc(safeId(r.data?.id)),
    token2 = text(r.data?.token, 200);
  return db2.runTransaction(async (tx) => {
    const registration = await tx.get(ref);
    if (
      !registration.exists ||
      !token2 ||
      hash(token2) !== registration.data().tokenHash
    )
      throw new import_https9.HttpsError(
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
      if (Date.now() >= booking.startAt - booking.cancelHours * 36e5)
        throw new import_https9.HttpsError(
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
var schedulerSearchHosts = wrap(async (r) => {
  await hostUser(r);
  return searchHosts(
    (0, import_firestore5.getFirestore)(),
    db2,
    r.data?.search,
  );
});
var schedulerRespondInvitation = wrap(async (r) => {
  const uid = verified(r),
    ref = collection("bookings").doc(safeId(r.data?.id));
  const users = await (0, import_firestore5.getFirestore)()
    .collection("Users")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (users.size !== 1)
    throw new import_https9.HttpsError(
      "permission-denied",
      "A registered Users account is required.",
    );
  await db2.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists)
      throw new import_https9.HttpsError("not-found", "Invitation not found.");
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
var schedulerRoom = wrap(async (r) => {
  const uid = verified(r),
    snap = await collection("bookings").doc(safeId(r.data?.id)).get();
  if (!snap.exists || !canEnterRoom(snap.data(), uid))
    throw new import_https9.HttpsError(
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
var schedulerSaveEvent = slotWrap(async (r) => {
  const uid = await hostUser(r),
    id = r.data.id
      ? safeId(r.data.id)
      : import_node_crypto3.default.randomUUID(),
    ref = collection("events").doc(id);
  const participantUids = selectedUids(r.data.participantUids),
    resolved = await resolveParticipants(
      participantUids,
      (0, import_firestore5.getFirestore)(),
    );
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
        "Host-specific booking requires 1\u201320 hosts and no preassigned invitees.",
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
      throw new import_https9.HttpsError(
        "permission-denied",
        "This event belongs to another host.",
      );
    const comparable = {
      assignmentMode: "named",
      teamHostUids: [],
      ...existing.data(),
    };
    if ((0, import_node_util.isDeepStrictEqual)(comparable, data))
      return { id };
    throw new import_https9.HttpsError(
      "failed-precondition",
      "Cancel the saved meeting and create a new meeting to change its settings or invitees.",
    );
  }
  const start = data.fixedStartAt,
    end = start + data.duration * 6e4,
    lockStart = start - data.bufferBefore * 6e4,
    lockEnd = end + data.bufferAfter * 6e4;
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
            const date = import_luxon5.DateTime.fromMillis(start, {
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
  await db2.runTransaction(async (tx) => {
    const [old, currentHost, assigned, rotation] = await Promise.all([
      tx.get(ref),
      tx.get(collection("hosts").doc(uid)),
      tx.get(bookingRef),
      tx.get(rotationRef),
    ]);
    if (old.data()?.deletedAt)
      throw new import_https9.HttpsError(
        "failed-precondition",
        "This event was deleted.",
      );
    if (old.exists && old.data().ownerId !== uid)
      throw new import_https9.HttpsError(
        "permission-denied",
        "This event belongs to another host.",
      );
    if (assigned.exists) {
      if ((0, import_node_util.isDeepStrictEqual)(old.data(), data)) return;
      throw new import_https9.HttpsError(
        "already-exists",
        "The meeting was already created.",
      );
    }
    if (
      !currentHost.exists ||
      !(0, import_node_util.isDeepStrictEqual)(currentHost.data(), organizer)
    )
      throw new import_https9.HttpsError(
        "aborted",
        "Host settings changed. Try again.",
      );
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
              (0, import_node_util.isDeepStrictEqual)(hostNow.data(), c.host) &&
              !confirmed.some((b) =>
                overlap(
                  { start: lockStart, end: lockEnd },
                  { start: b.lockStart, end: b.lockEnd },
                ),
              ) &&
              confirmed.filter(
                (b) =>
                  import_luxon5.DateTime.fromMillis(b.startAt, {
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
        throw new import_https9.HttpsError(
          "already-exists",
          "No selected host is available at this time. Check calendars, weekly hours and daily booking limits.",
        );
      for (const l of locks)
        tx.set(
          l,
          {
            version: import_firestore5.FieldValue.increment(1),
            updatedAt: Date.now(),
          },
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
          ? `meetly-${import_node_crypto3.default.randomBytes(24).toString("hex")}`
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
                text: `You are invited to ${data.title} with ${chosen.host.name}.
${import_luxon5.DateTime.fromMillis(start, { zone: organizer.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}
Accept or decline: ${origin()}/book/${organizer.slug}/${id}
Joining details are shared after you accept.`,
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
                text: `${data.title}
Assigned host: ${chosen.host.name}
${import_luxon5.DateTime.fromMillis(start, { zone: organizer.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}
Invited users: ${resolved.map((p) => p.name).join(", ")}
View invitations and bookings: ${origin()}/bookings`,
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
var schedulerDeleteEvent = wrap(async (r) => {
  const uid = await hostUser(r);
  const ref = collection("events").doc(safeId(r.data.id));
  await db2.runTransaction(async (tx) => {
    const [event, bookings] = await Promise.all([
      tx.get(ref),
      tx.get(collection("bookings").where("eventId", "==", ref.id)),
    ]);
    if (!event.exists)
      throw new import_https9.HttpsError("not-found", "Event not found.");
    if (event.data().ownerId !== uid)
      throw new import_https9.HttpsError(
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
      throw new import_https9.HttpsError(
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
var schedulerPublicPage = wrap(async (r) => {
  await throttle(r, "page");
  const s = await collection("slugs").doc(safeId(r.data.slug)).get();
  if (!s.exists)
    throw new import_https9.HttpsError("not-found", "Booking page not found.");
  const host = await collection("hosts").doc(s.data().ownerId).get();
  if (!host.exists)
    throw new import_https9.HttpsError("not-found", "Host not found.");
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
var schedulerPublicEvent = wrap(async (r) => {
  await throttle(r, "page");
  const s = await collection("events").doc(safeId(r.data.eventId)).get();
  if (!s.exists || !s.data().active)
    throw new import_https9.HttpsError("not-found", "Event unavailable.");
  const h = await collection("hosts").doc(s.data().ownerId).get();
  if (!h.exists)
    throw new import_https9.HttpsError("not-found", "Host unavailable.");
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
    throw new import_https9.HttpsError(
      "not-found",
      "This event is unavailable.",
    );
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
    !import_luxon5.DateTime.fromISO(date, { zone: host.timezone }).isValid
  )
    bad("Invalid date.");
  const day = import_luxon5.DateTime.fromISO(date, { zone: host.timezone }),
    start = day.startOf("day").toMillis(),
    end = day.endOf(wholeMonth ? "month" : "day").toMillis();
  const query = collection("bookings")
    .where("ownerId", "==", hostId)
    .where("startAt", ">=", start - 864e5)
    .where("startAt", "<=", end + 864e5);
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
      throw new import_https9.HttpsError(
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
    throw new import_https9.HttpsError(
      "failed-precondition",
      "This host must connect the meeting's calendar provider before offering times.",
    );
  }
  const [booked, busy] = await Promise.all([
    query.get(),
    busyForHost(hostId, start - 864e5, end + 864e5),
  ]);
  const existing = booked.docs
    .filter((d) => d.id !== ignoreId && d.data().status === "confirmed")
    .map((d) => d.data());
  const today = existing.filter(
    (b) =>
      import_luxon5.DateTime.fromMillis(b.startAt, {
        zone: host.timezone,
      }).toISODate() === date,
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
var schedulerSlots = slotWrap(async (r) => {
  await throttle(r, "slots", 120);
  const event = await collection("events").doc(safeId(r.data.eventId)).get();
  if (!event.exists || !event.data().active) bad("Event is unavailable.");
  if (event.data().schedulingMode === "host-slots") {
    const data = event.data();
    const hostIds = participatingHosts(data.ownerId, data.teamHostUids || []);
    const snapshots = await db2.getAll(
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
            import_luxon5.DateTime.fromMillis(s.startAt, {
              zone: profiles.get(s.hostUid).timezone,
            }).toISODate() === group.date,
        );
        try {
          const c2 = await context(event.id, group.date, null, group.hostUid);
          return {
            slots: c2.slots,
            diagnostics: rows.map((s) => ({
              hostUid: group.hostUid,
              hostName: c2.host.name,
              startAt: s.startAt,
              reason: hostSlotReason(s, data, c2),
            })),
          };
        } catch (error) {
          import_firebase_functions.logger.warn(
            "Team host availability check failed",
            {
              eventId: event.id,
              hostUid: group.hostUid,
              code: error.code || error.status || "unknown",
            },
          );
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
  if (r.data.month !== void 0) {
    if (!/^\d{4}-\d{2}$/.test(r.data.month))
      bad("Choose a valid calendar month.");
    const requested = import_luxon5.DateTime.fromISO(`${r.data.month}-01`, {
      zone: "UTC",
    });
    if (!requested.isValid) bad("Choose a valid calendar month.");
    if (
      requested.endOf("month").toMillis() < Date.now() - 864e5 ||
      (event.data().schedulingMode !== "fixed" &&
        requested.toMillis() >
          Date.now() + (event.data().horizonDays + 2) * 864e5)
    )
      return { timezone: "UTC", slots: [] };
    const c2 = await context(event.id, `${r.data.month}-01`, null, null, true);
    const slots = slotsForMonth({
      month: r.data.month,
      host: c2.host,
      event: c2.event,
      existing: c2.existing,
      busy: c2.busy,
    }).map((slot) => ({ ...slot, hostUid: c2.hostId, hostName: c2.host.name }));
    return {
      timezone: c2.host.timezone,
      slots,
      hosts: [{ uid: c2.hostId, name: c2.host.name, organizer: true }],
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
  const token2 = text(r.data.token, 200);
  if (!token2 || hash(token2) !== b.tokenHash)
    throw new import_https9.HttpsError(
      "permission-denied",
      "This booking link is invalid.",
    );
}
var schedulerGetBooking = wrap(async (r) => {
  await throttle(r, "manage");
  const id = safeId(r.data.id),
    s = await collection("bookings").doc(id).get();
  if (!s.exists)
    throw new import_https9.HttpsError("not-found", "Booking not found.");
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
    if (!s.exists)
      throw new import_https9.HttpsError("not-found", "Booking not found.");
    old = s.data();
    await manageAllowed(r, old);
    if (
      old.status !== "confirmed" ||
      Date.now() > old.startAt - old.cancelHours * 36e5
    )
      throw new import_https9.HttpsError(
        "failed-precondition",
        "The rescheduling window has closed.",
      );
  }
  if (v.timezone && !import_luxon5.DateTime.now().setZone(v.timezone).isValid)
    bad("Invalid attendee time zone.");
  const eventId = old?.eventId || v.eventId,
    startAt = Number(v.startAt);
  if (!Number.isFinite(startAt)) bad("Choose a valid time.");
  const ev = await collection("events").doc(safeId(eventId)).get();
  if (!ev.exists) bad("Event is unavailable.");
  if (ev.data().participantUids?.length)
    throw new import_https9.HttpsError(
      "permission-denied",
      "This meeting already has assigned attendees. Sign in to My meetings.",
    );
  const attendee = await assertBookingAudience(ev.data(), r);
  if (
    old &&
    ev.data().audience === "registered" &&
    old.attendeeUid !== attendee.uid
  )
    throw new import_https9.HttpsError(
      "permission-denied",
      "Sign in with the account that originally booked this meeting.",
    );
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
        throw new import_https9.HttpsError(
          "already-exists",
          "Request identifier is already used.",
        );
      const token3 = unseal(b.tokenCipher).token;
      return {
        id: s.id,
        token: token3,
        url: `${origin()}/manage/${s.id}?token=${encodeURIComponent(token3)}`,
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
  const date = import_luxon5.DateTime.fromMillis(startAt, {
      zone: hs.data().timezone,
    }).toISODate(),
    c = await context(eventId, date, old ? ref.id : null, selectedHostId);
  if (JSON.stringify(c.event) !== JSON.stringify(ev.data()))
    throw new import_https9.HttpsError(
      "aborted",
      "Meeting settings changed. Refresh and try again.",
    );
  if (!c.slots.some((s) => s.start === startAt))
    throw new import_https9.HttpsError(
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
    throw new import_https9.HttpsError(
      "failed-precondition",
      "This host must connect Zoom or provide a Zoom meeting link.",
    );
  }
  if (
    c.event.location === "google-meet" &&
    !c.event.locationValue &&
    !ps.includes("google")
  )
    throw new import_https9.HttpsError(
      "failed-precondition",
      "This host must connect Google Calendar first.",
    );
  if (c.event.location === "teams" && !ps.includes("microsoft"))
    throw new import_https9.HttpsError(
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
    token2 = old
      ? unseal(old.tokenCipher).token
      : import_node_crypto3.default.randomBytes(32).toString("base64url");
  ref = ref || collection("bookings").doc(id);
  const event = c.event,
    endAt = startAt + event.duration * 6e4,
    lockStart = startAt - event.bufferBefore * 6e4,
    lockEnd = endAt + event.bufferAfter * 6e4;
  const dates = [
    .../* @__PURE__ */ new Set([
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
    notes: text(v.notes ?? old?.notes, 2e3),
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
    tokenHash: hash(token2),
    tokenCipher: old?.tokenCipher || seal({ token: token2 }),
    syncStatus: "pending",
    externalIds: {},
    meetingUrl:
      event.location === "meetly"
        ? `${origin()}/room/${id}`
        : event.locationValue,
    roomKey:
      event.location === "meetly"
        ? `meetly-${import_node_crypto3.default.randomBytes(24).toString("hex")}`
        : null,
    createdAt: old?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  const reserved = await db2.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (!old && current.exists) {
      if (
        current.data().attendeeEmail === attendeeEmail &&
        current.data().startAt === startAt &&
        current.data().eventId === eventId &&
        current.data().ownerId === c.hostId
      )
        return current.data();
      throw new import_https9.HttpsError(
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
      throw new import_https9.HttpsError(
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
      throw new import_https9.HttpsError(
        "failed-precondition",
        "Event is unavailable.",
      );
    if (JSON.stringify(hostNow.data()) !== JSON.stringify(c.host))
      throw new import_https9.HttpsError(
        "aborted",
        "Host availability changed. Choose a time again.",
      );
    if (JSON.stringify(eventNow.data()) !== JSON.stringify(event))
      throw new import_https9.HttpsError(
        "aborted",
        "Event settings changed. Choose a time again.",
      );
    const others = bookings.docs
      .filter((d) => d.id !== id && d.data().status === "confirmed")
      .map((d) => d.data());
    if (
      others.filter(
        (b) =>
          import_luxon5.DateTime.fromMillis(b.startAt, {
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
      throw new import_https9.HttpsError(
        "already-exists",
        "That time was just booked. Choose another time.",
      );
    for (const l of locks)
      tx.set(
        l,
        {
          version: import_firestore5.FieldValue.increment(1),
          updatedAt: Date.now(),
        },
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
var schedulerBook = calendarWrap((r) => book(r));
var schedulerReschedule = calendarWrap((r) => book(r, true));
var schedulerCancel = wrap(async (r) => {
  await throttle(r, "cancel", 20);
  const ref = collection("bookings").doc(safeId(r.data.id));
  await db2.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists)
      throw new import_https9.HttpsError("not-found", "Booking not found.");
    const b = s.data();
    await manageAllowed(r, b);
    if (b.status === "cancelled") return;
    if (
      r.auth?.uid !== b.ownerId &&
      r.auth?.uid !== b.organizerId &&
      Date.now() > b.startAt - b.cancelHours * 36e5
    )
      throw new import_https9.HttpsError(
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
var schedulerConnect = wrap(async (r) => {
  const uid = await hostUser(r),
    provider = r.data.provider;
  if (!["google", "microsoft", "zoom"].includes(provider))
    bad("Unsupported integration.");
  try {
    origin();
  } catch (e) {
    throw new import_https9.HttpsError("failed-precondition", e.message);
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
    throw new import_https9.HttpsError(
      "failed-precondition",
      `Configure ${provider === "zoom" ? "ZOOM_OAUTH_CLIENT_ID" : provider === "google" ? "GOOGLE_CLIENT_ID" : "MICROSOFT_CLIENT_ID"} and OAUTH_REDIRECT_URI in the Functions environment, then redeploy schedulerConnect.`,
    );
  const state = import_node_crypto3.default
      .randomBytes(32)
      .toString("base64url"),
    verifier = import_node_crypto3.default
      .randomBytes(48)
      .toString("base64url");
  const url = authorization(provider, state, verifier);
  await collection("oauth")
    .doc(hash(state))
    .set({ ownerId: uid, provider, verifier, expiresAt: Date.now() + 6e5 });
  return { url };
});
var schedulerOAuthCallback = (0, import_https9.onRequest)(
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
      await db2.runTransaction(async (tx) => {
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
      const batch = db2.batch();
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
      import_firebase_functions.logger.warn("Scheduler OAuth callback failed", {
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
var schedulerDisconnect = wrap(async (r) => {
  const uid = await hostUser(r);
  if (!["google", "microsoft", "zoom"].includes(r.data.provider))
    bad("Invalid provider.");
  const id = `${uid}_${r.data.provider}`;
  await db2.runTransaction(async (tx) => {
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
      throw new import_https9.HttpsError(
        "failed-precondition",
        "This calendar has upcoming synced bookings. Keep it connected until those bookings finish or are cancelled.",
      );
    tx.delete(collection("private").doc(id));
    tx.delete(collection("connections").doc(id));
  });
  return { ok: true };
});
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
    const time = import_luxon5.DateTime.fromMillis(b.startAt, {
      zone: person.staff ? b.timezone : b.attendeeTimezone || b.timezone,
    }).toFormat("cccc, dd LLL yyyy \xB7 HH:mm ZZZZ");
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
        ? `
Attendees: ${b.participants.map((p) => `${p.name} (${responseStatus(p)})`).join(", ")}`
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
            text: `${title}
${b.eventTitle}
${time}
With ${b.hostName}
${link}${roster}
View details: ${managementUrl}`,
          },
        });
    } catch (e) {
      if (e.code !== 6) throw e;
    }
  }
}
var schedulerSaveNotifications = wrap(async (r) => {
  const uid = await hostUser(r),
    access = await accessForUid(uid),
    eventRef = collection("events").doc(safeId(r.data?.eventId)),
    notifications = notificationSettings(r.data?.notifications);
  await db2.runTransaction(async (tx) => {
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
      throw new import_https9.HttpsError(
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
var schedulerMeetingEmails = wrap(async (r) => {
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
      throw new import_https9.HttpsError(
        "permission-denied",
        "Email not found for this meeting.",
      );
    const target = await (0, import_firestore5.getFirestore)()
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
                text: `You are invited to ${booking.eventTitle} with ${booking.hostName}.
${import_luxon5.DateTime.fromMillis(booking.startAt, { zone: booking.timezone }).toFormat("dd LLL yyyy HH:mm ZZZZ")}
Accept or decline: ${origin()}/my-meetings`,
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
    ? await (0, import_firestore5.getFirestore)().getAll(
        ...messages.docs.map((d) =>
          (0, import_firestore5.getFirestore)()
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
var schedulerDispatchMail = (0, import_firestore6.onDocumentCreated)(
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
      import_firebase_functions.logger.error(
        `Meeting email forwarding failed (${e.code || "unknown"}).`,
      );
      throw e;
    }
  },
);
var schedulerSyncBooking = (0, import_firestore6.onDocumentCreated)(
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
      leaseToken = import_node_crypto3.default.randomUUID();
    await db2.runTransaction(async (tx) => {
      const lease = await tx.get(leaseRef);
      if ((lease.data()?.expiresAt || 0) > Date.now())
        throw new Error(
          "Another synchronization is processing this meeting. Retry shortly.",
        );
      tx.set(leaseRef, { token: leaseToken, expiresAt: Date.now() + 12e4 });
    });
    try {
      const latest = await ref.get();
      if (!latest.exists) return;
      let b = latest.data();
      await event.data.ref.update({
        attempts: import_firestore5.FieldValue.increment(1),
      });
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
              await db2.runTransaction(async (tx) => {
                const latest2 = await tx.get(ref);
                if (latest2.data()?.revision === job.revision)
                  tx.update(ref, {
                    externalIds: progress.ids,
                    meetingUrl: progress.meetingUrl,
                  });
              });
            },
          );
          const applied = await db2.runTransaction(async (tx) => {
            const latest2 = await tx.get(ref);
            if (latest2.data()?.revision !== job.revision) return false;
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
        import_firebase_functions.logger.warn(
          `Calendar sync ${ref.id}: ${e.message}`,
        );
        await db2.runTransaction(async (tx) => {
          const s = await tx.get(ref);
          if (s.data()?.revision === job.revision)
            tx.update(ref, { syncStatus: "error" });
          tx.update(event.data.ref, { status: "error", message: e.message });
        });
        throw e;
      }
    } finally {
      await db2.runTransaction(async (tx) => {
        const lease = await tx.get(leaseRef);
        if (lease.data()?.token === leaseToken) tx.delete(leaseRef);
      });
    }
  },
);
var schedulerRetrySync = wrap(async (r) => {
  const uid = await hostUser(r),
    ref = collection("bookings").doc(safeId(r.data.id)),
    s = await ref.get();
  if (!s.exists || (s.data().ownerId !== uid && s.data().organizerId !== uid))
    throw new import_https9.HttpsError(
      "permission-denied",
      "Booking not found.",
    );
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
var schedulerReminders = (0, import_scheduler.onSchedule)(
  { schedule: "every 5 minutes", region, secrets, maxInstances: 1 },
  async () => {
    const now = Date.now(),
      s = await collection("bookings")
        .where("status", "==", "confirmed")
        .where("startAt", ">", now)
        .where("startAt", "<=", now + 864e5)
        .get();
    for (const d of s.docs) {
      const b = d.data(),
        minutes = (b.startAt - now) / 6e4;
      for (const offset of (await bookingEmailSettings(b)).reminderMinutes)
        if (minutes <= offset && minutes > offset - 10)
          await mail(b, d.id, `reminder_${offset}`);
    }
  },
);
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    schedulerAccess,
    schedulerAdminBookings,
    schedulerAttendeeDetails,
    schedulerBook,
    schedulerCancel,
    schedulerConnect,
    schedulerDeleteEvent,
    schedulerDisconnect,
    schedulerDispatchMail,
    schedulerGetBooking,
    schedulerJoinMeeting,
    schedulerMeetingEmails,
    schedulerMyMeetings,
    schedulerOAuthCallback,
    schedulerPublicEvent,
    schedulerPublicPage,
    schedulerRegistration,
    schedulerReminders,
    schedulerReschedule,
    schedulerRespondInvitation,
    schedulerRetrySync,
    schedulerRoom,
    schedulerSaveAvailability,
    schedulerSaveEvent,
    schedulerSaveNotifications,
    schedulerSaveProfile,
    schedulerSearchHosts,
    schedulerSearchUsers,
    schedulerSelectedUsers,
    schedulerSlots,
    schedulerSyncBooking,
    schedulerWorkspace,
  });
