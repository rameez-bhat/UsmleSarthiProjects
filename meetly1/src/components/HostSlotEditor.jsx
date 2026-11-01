import { HostScheduleOptions } from "./HostScheduleOptions";
import React, { useState, useEffect } from "react";
import { live } from "../firebase";
import { selectedUsersDirect } from "../user-search-direct";
export function HostSlotEditor({
  hostUids,
  value,
  onChange,
  timezone,
  organizer,
  duration = 30,
  onDraftChange,
}) {
  const [hosts, setHosts] = useState({});
  const key = JSON.stringify(hostUids);
  useEffect(() => {
    let active = true;
    if (live && hostUids.length) {
      selectedUsersDirect(hostUids)
        .then((data) => {
          if (active)
            setHosts(Object.fromEntries(data.users.map((h) => [h.uid, h])));
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [key]);
  return (
    <div className="host-slot-editor">
      <p>
        Choose dates and times in each host's schedule card. Save includes the
        previewed appointments automatically.
      </p>
      {hostUids.map((uid) => (
        <HostScheduleOptions
          key={uid}
          uid={uid}
          name={
            uid === organizer?.uid
              ? `${organizer.name || "Organizer"} (Organizer)`
              : hosts[uid]?.name || hosts[uid]?.email || "Host"
          }
          timezone={timezone}
          duration={duration}
          value={value}
          onDraftChange={onDraftChange}
        />
      ))}
      {!!value.length && (
        <details className="saved-host-appointments">
          <summary>Existing saved appointments ({value.length})</summary>
          <ul>
            {value.map((slot, index) => (
              <li key={`${slot.hostUid}_${slot.date}_${slot.time}_${index}`}>
                <span>
                  {slot.hostUid === organizer?.uid
                    ? organizer.name || "Organizer"
                    : hosts[slot.hostUid]?.name ||
                      hosts[slot.hostUid]?.email ||
                      "Host"}{" "}
                  · {slot.date || "Incomplete date"} ·{" "}
                  {slot.time || "Incomplete time"}
                  {slot.endTime ? `–${slot.endTime}` : ""} ·{" "}
                  {slot.timezone || timezone || "UTC"}
                </span>
                <button
                  type="button"
                  className="text-button"
                  aria-label={`Remove saved appointment ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
