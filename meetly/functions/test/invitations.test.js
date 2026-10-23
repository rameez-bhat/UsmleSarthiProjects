import test from "node:test";
import assert from "node:assert/strict";
import {
  respondToInvitation,
  chooseRoundRobin,
  canEnterRoom,
  confirmedParticipants,
} from "../invitations.js";
import { personalMeeting } from "../participants.js";
import { jitsiToken } from "../rooms.js";
const booking = () => ({
  ownerId: "host",
  organizerId: "organizer",
  eventTitle: "Consultation",
  status: "confirmed",
  startAt: 200000,
  endAt: 260000,
  meetingUrl: "https://meet.google.com/abc-defg-hij",
  participantUids: ["a", "b"],
  participants: [
    { uid: "a", response: "invited" },
    { uid: "b", response: "invited" },
  ],
});
test("joining details stay hidden until each invitee accepts", () => {
  const b = booking();
  assert.equal(personalMeeting("id", b, "a").status, "invited");
  assert.equal(personalMeeting("id", b, "a").meetingUrl, "");
  b.participants = respondToInvitation(b, "a", "accepted", 100000);
  assert.equal(personalMeeting("id", b, "a").status, "confirmed");
  assert.equal(personalMeeting("id", b, "a").meetingUrl, b.meetingUrl);
  assert.equal(personalMeeting("id", b, "b").meetingUrl, "");
  assert.equal(confirmedParticipants(b).length, 1);
  assert.equal(b.participants[0].respondedAt, 100000);
});
test("decline, duplicate response, unauthorized users and expired invites", () => {
  const b = booking();
  for (const args of [
    ["other", "accepted", 100000],
    ["a", "yes", 100000],
    ["a", "accepted", 200000],
  ])
    assert.throws(() => respondToInvitation(b, ...args));
  b.participants = respondToInvitation(b, "a", "declined", 100000);
  assert.equal(personalMeeting("id", b, "a").status, "declined");
  assert.equal(personalMeeting("id", b, "a").meetingUrl, "");
  assert.equal(respondToInvitation(b, "a", "declined", 100001), null);
  assert.throws(() => respondToInvitation(b, "a", "accepted", 100001));
  b.status = "cancelled";
  assert.throws(() => respondToInvitation(b, "b", "accepted", 100000));
});
test("round robin rotates fairly among available hosts and handles no candidates", () => {
  const counts = {},
    team = [{ uid: "a" }, { uid: "b" }],
    order = [];
  for (let i = 0; i < 4; i++) {
    const h = chooseRoundRobin(team, counts);
    order.push(h.uid);
    counts[h.uid] = (counts[h.uid] || 0) + 1;
  }
  assert.deepEqual(order, ["a", "b", "a", "b"]);
  assert.equal(chooseRoundRobin([{ uid: "b" }], { a: 0, b: 3 }).uid, "b");
  assert.equal(chooseRoundRobin([]), null);
});
test("Meetly room admits only the host, organizer and accepted invitees", () => {
  const b = booking();
  assert.equal(canEnterRoom(b, "a"), false);
  assert.equal(canEnterRoom(b, "host"), true);
  assert.equal(canEnterRoom(b, "organizer"), true);
  b.participants = respondToInvitation(b, "a", "accepted", 100000);
  assert.equal(canEnterRoom(b, "a"), true);
  assert.equal(canEnterRoom(b, "b"), false);
  assert.equal(canEnterRoom(b, "other"), false);
  b.status = "cancelled";
  assert.equal(canEnterRoom(b, "host"), false);
  assert.equal(canEnterRoom(b, "a"), false);
});
test("Jitsi JWT is room-scoped, expiring and uses participant rather than moderator claims", () => {
  const env = { JITSI_JWT_APP_ID: "meetly", JITSI_JWT_SECRET: "test-key" };
  const jwt = jitsiToken(
    { ...booking(), roomKey: "private-room" },
    { uid: "a", token: { email: "a@example.test" } },
    "video.example.test",
    env,
    100000,
  );
  const claims = JSON.parse(
    Buffer.from(jwt.split(".")[1], "base64url").toString(),
  );
  assert.equal(claims.room, "private-room");
  assert.equal(claims.sub, "video.example.test");
  assert.equal(claims.context.user.moderator, "false");
  assert.equal(claims.exp, 7300);
  assert.throws(() =>
    jitsiToken(booking(), { uid: "a" }, "example.test", {}, 100000),
  );
});
