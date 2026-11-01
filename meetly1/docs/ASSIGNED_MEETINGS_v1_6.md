# v1.6 — Assign registered users and personal meeting dashboards

All five host roles (Admin, CustomerSupport, SuperAdmin, Mentor, Journalist) can select registered users while creating a meeting with a specific date and time. Mentor and Journalist continue to manage only their own meetings; the other three roles retain global administration.

## Use

1. Sign in as a host and open **Event types → New dated meeting**.
2. Search **Add registered users** by name or email. Tick multiple results. Selected chips remain selected when the search changes; click a chip to remove it.
3. Set the date, time, duration and joining method. Save.
4. Selected users are confirmed immediately. They do not need to reserve a second slot. The host sees one shared meeting under Bookings and can open **View attendee details**, then choose a participant to inspect their existing profile.
5. Each selected user signs in using their existing Firebase account and opens **/my-meetings**. Students see only their own meetings, statuses, times in their device time zone, and joining instructions. Student accounts have no host menus or profile setup requirement.

Meetings without selected users continue to use the existing public booking behavior. A link to a meeting with assigned users directs visitors to My meetings rather than offering another booking form. The user's authenticated UID must match the default Users record; matching an email alone does not grant dashboard access.

## Update your existing deployment

Copy `existing-functions/scheduler.cjs` to your existing functions folder, replacing the previous scheduler add-on. Keep `Object.assign(exports, require("./scheduler.cjs"));` at the end of your existing index.js. Do not replace unrelated functions.

Preserve your working backend OAuth environment values and secret bindings before deploying. SaveEvent now checks connected calendars and needs the same OAuth configuration as Slots. Never regenerate your existing OAUTH_TOKEN_KEY.

Deploy these new or changed functions from the existing Firebase project directory:

```bash
firebase deploy --only functions:schedulerSearchUsers,functions:schedulerMyMeetings,functions:schedulerSaveEvent,functions:schedulerAttendeeDetails,functions:schedulerPublicPage,functions:schedulerPublicEvent,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerSyncBooking,functions:schedulerReminders --project usmlesarthi-residency-match
```

Update the frontend source, preserving your .env, firebase.json and .firebaserc. Build and deploy to the existing Hosting target:

```bash
npm install
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new composite indexes are needed: participant array membership and legacy attendee UID queries use automatic single-field indexes. Keep automatic indexing enabled for these fields in calendly. The default database Users/UsersRoles records are read, never edited by this feature.

## Behavior and limits

- Up to 100 selected users per dated meeting. One canonical reservation and one calendar event per connected provider contain all participants. Local host conflicts and daily limits are rechecked in a Firestore transaction using the same host-day locks as public bookings.
- Calendar free/busy is checked before the transaction. Calendar providers cannot participate atomically in Firestore transactions, so external changes at that exact instant remain a provider integration limitation.
- Once created, an assigned meeting's settings and attendees are fixed. Cancel from Bookings and create another to change them. Cancellation preserves the canceled meeting on students' dashboards and queues notices/calendar removal.
- Search reads the existing default Users collection in pages of 200 using case-insensitive substring matching on name/email; it does not require changing Users. It scans until enough matches appear or the directory ends. Load more continues paging; large directories may cost more reads and take longer. No 1,000-row limit.
- Only names, emails and UIDs are returned to authorized hosts for selection. Names/emails are resolved again on the server at save time. Duplicate UID identities, missing records and invalid email addresses are rejected. Public event responses omit selected UIDs; personal dashboards omit other attendees and management tokens.
- Participant emails are included in the shared provider calendar event; this is a shared meeting roster. Application email notices are queued individually, without exposing a shared cancellation token.
- Email delivery still depends on the existing EMAIL_ENABLED/mail-extension setup. Calendar join links appear after successful synchronization; dashboard Refresh reloads them. Student sign-in requires a verified email and one matching Users record.
- Existing bookings appear under My meetings if they already store the user's attendeeUid. Old anonymous bookings are not retroactively linked by email.
- Local automated checks cover user selection, student-only navigation, identity resolution, data isolation and existing scheduler behavior. Live Google/Microsoft invitations and production Firestore concurrency must still be checked with sample accounts after deployment.
