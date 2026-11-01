import { responseStatus } from "./invitations.js";
import { HttpsError } from "firebase-functions/v2/https";

export function selectedUids(input = []) {
  if (
    !Array.isArray(input) ||
    input.length > 100 ||
    input.some(
      (uid) => typeof uid !== "string" || !/^[a-zA-Z0-9_-]{1,110}$/.test(uid),
    )
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Select up to 100 registered users.",
    );
  }
  return [...new Set(input)];
}

export async function resolveParticipants(uids, identityDb) {
  return Promise.all(
    selectedUids(uids).map(async (uid) => {
      const result = await identityDb
        .collection("Users")
        .where("uid", "==", uid)
        .limit(2)
        .get();
      if (result.docs.length !== 1)
        throw new HttpsError(
          "invalid-argument",
          "A selected user is missing or has duplicate identity records.",
        );
      const user = result.docs[0].data();
      if (
        typeof user.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
      )
        throw new HttpsError(
          "invalid-argument",
          "A selected user has no valid email.",
        );
      return {
        uid,
        name:
          typeof user.displayName === "string" && user.displayName.trim()
            ? user.displayName.trim().slice(0, 160)
            : user.email,
        email: user.email.trim().toLowerCase(),
      };
    }),
  );
}

export function personalMeeting(id, booking, uid) {
  if (booking.attendeeUid !== uid && !booking.participantUids?.includes(uid))
    throw new HttpsError(
      "permission-denied",
      "This meeting belongs to another attendee.",
    );
  return {
    id,
    eventTitle: booking.eventTitle,
    hostName: booking.hostName,
    startAt: booking.startAt,
    endAt: booking.endAt,
    timezone: booking.timezone,
    status:
      booking.status === "cancelled"
        ? "cancelled"
        : booking.participants?.some((p) => p.uid === uid)
          ? responseStatus(booking.participants.find((p) => p.uid === uid)) ===
            "accepted"
            ? "confirmed"
            : responseStatus(booking.participants.find((p) => p.uid === uid))
          : booking.status,
    meetingUrl:
      booking.status === "confirmed" &&
      (!booking.participants?.length ||
        responseStatus(booking.participants.find((p) => p.uid === uid)) ===
          "accepted")
        ? booking.meetingUrl || booking.locationValue || ""
        : "",
    location: booking.location,
    syncStatus: booking.syncStatus,
  };
}
