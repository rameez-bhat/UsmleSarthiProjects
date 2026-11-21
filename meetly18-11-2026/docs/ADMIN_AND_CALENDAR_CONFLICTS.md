# Admin account management and save-time calendar conflicts

Administration now includes a searchable account-management view. The administrator remains signed in as themselves. It reads the selected default Users record, scheduler host profile, owned event types, and hosted/organized/attendee/invited bookings directly from Firestore. A host's name, bio, time zone, weekly schedule and date overrides can be edited as JSON. Saves validate availability and write an audit entry including actor UID, target UID and before/after fields. Existing profile and event pages remain unchanged.

This is a scoped account-management view, not full authentication impersonation. It does not provide every target dashboard action, edit identity roles/passwords, or connect another person's external account. Users without scheduler host profiles have profile/booking inspection only. Your Firestore rules must enforce administrator-only access and writes; browser checks are not an authorization boundary.

For host-specific published times, schedulerSaveEvent checks each participating host with published choices against connected external calendars and confirmed SAMAY booking intervals, including buffers. Hosts without connected calendars produce no external busy intervals; local booking checks still apply. A failed calendar check fails the save rather than treating the host as free. The entire event save is rejected if any selected time conflicts.

The editor lists conflicting host names and times, displayed in the organizer's profile time zone. The organizer can edit the times or explicitly remove all published times belonging to the named conflicting hosts. Save must be clicked again; availability is rechecked on that request. If every host's times conflict, a different time/host must be selected. The organizer still owns the event even when their published appointment times are removed.

Single fixed links without invitees also check the organizer's connected calendar when saved. Existing automatic round-robin assigned invitations retain their existing availability/assignment behavior; they do not yet offer the new per-host exclusion prompt for partial conflicts.

Saving self-booking choices publishes availability; it does not reserve every choice or create Google/Zoom appointments for every published slot. Actual attendee bookings still reserve time and queue provider synchronization through the existing booking flow. No preflight check can prevent a calendar event added externally immediately afterward; booking-time checks remain in place.

## Deploy

Copy existing-functions/scheduler.cjs into the existing backend, preserve unrelated exports and current OAuth environment, then:

```sh
firebase deploy --only functions:schedulerSaveEvent --project usmlesarthi-residency-match
```

Rebuild and deploy the frontend using your existing Hosting target:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new secrets. Booking owner/date queries use the existing index. The broader frontend-only migration remains incomplete.

Validation: existing backend/frontend suites passed, a new targeted UI test verifies named conflict display and explicit removal retaining other hosts, and production build passed. Live provider access, production rules, full admin integration and cross-system races were not exercised.
