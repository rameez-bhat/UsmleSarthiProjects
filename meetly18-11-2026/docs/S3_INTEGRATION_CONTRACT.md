# S3 integration discovery and contract

**Status: proposed interface; no adapter is implemented or enabled.** Here “S3” means the existing student platform in the supplied requirements; this is not an assumption that student records live in Amazon S3 object storage.

The source of truth is deliberate: scheduler bookings live in Firestore database `calendly`; S3 owns student identity/profile/enrollment/history; the existing lead tracker owns prospect records. No second writable copy of booking status is planned.

## Inputs needed from the existing S3 project

Provide code or **anonymized** examples; real student names, scores, emails, credentials and full personal records are unnecessary.

1. Firebase public web configuration and project ID. Does S3 use Firebase Authentication in that same project, another project, or another identity provider? Which stable authenticated ID maps to a student ID?
2. Student collection/document structure or API contract: immutable student ID, enrollment status, access tier/program, assigned mentor/physician, contact details and completed orientation/history references.
3. Current S3 calendar component and meeting read/write API or document structure. Identify the existing owner of meeting IDs/status and any external Calendly IDs already stored.
4. Lead tracker collection/API and field definitions for email verification, phone country code/number, YOG, attempts, scores, match season, provenance and duplicate review. Explain whether two leads can legitimately share an email/phone.
5. Admin/host authorization code or claims; initial administrator UID(s); participating physician roster and team membership source.
6. Email provider/from address, actual calendar account inventory, existing Calendly event/host/future-booking export and desired new domain/Hosting site.

## Proposed authenticated boundary

| Operation | Trusted inputs | Proposed behavior |
| --- | --- | --- |
| Resolve enrolled identity | Verified S3 session/token at the server | Return immutable student ID and reviewed access flags. Never accept a client-supplied enrollment flag or student ID as proof |
| Evaluate eligibility | Resolved identity plus versioned event policy and S3 history | Enforce at availability lookup and final booking transaction; direct URLs cannot bypass it |
| Show student calendar | Verified student identity | Query authorized scheduler booking records or a server view of those same records; changes/cancellations retain one booking ID |
| Sync booking reference | Stable booking ID plus revision, submitted by trusted outbox worker | Upsert only the reviewed reference/projection in S3; do not create an independently editable booking status |
| Resolve prospect lead | Verified email or other explicitly trusted matching key | Zero matches: create once; one match: associate; multiple matches/conflicting fields: create review exception; do not overwrite conflicts |
| Retry integration | Booking ID, revision and operation kind | Process one deterministic idempotency key; surface errors in an admin exception queue |

## Proposed booking-change envelope

Field names below belong to the new adapter contract, **not an assertion about existing S3 field names**:

```json
{
  "contractVersion": 1,
  "idempotencyKey": "bookingId:revision:booking.changed",
  "bookingId": "stable-scheduler-id",
  "revision": 1,
  "eventTypeId": "event-id",
  "sessionId": "session-id-or-null-for-migration",
  "identity": {
    "kind": "enrolled_student",
    "s3StudentId": "server-resolved-immutable-id",
    "leadId": null
  },
  "hostId": "host-id",
  "status": "confirmed",
  "startsAtUtc": "2026-11-02T15:00:00.000Z",
  "endsAtUtc": "2026-11-02T15:15:00.000Z",
  "eventTimeZone": "America/New_York",
  "viewerTimeZone": "Asia/Kolkata",
  "joiningDetailsReleaseAtUtc": null,
  "policyVersion": 1,
  "occurredAtUtc": "server-generated-instant"
}
```

Cancellation/rescheduling envelopes additionally retain original event times, request/decision times, actor type/ID, reason, prior/next state and policy snapshot. Internal note bodies and student exam scores must not appear in calendar titles or notification previews.

## Proposed records in `calendly`

Collections are materialized when real documents are written. Firestore does not require empty SQL-style tables or fake student rows.

| Record | Current or proposed collection | Authority |
| --- | --- | --- |
| Host profile/availability | `scheduler_hosts` (existing) | Scheduler; extended with reviewed activation/role references |
| Users/roles/invitations/teams | Proposed `scheduler_users`, `scheduler_invitations`, `scheduler_teams` | Scheduler or mapped existing authorization authority; needs review |
| Event types | `scheduler_events` (existing) | Scheduler; add policy/form version and routing/session semantics |
| Group sessions/seat counters | Proposed `scheduler_sessions` | Scheduler; transactional counter with live unexpired holds |
| Bookings/registrations | `scheduler_bookings` (existing) | One authoritative record; add stable S3/lead/session references |
| Policy and form versions | Proposed `scheduler_policies`, `scheduler_forms` | Scheduler; preserve historical versions |
| Audit | Proposed `scheduler_audit` | Append-only, server-written action history |
| Calendar metadata/encrypted credentials | `scheduler_connections`, `scheduler_private` (existing) | Scheduler; credentials never client-readable |
| S3 sync and lead conflict review | Proposed `scheduler_s3_outbox`, `scheduler_sync_exceptions` | Scheduler retry/reconciliation queue; existing S3/lead records remain authoritative |
| Email/job/slot locks | `scheduler_mail`, `scheduler_jobs`, `scheduler_locks` (existing) | Server only; joining-release and delivery tracking need extension |
| Payments and expiring holds | Proposed phase-two `scheduler_payments`, `scheduler_holds` | Server-verified Stripe/admin payment decisions only |
| Later notes and consent | Proposed `scheduler_notes`, `scheduler_consents` | Reviewed field-level role/student visibility |

No new authorization role, collection mapping or business policy in this document is active code. M0 discovery should resolve these before implementing M1/M2.
