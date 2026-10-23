import React from "react";
import { test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  act,
  fireEvent,
  within,
} from "@testing-library/react";
const state = vi.hoisted(() => ({
  listener: null,
  api: vi.fn(),
  auth: { currentUser: null },
}));
vi.mock("./firebase", () => ({ live: true, auth: state.auth, api: state.api }));
vi.mock("firebase/auth", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    onAuthStateChanged: vi.fn((auth, listener) => {
      state.listener = listener;
      return vi.fn();
    }),
  };
});
import { App } from "./main";
const profile = {
  name: "Test Host",
  slug: "host",
  timezone: "UTC",
  bio: "",
  schedule: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
  overrides: {},
};
beforeEach(() => {
  localStorage.clear();
  history.replaceState({}, "", "/");
  state.listener = null;
  state.api.mockReset();
  state.api.mockImplementation(async (name) => {
    if (name === "Access")
      return { role: "Mentor", canHost: true, isAdmin: false };
    if (name === "Workspace")
      return { profile, events: [], bookings: [], connections: [] };
    if (name === "PublicPage") return { host: profile, events: [] };
    throw Error("Unexpected API call: " + name);
  });
});
afterEach(() => cleanup());
test("private dashboard hides navigation while authentication is unresolved", () => {
  render(<App />);
  expect(screen.getByRole("status").textContent).toContain(
    "Checking your sign-in",
  );
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(screen.queryByRole("complementary")).toBeNull();
  expect(screen.queryByRole("link", { name: "Bookings" })).toBeNull();
});
test("signed-out user opening a private URL sees only login and no dashboard menu", async () => {
  history.replaceState({}, "", "/availability");
  render(<App />);
  await act(async () => state.listener(null));
  expect(screen.getByRole("heading", { name: "Welcome back." })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeTruthy();
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(screen.queryByRole("complementary")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Save availability" }),
  ).toBeNull();
  expect(state.api).not.toHaveBeenCalled();
});
test("public booking links remain available without login", async () => {
  history.replaceState({}, "", "/book/host");
  render(<App />);
  await act(async () => state.listener(null));
  expect(
    await screen.findByRole("heading", { name: "Meet with Test Host." }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Sign in", exact: true }),
  ).toBeNull();
  expect(screen.queryByRole("navigation")).toBeNull();
});
test("sign-in opens requested dashboard page and sign-out removes its menu immediately", async () => {
  history.replaceState({}, "", "/bookings");
  render(<App />);
  await act(async () =>
    state.listener({
      uid: "host",
      email: "host@example.com",
      emailVerified: true,
    }),
  );
  expect(
    await screen.findByRole("heading", { name: "Your meetings, in view." }),
  ).toBeTruthy();
  expect(screen.getByRole("navigation")).toBeTruthy();
  await act(async () => state.listener(null));
  expect(screen.getByRole("heading", { name: "Welcome back." })).toBeTruthy();
  expect(screen.queryByRole("navigation")).toBeNull();
});

test("open workspace dialogs are cleared when signing out and switching accounts", async () => {
  render(<App />);
  await act(async () =>
    state.listener({
      uid: "host-a",
      email: "a@example.com",
      emailVerified: true,
    }),
  );
  await screen.findByRole("button", { name: "New event type" });
  fireEvent.click(screen.getByRole("button", { name: "New event type" }));
  expect(await screen.findByRole("dialog")).toBeTruthy();
  await act(async () => state.listener(null));
  expect(screen.queryByRole("dialog")).toBeNull();
  await act(async () =>
    state.listener({
      uid: "host-b",
      email: "b@example.com",
      emailVerified: true,
    }),
  );
  await screen.findByRole("button", { name: "New event type" });
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("attendee response started by an old session is discarded after sign-out", async () => {
  let finish;
  const booking = {
    id: "test",
    attendeeName: "Private Guest",
    attendeeEmail: "private@example.com",
    eventTitle: "Review",
    status: "confirmed",
    hostName: "Test Host",
    startAt: Date.now() + 86400000,
    endAt: Date.now() + 88200000,
    timezone: "UTC",
  };
  state.api.mockImplementation(async (name) => {
    if (name === "Access")
      return { role: "Mentor", canHost: true, isAdmin: false };
    if (name === "Workspace")
      return { profile, events: [], bookings: [booking], connections: [] };
    if (name === "AttendeeDetails")
      return new Promise((resolve) => {
        finish = resolve;
      });
  });
  history.replaceState({}, "", "/bookings");
  render(<App />);
  state.auth.currentUser = { uid: "host-a" };
  await act(async () =>
    state.listener({
      uid: "host-a",
      email: "a@example.com",
      emailVerified: true,
    }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "View attendee details" }),
  );
  state.auth.currentUser = null;
  await act(async () => state.listener(null));
  await act(async () =>
    finish({ booking, profile: { displayName: "Private Guest" } }),
  );
  expect(screen.getByRole("heading", { name: "Welcome back." })).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("registered student sees own meetings without host controls", async () => {
  const calls = state.api.getMockImplementation();
  state.api.mockImplementation(async (name, data) => {
    if (name === "Access")
      return { role: "Silver", canHost: false, isAdmin: false };
    if (name === "MyMeetings")
      return {
        meetings: [
          {
            id: "assigned",
            eventTitle: "Assigned consultation",
            hostName: "Test Host",
            startAt: Date.now() + 86400000,
            endAt: Date.now() + 88200000,
            status: "confirmed",
            meetingUrl: "https://example.com/join",
          },
        ],
      };
    return calls(name, data);
  });
  render(<App />);
  state.auth.currentUser = { uid: "student-a" };
  await act(async () =>
    state.listener({ uid: "student-a", emailVerified: true }),
  );
  expect(
    await screen.findByRole("heading", { name: "Assigned consultation" }),
  ).toBeTruthy();
  expect(screen.getByRole("link", { name: "Join meeting" }).href).toBe(
    "https://example.com/join",
  );
  expect(screen.queryByRole("link", { name: "Availability" })).toBeNull();
  expect(state.api).not.toHaveBeenCalledWith("Workspace", {});
});

test("host searches Users and selects multiple attendees for a dated meeting", async () => {
  const calls = state.api.getMockImplementation();
  state.api.mockImplementation(async (name, data) => {
    if (name === "SearchUsers")
      return {
        users: [
          {
            uid: "student-a",
            name: "Student Alpha",
            email: "alpha@example.test",
          },
          {
            uid: "student-b",
            name: "Student Beta",
            email: "beta@example.test",
          },
        ],
        next: null,
      };
    if (name === "SaveEvent") return { id: "event" };
    return calls(name, data);
  });
  render(<App />);
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: /New dated meeting/i }),
  );
  fireEvent.click(
    screen.getByLabelText("Publish multiple dates and times for each host"),
  );
  fireEvent.change(screen.getByPlaceholderText("Type a name or email"), {
    target: { value: "student" },
  });
  fireEvent.click(
    await screen.findByRole("checkbox", { name: /Student Alpha/ }),
  );
  fireEvent.click(screen.getByRole("checkbox", { name: /Student Beta/ }));
  expect(
    within(
      screen.getByRole("group", {
        name: "Invite registered users to this meeting",
      }),
    )
      .getAllByRole("checkbox")
      .filter((c) => c.checked),
  ).toHaveLength(2);
  expect(state.api).toHaveBeenCalledWith("SearchUsers", {
    search: "student",
    after: null,
  });
  fireEvent.change(screen.getByPlaceholderText("A good conversation"), {
    target: { value: "Assigned meeting" },
  });
  fireEvent.change(screen.getByLabelText("Meeting date"), {
    target: { value: "2030-10-20" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Save event type/ }));
  await act(async () => {});
  const saved = state.api.mock.calls.find(
    ([name]) => name === "SaveEvent",
  )?.[1];
  expect(saved.participantUids).toEqual(["student-a", "student-b"]);
  expect(saved.schedulingMode).toBe("fixed");
  expect(saved.meetingDate).toBe("2030-10-20");
});

test("assigned public meeting directs attendees to their dashboard without a calendar", async () => {
  const calls = state.api.getMockImplementation();
  state.api.mockImplementation(async (name, data) => {
    if (name === "PublicPage")
      return {
        host: profile,
        events: [
          {
            id: "assigned",
            title: "Invited meeting",
            schedulingMode: "fixed",
            fixedStartAt: Date.now() + 86400000,
            duration: 30,
            assignedCount: 2,
            questions: [],
          },
        ],
      };
    return calls(name, data);
  });
  history.replaceState({}, "", "/book/host/assigned");
  render(<App />);
  await act(async () => state.listener(null));
  expect(
    await screen.findByRole("link", { name: "Open My meetings" }),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: /Confirm booking/ })).toBeTruthy();
  expect(state.api.mock.calls.some(([name]) => name === "Slots")).toBe(false);
});

test("invitee must accept before the dashboard exposes the joining link", async () => {
  let accepted = false;
  state.api.mockImplementation(async (name, data) => {
    if (name === "Access")
      return { role: "Silver", canHost: false, isAdmin: false };
    if (name === "MyMeetings")
      return {
        meetings: [
          {
            id: "invite",
            eventTitle: "Invitation test",
            hostName: "Host",
            startAt: Date.now() + 86400000,
            endAt: Date.now() + 88200000,
            status: accepted ? "confirmed" : "invited",
            meetingUrl: accepted ? "https://meet.google.com/abc-defg-hij" : "",
          },
        ],
      };
    if (name === "RespondInvitation") {
      expect(data).toEqual({ id: "invite", response: "accepted" });
      accepted = true;
      return { ok: true };
    }
    throw Error(name);
  });
  render(<App />);
  state.auth.currentUser = { uid: "invitee" };
  await act(async () =>
    state.listener({ uid: "invitee", emailVerified: true }),
  );
  expect(
    await screen.findByRole("button", { name: "Accept invitation" }),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Join meeting" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Accept invitation" }));
  expect(
    await screen.findByRole("link", { name: "Join meeting" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Accept invitation" }),
  ).toBeNull();
});

test("meeting editor exposes round robin and pasted Google Meet or Zoom links", async () => {
  render(<App />);
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: /New dated meeting/ }),
  );
  fireEvent.click(
    screen.getByLabelText("Publish multiple dates and times for each host"),
  );
  fireEvent.change(screen.getByLabelText("Host assignment"), {
    target: { value: "round-robin" },
  });
  expect(screen.getByPlaceholderText("Search team hosts")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: "google-meet" },
  });
  expect(screen.getByLabelText(/Google Meet link/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: "zoom" },
  });
  expect(screen.getByLabelText(/Zoom join link/)).toBeTruthy();
});

test("group participant details preserve the original booking ID even with an older roster response", async () => {
  const original = state.api.getMockImplementation();
  const group = {
    id: "meeting_assigned",
    eventTitle: "Group meeting",
    attendeeName: "Student",
    attendeeEmail: "student@example.test",
    status: "confirmed",
    startAt: Date.now() + 86400000,
    endAt: Date.now() + 88200000,
    participants: [
      { uid: "student", name: "Student", email: "student@example.test" },
    ],
  };
  state.api.mockImplementation(async (name, data) => {
    if (name === "Workspace")
      return { profile, events: [], bookings: [group], connections: [] };
    if (name === "AttendeeDetails") {
      if (!data.participantUid)
        return {
          booking: { eventTitle: group.eventTitle, attendeeName: "Student" },
          participants: group.participants,
        };
      expect(data).toEqual({
        id: "meeting_assigned",
        participantUid: "student",
      });
      return {
        booking: { ...group, timezone: "UTC", answers: [] },
        profile: { displayName: "Student" },
        account: null,
      };
    }
    return original(name, data);
  });
  history.replaceState({}, "", "/bookings");
  render(<App />);
  state.auth.currentUser = { uid: "host" };
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: "View attendee details" }),
  );
  fireEvent.click(
    await screen.findByRole("button", {
      name: /Student · student@example.test/,
    }),
  );
  expect(
    await screen.findByRole("heading", { name: "Student", exact: true }),
  ).toBeTruthy();
});

test("invited user accepts from their specific meeting link and then sees Zoom join button", async () => {
  let accepted = false;
  const original = state.api.getMockImplementation();
  state.api.mockImplementation(async (name, data) => {
    if (name === "PublicPage")
      return {
        host: { ...profile, id: "organizer" },
        events: [
          {
            id: "zoom-event",
            title: "Zoom meeting",
            schedulingMode: "fixed",
            fixedStartAt: Date.now() + 86400000,
            duration: 30,
            assignedCount: 1,
            questions: [],
          },
        ],
      };
    if (name === "MyMeetings")
      return {
        meetings: [
          {
            id: "zoom-event_assigned",
            eventTitle: "Zoom meeting",
            hostName: "Zoom Host",
            startAt: Date.now() + 86400000,
            status: accepted ? "confirmed" : "invited",
            meetingUrl: accepted ? "https://zoom.us/j/12345" : "",
            syncStatus: "synced",
          },
        ],
      };
    if (name === "RespondInvitation") {
      expect(data).toEqual({ id: "zoom-event_assigned", response: "accepted" });
      accepted = true;
      return { ok: true };
    }
    return original(name, data);
  });
  history.replaceState({}, "", "/book/host/zoom-event");
  render(<App />);
  state.auth.currentUser = { uid: "invitee" };
  await act(async () =>
    state.listener({ uid: "invitee", emailVerified: true }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Accept invitation" }),
  );
  expect((await screen.findByRole("link", { name: "Join meeting" })).href).toBe(
    "https://zoom.us/j/12345",
  );
  expect(state.api.mock.calls.some(([name]) => name === "Slots")).toBe(false);
});

test("anyone can register for a shared dated Zoom meeting without signing in", async () => {
  const original = state.api.getMockImplementation();
  const receipt = {
    id: "public-registration",
    token: "private-token",
    eventTitle: "Open Zoom meeting",
    hostName: "Zoom Host",
    startAt: Date.now() + 86400000,
    endAt: Date.now() + 88200000,
    status: "confirmed",
    meetingUrl: "https://zoom.us/j/12345",
    syncStatus: "synced",
    attendeeName: "Public Guest",
    attendeeEmail: "public@example.test",
  };
  state.api.mockImplementation(async (name, data) => {
    if (name === "PublicPage")
      return {
        host: { ...profile, id: "organizer" },
        events: [
          {
            id: "open-zoom",
            title: "Open Zoom meeting",
            audience: "anyone",
            schedulingMode: "fixed",
            fixedStartAt: receipt.startAt,
            duration: 30,
            assignedCount: 1,
            questions: [],
          },
        ],
      };
    if (name === "JoinMeeting") {
      expect(data.eventId).toBe("open-zoom");
      expect(data.email).toBe("public@example.test");
      return receipt;
    }
    if (name === "Registration") return receipt;
    return original(name, data);
  });
  history.replaceState({}, "", "/book/host/open-zoom");
  render(<App />);
  state.auth.currentUser = null;
  await act(async () => state.listener(null));
  fireEvent.change(await screen.findByLabelText("Your name"), {
    target: { value: "Public Guest" },
  });
  fireEvent.change(
    within(
      screen.getByRole("form", { name: "Meeting registration" }),
    ).getByLabelText("Email address"),
    {
      target: { value: "public@example.test" },
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect((await screen.findByRole("link", { name: "Join meeting" })).href).toBe(
    receipt.meetingUrl,
  );
  expect(state.api.mock.calls.some(([name]) => name === "Slots")).toBe(false);
});

test("round-robin picker uses the prefix host-search API and displays the host role", async () => {
  const original = state.api.getMockImplementation();
  state.api.mockImplementation(async (name, data) =>
    name === "SearchHosts"
      ? {
          users: [
            {
              uid: "mentor",
              name: "Test Mentor",
              email: "mentor@example.test",
              role: "Mentor",
            },
          ],
          next: null,
        }
      : original(name, data),
  );
  render(<App />);
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: /New dated meeting/ }),
  );
  fireEvent.click(
    screen.getByLabelText("Publish multiple dates and times for each host"),
  );
  fireEvent.change(screen.getByLabelText("Host assignment"), {
    target: { value: "round-robin" },
  });
  fireEvent.change(screen.getByPlaceholderText("Search team hosts"), {
    target: { value: "Te" },
  });
  expect(
    await screen.findByRole("checkbox", { name: /Test Mentor/ }),
  ).toBeTruthy();
  expect(state.api).toHaveBeenCalledWith("SearchHosts", {
    search: "Te",
    after: null,
  });
  expect(screen.getByText("Mentor", { selector: "small" })).toBeTruthy();
});

test("editing hydrates selected invitee and round-robin host chips with emails", async () => {
  const original = state.api.getMockImplementation();
  const event = {
    id: "existing",
    title: "Existing meeting",
    schedulingMode: "fixed",
    assignmentMode: "round-robin",
    participantUids: ["selected-student"],
    teamHostUids: ["selected-host"],
    meetingDate: "2030-10-20",
    meetingTime: "09:00",
    fixedStartAt: Date.UTC(2030, 9, 20, 9, 0),
    duration: 30,
    minNotice: 0,
    horizonDays: 60,
    bufferBefore: 0,
    bufferAfter: 0,
    dailyLimit: 8,
    cancelHours: 0,
    location: "custom",
    locationValue: "",
    active: true,
    color: "#187b68",
    questions: [],
  };
  state.api.mockImplementation(async (name, data) => {
    if (name === "Workspace")
      return { profile, events: [event], bookings: [], connections: [] };
    if (name === "SelectedUsers")
      return {
        users: data.uids.map((uid) => ({
          uid,
          name: uid === "selected-student" ? "Student" : "Host",
          email:
            uid === "selected-student"
              ? "student@example.test"
              : "mentor@example.test",
        })),
      };
    return original(name, data);
  });
  render(<App />);
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Edit", exact: true }),
  );
  expect(
    await screen.findByRole("button", { name: "student@example.test ×" }),
  ).toBeTruthy();
  expect(
    await screen.findByRole("button", { name: "mentor@example.test ×" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "selected-student ×" }),
  ).toBeNull();
  expect(state.api).toHaveBeenCalledWith("SelectedUsers", {
    uids: ["selected-student"],
  });
});

test("host can inspect delivery failures and save meeting email settings", async () => {
  const original = state.api.getMockImplementation();
  const booking = {
    id: "booking-email",
    eventId: "event-email",
    eventTitle: "Email meeting",
    attendeeName: "Student",
    attendeeEmail: "student@example.test",
    status: "confirmed",
    startAt: Date.now() + 86400000,
    endAt: Date.now() + 88200000,
  };
  const settings = {
    enabled: true,
    invitations: true,
    confirmations: true,
    cancellations: true,
    hostUpdates: true,
    reminderMinutes: [1440, 60],
  };
  state.api.mockImplementation(async (name, data) => {
    if (name === "Workspace")
      return { profile, events: [], bookings: [booking], connections: [] };
    if (name === "MeetingEmails")
      return {
        eventId: booking.eventId,
        emailEnabled: true,
        settings,
        messages: [
          {
            id: "failed-email",
            to: ["student@example.test"],
            subject: "Invitation: Email meeting",
            state: "ERROR",
            hasError: true,
          },
        ],
      };
    if (name === "SaveNotifications") {
      expect(data.eventId).toBe("event-email");
      expect(data.notifications.hostUpdates).toBe(false);
      return { ok: true };
    }
    return original(name, data);
  });
  history.replaceState({}, "", "/bookings");
  render(<App />);
  await act(async () => state.listener({ uid: "host", emailVerified: true }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Email settings & delivery" }),
  );
  expect(await screen.findByText("Failed", { exact: true })).toBeTruthy();
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Notify assigned host and organizing admin",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save email settings" }));
  await screen.findByText("Email settings saved.");
  expect(
    state.api.mock.calls.some(([name]) => name === "SaveNotifications"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Retry failed email" }));
  await act(async () => {});
  expect(state.api).toHaveBeenCalledWith("MeetingEmails", {
    id: "booking-email",
    action: "retry",
    mailId: "failed-email",
  });
});

test("workspace stays loaded across navigation and does not refresh on a timer", async () => {
  render(<App />);
  await act(async () =>
    state.listener({
      uid: "host-a",
      email: "a@example.com",
      emailVerified: true,
    }),
  );
  await screen.findByRole("button", { name: "New event type" });
  expect(
    state.api.mock.calls.filter(([name]) => name === "Workspace"),
  ).toHaveLength(1);
  fireEvent.click(screen.getByRole("link", { name: "Availability" }));
  await screen.findByRole("button", { name: "Save availability" });
  expect(
    state.api.mock.calls.filter(([name]) => name === "Workspace"),
  ).toHaveLength(1);
  vi.useFakeTimers();
  try {
    await act(async () => vi.advanceTimersByTimeAsync(90000));
    expect(
      state.api.mock.calls.filter(([name]) => name === "Workspace"),
    ).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});
