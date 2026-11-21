import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { EventTypesPage } from "./pages/EventTypesPage";
afterEach(cleanup);
test("event categories filter group, multiple hosts and current organizer meetings", () => {
  const base = {
    active: true,
    duration: 30,
    location: "google-meet",
    questions: [],
    teamHostUids: [],
  };
  const events = [
    {
      ...base,
      id: "group",
      title: "Group topic",
      eventKind: "group",
      ownerId: "admin",
      teamHostUids: ["host"],
    },
    {
      ...base,
      id: "multi",
      title: "Team topic",
      ownerId: "admin",
      teamHostUids: ["host"],
    },
    { ...base, id: "own", title: "My private topic", ownerId: "admin" },
    { ...base, id: "other", title: "Other organizer topic", ownerId: "other" },
  ];
  render(
    <EventTypesPage
      events={events}
      viewerUid="admin"
      profile={{ slug: "admin", timezone: "UTC" }}
      connections={[]}
      upcoming={[]}
      copy={vi.fn()}
      eventLink={(e) => `/book/admin/${e.id}`}
      navigate={vi.fn()}
      goPage={vi.fn()}
      saveEvent={vi.fn()}
      setModal={vi.fn()}
      deleteEvent={vi.fn()}
    />,
  );
  const panel = () => within(screen.getByRole("tabpanel"));
  expect(
    panel().getByRole("heading", { name: "My private topic" }),
  ).toBeTruthy();
  expect(
    panel().queryByRole("heading", { name: "Other organizer topic" }),
  ).toBeNull();
  expect(panel().queryByRole("heading", { name: "Group topic" })).toBeNull();
  expect(panel().queryByRole("heading", { name: "Team topic" })).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: /Group Meetings/ }));
  expect(panel().getByRole("heading", { name: "Group topic" })).toBeTruthy();
  expect(panel().queryByRole("heading", { name: "Team topic" })).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: /Multiple Hosts/ }));
  expect(panel().getByRole("heading", { name: "Team topic" })).toBeTruthy();
  expect(panel().queryByRole("heading", { name: "Group topic" })).toBeNull();
  expect(
    panel().queryByRole("heading", { name: "My private topic" }),
  ).toBeNull();
});
