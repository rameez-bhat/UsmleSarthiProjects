import { test, expect } from "vitest";
import { delegatedEventInput } from "./delegated-event-input";
test("waiting selected hosts remain selected and self-scheduling uses canonical host-slots mode", () => {
  const result = delegatedEventInput(
    {
      ownerId: "owner",
      teamHostUids: ["owner", "a"],
      selfSchedulingHostUids: ["owner", "a"],
      schedulingMode: "fixed",
      meetingDate: "2026-12-01",
      meetingTime: "11:00",
      meetingTimezone: "Asia/Kolkata",
    },
    "owner",
  );
  expect(result.teamHostUids).toEqual(["a"]);
  expect(result.selfSchedulingHostUids).toEqual(["a"]);
  expect(result.schedulingMode).toBe("host-slots");
  expect(result.multipleHostTimes).toBe(true);
  expect(result.hostSlots[0].hostUid).toBe("owner");
});
test("removed hosts cannot retain permission and ordinary fixed meetings keep their type", () => {
  const result = delegatedEventInput(
    {
      teamHostUids: [],
      selfSchedulingHostUids: ["removed"],
      schedulingMode: "fixed",
    },
    "owner",
  );
  expect(result.selfSchedulingHostUids).toEqual([]);
  expect(result.schedulingMode).toBe("fixed");
});
