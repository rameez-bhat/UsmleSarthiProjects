import { DateTime } from "luxon";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
export function applyEventPolicy(input, event, host, now = Date.now()) {
  const schedulingMode =
    input.multipleHostTimes === true
      ? "host-slots"
      : (input.schedulingMode ?? "recurring");
  const audience = input.audience ?? "anyone";
  if (
    !["recurring", "fixed", "host-slots"].includes(schedulingMode) ||
    !["anyone", "registered"].includes(audience)
  )
    throw new HttpsError(
      "invalid-argument",
      "Choose a valid meeting schedule and booking audience.",
    );
  const policy = { schedulingMode, audience };
  if (input.multipleHostTimes === true) {
    const category =
      input.scheduleCategory || input.schedulingMode || "recurring";
    if (!["recurring", "fixed", "host-slots"].includes(category))
      throw new HttpsError("invalid-argument", "Invalid schedule category.");
    Object.assign(policy, {
      multipleHostTimes: true,
      scheduleCategory: category,
    });
  }
  if (schedulingMode === "fixed") {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.meetingDate || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.meetingTime || "")
    )
      throw new HttpsError(
        "invalid-argument",
        "Choose the meeting date and start time.",
      );
    const local = `${input.meetingDate}T${input.meetingTime}`;
    const start = DateTime.fromISO(local, { zone: host.timezone });
    if (!start.isValid || start.toFormat("yyyy-MM-dd'T'HH:mm") !== local)
      throw new HttpsError(
        "invalid-argument",
        "This local meeting time does not exist in the host time zone.",
      );
    if (event.active && start.toMillis() <= now + event.minNotice * 60000)
      throw new HttpsError(
        "invalid-argument",
        "Choose a meeting time after the configured minimum booking notice, or reduce that notice.",
      );
    Object.assign(policy, {
      meetingDate: input.meetingDate,
      meetingTime: input.meetingTime,
      meetingTimezone: host.timezone,
      fixedStartAt: start.toMillis(),
    });
  }
  return policy;
}
export async function assertBookingAudience(
  event,
  request,
  identityDb = getFirestore(),
) {
  if (event.audience !== "registered")
    return { uid: request.auth?.uid || null, email: null };
  const auth = request.auth;
  if (!auth)
    throw new HttpsError(
      "unauthenticated",
      "Sign in with your registered USMLESarthi account to book this meeting.",
    );
  if (
    !auth.token?.email_verified ||
    typeof auth.token.email !== "string" ||
    !auth.token.email
  )
    throw new HttpsError(
      "failed-precondition",
      "Verify your account email, then sign in again before booking.",
    );
  const users = await identityDb
    .collection("Users")
    .where("uid", "==", auth.uid)
    .limit(2)
    .get();
  if (users.docs.length !== 1)
    throw new HttpsError(
      "permission-denied",
      "This meeting is available only to existing registered USMLESarthi users. Contact support if your account is missing.",
    );
  return { uid: auth.uid, email: auth.token.email.toLowerCase() };
}
