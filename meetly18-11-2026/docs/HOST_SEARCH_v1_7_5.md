# Round-robin host prefix search

schedulerSearchHosts now runs the same two parallel queries as schedulerSearchUsers against default Users: displayName/email orderBy, startAt(value), endAt(value + "\uf8ff"), limit(20). The search is case-sensitive, starts-with, and requires two characters. The UI keeps its debounce and no longer automatically scans host pages.

Candidates are then filtered server-side by their UID against the authoritative default UsersRoles collection. Only exactly one role record with Role equal to Admin, CustomerSupport, SuperAdmin, Mentor or Journalist qualifies. A Role field copied into Users is never trusted. Batched UID queries reduce the number of role lookups. Duplicate, missing, student or differently cased role records are excluded.

A completed calendly/scheduler_hosts profile is also required, since the existing scheduler needs host time zone, weekly availability and calendar information. Host profile existence is checked with a batched read. Eligible results show their role in the selector. The existing save endpoint revalidates host permissions before assigning the meeting.

No schema migration or composite indexes are needed; these queries use the existing automatic single-field indexes. Prefix queries return at most 20 documents per field before role filtering, so refine the name/email prefix if many non-host records share it. A host must have a matching Users record as well as UsersRoles and a completed Meetly profile to appear in this selector.

## Deploy

Replace your existing functions/scheduler.cjs with the included existing-functions/scheduler.cjs, keeping unrelated functions and your environment settings.

```bash
firebase deploy --only functions:schedulerSearchHosts --project usmlesarthi-residency-match
```

Update frontend source, preserve your .env and Firebase Hosting configuration, then:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

This package includes all preceding v1.7.4 public registration fixes. If those have not been deployed, apply that update's backend deployment instructions too.
