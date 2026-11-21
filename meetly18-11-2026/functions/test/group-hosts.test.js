import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isGroupHostEnabled,
  activeGroupEvent,
} from "../../shared/group-hosts.js";
import { normalizeHostSlots } from "../host-slots.js";
test("group off hosts, including the organizer, are hidden without deleting their saved times", () => {
  const event = {
    eventKind: "group",
    ownerId: "owner",
    teamHostUids: ["owner", "host"],
    disabledHostUids: ["owner"],
    hostSlots: [
      { hostUid: "owner", startAt: 1 },
      { hostUid: "host", startAt: 2 },
    ],
  };
  assert.equal(isGroupHostEnabled(event, "owner"), false);
  assert.deepEqual(activeGroupEvent(event).hostSlots, [
    { hostUid: "host", startAt: 2 },
  ]);
  assert.equal(event.hostSlots.length, 2);
  assert.equal(
    isGroupHostEnabled({ ...event, eventKind: "individual" }, "owner"),
    true,
  );
});
test("group topic can be created before adding host times; other meeting types retain validation", () => {
  const profiles = new Map([
    ["owner", { name: "Owner", timezone: "UTC" }],
    ["host", { name: "Host", timezone: "UTC" }],
  ]);
  assert.deepEqual(
    normalizeHostSlots([], ["owner", "host"], profiles, {
      eventKind: "group",
      ownerId: "owner",
    }),
    [],
  );
  assert.throws(
    () => normalizeHostSlots([], ["owner"], profiles, { ownerId: "owner" }),
    /at least one/,
  );
});
