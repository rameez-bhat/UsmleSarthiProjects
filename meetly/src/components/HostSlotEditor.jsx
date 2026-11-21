import { SavedSlotsCalendar } from "./SavedSlotsCalendar";
import { loadHostAvailability } from "../host-availability-direct";
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
  selfSchedulingHostUids = [],
  onSelfSchedulingChange,
}) {
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [savedDate, setSavedDate] = useState("");
  const dates = [
    ...new Set(value.map((slot) => slot.date).filter(Boolean)),
  ].sort();
  const activeDate = dates.includes(savedDate) ? savedDate : dates[0] || "";
  const savedRows = value
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.date === activeDate);
  const [hosts, setHosts] = useState({});
  const [availability, setAvailability] = useState({});
  const key = JSON.stringify(hostUids);
  useEffect(() => {
    let active = true;
    setAvailability({});
    if (live && hostUids.length) {
      loadHostAvailability(hostUids)
        .then((rows) => {
          if (active) setAvailability(rows);
        })
        .catch(() => {
          /* Server validates availability again on Save. */
        });
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
        Edit your saved appointments below, or use each host’s schedule card to
        add new dates and times. Saving keeps all appointments unless you remove
        them.
      </p>
      {!!value.length && (
        <section
          className="saved-host-appointments"
          aria-label="Saved appointments"
        >
          <h3>Saved appointments ({value.length})</h3>
          <div className="saved-slots-layout">
            <SavedSlotsCalendar
              slots={value}
              selected={activeDate}
              onSelect={(date) => {
                setSavedDate(date);
                setShowAllSaved(false);
              }}
            />
            <div className="saved-slots-day">
              <h4>Times on {activeDate}</h4>
              {(showAllSaved ? savedRows : savedRows.slice(0, 8)).map(
                ({ slot, index }) => {
                  const update = (field, next) => {
                    if (field === "date" && next) setSavedDate(next);
                    onChange(
                      value.map((old, i) => {
                        if (i !== index) return old;
                        // Recalculate derived UTC fields on save from the edited local date/time.
                        const { startAt, hostDate, ...editable } = old;
                        return { ...editable, [field]: next };
                      }),
                    );
                  };
                  const hostName =
                    slot.hostUid === organizer?.uid
                      ? organizer.name || "Organizer"
                      : hosts[slot.hostUid]?.name ||
                        hosts[slot.hostUid]?.email ||
                        "Host";
                  return (
                    <fieldset
                      className="host-schedule-card"
                      key={`${slot.hostUid}_${index}`}
                    >
                      <legend>
                        {hostName} · Saved appointment {index + 1}
                      </legend>
                      <div className="form-row">
                        <label>
                          Date
                          <input
                            type="date"
                            aria-label={`Saved appointment ${index + 1} date`}
                            required
                            value={slot.date || ""}
                            onChange={(e) => update("date", e.target.value)}
                          />
                        </label>
                        <label>
                          Start time
                          <input
                            type="time"
                            aria-label={`Saved appointment ${index + 1} time`}
                            required
                            value={slot.time || ""}
                            onChange={(e) => update("time", e.target.value)}
                          />
                        </label>
                        {slot.endTime && (
                          <label>
                            End time
                            <input
                              type="time"
                              aria-label={`Saved appointment ${index + 1} end time`}
                              required
                              value={slot.endTime}
                              onChange={(e) =>
                                update("endTime", e.target.value)
                              }
                            />
                          </label>
                        )}
                      </div>
                      <p className="small-text">
                        Time zone: {slot.timezone || timezone || "UTC"}
                      </p>
                      <button
                        type="button"
                        className="text-button"
                        aria-label={`Remove saved appointment ${index + 1}`}
                        onClick={() =>
                          onChange(value.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    </fieldset>
                  );
                },
              )}
              {savedRows.length > 8 && (
                <button
                  type="button"
                  className="secondary"
                  aria-expanded={showAllSaved}
                  onClick={() => setShowAllSaved((old) => !old)}
                >
                  {showAllSaved
                    ? "Show less"
                    : `Show more (${savedRows.length - 8} appointments)`}
                </button>
              )}
            </div>
          </div>
        </section>
      )}
      {hostUids.map((uid) => (
        <div key={uid}>
          {onSelfSchedulingChange && uid !== organizer?.uid && (
            <label className="check-row">
              <input
                type="checkbox"
                checked={selfSchedulingHostUids.includes(uid)}
                onChange={(e) =>
                  onSelfSchedulingChange(
                    e.target.checked
                      ? [...selfSchedulingHostUids, uid]
                      : selfSchedulingHostUids.filter((id) => id !== uid),
                  )
                }
              />
              Allow {hosts[uid]?.name || hosts[uid]?.email || "this host"} to
              manage their own slots for this meeting
            </label>
          )}
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
            availability={availability[uid]}
            value={value}
            onDraftChange={onDraftChange}
          />
        </div>
      ))}
    </div>
  );
}
