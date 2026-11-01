import { HttpsError } from "firebase-functions/v2/https";
export function registrationReceipt(id, registration, booking) {
  const participant = booking.participants?.find(
    (p) => p.uid === registration.participantUid,
  );
  const status =
    booking.status === "cancelled" || participant?.response !== "accepted"
      ? "cancelled"
      : "confirmed";
  return {
    id,
    eventTitle: booking.eventTitle,
    hostName: booking.hostName,
    startAt: booking.startAt,
    endAt: booking.endAt,
    timezone: booking.timezone,
    status,
    attendeeName: registration.name,
    attendeeEmail: registration.email,
    meetingUrl:
      status === "confirmed"
        ? (booking.syncStatus === "synced"
            ? booking.meetingUrl
            : booking.locationValue) || ""
        : "",
    syncStatus: booking.syncStatus,
    cancelHours: booking.cancelHours,
  };
}
export function registerParticipant(
  booking,
  participant,
  now = Date.now(),
  capacity = 100,
) {
  if (booking.status !== "confirmed" || booking.startAt <= now)
    throw new HttpsError(
      "failed-precondition",
      "This meeting is no longer open for registration.",
    );
  const existing = booking.participants.find((p) => p.uid === participant.uid);
  if (existing) {
    if (existing.response === "declined")
      throw new HttpsError(
        "failed-precondition",
        "You declined this invitation. Contact the host to change your response.",
      );
    return booking.participants.map((p) =>
      p.uid === participant.uid
        ? { ...p, ...participant, response: "accepted", respondedAt: now }
        : p,
    );
  }
  if (
    booking.participants.some(
      (p) => p.email.toLowerCase() === participant.email.toLowerCase(),
    )
  )
    throw new HttpsError(
      "already-exists",
      "This email already has an invitation or registration. Sign in to accept your invitation, or use your confirmation link.",
    );
  if (
    booking.participants.filter((p) => p.response !== "declined").length >=
      capacity ||
    booking.participants.length >= 1000
  )
    throw new HttpsError("resource-exhausted", "This meeting is full.");
  return [
    ...booking.participants,
    { ...participant, response: "accepted", respondedAt: now },
  ];
}
