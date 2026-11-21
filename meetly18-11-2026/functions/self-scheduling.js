import { HttpsError } from "firebase-functions/v2/https";
export function selfSchedulingHosts(input = [], event) {
  if (!Array.isArray(input) || input.some((uid) => typeof uid !== "string"))
    throw new HttpsError(
      "invalid-argument",
      "Choose hosts using the self-scheduling checkboxes.",
    );
  const selected = [...new Set(input)].filter((uid) => uid !== event.ownerId);
  if (selected.length && event.schedulingMode !== "host-slots")
    throw new HttpsError(
      "invalid-argument",
      "Enable 'Publish multiple dates and times for each host' before allowing hosts to add their own slots.",
      { reason: "schedule_type" },
    );
  if (selected.some((uid) => !(event.teamHostUids || []).includes(uid)))
    throw new HttpsError(
      "invalid-argument",
      "A host allowed to add slots is no longer selected for this meeting. Reselect that host or clear their self-scheduling permission.",
      { reason: "host_not_selected" },
    );
  return selected;
}
export function assertSelfScheduling(event, uid) {
  if (
    !event ||
    event.deletedAt ||
    !event.active ||
    event.schedulingMode !== "host-slots" ||
    !(event.teamHostUids || []).includes(uid) ||
    !(event.selfSchedulingHostUids || []).includes(uid)
  )
    throw new HttpsError(
      "permission-denied",
      "The organizer has not allowed you to manage your slots for this meeting, or has withdrawn that permission.",
    );
}
export function replaceOwnSlots(event, uid, slots) {
  assertSelfScheduling(event, uid);
  if (slots.some((slot) => slot.hostUid !== uid))
    throw new HttpsError(
      "permission-denied",
      "You can change only your own meeting slots.",
    );
  return [
    ...(event.hostSlots || []).filter((slot) => slot.hostUid !== uid),
    ...slots,
  ].sort((a, b) => a.startAt - b.startAt);
}
export function hostAssignment(eventId, event, uid) {
  return {
    eventId,
    hostUid: uid,
    ownerId: event.ownerId,
    title: event.title,
    duration: event.duration,
    active: event.active,
    schedulingMode: event.schedulingMode,
    hostSlots: (event.hostSlots || []).filter((slot) => slot.hostUid === uid),
    updatedAt: Date.now(),
  };
}
