# Group attendee details fix

The participant picker previously received a roster without booking.id and submitted a null/undefined ID when opening a participant profile. The backend now returns the real booking document ID. The frontend also retains the ID from the original Bookings row, so it works with older roster responses. Authorization and participant-membership checks remain enforced.

Replace your existing functions/scheduler.cjs with existing-functions/scheduler.cjs from this package. Keep your other functions and existing environment settings.

```bash
firebase deploy --only functions:schedulerAttendeeDetails --project usmlesarthi-residency-match
```

Update frontend source, preserve .env and your Firebase Hosting configuration, then:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Reload the page and reopen the attendee dialog after deployment. The second request should contain the booking ID, such as {id:"meeting_assigned",participantUid:"student-uid"}.

Validation: 45 backend tests and 21 frontend tests passed, including an older roster response with no ID. Production build passed. Production Firebase deployment has not been run here.
