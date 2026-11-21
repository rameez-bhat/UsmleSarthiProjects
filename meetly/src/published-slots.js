import { isGroupHostEnabled } from "../shared/group-hosts.js";
import { wallTimeToMillis } from "./shared/utils";
export function publishedSlots(event, now = Date.now()) {
  let fixedStart = event.fixedStartAt;
  if (typeof fixedStart?.toMillis === "function")
    fixedStart = fixedStart.toMillis();
  else if (typeof fixedStart?.seconds === "number")
    fixedStart = fixedStart.seconds * 1000;
  else if (typeof fixedStart === "string")
    fixedStart = /^\d+$/.test(fixedStart)
      ? Number(fixedStart)
      : Date.parse(fixedStart);
  if (!Number.isFinite(fixedStart) && event.meetingDate && event.meetingTime) {
    try {
      fixedStart = wallTimeToMillis(
        event.meetingDate,
        event.meetingTime,
        event.meetingTimezone || "UTC",
      );
    } catch {
      fixedStart = NaN;
    }
  }
  const rows =
    event.schedulingMode === "fixed"
      ? [
          {
            hostUid: event.ownerId,
            hostName: event.hostName || "Organizer",
            startAt: fixedStart,
            timezone: event.meetingTimezone || "UTC",
          },
        ]
      : event.hostSlots || [];
  const slots = rows
    .filter(
      (row) =>
        isGroupHostEnabled(event, row.hostUid) &&
        Number.isFinite(row.startAt) &&
        row.startAt > now &&
        row.startAt >= now + Number(event.minNotice || 0) * 60000 &&
        event.active !== false,
    )
    .map((row) => ({
      start: row.startAt,
      end: row.startAt + event.duration * 60000,
      hostUid: row.hostUid,
      hostName: row.hostName || "Host",
      timezone: row.timezone || "UTC",
    }));
  const ids = [
    ...new Set(
      [
        event.ownerId,
        ...(event.teamHostUids || []),
        ...slots.map((slot) => slot.hostUid),
      ].filter((uid) => uid && isGroupHostEnabled(event, uid)),
    ),
  ];
  return {
    timezone: "UTC",
    provisional: true,
    slots: slots.sort((a, b) => a.start - b.start),
    hosts: ids.map((uid) => ({
      uid,
      name:
        event.groupHostNames?.[uid] ||
        rows.find((row) => row.hostUid === uid)?.hostName ||
        "Host",
      organizer: uid === event.ownerId,
    })),
  };
}
