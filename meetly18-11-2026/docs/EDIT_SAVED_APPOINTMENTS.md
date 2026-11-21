# Editing saved appointments

Saved host appointments now appear expanded above the add-new-time cards. Each row has editable date, start time and (for stored ranges) end time. Editing one row retains its host, timezone and all other rows. Derived UTC fields are removed from the edited row and recalculated by server normalization on save. Remove remains explicit. The blank host schedule cards add new times; they do not replace saved choices.

Works in the organizer event editor and Manage your slots, using their shared HostSlotEditor. Only saved appointments can be loaded: this does not recover unsaved choices from a previously closed editor or records already overwritten in the database.

Rebuild and deploy Hosting. No backend changes in this update.
