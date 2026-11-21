# Event description in booking emails

New bookings save eventDescription from the event's Description field. Dated meetings created with assigned attendees also save it. Shared confirmation, update and reminder templates show a separate About this meeting section, preserving newlines and escaping HTML. Empty descriptions omit the section. Existing booking snapshots without eventDescription remain unchanged.

Copy existing-functions/scheduler.cjs to your backend functions/scheduler.cjs. Retain your backend environment settings and any local customizations, including your WhatsApp-only phoneInstructions change if you made it separately.

Deploy the booking producers and email consumers:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerSyncBooking,functions:schedulerReminders,functions:schedulerRegistration --project usmlesarthi-residency-match

No Hosting deployment required. Previously queued or delivered email is unchanged. No email was sent during implementation.
