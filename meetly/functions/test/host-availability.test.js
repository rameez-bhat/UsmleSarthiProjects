import test from "node:test";
import assert from "node:assert/strict";
import {
  fitsHostAvailability,
  remainingHostSlots,
} from "../host-availability.js";
const host = {
  timezone: "Asia/Kolkata",
  schedule: { 1: [{ start: "09:00", end: "11:00" }] },
  overrides: { "2026-12-14": [] },
};
test("weekly openings, full duration and closed date overrides filter host choices", () => {
  const slot = (date) => ({ startAt: Date.parse(date) });
  assert.equal(
    fitsHostAvailability(slot("2026-12-07T04:00:00Z"), host, 30),
    true,
  );
  assert.equal(
    fitsHostAvailability(slot("2026-12-07T05:15:00Z"), host, 30),
    false,
  );
  assert.equal(
    fitsHostAvailability(slot("2026-12-08T04:00:00Z"), host, 30),
    false,
  );
  assert.equal(
    fitsHostAvailability(slot("2026-12-14T04:00:00Z"), host, 30),
    false,
  );
});
test("explicit date override opens an otherwise closed day", () => {
  assert.equal(
    fitsHostAvailability(
      { startAt: Date.parse("2026-12-08T04:00Z") },
      {
        ...host,
        overrides: { "2026-12-08": [{ start: "09:00", end: "10:00" }] },
      },
      30,
    ),
    true,
  );
});
test("conflict removal retains other times for the same host and other hosts at that instant", () => {
  const slots = [
    { hostUid: "a", startAt: 1 },
    { hostUid: "a", startAt: 2 },
    { hostUid: "b", startAt: 1 },
  ];
  assert.deepEqual(remainingHostSlots(slots, [slots[0]]), [slots[1], slots[2]]);
  assert.deepEqual(remainingHostSlots(slots, slots), []);
});
test("evening availability ending at midnight includes evening appointments", () => {
  const evening = {
    timezone: "Asia/Kolkata",
    schedule: {
      1: [
        { start: "10:30", end: "16:00" },
        { start: "20:30", end: "00:00" },
      ],
    },
  };
  for (const [time, expected] of [
    ["15:30", true],
    ["16:00", false],
    ["20:00", false],
    ["20:30", true],
    ["23:30", true],
    ["23:45", false],
  ]) {
    assert.equal(
      fitsHostAvailability(
        { startAt: Date.parse(`2026-11-23T${time}:00+05:30`) },
        evening,
        30,
      ),
      expected,
      time,
    );
  }
});
