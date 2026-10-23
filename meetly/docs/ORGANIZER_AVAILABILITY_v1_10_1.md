# Organizer availability — v1.10.1

The organizer should not disappear from the team list when another host has available times.

This patch:

- Derives host/day groups from the saved UTC instant and the host's current profile timezone. Previously the availability list used a stored hostDate, while the booking endpoint used the current profile timezone. A profile timezone change could cause the list to omit a valid time.
- Treats the event owner as an eligible team member even for a legacy saved teamHostUids list that omitted the organizer. Other hosts must still be selected team members with valid host access.
- Shows all eligible team hosts on the booking page, including the organizer, with available times or a generic unavailable message. It does not offer busy times or invent times that were never published.
- Adds **Check host availability reasons** on the booking page when the signed-in account is the event organizer. It shows each published instant and a controlled reason: available, past, notice, horizon, daily limit, booking/buffer conflict, connected-calendar busy, configuration/access or availability lookup failure. No calendar titles, other attendees' details, tokens or raw provider error responses are returned.

Open the event's public booking link while signed in as its organizer, then click **Check host availability reasons**. Diagnostics are fetched only when clicked; there is no polling. The server enforces organizer authorization. Other visitors see only generic host availability.

The live cause of any particular missing slot is not established by the symptom alone. The timezone grouping and legacy membership paths are fixed and tested; busy-calendar or configured-policy exclusions remain enforced. If an organizer's time is still unavailable, share that organizer diagnostic row (host, displayed time, reason), not OAuth tokens or other users' calendar contents. Generic lookup failures are recorded in schedulerSlots logs with event ID, host UID and an error code only.

Replace existing-functions/scheduler.cjs in the existing backend. Keep unrelated function exports, secrets and environment settings unchanged. Deploy from the existing backend root:

```sh
firebase deploy --only functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match
```

Then deploy the frontend:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No database migration, new index, new secret or change to default Users/UsersRoles/mail is required. Past saved times remain past; no unrequested appointments are created. Runtime Google/Zoom connection testing remains necessary in the deployed project.
