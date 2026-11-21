import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHostPhones,
  phoneInstructions,
  bookingJoiningInstructions,
} from "../phone-location.js";
test("all organizers and hosts need a country-coded phone number", () => {
  const ids = ["organizer", "pawan"];
  assert.throws(
    () =>
      normalizeHostPhones(
        { organizer: "+919876543210" },
        ids,
        new Map([["pawan", "Pawan"]]),
      ),
    /Pawan/,
  );
  assert.throws(
    () => normalizeHostPhones({ organizer: "9876543210" }, ["organizer"]),
    /country code/,
  );
  assert.deepEqual(
    normalizeHostPhones(
      { organizer: "+91 98765 43210", extra: "+12025550123" },
      ["organizer"],
    ),
    { organizer: "+919876543210" },
  );
});
test("host-choice and round-robin confirmations email only the assigned host number", () => {
  const event = {
    hostPhones: { organizer: "+919876543210", pawan: "+12025550123" },
  };
  for (const host of ["organizer", "pawan"]) {
    const details = phoneInstructions(event, host);
    const emailDetails = bookingJoiningInstructions({
      location: "phone",
      locationValue: details,
      meetingUrl: "",
    });
    assert.ok(emailDetails.includes(event.hostPhones[host]));
    assert.ok(
      emailDetails.includes(`https://wa.me/${event.hostPhones[host].slice(1)}`),
    );
    assert.equal(
      emailDetails.includes(
        event.hostPhones[host === "organizer" ? "pawan" : "organizer"],
      ),
      false,
    );
  }
  assert.throws(() => phoneInstructions(event, "unknown"), /selected host/);
});
