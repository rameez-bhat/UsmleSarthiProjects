import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SavedSlotsCalendar } from "./components/SavedSlotsCalendar";
afterEach(cleanup);
test("saved calendar highlights exact existing dates and selects one without changing slots", () => {
  const select = vi.fn();
  const slots = [
    { date: "2026-12-01" },
    { date: "2026-12-01" },
    { date: "2026-12-03" },
  ];
  render(
    <SavedSlotsCalendar
      slots={slots}
      selected="2026-12-01"
      onSelect={select}
    />,
  );
  expect(
    screen
      .getByRole("button", { name: "2026-12-01, 2 saved appointments" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen.getByRole("button", { name: "2026-12-02, 0 saved appointments" })
      .disabled,
  ).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "2026-12-03, 1 saved appointments" }),
  );
  expect(select).toHaveBeenCalledWith("2026-12-03");
  expect(slots).toHaveLength(3);
});
