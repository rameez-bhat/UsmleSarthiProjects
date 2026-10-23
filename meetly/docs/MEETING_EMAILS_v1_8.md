# Meeting email notifications

The meeting editor now has Meetly email notification settings:

- Enable/disable all Meetly emails for this meeting type.
- Email invited users.
- Email confirmations and changes.
- Email cancellations and declined invitations.
- Notify the assigned host and organizing admin.
- Reminders at 24 hours, 1 hour and/or 15 minutes before the meeting.

Existing events without settings default to enabled, with 24-hour and 1-hour reminders, preserving the previous behavior. These are event-level settings: recurring bookings on the same event type use that event's policy. Current settings are read when new lifecycle notices are queued; updating the policy affects future notices without editing every booking. Already-queued or already-sent emails are not withdrawn.

## Recipients and timing

Invitations are queued immediately when a dated invitation meeting is created. They include a response link and no joining URL. The assigned round-robin host and the organizing admin receive separate assignment/scheduling notices, even if calendar synchronization has not completed. The unused hosts in the round-robin pool are not notified. If host and organizer use the same email address, only one staff recipient is queued.

After successful synchronization, confirmed attendees receive joining instructions. Accepted users receive confirmation; users still awaiting acceptance do not receive joining links or reminders. The host and organizing admin receive lifecycle updates with current attendee responses. Public guest registration notices include their private confirmation/cancellation link; later confirmed joining messages include that link too. Application notices are addressed individually, preserving other attendees' email privacy. Normal one-on-one attendee notices also keep private management links out of host messages.

Cancellations and response changes queue the applicable notices according to settings. The reminder job runs every five minutes; configured offsets are approximate within that scheduling window. Stable message document IDs prevent duplicate automated notices on retry. Email delivery success is separate from calendar synchronization success.

Google/Outlook can send native calendar invitations or cancellation messages as part of their own event APIs. Meetly's controls govern application-generated messages in scheduler_mail, not every provider-generated email.

## Email settings and delivery view

Under Bookings, open **Email settings & delivery**. Hosts, organizers and authorized administrators can:

1. Change the meeting's email settings without canceling the saved meeting.
2. See notices and recipients with Queued, Sending, Sent to mail server, or Failed status.
3. Retry a failed email, subject to the current policy.
4. Send pending invitations that were never queued, for example after enabling email delivery. Existing queued messages are retained rather than duplicated.

No invitations are newly queued for closed/canceled meetings. Existing invitation documents are not resent automatically; a failed one can be retried. The status list covers new notices containing bookingId metadata; historical notices created by earlier versions may not appear.

The email provider's SUCCESS state means the SMTP server accepted the message, not proof that it appeared in the recipient's inbox. Check spam folders and your provider's delivery/bounce tools if necessary. SMTP error bodies and private message links are not returned in the status API; administrators can inspect provider logs for diagnosis.

## Existing mail service integration

This update uses your existing working mail scheduler in the **default database**, collection **mail**. It does not install Firebase Trigger Email, configure another SMTP provider, or require EMAIL_ENABLED. Old EMAIL_ENABLED values are ignored by the new notification code; meeting-specific settings control new notices.

Every destination entry matches the supplied format:

```js
{
  to: "student@example.com",
  message: {
    subject: "Meeting confirmed: ...",
    html: "<html>...</html>"
  }
}
```

The bridge produces readable HTML with escaped student/meeting text and clickable links. Destination payloads contain only to and message; private scheduler metadata remains in calendly. Your existing mail worker is unchanged.

### Why the forwarding function exists

A transaction in calendly cannot atomically write a document in the default database. Meeting actions therefore create notification drafts in calendly/scheduler_mail inside their existing transaction. **schedulerDispatchMail** forwards each draft to **default/mail** using a namespaced document ID, then marks the draft forwarded. No mail is sent directly by Meetly; your existing worker sends the queued entry.

Stable destination IDs prevent overwriting or re-creating a retained queue entry on automatic retry. The forwarded marker also prevents replay after a successful bridge run. As with external email delivery generally, this is not a guarantee of exactly-once inbox delivery; retaining processed queue documents makes retry deduplication stronger. The trigger retries failed forwarding. Existing rules and workers for your default mail collection are not changed.

The email status panel shows Queued while waiting for the bridge, then Queued in your mail service after forwarding. Sent/failed delivery state appears only if your existing service writes a delivery.state field. Do not interpret forwarding as proof of inbox delivery. Failed forwarding can be retried. If your service records delivery.state=ERROR, retry creates a fresh mail entry for its existing processing flow; it does not assume your service supports Firebase-extension-specific RETRY updates. Retrying the same failed source job reuses the same retry entry.

For pending invitations created before this bridge was deployed, open Bookings → Email settings & delivery → Send pending invitations. It adds missing metadata to those invitation drafts and forwards them through the default mail service. It does not automatically resend every historical meeting notice.

Set backend APP_ORIGIN to your public Meetly Hosting URL so links in emails work on recipients' devices. Preserve your existing Google/Microsoft/Zoom environment values and OAUTH_TOKEN_KEY. There are no new SMTP or mail API secrets for this feature.

## Deployment

Replace only your existing scheduler add-on with `existing-functions/scheduler.cjs` from this package. Keep the export assignment at the end of your existing index.js, all unrelated functions, and existing secrets/environment values.

```bash
firebase deploy --only functions:schedulerSaveEvent,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerJoinMeeting,functions:schedulerSyncBooking,functions:schedulerReminders,functions:schedulerSaveNotifications,functions:schedulerMeetingEmails,functions:schedulerDispatchMail --project usmlesarthi-residency-match
```

Update the frontend, preserving .env, firebase.json and the configured Hosting target:

```bash
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

No new composite indexes or edits to default Users/UsersRoles are needed. Scheduler policies, notification drafts and audit entries remain in calendly; outgoing messages are forwarded to (default)/mail. Do not replace the default database's rules or indexes.

## Live check

Create a future meeting with a selected invitee and a different assigned round-robin host; enable application emails. Confirm the invitee, assigned host and organizing admin receive the intended notices. Accept the invitation, verify the joining instructions, and use Email settings & delivery to inspect states. Disable a notice type and verify it no longer queues new application notices. Delivery through your existing mail service, native calendar behavior and live scheduled timing must be verified after deployment.
