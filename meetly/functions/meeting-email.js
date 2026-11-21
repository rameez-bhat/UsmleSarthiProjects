const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const safeLink = (value) =>
  /^https:\/\//i.test(value || "") ? escape(value) : "";
export async function emailBookingDetails(
  booking,
  bookingId,
  loadRegistration,
) {
  if (!booking.participants?.length) return booking;
  const participants = await Promise.all(
    booking.participants.map(async (person) => {
      if (!person.registrationId) return person;
      const registration = await loadRegistration(person.registrationId);
      if (
        !registration ||
        registration.bookingId !== bookingId ||
        registration.participantUid !== person.uid
      )
        return person;
      return {
        ...person,
        notes: registration.notes || "",
        answers: registration.answers || [],
        questionLabels: registration.questionLabels || [],
      };
    }),
  );
  return { ...booking, participants };
}
export function bookingQuestions(person) {
  const labels = Array.isArray(person.questionLabels)
    ? person.questionLabels
    : [];
  const answers = Array.isArray(person.answers) ? person.answers : [];
  return Array.from(
    { length: Math.max(labels.length, answers.length) },
    (_, i) => ({
      question: String(labels[i] || `Question ${i + 1}`),
      answer:
        answers[i] === undefined || answers[i] === null || answers[i] === ""
          ? "Not answered"
          : Array.isArray(answers[i])
            ? answers[i].join(", ")
            : String(answers[i]),
    }),
  );
}
export function meetingEmail({
  booking: b,
  person,
  title,
  time,
  managementUrl,
  link,
  cancelled,
}) {
  const row = (label, value) =>
    `<tr><td style="padding:10px 0;color:#65746e;vertical-align:top;width:125px">${escape(label)}</td><td style="padding:10px 0;font-weight:600;white-space:pre-wrap">${escape(value || "—")}</td></tr>`;
  const people = b.participants?.length
    ? b.participants
    : [
        {
          name: b.attendeeName,
          email: b.attendeeEmail,
          notes: b.notes,
          answers: b.answers,
          questionLabels: b.questionLabels,
        },
      ];
  const ownParticipant = b.participants?.length
    ? people.find(
        (p) =>
          (person.registrationId &&
            p.registrationId === person.registrationId) ||
          (person.uid && p.uid === person.uid),
      ) ||
      (() => {
        const matches = people.filter(
          (p) =>
            person.email &&
            String(p.email || "").toLowerCase() ===
              String(person.email).toLowerCase(),
        );
        return matches.length === 1 ? matches[0] : null;
      })()
    : people[0];
  const ownQuestions =
    !person.staff && ownParticipant ? bookingQuestions(ownParticipant) : [];
  const ownAnswersHtml = ownQuestions.length
    ? `<h3 style="margin-top:26px">Your booking questions and answers</h3><table role="presentation" style="width:100%">${ownQuestions.map((q) => row(q.question, q.answer)).join("")}</table>`
    : "";
  const ownAnswersText = ownQuestions.length
    ? "\nYour booking questions and answers\n" +
      ownQuestions.map((q) => `${q.question}: ${q.answer}`).join("\n")
    : "";
  const attendees = person.staff
    ? `<h3 style="margin-top:26px">User details</h3>${people
        .map(
          (p) =>
            `<table role="presentation" style="width:100%;border-top:1px solid #e4ece8">${row("Name", p.name)}${row("Email", p.email)}${row("Note", p.notes || p.note || (!b.participants?.length && b.notes) || "No note provided")}</table>${
              bookingQuestions(p).length
                ? `<h4>Booking questions and answers</h4><table role="presentation" style="width:100%">${bookingQuestions(
                    p,
                  )
                    .map((q) => row(q.question, q.answer))
                    .join("")}</table>`
                : ""
            }`,
        )
        .join("")}`
    : "";
  const utc = (ms) =>
    new Date(ms)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const calendar = new URL("https://calendar.google.com/calendar/render");
  calendar.search = new URLSearchParams({
    action: "TEMPLATE",
    text: b.eventTitle || "Meeting",
    dates: `${utc(b.startAt)}/${utc(b.endAt || b.startAt + b.duration * 60000)}`,
    details: `Meeting with ${b.hostName || "your host"}\n${link || ""}`,
    location: link || "",
  }).toString();
  const canJoin =
    !cancelled &&
    person.response !== "declined" &&
    person.response !== "invited";
  const button = (url, label) =>
    `<a href="${safeLink(url)}" style="display:inline-block;margin:8px 8px 8px 0;padding:13px 20px;border-radius:8px;background:#176b57;color:#fff;text-decoration:none;font-weight:bold">${label}</a>`;
  const intro = person.staff
    ? "Here are the latest meeting and attendee details."
    : cancelled
      ? "Your meeting has been cancelled."
      : person.response === "declined"
        ? "Your invitation has been declined."
        : title === "Meeting reminder"
          ? "A reminder about your upcoming meeting."
          : title === "Booking rescheduled"
            ? "Your meeting has been rescheduled."
            : "Thanks for booking the meeting! We look forward to meeting you.";
  const description = String(b.eventDescription || "").trim();
  const descriptionHtml = description
    ? `<h3 style="margin:24px 0 10px;font-size:16px">About this meeting</h3><p style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7">${escape(description)}</p>`
    : "";
  const text = `${title}\n${intro}\nMeeting Name: ${b.eventTitle}\nMeeting With: ${b.hostName}\nTime: ${time}${description ? `\nMeeting description: ${description}` : ""}\n${canJoin ? link || "" : ""}${
    person.staff
      ? people
          .map(
            (p) =>
              `\nName: ${p.name || "—"}\nEmail: ${p.email || "—"}\nNote: ${p.notes || p.note || (!b.participants?.length && b.notes) || "No note provided"}${
                bookingQuestions(p).length
                  ? "\nBooking questions and answers\n" +
                    bookingQuestions(p)
                      .map((q) => `${q.question}: ${q.answer}`)
                      .join("\n")
                  : ""
              }`,
          )
          .join("\n")
      : ownAnswersText
  }\nView details: ${managementUrl}${canJoin ? `\nAdd to Google Calendar: ${calendar.href}` : ""}\n\nThanks & Regards,\nUSMLE Sarthi Team`;
  const html = `<!doctype html><html><body style="margin:0;background:#f3f7f5;font-family:Arial,sans-serif;color:#203b32"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:24px 12px"><table role="presentation" style="max-width:600px;width:100%;margin:auto;background:#fff;border-radius:16px" cellspacing="0" cellpadding="0"><tr><td style="padding:28px;background:#176b57;color:#fff;border-radius:16px 16px 0 0"><span style="font-size:13px;letter-spacing:3px">SAMAY</span><h1 style="font-size:25px;margin:14px 0 0">${escape(title)}</h1></td></tr><tr><td style="padding:28px"><p>Hello ${escape(person.name || (person.staff ? b.hostName : b.attendeeName) || "there")},</p><p style="line-height:1.7">${escape(intro)}</p><table role="presentation" style="width:100%">${row("Meeting Name", b.eventTitle)}${row("Meeting With", b.hostName)}${row("Time", time)}</table>${descriptionHtml}${attendees}${ownAnswersHtml}${canJoin && link && !safeLink(link) ? `<p style="white-space:pre-wrap;line-height:1.7">${escape(link)}</p>` : ""}<div>${canJoin && safeLink(link) ? button(link, "Join meeting") : ""}${button(managementUrl, "View meeting details")}${canJoin ? button(calendar.href, "&#128197; Add to Google Calendar") : ""}</div><p style="margin-top:28px;line-height:1.7">Thanks &amp; Regards,<br><strong>USMLE Sarthi Team</strong></p></td></tr></table></td></tr></table></body></html>`;
  return { text, html };
}
