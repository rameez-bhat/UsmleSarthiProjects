import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
const state = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock("./firestore-scheduler", () => ({
  getSchedulerAccess: vi.fn(async () => ({ isAdmin: false })),
}));
vi.mock("./user-search-direct", () => ({ searchUsersDirect: state.search }));
import { AdminAccountManager } from "./components/AdminAccountManager";
afterEach(cleanup);
test("account management refuses non-admin access before searching identities", async () => {
  render(<AdminAccountManager />);
  fireEvent.change(screen.getByLabelText("Search account by name or email"), {
    target: { value: "Test" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Search accounts" }).closest("form"),
  );
  expect(
    await screen.findByText("Administrator access required."),
  ).toBeTruthy();
  expect(state.search).not.toHaveBeenCalled();
});
