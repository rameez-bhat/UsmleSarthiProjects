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
        remainingSlots: [
          event.hostSlots[0],
          { ...event.hostSlots[1], time: "11:00" },
        ],
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
    screen.getByRole("button", {
      name: "Save without conflicting dates and times",
    }),
  );
  expect(
    saveEvent.mock.calls[0][0].hostSlots.map((slot) => [
      slot.hostUid,
      slot.time,
    ]),
  ).toEqual([
    ["shafi", "10:00"],
    ["pawan", "11:00"],
  ]);
  expect(saveEvent.mock.calls[0][0].teamHostUids).toEqual(["pawan"]);
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

test("organizer can save a host-specific meeting pending an enabled host's own times", () => {
  const { saveEvent, container } = show({ ...base, teamHostUids: ["pawan"] });
  const checkbox = screen.getByLabelText(
    /Allow this host to manage their own slots for this meeting/,
  );
  expect(checkbox.checked).toBe(false);
  fireEvent.click(checkbox);
  fireEvent.submit(container.querySelector("form"));
  expect(saveEvent).toHaveBeenCalledTimes(1);
  expect(saveEvent.mock.calls[0][0].selfSchedulingHostUids).toEqual(["pawan"]);
  expect(saveEvent.mock.calls[0][0].teamHostUids).toEqual(["pawan"]);
  expect(saveEvent.mock.calls[0][0].hostSlots).toEqual([]);
});

test("conflict confirmation retains a permitted host who has not published times yet", () => {
  const saveEvent = vi.fn();
  const event = {
    ...base,
    id: "shared",
    schedulingMode: "host-slots",
    multipleHostTimes: true,
    teamHostUids: ["pawan"],
    selfSchedulingHostUids: ["pawan"],
    hostSlots: [
      { hostUid: "shafi", date: "2026-12-01", time: "10:00", timezone: "UTC" },
    ],
  };
  render(
    <Modal
      modal={{
        type: "event",
        event,
        conflicts: [{ hostUid: "shafi", hostName: "Shafi", startAt: 1 }],
        remainingSlots: [event.hostSlots[0]],
      }}
      close={vi.fn()}
      saveEvent={saveEvent}
      hostTimezone="UTC"
      organizer={{ uid: "shafi", name: "Shafi" }}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Save without conflicting dates and times",
    }),
  );
  expect(saveEvent.mock.calls[0][0].teamHostUids).toEqual(["pawan"]);
  expect(saveEvent.mock.calls[0][0].selfSchedulingHostUids).toEqual(["pawan"]);
});

test("editing one saved date preserves its time and every other host appointment", async () => {
  const saved = [
    {
      hostUid: "shafi",
      date: "2026-12-01",
      time: "10:30",
      timezone: "Asia/Kolkata",
      startAt: 123,
      hostDate: "2026-12-01",
    },
    {
      hostUid: "shafi",
      date: "2026-12-03",
      time: "11:00",
      timezone: "Asia/Kolkata",
    },
    {
      hostUid: "pawan",
      date: "2026-12-04",
      time: "12:00",
      timezone: "Asia/Kolkata",
    },
  ];
  const { saveEvent, container } = show({
    ...base,
    id: "saved-event",
    schedulingMode: "host-slots",
    multipleHostTimes: true,
    teamHostUids: ["pawan"],
    hostSlots: saved,
  });
  expect(screen.getByLabelText("Saved appointment 1 date").value).toBe(
    "2026-12-01",
  );
  expect(screen.getByLabelText("Saved appointment 1 time").value).toBe("10:30");
  fireEvent.change(screen.getByLabelText("Saved appointment 1 date"), {
    target: { value: "2026-12-02" },
  });
  fireEvent.submit(container.querySelector("form"));
  await waitFor(() => expect(saveEvent).toHaveBeenCalled());
  const output = saveEvent.mock.calls[0][0];
  expect(output.hostSlots).toEqual([
    {
      hostUid: "shafi",
      date: "2026-12-02",
      time: "10:30",
      timezone: "Asia/Kolkata",
    },
    saved[1],
    saved[2],
  ]);
  expect(saved[0].date).toBe("2026-12-01");
});

test("Group event is a visible option and remains selected when reopening", async () => {
  const { saveEvent, container, unmount } = show();
  fireEvent.change(screen.getByLabelText("Meeting schedule"), {
    target: { value: "group" },
  });
  expect(screen.getByLabelText("Meeting schedule").value).toBe("group");
  fireEvent.change(screen.getByLabelText("Date 1"), {
    target: { value: "2026-12-01" },
  });
  fireEvent.submit(container.querySelector("form"));
  await waitFor(() => expect(saveEvent).toHaveBeenCalled());
  const event = saveEvent.mock.calls[0][0];
  expect(event.eventKind).toBe("group");
  expect(event.schedulingMode).toBe("host-slots");
  expect(event.assignmentMode).toBe("host-choice");
  unmount();
  show({ ...event, scheduleCategory: undefined });
  expect(screen.getByLabelText("Meeting schedule").value).toBe("group");
});
