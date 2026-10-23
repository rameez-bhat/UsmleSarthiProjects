# USMLESarthi scheduling — phase-one gap review

Prepared against the user-supplied requirements, acceptance checklist and technical specification on 16 October 2026. Phase assignments and policy examples remain **proposals**, pending the business team's review.

This is an implementation gap review, not business acceptance signoff. The current package is an independent-host scheduling foundation. No A01–A14 scenario is marked Pass because production S3, email and calendar accounts have not been connected and tested.

## Acceptance mapping

| ID | Existing foundation | Work required before acceptance | Acceptance result |
| --- | --- | --- | --- |
| A01 | 15-minute named-host events, public booking, async calendar/email outbox code | Authenticate enrolled S3 student; enforce permitted events; immutable student reference; S3 calendar integration; live email/calendar time comparison | Not tested |
| A02 | UTC booking instants; host-zone slot generation; viewer-zone display and confirmation | Test real international student and explicit UTC/Eastern/local confirmation labels. Calendar date selection currently uses host-zone dates, explained in the UI; student-zone date-grid behavior needs review | Not tested |
| A03 | Primary Google and Outlook busy-time lookup; lookup errors fail closed | Connect actual host accounts and test overlapping external busy events, revoked consent, DST and provider errors | Not tested |
| A04 | Specific host links | Participating-physician team records; physician-choice pool UI; per-physician openings; authorization and chosen-host consistency at commit | Not tested |
| A05 | Shared host/day transaction locks for a single named host | Pooled availability union; fair round-robin assignment; active-member checks; atomic assignment across simultaneous pooled requests; concurrency test in Firestore | Not tested |
| A06 | Individual host interval conflict checking | Group sessions, registration records, live holds/seat counters; one-seat-left transaction and concurrent-submission test | Not tested |
| A07 | Per-event minimum notice is checked on the server at booking | Expose configurable cutoff/increment in approved policy terms; extend enforcement to groups/pools; stale-browser acceptance test | Not tested |
| A08 | Existing per-event cancellation cutoff blocks late self-service cancellation | Approved mock-interview policy (24 hours is an example); minute precision, explicit equality behavior and boundary tests | Not tested |
| A09 | Booking revision and status update | Append-only cancellation/blocked-attempt audit; exact request/cancel UTC instants; original start/cutoff; actor and policy snapshot/version; Eastern presentation and timestamped notices | Not tested |
| A10 | Host can cancel their own booking | Administrator authorization; mandatory override reason; preserved blocked attempt; group-seat release policy and transactional override | Not tested |
| A11 | Name/email and custom written questions | Typed country-code/phone/YOG/attempt fields; trusted identity verification; lead mapping, duplicate/conflict review and retry-safe writes | Not tested |
| A12 | Host booking list | Per-registration attendance: unconfirmed/attended/no_show; authorization; correction audit; no automatic no-show inference | Not tested |
| A13 | Host upcoming/past/cancelled list and text search | Admin role; date/event/host/status filters; next-three-weeks range; shared filter function for view/export; Eastern-labeled CSV and XLSX; formula-injection-safe export | Not tested |
| A14 | Calendar-job error status and retry; deterministic provider IDs and partial sync progress | Admin exception dashboard; S3 outbox/reconciliation; delivery status; live duplicate/retry/revoked-consent tests. Current host retry is not a full admin exception workflow | Not tested |

## Proposed delivery order

1. **M0 — identity and integration discovery:** map S3 authentication, immutable student IDs, enrollment/assigned-mentor checks, lead tracker ownership and interfaces; obtain provider inventory and calendar exports. Confirm who can bootstrap/administer administrator accounts.
2. **M1 — secure scheduling foundation:** reviewed roles and host activation; policy/version snapshots; append-only audit; typed/versioned forms; slot increments/cutoffs; named host, physician choice, round robin and group seat transactions. Keep Google and Outlook because both were explicitly requested earlier.
3. **M2 — integration and launch:** idempotent S3 calendar and lead adapters; email and joining-instruction release; attendance; admin filters/exports; exception dashboard; A01–A14 execution with sample accounts and recorded evidence.
4. **M3 — payments and eligibility routing:** B01–B07 after paid-event/refund/hold/offline-payment policies are approved. Browser returns must not confirm payment.
5. **M4 — WhatsApp and notes:** C01–C03 after consent/templates, delivery provider and internal-versus-student note permissions are mapped.

## Decisions that remain open

| Decision | Required review | Until reviewed |
| --- | --- | --- |
| Initial launch target | Are all A01–A14 mandatory for launch, or are any explicitly out of phase? | Treat A01–A14 as the proposed target, not approved scope |
| Booking and cancellation cutoffs | Values per event, in minutes; default examples are not global policy | Do not silently apply 24/36 hours to every event |
| Administrator authority | Initial admin UID(s), who grants/revokes access, host invitation/disable behavior | Do not give the first public signup administrator privileges |
| Group cancellation | Whether an accepted cancellation reopens a seat; waitlist behavior | No assumed waitlist or seat-release promise |
| Rotation fairness | Least-recently-assigned or another rule; excluded physicians and assignment history | No arbitrary host switching after a student chooses a named physician |
| Prospect identity | Verified email mechanism and trusted matching keys; conflict-resolution owner | Never silently overwrite an existing lead |
| Joining details | Manual link or generated link; release time and recipients | Do not expose delayed-release links early |
| S3 student access | Identity provider, enrolled-student permissions and permitted event/mentor rules | Public/free bookings are not a substitute for S3 authorization |
| Payment | Paid types, currency, price, refund/cancellation rules and Zelle verification authority | Paid events remain disabled/not implemented |

## Version 1.1 changes actually made

- Added `npm start`.
- Frontend SDK, Admin SDK, OAuth/token storage, reminders and booking jobs now use the **named `calendly` database**.
- The Firestore job trigger explicitly targets `calendly` (Functions v2).
- Firebase deployment configuration targets `calendly` rules/indexes.
- Added this requirements map, the supplied technical specification, S3 discovery contract and an unfilled acceptance signoff sheet.

No Firebase database or cloud resources were created: the Firebase project configuration and authorized deployment access were not supplied. No S3 collection or endpoint was guessed, modified or duplicated. This release is not claimed to implement the remaining phase-one work.
