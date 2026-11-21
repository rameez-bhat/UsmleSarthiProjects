import { test, expect } from "vitest";
import { fitsAvailabilityPreview } from "./host-availability-preview";
test("preview uses host timezone and honours closed overrides", () => {
  const host = {
    timezone: "Asia/Kolkata",
    schedule: { 1: [{ start: "09:00", end: "11:00" }] },
    overrides: { "2026-12-14": [] },
  };
  expect(
    fitsAvailabilityPreview(
      { date: "2026-12-07", time: "04:00", timezone: "UTC" },
      host,
      30,
    ),
  ).toBe(true);
  expect(
    fitsAvailabilityPreview(
      { date: "2026-12-14", time: "04:00", timezone: "UTC" },
      host,
      30,
    ),
  ).toBe(false);
  expect(
    fitsAvailabilityPreview(
      { date: "2026-12-07", time: "05:15", timezone: "UTC" },
      host,
      30,
    ),
  ).toBe(false);
});
