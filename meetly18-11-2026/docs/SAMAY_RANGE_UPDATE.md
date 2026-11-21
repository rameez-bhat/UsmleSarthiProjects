# SAMAY scheduling update

The visible application name is SAMAY. Existing Firebase project IDs, database names, collection names, URL paths and saved IDs are preserved.

Host selection initially queries up to ten eligible UsersRoles records and resolves their Users labels directly from the default database. Expand Choose hosts to select, or type two or more characters to search by name/email. The existing allowed roles remain Admin, CustomerSupport, SuperAdmin, Mentor and Journalist. Existing selection limits remain.

Duration appears above the schedule editor. Each host row has a date and start time, with an optional same-date range end. When an end is supplied, Save expands the range into exact choices at duration-sized intervals. A 09:00–11:30 range with duration 30 produces 09:00, 09:30, 10:00, 10:30 and 11:00. Only full meetings that finish by the end are generated. Existing rows without an end remain single appointments. Generated choices are saved individually and appear as individual entries when edited later. The maximum remains 100 published slots per event.

Published alternatives can be adjacent even with buffers configured. Once one appointment is booked, server booking checks still remove conflicting options including buffers. Existing booked appointments are unchanged.

The editor offers only Google Meet and Zoom. Legacy event types using other locations are converted to Google Meet in the editor; verify the location before saving. A saved assigned appointment may need cancellation and recreation under existing rules.

## Deployment

Copy existing-functions/scheduler.cjs to your existing backend functions directory, preserving unrelated code and working environment settings. Then run from the existing backend project:

```sh
firebase deploy --only functions:schedulerSaveEvent --project usmlesarthi-residency-match
```

From the frontend project, preserving your actual Firebase Hosting target configuration:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new secrets, indexes or database migrations. Your Firestore rules must allow the existing frontend identity queries.

75 backend and 49 frontend tests passed and the production build passed. Live Google/Zoom integration and actual browser layout were not exercised. The earlier full frontend-database migration remains incomplete; this update does not claim to finish it.
