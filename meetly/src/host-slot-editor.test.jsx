import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
vi.mock("./firebase", () => ({
  live: true,
  api: vi.fn().mockResolvedValue({
    users: [{ uid: "pawan", name: "Pawan", email: "pawan@example.com" }],
  }),
}));
vi.mock("./user-search-direct", () => ({
  selectedUsersDirect: vi
    .fn()
    .mockResolvedValue({
      users: [{ uid: "pawan", name: "Pawan", email: "pawan@example.com" }],
    }),
}));
import { HostSlotEditor } from "./components/HostSlotEditor";
afterEach(cleanup);
test("organizer and selected host are both available in the meeting time selector", async () => {
  render(
    <HostSlotEditor
      hostUids={["shafi", "pawan"]}
      value={[{ hostUid: "pawan", date: "2026-12-01", time: "09:00" }]}
      onChange={vi.fn()}
      timezone="Asia/Kolkata"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  expect(
    within(screen.getByLabelText("Host")).getByRole("option", {
      name: "Shafi (Organizer)",
    }),
  ).toBeTruthy();
  expect(
    await within(screen.getByLabelText("Host")).findByRole("option", {
      name: "Pawan",
    }),
  ).toBeTruthy();
});
