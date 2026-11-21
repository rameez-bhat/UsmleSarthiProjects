# Independent schedule blocks

Each host card now uses schedule blocks:
1. Choose one or more time ranges.
2. Apply them to a date range, multiple dates, or a single date.
3. Add another block with independent times and a different date selection type.

Later blocks replace earlier blocks completely on overlapping dates. For example, block 1 covers 23–27 November at 09:00–11:00; block 2 covers 24 and 26 November at 14:00–15:00; block 3 covers only 26 November at 17:00–18:00. Final hours on 24 November are 14:00–15:00, and on 26 November 17:00–18:00. The other dates retain block 1 hours.

When saving, previewed blocks also replace previously published choices for the same host on their selected dates. Other dates and other hosts remain unchanged. Existing confirmed bookings are not cancelled. Availability and server conflict checks still apply. Save is blocked if the entire preview is unavailable or invalid.

The builder expands blocks into saved appointments. When reopening, existing choices remain visible in the saved-slot calendar; the original block configurations are not reconstructed. Add a block to replace a saved date's hours.

Deploy Hosting only. No backend changes are needed.
