# Consecutive appointments

The overlap comparison uses strict inequalities: a booking ending exactly at
11:00 does not overlap one starting at 11:00. No change to that comparison is
needed. The previous new-event default included 10 minutes after each meeting;
this release changes frontend and server defaults to zero.

Open Scheduling rules & questions and set Buffer before and Buffer after to 0
for events that should allow consecutive appointments. Explicit nonzero buffers
remain enforced. Existing events and confirmed bookings are not rewritten.
Bookings already reserved with an 11:10 lock end still reserve time until 11:10,
even if the corresponding Google Calendar event visibly ends at 11:00. Merely
editing the event type does not change a confirmed booking's saved lock interval.

If an external Google event ends at 11:00 and no saved booking buffer or other busy
interval covers 11:00, a new zero-buffer appointment at 11:00 should be allowed.
Further diagnosis of a remaining conflict requires the selected slot, event
buffers and relevant calendar/booking intervals; this release does not claim to
have inspected any production calendar or changed existing reservations.

Copy existing-functions/scheduler.cjs to your existing backend functions folder
as scheduler.cjs, preserving unrelated exports. Deploy schedulerSaveEvent to
update the default when inputs omit bufferAfter:

firebase deploy --only functions:schedulerSaveEvent --project usmlesarthi-residency-match

Build with npm run build and deploy your existing scheduler Hosting target:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
