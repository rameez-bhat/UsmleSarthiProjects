# Restore existing booking flows

The host-directory step and event-specific host-link menu now apply only when eventKind is group. Existing fixed, recurring and host-slots/round-robin events show the calendar and host times directly as before the calendar-ranges release. A host query parameter is ignored outside Group events. Group events retain the topic-specific directory and direct-host links, including when there is only one participating host.

Calendar date-range selection remains in the host schedule editor. Other schedule options and backend assignment logic have not been changed in this update. Saved appointments remain editable with Show more / Show less.

Event creation/editing and delegated own-slot popups now use the available viewport width, with margins, scrolling and stacked mobile fields. Other confirmation dialogs retain their compact size.

Deploy Hosting after npm run build. No new backend changes are required for this update; the previous schedulerSaveEvent update is still required to persist Group event type.
