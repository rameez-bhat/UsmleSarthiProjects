import { test, expect } from "vitest";
import { expandTimeRanges } from "./time-ranges";
test("range generates full duration-sized appointments", () => {
  const result = expandTimeRanges(
    [
      {
        hostUid: "a",
        date: "2026-10-29",
        time: "09:00",
        endTime: "11:30",
        timezone: "Asia/Kolkata",
      },
    ],
    30,
  );
  expect(result.map((s) => s.time)).toEqual([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
  ]);
  expect(
    result.every((s) => s.hostUid === "a" && s.date === "2026-10-29"),
  ).toBe(true);
  expect(() =>
    expandTimeRanges([{ time: "11:30", endTime: "09:00" }], 30),
  ).toThrow();
});

test("re-saving the same preview does not count duplicate choices against the limit", () => {
  const rows = Array.from({ length: 60 }, (_, index) => ({
    hostUid: "a",
    date: `2026-12-${String((index % 30) + 1).padStart(2, "0")}`,
    time: index < 30 ? "09:00" : "10:00",
    timezone: "UTC",
  }));
  expect(expandTimeRanges([...rows, ...rows], 30)).toHaveLength(60);
});
