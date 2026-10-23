# Calendar booking and multiple host times — v1.11.0

## Public booking view

The long list of all dates/times is replaced with a responsive calendar beside host cards. Available dates are highlighted; unavailable dates are disabled. Selecting a date shows only that date's start times, grouped by host. If two hosts are available on the same date, both host cards and their times appear. Selecting a time names the host in the confirmation message and button. The organizer remains visible when they have no available time on that date.

The selected display timezone determines the calendar date as well as the time labels, preserving the underlying UTC instant. The calendar jumps to the first available date for explicit published times. Month navigation for recurring availability loads one month at a time. Clicking individual dates needs no additional API call, and no polling is introduced. Date formatters and per-date slot groups are reused to avoid expensive repeated date conversions.

All self-booking event schedules use the calendar presentation. A single fixed meeting highlights its one available date/time. Existing assigned invitation pages retain Accept/Decline for their original shared appointment.

## Add several dates and times per host

In the event editor:

1. Select a meeting schedule category.
2. For Recurring availability or Specific date and time, enable **Publish multiple dates and times for each host**. The team schedule shows this editor directly.
3. Choose participating hosts; the organizer is also included.
4. Under **Add dates & times in one step**, choose a host, add several dates and start times, choose the correct timezone, then click **Add N meeting times**. Every selected date/time combination becomes a separate bookable start time for that host.
5. Repeat for each host. Existing individual rows can still be edited or removed. Save the event and share its link.

For example, two dates and three start times produce six appointments to choose from for one host. The event supports up to 20 hosts and 100 published start times, including bulk additions. Same-host duplicates/overlaps, busy calendars, buffers, notice, horizon and daily limits remain server-enforced.

Enabling multiple published times uses exact published starts instead of recurring weekly hours, while retaining the editor's schedule category. For normal recurring weekly availability, leave the checkbox off and use Availability to configure weekly ranges/date overrides. These modes are not silently combined.

Preassigned invitations refer to one shared appointment and cannot be turned into several independent choices without changing invitation meaning. The multiple-times checkbox is disabled while a draft has invitees. Create a separate self-booking event for multiple choices. Existing confirmed appointments and saved assigned invitation meetings are not migrated or rescheduled.

## Source files

- src/components/CalendarHostTimes.jsx — calendar, highlighted dates and per-date host/time display.
- src/components/HostSlotBatch.jsx — bulk date/time combination editor.
- src/components/HostChoiceBooking.jsx — availability loading and host-specific confirmation.
- src/pages/BookingPage.jsx — event directory and booking/invitation routing; obsolete duplicate booking UI has been removed.
- functions/month-availability.js — monthly availability from existing booking and busy-calendar data.
- functions/event-policy.js — validates the multiple-times option for every schedule category.

Recurring month availability uses one calendar-range lookup per connected provider plus one bookings query for the month. It does not perform a separate provider lookup for every date. Backend booking still rechecks the selected instant and host immediately before the transactional reservation.

## Deployment

Replace existing-functions/scheduler.cjs in the existing backend while preserving unrelated exports, working credentials and the encryption key. Ensure non-secret provider configuration is present in functions/.env.usmlesarthi-residency-match during deployment so existing secret bindings are retained. Do not overwrite working .env files with template placeholders.

```sh
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots --project usmlesarthi-residency-match
```

From the frontend:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No database migration or new index is required. Validate the actual live Google/Zoom integration after deployment. Calendar/host/date selection, bulk generation, timezone shifts, fixed schedules and existing invitation behavior are covered by local tests; live provider behavior and device visual checks still require deployment verification.
