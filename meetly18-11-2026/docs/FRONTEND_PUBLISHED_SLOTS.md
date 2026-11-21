# Fast frontend slot loading

For host-specific schedules, opening the booking calendar no longer invokes
schedulerSlots. The frontend reads calendly/scheduler_public_events/{eventId}
and constructs published choices locally. If the projection is absent or cannot
be read under the current rules, it uses the sanitized event already supplied to
the booking page. Opening/refreshing the calendar does not scan all host calendars.

SaveEvent writes this public projection alongside the private event in the same
transaction. It contains only owner/team identifiers, duration, minimum notice,
active state, published host times and update timestamp. It contains no phone
numbers, host links, attendees or credentials. DeleteEvent removes the projection
when soft-deleting its private event. Existing events can use the metadata fallback;
edit/save once to create their projection. Manage public projection read permissions
in your own Firestore rules as with your other frontend queries.

These are published candidate times, not a promise of live availability. The page
says so explicitly. Expired times and times inside minimum notice are omitted
locally. On selecting a time, one targeted schedulerSlots request checks only that
host's published date, calendar, booking conflicts and limits. Unavailable choices
are removed and the student is asked to choose another. The booking endpoint still
rechecks and reserves transactionally. No frontend Google/Zoom credentials are used.

Legacy recurring/month-generated schedules still use their existing server slot
calculation; this change targets the host-specific date/time range workflow.
PublicPage metadata, booking submissions and live integration operations remain
server-backed. No interval polling was added. This update does not diagnose the
previous event's 11:00 exclusion; organizer diagnostics remain available for that.

Deploy updated functions from existing-functions/scheduler.cjs copied to your
existing backend as scheduler.cjs, preserving unrelated exports:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerDeleteEvent,functions:schedulerSlots --project usmlesarthi-residency-match

Then build with npm run build and deploy the scheduler Hosting target:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

The diagnostic visibility fix is also included. After deployment the public page
shows its current SAMAY account and a Check host availability reasons button;
results remain restricted to the event organizer by the server.
