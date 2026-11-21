import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { trackRequest, getRequestActivity } from "./request-activity";
import { RequestActivity } from "./main";
afterEach(cleanup);
test("concurrent requests keep the visible loader until all finish", async () => {
  render(<RequestActivity />);
  expect(screen.queryByRole("status")).toBeNull();
  let finishFirst, finishSecond, first, second;
  act(() => {
    first = trackRequest(
      "AttendeeDetails",
      () => new Promise((resolve) => (finishFirst = resolve)),
    );
    second = trackRequest(
      "SaveEvent",
      () => new Promise((resolve) => (finishSecond = resolve)),
    );
  });
  expect(screen.getByRole("status").textContent).toContain(
    "Loading attendee details",
  );
  expect(screen.getByRole("status").textContent).toContain("2 requests");
  await act(async () => {
    finishFirst("done");
    await first;
  });
  expect(screen.getByRole("status").textContent).toContain(
    "Saving your meeting",
  );
  await act(async () => {
    finishSecond("saved");
    await second;
  });
  expect(screen.queryByRole("status")).toBeNull();
  expect(getRequestActivity().count).toBe(0);
});
test("failed and synchronous throwing requests clear the loader and preserve errors", async () => {
  render(<RequestActivity />);
  let reject, request;
  act(() => {
    request = trackRequest(
      "SearchUsers",
      () => new Promise((resolve, rejectFn) => (reject = rejectFn)),
    );
  });
  expect(screen.getByRole("status").textContent).toContain("Searching users");
  await act(async () => {
    reject(Error("Failed"));
    await expect(request).rejects.toThrow("Failed");
  });
  expect(screen.queryByRole("status")).toBeNull();
  await act(async () => {
    await expect(
      trackRequest("Unknown", () => {
        throw Error("Immediate");
      }),
    ).rejects.toThrow("Immediate");
  });
  expect(getRequestActivity().count).toBe(0);
});
