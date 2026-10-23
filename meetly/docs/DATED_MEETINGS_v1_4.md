# Dated meetings and booking audience — v1.4

## What changed

All authorized host roles (Admin, CustomerSupport, SuperAdmin, Mentor, Journalist) can create meetings at a specific date and start time. Existing administrator-wide access remains limited to Admin, CustomerSupport and SuperAdmin; Mentor and Journalist retain access to their own workspace.

Go to `/event-types`, select **New dated meeting**, enter the title/date/start time/duration, choose the audience, save and use **Copy link** on the event card. The URL is `/book/HOST_SLUG/EVENT_ID`.

- **Anyone with the link** accepts public guest bookings.
- **Registered users only** requires a signed-in Firebase account with verified email AND exactly one matching `uid` record in `(default)/Users`. Merely creating a Firebase Auth account does not establish membership. Email and UID are derived on the server. User profile data and existing role records are never modified.
- Membership is checked for new reservations, idempotent retries and rescheduling; registered rescheduling requires the original account. Existing private cancellation links remain usable.
- The chosen date/time creates one exact UTC instant in the host profile timezone. Slots respect min notice, daily host booking limits, buffers, connected-calendar conflicts and existing booking locks. The chosen time replaces weekly availability; it can be on a normally closed day. Fixed meetings ignore the recurring booking horizon because the date was explicitly chosen.
- This is a single-host meeting for one reservation, not a group class or a multi-seat event. After reservation its occupied time is unavailable to other users. Cancellation can free the time under the existing policy.
- The audience setting can also be applied to recurring event types. Existing event records without the new fields remain recurring and public.
- Times on booking pages use the viewer's selected display timezone. The calendar date remains labeled in the host timezone. A later host timezone change preserves a fixed meeting's stored instant.

## Update the existing Firebase backend

Copy `existing-functions/scheduler.cjs` beside your existing Functions `index.js`. Keep your existing Firebase initialization and unrelated functions. Ensure the LAST scheduler registration is:

```js
Object.assign(exports, require("./scheduler.cjs"));
```

The add-on continues to use your existing firebase-admin/firebase-functions packages and luxon (`npm install luxon@^3.6` if missing).

Before deploying, preserve the current working backend environment settings in `functions/.env.usmlesarthi-residency-match`: APP_ORIGIN, GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID when configured, and OAUTH_REDIRECT_URI. Console-only environment changes can be overwritten by CLI deployments. Keep secrets in Secret Manager and retain the SAME OAUTH_TOKEN_KEY that encrypted existing calendar tokens.

Deploy the changed booking endpoints from the existing Firebase project root:

```bash
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerPublicPage,functions:schedulerPublicEvent,functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match
```

Update the frontend `src` files from this project, preserving its Firebase configuration and .env. Both your VITE_APP_FIREBASE_* names and the original VITE_FIREBASE_* names remain supported. Run `npm install --include=dev` and `npm start`, or `npm run build` and deploy ONLY the scheduler Hosting site.

The latest add-on also includes the earlier safe OAuth callback diagnostics, optional-provider secret declarations and slot lookup fixes. Deploy schedulerConnect/schedulerOAuthCallback separately if those earlier fixes have not been installed. The fixed/registered feature itself does not require changing your already-working OAuth connection.

## Indexes

The existing three composite indexes in firestore.indexes.json cover the changed scheduling queries. No new composite index is needed for these features. The default Users lookup uses its normal single-field uid index.

Deploy the supplied scheduler index manifest before testing, if not already deployed:

```bash
firebase deploy --only firestore:indexes --config firebase.scheduler-indexes.json --project usmlesarthi-residency-match
```

Wait until indexes are Enabled. This config targets calendly and contains no default database rules.

## Checks and limits

33 automated tests pass (26 backend, 7 frontend), including exact fixed time, closed weekdays, buffers, timezone preservation, invalid dates/DST gaps, anonymous guest access, registered membership rejection, authenticated email identity, dated booking flow and public sign-in gating. Production build, module syntax and CommonJS export checks pass. Tests do not replace live Firebase transaction/concurrency, OAuth or physical-device checks; those have not been run here.

Server-side reservation still checks settings again inside its existing booking transaction and uses host-day locks. External calendar edits cannot be made atomic with Firestore reservations. S3 calendar synchronization, group capacity, payments and round robin remain outside this release.
