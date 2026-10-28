# v1.7 — Invitations, round robin and video meeting options

This update replaces the v1.6 automatic participant confirmation. Newly selected users are invited, not confirmed. They sign in at `/my-meetings` and choose Accept or Decline. The host keeps one scheduled reservation; each participant has an independent response. Only accepted users see the joining link and receive calendar attendee invitations/confirmation notices. Responses record authenticated UID and UTC timestamp in scheduler_audit. Repeat submissions of the same response are idempotent. Changes after responding require contacting the host; no automatic reversal or host release when everyone declines.

Older assigned bookings with no participant response are displayed as invited and must be accepted. Already-sent v1.6 emails/calendar invitations cannot be recalled automatically by this update; synchronize the booking after users respond to update its roster. Existing ordinary public bookings remain confirmed bookings.

## Creating meetings

1. Open **New dated meeting**. Select registered users from Users.
2. Choose **Host this meeting myself**, or **Round robin** and select a team (up to 20 authorized hosts who have completed their profiles).
3. Choose date/time and video method; save.
4. The organizer and assigned host both see the meeting in Bookings, including confirmed, pending and declined totals. **View attendee details** lists each person's response and profile. Selected invitees see their individual invitation in My meetings.

Round robin currently covers dated invitation meetings, not recurring pooled public booking pages. It assigns one available host for the entire meeting, not one host per invitee. It checks weekly availability, connected-calendar busy periods, local reservations and daily limits, then chooses the available host with the lowest assignment count (UID breaks ties). Counts are shared by the same sorted team membership. Local reservations and team counters are rechecked in one calendly Firestore transaction using host-day locks. External calendar APIs are checked before that transaction and cannot participate atomically with Firestore. A failed provider check fails the request rather than assuming the host is free. Hosts need to configure weekly hours for the chosen time. Canceling does not rewind rotation history.

## Google Meet

Select **Google Meet** and either:

- Paste the participant link, such as `https://meet.google.com/abc-defg-hij`. The API does not generate or replace this link. A connected Google calendar is not required just to use a pasted link.
- Leave the field blank to generate a link using the assigned host's connected Google calendar.

Joining links are omitted from public event responses and pending invitees' dashboard data. Invitation emails contain the response dashboard link; accepted attendees receive joining instructions after successful synchronization. Manual phone/address/custom links follow the same invitation visibility rule. Mail delivery requires EMAIL_ENABLED=true and the existing email extension configured for calendly/scheduler_mail.

## Zoom API or pasted link

Select **Zoom**. Paste an existing Zoom participant join link, or leave it blank for API creation.

Automatic creation uses your organization's **Zoom Server-to-Server OAuth app**, not individual host Zoom OAuth. Create/activate this app in Zoom App Marketplace and grant Create meeting and Delete meeting permissions for account users (the current corresponding granular meeting scopes, or meeting:write:admin if offered). Each assigned host's Meetly profile email must match a meeting-capable Zoom user in that Zoom account. Zoom account limits still apply.

Add to the existing Functions `.env.usmlesarthi-residency-match`:

```dotenv
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
```

Store the secret from the Zoom app on the server:

```bash
firebase functions:secrets:set ZOOM_CLIENT_SECRET --project usmlesarthi-residency-match
```

Do not put this secret into frontend/VITE variables. Redeploy the functions after configuring the account. Only the participant join URL is stored/shared, never Zoom's privileged start_url. Cancellation deletes API-created Zoom meetings; pasted meetings remain under the external host's control.

Creation has a Firestore ledger. A known completed create is reused. If the request times out or the outcome is ambiguous, the code stops rather than creating another meeting on retry. An administrator must inspect Zoom and `scheduler_zoom/{bookingId}_{revision}`: after verifying the outcome, either record the existing meetingId/joinUrl and status created, or mark failed only after confirming no meeting was created, then retry synchronization. This prevents automatic duplicate creation but intentionally requires manual reconciliation for uncertain outcomes.

Official references: https://developers.zoom.us/docs/internal-apps/s2s-oauth/ and https://developers.zoom.us/docs/api/meetings/.

## Meetly video room

The app includes a responsive `/room/{bookingId}` page with in-app Jitsi video. Firebase Hosting serves the page and Firestore stores schedules; video media requires a separate Jitsi deployment/provider. This package does not deploy a video server.

Configure the Functions environment:

```dotenv
JITSI_SERVER_URL=https://video.your-domain.example
```

Use an HTTPS origin without path/query. For a self-hosted Jitsi server with token authentication, also configure:

```dotenv
JITSI_JWT_APP_ID=your_jitsi_application_id
```

```bash
firebase functions:secrets:set JITSI_JWT_SECRET --project usmlesarthi-residency-match
```

Configure the same issuer/signing secret on Jitsi; the server must accept HS256 tokens with aud=jitsi, your video hostname as sub, and room-scoped tokens. Tokens expire in two hours; host/organizer claims indicate moderator. Configure the provider's own lobby and authentication. Without token authentication, Meetly gates access to the room page, but the underlying video URL is a bearer link and can be shared outside the app. A third-party hosted Jitsi service may impose its own login, terms or embed restrictions.

Only the host, organizer, accepted invitees, or the authenticated attendee of a normal registered booking can request a room URL. Canceled meetings are denied. Meetly rooms therefore require registered attendees for public booking. Unregistered public guests should use Google Meet, Zoom or a custom link.

The Hosting Permissions-Policy must allow camera and microphone for the embedded video provider. The included template uses camera=*, microphone=*, geolocation=(); iframe permissions and browser consent still apply. If preserving an older firebase.json, change its existing camera=()/microphone=() policy, or explicitly allow your video origin, before deployment.

Official Jitsi integration reference: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/.

## Deployment into your existing Functions project

Replace only the scheduler add-on (`existing-functions/scheduler.cjs`); preserve your other exports. Keep this as the last line of your index.js:

```js
Object.assign(exports, require("./scheduler.cjs"));
```

Preserve your working OAuth environment and existing OAUTH_TOKEN_KEY. Include optional Zoom/Jitsi environment values only when enabling those services; create their matching secrets before deploying. Do not regenerate existing encryption keys.

Deploy these new or changed scheduler functions from your existing Firebase project directory:

```bash
firebase deploy --only functions:schedulerWorkspace,functions:schedulerAdminBookings,functions:schedulerAttendeeDetails,functions:schedulerSearchHosts,functions:schedulerMyMeetings,functions:schedulerRespondInvitation,functions:schedulerRoom,functions:schedulerSaveEvent,functions:schedulerPublicPage,functions:schedulerPublicEvent,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerGetBooking,functions:schedulerCancel,functions:schedulerSyncBooking,functions:schedulerRetrySync,functions:schedulerReminders --project usmlesarthi-residency-match
```

The existing schedulerSearchUsers endpoint remains required. The full add-on includes it. No new composite indexes are needed; new queries use automatic single-field indexes. Keep your default Users/UsersRoles database and existing named calendly database.

Update the frontend source and rebuild, preserving your .env and Hosting target mapping:

```bash
npm install
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Make the Permissions-Policy change above in your actual Hosting config if enabling video. The supplied template still uses the generic target scheduler; preserve your configured usmlesarthischeduling target.

## Validation before production use

Local automated tests cover acceptance/decline permissions, joining-link visibility, duplicate responses, room authorization, JWT room scope, rotation fairness, Zoom creation ledger and UI controls. They do not establish live production Firestore concurrency, Zoom account permissions, calendar provider behavior, email delivery or mobile video compatibility. Test with sample host/student accounts after deployment, including simultaneous invitation responses, busy team hosts, cancellation, and video camera/microphone permissions.
