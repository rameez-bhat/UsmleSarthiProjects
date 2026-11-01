import test from "node:test";
import assert from "node:assert/strict";
import { applyEventPolicy, assertBookingAudience } from "../event-policy.js";
import { slotsForDay } from "../scheduling.js";
const now = Date.parse("2026-10-01T00:00:00Z");
const host = { timezone: "Asia/Kolkata", schedule: {}, overrides: {} };
const base = {
  active: true,
  duration: 30,
  minNotice: 0,
  horizonDays: 1,
  bufferBefore: 5,
  bufferAfter: 10,
};
const fixed = {
  ...base,
  ...applyEventPolicy(
    {
      schedulingMode: "fixed",
      audience: "registered",
      meetingDate: "2026-10-04",
      meetingTime: "10:00",
    },
    base,
    host,
    now,
  ),
};
test("fixed meeting offers exactly its chosen instant despite closed weekly hours or recurring horizon", () => {
  assert.equal(fixed.fixedStartAt, Date.parse("2026-10-04T04:30:00Z"));
  assert.deepEqual(
    slotsForDay({ date: "2026-10-04", host, event: fixed, now }),
    [{ start: fixed.fixedStartAt, end: fixed.fixedStartAt + 1800000 }],
  );
  assert.deepEqual(
    slotsForDay({ date: "2026-10-05", host, event: fixed, now }),
    [],
  );
});
test("fixed meeting still respects minimum notice and overlapping calendar or booking buffers", () => {
  assert.deepEqual(
    slotsForDay({
      date: "2026-10-04",
      host,
      event: fixed,
      now: fixed.fixedStartAt + 1,
    }),
    [],
  );
  assert.deepEqual(
    slotsForDay({
      date: "2026-10-04",
      host,
      event: fixed,
      now,
      busy: [{ start: fixed.fixedStartAt - 60000, end: fixed.fixedStartAt }],
    }),
    [],
  );
  assert.deepEqual(
    slotsForDay({
      date: "2026-10-04",
      host,
      event: fixed,
      now,
      busy: [{ start: fixed.fixedStartAt, end: fixed.fixedStartAt + 1800000 }],
    }),
    [],
  );
});
test("fixed instant stays the same if host later changes timezone", () => {
  const changed = { ...host, timezone: "America/Los_Angeles" };
  assert.deepEqual(
    slotsForDay({ date: "2026-10-03", host: changed, event: fixed, now }),
    [{ start: fixed.fixedStartAt, end: fixed.fixedStartAt + 1800000 }],
  );
  assert.deepEqual(
    slotsForDay({ date: "2026-10-04", host: changed, event: fixed, now }),
    [],
  );
});
test("reject invalid audience, past date, invalid dates and nonexistent DST time", () => {
  assert.throws(
    () => applyEventPolicy({ audience: "admins" }, base, host, now),
    /audience/,
  );
  for (const meetingDate of ["2026-09-30", "2026-02-30"])
    assert.throws(() =>
      applyEventPolicy(
        { schedulingMode: "fixed", meetingDate, meetingTime: "10:00" },
        base,
        host,
        now,
      ),
    );
  assert.throws(
    () =>
      applyEventPolicy(
        {
          schedulingMode: "fixed",
          meetingDate: "2027-03-14",
          meetingTime: "02:30",
        },
        base,
        { ...host, timezone: "America/New_York" },
        now,
      ),
    /does not exist/,
  );
});
const mockDb = (records) => ({
  collection(name) {
    assert.equal(name, "Users");
    return {
      where(field, op, uid) {
        assert.deepEqual([field, op, uid], ["uid", "==", "registered-uid"]);
        return {
          limit(n) {
            assert.equal(n, 2);
            return {
              async get() {
                return { docs: records };
              },
            };
          },
        };
      },
    };
  },
});
const request = {
  auth: {
    uid: "registered-uid",
    token: { email_verified: true, email: "Student@Example.com" },
  },
  data: { email: "someone-else@example.com", role: "Admin" },
};
test("public meeting accepts unauthenticated guests", async () => {
  assert.deepEqual(
    await assertBookingAudience({ audience: "anyone" }, {}, mockDb([])),
    { uid: null, email: null },
  );
});
test("registered meeting rejects signed-out, unverified, absent and duplicate account identities", async () => {
  await assert.rejects(
    () => assertBookingAudience(fixed, {}, mockDb([])),
    (e) => e.code === "unauthenticated",
  );
  await assert.rejects(
    () =>
      assertBookingAudience(
        fixed,
        { auth: { ...request.auth, token: { email_verified: false } } },
        mockDb([]),
      ),
    (e) => e.code === "failed-precondition",
  );
  for (const records of [[], [{}, {}]])
    await assert.rejects(
      () => assertBookingAudience(fixed, request, mockDb(records)),
      (e) => e.code === "permission-denied",
    );
});
test("registered meeting derives attendee identity from authenticated UID and verified email, never browser fields", async () => {
  assert.deepEqual(await assertBookingAudience(fixed, request, mockDb([{}])), {
    uid: "registered-uid",
    email: "student@example.com",
  });
});
