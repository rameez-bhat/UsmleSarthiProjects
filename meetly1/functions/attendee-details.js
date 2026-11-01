import { HttpsError } from "firebase-functions/v2/https";
// Check the booking's owner on the server; callers never choose a profile UID.
export function assertAttendeeAccess(uid, access, booking) {
  if (
    !access.canHost ||
    (!access.isAdmin && booking.ownerId !== uid && booking.organizerId !== uid)
  )
    throw new HttpsError(
      "permission-denied",
      "You can view attendee details only for bookings on your own links.",
    );
}
export function trustedAttendeeUid(booking) {
  return typeof booking.attendeeUid === "string" &&
    (booking.attendeeIdentityVerified === true ||
      booking.bookingAudience === "registered")
    ? booking.attendeeUid
    : null;
}
export function safeProfile(value) {
  if (value === null || value === undefined) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(safeProfile);
  if (typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            !/(password|secret|token|privatekey|apikey|authorization|credential)/i.test(
              key.replace(/[^a-z]/gi, ""),
            ),
        )
        .map(([key, item]) => [key, safeProfile(item)]),
    );
  return value;
}
export async function attendeeDetails(booking, identityDb) {
  const uid = trustedAttendeeUid(booking);
  const details = {
    booking: {
      eventTitle: booking.eventTitle,
      hostName: booking.hostName,
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      timezone: booking.timezone,
      attendeeTimezone: booking.attendeeTimezone || booking.timezone,
      notes: booking.notes || "",
      answers: (booking.answers || []).map((answer, index) => ({
        question: booking.questionLabels?.[index] || `Question ${index + 1}`,
        answer,
      })),
    },
    profile: null,
    account: null,
    profileState: "not-linked",
  };
  if (!uid) return details;
  const [users, roles] = await Promise.all([
    identityDb.collection("Users").where("uid", "==", uid).limit(2).get(),
    identityDb.collection("UsersRoles").where("uid", "==", uid).limit(2).get(),
  ]);
  details.profileState = users.docs.length === 1 ? "linked" : "unavailable";
  if (users.docs.length === 1)
    details.profile = safeProfile(users.docs[0].data());
  if (roles.docs.length === 1)
    details.account = safeProfile(roles.docs[0].data());
  return details;
}

export function attendeeRoster(id, booking) {
  return {
    booking: {
      id,
      eventTitle: booking.eventTitle,
      attendeeName: booking.attendeeName,
    },
    participants: booking.participants.map((p) => ({
      uid: p.uid,
      name: p.name,
      email: p.email,
      response: p.response || "invited",
    })),
    profile: null,
    account: null,
  };
}
