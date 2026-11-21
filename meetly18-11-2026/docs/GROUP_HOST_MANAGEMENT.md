# Group event host management

1. Open Event Types → Group Meetings → New group event.
2. Create the topic/settings; adding times is no longer required to save a Group event.
3. Click its title or Open group.
4. Expand Add hosts to this group, select eligible hosts in the searchable picker and click Add selected hosts.
5. Each host tile (including the organizer) has On/Off, Manage slots and Copy host link. Group settings opens the full editor; Copy group link opens the public host-choice page.

Manage slots focuses the saved-date calendar and new-time controls on the selected host while retaining all other hosts’ slots. Hosts without saved times can remain in the group until their availability is added. Group event links retain one shared topic, questions and booking policies.

On/Off changes only eligibility for new bookings. It preserves the host's membership, saved slots and existing reservations. Disabled hosts are filtered from frontend published candidates and server slot discovery, and the booking context rejects disabled hosts. The existing booking transaction rechecks the event revision/content so a simultaneous membership change aborts stale reservations. Existing confirmed bookings, calendar events and notifications are not cancelled by switching a host off.

Group management reads and membership/status changes use frontend Firestore transactions on calendly scheduler_events, scheduler_public_events and scheduler_audit. Membership updates increment slotsVersion to reject stale editor saves. External calendar checks and slot publication remain in existing server functions. Publishing a Google Meet slot still requires the relevant host's connected Google account unless an existing link is provided. A host without a profile can be added before onboarding; adding their slots requires completing the profile.

Group self-scheduling delegation remains controlled by its existing per-host permission. An off host may retain that permission and edit their own times, but those choices remain hidden until enabled. Limits inherited from existing scheduling remain (20 total hosts, Firestore document limits).

## Deployment
Copy existing-functions/scheduler.cjs to the existing backend functions/scheduler.cjs. Deploy schedulerSaveEvent, schedulerSlots, schedulerBook, schedulerReschedule, schedulerSaveOwnSlots, schedulerPublicPage and schedulerPublicEvent. Rebuild and deploy Hosting too. Do not replace unrelated existing Firebase functions.

No cloud deployment, calendar writes, bookings or emails were performed during this change. Local backend/frontend tests and the production build passed; live validation depends on deploying the updated functions and the existing project permissions for frontend writes.
