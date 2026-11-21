# Date ranges: availability and calendar conflicts

Host schedule previews read scheduler_hosts directly from the calendly database.
Each generated appointment must fit fully inside that host's weekly opening or
explicit date override, in the host's timezone. Closed weekdays and empty date
overrides disappear automatically. The preview reports the excluded count. If the
browser cannot read a profile, the server still enforces the same check on Save.

SaveEvent checks host availability again, then queries connected calendars and
confirmed SAMAY bookings. It lists conflicts by host and instant. The confirmation
button **Save without conflicting dates and times** retries with only the server's
remaining choices. Free times for a partly busy host are kept. Hosts with no
remaining choices are omitted from the selected schedule; organizer ownership is
retained. The retry checks calendars again, so a newly busy slot produces an
updated confirmation rather than being silently discarded. If every choice is
blocked, select different dates/times. Editing fields invalidates the previous
confirmation; click Save to recheck.

Availability filtering uses the full meeting duration. Calendar conflict checking
also includes configured before/after buffers. Closed-day exceptions take
precedence over weekly hours. Existing confirmed bookings are not cancelled by
removing published choices. External calendar changes can occur after a save;
booking-time conflict checks remain necessary and active.

Deploy both parts:

1. Copy existing-functions/scheduler.cjs to your existing backend functions
   directory as scheduler.cjs, preserving your other exports.
2. firebase deploy --only functions:schedulerSaveEvent --project usmlesarthi-residency-match
3. npm run build
4. firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

No live calendar requests or production writes were performed during validation.
