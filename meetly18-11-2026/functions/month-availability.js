import { DateTime } from "luxon";
import { slotsForDay } from "./scheduling.js";

// Include boundary days: attendee and host display months may differ by a day.
export function slotsForMonth({
  month,
  host,
  event,
  existing = [],
  busy = [],
  now = Date.now(),
}) {
  const first = DateTime.fromISO(`${month}-01`, { zone: host.timezone });
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
        DateTime.fromMillis(b.startAt, { zone: host.timezone }).toISODate() ===
        date,
    ).length;
    if (bookedToday >= event.dailyLimit) continue;
    slots.push(...slotsForDay({ date, host, event, busy: blocked, now }));
  }
  return slots;
}
