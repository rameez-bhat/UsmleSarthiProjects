# Public registration for a shared dated meeting

Selecting invitees no longer makes an Anyone-with-the-link meeting invitation-only. The audience setting controls access:

- **Anyone with the link:** other visitors can enter their name/email and confirm a registration without creating an account. Pre-invited users can sign in and accept or decline directly on the same link.
- **Registered users only:** sign-in with a verified account and one default Users record is required for registration. Users do not need to have been pre-selected.

Everyone joins the same scheduled meeting, at the host's selected date/time, using the same Zoom/Google Meet link. Public registration adds an accepted participant to the existing host reservation. It does not create a second host appointment, assign another round-robin host, or create a separate Zoom meeting for each user.

Existing public dated links without pre-invitees retain their existing one-reservation behavior. This update specifically fixes shared dated meetings that already have invited attendees, such as the reported Zoom link. New shared meetings still require pre-invitees to establish their shared reservation.

## Experience

The specific meeting link shows its fixed date/time and a Confirm booking form for public visitors. Invited signed-in users instead see their own invitation with Accept/Decline controls. After confirmation, the joining link appears when synchronization is ready. An organizer opening their link sees an Open Bookings button. Host Bookings now includes a Join meeting link when available.

Public registrants receive a private confirmation/cancellation page at `/registration/{id}?token=...`. The page exposes only their own registration and joining instructions. Save this private link; email delivery requires the existing EMAIL_ENABLED/mail-extension configuration. Refresh polls pending joining instructions. Cancellation applies the meeting's cancellation cutoff and changes only that attendee's status, keeping other attendees intact. Registered users whose verified account email matches the submitted email also see the meeting in My meetings. Unauthenticated guest registrations are not retrospectively linked to an account by email alone.

Using an invited user's email without signing in cannot claim their invitation or attach their private profile. The visitor is asked to sign in to accept it or use their existing confirmation link. Hosts can inspect public registration answers/notes without giving guests access to existing user profiles.

## Capacity and server checks

New dated-meeting forms include Meeting capacity (default 100, maximum 1,000). Invited and accepted attendees reserve capacity; declined/canceled attendees no longer occupy a seat. Old meetings without this field default to 100. Existing assigned meetings remain immutable: cancel and recreate to change settings or capacity. A technical maximum of 1,000 retained participant records per meeting also applies; canceled registrations retain their audit history.

Registration checks the active event, current booking status, exact fixed start and minimum-notice cutoff on the server. Capacity and participant updates run in a Firestore transaction, so concurrent submissions cannot both take the last seat. Request IDs preserve retry idempotency, and private cancellation tokens are encrypted/hashed on the server. This does not extend the old group design into full recurring class scheduling or add a waitlist.

Meetly/Jitsi rooms still require registered verified users for authenticated room access. Use Zoom, Google Meet or another link for anonymous guest meetings.

## Deployment

Replace your existing scheduler.cjs with `existing-functions/scheduler.cjs` from this package. Preserve unrelated functions, existing backend environment values and secrets, including the current OAUTH_TOKEN_KEY.

```bash
firebase deploy --only functions:schedulerJoinMeeting,functions:schedulerRegistration,functions:schedulerSaveEvent,functions:schedulerAttendeeDetails,functions:schedulerSyncBooking --project usmlesarthi-residency-match
```

schedulerJoinMeeting uses the existing encryption key binding. It does not need an additional OAuth client or a new secret. Existing Zoom credentials and calendar settings must remain present on the synchronization function. The other previously deployed v1.7 scheduler endpoints remain required.

Update frontend source, preserve your .env, firebase.json and target mapping, then:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new composite indexes or changes to default Users/UsersRoles are required. New registrations, audit and synchronization jobs stay in calendly. Deploy both new endpoints and the frontend before testing the reported link; its Anyone setting does not require re-creating the existing meeting.

## Verification

Automated checks cover public guest registration UI, invited-user acceptance directly on the shared link, registration isolation, full/closed meeting rejection, email identity protection and cancellation projection. Live production email delivery, provider roster synchronization and concurrent Firestore submissions still need sample-account testing after deployment.
