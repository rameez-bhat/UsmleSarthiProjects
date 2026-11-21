import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
const state = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock("./firebase", () => ({ live: true, api: state.api, auth: null }));
import { HostChoiceBooking } from "./components/HostChoiceBooking";
afterEach(() => {
  cleanup();
  state.api.mockReset();
});
const getSlots = async () => ({ slots: [], hosts: [] });
function show(authUser) {
  return render(
    <HostChoiceBooking
      event={{
        id: "event",
        ownerId: "owner",
        schedulingMode: "host-slots",
        title: "Meeting",
        duration: 30,
      }}
      data={{ host: { id: "owner", name: "Host", timezone: "UTC" } }}
      getSlots={getSlots}
      book={vi.fn()}
      notify={vi.fn()}
      authUser={authUser}
    />,
  );
}
test("wrong signed-in identity sees diagnostics control and server's actionable permission error", async () => {
  state.api.mockRejectedValue(
    new Error("This signed-in account is not the event organizer."),
  );
  show({ uid: "other", email: "other@example.com" });
  await screen.findByRole("button", {
    name: "Check host availability reasons",
  });
  expect(screen.getByText(/other@example.com/)).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Check host availability reasons" }),
  );
  expect(
    await screen.findByText(
      "This signed-in account is not the event organizer.",
    ),
  ).toBeTruthy();
});
test("organizer sees saved counts and reason for hidden times", async () => {
  state.api.mockResolvedValue({
    hosts: [
      { uid: "owner", name: "Host", publishedCount: 1, availableCount: 0 },
    ],
    diagnostics: [
      {
        hostUid: "owner",
        hostName: "Host",
        startAt: Date.parse("2026-12-01T11:00Z"),
        reason: "existing_booking",
      },
    ],
  });
  show({ uid: "owner", email: "owner@example.com" });
  fireEvent.click(
    screen.getByRole("button", { name: "Check host availability reasons" }),
  );
  expect(
    await screen.findByText(/Overlaps an existing booking or its buffer/),
  ).toBeTruthy();
  expect(screen.getByText(/1 saved times; 0 available/)).toBeTruthy();
});

test("published times display before external requests and a selection verifies only that host/instant", async () => {
  const start = Date.now() + 86400000;
  const slot = {
    start,
    end: start + 1800000,
    hostUid: "owner",
    hostName: "Host",
  };
  state.api.mockResolvedValue({ slots: [slot] });
  render(
    <HostChoiceBooking
      event={{
        id: "event",
        ownerId: "owner",
        schedulingMode: "host-slots",
        title: "Meeting",
        duration: 30,
      }}
      data={{ host: { id: "owner", name: "Host", timezone: "UTC" } }}
      getSlots={async () => ({
        provisional: true,
        slots: [slot],
        hosts: [{ uid: "owner", name: "Host" }],
      })}
      book={vi.fn()}
      notify={vi.fn()}
    />,
  );
  const choice = await screen.findByRole("button", { name: /^Host,/ });
  expect(state.api).not.toHaveBeenCalled();
  fireEvent.click(choice);
  expect(await screen.findByText("You are booking with Host.")).toBeTruthy();
  expect(state.api).toHaveBeenCalledWith("Slots", {
    eventId: "event",
    hostUid: "owner",
    startAt: start,
  });
});

test("fixed meetings use the same calendar and load their published time without server availability requests", async () => {
  const start = Date.now() + 86400000;
  const slot = {
    start,
    end: start + 1800000,
    hostUid: "owner",
    hostName: "Nikhat",
  };
  state.api.mockResolvedValue({ slots: [slot] });
  render(
    <HostChoiceBooking
      event={{
        id: "fixed",
        ownerId: "owner",
        schedulingMode: "fixed",
        fixedStartAt: start,
        title: "Meet up",
        duration: 30,
      }}
      data={{ host: { id: "owner", name: "Nikhat", timezone: "UTC" } }}
      getSlots={async () => ({
        provisional: true,
        slots: [slot],
        hosts: [{ uid: "owner", name: "Nikhat" }],
      })}
      book={vi.fn()}
      notify={vi.fn()}
    />,
  );
  const button = await screen.findByRole("button", { name: /^Nikhat,/ });
  expect(screen.getByLabelText("Available meeting dates")).toBeTruthy();
  expect(state.api).not.toHaveBeenCalled();
  fireEvent.click(button);
  expect(await screen.findByText("You are booking with Nikhat.")).toBeTruthy();
});
