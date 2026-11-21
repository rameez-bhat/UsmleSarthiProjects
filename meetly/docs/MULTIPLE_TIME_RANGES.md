# Multiple date and time ranges

In a host schedule choose Date range and Time range. Use Add another time range for additional windows on those dates. Use Add another date range for a different group of dates with its own independent time windows. Remove an additional time window with Remove time range. The first window is edited using Range starts/Range ends; to keep only a later window, replace the first window's values and remove the additional one.

Each window expands into complete appointments using the meeting duration. Overlapping windows are deduplicated. The host's Availability still filters the preview. End time 00:00 means the end of that day, and permits a final appointment ending at midnight. Other overnight ranges remain unsupported; use two dates instead.

Existing published slots are retained. Expanded appointments are saved, rather than the original range-builder configuration; edit saved appointments using the saved calendar, or add new ranges below it.

Build and deploy Hosting only. No backend changes are required for this update.
