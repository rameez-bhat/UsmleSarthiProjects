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
  test(`${category} saves multiple dates directly through host cards`, async () => {
    const { saveEvent, container } = show();
    fireEvent.change(screen.getByLabelText("Meeting schedule"), {
      target: { value: category },
    });
    fireEvent.change(screen.getByLabelText("Date selection"), {
      target: { value: "multiple" },
    });
    fireEvent.change(screen.getByLabelText("Date 1"), {
      target: { value: "2026-12-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add date for/ }));
    fireEvent.change(screen.getByLabelText("Date 2"), {
      target: { value: "2026-12-03" },
    });
    fireEvent.change(screen.getByLabelText("Time selection"), {
      target: { value: "single" },
    });
    fireEvent.change(screen.getByLabelText("Start time 1"), {
      target: { value: "10:30" },
    });
    expect(screen.queryByText("Date & time 1")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Add another date and time" }),
    ).toBeNull();
    fireEvent.submit(container.querySelector("form"));
    await waitFor(() => expect(saveEvent).toHaveBeenCalled());
    const saved = saveEvent.mock.calls[0][0];
    expect(saved.schedulingMode).toBe("host-slots");
    expect(saved.scheduleCategory).toBe(category);
    expect(saved.hostSlots.map((s) => [s.hostUid, s.date, s.time])).toEqual([
      ["shafi", "2026-12-01", "10:30"],
      ["shafi", "2026-12-03", "10:30"],
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

test("named host conflicts require explicit removal and preserve free hosts", () => {
  const saveEvent = vi.fn();
  const event = {
    ...base,
    id: "team",
    schedulingMode: "host-slots",
    scheduleCategory: "host-slots",
    hostSlots: [
      { hostUid: "shafi", date: "2026-12-01", time: "10:00", timezone: "UTC" },
      { hostUid: "pawan", date: "2026-12-01", time: "10:00", timezone: "UTC" },
    ],
    teamHostUids: ["pawan"],
  };
  const { container } = render(
    <Modal
      modal={{
        type: "event",
        event,
        conflicts: [
          {
            hostUid: "pawan",
            hostName: "Pawan",
            startAt: Date.parse("2026-12-01T10:00Z"),
          },
        ],
      }}
      close={vi.fn()}
      saveEvent={saveEvent}
      hostTimezone="UTC"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  expect(screen.getByText(/Pawan —/)).toBeTruthy();
  expect(saveEvent).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Remove conflicting hosts’ times" }),
  );
  fireEvent.submit(container.querySelector("form"));
  expect(
    saveEvent.mock.calls[0][0].hostSlots.map((slot) => slot.hostUid),
  ).toEqual(["shafi"]);
  expect(saveEvent.mock.calls[0][0].teamHostUids).toEqual([]);
});

test("Save includes per-host date and time ranges without Add choices or old time rows", () => {
  const { saveEvent, container } = show();
  fireEvent.change(screen.getByLabelText("Date selection"), {
    target: { value: "range" },
  });
  fireEvent.change(screen.getByLabelText("From date"), {
    target: { value: "2026-12-01" },
  });
  fireEvent.change(screen.getByLabelText("Through date"), {
    target: { value: "2026-12-02" },
  });
  fireEvent.submit(container.querySelector("form"));
  const saved = saveEvent.mock.calls[0][0];
  expect(saved.hostSlots).toHaveLength(10);
  expect(
    saved.hostSlots
      .filter((slot) => slot.date === "2026-12-01")
      .map((slot) => slot.time),
  ).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  expect(screen.queryByRole("button", { name: /Add choices/ })).toBeNull();
});
