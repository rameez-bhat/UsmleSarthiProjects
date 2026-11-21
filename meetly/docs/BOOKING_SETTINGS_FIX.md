# Booking aborted despite unchanged settings

The preflight and booking transaction previously compared the stored event to its host-specific variant (different Zoom/Google link or derived phone instructions), causing false ABORTED errors. Both now compare original Firestore event snapshots, with deep equality independent of object key order. Real event edits, host availability edits, and booking conflicts retain their existing protections.

Copy existing-functions/scheduler.cjs to your existing backend functions/scheduler.cjs, retaining the existing index export and unrelated functions. Deploy:

firebase deploy --only functions:schedulerBook,functions:schedulerReschedule --project usmlesarthi-residency-match

No Hosting deployment is required for this fix. No bookings or database records need migration.
