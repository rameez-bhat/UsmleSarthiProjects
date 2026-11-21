# Per-host date and time choices

Under Meeting schedule, choose the team host/time option. The host picker is a native multiple select with a separate name/email search field. Initial eligible host records load directly from Firestore. Selected hosts remain in the list when the search results change. Desktop users can use Ctrl/Command for multiple selection. The organizer is automatically included in host schedule cards.

Each participating host has a separate card with these choices:

- Single date, multiple explicitly chosen dates, or inclusive date range.
- Single start time, multiple start times, or a time range divided into full meeting-duration intervals.
- An independently selected time zone.

Dates and time choices within one host card are combined intentionally: the chosen times apply on every selected date for that host. Different hosts can use completely different choices. Example: three dates and a 09:00–11:30 range at duration 30 produce five slots on each date, fifteen total.

The preview lists dates and times and the generated appointment count. Click Add choices for the host to transfer that card's options into the event entries, then Save the event. Adding choices retains existing entries and removes duplicates. Existing individual appointment rows remain editable/removable below. Builders are draft controls; changing a card without clicking Add choices does not alter the saved event entries.

Only full appointments ending within the chosen time range are generated. Date ranges can span at most 366 calendar days; the event still permits at most 100 published appointment choices, so large combinations must be reduced. Date ranges include weekends. They do not create recurring rules. Saved schedules remain individual explicit slots; editing later shows those slot rows rather than reconstructing the original builder modes.

Connected calendar requirements and conflict checks from the preceding version remain enforced. Live provider calls occur at Save, not during the local preview. Booking pages continue to display published availability by date and host.

This editor supports named host choice for team booking links. Existing automatic round-robin assigned invitations retain their existing scheduling semantics.

## Deployment

This update changes the frontend only. Keep the existing working Firebase configuration and rules. From the frontend project:

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new functions, secrets, indexes or migrations. The previous Google Calendar requirement and calendar-conflict backend must already be deployed.

## Verification

76 backend tests and 61 frontend tests passed. New coverage exercises all nine combinations of date and time modes and invalid ranges. Production build passed. Real-device layout, live Google/Zoom access and production Firestore rules were not tested.

Full frontend-only database migration, full administrator impersonation and publication-time per-host calendar/link creation remain incomplete from earlier requests.
