import { expect, test, vi } from "vitest";
const mocked = vi.hoisted(() => ({
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("./firebase", () => ({
  auth: { currentUser: { uid: "host", emailVerified: true } },
  db: "calendar",
  identityDb: "identity",
  api: vi.fn(async () => ({ bookings: [{ id: "b", startAt: 2 }] })),
}));
vi.mock("firebase/firestore", () => ({
  collection: (db, name) => ({ db, name }),
  doc: (db, name, id) => ({ db, name, id }),
  where: (field, op, value) => ({ field, op, value }),
  limit: (value) => ({ limit: value }),
  query: (...parts) => parts,
  getDocs: mocked.getDocs,
  runTransaction: mocked.transaction,
  getDoc: mocked.getDoc,
  updateDoc: mocked.updateDoc,
}));
import {
  getSchedulerAccess,
  getSchedulerWorkspace,
  saveSchedulerAvailability,
  saveSchedulerProfile,
} from "./firestore-scheduler";
const docs = (rows = []) => ({
  size: rows.length,
  docs: rows.map(([id, data]) => ({ id, data: () => data })),
});
test("reads roles in default database and scheduler records in named database", async () => {
  mocked.getDocs.mockReset();
  mocked.getDocs.mockResolvedValueOnce(docs([["role", { Role: "Mentor" }]]));
  expect(await getSchedulerAccess()).toEqual({
    role: "Mentor",
    isAdmin: false,
    canHost: true,
  });
  mocked.getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ name: "Host" }),
  });
  mocked.getDocs
    .mockResolvedValueOnce(docs([["e", { ownerId: "host" }]]))
    .mockResolvedValueOnce(docs([["g", { provider: "google" }]]));
  const workspace = await getSchedulerWorkspace();
  expect(workspace.bookings).toEqual([{ id: "b", startAt: 2 }]);
  expect(workspace.connections).toEqual(["google"]);
  expect(mocked.getDoc).toHaveBeenCalledWith({
    db: "calendar",
    name: "scheduler_hosts",
    id: "host",
  });
  await saveSchedulerAvailability({ schedule: { 1: [] } });
  expect(mocked.updateDoc).toHaveBeenCalledWith(
    { db: "calendar", name: "scheduler_hosts", id: "host" },
    expect.objectContaining({ schedule: { 1: [] } }),
  );
});

test("profile transaction claims the slug and creates an introductory event", async () => {
  const tx = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
  tx.get.mockResolvedValue({ exists: () => false });
  mocked.transaction.mockImplementation(async (_, fn) => fn(tx));
  await saveSchedulerProfile({
    name: "Shafi",
    slug: "shafi",
    timezone: "Asia/Kolkata",
    bio: "Hello",
  });
  expect(tx.set).toHaveBeenCalledWith(
    { db: "calendar", name: "scheduler_slugs", id: "shafi" },
    { ownerId: "host" },
  );
  expect(tx.set).toHaveBeenCalledWith(
    { db: "calendar", name: "scheduler_events", id: "host_intro" },
    expect.objectContaining({ ownerId: "host", title: "Introductory call" }),
  );
  tx.get
    .mockReset()
    .mockResolvedValueOnce({ exists: () => false })
    .mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ ownerId: "other" }),
    })
    .mockResolvedValueOnce({ exists: () => false });
  await expect(
    saveSchedulerProfile({ name: "Shafi", slug: "shafi", timezone: "UTC" }),
  ).rejects.toThrow("already taken");
});

test("notification changes update the event and record an audit entry", async () => {
  const { saveSchedulerNotifications } = await import("./firestore-scheduler");
  const tx = {
    get: vi.fn().mockResolvedValue({ exists: () => true }),
    update: vi.fn(),
    set: vi.fn(),
  };
  mocked.transaction.mockImplementation(async (_, fn) => fn(tx));
  await saveSchedulerNotifications("event1", {
    enabled: false,
    reminderMinutes: [60, 60],
  });
  expect(tx.update).toHaveBeenCalledWith(
    { db: "calendar", name: "scheduler_events", id: "event1" },
    expect.objectContaining({
      notifications: expect.objectContaining({
        enabled: false,
        reminderMinutes: [60],
      }),
    }),
  );
  expect(tx.set).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      action: "notification-settings-updated",
      actorUid: "host",
    }),
  );
});
