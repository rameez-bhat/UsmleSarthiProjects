import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { HostChoiceBooking } from "./components/HostChoiceBooking";
afterEach(cleanup);
test("same-instant host choices stay distinct and confirmation books the named host", async () => {
  const start = Date.now() + 86400000;
  const getSlots = vi.fn().mockResolvedValue([
    { hostUid: "host-a", hostName: "Dr A", start, end: start + 1800000 },
    { hostUid: "host-b", hostName: "Dr B", start, end: start + 1800000 },
  ]);
  const book = vi.fn().mockResolvedValue({});
  render(
    <HostChoiceBooking
      event={{
        id: "team",
        title: "Mock interview",
        duration: 30,
        audience: "anyone",
        questions: [],
      }}
      data={{ host: { timezone: "UTC" } }}
      getSlots={getSlots}
      book={book}
      notify={vi.fn()}
    />,
  );
  await screen.findByRole("button", { name: /Dr B/ });
  fireEvent.click(screen.getByRole("button", { name: /Dr B/ }));
  expect(screen.getByText("You are booking with Dr B.")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Guest" },
  });
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "guest@example.com" },
  });
  fireEvent.submit(
    screen.getByRole("form", { name: "Host meeting registration" }),
  );
  await waitFor(() => expect(book).toHaveBeenCalled());
  expect(book.mock.calls[0][0]).toMatchObject({
    hostUid: "host-b",
    startAt: start,
    email: "guest@example.com",
  });
  expect(getSlots).toHaveBeenCalledTimes(1);
});
test("registered team meetings require login before exposing the booking form", async () => {
  const start = Date.now() + 86400000;
  render(
    <HostChoiceBooking
      event={{
        id: "team",
        title: "Team",
        duration: 30,
        audience: "registered",
      }}
      data={{ host: { timezone: "UTC" } }}
      getSlots={vi
        .fn()
        .mockResolvedValue([
          { hostUid: "a", hostName: "Dr A", start, end: start + 1800000 },
        ])}
      book={vi.fn()}
      notify={vi.fn()}
    />,
  );
  fireEvent.click(await screen.findByRole("button", { name: /Dr A/ }));
  expect(
    screen.queryByRole("form", { name: "Host meeting registration" }),
  ).toBeNull();
  expect(screen.getByRole("heading", { name: "Welcome back." })).toBeTruthy();
});

test("organizer remains visible when other hosts have availability", async () => {
  const start = Date.now() + 86400000;
  render(
    <HostChoiceBooking
      event={{
        id: "team",
        ownerId: "shafi",
        title: "Team",
        duration: 30,
        hostSlots: [{ hostUid: "shafi", hostName: "Shafi", startAt: start }],
      }}
      data={{ host: { id: "shafi", name: "Shafi", timezone: "UTC" } }}
      getSlots={vi.fn().mockResolvedValue({
        hosts: [
          { uid: "shafi", name: "Shafi", organizer: true, publishedCount: 1 },
          { uid: "pawan", name: "Pawan", publishedCount: 1 },
        ],
        slots: [
          { hostUid: "pawan", hostName: "Pawan", start, end: start + 1800000 },
        ],
      })}
      book={vi.fn()}
      notify={vi.fn()}
    />,
  );
  expect(
    await screen.findByRole("heading", { name: "Shafi (Organizer)" }),
  ).toBeTruthy();
  expect(
    screen.getByText("No available times on this date"),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: /Pawan/ })).toBeTruthy();
});
