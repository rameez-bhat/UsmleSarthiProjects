export function expandTimeRanges(rows, duration) {
  const minutes = Number(duration);
  if (!Number.isInteger(minutes) || minutes < 15)
    throw new Error("Choose a valid meeting duration.");
  const result = rows.flatMap((row) => {
    if (!row.endTime) return [row];
    const toMinutes = (value) => {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || ""))
        throw new Error("Choose a valid start and end time.");
      const [hour, minute] = value.split(":").map(Number);
      return hour * 60 + minute;
    };
    const start = toMinutes(row.time),
      end = toMinutes(row.endTime);
    if (end <= start || end - start < minutes)
      throw new Error(
        "The range must fit at least one full meeting on the same date.",
      );
    const slots = [];
    for (let time = start; time + minutes <= end; time += minutes) {
      const { endTime, ...slot } = row;
      slots.push({
        ...slot,
        time: `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`,
      });
    }
    return slots;
  });
  const unique = [
    ...new Map(
      result.map((row) => [
        `${row.hostUid}|${row.date}|${row.time}|${row.timezone}`,
        row,
      ]),
    ).values(),
  ];
  if (unique.length > 100)
    throw new Error("Use at most 100 meeting slots per event.");
  return unique;
}
