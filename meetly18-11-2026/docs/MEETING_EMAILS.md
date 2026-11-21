# Meeting emails

Added a responsive, inline-styled SAMAY HTML template with plain-text alternative.

Hosts and organizers receive meeting details plus attendee name, email and note (or No note provided). Group recipients remain visible only to staff. Students receive a booking thank-you, meeting name, selected host, timezone-labelled time, joining instructions, details link and a calendar-icon Add to Google Calendar action. Reminder, reschedule, cancellation and decline messages use appropriate wording; cancellations and declines omit the calendar action.

The calendar button opens a prefilled Google Calendar event at the exact UTC interval. It requires the recipient to save it; it does not automatically write to their calendar. Existing joining instructions support Google Meet, Zoom and phone calls. Existing notification settings, default database mail bridge and deterministic mail IDs remain in place. Already queued or delivered messages are not rewritten or resent.

Copy existing-functions/scheduler.cjs into the existing backend functions/scheduler.cjs. Deploy schedulerSyncBooking and schedulerReminders. No Hosting update is needed for this email-only change.

## Custom booking questions

Host and organizer emails now show each attendee's saved question labels and answers beneath their contact details. Optional unanswered questions show Not answered. Labels come from the booking/registration snapshot so later changes to event settings do not relabel old answers. Group registration details are loaded server-side only when both booking ID and attendee UID match. Answers are escaped in HTML and included in the plain-text alternative; they are not included in student email bodies or calendar links.

Deploy schedulerSyncBooking and schedulerReminders with the updated addon. Existing delivered messages remain unchanged.
