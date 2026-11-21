import { test, expect, vi, afterEach } from "vitest";
const state = vi.hoisted(() => ({ getDoc: vi.fn() }));
vi.mock("./firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: (_db, ...path) => path.join("/"),
  getDoc: state.getDoc,
}));
import { publishedSlots } from "./published-slots";
import { loadPublishedSlots } from "./published-slots-direct";
afterEach(() => state.getDoc.mockReset());
const event = {
  id: "event",
  ownerId: "host",
  active: true,
  duration: 30,
  minNotice: 0,
  hostSlots: [
    {
      hostUid: "host",
      hostName: "Host",
      startAt: Date.now() + 86400000,
      timezone: "UTC",
    },
  ],
};
test("published schedules filter expired/notice times without a server call", () => {
  const result = publishedSlots(
    {
      ...event,
      minNotice: 60,
      hostSlots: [
        { ...event.hostSlots[0], startAt: 1000 },
        { ...event.hostSlots[0], startAt: 7200000 },
      ],
    },
    2000,
  );
  expect(result.slots).toHaveLength(1);
  expect(result.provisional).toBe(true);
  expect(publishedSlots({ ...event, active: false }).slots).toHaveLength(0);
});
test("loads public projection directly and falls back to already loaded sanitized event", async () => {
  state.getDoc.mockResolvedValue({ exists: () => true, data: () => event });
  expect((await loadPublishedSlots(event)).slots).toHaveLength(1);
  expect(state.getDoc).toHaveBeenCalledWith("scheduler_public_events/event");
  state.getDoc.mockRejectedValue(new Error("not deployed"));
  expect((await loadPublishedSlots(event)).slots).toHaveLength(1);
});

test("fixed events publish their exact scheduled instant without hostSlots", () => {
  const start = Date.now() + 86400000;
  const result = publishedSlots({
    id: "fixed",
    ownerId: "owner",
    hostName: "Nikhat",
    schedulingMode: "fixed",
    fixedStartAt: start,
    duration: 30,
    minNotice: 0,
  });
  expect(result.slots).toEqual([
    {
      start,
      end: start + 1800000,
      hostUid: "owner",
      hostName: "Nikhat",
      timezone: "UTC",
    },
  ]);
  expect(
    publishedSlots(
      {
        schedulingMode: "fixed",
        fixedStartAt: start,
        duration: 30,
        ownerId: "owner",
      },
      start + 1,
    ).slots,
  ).toHaveLength(0);
});
