export function isGroupHostEnabled(event, uid) {
  return (
    event.eventKind !== "group" || !(event.disabledHostUids || []).includes(uid)
  );
}
export function activeGroupEvent(event) {
  if (event.eventKind !== "group") return event;
  return {
    ...event,
    teamHostUids: (event.teamHostUids || []).filter((uid) =>
      isGroupHostEnabled(event, uid),
    ),
    hostSlots: (event.hostSlots || []).filter((slot) =>
      isGroupHostEnabled(event, slot.hostUid),
    ),
  };
}
