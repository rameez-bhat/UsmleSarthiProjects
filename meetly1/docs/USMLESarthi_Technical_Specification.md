**USMLESarthi Scheduling Technical Specification**

Implementation contract for the programmer building the scheduler alongside S3. It describes the desired behavior, data, state transitions, and failure handling without prescribing a programming language or an unknown S3 schema. The programmer should map these interfaces to the existing S3 architecture before coding.

# Scope and system boundary

The scheduler owns event definitions, host availability settings, bookings, capacity, payment state, notifications, and an append-only action history. S3 remains the authority for enrolled student identity and profile, and the existing lead tracker remains the authority for prospect records. Integration can use the existing application database or service endpoints, but there must be one authoritative booking record and stable IDs shared with S3. Do not create two writable copies of booking state.

# Proposed milestones

| **Milestone**       | **Deliverable**                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| M0 discovery        | Map S3 student IDs, lead fields, auth, current calendar providers, email provider, host accounts, and Calendly export format. |
| M1 foundation       | Users and roles, event types, calendar connection, availability calculation, booking, cancellation policies, audit log.       |
| M2 integration      | S3 student calendar and prospect lead mapping; emails, dashboards, attendance, export.                                        |
| M3 paid and routing | Stripe and offline payment verification; self-report and S3-backed eligibility routing.                                       |
| M4 later            | WhatsApp, S3 meeting notes, extra calendar providers, optional unbooked-link follow-up.                                       |



# Core records

| **Entity**               | **Minimum fields and constraints**                                                                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User and host            | user_id, role, status, email, display_name, S3 reference where applicable, team memberships, time_zone, booking_slug. Slug unique; deactivation disables new booking.                                                                                                                                |
| Calendar connection      | host_id, provider, provider_calendar_id, granted scopes, connection status, refresh credential stored encrypted, last sync and error timestamps. Never expose tokens in exports.                                                                                                                     |
| Event type               | event_type_id, name, description, one_on_one or group or pool or round_robin, duration, slot_increment, location_mode, host/team set, max_capacity, booking_cutoff_minutes, cancellation_cutoff_minutes, paid flag, price and currency, eligibility_rule, notification policy, active flag, version. |
| Session                  | session_id, event_type_id, starts_at_utc, ends_at_utc, event_time_zone, host_id or host assignment rule, capacity, location details, active/canceled status. Group class has one session and many registrations.                                                                                     |
| Booking                  | booking_id, session_id, event_type_id, participant S3 id or lead id, host id, status, created_at_utc, canceled_at_utc, canceled_by, cancellation_reason, form response version, payment status/reference, attendance status.                                                                         |
| Audit action             | audit_id, booking_id, actor_id or public token, action, prior state, next state, occurred_at_utc, request id, source, reason; append only.                                                                                                                                                           |
| Notification and payment | outbox id, event, recipient, channel, scheduled_at_utc, sent_at_utc, provider id and status; payment attempt id, booking hold id, provider reference and verified status.                                                                                                                            |



# Booking and availability rules

1. Fetch an event type and confirm it is active, visible to this user, and allowed by the eligibility policy. Public links can identify an event but cannot bypass authorization or event rules.
2. Convert the viewer time zone only for display. Generate candidate slots from host working hours, event date range, duration, increments, buffers and limits. Subtract external calendar busy periods and existing scheduler bookings. For round robin use the union of eligible hosts’ openings; for a named host use only that host; for physician pool show host-specific availability.
3. For a group session, show a slot only when confirmed registrations plus live unexpired holds are below capacity. A canceled registration releases one seat only when a cancellation is actually accepted.
4. Re-check availability, lead time, eligibility, and capacity inside one database transaction at submission. Lock or atomically reserve the host interval or group seat. If another booking won the race, return a slot-unavailable response and refreshed choices.
5. For an unpaid event, commit the booking and queue confirmation and S3 sync. For a paid event, create a short expiring hold and do not send a confirmed meeting notice until payment is verified.
6. Write the host calendar event or invite and retain its provider id; if provider write fails, retain an explicit sync-failed status for retry and alert admin. Avoid duplicate calendar events on retry.

# State transitions

| **From**  | **Action**                    | **To and side effect**                                                                              |
| --------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Available | Begin paid checkout           | Held pending payment; release automatically at expiry.                                              |
| Available | Complete free booking         | Confirmed; allocate capacity; emit booking event.                                                   |
| Held      | Verified payment              | Confirmed once; emit booking event once.                                                            |
| Held      | Payment failure or expiry     | Released; no confirmed booking.                                                                     |
| Confirmed | Eligible student cancellation | Canceled; timestamp and actor recorded; release slot; notify and sync.                              |
| Confirmed | Late student cancellation     | Remain confirmed; return cutoff message; log blocked attempt.                                       |
| Confirmed | Authorized admin cancellation | Canceled with actor and reason; notify and sync.                                                    |
| Confirmed | Reschedule                    | Treat as a controlled change with old and new timestamps, re-check availability and record history. |
| Confirmed | Event completed               | Retain booking; attendance unconfirmed until host marks attended or no show.                        |



# Cancellation timing and evidence

Store all instants in UTC and use a named IANA time zone (America/New_York) for the admin interface, applying daylight saving automatically. Display an explicit EDT or EST label and date in the admin record, notification, and export. Let the student view their own local time as well. Decide cutoff with server time: self-cancel allowed only if request_received_at_utc <= starts_at_utc minus event cancellation_cutoff_minutes. Define the equality case in the UI as “until [date and time]”; reject later requests even when a browser clock differs. Preserve original start, cutoff, cancellation request, actor, and policy version. The server sets canceled_at_utc; never trust a client supplied time. An admin override records a reason and does not erase the blocked attempt.

# S3 and lead tracker integration

- Use S3 login for enrolled students where available and carry immutable student_id into the booking. In S3 Calendar show future confirmed and past bookings with event type, host, joining details when released, local time, and cancellation status. Cancellation or change updates the same booking ID.
- For unauthenticated prospects, collect email, international dialing code, number, optional WhatsApp consent, and event-specific profile answers. Match existing lead conservatively; if multiple matches, flag for review. Preserve the original source and do not overwrite conflicting data automatically.
- Maintain a reviewed field mapping from booking question key to S3 or lead tracker field (for example email, country_code, phone_number, YOG, match season, Step scores, attempts). Version form questions so old responses still make sense after edits.
- Make booking to S3 and lead synchronization retryable and idempotent using booking_id plus a change version. Failed sync appears on an admin exception list; do not silently lose the booking.
- Keep prospect access separate from enrolled-student authorization. A public confirmation or cancellation token must be hard to guess, scoped to one booking, and invalidated or rotated as appropriate.

# Notifications and attendance

Create queued notifications for confirmed, canceled, rescheduled, and reminder states. A confirmation contains event name, host, date and time with time-zone label, joining method or instructions, and a link to manage the booking. Cancellation notices state canceled_at and actor. Send to both student and host; for a group class the host can receive one roster or per-booking notices according to admin configuration. Scheduled jobs must check that the booking is still confirmed before sending. Record failed delivery and retry without duplicate messages. Joining instructions can have a release time such as 24 hours before class.

Attendance is per booking, including each class participant. Only an authorized host or admin can mark attended or no show. Status begins unconfirmed and can be corrected with an audit record. Follow-up triggers only after a confirmed attendance decision; a no-show is not inferred solely because a session ended.

# Payment workflow for phase two

Use server-created Stripe Checkout Sessions tied to a pending booking hold and internal booking_id. Verify webhook signatures; on a verified successful payment event, confirm exactly once after validating amount, currency, and session reference. A browser return page is not proof of payment. Handle duplicate or out-of-order callbacks idempotently, hold expiry, and a payment arriving after a hold has expired through an admin exception and refund/rebooking workflow. Store transaction references, not card details. For Zelle or another offline method, hold or request a slot and require an authorized admin to record receipt and confirm the booking; show pending payment to the student. Refund and cancellation rules need business approval before enabling paid events.

# Event routing for phase two

Evaluate eligibility on every visit and at final confirmation, including when an old direct URL is reused. Example: orientation event asks first meeting yes or no. A no answer returns a clear explanation and checkpoint links. Once S3 meeting history is reliable, orientation eligibility also checks prior completed orientation for the same student_id. Never infer a prior visit solely from name or unverified email. Allow a logged admin override with a reason where an exception is justified.

# Dashboards and exports

- Admin filters: date range, event type, host or physician, team, status, student or prospect, payment, and attendance. Host view includes only authorized host bookings; student view only their own.
- Quick ranges Today, Upcoming, This Week, Last Week; date picker and text search; event cards show attendee, start time, event, host, booking status and “up next.”
- Export the exact filtered result, not a hidden unfiltered table. Provide CSV (UTF-8) and XLSX, time-zone label in column headers, stable booking/session IDs, cancellation time and actor, attendance, and roster fields subject to permissions. Prevent spreadsheet formula execution when exporting user-entered text.
- User admin page includes invite, pending/active/disabled status, role, host group, booking page URL, and calendar connection health. No purchased-seat cap is implied.

# Security and operations

- Use server-side role checks for admin, host, student, and public prospect actions. Least-privilege calendar permissions; encrypt refresh tokens and payment secrets; log access to notes if added later.
- Rate-limit public booking and identity lookup endpoints, validate all inputs, and use scoped tokens for public manage-booking links. Do not expose student scores or private notes in calendar titles or email previews.
- Keep immutable audit entries and backups; expose failures of calendar sync, S3 sync, payments, and email delivery to admins with retry controls and reconciliation reports.
- Treat time zones and daylight saving as first-class data: event start stored as UTC instant, event and display zones stored as IANA names; retain zone and original inputs for audit. Test March and November Eastern transitions.
- Before migration, export current Calendly event definitions, hosts, and future bookings; reconcile totals and avoid duplicate confirmations when cutover happens.

# Current provider references

The implementation choices above are grounded in current primary documentation. Recheck versions and permission scopes at implementation time: Google Calendar freebusy, events insert, watch and sync (developers.google.com/workspace/calendar/api/v3/reference/freebusy/query; /events/insert; /events/watch; /guides/sync); Microsoft Graph getSchedule and create event (learn.microsoft.com/en-us/graph/api/calendar-getschedule and calendar-post-events); Stripe Checkout Sessions and webhook fulfillment (docs.stripe.com/api/checkout/sessions and docs.stripe.com/payments/checkout/fulfillment). WhatsApp integration remains a later technical discovery item.

# Items for programmer discovery

- Confirm S3 technology, authentication, student and lead primary keys, existing field names and write permissions.
- Inventory actual calendar providers and accounts used by staff and physicians; scope Microsoft support accordingly.
- Confirm email service, Zoom meeting workflow, domain ownership, Stripe account and webhook setup.
- Determine how existing Calendly future bookings will be imported and whether current canceled bookings need history.
- Agree precise event catalog, cutoff minutes, payment prices, reminder templates, group rosters, reporting roles, and retention period with Pawan and admin team.