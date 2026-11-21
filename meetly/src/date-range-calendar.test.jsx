import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DateRangeCalendar } from "./components/DateRangeCalendar";
afterEach(cleanup);
test("calendar selects start and end dates inclusively", () => {
  const change = vi.fn();
  const { rerender } = render(
    <DateRangeCalendar
      label="Dates"
      from="2026-12-01"
      to=""
      onChange={change}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dates 2026-12-03" }));
  expect(change).toHaveBeenLastCalledWith("2026-12-03", "");
  rerender(
    <DateRangeCalendar
      label="Dates"
      from="2026-12-03"
      to=""
      onChange={change}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dates 2026-12-07" }));
  expect(change).toHaveBeenLastCalledWith("2026-12-03", "2026-12-07");
  rerender(
    <DateRangeCalendar
      label="Dates"
      from="2026-12-03"
      to="2026-12-07"
      onChange={change}
    />,
  );
  expect(
    screen
      .getByRole("button", { name: "Dates 2026-12-05" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});
