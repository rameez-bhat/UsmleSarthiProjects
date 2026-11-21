import test from "node:test";
import assert from "node:assert/strict";
import { sameBookingSettings } from "../booking-settings.js";
import { eventForHost } from "../host-locations.js";
test("unchanged source snapshots pass even when the selected host has a different meeting location", () => {
  const source = {
    location: "google-meet",
    locationValue: "",
    hostLocations: {
      host: { location: "zoom", locationValue: "https://zoom.us/j/123456789" },
    },
    active: true,
  };
  assert.equal(
    sameBookingSettings(eventForHost(source, "host"), source),
    false,
  );
  assert.equal(sameBookingSettings(source, structuredClone(source)), true);
});
test("unchanged phone settings are compared before phone instructions are derived", () => {
  const source = {
    location: "phone",
    locationValue: "",
    hostLocations: { host: { location: "phone", phone: "+919876543210" } },
  };
  assert.equal(sameBookingSettings(source, structuredClone(source)), true);
  assert.equal(
    sameBookingSettings(eventForHost(source, "host"), source),
    false,
  );
});
test("key order is ignored while concurrent settings changes still fail", () => {
  const source = {
    active: true,
    hostSlots: [{ hostUid: "host", startAt: 100 }],
    slotsVersion: 1,
  };
  assert.equal(
    sameBookingSettings(source, {
      slotsVersion: 1,
      hostSlots: [{ startAt: 100, hostUid: "host" }],
      active: true,
    }),
    true,
  );
  for (const changed of [
    { ...source, active: false },
    { ...source, slotsVersion: 2 },
    { ...source, hostSlots: [] },
  ])
    assert.equal(sameBookingSettings(source, changed), false);
});
