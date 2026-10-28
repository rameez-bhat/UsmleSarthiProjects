import React, { useState, useEffect } from "react";
import { live, api } from "../firebase";
import { zones } from "../shared/utils";
export function HostSlotEditor({
  hostUids,
  value,
  onChange,
  timezone,
  organizer,
}) {
  const [hosts, setHosts] = useState({});
  const key = JSON.stringify(hostUids);
  useEffect(() => {
    let active = true;
    if (live && hostUids.length) {
      api("SelectedUsers", {
        uids: hostUids,
      })
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
  const update = (index, field, content) =>
    onChange(
      value.map((slot, i) =>
        i === index
          ? {
              ...slot,
              [field]: content,
            }
          : slot,
      ),
    );
  return (
    <div className="host-slot-editor">
      <p>
        Add a separate date-and-time entry for each host appointment. For
        example, 25 October at 10:00 and 27 October at 14:30 are two independent
        entries. Each entry uses its own host and time zone.
      </p>
      {value.map((slot, index) => (
        <fieldset key={index}>
          <legend>Date & time {index + 1}</legend>
          <label>
            Host
            <select
              required
              value={slot.hostUid}
              onChange={(e) => update(index, "hostUid", e.target.value)}
            >
              {hostUids.map((uid) => (
                <option value={uid} key={uid}>
                  {uid === organizer?.uid
                    ? `${organizer.name || organizer.email || "Organizer"} (Organizer)`
                    : hosts[uid]?.name || hosts[uid]?.email || "Loading host…"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date and time
            <input
              type="datetime-local"
              required
              step="60"
              value={slot.date && slot.time ? `${slot.date}T${slot.time}` : ""}
              onChange={(e) => {
                const [date = "", time = ""] = e.target.value.split("T");
                onChange(
                  value.map((row, i) =>
                    i === index ? { ...row, date, time } : row,
                  ),
                );
              }}
            />
          </label>
          <label>
            Time zone
            <select
              value={slot.timezone || timezone || "UTC"}
              onChange={(e) => update(index, "timezone", e.target.value)}
            >
              {[
                ...new Set([timezone, slot.timezone, ...zones].filter(Boolean)),
              ].map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="danger-text"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove date and time
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="secondary"
        disabled={!hostUids.length || value.length >= 100}
        onClick={() =>
          onChange([
            ...value,
            {
              hostUid: value.at(-1)?.hostUid || hostUids[0],
              date: "",
              time: "09:00",
              timezone: value.at(-1)?.timezone || timezone || "UTC",
            },
          ])
        }
      >
        Add another date and time
      </button>
    </div>
  );
}
