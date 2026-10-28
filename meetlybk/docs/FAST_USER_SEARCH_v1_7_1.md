# v1.7.1 — Indexed prefix search

The registered-user selector now queries the default database Users collection using two parallel queries:

```js
.orderBy("displayName").startAt(value).endAt(value + "\uf8ff").limit(20)
.orderBy("email").startAt(value).endAt(value + "\uf8ff").limit(20)
```

It requires two trimmed characters, keeps the 350 ms debounce, merges results by document ID, sorts by display name and returns only UID, name and email. It performs no directory scan or automatic pagination for Users. Selected users remain selected across searches. Each request returns at most 40 results before deduplication; refine the prefix for more specific results. The existing host-directory selector is unchanged.

Search is case-sensitive and matches only the beginning of each field. Moh matches Mohammad; moh does not match Mohammad, and Shafi does not match Mohammad Shafi Bhat. No new fields, data migration or composite index is required; keep the automatic single-field indexes for displayName and email enabled in the default database.

Host authorization and server-side validation of selected identities are unchanged. The browser still uses the callable function rather than receiving direct database access.

## Deploy

Replace your existing functions/scheduler.cjs with the included existing-functions/scheduler.cjs. Keep the existing add-on export line and all other functions intact. Preserve the existing Functions environment and secrets.

```bash
firebase deploy --only functions:schedulerSearchUsers --project usmlesarthi-residency-match
```

Update the frontend source, preserving your .env and Firebase Hosting configuration, then:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

All v1.7 invitation, round-robin, Google Meet, Zoom and optional Jitsi features remain included. If upgrading from an older version, follow the v1.7 deployment instructions too.
