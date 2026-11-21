# Open a user's dashboard without their password

In Administration, search by name or email, select the account, and click
**Open dashboard as this user**. Allow popups for SAMAY. The user's dashboard
opens in a separate tab with a yellow managed-account banner. Your original
administrator tab stays signed in. Use **Exit managed account** when finished.

This is a real Firebase custom-token session for the selected account, using a
separate Firebase app and session-only persistence. It does not change the user's
password or role. Host accounts can create events on their own behalf, change
availability and settings, and use their own connected calendars. Students retain
student permissions; opening their account does not promote them to hosts.

Only Admin, CustomerSupport and SuperAdmin can issue these sessions. The function
rechecks the current default-database UsersRoles entry. Nested managed logins and
disabled target accounts are rejected. Issuance is recorded in scheduler_audit
before token creation; subsequent callable requests record the real administrator,
target UID and session ID. Direct frontend Firestore writes continue under the
target UID and are not automatically logged by that callable audit wrapper.

Deploy both parts:

1. Copy `existing-functions/scheduler.cjs` into your existing functions directory
   as `scheduler.cjs`, keeping your current exports and other functions.
2. Keep `Object.assign(exports, require("./scheduler.cjs"));` in your entry point.
3. Run `firebase deploy --only functions:schedulerAdminLogin --project usmlesarthi-residency-match`.
4. Build with `npm run build`, then deploy your existing scheduler Hosting target:
   `firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match`.

If custom token creation reports a signing permission error, grant the runtime
service account Service Account Token Creator on that service account itself:
`461306056844-compute@developer.gserviceaccount.com`. Do not grant this role to
ordinary users. No new Google or Zoom secret is required.

Because Firebase Authentication is shared by your sites, this token is a genuine
target-user credential for this project. Its extra claims identify the acting
administrator (`samayAdminActor`) and audit session (`samayAdminSession`). Review
your own Firestore rules accordingly. Closing the tab removes session persistence;
the explicit Exit button also signs out. This is not an expiring delegation or a
complete audit of every direct database write.
