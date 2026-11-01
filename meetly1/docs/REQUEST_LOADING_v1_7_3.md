# API request loading

A shared tracker wraps the frontend api() helper. All scheduler callable requests show a top progress bar plus a mobile-friendly status card explaining the current action. It works on dashboard, login-adjacent public booking, invitation, attendee detail and room pages, including modal dialogs. Concurrent requests keep the indicator visible until all finish. Failure clears the indicator while existing error messages remain intact. Requests during automatic dashboard refresh also display the indicator.

The indicator is nonblocking and uses an accessible polite status announcement; reduced-motion preferences are respected. Existing local form spinners/disabled states remain in place. Meeting save and cancellation buttons also show action text while working. Firebase Authentication uses the existing authentication form's loading state; this tracker covers all calls through the scheduler api() helper, not arbitrary third-party iframe traffic.

## Deploy

Update frontend source, preserving your .env, firebase.json and Hosting target mappings, then:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No Functions deployment is needed for this frontend-only update. If upgrading from before v1.7.2, apply its attendee-details backend fix as well.
