import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
vi.mock("./firebase", () => ({
  live: true,
  api: vi.fn().mockResolvedValue({
    users: [{ uid: "pawan", name: "Pawan", email: "pawan@example.com" }],
  }),
}));
vi.mock("./user-search-direct", () => ({
  selectedUsersDirect: vi.fn().mockResolvedValue({
    users: [{ uid: "pawan", name: "Pawan", email: "pawan@example.com" }],
  }),
}));
import { HostSlotEditor } from "./components/HostSlotEditor";
afterEach(cleanup);
test("organizer and selected host have schedule cards without legacy time controls", async () => {
  render(
    <HostSlotEditor
      hostUids={["shafi", "pawan"]}
      value={[{ hostUid: "pawan", date: "2026-12-01", time: "09:00" }]}
      onChange={vi.fn()}
      timezone="Asia/Kolkata"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  expect(screen.getByRole("group", { name: "Shafi (Organizer)" })).toBeTruthy();
  expect(await screen.findByRole("group", { name: "Pawan" })).toBeTruthy();
  expect(screen.queryByText("Date & time 1")).toBeNull();
  expect(screen.queryByLabelText("Date and time")).toBeNull();
});

test("organizer can independently enable a selected host's own-slot permission", async () => {
  const changed = vi.fn();
  render(
    <HostSlotEditor
      hostUids={["shafi", "pawan"]}
      value={[]}
      onChange={vi.fn()}
      timezone="UTC"
      organizer={{ uid: "shafi", name: "Shafi" }}
      selfSchedulingHostUids={[]}
      onSelfSchedulingChange={changed}
    />,
  );
  const checkbox = await screen.findByLabelText(
    "Allow Pawan to manage their own slots for this meeting",
  );
  expect(checkbox.checked).toBe(false);
  fireEvent.click(checkbox);
  expect(changed).toHaveBeenCalledWith(["pawan"]);
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
});

test("saved appointments expand and collapse without showing an empty new-slot preview", async () => {
  const slots = Array.from({ length: 10 }, (_, i) => ({
    hostUid: "shafi",
    date: "2026-12-01",
    time: `${String(i + 8).padStart(2, "0")}:00`,
    timezone: "UTC",
  }));
  render(
    <HostSlotEditor
      hostUids={["shafi"]}
      value={slots}
      onChange={vi.fn()}
      timezone="UTC"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  expect(screen.getByLabelText("Saved appointment 8 date")).toBeTruthy();
  expect(screen.queryByLabelText("Saved appointment 9 date")).toBeNull();
  expect(screen.queryByRole("heading", { name: /3. Preview/ })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Show more (2 appointments)" }),
  );
  expect(screen.getByLabelText("Saved appointment 10 time")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show less" }));
  expect(screen.queryByLabelText("Saved appointment 9 date")).toBeNull();
});
