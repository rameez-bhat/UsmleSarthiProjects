# Custom question types

Event editor → Scheduling rules & questions → Add question.

Supported types: Short text, Long text, Dropdown, Multiple choice (one answer), Email, Number and Date. Dropdown and multiple-choice questions show an Options box: enter one option per line. Required is configurable per question. Existing questions without a type behave as short text.

Both event host booking and public shared-session registration forms render the chosen control. Answers retain the existing ordered string-array format, so attendee details and question/answer emails continue working. The server checks required fields, choice membership and typed email/number/date values for new bookings. Existing answers retained during rescheduling are not rejected because event options have since changed.

Limits remain 10 questions; each choice question supports 1–50 distinct options of at most 200 characters. Blank option lines are ignored and duplicate options are removed when saving.

Deployment: rebuild and deploy Hosting. Copy existing-functions/scheduler.cjs to your existing backend functions/scheduler.cjs, then deploy schedulerSaveEvent, schedulerBook and schedulerRegistration. No extra Functions file imports are needed with the bundled addon.
