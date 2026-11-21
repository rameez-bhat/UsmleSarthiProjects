# Event-specific hosts and calendar ranges

## Date ranges
Choose Date range on a host schedule card. Click a start and end date on the month calendar (inclusive), or enter them in the date fields. Range 1 uses Choose times; Add another date range adds an independent calendar with its own start and end times. Remove any range. Duration splits each window into complete appointments; overlaps are deduplicated. Existing availability exclusions, preview expansion/removal and save-time calendar conflict checks remain in place.

Published ranges are stored as individual host appointments, preserving the existing backend format. After saving, edit the saved appointment rows; original range-builder configurations are not reconstructed from them. Each range retains the existing 366-day maximum.

## One event/topic, multiple hosts
The main event link shows a host directory when more than one host participates. Selecting a host opens only their dates/times. The event title, description, booking questions, audience and policies stay attached to the same event. The booking continues to submit the selected host UID to existing server validation.

Each event card has Host-specific event links. Copy a link such as /book/organizer/event-id?host=host-uid. It preselects that host on this event; it never opens the host’s general booking page. Choose another host returns to the event host directory. No new general host-group collection or group-session capacity feature is introduced.

## Deployment
Frontend only: npm run build, then deploy Hosting. Existing backend and role permissions are unchanged. This includes all previous email changes in the full package, but no further Functions update is needed if those are already deployed.
