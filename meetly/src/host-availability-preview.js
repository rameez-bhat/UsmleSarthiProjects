import { wallTimeToMillis } from "./shared/utils";
export function fitsAvailabilityPreview(slot, host, duration) {
  const zone = host.timezone || "UTC";
  const start = wallTimeToMillis(slot.date, slot.time, slot.timezone || zone);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })
      .formatToParts(new Date(start))
      .map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const weekday =
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) +
    1;
  const ranges =
    host.overrides?.[date] ?? host.schedule?.[String(weekday)] ?? [];
  const nextDate = new Date(`${date}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const tomorrow = nextDate.toISOString().slice(0, 10);
  // Midnight as an opening's end means the end of this day.
  return ranges.some(
    (range) =>
      start >= wallTimeToMillis(date, range.start, zone) &&
      start + duration * 60000 <=
        wallTimeToMillis(
          range.end === "00:00" ? tomorrow : date,
          range.end,
          zone,
        ),
  );
}
