import { DateTime } from "luxon";
import { HttpsError } from "firebase-functions/v2/https";

export function normalizeHostSlots(input, hostIds, profiles, event) {
  if (!Array.isArray(input) || !input.length || input.length > 100) {
    throw new HttpsError(
      "invalid-argument",
      "Add between 1 and 100 host meeting times.",
    );
  }
  const seen = new Set();
  const slots = input.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new HttpsError("invalid-argument", "Invalid host meeting time.");
    const host = profiles.get(value.hostUid);
    const local = `${value.date}T${value.time}`;
    const start = DateTime.fromISO(local, {
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
      throw new HttpsError(
        "invalid-argument",
        "Choose a valid host, date and time for every slot.",
      );
    }
    const startAt = start.toMillis();
    // Saving a schedule is separate from accepting a booking. Retain old rows
    // during edits; booking-time checks hide expired/cutoff times.
    const key = `${value.hostUid}_${startAt}`;
    if (seen.has(key))
      throw new HttpsError("invalid-argument", "Remove duplicate host times.");
    seen.add(key);
    return {
      hostUid: value.hostUid,
      hostName: host.name,
      date: value.date,
      time: value.time,
      timezone: value.timezone || host.timezone,
      hostDate: DateTime.fromMillis(startAt, {
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
          slot.startAt - event.bufferBefore * 60000 <
            other.startAt + (event.duration + event.bufferAfter) * 60000 &&
          other.startAt - event.bufferBefore * 60000 <
            slot.startAt + (event.duration + event.bufferAfter) * 60000,
      )
    ) {
      throw new HttpsError(
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
    throw new HttpsError(
      "invalid-argument",
      "Add at least one time for every selected host.",
    );
  }
  return slots.sort((a, b) => a.startAt - b.startAt);
}

export function availableHostSlots({
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
        DateTime.fromMillis(s.startAt, { zone: host.timezone }).toISODate() ===
          date &&
        s.startAt > now &&
        s.startAt >= now + event.minNotice * 60000 &&
        !busy.some(
          (b) =>
            s.startAt - event.bufferBefore * 60000 < b.end &&
            b.start < s.startAt + (event.duration + event.bufferAfter) * 60000,
        ),
    )
    .map((s) => ({
      start: s.startAt,
      end: s.startAt + event.duration * 60000,
      hostUid: hostId,
      hostName: host.name,
      timezone: host.timezone,
    }));
}

// Organizer identity comes from verified server authentication, not request data.
export function participatingHosts(organizerUid, selected = []) {
  return [...new Set([organizerUid, ...selected])];
}

// Dates saved with a slot can become stale when a host changes profile timezone.
// Group each instant using the host's current zone, just as the booking endpoint does.
export function hostSlotGroups(event, profiles) {
  const groups = new Map();
  for (const slot of event.hostSlots || []) {
    const host = profiles.get(slot.hostUid);
    if (!host || !Number.isFinite(slot.startAt)) continue;
    const date = DateTime.fromMillis(slot.startAt, {
      zone: host.timezone,
    }).toISODate();
    const key = `${slot.hostUid}_${date}`;
    if (!groups.has(key)) groups.set(key, { hostUid: slot.hostUid, date });
  }
  return [...groups.values()];
}

export function hostSlotReason(slot, event, context, now = Date.now()) {
  if (slot.startAt <= now) return "past";
  if (slot.startAt < now + event.minNotice * 60000) return "minimum_notice";
  if (context.todayCount >= event.dailyLimit) return "daily_limit";
  const start = slot.startAt - event.bufferBefore * 60000;
  const end = slot.startAt + (event.duration + event.bufferAfter) * 60000;
  if (
    (context.existing || []).some((b) => start < b.lockEnd && b.lockStart < end)
  )
    return "existing_booking";
  if ((context.busy || []).some((b) => start < b.end && b.start < end))
    return "calendar_busy";
  return "available";
}
