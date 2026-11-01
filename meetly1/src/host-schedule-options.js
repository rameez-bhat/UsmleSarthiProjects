import { expandTimeRanges } from "./time-ranges";
export function hostScheduleOptions(config, duration) {
  let dates = config.dates.filter(Boolean);
  if (config.dateMode === "range") {
    const start = new Date(`${config.from}T00:00:00Z`),
      end = new Date(`${config.to}T00:00:00Z`);
    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end < start ||
      end - start > 365 * 86400000
    )
      throw new Error("Choose a date range of at most 366 days.");
    dates = [];
    for (let date = +start; date <= +end; date += 86400000)
      dates.push(new Date(date).toISOString().slice(0, 10));
  } else if (config.dateMode === "single") dates = dates.slice(0, 1);
  const times =
    config.timeMode === "multiple"
      ? config.times.filter(Boolean)
      : config.times.slice(0, 1).filter(Boolean);
  if (!dates.length || !times.length)
    throw new Error("Choose dates and times for this host.");
  if (config.timeMode === "range" && !config.endTime)
    throw new Error("Choose an end time for the range.");
  const rows = [...new Set(dates)].flatMap((date) =>
    [...new Set(times)].map((time) => ({
      hostUid: config.hostUid,
      date,
      time,
      timezone: config.timezone,
      ...(config.timeMode === "range" ? { endTime: config.endTime } : {}),
    })),
  );
  return expandTimeRanges(rows, duration);
}
