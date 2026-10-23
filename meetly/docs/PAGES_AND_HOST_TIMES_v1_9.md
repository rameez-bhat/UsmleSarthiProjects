# v1.9.1 correction

The organizer is automatically included with selected team hosts. In the host-time editor, the organizer is labeled by name with (Organizer). Publish their times to make them bookable; organizer times are optional. Selected additional hosts still need at least one time each. Automatic round-robin also includes the organizer. Existing events are not migrated until saved; assigned bookings keep their existing edit restrictions. For this correction, deploy schedulerSaveEvent and Hosting.

# Meetly v1.9.0

## Faster navigation and explicit refresh

The dashboard no longer polls every 15 seconds. Invitation and registration pages no longer poll every 10 seconds. Moving between private dashboard routes reuses the loaded workspace instead of fetching it again. Mutations still refresh affected data; dashboard, invitation and registration refresh buttons are explicit. Email reminders remain scheduled on the backend; they are independent of browser refreshes.

Pages are separate modules in src/pages and load on demand. The initial application code chunk fell from about 90 kB to about 36 kB before gzip in local builds; Firebase and React remain separate shared bundles. This is a bundle-size comparison, not a claim about live network timings. Concurrent identical read calls share a single in-flight request; results are not retained as a stale cache. Server authorization still applies on each call.

Every scheduler API request shows a blocking screen overlay until all active calls finish. Lazy page downloads have their own loading fallback. Search debounce, toast dismissal and network timeout timers remain; none poll the database.

## Page files

| URL                                  | File                             |
| ------------------------------------ | -------------------------------- |
| / and /event-types                   | src/pages/EventTypesPage.jsx     |
| /bookings                            | src/pages/BookingsPage.jsx       |
| /my-meetings                         | src/pages/MyMeetingsPage.jsx     |
| /availability                        | src/pages/AvailabilityPage.jsx   |
| /hosts                               | src/pages/HostsPage.jsx          |
| /integrations                        | src/pages/IntegrationsPage.jsx   |
| /administration                      | src/pages/AdministrationPage.jsx |
| /settings                            | src/pages/SettingsPage.jsx       |
| /book/:slug and /book/:slug/:eventId | src/pages/BookingPage.jsx        |
| /manage/:bookingId                   | src/pages/ManageBookingPage.jsx  |
| /registration/:registrationId        | src/pages/PublicRegistration.jsx |
| /room/:bookingId                     | src/pages/MeetlyRoom.jsx         |

The application/authentication shell remains in src/main.jsx. Reusable forms, rosters, user search, invitation details and email controls live in src/components. Shared formatting and constants live in src/shared/utils.js. Update these source files and rebuild; dist contains generated deployment output.

## Host-specific team booking

1. Open Event types > New event type.
2. Choose **Round-robin team — let visitors choose a host and time** under Meeting schedule.
3. Search/select eligible hosts. Each must have a completed Meetly profile.
4. Add one or more exact dates and start times for every selected host. Set the time zone on each row explicitly. Duration and buffer settings apply to every time. There are at most 20 hosts and 100 times per event.
5. Choose Anyone or Registered users only, location and email settings, then save and share the event booking link.

Visitors choose a published time showing the host's name. The confirmation form explicitly says **You are booking with [host name]** and the button names that host. Changing display zone changes only display; the booking instant stays the same. Same-time slots for different hosts remain separate choices.

This mode reserves one attendee appointment with the selected host per slot, rather than a capacity-limited shared class. It uses exact published times, even outside weekly hours. It still enforces busy calendar events, existing booking buffers, booking horizon, notice and daily limits. The booking endpoint verifies host membership, exact start time and current availability on the server and uses that host's existing transactional locks to prevent competing reservations. The server resolves host name/email and calendar identity; it does not trust labels supplied by the browser. Calendar/provider failures never make a host appear free. A disabled/unavailable host is omitted when other hosts remain available.

Existing automatic round-robin assignment for a specific dated invitation remains available. That mode assigns one available host automatically. The new visitor-choice mode displays who will host before confirmation. Existing meetings are not migrated; create or edit a nonassigned event to publish host-specific times. Saved assigned invitation meetings retain their existing edit restrictions. Switching a new draft to visitor-choice clears draft invitees because that mode uses individual self-bookings. Changing published times does not alter appointments already booked. To change the host of an existing appointment, cancel and book again.

Confirmed attendees and the assigned host/organizing admin use the existing email policies and (default)/mail service. Scheduler records still use calendly. No new collections, indexes, credentials or outgoing mail service are introduced.

## Deploy

Preserve existing environment values, secrets, Hosting target mappings and unrelated backend functions. Replace existing-functions/scheduler.cjs in your existing functions folder; keep Object.assign(exports, require("./scheduler.cjs")) in its index.

```sh
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match
```

In the frontend project:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Test with two hosts in different time zones, two hosts sharing a start instant, a busy external event, registered-only access, two simultaneous bookings for the last host slot, and confirmation emails. Unit/UI tests do not replace verification against your live calendar and email services.
