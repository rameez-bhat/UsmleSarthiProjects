import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHostSlots, availableHostSlots } from "../host-slots.js";
const now = Date.parse("2026-10-19T00:00:00Z");
const event = {
  active: true,
  minNotice: 0,
  horizonDays: 60,
  duration: 30,
  bufferBefore: 0,
  bufferAfter: 10,
};
const hosts = new Map([
  ["a", { name: "Host A", timezone: "Asia/Kolkata" }],
  ["b", { name: "Host B", timezone: "America/New_York" }],
]);
test("host-specific dates preserve chosen host and absolute instant across display zones", () => {
  const slots = normalizeHostSlots(
    [
      {
        hostUid: "a",
        date: "2026-10-20",
        time: "09:00",
        timezone: "Asia/Kolkata",
      },
      {
        hostUid: "b",
        date: "2026-10-20",
        time: "09:00",
        timezone: "America/New_York",
      },
    ],
    ["a", "b"],
    hosts,
    event,
    now,
  );
  assert.equal(slots[0].startAt, Date.parse("2026-10-20T03:30:00Z"));
  assert.equal(slots[1].startAt, Date.parse("2026-10-20T13:00:00Z"));
  assert.equal(
    availableHostSlots({
      event: { ...event, hostSlots: slots },
      hostId: "b",
      date: "2026-10-20",
      host: hosts.get("b"),
      now,
    })[0].hostName,
    "Host B",
  );
});
test("unselected hosts, malformed rows, duplicates, overlapping buffers and missing host times are rejected", () => {
  const a = { hostUid: "a", date: "2026-10-20", time: "09:00" };
  for (const rows of [
    [null],
    [{ ...a, hostUid: "x" }],
    [a, a],
    [a, { ...a, time: "09:30" }],
  ])
    assert.throws(() => normalizeHostSlots(rows, ["a"], hosts, event, now));
  assert.throws(() => normalizeHostSlots([a], ["a", "b"], hosts, event, now));
});
test("server enforces cutoff, horizon, host identity, date and actual busy intervals", () => {
  const hostSlots = normalizeHostSlots(
    [{ hostUid: "a", date: "2026-10-20", time: "09:00" }],
    ["a"],
    hosts,
    event,
    now,
  );
  const options = {
    event: { ...event, hostSlots },
    hostId: "a",
    date: "2026-10-20",
    host: hosts.get("a"),
    now,
  };
  assert.equal(availableHostSlots(options).length, 1);
  assert.equal(
    availableHostSlots({
      ...options,
      busy: [
        {
          start: hostSlots[0].startAt + 30 * 60000,
          end: hostSlots[0].startAt + 60 * 60000,
        },
      ],
    }).length,
    0,
  );
  assert.equal(availableHostSlots({ ...options, hostId: "b" }).length, 0);
  assert.equal(
    availableHostSlots({ ...options, now: hostSlots[0].startAt + 1 }).length,
    0,
  );
});
test("nonexistent DST wall time is rejected and host-local day tracks timezone conversion", () => {
  assert.throws(() =>
    normalizeHostSlots(
      [{ hostUid: "b", date: "2026-03-08", time: "02:30" }],
      ["b"],
      hosts,
      { ...event, active: false },
      now,
    ),
  );
  const rows = normalizeHostSlots(
    [
      {
        hostUid: "a",
        date: "2026-10-20",
        time: "23:30",
        timezone: "America/New_York",
      },
    ],
    ["a"],
    hosts,
    event,
    now,
  );
  assert.equal(rows[0].hostDate, "2026-10-21");
});

test("organizer and selected hosts participate without duplicate organizer entries", async () => {
  const { participatingHosts } = await import("../host-slots.js");
  assert.deepEqual(participatingHosts("shafi", ["pawan"]), ["shafi", "pawan"]);
  assert.deepEqual(participatingHosts("shafi", ["shafi", "pawan", "pawan"]), [
    "shafi",
    "pawan",
  ]);
});

test("organizer can offer times without being required to publish a slot", () => {
  const rows = normalizeHostSlots(
    [{ hostUid: "b", date: "2026-10-20", time: "09:00" }],
    ["a", "b"],
    hosts,
    { ...event, ownerId: "a" },
    now,
  );
  assert.equal(rows[0].hostUid, "b");
});

test("host slot grouping uses the current profile zone after an organizer timezone change", async () => {
  const { hostSlotGroups } = await import("../host-slots.js");
  const event = {
    ownerId: "shafi",
    hostSlots: [
      {
        hostUid: "shafi",
        startAt: Date.parse("2026-12-02T01:00:00Z"),
        hostDate: "2026-12-02",
        date: "2026-12-02",
      },
      {
        hostUid: "pawan",
        startAt: Date.parse("2026-12-02T01:00:00Z"),
        hostDate: "2026-12-02",
      },
    ],
  };
  const profiles = new Map([
    ["shafi", { timezone: "America/Los_Angeles" }],
    ["pawan", { timezone: "Asia/Kolkata" }],
  ]);
  assert.deepEqual(hostSlotGroups(event, profiles), [
    { hostUid: "shafi", date: "2026-12-01" },
    { hostUid: "pawan", date: "2026-12-02" },
  ]);
});
test("diagnostics distinguish busy calendar, booking conflict, notice and daily limit", async () => {
  const { hostSlotReason } = await import("../host-slots.js");
  const slot = { startAt: now + 86400000 };
  const c = { todayCount: 0, busy: [], existing: [] };
  assert.equal(hostSlotReason(slot, event, c, now), "available");
  assert.equal(
    hostSlotReason(
      slot,
      event,
      { ...c, busy: [{ start: slot.startAt, end: slot.startAt + 1 }] },
      now,
    ),
    "calendar_busy",
  );
  assert.equal(
    hostSlotReason(
      slot,
      event,
      {
        ...c,
        existing: [{ lockStart: slot.startAt, lockEnd: slot.startAt + 1 }],
      },
      now,
    ),
    "existing_booking",
  );
  assert.equal(
    hostSlotReason(
      slot,
      { ...event, dailyLimit: 1 },
      { ...c, todayCount: 1 },
      now,
    ),
    "daily_limit",
  );
  assert.equal(
    hostSlotReason(slot, { ...event, minNotice: 2000 }, c, now),
    "minimum_notice",
  );
});

test("saving explicit dates ignores rolling notice/horizon while booking still enforces cutoff and past", () => {
  const rows = normalizeHostSlots(
    [
      { hostUid: "a", date: "2026-10-18", time: "09:00" },
      { hostUid: "a", date: "2026-10-19", time: "09:00" },
      { hostUid: "a", date: "2027-10-20", time: "09:00" },
    ],
    ["a"],
    hosts,
    { ...event, minNotice: 1440, horizonDays: 1 },
    now,
  );
  const config = { ...event, minNotice: 1440, horizonDays: 1, hostSlots: rows };
  const options = { event: config, hostId: "a", host: hosts.get("a"), now };
  assert.equal(
    availableHostSlots({ ...options, date: "2026-10-18" }).length,
    0,
  );
  assert.equal(
    availableHostSlots({ ...options, date: "2026-10-19" }).length,
    0,
  );
  assert.equal(
    availableHostSlots({ ...options, date: "2027-10-20" }).length,
    1,
  );
  assert.equal(
    availableHostSlots({
      ...options,
      event: { ...config, minNotice: 0 },
      date: "2026-10-19",
    }).length,
    1,
  );
});
