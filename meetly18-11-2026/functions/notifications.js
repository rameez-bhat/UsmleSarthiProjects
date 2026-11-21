import { HttpsError } from "firebase-functions/v2/https";
export function notificationSettings(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new HttpsError("invalid-argument", "Invalid notification settings.");
  const settings = {};
  for (const key of [
    "enabled",
    "invitations",
    "confirmations",
    "cancellations",
    "hostUpdates",
  ]) {
    if (input[key] !== undefined && typeof input[key] !== "boolean")
      throw new HttpsError(
        "invalid-argument",
        `Invalid email setting: ${key}.`,
      );
    settings[key] = input[key] ?? true;
  }
  const reminders = input.reminderMinutes ?? [1440, 60];
  if (
    !Array.isArray(reminders) ||
    reminders.some((n) => ![1440, 60, 15].includes(n))
  )
    throw new HttpsError(
      "invalid-argument",
      "Choose supported email reminder times.",
    );
  settings.reminderMinutes = [...new Set(reminders)].sort((a, b) => b - a);
  return settings;
}
export function emailAllowed(settings, kind, staff = false) {
  if (!settings.enabled || (staff && !settings.hostUpdates)) return false;
  if (kind.startsWith("reminder_"))
    return settings.reminderMinutes.includes(Number(kind.slice(9)));
  if (kind === "cancel" || kind === "declined") return settings.cancellations;
  if (staff) return true;
  return kind === "invitation" ? settings.invitations : settings.confirmations;
}
export function hostRecipients(booking) {
  const people = [
    { uid: "host", email: booking.hostEmail, name: booking.hostName },
    {
      uid: "organizer",
      email: booking.organizerEmail,
      name: booking.organizerName,
    },
  ];
  const unique = new Map();
  for (const person of people)
    if (typeof person.email === "string" && person.email)
      unique.set(
        person.email.toLowerCase(),
        unique.get(person.email.toLowerCase()) || person,
      );
  return [...unique.values()];
}
export function mailSummary(id, data) {
  return {
    id,
    to: Array.isArray(data.to) ? data.to : [],
    subject: data.message?.subject || "Meeting notification",
    kind: data.notificationKind || "notification",
    createdAt: data.createdAt || null,
    state:
      data.delivery?.state ||
      (data.forwardedAt
        ? "FORWARDED"
        : data.dispatchError
          ? "ERROR"
          : "PENDING"),
    attempts: data.delivery?.attempts || 0,
    hasError: !!data.delivery?.error || !!data.dispatchError,
  };
}
