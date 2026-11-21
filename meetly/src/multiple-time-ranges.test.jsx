import { test, expect } from "vitest";
import { hostScheduleOptions } from "./host-schedule-options";
test("each date range expands its own multiple windows, including midnight", () => {
  const rows = hostScheduleOptions(
    {
      hostUid: "a",
      timezone: "Asia/Kolkata",
      dateMode: "range",
      dates: [],
      from: "2026-11-23",
      to: "2026-11-24",
      timeMode: "range",
      times: ["10:30"],
      endTime: "16:00",
      extraTimeRanges: [{ start: "20:30", end: "00:00" }],
      extraRanges: [
        {
          from: "2026-11-26",
          to: "2026-11-27",
          start: "09:00",
          end: "10:00",
          extraTimeRanges: [{ start: "17:00", end: "18:00" }],
        },
      ],
    },
    30,
  );
  const times = (date) =>
    rows.filter((s) => s.date === date).map((s) => s.time);
  expect(times("2026-11-23")).toHaveLength(18);
  expect(times("2026-11-24")).toContain("23:30");
  expect(times("2026-11-26")).toEqual(["09:00", "09:30", "17:00", "17:30"]);
  expect(times("2026-11-25")).toEqual([]);
  expect(rows).toHaveLength(44);
});
