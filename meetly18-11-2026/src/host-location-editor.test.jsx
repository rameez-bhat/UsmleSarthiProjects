import React, { useState } from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
vi.mock("./firebase", () => ({ live: false }));
import { HostPhoneEditor } from "./components/HostPhoneEditor";
afterEach(cleanup);
test("changing organizer location does not change other hosts and phone field is host-specific", () => {
  function Example() {
    const [value, set] = useState({});
    return (
      <HostPhoneEditor
        uids={["a", "b"]}
        organizer={{ uid: "a", name: "Shafi" }}
        value={value}
        defaultLocation={value.a?.location || "google-meet"}
        onChange={set}
      />
    );
  }
  render(<Example />);
  fireEvent.change(screen.getByLabelText("Location for Shafi (Organizer)"), {
    target: { value: "phone" },
  });
  expect(
    screen.getByLabelText("Phone number for Shafi (Organizer)"),
  ).toBeTruthy();
  expect(screen.getByLabelText("Location for Selected host").value).toBe(
    "google-meet",
  );
  fireEvent.change(screen.getByLabelText("Location for Selected host"), {
    target: { value: "zoom" },
  });
  expect(screen.getByLabelText(/Zoom link for Selected host/)).toBeTruthy();
  expect(screen.getByLabelText("Location for Shafi (Organizer)").value).toBe(
    "phone",
  );
});
