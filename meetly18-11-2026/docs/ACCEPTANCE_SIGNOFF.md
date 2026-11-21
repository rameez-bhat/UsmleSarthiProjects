# USMLESarthi scheduling acceptance signoff

All results start **Not tested**. Valid results after execution: Pass, Fail, Not in phase. A code/unit-test result is not an end-to-end acceptance pass. Record phase exclusions with business approval and retain their rationale.

| ID | Observable scenario | Result | Evidence / issue / reviewer |
| --- | --- | --- | --- |
| A01 | Enrolled student books a permitted 15-minute named-host meeting; S3, host calendar and both emails agree | Not tested | |
| A02 | International display-zone change preserves instant; confirmation labels selected zone | Not tested | |
| A03 | Host external busy event removes overlapping slots | Not tested | |
| A04 | Physician pool lists only available participating physicians and books the chosen physician | Not tested | |
| A05 | Round robin assigns free host B when A is busy; concurrent submissions cannot double-book B | Not tested | |
| A06 | Two concurrent registrations compete for last class seat; exactly one confirms | Not tested | |
| A07 | Server rejects booking after the configured class cutoff even from a stale browser | Not tested | |
| A08 | Approved 24-hour mock cancellation policy: 25 hours succeeds, 5 hours fails without changing booking | Not tested | |
| A09 | Accepted cancellation retains exact UTC/Eastern times, actor, original event, policy version and timestamped notices | Not tested | |
| A10 | Admin late cancellation requires reason, retains audit and releases seat according to reviewed policy | Not tested | |
| A11 | Prospect form captures email/country code/phone/YOG/attempts; lead association is conflict-safe and not duplicated | Not tested | |
| A12 | Host marks each attendee; unmarked remains unconfirmed; corrections retain audit | Not tested | |
| A13 | Admin next-three-weeks filter and CSV/XLSX export match visible result with explicit Eastern labels | Not tested | |
| A14 | Revoked calendar authorization or failed S3 sync appears to admin; retries do not duplicate meetings/notices | Not tested | |
| B01 | Verified Stripe webhook, not return-page visit, confirms one paid held booking | Not tested | |
| B02 | Duplicate webhook produces no duplicate booking/payment/invite/email | Not tested | |
| B03 | Expired paid hold does not overbook; late payment enters exception review | Not tested | |
| B04 | Admin verifies offline Zelle receipt with actor, amount and timestamp | Not tested | |
| B05 | Returning-student orientation answer routes to checkpoints and hides orientation slots | Not tested | |
| B06 | Trusted S3 orientation history blocks false first-time answer; approved reasoned admin override works | Not tested | |
| B07 | Confirmed no-show marking triggers configured email once; unconfirmed attendance triggers none | Not tested | |
| C01 | Consented international WhatsApp reminder uses approved template and exposes delivery/email fallback | Not tested | |
| C02 | Authorized staff can see internal-only S3 note; student cannot | Not tested | |
| C03 | Student-visible note appears only in the correct authorized S3 profile | Not tested | |

Business owner: ____________________

Admin reviewer: ____________________

Programmer: ____________________

Phase/version tested: ____________________

Date and time zone: ____________________

Open issues and approved exclusions: ____________________
