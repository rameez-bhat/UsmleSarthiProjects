import React from "react";
import { test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  cleanup,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./main";
beforeEach(() => {
  localStorage.clear();
  history.replaceState({}, "", "/");
});
afterEach(() => cleanup());
test("create an event and pause it without removing the event definition", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    await screen.findByRole("button", { name: "New event type" }),
  );
  const dialog = await screen.findByRole("dialog");
  await user.type(
    within(dialog).getByLabelText("Event name"),
    "Staff consultation",
  );
  await user.click(
    within(dialog).getByRole("button", { name: /Save event type/ }),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(
    screen.getByRole("heading", { name: "Staff consultation" }),
  ).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Pause Staff consultation" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Enable Staff consultation" }),
    ).toBeTruthy(),
  );
  const saved = JSON.parse(localStorage.getItem("meetly.demo"));
  expect(
    saved.events.find((e) => e.title === "Staff consultation").active,
  ).toBe(false);
});
test("public booking creates a private manage link and reserves a time", async () => {
  const user = userEvent.setup();
  history.replaceState({}, "", "/book/shafi/intro");
  render(<App />);
  await screen.findByRole("region", { name: "Available meeting dates" });
  await user.click(
    screen.getByRole("button", { name: "Next available month" }),
  );
  const next = new Date();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  while ([0, 6].includes(next.getDay())) next.setDate(next.getDate() + 1);
  await user.click(
    await screen.findByRole("button", {
      name: new RegExp(
        `^${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}, [1-9]`,
      ),
    }),
  );
  const slot = (
    await screen.findAllByRole("button", {
      name: /, \d{2}:\d{2} – \d{2}:\d{2}/,
    })
  )[0];
  await user.click(slot);
  await user.type(screen.getByLabelText("Your name"), "Test Guest");
  await user.type(screen.getByLabelText("Email address"), "guest@example.com");
  await user.click(
    screen.getByRole("button", { name: /^Confirm booking with/ }),
  );
  await screen.findByRole("heading", { name: "A little time, well spent." });
  expect(location.pathname.startsWith("/manage/")).toBe(true);
  expect(new URLSearchParams(location.search).get("token")).toBeTruthy();
  const saved = JSON.parse(localStorage.getItem("meetly.demo"));
  expect(saved.bookings).toHaveLength(1);
  expect(saved.bookings[0].attendeeEmail).toBe("guest@example.com");
  await user.click(screen.getByRole("button", { name: "Cancel meeting" }));
  const dialog = await screen.findByRole("dialog");
  await user.click(
    within(dialog).getByRole("button", { name: "Cancel meeting" }),
  );
  await screen.findByRole("heading", { name: "Plans change. That’s okay." });
  expect(
    JSON.parse(localStorage.getItem("meetly.demo")).bookings[0].status,
  ).toBe("cancelled");
});
test("availability changes persist and overrides remain separate from weekly hours", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("link", { name: "Availability" }));
  await user.click(await screen.findByLabelText("Monday"));
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const iso = date.toISOString().slice(0, 10);
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: iso } });
  await user.click(screen.getByRole("button", { name: "Add override" }));
  await user.click(screen.getByRole("button", { name: "Save availability" }));
  await waitFor(() => {
    const p = JSON.parse(localStorage.getItem("meetly.demo")).profile;
    expect(p.schedule["1"]).toEqual([]);
    expect(p.overrides[iso]).toEqual([]);
  });
});

test("direct page URLs survive reload and browser history navigation", async () => {
  const user = userEvent.setup();
  history.replaceState({}, "", "/availability");
  render(<App />);
  expect(
    await screen.findByRole("button", { name: "Save availability" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Bookings" }));
  expect(location.pathname).toBe("/bookings");
  history.replaceState({}, "", "/settings");
  fireEvent.popState(window);
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Your profile & preferences." }),
    ).toBeTruthy(),
  );
  cleanup();
  history.replaceState({}, "", "/availability/");
  render(<App />);
  expect(
    await screen.findByRole("button", { name: "Save availability" }),
  ).toBeTruthy();
});

test("public booking page loads on browsers without crypto.randomUUID", async () => {
  const nativeCrypto = globalThis.crypto;
  vi.stubGlobal("crypto", {
    getRandomValues: nativeCrypto.getRandomValues.bind(nativeCrypto),
  });
  try {
    history.replaceState({}, "", "/book/shafi/intro");
    render(<App />);
    await screen.findByRole("region", { name: "Available meeting dates" });
  } finally {
    vi.unstubAllGlobals();
  }
});
test("create and book a dated meeting outside weekly hours using its shareable URL", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "New dated meeting" }));
  await user.click(
    screen.getByLabelText("Publish multiple dates and times for each host"),
  );
  const dialog = await screen.findByRole("dialog");
  await user.type(
    within(dialog).getByLabelText("Event name"),
    "Sunday physician appointment",
  );
  const date = new Date();
  date.setDate(date.getDate() + 7);
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  fireEvent.change(within(dialog).getByLabelText("Meeting date"), {
    target: { value: iso },
  });
  fireEvent.change(within(dialog).getByLabelText("Meeting start time"), {
    target: { value: "10:00" },
  });
  await user.click(
    within(dialog).getByRole("button", { name: "Save event type" }),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  const event = JSON.parse(localStorage.getItem("meetly.demo")).events.find(
    (e) => e.title === "Sunday physician appointment",
  );
  expect(event.schedulingMode).toBe("fixed");
  expect(event.audience).toBe("anyone");
  history.pushState({}, "", `/book/shafi/${event.id}`);
  fireEvent.popState(window);
  await screen.findByRole("region", { name: "Available meeting dates" });
  const offered = await screen.findByRole("button", {
    name: /, \d{2}:\d{2} – \d{2}:\d{2}/,
  });
  await user.click(offered);
  await user.type(screen.getByLabelText("Your name"), "Dated Guest");
  await user.type(screen.getByLabelText("Email address"), "dated@example.com");
  await user.click(
    screen.getByRole("button", { name: /^Confirm booking with/ }),
  );
  await screen.findByRole("heading", { name: "A little time, well spent." });
  expect(
    JSON.parse(localStorage.getItem("meetly.demo")).bookings[0].startAt,
  ).toBe(event.fixedStartAt);
});
test("registered-only meeting asks for existing-account sign-in without offering signup", async () => {
  const demo = await import("./demo");
  const data = demo.loadDemo();
  data.events[0].audience = "registered";
  demo.saveDemo(data);
  history.replaceState({}, "", "/book/shafi/intro");
  render(<App />);
  await screen.findByRole("region", { name: "Available meeting dates" });
  await userEvent.click(
    screen.getByRole("button", { name: "Next available month" }),
  );
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  while ([0, 6].includes(date.getDay())) date.setDate(date.getDate() + 1);
  await userEvent.click(
    await screen.findByRole("button", {
      name: new RegExp(
        `^${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}, [1-9]`,
      ),
    }),
  );
  const slot = (
    await screen.findAllByRole("button", {
      name: /, \d{2}:\d{2} – \d{2}:\d{2}/,
    })
  )[0];
  await userEvent.click(slot);
  expect(
    await screen.findByRole("button", { name: "Sign in", exact: true }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: /^Confirm booking with/ }),
  ).toBeNull();
  expect(screen.queryByText("New here? Create an account")).toBeNull();
});

test("occupied dated meeting shows unavailable without a calendar or booking form", async () => {
  const demo = await import("./demo");
  const data = demo.loadDemo();
  const start = Math.ceil((Date.now() + 7 * 86400000) / 60000) * 60000;
  data.events[0] = {
    ...data.events[0],
    schedulingMode: "fixed",
    fixedStartAt: start,
    minNotice: 0,
    audience: "anyone",
  };
  data.bookings = [
    {
      id: "occupied",
      status: "confirmed",
      startAt: start,
      endAt: start + 1800000,
      lockStart: start,
      lockEnd: start + 1800000,
    },
  ];
  demo.saveDemo(data);
  history.replaceState({}, "", "/book/shafi/intro");
  render(<App />);
  await screen.findByText(/No bookable times are available/);
  expect(screen.queryByRole("button", { name: "Next month" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: /^Confirm booking with/ }),
  ).toBeNull();
  expect(screen.queryByLabelText("Your name")).toBeNull();
});

test("host can open a read-only attendee dialog containing booking answers and guest details", async () => {
  const demo = await import("./demo");
  const data = demo.loadDemo();
  const start = Date.now() + 86400000;
  data.bookings = [
    {
      id: "guest-details",
      eventTitle: "Application review",
      attendeeName: "Test Guest",
      attendeeEmail: "guest@example.com",
      hostName: data.profile.name,
      status: "confirmed",
      startAt: start,
      endAt: start + 1800000,
      timezone: data.profile.timezone,
      notes: "Discuss applications",
      questionLabels: ["Graduation year"],
      answers: ["2025"],
    },
  ];
  demo.saveDemo(data);
  history.replaceState({}, "", "/bookings");
  render(<App />);
  await userEvent.click(
    screen.getByRole("button", { name: "View attendee details" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(
    within(dialog).getByRole("heading", { name: "Test Guest" }),
  ).toBeTruthy();
  expect(within(dialog).getByText("guest@example.com")).toBeTruthy();
  expect(within(dialog).getByText("Graduation year")).toBeTruthy();
  expect(within(dialog).getByText("2025")).toBeTruthy();
  expect(
    within(dialog).getByText(/No verified registered profile/),
  ).toBeTruthy();
  expect(within(dialog).queryByRole("textbox")).toBeNull();
});

test("navigation can close with its button, backdrop, or Escape", async () => {
  render(<App />);
  const open = screen.getByRole("button", { name: "Open navigation" });
  fireEvent.click(open);
  expect(open.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
  expect(open.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(open);
  fireEvent.click(screen.getByRole("button", { name: "Dismiss navigation" }));
  expect(open.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(open);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(open.getAttribute("aria-expanded")).toBe("false");
});

test("deleting an event requires confirmation and removes its booking link", async () => {
  render(<App />);
  const buttons = await screen.findAllByRole("button", {
    name: "Delete event",
  });
  fireEvent.click(buttons[0]);
  const dialog = await screen.findByRole("dialog");
  expect(
    within(dialog).getByText(/Upcoming bookings must be cancelled/),
  ).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete event" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.queryAllByRole("button", { name: "Delete event" }).length).toBe(
    buttons.length - 1,
  );
});
