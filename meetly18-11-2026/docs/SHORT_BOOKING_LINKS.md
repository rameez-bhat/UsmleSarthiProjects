# Short booking links

Event Types: choose Short booking link on an event, enter a unique name such as pawan-review, Save short link, then Copy short link.

Example: https://samay.usmlesarthi.com/b/pawan-review

The /b/ route reads scheduler_short_links in the calendly database and redirects to the existing /book/host/event route. Query parameters (including host selection) are preserved. Original links remain unchanged. Names are 3–60 lowercase letters, numbers and hyphens; whitespace becomes a hyphen. Changing the preferred name retains earlier aliases. Deleted or inactive events remain subject to the original booking route's checks.

## Firestore rules to configure

User manages rules. Add permissions for these new calendly collections before use:
- scheduler_short_links: public get; no public listing. Only the organizer of the referenced scheduler_events document may create links. Existing ownerId/eventId must be immutable, and writes must not permit claiming another organizer's event or another existing alias. Validate the slug belongs to that organizer, fields and types.
- scheduler_event_links: organizer-only get/write by event ID, with ownership checked against scheduler_events; stores preferred name and ownerId.

The frontend transaction checks event ownership and name collisions, but rules must enforce authorization too. No rules are changed by this package.

## Deployment

Build and deploy Hosting only. No Cloud Functions changes are needed. Existing Firebase Hosting SPA rewrite to /index.html must cover /b/**, just as /book/**.
