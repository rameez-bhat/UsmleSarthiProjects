# Editing meeting emails

Source template: functions/meeting-email.js, function meetingEmail.

- html controls the styled email; text controls the plain-text alternative.
- The link argument contains the selected host's joining instructions.
- The Join meeting anchor renders that link for confirmed recipients; it is withheld for cancellations and declined invitations.
- functions/index.js mail() resolves bookingJoiningInstructions(b) and calls the template.
- functions/phone-location.js bookingJoiningInstructions() chooses the booking's meetingUrl or phone instructions.

Do not hardcode one host's Google Meet or Zoom URL in the template. Use the link argument so each booking receives its assigned host's correct link. If emails show no joining link, inspect schedulerSyncBooking and the booking meetingUrl/syncStatus; formatting changes cannot create a missing provider link.

Existing backend setup uses existing-functions/scheduler.cjs. After editing source, rebuild this addon, then deploy schedulerSyncBooking and schedulerReminders. Editing the source template without rebuilding/deploying does not update the deployed addon. The schedulerDispatchMail bridge already preserves message.html and needs no template change.

## Dashboard UI update
My meetings uses responsive tiles with status badges and Upcoming / Invitations / Past / All meetings filters. Shared host schedules use tiles highlighting published slots or action needed. Public Group event host selection uses dedicated host tiles. Existing meeting types retain their calendar-first flow.

The dashboard UI changes require Hosting only. Email behavior was not changed by this release.


## Join button and recipient answers
Both hosts and confirmed attendees now get a styled Join meeting button for an HTTPS meeting link. Phone instructions remain readable text. Hosts see attendee answers; each attendee sees only their own saved responses, matched by UID/registration ID with unique email fallback for legacy records. Cancelled/declined invitations do not receive joining actions. Direct shared-session registration confirmations now use the same template.

For this email update deploy schedulerSyncBooking, schedulerReminders and schedulerRegistration after copying the rebuilt addon. No Hosting rebuild is required. Template edits alone cannot generate a missing external meeting URL.
