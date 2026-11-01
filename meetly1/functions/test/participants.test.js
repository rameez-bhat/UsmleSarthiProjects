import test from "node:test";
import assert from "node:assert/strict";
import {
  selectedUids,
  resolveParticipants,
  personalMeeting,
} from "../participants.js";
const database = (records) => ({
  collection(name) {
    assert.equal(name, "Users");
    return {
      where(field, op, uid) {
        assert.deepEqual([field, op], ["uid", "=="]);
        return {
          limit(n) {
            assert.equal(n, 2);
            return {
              async get() {
                return {
                  docs: (records[uid] || []).map((value) => ({
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
test("selection deduplicates UIDs and rejects malformed, oversized or client profile objects", () => {
  assert.deepEqual(selectedUids(["alpha", "beta", "alpha"]), ["alpha", "beta"]);
  assert.deepEqual(selectedUids(), []);
  for (const input of [
    ["bad/path"],
    Array(101).fill("alpha"),
    [{ uid: "alpha", email: "forged@example.test" }],
    "alpha",
  ])
    assert.throws(() => selectedUids(input));
});
test("registered participants resolve solely from default Users by authenticated identity UID", async () => {
  const result = await resolveParticipants(
    ["alpha", "beta"],
    database({
      alpha: [
        {
          uid: "alpha",
          displayName: "Student A",
          email: "A@example.test",
          password: "private",
        },
      ],
      beta: [
        { uid: "beta", displayName: "Student B", email: "b@example.test" },
      ],
    }),
  );
  assert.deepEqual(result, [
    { uid: "alpha", name: "Student A", email: "a@example.test" },
    { uid: "beta", name: "Student B", email: "b@example.test" },
  ]);
});
test("missing, ambiguous and invalid email identities cannot be assigned", async () => {
  for (const values of [
    [],
    [{ email: "a@example.test" }, { email: "a@example.test" }],
    [{ email: "invalid" }],
  ])
    await assert.rejects(
      resolveParticipants(["alpha"], database({ alpha: values })),
    );
});
test("student meeting projection excludes other attendees, profiles, email and management credentials", () => {
  const booking = {
    eventTitle: "Shared meeting",
    participantUids: ["alpha", "beta"],
    participants: [
      { uid: "alpha", email: "a@example.test" },
      { uid: "beta", email: "b@example.test" },
    ],
    status: "confirmed",
    tokenHash: "private",
    tokenCipher: "private",
    hostEmail: "private@example.test",
    meetingUrl: "https://example.test/meet",
  };
  const result = personalMeeting("id", booking, "alpha");
  assert.equal(result.eventTitle, "Shared meeting");
  for (const key of [
    "participantUids",
    "participants",
    "tokenHash",
    "tokenCipher",
    "hostEmail",
  ])
    assert.equal(key in result, false);
  assert.throws(() => personalMeeting("id", booking, "other"));
  assert.equal(
    personalMeeting(
      "old",
      { attendeeUid: "alpha", eventTitle: "Existing reservation" },
      "alpha",
    ).eventTitle,
    "Existing reservation",
  );
});
