# v1.5 — Direct dated booking and attendee details

## Booking experience

A link to a dated meeting now shows its existing date/time, time zone, duration and booking form. It checks availability and automatically selects the one allowed instant. There is no calendar or time-slot picker. Registered-only links retain the sign-in gate. If the meeting is already booked, has expired, or is blocked by a calendar conflict, it shows unavailable instead of accepting a reservation. Server checks remain authoritative.

Changing the display time zone changes only the presentation, not the reserved instant. Recurring event links still show a calendar and time-slot selector.

## Attendee details

Open `/bookings` and click **View attendee details**. The read-only dialog shows the attendee's name/email, meeting/host, date/time/status, attendee time zone, notes and booking answers. New bookings retain original question labels.

When a verified registered UID is linked, it also shows the full permitted current profile from `(default)/Users` and account record from `(default)/UsersRoles`, including available contact details, medical school, graduation date, scores, attempts and other existing fields. Timestamps are represented as ISO dates with UTC offsets. Credentials, secret keys and tokens are excluded recursively. Default-database records are never modified.

Guest bookings show the information actually submitted. The system never searches private profiles using an unverified typed email. New public bookings can link a signed-in account only when the authenticated email is verified and matches the booking email. Existing v1.4 registered-only reservations retain their trusted UID link. Older bookings without a trustworthy identity association show booking details but cannot automatically display a registered profile. Duplicate or missing identity records fail closed.

Mentor and Journalist can view details only for bookings on their own links. Admin, CustomerSupport and SuperAdmin retain administrator-wide access through the Administration view. Every detail request rechecks the current role and booking ownership on the server. Private management links do not grant profile access.

## Update

1. Update the frontend from this package, preserving your Firebase configuration and .env. `src/main.jsx` and styles are complete, beautified files. Run `npm install --include=dev` then `npm start`, or rebuild and deploy the scheduler Hosting site.
2. Copy `existing-functions/scheduler.cjs` into your existing backend functions folder beside index.js. Keep your single Firebase Admin initialization and unrelated functions. Retain the add-on registration at the very bottom:

```js
Object.assign(exports, require("./scheduler.cjs"));
```

3. Preserve the existing working environment values before deploying. Console-only changes can be overwritten by CLI deployments: put APP_ORIGIN, provider client IDs and OAUTH_REDIRECT_URI in your backend `.env.usmlesarthi-residency-match`, and retain your existing Secret Manager credentials and encryption key.
4. From the existing backend project root deploy:

```bash
firebase deploy --only functions:schedulerAttendeeDetails,functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match
```

If v1.4 backend changes have not yet been deployed, also deploy schedulerSaveEvent, schedulerPublicPage, schedulerPublicEvent and schedulerSlots using that release's instructions.

There are now 20 scheduler exports in the addon. The new schedulerAttendeeDetails endpoint does not require OAuth secrets; booking/rescheduling still require the existing encryption/provider credentials. No new composite indexes are required. The existing three-index manifest remains included.

## Validation

41 automated tests pass: 32 backend and 9 frontend. Coverage includes own-host and administrator access, unrelated-host rejection, trusted UID linkage, credential redaction, timestamp serialization, original booking answers, guest email isolation, direct dated form with no calendar, unavailable dated meetings, registered sign-in gating, existing recurrence and booking flows. Production build and module checks pass. The CommonJS addon retains shared Admin initialization. Live Firebase/OAuth and physical-device testing remain necessary.
