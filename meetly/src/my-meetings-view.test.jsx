import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
const state = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock("./firebase", () => ({ live: true, api: state.api }));
import { MyMeetings } from "./components/MyMeetings";
afterEach(() => {
  cleanup();
  state.api.mockReset();
});
test("meeting tabs separate upcoming, past and invitations without reloading data", async () => {
  const now = Date.now();
  state.api.mockResolvedValue({
    meetings: [
      {
        id: "future",
        eventTitle: "Next consultation",
        hostName: "Host",
        startAt: now + 86400000,
        endAt: now + 88200000,
        status: "confirmed",
      },
      {
        id: "past",
        eventTitle: "Past consultation",
        startAt: now - 86400000,
        endAt: now - 84600000,
        status: "confirmed",
      },
      {
        id: "invite",
        eventTitle: "New invitation",
        startAt: now + 86400000,
        endAt: now + 88200000,
        status: "invited",
      },
    ],
  });
  render(<MyMeetings uid="student" />);
  expect(
    await screen.findByRole("heading", { name: "Next consultation" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("heading", { name: "Past consultation" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Past", exact: true }));
  expect(
    screen.getByRole("heading", { name: "Past consultation" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("heading", { name: "Next consultation" }),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Invitations", exact: true }),
  );
  expect(
    screen.getByRole("button", { name: "Accept invitation" }),
  ).toBeTruthy();
  expect(state.api).toHaveBeenCalledTimes(1);
});
