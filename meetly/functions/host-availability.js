import { DateTime } from "luxon";

// A whole appointment must fit a host-local opening. An empty override closes the date.
export function fitsHostAvailability(slot, host, duration) {
  const start = DateTime.fromMillis(slot.startAt, {
    zone: host.timezone || "UTC",
  });
  const end = start.plus({ minutes: duration });
  if (!start.isValid || !end.isValid) return false;
  const date = start.toISODate();
  const ranges =
    host.overrides?.[date] ?? host.schedule?.[String(start.weekday)] ?? [];
  return ranges.some((range) => {
    const open = DateTime.fromISO(`${date}T${range.start}`, {
      zone: host.timezone || "UTC",
    });
    let close = DateTime.fromISO(`${date}T${range.end}`, {
      zone: host.timezone || "UTC",
    });
    if (range.end === "00:00") close = close.plus({ days: 1 });
    return open.isValid && close.isValid && start >= open && end <= close;
  });
}
export function remainingHostSlots(slots, conflicts) {
  const blocked = new Set(conflicts.map((s) => `${s.hostUid}|${s.startAt}`));
  return slots.filter((s) => !blocked.has(`${s.hostUid}|${s.startAt}`));
}
