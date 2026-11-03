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

test("re-saving the same preview deduplicates choices", () => {
  const rows = Array.from({ length: 60 }, (_, index) => ({
    hostUid: "a",
    date: `2026-12-${String((index % 30) + 1).padStart(2, "0")}`,
    time: index < 30 ? "09:00" : "10:00",
    timezone: "UTC",
  }));
  expect(expandTimeRanges([...rows, ...rows], 30)).toHaveLength(60);
});

test("expands and deduplicates more than 100 meeting slots without a count cap", () => {
  const rows = Array.from({ length: 120 }, (_, index) => ({
    hostUid: "a",
    date: new Date(Date.UTC(2027, 0, index + 1)).toISOString().slice(0, 10),
    time: "09:00",
    endTime: "11:00",
    timezone: "UTC",
  }));
  const slots = expandTimeRanges([...rows, ...rows], 30);
  expect(slots).toHaveLength(480);
  expect(slots.at(-1).time).toBe("10:30");
});
