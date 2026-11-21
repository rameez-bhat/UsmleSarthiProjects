# Midnight availability fix

An availability window ending at 00:00 now ends at the following midnight, rather than the start of the selected date. This is applied in the frontend preview, server host availability validation, and recurring slot generation.

For 23–27 November 2026, 30-minute appointments, event range 09:00–23:58, and host availability 10:30–16:00 plus 20:30–00:00, preview includes 10:30–15:30 and 20:30–23:00 starts. A 23:30 start finishes after the selected event range ends (23:58), so remains excluded.

Existing events need the missing evening choices added and saved again; previously excluded rows are not restored automatically.

## Deployment

Copy existing-functions/scheduler.cjs into your existing backend functions folder, retaining its index exports and other functions. Deploy schedulerSaveEvent, schedulerSaveOwnSlots, schedulerSlots, schedulerBook and schedulerReschedule, then build/deploy Hosting.
