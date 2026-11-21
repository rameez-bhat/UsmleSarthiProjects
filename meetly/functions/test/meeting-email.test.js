import { test } from "node:test";
import assert from "node:assert/strict";
import { meetingEmail } from "../meeting-email.js";
const booking = {
  eventTitle: "Choose2nd",
  hostName: "Shafi",
  attendeeName: "Student <script>",
  attendeeEmail: "student@example.com",
  notes: "Discuss my application",
  startAt: Date.UTC(2026, 10, 6, 5),
  endAt: Date.UTC(2026, 10, 6, 5, 30),
};
const input = {
  booking,
  person: { staff: false, response: "accepted" },
  title: "Meeting confirmed",
  time: "Friday, 06 Nov 2026 · 10:30 GMT+5:30",
  managementUrl: "https://example.com/manage/private",
  link: "https://meet.google.com/abc",
};
test("attendee confirmation escapes names and offers calendar with exact UTC interval", () => {
  const result = meetingEmail(input);
  assert.match(result.html, /Thanks for booking the meeting/);
  assert.match(result.html, /Student &lt;script&gt;/);
  assert.doesNotMatch(result.html, /<script>/);
  assert.match(result.html, /Add to Google Calendar/);
  assert.match(result.html, /20261106T050000Z%2F20261106T053000Z/);
  assert.doesNotMatch(result.html, /User details/);
});
test("host receives attendee contact and note; attendee does not get group roster", () => {
  const group = {
    ...booking,
    participants: [
      { name: "One", email: "one@example.com", notes: "My note" },
      { name: "Two", email: "two@example.com" },
    ],
  };
  const staff = meetingEmail({
    ...input,
    booking: group,
    person: { staff: true, response: "accepted" },
  });
  assert.match(staff.html, /one@example.com/);
  assert.match(staff.html, /two@example.com/);
  assert.match(staff.html, /My note/);
  const attendee = meetingEmail({
    ...input,
    booking: group,
    person: { staff: false, response: "accepted", name: "One" },
  });
  assert.doesNotMatch(attendee.html, /two@example.com/);
});
test("cancelled and declined messages omit calendar action", () => {
  assert.doesNotMatch(
    meetingEmail({ ...input, cancelled: true }).html,
    /Add to Google Calendar/,
  );
  assert.doesNotMatch(
    meetingEmail({ ...input, person: { staff: false, response: "declined" } })
      .html,
    /Add to Google Calendar/,
  );
});

test("host email includes saved custom questions, escaped answers and unanswered optional fields", () => {
  const data = {
    ...booking,
    questionLabels: ["YOG", "Your goal?", "Optional"],
    answers: ["2024", "<script>alert(1)</script>"],
  };
  const staff = meetingEmail({
    ...input,
    booking: data,
    person: { staff: true, response: "accepted" },
  });
  assert.match(staff.html, /Booking questions and answers/);
  assert.match(staff.html, /YOG/);
  assert.match(staff.html, /2024/);
  assert.match(staff.html, /&lt;script&gt;/);
  assert.doesNotMatch(staff.html, /<script>/);
  assert.match(staff.text, /Your goal\?: <script>alert\(1\)<\/script>/);
  assert.match(staff.text, /Optional: Not answered/);
  const student = meetingEmail({ ...input, booking: data });
  assert.match(student.html, /Your goal/);
  assert.match(student.text, /YOG: 2024/);
});

test("group registration answers are matched to the correct booking and attendee", async () => {
  const { emailBookingDetails } = await import("../meeting-email.js");
  const group = {
    ...booking,
    participants: [
      {
        uid: "one",
        name: "One",
        email: "one@example.com",
        registrationId: "r1",
      },
      {
        uid: "two",
        name: "Two",
        email: "two@example.com",
        registrationId: "r2",
      },
    ],
  };
  const hydrated = await emailBookingDetails(group, "booking", async (id) =>
    id === "r1"
      ? {
          bookingId: "booking",
          participantUid: "one",
          questionLabels: ["Your exam?"],
          answers: ["Step 2"],
          notes: "My registration note",
        }
      : {
          bookingId: "other-booking",
          participantUid: "two",
          questionLabels: ["Wrong record"],
          answers: ["Secret"],
        },
  );
  const host = meetingEmail({
    ...input,
    booking: hydrated,
    person: { staff: true, response: "accepted" },
  });
  assert.match(host.html, /Your exam\?/);
  assert.match(host.html, /Step 2/);
  assert.match(host.html, /My registration note/);
  assert.doesNotMatch(host.html, /Wrong record|Secret/);
  assert.equal(group.participants[0].answers, undefined);
});

test("student sees only their own registration answers and both recipients get a styled join button", () => {
  const group = {
    ...booking,
    participants: [
      {
        uid: "one",
        name: "One",
        email: "one@example.com",
        questionLabels: ["First question"],
        answers: ["Own answer"],
      },
      {
        uid: "two",
        name: "Two",
        email: "two@example.com",
        questionLabels: ["Second question"],
        answers: ["Private answer"],
      },
    ],
  };
  const student = meetingEmail({
    ...input,
    booking: group,
    person: {
      uid: "one",
      email: "one@example.com",
      staff: false,
      response: "accepted",
    },
  });
  assert.match(student.html, /Own answer/);
  assert.doesNotMatch(student.html, /Private answer|Second question/);
  assert.match(student.text, /First question: Own answer/);
  assert.doesNotMatch(student.text, /Private answer/);
  for (const staff of [true, false]) {
    const result = meetingEmail({
      ...input,
      person: { staff, response: "accepted" },
    });
    assert.match(
      result.html,
      /<a href="https:\/\/meet.google.com\/abc" style="[^"]*background:#176b57[^"]*">Join meeting<\/a>/,
    );
  }
  const cancelled = meetingEmail({ ...input, cancelled: true });
  assert.doesNotMatch(cancelled.html, />Join meeting<\/a>/);
  assert.doesNotMatch(cancelled.text, /meet.google.com/);
});
test("event description appears safely in attendee HTML and plain text", () => {
  const description =
    "Please prepare your questions.\nBring <documents> & notes.";
  const result = meetingEmail({
    ...input,
    booking: { ...booking, eventDescription: description },
  });
  assert.match(
    result.text,
    /Meeting description: Please prepare your questions\.\nBring <documents> & notes\./,
  );
  assert.match(result.html, /About this meeting/);
  assert.match(result.html, /Bring &lt;documents&gt; &amp; notes/);
  assert.match(result.html, /white-space:pre-wrap/);
  assert.doesNotMatch(meetingEmail(input).html, /About this meeting/);
});
