import test from "node:test";
import assert from "node:assert/strict";
import {
  googleConnectionError,
  hostConnectionLabel,
} from "../calendar-requirements.js";
test("requires Google for every host including organizer even with Zoom connected", () => {
  const result = googleConnectionError([
    { name: "Shafi", providers: ["zoom"] },
    { name: "Pawan", providers: [] },
    { name: "Aasifa", providers: ["google"] },
  ]);
  assert.match(result, /Shafi: please connect your Google account to SAMAY/);
  assert.match(result, /Pawan: please connect/);
  assert.doesNotMatch(result, /Aasifa/);
  assert.equal(
    googleConnectionError([{ name: "Shafi", providers: ["google", "zoom"] }]),
    null,
  );
});

test("missing scheduler profiles resolve a name and email instead of exposing UID", () => {
  assert.equal(
    hostConnectionLabel(
      undefined,
      { name: "Pawan", email: "pawan@example.com" },
      "137",
    ),
    "Pawan (pawan@example.com)",
  );
  assert.equal(
    hostConnectionLabel({ name: "137" }, { email: "host@example.com" }, "137"),
    "host@example.com",
  );
  assert.equal(
    hostConnectionLabel({}, {}, "06vDUMwdw4PcII74k4JZzm5dc613"),
    "A selected host",
  );
  assert.equal(
    hostConnectionLabel({ name: "Shafi", email: "shafi@example.com" }, {}),
    "Shafi (shafi@example.com)",
  );
});
