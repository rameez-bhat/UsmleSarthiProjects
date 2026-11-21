import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PhoneContact } from "./components/PhoneContact";
afterEach(cleanup);
test("phone meetings provide direct call and WhatsApp actions", () => {
  render(
    <PhoneContact
      instructions={
        "Direct/WhatsApp Phone Call: +919876543210\nWhatsApp: https://wa.me/919876543210"
      }
    />,
  );
  expect(
    screen.getByRole("link", { name: "Call host" }).getAttribute("href"),
  ).toBe("tel:+919876543210");
  expect(
    screen.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href"),
  ).toBe("https://wa.me/919876543210");
});
