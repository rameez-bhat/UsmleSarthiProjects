import test from "node:test";
import assert from "node:assert/strict";
import {
  assertAttendeeAccess,
  trustedAttendeeUid,
  safeProfile,
  attendeeDetails,
  attendeeRoster,
} from "../attendee-details.js";
const booking = {
  ownerId: "host-a",
  attendeeUid: "student-uid",
  bookingAudience: "registered",
  attendeeName: "Test Student",
  attendeeEmail: "student@example.com",
  eventTitle: "Mentoring",
  hostName: "Host A",
  status: "confirmed",
  startAt: 1800000000000,
  endAt: 1800001800000,
  timezone: "UTC",
  notes: "Review applications",
  answers: ["2025"],
  questionLabels: ["Graduation year"],
  tokenCipher: "must-not-appear",
  tokenHash: "must-not-appear",
};
test("hosts can view their own attendee details while unrelated hosts and non-hosts are denied", () => {
  assert.doesNotThrow(() =>
    assertAttendeeAccess("host-a", { canHost: true, isAdmin: false }, booking),
  );
  assert.throws(
    () =>
      assertAttendeeAccess(
        "host-b",
        { canHost: true, isAdmin: false },
        booking,
      ),
    (e) => e.code === "permission-denied",
  );
  assert.throws(
    () =>
      assertAttendeeAccess(
        "host-a",
        { canHost: false, isAdmin: false },
        booking,
      ),
    (e) => e.code === "permission-denied",
  );
});
test("confirmed administrator access permits the existing cross-host reporting scope", () => {
  assert.doesNotThrow(() =>
    assertAttendeeAccess(
      "administrator",
      { canHost: true, isAdmin: true },
      booking,
    ),
  );
});
test("only verified identity links can reveal a registered profile", () => {
  assert.equal(trustedAttendeeUid(booking), "student-uid");
  assert.equal(
    trustedAttendeeUid({ ...booking, bookingAudience: "anyone" }),
    null,
  );
  assert.equal(
    trustedAttendeeUid({
      ...booking,
      bookingAudience: "anyone",
      attendeeIdentityVerified: true,
    }),
    "student-uid",
  );
  assert.equal(trustedAttendeeUid({ ...booking, attendeeUid: null }), null);
});
test("profile serialization preserves nested student details and timestamps while excluding credentials recursively", () => {
  const clean = safeProfile({
    displayName: "Test Student",
    GraduationDate: { toDate: () => new Date("2025-06-01T00:00:00Z") },
    ScoreData: { Step1Attempts: "2", access_token: "private" },
    password: "private",
    privateKey: "private",
    nested: [{ phoneNumber: "123", clientSecret: "private" }],
  });
  assert.equal(clean.GraduationDate, "2025-06-01T00:00:00.000Z");
  assert.equal(clean.ScoreData.Step1Attempts, "2");
  assert.equal(clean.nested[0].phoneNumber, "123");
  assert.equal(JSON.stringify(clean).includes("private"), false);
});
const db = (users, roles) => ({
  collection(name) {
    return {
      where(field, operator, uid) {
        assert.equal(field, "uid");
        assert.equal(operator, "==");
        assert.equal(uid, "student-uid");
        return {
          limit() {
            return {
              async get() {
                return {
                  docs: (name === "Users" ? users : roles).map((value) => ({
                    data: () => value,
                  })),
                };
              },
            };
          },
        };
      },
    };
  },
});
test("attendee detail response includes profile, student account and original booking answers without management tokens", async () => {
  const details = await attendeeDetails(
    booking,
    db(
      [{ displayName: "Test Student", ScoreData: { Step1Attempts: "2" } }],
      [{ StudentUniqueId: 123, Role: "Silver" }],
    ),
  );
  assert.equal(details.profileState, "linked");
  assert.equal(details.profile.ScoreData.Step1Attempts, "2");
  assert.equal(details.account.StudentUniqueId, 123);
  assert.deepEqual(details.booking.answers, [
    { question: "Graduation year", answer: "2025" },
  ]);
  assert.equal(JSON.stringify(details).includes("must-not-appear"), false);
});
test("guest email is never used to look up a private profile and ambiguous identities fail closed", async () => {
  const guest = await attendeeDetails(
    { ...booking, attendeeUid: null, bookingAudience: "anyone" },
    {
      collection() {
        throw Error("No lookup should occur for a guest");
      },
    },
  );
  assert.equal(guest.profile, null);
  assert.equal(guest.booking.attendeeEmail, "student@example.com");
  const duplicate = await attendeeDetails(booking, db([{}, {}], [{}, {}]));
  assert.equal(duplicate.profileState, "unavailable");
  assert.equal(duplicate.profile, null);
  assert.equal(duplicate.account, null);
});

test("group roster retains the booking document ID for participant detail requests", () => {
  const response = attendeeRoster("meeting_assigned", {
    eventTitle: "Team meeting",
    attendeeName: "Student",
    participants: [
      { uid: "student", name: "Student", email: "student@example.test" },
    ],
    tokenCipher: "private",
  });
  assert.equal(response.booking.id, "meeting_assigned");
  assert.equal(response.participants[0].response, "invited");
  assert.equal("tokenCipher" in response, false);
});
