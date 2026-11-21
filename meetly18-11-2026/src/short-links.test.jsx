import { test, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getDoc: vi.fn(), runTransaction: vi.fn() }));
vi.mock("./firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "owner" } },
}));
vi.mock("firebase/firestore", () => ({
  doc: (_db, collection, id) => ({ collection, id }),
  ...mocks,
}));
import {
  resolveShortLink,
  saveShortLink,
  validateShortName,
} from "./short-links";
test("short names reject paths and external redirects", () => {
  expect(validateShortName(" Pawan Review ")).toBe("pawan-review");
  expect(() => validateShortName("https://example.com")).toThrow();
  expect(() => validateShortName("../book")).toThrow();
});
test("short links resolve to the original event within this site", async () => {
  mocks.getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ slug: "pawan", eventId: "event-1" }),
  });
  expect(await resolveShortLink("pawan-review")).toBe("/book/pawan/event-1");
  mocks.getDoc.mockResolvedValue({ exists: () => false });
  await expect(resolveShortLink("missing")).rejects.toThrow("not found");
});
test("a claimed name cannot overwrite another event", async () => {
  const set = vi.fn();
  mocks.runTransaction.mockImplementation(async (_db, work) =>
    work({
      get: async (ref) => ({
        exists: () => true,
        data: () =>
          ref.collection === "scheduler_events"
            ? { ownerId: "owner" }
            : { ownerId: "another", eventId: "other" },
      }),
      set,
    }),
  );
  await expect(
    saveShortLink({ id: "event" }, "pawan", "pawan-review"),
  ).rejects.toThrow("already taken");
  expect(set).not.toHaveBeenCalled();
});
