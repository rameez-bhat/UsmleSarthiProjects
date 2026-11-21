# Meeting slot count limit removed

Both frontend range expansion (`src/time-ranges.js`) and backend normalization
(`functions/host-slots.js`) now accept more than 100 meeting slots per event.
There is no replacement application-level slot count cap. Empty schedules,
invalid dates/times, duplicate backend slot entries and invalid hosts still fail
validation. Frontend previews continue deduplicating identical choices.

Deploy both frontend and backend to remove the old error completely:

1. Copy `existing-functions/scheduler.cjs` to your existing functions directory as
   `scheduler.cjs`. Preserve your existing entry point and unrelated functions.
2. Run:
   `firebase deploy --only functions:schedulerSaveEvent --project usmlesarthi-residency-match`
3. Rebuild frontend with `npm run build`, then deploy:
   `firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match`

This removes the artificial 100-slot restriction. Slots still reside inside an
individual Firestore event document, so this is not unbounded storage. Very large
schedules require moving slots into separate documents. Other policies, including
booking horizon, notice, host count and date range validation, are unchanged.
