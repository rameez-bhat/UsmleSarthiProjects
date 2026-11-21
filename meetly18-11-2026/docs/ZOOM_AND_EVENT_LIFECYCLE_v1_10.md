# Personal Zoom, event deletion and calendar visibility — v1.10.0

## Why there was no Connect Zoom option

The prior Zoom integration used one organizational Server-to-Server OAuth app. It could create meetings for eligible users in that Zoom account, addressed by the assigned host's email. That mechanism does not let arbitrary hosts authorize their separate Zoom accounts.

Integrations now has a **Connect Zoom** button. Each signed-in host authorizes their own Zoom account using a separate user OAuth app. Zoom tokens are encrypted in calendly/scheduler_private under that host's UID. Google/Outlook credentials remain separate. Zoom supplies meeting links; it is not treated as a free/busy calendar. Connected Google/Outlook calendars continue to supply busy checks and appointment creation.

A connected personal Zoom account takes priority for new Zoom meetings. If none is connected, the existing organizational S2S path is retained. An expired/broken personal connection fails visibly rather than silently scheduling under a different Zoom account. Old S2S meetings keep their original cleanup path; personal meetings use the original host's Zoom connection. Do not switch to a different Zoom identity while that host has outstanding personal Zoom meetings. Disconnecting is blocked while upcoming synced meetings depend on the connection.

### Configure personal Zoom OAuth once

Create a Zoom Marketplace OAuth application supporting user authorization (General App/user-managed OAuth), separate from the working Server-to-Server app. Configure:

- Redirect URL: https://asia-south1-usmlesarthi-residency-match.cloudfunctions.net/schedulerOAuthCallback
- User-level granular scopes: meeting:write:meeting and meeting:delete:meeting.
- Appropriate test-user access or app distribution for the accounts that will connect. External accounts may require distribution/review; the code cannot bypass Zoom's app authorization policy. Complete any Zoom-required deauthorization/data handling requirements before public distribution.

Put the OAuth app's public client ID in the existing backend functions/.env.usmlesarthi-residency-match:

```env
ZOOM_OAUTH_CLIENT_ID=YOUR_USER_OAUTH_APP_CLIENT_ID
```

Store its client secret separately:

```sh
firebase functions:secrets:set ZOOM_OAUTH_CLIENT_SECRET --project usmlesarthi-residency-match
```

Keep existing GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, APP_ORIGIN, OAUTH_REDIRECT_URI and all working secret values. Do not replace the existing ZOOM_CLIENT_SECRET with the new user OAuth secret. Keep OAUTH_TOKEN_KEY unchanged. Client IDs must be present during CLI deployment so the corresponding secret bindings are included; values set only through Cloud Console may not be visible during local source analysis.

Each host then signs in > Integrations > Connect Zoom. New meetings are created through Zoom's users/me endpoint using that host's authorized token. No host start URL is exposed to attendees. Refresh-token rotation uses a per-host refresh lease to avoid competing refresh attempts.

Official references:

- https://developers.zoom.us/docs/integrations/oauth/
- https://developers.zoom.us/docs/integrations/oauth-scopes-granular/

## Event saved versus calendar appointment created

An event type/booking link is a set of available meetings, not an appointment. Saving a recurring event, a fixed public link without assigned attendees, or host-specific time options does not reserve every possible time on the host's calendar. A calendar appointment is queued when someone books. A dated invitation meeting with assigned attendees queues its shared calendar appointment immediately.

The UI now explains this after saving and on event cards. Bookings shows pending/error status, retry controls and whether a Google/Outlook event ID is linked. The calendar used is the assigned host's connected account's primary calendar, not necessarily the organizer's calendar or the email used to sign in to Meetly. A synced label represents the last successful API sync, not ongoing verification that an externally edited/deleted calendar event still exists. No polling is added.

If a confirmed booking is missing in the host's connected calendar, inspect its Bookings sync status and use Retry calendar sync after correcting credentials. The reported symptom alone does not establish whether it is an unbooked event link, a different assigned host, provider failure or wrong Google account.

```sh
firebase functions:log --only schedulerSyncBooking --project usmlesarthi-residency-match
```

## Deleting an event link

Event types now includes Delete event with a custom confirmation popup. Only its organizer may delete it. Deletion disables/removes the booking link from the dashboard while retaining history and an audit entry. It is blocked while upcoming confirmed bookings exist or cancellation synchronization is pending/failed. Cancel upcoming bookings and complete provider cleanup first. Existing guests cannot reserve a new appointment through the deleted link. No new indexes are needed.

Deleting a booking link is not permission to erase past attendance, emails or audit records. Future calendar appointments are removed through the booking cancellation workflow. Auto-created Zoom meetings are deleted through that workflow; manually pasted external Zoom links are not managed or deleted by Meetly.

## Changing Zoom to Google Meet

Editing an event link changes defaults for future bookings. It does not replace existing appointments, delete their Zoom meetings or send attendees a new joining link. The editor now displays that explicitly. For an existing booked appointment, cancel it, wait for cancellation sync to complete, update the event link and book the replacement. Saved assigned invitation meetings still require cancellation/recreation to change their configuration. Meetly does not claim a Zoom link was destroyed merely because an event type was edited.

## Deploy

Replace scheduler.cjs with existing-functions/scheduler.cjs in your existing backend, preserving unrelated function exports and the working environment. From that backend project's root, deploy these changed functions in batches:

```sh
firebase deploy --only functions:schedulerDeleteEvent,functions:schedulerWorkspace,functions:schedulerConnect,functions:schedulerOAuthCallback,functions:schedulerDisconnect --project usmlesarthi-residency-match
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerSyncBooking --project usmlesarthi-residency-match
```

Deploy the frontend from its folder:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Validate with a second host's own Google/Zoom accounts, an actual confirmed booking, cancellation of both provider records, deletion with/without upcoming bookings, and an event-type location edit. Local mocked API tests do not verify your live Zoom app approval, credentials, calendar account choice or external delivery.
