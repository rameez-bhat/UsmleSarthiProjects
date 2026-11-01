import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
