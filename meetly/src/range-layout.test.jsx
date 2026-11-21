import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { HostScheduleOptions } from "./components/HostScheduleOptions";
afterEach(cleanup);
test("first date range keeps its own time controls before later ranges", () => {
  render(
    <HostScheduleOptions
      uid="host"
      name="Host"
      timezone="UTC"
      duration={30}
      value={[]}
      onDraftChange={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Add schedule block" }));
  const first = screen.getByLabelText("Block 1 time range 1 Starts");
  const second = screen.getByLabelText("Block 2 time range 1 Starts");
  fireEvent.change(second, { target: { value: "14:00" } });
  expect(first.value).toBe("09:00");
  expect(second.value).toBe("14:00");
  expect(screen.getAllByLabelText("Date selection")).toHaveLength(2);
});
