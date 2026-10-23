# Editor and explicit appointment fix — v1.11.3

## Behavior

Clicking the backdrop no longer closes the popup. Use its close button, Cancel, or Escape. Saving remains explicit.

Saving manually selected host date-time pairs no longer rejects the whole event because a row is inside minimum notice, outside the rolling horizon, or already past. This also allows existing schedules with expired rows to be edited. Rows must still contain valid hosts and local dates/times; invalid DST times, duplicates and same-host buffer overlaps remain rejected.

Explicitly published appointments are not limited by the rolling booking horizon, matching the specific-date nature of these links. Recurring weekly schedules still use their horizon. No times are shifted automatically and no booked appointment is changed.

Booking-time checks still enforce minimum notice, future start, connected calendar conflicts, other Meetly bookings, buffers and daily limits. The cutoff is visible beside explicit date-time entries as “Booking closes before each appointment (minutes).” Set it to 0 to permit booking until the start. Past appointments are always unavailable. Saving an appointment inside the cutoff does not make it bookable.

The rule fields in the advanced section no longer show a misleading rolling horizon for explicit host times. Minimum notice is displayed once, beside the explicit appointment editor.

## Install and deploy

Copy existing-functions/scheduler.cjs into your existing backend functions folder, preserving unrelated functions and your working environment settings. Keep the existing Object.assign(exports, require("./scheduler.cjs")) export.

From the existing backend project:

```sh
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match
```

From the frontend project, preserving your Firebase configuration and Hosting target:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Both deployments are needed. Updating Hosting alone leaves the old server validation active. No new secrets or indexes are introduced. Keep the backend non-secret OAuth client IDs in its environment file so the existing secret binding logic survives deployment.

## Validation

75 backend and 42 frontend tests passed, including saving expired/near/far explicit appointments, retaining booking cutoffs, independent date-time pairs and backdrop clicks retaining the editor. Production build and bundled addon export validation passed. Live cloud/provider behavior was not tested.
