import { test, expect } from "vitest";
import { hostScheduleOptions } from "./host-schedule-options";
for (const dateMode of ["single", "multiple", "range"]) {
  for (const timeMode of ["single", "multiple", "range"]) {
    test(`${dateMode} dates with ${timeMode} times retain host identity and duration`, () => {
      const result = hostScheduleOptions(
        {
          hostUid: "pawan",
          timezone: "Asia/Kolkata",
          dateMode,
          dates: ["2026-11-01", "2026-11-03"],
          from: "2026-11-01",
          to: "2026-11-03",
          timeMode,
          times: ["09:00", "14:00"],
          endTime: "11:30",
        },
        30,
      );
      const countDates = { single: 1, multiple: 2, range: 3 }[dateMode];
      const countTimes = { single: 1, multiple: 2, range: 5 }[timeMode];
      expect(result).toHaveLength(countDates * countTimes);
      expect(
        result.every(
          (slot) =>
            slot.hostUid === "pawan" && slot.timezone === "Asia/Kolkata",
        ),
      ).toBe(true);
      if (timeMode === "range")
        expect(
          result
            .filter((slot) => slot.date === result[0].date)
            .map((slot) => slot.time),
        ).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
    });
  }
}
test("invalid date and time ranges cannot silently publish alternatives", () => {
  const base = {
    hostUid: "host",
    timezone: "UTC",
    dateMode: "range",
    from: "2026-12-02",
    to: "2026-12-01",
    dates: [],
    timeMode: "range",
    times: ["09:00"],
    endTime: "11:00",
  };
  expect(() => hostScheduleOptions(base, 30)).toThrow();
  expect(() =>
    hostScheduleOptions(
      { ...base, dateMode: "single", dates: ["2026-12-01"], endTime: "" },
      30,
    ),
  ).toThrow();
  expect(() =>
    hostScheduleOptions({ ...base, to: "2028-01-01" }, 30),
  ).toThrow();
});
