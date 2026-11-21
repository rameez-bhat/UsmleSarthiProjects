import test from "node:test";
import assert from "node:assert/strict";
import {
  selfSchedulingHosts,
  assertSelfScheduling,
  replaceOwnSlots,
  hostAssignment,
} from "../self-scheduling.js";
import { normalizeHostSlots } from "../host-slots.js";
const event = {
  ownerId: "organizer",
  title: "Meeting",
  duration: 30,
  active: true,
  schedulingMode: "host-slots",
  teamHostUids: ["organizer", "a", "b"],
  selfSchedulingHostUids: ["a"],
  hostSlots: [
    { hostUid: "organizer", startAt: 1 },
    { hostUid: "a", startAt: 2 },
    { hostUid: "b", startAt: 3 },
  ],
};
test("delegation is opt-in for selected hosts on one meeting", () => {
  assert.deepEqual(selfSchedulingHosts(["a", "a"], event), ["a"]);
  for (const hosts of [["stranger"]])
    assert.throws(() => selfSchedulingHosts(hosts, event));
  assert.throws(() =>
    selfSchedulingHosts(["a"], { ...event, schedulingMode: "fixed" }),
  );
  assert.doesNotThrow(() => assertSelfScheduling(event, "a"));
  for (const value of [
    event,
    { ...event, selfSchedulingHostUids: [] },
    { ...event, active: false },
    { ...event, deletedAt: 1 },
  ]) {
    if (value === event) assert.throws(() => assertSelfScheduling(value, "b"));
    else assert.throws(() => assertSelfScheduling(value, "a"));
  }
});
test("a host may replace or remove only their own choices without changing other hosts", () => {
  const result = replaceOwnSlots(event, "a", [{ hostUid: "a", startAt: 4 }]);
  assert.deepEqual(result, [
    event.hostSlots[0],
    event.hostSlots[2],
    { hostUid: "a", startAt: 4 },
  ]);
  assert.deepEqual(replaceOwnSlots(event, "a", []), [
    event.hostSlots[0],
    event.hostSlots[2],
  ]);
  assert.throws(
    () => replaceOwnSlots(event, "a", [{ hostUid: "b", startAt: 5 }]),
    /only your own/,
  );
});
test("host-visible assignment contains only that host's slots and no private event fields", () => {
  const assignment = hostAssignment(
    "event",
    {
      ...event,
      hostPhones: { b: "private" },
      hostLocations: { b: { locationValue: "private" } },
      participantUids: ["student"],
    },
    "a",
  );
  assert.deepEqual(assignment.hostSlots, [event.hostSlots[1]]);
  assert.equal(assignment.hostPhones, undefined);
  assert.equal(assignment.participantUids, undefined);
});
test("authorized hosts may publish their slots later, while other selected hosts still need slots", () => {
  const profiles = new Map([["a", { name: "A", timezone: "UTC" }]]);
  assert.deepEqual(
    normalizeHostSlots([], ["a"], profiles, {
      ownerId: "organizer",
      selfSchedulingHostUids: ["a"],
    }),
    [],
  );
  assert.throws(() =>
    normalizeHostSlots([], ["a"], profiles, {
      ownerId: "organizer",
      selfSchedulingHostUids: [],
    }),
  );
});
