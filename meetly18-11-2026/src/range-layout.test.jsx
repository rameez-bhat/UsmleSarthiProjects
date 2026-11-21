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
  fireEvent.change(screen.getByLabelText("Date selection"), {
    target: { value: "range" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Add another date range" }),
  );
  const first = within(
    screen.getByRole("group", { name: "Date range 1 settings" }),
  );
  expect(first.getByLabelText("Range starts 1").value).toBe("09:00");
  expect(first.getByLabelText("Range ends").value).toBe("11:30");
  fireEvent.change(screen.getByLabelText("Range starts range 2"), {
    target: { value: "14:00" },
  });
  expect(first.getByLabelText("Range starts 1").value).toBe("09:00");
  expect(screen.queryByText(/Range 1 uses the times/)).toBeNull();
});
