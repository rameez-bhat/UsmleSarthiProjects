// Keep the selected team and its per-event permissions consistent at every save entry point.
export function delegatedEventInput(input, organizerUid) {
  const teamHostUids = [
    ...new Set(
      (input.teamHostUids || []).filter(
        (uid) => typeof uid === "string" && uid !== organizerUid,
      ),
    ),
  ];
  const selfSchedulingHostUids = [
    ...new Set(
      (input.selfSchedulingHostUids || []).filter(
        (uid) => uid !== organizerUid && teamHostUids.includes(uid),
      ),
    ),
  ];
  if (!selfSchedulingHostUids.length)
    return { ...input, teamHostUids, selfSchedulingHostUids };
  if (input.participantUids?.length)
    throw new Error(
      "Self-scheduling hosts need a meeting with per-host dates and times, without preassigned attendees.",
    );
  let hostSlots = input.hostSlots || [];
  if (
    input.schedulingMode === "fixed" &&
    !hostSlots.length &&
    input.meetingDate &&
    input.meetingTime &&
    organizerUid
  )
    hostSlots = [
      {
        hostUid: organizerUid,
        date: input.meetingDate,
        time: input.meetingTime,
        timezone: input.meetingTimezone || "UTC",
      },
    ];
  return {
    ...input,
    teamHostUids,
    selfSchedulingHostUids,
    hostSlots,
    multipleHostTimes: true,
    schedulingMode: "host-slots",
    assignmentMode: "host-choice",
    scheduleCategory:
      input.scheduleCategory || input.schedulingMode || "host-slots",
  };
}
