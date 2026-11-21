# Fixed appointments use the same calendar view

Single fixed appointments and host-specific schedules use the same calendar and
host/time layout. A fixed appointment is rendered at its saved fixedStartAt instant,
using the viewer's display timezone. It is not converted into a recurring event or
a host-slots event. The frontend reads the sanitized public projection, or falls
back to the sanitized event already loaded on the page. It constructs the fixed
candidate locally without an initial schedulerSlots request. Legacy numeric/string
or timestamp start values and saved local meeting date/time can be normalized.

The public projection now includes fixedStartAt, meetingTimezone and hostName.
Older projections can retain the matching fields from already loaded event metadata.
Expired times and minimum-notice violations remain hidden locally. If a fixed time
is otherwise eligible, its date is highlighted and the time is selectable in the
same host list used for multiple appointments.

Selecting a time triggers one server calendar/conflict check for that appointment.
Booking confirmation still rechecks/reserves server-side. Google/Zoom credentials
and external availability checks remain on the server. Loading published times and
checking live availability are separate steps. Legacy recurring availability is
still generated through its existing server calculation.

schedulerSlots now supports fixed appointments without requiring month/date input.
Organizer diagnostics can return the actual past/notice/booking-buffer/calendar/
daily-limit reason instead of rejecting fixed as the wrong schedule type. The
previous fixed-type error did not prove why the event's 11:00 time was unavailable.
This change does not make busy or past appointments bookable.

Copy existing-functions/scheduler.cjs into your existing backend as scheduler.cjs,
preserving unrelated exports. Deploy:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots --project usmlesarthi-residency-match

Build frontend with npm run build, then deploy:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

No production deployment or real calendar/booking changes were performed here.
