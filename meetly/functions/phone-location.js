import { HttpsError } from "firebase-functions/v2/https";
export function normalizeHostPhones(input, hostIds, labels = new Map()) {
  const result = {};
  for (const uid of hostIds) {
    const raw = typeof input?.[uid] === "string" ? input[uid].trim() : "";
    const phone = raw.replace(/[\s().-]/g, "");
    if (!/^\+[1-9]\d{6,14}$/.test(phone))
      throw new HttpsError(
        "invalid-argument",
        `Enter a phone number with country code for ${labels.get(uid) || "each host and organizer"} (for example +919876543210).`,
      );
    result[uid] = phone;
  }
  return result;
}
export function phoneInstructions(event, hostUid) {
  const phone = event.hostPhones?.[hostUid];
  if (!/^\+[1-9]\d{6,14}$/.test(phone || ""))
    throw new HttpsError(
      "failed-precondition",
      "The selected host must add their phone number before this meeting can be booked.",
    );
  return `Direct/WhatsApp Phone Call: ${phone}\nWhatsApp: https://wa.me/${phone.slice(1)}`;
}

// Email details come from the booked host's snapshot, never the whole event's numbers.
export function bookingJoiningInstructions(booking) {
  return booking.location === "phone"
    ? booking.locationValue || booking.meetingUrl || ""
    : booking.meetingUrl || booking.locationValue || "";
}
