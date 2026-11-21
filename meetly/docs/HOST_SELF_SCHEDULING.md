# Let selected hosts manage their own meeting slots

Organizer workflow:

1. Create/edit a meeting using multiple host dates/times (host-slots scheduling).
2. Select participating hosts. Beside each non-organizer host's schedule card,
   enable Allow [host] to manage their own slots for this meeting.
3. Enable any subset independently; all permissions default off. Save the event.
   Enabled hosts may be left without published times until they add them later.
   The organizer can still add/edit slots for all hosts and controls all locations,
   duration, settings and delegation permissions.

Host workflow:

1. Sign into SAMAY using an eligible host account with a completed scheduler profile.
2. Open Event types and find Meetings you can schedule.
3. Click Refresh shared meetings if the organizer has just granted permission.
4. Open Manage my slots. Choose dates/ranges and times with the existing slot editor,
   review/remove your own saved choices, then Save my slots.
5. Save checks saved Availability and live calendar conflicts. A confirmation can
   retain free choices while removing conflicting new times. Existing confirmed
   bookings are not cancelled when published choices are removed.

Permissions are event-specific, not a new global role. Only the organizer grants
or withdraws them. The host's server endpoint can replace only that host's slots;
it cannot change organizer/other host slots, meeting settings or permissions.
The server rechecks authorization inside the final transaction and rejects a stale
save after revocation, deletion, deactivation or simultaneous event/profile edits.
Organizer saves also detect newer host slot revisions rather than overwriting them
from an older open editor. Revocation takes effect when the organizer saves a valid
event configuration. Disabled hosts' schedules must be provided by the organizer
under the existing selected-host schedule validation.

The dashboard loads sanitized per-host assignment documents directly from
calendly/scheduler_host_assignments, queried by hostUid. These documents contain
only event/owner/host identifiers, title, duration, active state and this host's
slots. They do not include other hosts' phone numbers, private links or attendees.
Configure this collection's read rules for the matching signed-in host as part of
your existing rules management. Writes, public schedule publication, grant/revoke
and deletion cleanup are performed by the verified server functions atomically.
No interval polling was added; the host can refresh manually.

Saving slots remains a server callable because it includes protected delegation,
external calendar checks, conflict validation and a transaction preserving other
hosts' data. Reading the host's assignment list uses frontend Firestore queries.
Google/Zoom credentials stay server-side. Current connection/profile prerequisites
for event creation remain in effect. No new OAuth secrets are introduced.

Deployment:

Copy existing-functions/scheduler.cjs into your existing backend functions folder
as scheduler.cjs, preserving your unrelated exports. Then run:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSaveOwnSlots,functions:schedulerDeleteEvent,functions:schedulerPublicPage,functions:schedulerPublicEvent --project usmlesarthi-residency-match

Build with npm run build and deploy the existing scheduler Hosting target:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

Your uploaded HostChoiceBooking.jsx change is retained: sign-in identity and the
diagnostic control are visible only when authUser exists. Existing meeting-slot,
location and public-calendar behavior is preserved.

Local automated checks do not perform a production deployment or real calendar
writes. Delegation does not send a new notification email automatically; hosts see
the meeting in their dashboard after permission is saved.
