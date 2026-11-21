# Self-scheduling payload consistency fix

The conflict-confirmation save previously kept a pending host's self-scheduling
permission but filtered that host out of teamHostUids if they had no published
choices. That produces a permission/selected-host mismatch on the next save.
The updated retry preserves those hosts.

The editor now clears a removed host's delegation when removing them from the
team, and clears delegation when explicitly disabling multiple/per-host times.
A shared frontend payload normalizer keeps only selected non-organizer hosts in
the permission list, deduplicates the team, and sends canonical host-slots mode
when self-scheduling is enabled. A fixed organizer time is retained if an older
payload needs conversion to per-host scheduling. Preassigned-attendee invitation
meetings cannot be converted into self-scheduling meetings by this path.

Backend errors now distinguish a wrong schedule type from a host no longer being
selected. The organizer does not need their own delegation checkbox; redundant
organizer entries are ignored. Backend authorization still validates the current
selected team and event-specific permission on host writes.

Deployment requires frontend and backend. Copy existing-functions/scheduler.cjs
into the existing functions directory as scheduler.cjs, preserving other exports:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSaveOwnSlots --project usmlesarthi-residency-match

Build with npm run build and deploy:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

The host-specific schedule has to be saved with the permission enabled before the
host can see/manage it. Check each participating host independently. A selected
host without delegation still needs organizer-provided times under the existing
validation rules. Your uploaded auth-only diagnostic visibility change is retained.
