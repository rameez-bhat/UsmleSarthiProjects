import test from "node:test";
import assert from "node:assert/strict";
import { slotsForMonth } from "../month-availability.js";
import { applyEventPolicy } from "../event-policy.js";
const now = Date.parse("2026-10-21T00:00:00Z");
const event = {
  schedulingMode: "recurring",
  duration: 30,
  minNotice: 0,
  horizonDays: 60,
  bufferBefore: 0,
  bufferAfter: 0,
  dailyLimit: 2,
  active: true,
};
const host = {
  timezone: "UTC",
  schedule: { 4: [{ start: "09:00", end: "10:00" }] },
  overrides: {},
};
test("calendar month includes exact fixed time outside weekly hours and preserves fixed horizon rules", () => {
  const start = Date.parse("2027-02-06T09:00:00Z");
  const slots = slotsForMonth({
    month: "2027-02",
    host,
    event: {
      ...event,
      schedulingMode: "fixed",
      fixedStartAt: start,
      horizonDays: 1,
    },
    now,
  });
  assert.deepEqual(slots, [{ start, end: start + 1800000 }]);
});
test("monthly availability highlights only conflict-free dates and enforces daily limits", () => {
  const start = Date.parse("2026-10-22T09:00:00Z");
  const slots = slotsForMonth({
    month: "2026-10",
    host,
    event: { ...event, dailyLimit: 1 },
    existing: [{ startAt: start, lockStart: start, lockEnd: start + 1800000 }],
    now,
  });
  assert.equal(
    slots.some((s) => new Date(s.start).toISOString().startsWith("2026-10-22")),
    false,
  );
  assert.equal(
    slots.some((s) => new Date(s.start).toISOString().startsWith("2026-10-29")),
    true,
  );
});
test("multiple published host times are valid in every meeting schedule category", () => {
  for (const schedulingMode of ["recurring", "fixed", "host-slots"]) {
    assert.deepEqual(
      applyEventPolicy(
        { schedulingMode, multipleHostTimes: true, audience: "anyone" },
        event,
        host,
        now,
      ),
      {
        schedulingMode: "host-slots",
        audience: "anyone",
        multipleHostTimes: true,
        scheduleCategory: schedulingMode,
      },
    );
  }
});
