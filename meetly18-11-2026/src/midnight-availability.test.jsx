import { describe, it, expect } from "vitest";
import { fitsAvailabilityPreview } from "./host-availability-preview";
import { hostScheduleOptions } from "./host-schedule-options";
describe("midnight availability", () => {
  it("retains evening slots for every date in the requested range", () => {
    const host = {
      timezone: "Asia/Kolkata",
      schedule: Object.fromEntries(
        [1, 2, 3, 4, 5].map((day) => [
          day,
          [
            { start: "10:30", end: "16:00" },
            { start: "20:30", end: "00:00" },
          ],
        ]),
      ),
    };
    const slots = hostScheduleOptions(
      {
        hostUid: "host",
        timezone: "Asia/Kolkata",
        dateMode: "range",
        from: "2026-11-23",
        to: "2026-11-27",
        dates: [],
        timeMode: "range",
        times: ["09:00"],
        endTime: "23:58",
      },
      30,
    ).filter((slot) => fitsAvailabilityPreview(slot, host, 30));
    for (const date of [
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
    ]) {
      const times = slots
        .filter((slot) => slot.date === date)
        .map((slot) => slot.time);
      expect(times).toContain("20:30");
      expect(times).toContain("23:00");
      expect(times).not.toContain("16:00");
      expect(times).not.toContain("23:30");
    }
    expect(
      fitsAvailabilityPreview(
        { date: "2026-11-23", time: "23:30", timezone: "Asia/Kolkata" },
        host,
        30,
      ),
    ).toBe(true);
    expect(
      fitsAvailabilityPreview(
        { date: "2026-11-23", time: "23:45", timezone: "Asia/Kolkata" },
        host,
        30,
      ),
    ).toBe(false);
  });
});
