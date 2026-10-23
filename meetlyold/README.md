# Meetly — React + Firebase scheduling

A first working scheduling release for **multiple independent hosts**, using your existing Firebase project. It includes the React application, Firebase Functions, Firestore rules/indexes, tests, and a compiled frontend.

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
- Confirmation/cancellation/rescheduling email queue and scheduled reminders, once the Firebase Trigger Email extension and SMTP delivery are configured.
- Responsive dashboard, integrations, host-sharing page and demo mode with browser-local persistence.

**Not implemented:** shared organizations/admin roles, invitation-only membership, round-robin assignment, collective/group bookings, recurring appointment series, payments/subscriptions, Zoom OAuth, SMS/WhatsApp, calendar selection beyond each provider's primary calendar, or interpreting externally edited calendar events as changes to the original booking. This is not complete Calendly feature parity.

Calendar integrations and production Firestore transactions have not been exercised against your accounts/project. Automated checks cover scheduling logic and the demo UI; they do not prove live OAuth, email delivery or production concurrency.

## 1. Run the interactive demo

Use Node.js 22.12+ and npm. The Functions runtime is Node.js 22.

```bash
npm ci
npm --prefix functions ci
npm run dev
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

1. In Firebase Console, register a **web app** in your existing project if needed. Enable Authentication → Email/Password and Cloud Firestore in Native mode (the code uses the default database).
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

Install Firebase's official **Trigger Email** extension in the same project. Configure your SMTP provider and set the extension's email documents collection to **`scheduler_mail`**. Set `EMAIL_ENABLED=true` in the Functions environment and redeploy Functions.

The backend writes message documents; the extension performs delivery. Without the extension/SMTP configuration, app emails are not delivered. Calendar providers may separately send their own invitation messages after calendar integration is connected.

Reminders run every five minutes, using 24-hour and 1-hour windows with stable per-booking/revision/message IDs. Very late-created bookings do not receive reminders for windows that have already passed. Email retry/delivery status is managed by the extension; monitor its collection and logs.

## 5. Deploy

After merging the existing project's rules/indexes, confirming the Hosting target and setting environment variables/secrets:

```bash
npm run build
firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
firebase deploy --only functions:scheduler,hosting:scheduler --project YOUR_PROJECT_ID
```

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

Browser visual QA, emulator integration tests, live provider OAuth, email delivery and production deployment remain unverified in this delivery. Backend syntax checks, eight scheduling unit tests and three DOM interaction tests passed in the build environment.

### Official setup references

- [Firebase Hosting setup](https://firebase.google.com/docs/hosting/quickstart)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Functions environment and secrets](https://firebase.google.com/docs/functions/config-env)
- [Google web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Microsoft Graph calendarView](https://learn.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0)
- [Firebase Trigger Email](https://firebase.google.com/docs/extensions/official/firestore-send-email)
