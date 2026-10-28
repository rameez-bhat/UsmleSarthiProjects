import { HttpsError } from "firebase-functions/v2/https";

export const responseStatus = (participant) =>
  participant?.response || "invited";
export const confirmedParticipants = (booking) =>
  (booking.participants || []).filter((p) => responseStatus(p) === "accepted");
export function respondToInvitation(booking, uid, response, now = Date.now()) {
  if (!["accepted", "declined"].includes(response))
    throw new HttpsError("invalid-argument", "Choose Accept or Decline.");
  const participant = booking.participants?.find((p) => p.uid === uid);
  if (!participant)
    throw new HttpsError(
      "permission-denied",
      "This invitation belongs to another user.",
    );
  if (booking.status !== "confirmed" || booking.startAt <= now)
    throw new HttpsError("failed-precondition", "This invitation is closed.");
  if (responseStatus(participant) === response) return null;
  if (responseStatus(participant) !== "invited")
    throw new HttpsError(
      "failed-precondition",
      "You have already responded. Contact the host to change your response.",
    );
  return booking.participants.map((p) =>
    p.uid === uid ? { ...p, response, respondedAt: now } : p,
  );
}
export function chooseRoundRobin(candidates, counts = {}) {
  return (
    [...candidates].sort(
      (a, b) =>
        (counts[a.uid] || 0) - (counts[b.uid] || 0) ||
        a.uid.localeCompare(b.uid),
    )[0] || null
  );
}
export function canEnterRoom(booking, uid) {
  return (
    booking.status === "confirmed" &&
    (booking.ownerId === uid ||
      booking.organizerId === uid ||
      booking.attendeeUid === uid ||
      confirmedParticipants(booking).some((p) => p.uid === uid))
  );
}
