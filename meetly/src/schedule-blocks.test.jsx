import { test, expect } from "vitest";
import { compileScheduleBlocks, mergeScheduleDrafts } from "./schedule-blocks";
const block = (patch) => ({
  dateMode: "range",
  from: "2026-11-23",
  to: "2026-11-27",
  dates: [""],
  ranges: [{ start: "09:00", end: "11:00" }],
  ...patch,
});
test("multiple dates and single dates replace matching range days; the last block wins", () => {
  const result = compileScheduleBlocks(
    [
      block({}),
      block({
        dateMode: "multiple",
        dates: ["2026-11-24", "2026-11-26"],
        ranges: [
          { start: "14:00", end: "15:00" },
          { start: "20:00", end: "21:00" },
        ],
      }),
      block({
        dateMode: "single",
        dates: ["2026-11-26"],
        ranges: [{ start: "17:00", end: "18:00" }],
      }),
    ],
    "host",
    "UTC",
    30,
  );
  const times = (date) =>
    result.slots.filter((s) => s.date === date).map((s) => s.time);
  expect(times("2026-11-23")).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  expect(times("2026-11-24")).toEqual(["14:00", "14:30", "20:00", "20:30"]);
  expect(times("2026-11-26")).toEqual(["17:00", "17:30"]);
  const saved = [
    { hostUid: "host", date: "2026-11-26", time: "09:00" },
    { hostUid: "other", date: "2026-11-26", time: "09:00" },
    { hostUid: "host", date: "2026-12-01", time: "09:00" },
  ];
  const merged = mergeScheduleDrafts(saved, [{ ...result, hostUid: "host" }]);
  expect(merged).not.toContainEqual(saved[0]);
  expect(merged).toContainEqual(saved[1]);
  expect(merged).toContainEqual(saved[2]);
});
