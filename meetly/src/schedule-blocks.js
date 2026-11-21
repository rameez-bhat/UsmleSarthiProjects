import { hostScheduleOptions } from "./host-schedule-options";
export function compileScheduleBlocks(blocks, hostUid, timezone, duration) {
  const byDate = new Map();
  for (const block of blocks) {
    const dirty =
      block.dateMode === "range"
        ? !!(block.from || block.to)
        : block.dates.some(Boolean);
    if (!dirty) continue;
    if (!block.ranges.length)
      throw new Error("Add at least one time range to each schedule block.");
    const [first, ...rest] = block.ranges;
    const rows = hostScheduleOptions(
      {
        hostUid,
        timezone,
        dateMode: block.dateMode,
        dates: block.dates,
        from: block.from,
        to: block.to,
        timeMode: "range",
        times: [first.start],
        endTime: first.end,
        extraTimeRanges: rest,
        extraRanges: [],
      },
      duration,
    );
    const dates = [...new Set(rows.map((row) => row.date))];
    for (const date of dates)
      byDate.set(
        date,
        rows.filter((row) => row.date === date),
      );
  }
  return {
    slots: [...byDate.values()].flat(),
    replaceDates: [...byDate.keys()],
  };
}
export function mergeScheduleDrafts(saved, drafts) {
  return [
    ...saved.filter(
      (slot) =>
        !drafts.some(
          (draft) =>
            draft.hostUid === slot.hostUid &&
            draft.replaceDates?.includes(slot.date),
        ),
    ),
    ...drafts.flatMap((draft) => draft.slots || []),
  ];
}
