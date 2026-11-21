import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHostLocations, eventForHost } from "../host-locations.js";
import { bookingJoiningInstructions } from "../phone-location.js";
test("each host retains an independent location and student gets only booked host details", () => {
  const hostLocations = normalizeHostLocations(
    {
      organizer: {
        location: "google-meet",
        locationValue: "https://meet.google.com/abc-defg-hij",
      },
      pawan: { location: "phone", phone: "+12025550123" },
      zoom: { location: "zoom", locationValue: "https://zoom.us/j/123456789" },
    },
    ["organizer", "pawan", "zoom"],
    {},
  );
  const event = { location: "google-meet", hostLocations };
  assert.equal(
    eventForHost(event, "organizer").locationValue,
    "https://meet.google.com/abc-defg-hij",
  );
  const phone = eventForHost(event, "pawan");
  assert.equal(phone.location, "phone");
  assert.ok(bookingJoiningInstructions(phone).includes("+12025550123"));
  assert.equal(
    bookingJoiningInstructions(phone).includes("meet.google.com"),
    false,
  );
  assert.equal(
    eventForHost(event, "zoom").locationValue,
    "https://zoom.us/j/123456789",
  );
});
test("legacy location remains supported and malformed per-host values fail validation", () => {
  const legacy = {
    location: "zoom",
    locationValue: "https://zoom.us/j/123456789",
  };
  assert.equal(eventForHost(legacy, "a"), legacy);
  assert.throws(
    () =>
      normalizeHostLocations(
        { a: { location: "phone", phone: "123" } },
        ["a"],
        legacy,
      ),
    /country code/,
  );
  assert.throws(
    () =>
      normalizeHostLocations(
        {
          a: {
            location: "google-meet",
            locationValue: "https://zoom.us/j/123",
          },
        },
        ["a"],
        legacy,
      ),
    /Google Meet/,
  );
});
