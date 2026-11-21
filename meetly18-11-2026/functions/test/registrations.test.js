import test from "node:test";
import assert from "node:assert/strict";
import { registerParticipant, registrationReceipt } from "../registrations.js";
const booking = () => ({
  eventTitle: "Open Zoom meeting",
  hostName: "Host",
  status: "confirmed",
  startAt: 200000,
  endAt: 260000,
  syncStatus: "synced",
  meetingUrl: "https://zoom.us/j/12345",
  participants: [
    {
      uid: "invited",
      name: "Invited",
      email: "invited@example.test",
      response: "invited",
    },
  ],
});
test("public registrations join the shared meeting without confirming other invitees", () => {
  const b = booking(),
    people = registerParticipant(
      b,
      { uid: "guest_1", name: "Public user", email: "guest@example.test" },
      100000,
      100,
    );
  assert.equal(people.length, 2);
  assert.equal(people[0].response, "invited");
  assert.equal(people[1].response, "accepted");
  const receipt = registrationReceipt(
    "registration",
    {
      participantUid: "guest_1",
      name: "Public user",
      email: "guest@example.test",
    },
    { ...b, participants: people },
  );
  assert.equal(receipt.status, "confirmed");
  assert.equal(receipt.meetingUrl, b.meetingUrl);
  assert.equal("participants" in receipt, false);
});
test("email alone cannot claim another user's invitation; full and closed meetings reject registration", () => {
  const b = booking();
  assert.throws(
    () =>
      registerParticipant(
        b,
        { uid: "guest", email: "invited@example.test" },
        100000,
        100,
      ),
    /already has an invitation/,
  );
  assert.throws(
    () =>
      registerParticipant(
        b,
        { uid: "guest", email: "new@example.test" },
        100000,
        1,
      ),
    /full/,
  );
  assert.throws(
    () =>
      registerParticipant(
        { ...b, status: "cancelled" },
        { uid: "guest", email: "new@example.test" },
        100000,
      ),
    /no longer open/,
  );
  assert.throws(
    () =>
      registerParticipant(
        b,
        { uid: "guest", email: "new@example.test" },
        200000,
      ),
    /no longer open/,
  );
});
test("cancellation removes private joining access and preserves other attendees", () => {
  const b = booking();
  b.participants = registerParticipant(
    b,
    { uid: "guest", name: "Guest", email: "guest@example.test" },
    100000,
  );
  b.participants = b.participants.map((p) =>
    p.uid === "guest" ? { ...p, response: "declined" } : p,
  );
  assert.equal(
    registrationReceipt("id", { participantUid: "guest" }, b).status,
    "cancelled",
  );
  assert.equal(
    registrationReceipt("id", { participantUid: "guest" }, b).meetingUrl,
    "",
  );
  assert.equal(b.participants[0].response, "invited");
});
