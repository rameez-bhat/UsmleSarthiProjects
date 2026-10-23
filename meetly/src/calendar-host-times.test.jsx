import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/react";
import { CalendarHostTimes } from "./components/CalendarHostTimes";
afterEach(cleanup);
test("available dates are highlighted and selecting a date groups that day's times by host", async () => {
  const onSelect = vi.fn();
  const one = Date.parse("2026-11-04T09:00:00Z"),
    two = Date.parse("2026-11-05T09:00:00Z");
  render(
    <CalendarHostTimes
      slots={[
        { hostUid: "a", hostName: "Shafi", start: one, end: one + 1800000 },
        {
          hostUid: "b",
          hostName: "Pawan",
          start: one + 3600000,
          end: one + 5400000,
        },
        { hostUid: "b", hostName: "Pawan", start: two, end: two + 1800000 },
      ]}
      hosts={[
        { uid: "a", name: "Shafi", organizer: true },
        { uid: "b", name: "Pawan" },
      ]}
      zone="UTC"
      onSelect={onSelect}
    />,
  );
  expect(
    screen.getByRole("button", { name: "2026-11-04, 2 available times" })
      .className,
  ).toContain("has-times");
  expect(
    screen.getByRole("button", { name: "2026-11-03, 0 available times" })
      .disabled,
  ).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "2026-11-05, 1 available times" }),
  );
  expect(screen.queryByRole("button", { name: /Shafi, 09:00/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Pawan, 09:00/ }));
  expect(onSelect.mock.calls[0][0].hostUid).toBe("b");
});
test("calendar groups the same instant by the attendee's selected zone", () => {
  const start = Date.parse("2026-11-05T01:00:00Z");
  const { rerender } = render(
    <CalendarHostTimes
      slots={[{ hostUid: "a", hostName: "Shafi", start, end: start + 1800000 }]}
      hosts={[{ uid: "a", name: "Shafi" }]}
      zone="UTC"
      onSelect={vi.fn()}
    />,
  );
  expect(
    screen.getByRole("button", { name: "2026-11-05, 1 available times" }),
  ).toBeTruthy();
  rerender(
    <CalendarHostTimes
      slots={[{ hostUid: "a", hostName: "Shafi", start, end: start + 1800000 }]}
      hosts={[{ uid: "a", name: "Shafi" }]}
      zone="America/Los_Angeles"
      onSelect={vi.fn()}
    />,
  );
  expect(
    screen.getByRole("button", { name: "2026-11-04, 1 available times" }),
  ).toBeTruthy();
});
