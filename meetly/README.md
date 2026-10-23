# Meetly v1.11.3 — stable editor and explicit appointment dates

See docs/EDITOR_FIX_v1_11_3.md. Outside clicks no longer close the editor. Explicit dates can be saved independently of the rolling booking horizon and notice; booking cutoff and conflicts remain enforced. Backend and frontend updates required.

# Meetly v1.11.2 — independent date-and-time entries

See docs/PAIRED_DATETIMES_v1_11_2.md. This replaces the separate date/time lists in v1.11.0–v1.11.1 with one combined date-and-time field per host appointment.

# Meetly v1.11.1 — save selected dates and times in every schedule category

See docs/MULTIPLE_DATES_v1_11_1.md. Multiple dates are enabled by default for new booking links. Save includes pending bulk date/time selections. Frontend-only update when the v1.11.0 backend is deployed.

# Meetly v1.11.0 — calendar booking and multiple host dates/times

See docs/CALENDAR_BOOKING_v1_11.md for editor steps, all schedule categories, preserved invitation behavior and targeted deployment.

# Meetly v1.10.1 — organizer time visibility and availability diagnostics

See docs/ORGANIZER_AVAILABILITY_v1_10_1.md. Organizer slots use current host time zones consistently, legacy team lists include the organizer, and unavailable hosts remain visible. An organizer-only diagnostic button explains filtered slots without exposing calendar details publicly.

# Meetly v1.10.0 — personal Zoom connections, event deletion and clear calendar status

See docs/ZOOM_AND_EVENT_LIFECYCLE_v1_10.md. Personal Zoom requires a separate user OAuth app; existing S2S credentials remain unchanged. Editing a booking link affects future bookings, not existing appointments.

# Meetly v1.9.1 — organizer joins team host options

The organizer is included automatically alongside selected hosts in host-specific team times and automatic round-robin assignment. Add meeting times for the organizer to make them bookable, alongside the selected hosts. Existing host-specific events gain organizer times when edited and saved; existing confirmed bookings are unchanged. Saved assigned meetings retain their existing edit restrictions. The 20-host limit includes the organizer. Deploy schedulerSaveEvent and the frontend.

# Meetly v1.9.0 — separate pages, manual refresh and host-specific team times

See docs/PAGES_AND_HOST_TIMES_v1_9.md for the page/file map, team booking workflow and targeted deployment.

# Meetly v1.8.2 — responsive sidebar

Sidebar scrolling follows the visible viewport height, including short screens and browser zoom. Mobile navigation has a close button and backdrop without shifting content off-screen. Long workspace names wrap. Rebuild and deploy hosting; no function changes.

# Meetly v1.8.1 — shared Firebase login

Browser-local Firebase configuration is no longer used. Firebase Hosting supplies shared public configuration when build-time values are absent. Hosts on another device see login, not a demo/setup dashboard. See docs/SHARED_FIREBASE_v1_8_1.md for deployment.

# v1.8.0 — Meeting email settings using your existing mail service

Meeting notifications now feed the existing default-database mail collection as {to, message:{subject,html}}. No new SMTP setup, extension or EMAIL_ENABLED flag is required. Policies cover invitees, confirmed attendees, assigned hosts, organizing admins and reminders. See docs/MEETING_EMAILS_v1_8.md.

# v1.7.6 — Selected-user email labels while editing

Existing meeting selections now load their name/email labels from Users by saved UID, so invitee and round-robin host chips display email rather than UID before any search is typed. Your uploaded main.jsx tagline change is preserved. See docs/SELECTED_USER_LABELS_v1_7_6.md.

# v1.7.5 — Fast role-filtered round-robin host search

Round-robin host search now uses the same displayName/email prefix queries as user search, with authoritative role checks for Admin, CustomerSupport, SuperAdmin, Mentor and Journalist. See docs/HOST_SEARCH_v1_7_5.md.

# v1.7.4 — Public registration for shared meetings

Anyone-with-the-link meetings now accept public registrations even when users have been pre-invited. Invitees can accept directly on the shared link. Guests receive a private confirmation/cancellation page. See docs/PUBLIC_SHARED_MEETINGS_v1_7_4.md.

# v1.7.3 — Visible API request loading

Every scheduler callable request now displays a progress bar and a loading card with the action and active request count on every page. See docs/REQUEST_LOADING_v1_7_3.md.

# v1.7.2 — Group attendee details fix

The group roster now returns its booking document ID, and the frontend preserves the original ID when opening participant details. This fixes requests containing id: null. See docs/ATTENDEE_DETAILS_FIX_v1_7_2.md.

# v1.7.1 — Faster user search

Replaced the Users collection scan with parallel displayName/email prefix queries (20 results per field), deduplication and a two-character minimum. Search remains case-sensitive, matching your Angular implementation. No lowercase fields or data migration. See docs/FAST_USER_SEARCH_v1_7_1.md for deployment.

# v1.7.0 update

Selected users receive invitations with Accept/Decline, rather than automatic confirmation. Added dated-meeting round robin, manual Google Meet links, Zoom API/manual links, and an optional Meetly room page powered by your Jitsi server.

See [setup and deployment](docs/INVITATIONS_ROUND_ROBIN_VIDEO_v1_7.md). This supersedes the automatic-confirmation behavior described in v1.6 notes below.

# v1.6.0 update

Search and select registered users for dated meetings; students can sign in to `/my-meetings` to see their scheduled meetings. See [deployment and behavior](docs/ASSIGNED_MEETINGS_v1_6.md).

# Meetly — v1.5.1

Signed-out dashboard URLs now display a standalone, responsive login page without the sidebar, workspace menu, dashboard toolbar or footer. The menu is also hidden while Firebase resolves the initial session. Successful sign-in preserves the requested dashboard URL; sign-out clears open dialogs and workspace state. Public booking and private management links retain their existing guest/registered access behavior.

This update changes only the frontend. Replace `src/main.jsx` and `src/styles.css` from this archive, keeping your existing Firebase configuration, .env, firebase.json and .firebaserc. Run `npm start` locally; for Hosting run `npm run build` and deploy only your scheduler Hosting target (`hosting:usmlesarthischeduling` in your existing setup). No Functions deployment or index changes are needed.

Validation: 15 frontend tests and production build pass, including session loading, direct signed-out dashboard entry, guest public booking, sign-in/sign-out and account switching. Earlier 32 backend tests remain unchanged. Source is beautified. Real browser/device and live Firebase checks remain necessary.

# Meetly — v1.5

Dated booking links now open directly to the booking form, without a calendar or time picker. Hosts can view attendee details from their bookings, including verified linked registered profiles and submitted answers. Guest profile lookup is never based on a typed email.

Read **docs/UPDATE_v1_5.md** for the update steps, three-function deployment command, access rules and limits. All changed code is beautified. 41 automated tests and the production build pass; live acceptance tests remain necessary.

# Meetly — v1.4

Dated meetings and per-event booking audience are implemented. See **docs/DATED_MEETINGS_v1_4.md** for usage, backend/frontend updates, existing environment preservation, index deployment and test coverage.

Use **New dated meeting** at `/event-types`, set the date/start time/duration and choose **Anyone with the link** or **Registered users only**. Save and copy that meeting's booking link. The latter requires verified Firebase Auth and a matching default-database Users record, enforced by the server.

All supplied source is beautified. Current validation: 33 passing tests and production build. Live acceptance testing is still required.

## v1.3: Direct page links and complete scheduler backend addon

Direct URLs: /event-types, /bookings, /availability, /hosts, /integrations, /settings and /administration. The root URL also opens event types. Browser history and trailing-slash direct entry are supported. SPA Hosting rewrite is included.

For your existing CommonJS Firebase functions project, follow **existing-functions/README.md** and copy its scheduler.cjs addon beside your existing index.js. This includes all 19 scheduler endpoints/background functions, including SaveAvailability and Connect, without replacing unrelated functions. No OAuth secrets are needed to deploy the basic profile/event/availability endpoints. Full calendar/booking functionality needs the documented backend environment and secrets.

This release retains responsive layouts and adds a loading state so the onboarding form does not flash while the workspace is loading. Both your VITE_APP_FIREBASE_* environment names and the original names are supported. Live testing is still required.

## v1.2: Existing account roles and mobile layout

The backend reads `(default)/UsersRoles` using the authenticated Firebase UID (`uid` field). Document IDs may differ from the UID. Exactly one matching record is required; missing, duplicate, unknown or incorrectly cased roles are denied. The existing collections are never modified.

- Administrators: `Admin`, `CustomerSupport`, `SuperAdmin`. All can also host.
- Other hosts: `Mentor`, `Journalist`.
- Student tiers such as `Silver` cannot create a host workspace. Public attendee booking links remain available; enrolled-student eligibility/S3 synchronization remain future work.
- Administrators have an additional read-only Administration view across all hosts, with paginated loading and Eastern time labels. This release does not add cross-host editing or cancellation overrides.
- Authorization is checked on each privileged callable, public host/slot lookup and OAuth completion. No browser role or signup grants permissions. Existing host bookings can still be processed by background synchronization if a role later changes.
- Cross-database role checks run on the server. Scheduler Firestore rules now deny direct client reads and writes; the workspace loads through authorized callable functions, refreshing every 15 seconds and after changes. Deploy the new functions, rules AND frontend together.
- Default database rules and existing identity records are left unchanged. The Functions service account needs read access to `(default)/UsersRoles` and scheduler access to `calendly`.
- Responsive navigation is retained. New administrator cards wrap on mobile, including long emails and event names. Automated tests/build passed; physical-device and live Firebase acceptance testing still required.

Run from the extracted `meetly` folder: `npm install`, then `npm start`. Existing Firebase project/OAuth/email setup below still applies.

# Meetly — React + Firebase scheduling

Version 1.1: a first working scheduling release for **multiple independent hosts**, using your existing Firebase project. It includes the React application, Firebase Functions, Firestore rules/indexes, tests, and a compiled frontend.

## What is implemented

- Host sign-up/sign-in, email verification, password reset, profile and unique booking slug.
- Multiple independent hosts, each with a private dashboard and public booking pages.
- Event types with duration, description, colors, enable/pause, custom questions, minimum notice, booking horizon, cancellation cutoff, buffers and daily host booking caps.
- Weekly availability, multiple intervals per day and date-specific overrides/holidays.
- Public date/time selection, attendee time-zone display and DST-aware server calculations.
- Booking, private management links, cancellation, rescheduling and downloadable ICS files.
- Firestore transactions with shared host/day lock documents, server-side validation and idempotent booking requests.
- Google and Microsoft OAuth with PKCE/state verification; refresh tokens encrypted with AES-256-GCM and never returned to browsers.
- Primary-calendar busy-time checks for **both** providers, background calendar creation/deletion, Google Meet and supported Microsoft Teams links, retry status and host-triggered sync retry.
- Confirmation/cancellation/rescheduling email queue and scheduled reminders, through your existing default-database mail service.
- Responsive dashboard, integrations, host-sharing page and demo mode with browser-local persistence.

**Not implemented:** shared organizations/admin roles, invitation-only membership, round-robin assignment, collective/group bookings, recurring appointment series, payments/subscriptions, Zoom OAuth, SMS/WhatsApp, calendar selection beyond each provider's primary calendar, or interpreting externally edited calendar events as changes to the original booking. This is not complete Calendly feature parity.

Calendar integrations and production Firestore transactions have not been exercised against your accounts/project. Automated checks cover scheduling logic and the demo UI; they do not prove live OAuth, email delivery or production concurrency.

## 1. Run the interactive demo

Use Node.js 22.12+ and npm. The Functions runtime is Node.js 22.

```bash
npm ci
npm --prefix functions ci
npm start
```

Without Firebase configuration, the application opens in clearly labeled **demo mode**. Demo bookings and settings persist in that browser only. No email is sent and no external calendars are connected. Use an HTTPS/localhost origin for clipboard support and `crypto.randomUUID`.

```bash
npm run build
npm --prefix functions run check
npm --prefix functions test
npx vitest run
```

The included `dist/` is a ready-built demo frontend, not a configured live Firebase deployment. Rebuild after supplying your web configuration.

## 2. Connect your existing Firebase project

1. In Firebase Console, register a **web app** in your existing project if needed. Enable Authentication → Email/Password and Cloud Firestore in Native mode. Create a separate Standard-edition database with ID `calendly` (lowercase). The frontend, backend, job trigger, rules and indexes are configured for this named database.
To create the database with Firebase CLI after selecting your actual location:

```bash
firebase firestore:databases:create calendly --location YOUR_FIRESTORE_LOCATION --project YOUR_PROJECT_ID
```

Do not recreate it if it already exists. The code cannot create a Cloud Firestore database merely by initializing a client.

2. Copy `.env.example` to `.env.local`. Fill in the **public web configuration** (`apiKey`, `authDomain`, `projectId`, `appId`) and choose the Functions region. Default: `asia-south1`. Frontend and backend regions must match.
3. Copy `functions/.env.example` to `functions/.env.YOUR_PROJECT_ID`. Set `APP_ORIGIN`, OAuth client IDs and `OAUTH_REDIRECT_URI`.
4. Enable billing required for Cloud Functions and Cloud Scheduler in the project. No services have been deployed by this package.
5. Add the scheduler's final domain to Authentication's authorized domains. Verify the host's email before saving a profile. The UI has a verification-refresh button.

You can also paste the public web configuration as JSON through the demo's **Connect Firebase** dialog after deploying the backend. This browser-local convenience does not deploy Functions or configure OAuth.

### Preserve your existing app

All application collections start with `scheduler_`. Functions have `scheduler`-prefixed export names and the Firebase Functions codebase is `scheduler`.

Use a **separate Hosting site in the same project** so the scheduler does not replace an existing website. After installing Firebase CLI and logging in locally:

```bash
firebase hosting:sites:create YOUR_SCHEDULER_SITE_ID --project YOUR_PROJECT_ID
firebase target:apply hosting scheduler YOUR_SCHEDULER_SITE_ID --project YOUR_PROJECT_ID
```

The Hosting target in `firebase.json` is `scheduler`. Do not run `firebase init` over these files without preserving their configuration.

**Merge** the `scheduler_*` rules and indexes into your project's existing configuration before deploying Firestore. Deploying the supplied standalone `firestore.rules` directly would replace the project's existing rules. Existing broad wildcard allows must also be scoped away from `scheduler_*`: Firestore allows are additive, so an additional deny cannot counteract another matching allow.

This package targets only `calendly`, not your existing `(default)` database. If `calendly` already exists, review and merge its existing rules/indexes before deployment.

The supplied rules let hosts read only their own profile, event definitions, bookings and connection metadata. Client writes are disabled; public booking and profile reads use validated callable Functions. Tokens, slugs, jobs, locks, rate limits and the email queue remain server-only.

## 3. Google and Microsoft calendar setup

Register a Google OAuth web client, enable the Google Calendar API and configure its consent screen/test users as required. Register a Microsoft Entra web application supporting the account types you want to allow (the code uses the `common` endpoint).

Both registrations use this **exact server redirect URI**, replacing the values to match your deployed region/project:

```text
https://asia-south1-YOUR_PROJECT_ID.cloudfunctions.net/schedulerOAuthCallback
```

Put the same URL in `functions/.env.YOUR_PROJECT_ID` as `OAUTH_REDIRECT_URI`.

Google requests Calendar Events and free/busy access. Microsoft requests delegated `User.Read`, `Calendars.ReadWrite` and `offline_access`. Provider consent/verification and tenant policies may apply. Teams links require an account/calendar that supports Teams meetings; connecting Outlook alone does not provide a Teams license.

Store the OAuth secrets using Firebase Secret Manager, **not** in the React `.env` file:

```bash
firebase functions:secrets:set GOOGLE_CLIENT_SECRET --project YOUR_PROJECT_ID
firebase functions:secrets:set MICROSOFT_CLIENT_SECRET --project YOUR_PROJECT_ID
firebase functions:secrets:set OAUTH_TOKEN_KEY --project YOUR_PROJECT_ID
```

For `OAUTH_TOKEN_KEY`, generate a random 32-byte base64 value locally with `openssl rand -base64 32`, then paste it into the secret prompt. Keep this key backed up securely. Replacing it without migrating encrypted records makes stored calendar tokens and management-link ciphertext unreadable.

The current Functions configuration binds all three secrets, so configure them before deploying the backend even if you initially test only one calendar provider. Never send secret values in chat or put them in source control.

After deployment, each host connects their Google and/or Outlook account from **Integrations**. Both connected primary calendars block busy times; bookings are written to connected calendars in the background. If a provider is unavailable during a busy-time check, booking fails closed rather than assuming the host is free.

Bookings in Firestore are authoritative. External calendar systems cannot participate in the Firestore transaction: an external edit made at the exact same moment can still race the availability check. Calendar creation is asynchronous and can fail independently of an already saved booking. Sync failures are visible to the host and can be retried. The source uses deterministic provider identifiers/transaction IDs, a job queue and partial-progress records to reduce duplicate external events.

Disconnecting a calendar is blocked while it has upcoming synced confirmed bookings. Cancel those bookings or wait until they finish first.

## 4. Email and reminders

The scheduler uses your existing mail service in `(default)/mail`. A forwarding function copies notification drafts from `calendly/scheduler_mail` into the exact `{to, message: {subject, html}}` format your service already processes. No additional mail extension, SMTP configuration or EMAIL_ENABLED flag is required.

Meeting settings control invitations, confirmations, cancellations, host updates and reminders. Reminders run every five minutes with stable message identifiers. Calendar providers may independently send calendar invitations. See [the current email setup and deployment guide](docs/MEETING_EMAILS_v1_8.md).

## 5. Deploy

After merging the existing project's rules/indexes, confirming the Hosting target and setting environment variables/secrets:

```bash
npm run build
firebase deploy --only firestore --config firebase.calendly.json --project YOUR_PROJECT_ID
firebase deploy --only functions:scheduler,hosting:scheduler --project YOUR_PROJECT_ID
```

`firebase.calendly.json` is a dedicated Firestore-only configuration containing just the `calendly` database. Use it for the Firestore deployment so an existing project configuration containing `(default)` is not selected inadvertently. Review and merge existing rules/indexes within `calendly` if needed.

Firestore indexes must finish building before their dependent queries work.

Optional App Check: register a reCAPTCHA Enterprise site key for your Firebase web app; set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` and rebuild. Then set `ENFORCE_APP_CHECK=true` for Functions and redeploy. Public endpoints also have server-side per-IP request throttling. App Check is not enabled by default because no project-specific site key was provided.

Consider a Firestore TTL policy on `scheduler_limits.expiresAt` to clean up rate-limit documents. OAuth state is checked for expiry on the server and consumed once; expired unused states can be cleaned up separately. Configure log/data retention to suit your organization.

## 6. Smoke test with your accounts

1. Register two separate hosts, verify their emails and create distinct booking slugs. Confirm that one host cannot read/edit the other's private data.
2. Connect Google and Outlook; create a busy event directly in each provider and confirm those times disappear from the booking page.
3. Book as an attendee, refresh the private management link, download ICS, reschedule and cancel. Confirm provider events and emails follow the changes.
4. Submit two different guest booking requests for the exact same slot concurrently; exactly one should reserve it. Repeat across two event types belonging to the same host.
5. Test minimum notice, daily cap, buffer boundaries, a date override and different attendee/host time zones.
6. Revoke calendar consent, confirm slots fail closed, reconnect, then retry an errored sync from the host dashboard.

Browser visual QA, emulator integration tests, live provider OAuth, email delivery and production deployment remain unverified in this delivery. Backend syntax/module-load checks, eight scheduling unit tests, two named-database configuration tests and three DOM interaction tests passed in the build environment.

## USMLESarthi review documents

- `docs/USMLESarthi_Technical_Specification.md` preserves the supplied technical specification.
- `docs/PHASE_ONE_GAP_REVIEW.md` maps A01–A14 to the current implementation. No business acceptance scenario is marked Pass without end-to-end evidence.
- `docs/S3_INTEGRATION_CONTRACT.md` records the required discovery inputs and proposed adapter contract. It does not invent an S3 schema or enable writes into S3.
- `docs/ACCEPTANCE_SIGNOFF.md` is an unfilled test signoff sheet with Pass / Fail / Not in phase / Not tested statuses.

Version 1.1 corrects `npm start` and named-database routing. It does not implement all USMLESarthi phase-one features, admin roles, enrolled-student authorization or S3 integration. Existing demo/free-public booking flows must not be used as enrolled-student-only production flows.

### Official setup references

- [Firebase Hosting setup](https://firebase.google.com/docs/hosting/quickstart)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Functions environment and secrets](https://firebase.google.com/docs/functions/config-env)
- [Google web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Microsoft Graph calendarView](https://learn.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0)
- [Firebase Trigger Email](https://firebase.google.com/docs/extensions/official/firestore-send-email)

Named-database reference: https://firebase.google.com/docs/firestore/manage-databases
