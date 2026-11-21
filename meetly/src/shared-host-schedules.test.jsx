import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
const state = vi.hoisted(() => ({ api: vi.fn(), getDocs: vi.fn() }));
vi.mock("./firebase", () => ({
  auth: { currentUser: { uid: "host" } },
  db: "calendar",
  live: true,
  api: state.api,
}));
vi.mock("firebase/firestore", () => ({
  collection: (_db, name) => name,
  where: (field, operator, value) => ({ field, operator, value }),
  query: (...parts) => parts,
  getDocs: state.getDocs,
}));
vi.mock("./components/HostSlotEditor", () => ({
  HostSlotEditor: ({ value }) => <p>Own saved slots: {value.length}</p>,
}));
import { SharedHostSchedules } from "./components/SharedHostSchedules";
import { ManageSlotsPage } from "./pages/ManageSlotsPage";
import { pageFromPath, pagePaths } from "./routes";
afterEach(() => {
  cleanup();
  state.api.mockReset();
  state.getDocs.mockReset();
});
test("host discovers delegated meetings with direct query and submits only their existing own slots", async () => {
  const own = {
    hostUid: "host",
    date: "2026-12-01",
    time: "09:00",
    timezone: "UTC",
  };
  state.getDocs.mockResolvedValue({
    docs: [
      {
        id: "event_host",
        data: () => ({
          eventId: "event",
          hostUid: "host",
          ownerId: "organizer",
          title: "Shared meeting",
          active: true,
          duration: 30,
          hostSlots: [own],
        }),
      },
    ],
  });
  state.api.mockResolvedValue({ ok: true });
  render(<SharedHostSchedules profile={{ timezone: "UTC" }} />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Manage my slots" }),
  );
  expect(screen.getByText("Own saved slots: 1")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save my slots" }));
  expect(state.api).toHaveBeenCalledWith("SaveOwnSlots", {
    eventId: "event",
    hostSlots: [own],
  });
  expect(state.getDocs.mock.calls[0][0]).toEqual([
    "scheduler_host_assignments",
    { field: "hostUid", operator: "==", value: "host" },
  ]);
});

test("Manage your slots lists pending and published meetings created by others", async () => {
  const entry = (id, ownerId, hostSlots, active = true) => ({
    id,
    data: () => ({
      eventId: id,
      hostUid: "host",
      ownerId,
      hostSlots,
      active,
      title: id,
      duration: 30,
    }),
  });
  state.getDocs.mockResolvedValue({
    docs: [
      entry("Pending meeting", "other", []),
      entry("Published meeting", "other", [{ hostUid: "host" }]),
      entry("My own event", "host", []),
      entry("Inactive event", "other", [], false),
    ],
  });
  render(<ManageSlotsPage profile={{ timezone: "UTC" }} />);
  expect(
    screen.getByRole("heading", { name: "Manage your slots" }),
  ).toBeTruthy();
  expect(await screen.findByText("Pending meeting")).toBeTruthy();
  expect(screen.getByText("Published meeting")).toBeTruthy();
  expect(screen.getByText(/Action needed/)).toBeTruthy();
  expect(screen.getByText(/Slots added/)).toBeTruthy();
  expect(screen.queryByText("My own event")).toBeNull();
  expect(screen.queryByText("Inactive event")).toBeNull();
  expect(pagePaths["Manage your slots"]).toBe("/manage-slots");
  expect(pageFromPath("/manage-slots")).toBe("Manage your slots");
});
