import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
const state = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("./firebase", () => ({ live: true }));
vi.mock("./group-management-direct", () => ({
  loadGroupEvent: state.load,
  saveGroupHosts: state.save,
  updateGroupHosts: vi.fn(),
}));
vi.mock("./user-search-direct", () => ({
  selectedUsersDirect: vi.fn().mockResolvedValue({
    users: [
      { uid: "owner", name: "Owner" },
      { uid: "host", name: "Dr Host" },
    ],
  }),
}));
vi.mock("./components/UserPicker", () => ({
  UserPicker: () => <div>Host search</div>,
}));
import { GroupHostManager } from "./components/GroupHostManager";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
test("group management toggles host off and opens that host slot editor with retained choices", async () => {
  const event = {
    id: "group",
    eventKind: "group",
    title: "Interview",
    ownerId: "owner",
    teamHostUids: ["host"],
    hostSlots: [{ hostUid: "host", date: "2026-12-01", time: "09:00" }],
  };
  state.load.mockResolvedValue(event);
  state.save.mockResolvedValue({
    ...event,
    disabledHostUids: ["host"],
    slotsVersion: 1,
  });
  const modal = vi.fn();
  render(
    <GroupHostManager
      initialEvent={event}
      profile={{ name: "Owner" }}
      back={vi.fn()}
      setModal={modal}
      eventLink={() => "/book/owner/group"}
      copy={vi.fn()}
      onUpdated={vi.fn()}
      saveEvent={vi.fn()}
    />,
  );
  const toggle = await screen.findByRole("switch", { name: "Enable Dr Host" });
  await waitFor(() => expect(toggle.disabled).toBe(false));
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(state.save).toHaveBeenCalledWith(
      "group",
      expect.objectContaining({ toggleUid: "host", enabled: false }),
    ),
  );
  await waitFor(() =>
    expect(screen.getByRole("switch", { name: "Enable Dr Host" }).checked).toBe(
      false,
    ),
  );
  const buttons = screen.getAllByRole("button", { name: "Manage slots" });
  fireEvent.click(buttons[1]);
  expect(modal).toHaveBeenCalledWith(
    expect.objectContaining({
      focusHostUid: "host",
      event: expect.objectContaining({ hostSlots: event.hostSlots }),
    }),
  );
});
