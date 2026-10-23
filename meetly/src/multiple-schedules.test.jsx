import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
vi.mock("./firebase", () => ({ live: false, api: vi.fn() }));
import { initialEvent } from "./shared/utils";
import { Modal } from "./components/Modal";
afterEach(cleanup);
const base = {
  ...initialEvent,
  title: "Meeting",
  duration: 30,
  schedulingMode: "recurring",
  participantUids: [],
  teamHostUids: [],
};
function show(event = base) {
  const saveEvent = vi.fn();
  const result = render(
    <Modal
      modal={{ type: "event", event }}
      close={vi.fn()}
      saveEvent={saveEvent}
      hostTimezone="Asia/Kolkata"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  return { saveEvent, ...result };
}
for (const category of ["recurring", "fixed", "host-slots"]) {
  test(`${category} saves independent date-time pairs without combining them`, async () => {
    const { saveEvent, container } = show();
    fireEvent.change(screen.getByLabelText("Meeting schedule"), {
      target: { value: category },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add another date and time" }),
    );
    fireEvent.change(screen.getAllByLabelText("Date and time")[0], {
      target: { value: "2026-12-01T10:30" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add another date and time" }),
    );
    fireEvent.change(screen.getAllByLabelText("Date and time")[1], {
      target: { value: "2026-12-03T14:00" },
    });
    fireEvent.submit(container.querySelector("form"));
    await waitFor(() => expect(saveEvent).toHaveBeenCalled());
    const saved = saveEvent.mock.calls[0][0];
    expect(saved.schedulingMode).toBe("host-slots");
    expect(saved.scheduleCategory).toBe(category);
    expect(saved.hostSlots.map((s) => [s.hostUid, s.date, s.time])).toEqual([
      ["shafi", "2026-12-01", "10:30"],
      ["shafi", "2026-12-03", "14:00"],
    ]);
  });
}
test("existing specific appointment retains its date when multiple dates are enabled", () => {
  const { saveEvent, container } = show({
    ...base,
    id: "old",
    schedulingMode: "fixed",
    meetingDate: "2026-12-01",
    meetingTime: "11:00",
  });
  fireEvent.click(
    screen.getByLabelText("Publish multiple dates and times for each host"),
  );
  fireEvent.submit(container.querySelector("form"));
  expect(saveEvent.mock.calls[0][0].hostSlots[0]).toMatchObject({
    date: "2026-12-01",
    time: "11:00",
    hostUid: "shafi",
  });
});

test("outside clicks keep the meeting editor open; close button is explicit", () => {
  const close = vi.fn();
  const { container } = render(
    <Modal
      modal={{ type: "event", event: base }}
      close={close}
      saveEvent={vi.fn()}
      hostTimezone="UTC"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  fireEvent.click(container.querySelector(".modal-overlay"));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  expect(close).toHaveBeenCalledTimes(1);
});
