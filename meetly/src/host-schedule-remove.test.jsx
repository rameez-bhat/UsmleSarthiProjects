import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HostScheduleOptions } from "./components/HostScheduleOptions";
afterEach(cleanup);
function setup() {
  const changed = vi.fn();
  render(
    <HostScheduleOptions
      uid="a"
      name="Host A"
      timezone="UTC"
      duration={30}
      value={[]}
      onDraftChange={changed}
    />,
  );
  fireEvent.change(screen.getByLabelText("Date 1"), {
    target: { value: "2026-12-10" },
  });
  return changed;
}
test("removing preview appointments and dates changes the submitted draft and can be undone", () => {
  const changed = setup();
  expect(changed.mock.lastCall[1].slots).toHaveLength(5);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Remove 09:00 on 2026-12-10 for Host A",
    }),
  );
  expect(changed.mock.lastCall[1].slots).toHaveLength(4);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Remove all times on 2026-12-10 for Host A",
    }),
  );
  expect(changed.mock.lastCall[1].slots).toHaveLength(0);
  expect(changed.mock.lastCall[1].error).toContain("at least one");
  fireEvent.click(
    screen.getByRole("button", { name: "Restore removed preview times" }),
  );
  expect(changed.mock.lastCall[1].slots).toHaveLength(5);
});
test("date and time input rows can be removed independently", () => {
  const changed = setup();
  fireEvent.change(screen.getByLabelText("Date selection"), {
    target: { value: "multiple" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add date for Host A" }));
  fireEvent.change(screen.getByLabelText("Date 2"), {
    target: { value: "2026-12-11" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Remove date 1 for Host A" }),
  );
  expect(screen.getByLabelText("Date 1").value).toBe("2026-12-11");
  fireEvent.change(screen.getByLabelText("Time selection"), {
    target: { value: "multiple" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add time for Host A" }));
  fireEvent.change(screen.getByLabelText("Start time 2"), {
    target: { value: "14:00" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Remove time 1 for Host A" }),
  );
  expect(changed.mock.lastCall[1].slots.map((s) => s.time)).toEqual(["14:00"]);
});
