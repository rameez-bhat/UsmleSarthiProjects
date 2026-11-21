import { test, expect, vi } from "vitest";
vi.mock("./firebase", () => ({ auth: null, db: null }));
import { updateGroupHosts } from "./group-management-direct";
import { publishedSlots } from "./published-slots";
test("host toggles retain slots, added hosts deduplicate, public choices hide off hosts and restore on enable", () => {
  const now = Date.now(),
    event = {
      ownerId: "owner",
      eventKind: "group",
      active: true,
      duration: 30,
      teamHostUids: ["host"],
      hostSlots: [
        { hostUid: "owner", hostName: "Owner", startAt: now + 86400000 },
        { hostUid: "host", hostName: "Host", startAt: now + 86400000 },
      ],
    };
  const off = updateGroupHosts(event, {
    toggleUid: "host",
    enabled: false,
    addHostUids: ["host"],
  });
  expect(off.hostSlots).toEqual(event.hostSlots);
  expect(off.teamHostUids).toEqual(["owner", "host"]);
  expect(publishedSlots(off, now).slots.map((slot) => slot.hostUid)).toEqual([
    "owner",
  ]);
  expect(publishedSlots(off, now).hosts.map((host) => host.uid)).toEqual([
    "owner",
  ]);
  expect(
    publishedSlots(
      updateGroupHosts(off, { toggleUid: "host", enabled: true }),
      now,
    ).slots,
  ).toHaveLength(2);
});
