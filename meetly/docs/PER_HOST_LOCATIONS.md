# Independent meeting location for each host

The event editor now shows a Location for each host section instead of one shared
location selector. The organizer and each selected host can independently choose
Google Meet, Zoom or Direct/WhatsApp Phone Call. Enter optional participant links
for Google Meet/Zoom, or a required country-coded phone number for phone calls.

For host-choice bookings the selected host's configuration is used. Dated round
robin invitations use the host assigned by the server. Confirmations, calendar
appointments and emails use that booking's chosen location and joining details.
Changing one host's location does not change the others. Existing events without
hostLocations retain their legacy shared location until edited. The public event
response excludes hostLocations and hostPhones; private links and phone numbers
are shared through authorized booking details and configured notifications.

Numbers are not WhatsApp API messages. A WhatsApp link is supplied alongside a
normal telephone link and requires the number to have WhatsApp. Automatic Google
Meet or Zoom creation uses the existing server integrations. Booking-time external
calendar conflict checks remain active for connected calendars.

Copy existing-functions/scheduler.cjs into your existing backend functions folder
as scheduler.cjs, preserving unrelated exports. Deploy:

firebase deploy --only functions:schedulerSaveEvent,functions:schedulerSlots,functions:schedulerBook,functions:schedulerReschedule,functions:schedulerSyncBooking,functions:schedulerPublicPage,functions:schedulerPublicEvent --project usmlesarthi-residency-match

Rebuild frontend with npm run build, then deploy your existing scheduler target:

firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match

Existing confirmed bookings retain their original details. Changing a location
for future bookings does not replace a confirmed attendee's calendar appointment.
Local tests do not exercise live calendar creation or outgoing email delivery.
