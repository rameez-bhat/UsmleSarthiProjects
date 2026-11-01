import test from "node:test";
import assert from "node:assert/strict";
import {
  notificationSettings,
  emailAllowed,
  hostRecipients,
  mailSummary,
} from "../notifications.js";
test("meeting notification defaults retain invitations, confirmations and configured reminders", () => {
  const settings = notificationSettings();
  assert.equal(settings.enabled, true);
  assert.equal(emailAllowed(settings, "invitation"), true);
  assert.equal(emailAllowed(settings, "confirmation"), true);
  assert.equal(emailAllowed(settings, "reminder_1440"), true);
  assert.equal(emailAllowed(settings, "reminder_15"), false);
});
test("meeting policy independently gates attendee notices, staff updates, cancellations and reminders", () => {
  const settings = notificationSettings({
    invitations: false,
    confirmations: false,
    hostUpdates: true,
    cancellations: false,
    reminderMinutes: [15],
  });
  assert.equal(emailAllowed(settings, "invitation"), false);
  assert.equal(emailAllowed(settings, "confirmation"), false);
  assert.equal(emailAllowed(settings, "confirmation", true), true);
  assert.equal(emailAllowed(settings, "cancel", true), false);
  assert.equal(emailAllowed(settings, "declined"), false);
  assert.equal(emailAllowed(settings, "reminder_15"), true);
  assert.equal(emailAllowed(settings, "reminder_60"), false);
  assert.equal(
    emailAllowed(notificationSettings({ enabled: false }), "invitation", true),
    false,
  );
  assert.equal(
    emailAllowed(
      notificationSettings({ hostUpdates: false }),
      "confirmation",
      true,
    ),
    false,
  );
});
test("assigned round-robin host and organizing admin are distinct notification recipients, deduplicated by email", () => {
  const people = hostRecipients({
    hostEmail: "host@example.test",
    hostName: "Host",
    organizerEmail: "admin@example.test",
    organizerName: "Admin",
  });
  assert.deepEqual(
    people.map((p) => p.uid),
    ["host", "organizer"],
  );
  assert.equal(
    hostRecipients({
      hostEmail: "SAME@example.test",
      organizerEmail: "same@example.test",
    }).length,
    1,
  );
});
test("malformed notification settings are rejected and reminder choices deduplicate", () => {
  for (const input of [
    null,
    [],
    { enabled: "yes" },
    { reminderMinutes: [5] },
    { reminderMinutes: "60" },
  ])
    assert.throws(() => notificationSettings(input));
  assert.deepEqual(
    notificationSettings({ reminderMinutes: [60, 1440, 60] }).reminderMinutes,
    [1440, 60],
  );
});
test("email delivery summary excludes message bodies, private links and raw SMTP errors", () => {
  const summary = mailSummary("id", {
    to: ["a@example.test"],
    bookingId: "booking",
    message: { subject: "Invitation", text: "private token" },
    delivery: {
      state: "ERROR",
      error: "private provider details",
      attempts: 2,
    },
  });
  assert.equal(summary.state, "ERROR");
  assert.equal(summary.hasError, true);
  assert.equal(summary.attempts, 2);
  assert.equal("message" in summary, false);
  assert.equal("error" in summary, false);
});
