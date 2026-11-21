# Save host ranges directly

The host schedule preview is now part of the event Save operation. No Add choices step is required. Enter each host's date and time settings, check the preview, and Save.

The parent editor receives each host's generated preview and combines valid previews with existing saved entries before sending the event. Removed hosts' drafts are ignored. Duplicates are removed using the existing date/time/host/time-zone key. Invalid ranges stop Save locally with an explanatory error. Empty host schedules no longer reach the server as an empty hostSlots array.

Untouched host cards do not add default times. Existing explicit appointment rows remain editable. During conflict removal, rejected hosts' drafts are discarded along with their stored appointment choices; other hosts remain available for the retry.

The event still supports at most 100 generated slots. This fix addresses empty submissions, not an increase to that limit. Larger ranges show a limit error before calling the server.

This supersedes the Add choices instructions in HOST_SCHEDULE_OPTIONS.md. No server change is needed for this patch, assuming the previous backend is deployed.

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Validation: 77 backend tests and 62 frontend tests passed. A regression test saves a two-day 09:00–11:30 range directly and verifies ten 30-minute choices are passed to Save without Add choices or individual time rows. Production build passed. Production rules, live provider behavior and device layout were not tested.
