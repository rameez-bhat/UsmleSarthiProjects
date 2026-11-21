# Missing organizer availability diagnostics

The public booking page now always exposes Check host availability reasons in live
mode. It displays the account currently signed into this SAMAY site and offers a
sign-in form if needed. Server checks still restrict diagnostic results to the
actual organizer. Wrong accounts receive an explicit permission error.

Previously the control was hidden for a mismatched/missing session or a schedule
mode other than host-slots. The updated server reports an older/different saved
schedule mode explicitly. Host-slot diagnostics include saved and available counts
and a reason per published slot. Zero saved rows are reported separately.

This is diagnostic work, not proof that an unavailable slot should be made free.
It does not discard calendar conflicts or alter saved bookings.

Copy existing-functions/scheduler.cjs into your existing backend as scheduler.cjs,
then deploy:

firebase deploy --only functions:schedulerSlots --project usmlesarthi-residency-match

Build the frontend with npm run build and deploy:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

Open the event link, check the displayed signed-in account, then click the
availability diagnostic control. No production sign-in, private calendar access
or deployment was performed during local validation.
