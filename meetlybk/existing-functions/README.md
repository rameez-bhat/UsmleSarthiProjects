# v1.11.0 update

Deploy schedulerSaveEvent and schedulerSlots for multiple published times and monthly calendar availability. See ../docs/CALENDAR_BOOKING_v1_11.md. Preserve working backend environment values and unrelated exports.

# v1.10.0 update — 32 scheduler exports

See ../docs/ZOOM_AND_EVENT_LIFECYCLE_v1_10.md for personal Zoom OAuth credentials, targeted deployment batches and event deletion behavior. Preserve your existing function exports, environment values and encryption key.

# v1.9.0 update

For separate frontend pages and host-specific team booking, see ../docs/PAGES_AND_HOST_TIMES_v1_9.md. Replace scheduler.cjs while retaining unrelated existing function exports and environment settings. Targeted backend changes: schedulerSaveEvent, schedulerSlots, schedulerBook, schedulerReschedule.

# v1.8.0 update

The included scheduler.cjs contains 31 scheduler exports, including schedulerSaveNotifications, schedulerMeetingEmails and schedulerDispatchMail. Notifications use your existing default/mail service. See ../docs/MEETING_EMAILS_v1_8.md.

# v1.7.4 update

The complete scheduler.cjs includes 27 scheduler exports, with schedulerJoinMeeting and schedulerRegistration for public group registration. See ../docs/PUBLIC_SHARED_MEETINGS_v1_7_4.md for deployment.

# v1.7.0 update

The included scheduler.cjs now includes invitation responses, team host selection and room access (25 scheduler exports). See ../docs/INVITATIONS_ROUND_ROBIN_VIDEO_v1_7.md for deployment and optional Zoom/Jitsi credentials. This supersedes the v1.6 instructions below.

# v1.6.0 update

Use the included updated scheduler.cjs (22 scheduler exports). See ../docs/ASSIGNED_MEETINGS_v1_6.md for the targeted deploy command and setup.

# v1.5 update

See **../docs/UPDATE_v1_5.md** for direct dated booking and attendee details. This add-on now exports 20 scheduler functions. Include `functions:schedulerAttendeeDetails` when performing a full scheduler deployment. The new endpoint is restricted to authorized hosts/admins and does not require OAuth secrets.

# Existing Firebase backend — scheduler add-on v1.4

For the dated meeting and registered-only booking update, read **../docs/DATED_MEETINGS_v1_4.md** first. It includes usage, deployment commands, environment preservation, index configuration and validation.

## Install beside your existing functions

1. Copy this folder's `scheduler.cjs` into your existing Firebase `functions/` folder beside `index.js`.
2. Keep your existing CommonJS configuration, Firebase Admin initialization and unrelated functions.
3. If missing, install Luxon in that existing functions folder: `npm install luxon@^3.6`.
4. At the very bottom of your existing index.js, add or retain:

```js
Object.assign(exports, require("./scheduler.cjs"));
```

This registers all 19 scheduler functions and supersedes any earlier scheduler declarations above it. Do not put older scheduler exports below this line.

## Required backend configuration

Preserve your working settings in the existing backend environment file before CLI deployments. Values edited only in Cloud Console may be replaced by a later deployment. For this project the file is `functions/.env.usmlesarthi-residency-match`.

Non-secret values: `FUNCTIONS_REGION`, `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID` when configured, `OAUTH_REDIRECT_URI`, `ENFORCE_APP_CHECK`.

Secrets remain in Secret Manager: `OAUTH_TOKEN_KEY`, plus `GOOGLE_CLIENT_SECRET` when a Google client ID is configured and `MICROSOFT_CLIENT_SECRET` when a Microsoft client ID is configured. Keep the encryption key unchanged after connections or bookings exist. Each client ID must match its corresponding secret.

APP_ORIGIN is the scheduler's browser origin (local origin during testing or its deployed HTTPS origin). OAUTH_REDIRECT_URI is:

```text
https://asia-south1-usmlesarthi-residency-match.cloudfunctions.net/schedulerOAuthCallback
```

Register that exact callback with the providers you use. Profile, availability, event editing and basic reporting do not need provider secrets. Slot lookup needs no secrets when neither provider is configured and no calendars are connected. Booking requires the encryption key; connected calendar operations require the configured providers' secrets. External conflict checks fail closed if a connected provider cannot be read.

The complete source is in ../functions/*.js. scheduler.cjs is a beautified CommonJS bundle for compatibility with your existing backend.

## Full scheduler deployment

After all configured provider secrets and settings are available, run from your existing Firebase project root:

```bash
firebase deploy --only functions:schedulerAccess,functions:schedulerWorkspace,functions:schedulerAdminBookings,functions:schedulerSaveProfile,functions:schedulerSaveAvailability,functions:schedulerSaveEvent,functions:schedulerPublicPage,functions:schedulerPublicEvent,functions:schedulerSlots,functions:schedulerGetBooking,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerCancel,functions:schedulerConnect,functions:schedulerOAuthCallback,functions:schedulerDisconnect,functions:schedulerSyncBooking,functions:schedulerRetrySync,functions:schedulerReminders --project usmlesarthi-residency-match
```

This command selects scheduler functions only. For this release's six changed booking functions, use the smaller deployment command in docs/DATED_MEETINGS_v1_4.md.

Email still needs the Trigger Email extension configured for scheduler_mail in calendly. The public booking site must be hosted for external sharing; a 192.168.* address works only on your local network.

## Scope and validation

This is the independent-host scheduling foundation, including fixed meetings, per-event registration requirements, role checks and read-only administrator booking views. It is not the complete original multi-phase business specification: group seats, S3 sync, round robin, payments and attendance remain future work.

33 tests pass and the production build completes. No live cloud deployment, OAuth provider consent or physical-device verification was performed here.
