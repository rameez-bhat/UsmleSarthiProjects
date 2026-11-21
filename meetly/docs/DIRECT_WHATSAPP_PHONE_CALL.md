# Direct/WhatsApp Phone Call

Choose the third Location option, Direct/WhatsApp Phone Call. A separate phone
field appears for the organizer and each selected host. Enter international
numbers such as +919876543210. Numbers are saved per event; they are not imported
from or written to the default Users profile.

Host-choice bookings use the selected host's number. Round-robin invitation
meetings use the host actually assigned by the server. The booking stores that
host's call instructions, so unrelated host numbers are not included in the
student's confirmation or later reminders. The public event response excludes
the complete hostPhones map. Authorized attendees get the booked host's number
and WhatsApp link after confirmation; invitees receive them after acceptance.
Email delivery follows the event's notification settings and the existing default
mail queue bridge. WhatsApp is a link, not an automated WhatsApp message; that
number must have WhatsApp to use the link.

Google/Zoom authorization is unnecessary for phone calls. Existing connected
calendars are still checked for busy times and can receive the booked appointment.
No Zoom meeting or Google Meet conference is generated for phone locations.

Deployment:

Copy existing-functions/scheduler.cjs into your existing backend functions
folder as scheduler.cjs, preserving unrelated exports. Deploy the following:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerSyncBooking,functions:schedulerPublicPage,functions:schedulerPublicEvent --project usmlesarthi-residency-match

Then run npm run build and deploy your existing scheduler Hosting target:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

No new secrets are required. Live calendar writes and outgoing email delivery
have not been exercised during local automated tests.
