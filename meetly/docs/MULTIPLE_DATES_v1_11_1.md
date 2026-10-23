# Multiple dates: v1.11.1

## Changes

New recurring, specific-date and host-choice team booking links default to multiple dates and times per host. The schedule category is retained while explicit appointments are stored as host slots.

Selecting dates and times in the bulk editor now counts toward Save even without clicking Add meeting times. That button remains useful for committing one host's choices before entering another host's times. Duplicate selections are removed. The existing limit of 100 times per event still applies.

For an existing specific-date event, enable “Publish multiple dates and times for each host.” Its original date and time are retained as the first editable row. Add further choices and save. Existing links keep their event ID.

An existing single-time event is not silently converted. Saved assigned invitations remain one shared appointment, and their acceptance behavior is unchanged. For a new shared invitation, turn off multiple dates and use the specific-date schedule. Multiple dates here represent alternative self-booking appointments; they do not create a series of invitations automatically.

The public calendar continues to highlight dates with bookable slots and group selected-date times by host. Empty schedules explain that times can be blocked by calendar conflicts, booking cutoffs or existing bookings. Real conflicts remain enforced on the server.

## Deploy

This patch changes the frontend only. No function, secret or index changes are required if v1.11.0 backend functions are already deployed.

```sh
npm install
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

If upgrading from before v1.11.0, also copy existing-functions/scheduler.cjs into the existing backend and deploy schedulerSaveEvent and schedulerSlots as described in CALENDAR_BOOKING_v1_11.md. Preserve backend environment settings and unrelated function exports.

## Validation

Backend scheduling tests, frontend regression tests and production build. New regressions cover all three categories saving pending date/time selections and preserving the date when converting a legacy specific appointment. Live Google/Zoom provider behavior was not exercised.
