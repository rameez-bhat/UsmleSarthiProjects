# Selected-user labels in the meeting editor

The picker previously populated its known-users cache only from search results. Opening an existing meeting supplied selected UIDs but no cached labels, so the chips displayed raw UIDs.

The picker now resolves missing selected labels with schedulerSelectedUsers when the meeting dialog opens. The new endpoint validates the authenticated host, validates selected UIDs, and runs bounded batched UID queries against default Users. It returns only UID, displayName/name and email; duplicate and missing UID records are not exposed. It does not change user records, meeting selections or search semantics.

Chips prefer email, with name as a fallback. During loading they show Loading user…; missing/ambiguous accounts show User unavailable instead of a raw UID. A failed request offers a retry. Both participant and round-robin host selections use this behavior. Name/email prefix search and host-role filtering remain unchanged. The redundant old host-pagination loop has also been removed from the picker.

The source supplied in the attachment was compared with the project source. Its custom public tagline, Simple scheduling. Meetly., is retained in the updated main.jsx.

## Deploy

Replace your existing functions/scheduler.cjs with existing-functions/scheduler.cjs from this package, retaining other exports and existing environment settings. The complete add-on now contains 28 scheduler exports.

```bash
firebase deploy --only functions:schedulerSelectedUsers --project usmlesarthi-residency-match
```

Update the frontend source (including main.jsx and request-activity.js), preserving your .env and Firebase Hosting configuration:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Deploy the new endpoint and frontend together, then reload and reopen the editor. No new indexes, data migration or edits to default Users/UsersRoles are needed. This package contains all preceding updates; apply their backend deployment instructions too if not already deployed.
