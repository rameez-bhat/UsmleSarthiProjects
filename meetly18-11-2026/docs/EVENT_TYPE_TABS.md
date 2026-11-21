# Event type tabs

Event Types has Group Meetings, Multiple Hosts and Admin Meetings tabs, each with a count and an empty state.

- Group Meetings: eventKind is group.
- Multiple Hosts: more than one distinct participating host, counting the organizer and teamHostUids. Group events are excluded.
- Admin Meetings: events whose ownerId is the signed-in user's UID. This is the default tab; group and multiple-host events are excluded. Each event appears in one category only.

The tabs filter the existing loaded workspace events in the frontend. They do not fetch other organizers' events, change access, alter meeting records or create new roles. Existing event actions remain available on matching cards.

Rebuild and deploy Hosting only.
