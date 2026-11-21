# Independent date-and-time entries — v1.11.2

This replaces the bulk date and time lists introduced in v1.11.0 and v1.11.1.

Every appointment is now one row with:

- Host
- One combined date-and-time picker
- Time zone

Click **Add another date and time** to add another independent appointment. For example, 25 October at 10:00 and 27 October at 14:30 create exactly two choices. They do not create 25 October at 14:30 or 27 October at 10:00.

Every meeting schedule category supports these entries through multiple-date mode, enabled by default for new links. Each row is saved directly with the event. There is no separate bulk publish step. Each entry retains its own host and time zone; a new row initially selects the previous row's host and time zone.

Existing explicit slots remain editable. Earlier bulk-generated slots are retained to avoid silently removing published times. Review existing rows and remove unwanted combinations before saving. Already booked appointments are unchanged.

Existing single shared invitations retain their acceptance workflow. Multiple date-time options are alternative self-booking choices, not a series of assigned invitations.

The public calendar highlights available dates and lists each host's exact published appointment times for the selected date. Server conflict, cutoff and booking checks remain enforced.

## Deployment

This patch requires only a frontend deployment when the v1.11.0 backend is already installed:

```sh
npm install
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new functions, indexes or secrets. The complete project includes the existing backend addon for compatibility. Preserve your working Firebase configuration and unrelated backend functions.

## Verification

74 backend tests and 41 frontend tests passed. The three meeting categories are tested with two different date-time pairs, asserting exactly two saved appointments with their original times. The production build passed. Live external calendar providers were not tested.
