import React, { useState, useEffect } from "react";
import { hostScheduleOptions } from "../host-schedule-options";
import { zones } from "../shared/utils";
export function HostScheduleOptions({
  uid,
  name,
  timezone,
  duration,
  value,
  onDraftChange,
}) {
  const [config, setConfig] = useState({
    hostUid: uid,
    timezone: timezone || "UTC",
    dateMode: "single",
    dates: [""],
    from: "",
    to: "",
    timeMode: "range",
    times: ["09:00"],
    endTime: "11:30",
  });
  const [removedSlots, setRemovedSlots] = useState([]);
  const slotKey = (slot) => `${slot.date}|${slot.time}`;
  const removeSlots = (slots) =>
    setRemovedSlots((old) => [...new Set([...old, ...slots.map(slotKey)])]);
  const removeEntry = (key, index) =>
    setConfig((old) => {
      const next = old[key].filter((_, i) => i !== index);
      return { ...old, [key]: next.length ? next : [""] };
    });
  const change = (key, next) => setConfig((old) => ({ ...old, [key]: next }));
  let preview = [],
    previewError = "";
  try {
    preview = hostScheduleOptions(config, duration).filter(
      (slot) => !removedSlots.includes(slotKey(slot)),
    );
    if (!preview.length) previewError = "Choose at least one meeting time.";
  } catch (problem) {
    previewError = problem.message;
  }
  const days = [...new Set(preview.map((slot) => slot.date))];
  const dirty = config.dates.some(Boolean) || !!config.from || !!config.to;
  const draftKey = JSON.stringify({
    slots: preview,
    error: dirty ? previewError : "",
    dirty,
  });
  useEffect(() => {
    onDraftChange?.(uid, JSON.parse(draftKey));
  }, [uid, draftKey, onDraftChange]);

  return (
    <fieldset className="host-schedule-card">
      <legend>{name}</legend>
      <p className="host-schedule-meta">
        {duration} minute appointments ·{" "}
        {value.filter((slot) => slot.hostUid === uid).length} existing saved
        choices
      </p>
      <div className="host-schedule-section">
        <h4>1. Choose dates</h4>
        <label>
          Date selection
          <select
            value={config.dateMode}
            onChange={(e) => change("dateMode", e.target.value)}
          >
            <option value="single">Single date</option>
            <option value="multiple">Multiple dates</option>
            <option value="range">Date range</option>
          </select>
        </label>
        {config.dateMode === "range" ? (
          <div className="form-row">
            <label>
              From date
              <input
                type="date"
                value={config.from}
                onChange={(e) => change("from", e.target.value)}
              />
            </label>
            <label>
              Through date
              <input
                type="date"
                value={config.to}
                onChange={(e) => change("to", e.target.value)}
              />
            </label>
          </div>
        ) : (
          <>
            {(config.dateMode === "single"
              ? config.dates.slice(0, 1)
              : config.dates
            ).map((date, index) => (
              <div className="schedule-input-row" key={index}>
                <label>
                  Date {index + 1}
                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      change(
                        "dates",
                        config.dates.map((old, i) =>
                          i === index ? e.target.value : old,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="secondary"
                  aria-label={`Remove date ${index + 1} for ${name}`}
                  onClick={() => removeEntry("dates", index)}
                >
                  Remove date
                </button>
              </div>
            ))}
            {config.dateMode === "multiple" && (
              <button
                type="button"
                className="secondary"
                onClick={() => change("dates", [...config.dates, ""])}
              >
                Add date for {name}
              </button>
            )}
          </>
        )}
      </div>
      <div className="host-schedule-section">
        <h4>2. Choose times</h4>
        <label>
          Time selection
          <select
            value={config.timeMode}
            onChange={(e) => change("timeMode", e.target.value)}
          >
            <option value="single">Single time</option>
            <option value="multiple">Multiple times</option>
            <option value="range">Time range</option>
          </select>
        </label>
        {(config.timeMode === "multiple"
          ? config.times
          : config.times.slice(0, 1)
        ).map((time, index) => (
          <div className="schedule-input-row" key={index}>
            <label>
              {config.timeMode === "range" ? "Range starts" : "Start time"}{" "}
              {index + 1}
              <input
                type="time"
                value={time}
                onChange={(e) =>
                  change(
                    "times",
                    config.times.map((old, i) =>
                      i === index ? e.target.value : old,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="secondary"
              aria-label={`Remove time ${index + 1} for ${name}`}
              onClick={() => removeEntry("times", index)}
            >
              Remove time
            </button>
          </div>
        ))}
        {config.timeMode === "multiple" && (
          <button
            type="button"
            className="secondary"
            onClick={() => change("times", [...config.times, ""])}
          >
            Add time for {name}
          </button>
        )}
        {config.timeMode === "range" && (
          <label>
            Range ends
            <input
              type="time"
              value={config.endTime}
              onChange={(e) => change("endTime", e.target.value)}
            />
          </label>
        )}
      </div>
      <label>
        Host schedule time zone
        <select
          value={config.timezone}
          onChange={(e) => change("timezone", e.target.value)}
        >
          {[...new Set([config.timezone, ...zones])].map((zone) => (
            <option key={zone}>{zone}</option>
          ))}
        </select>
      </label>
      <p>
        These time choices repeat on each selected date, using {duration} minute
        meetings. Save the event to include the previewed choices. Existing
        published choices are retained.
      </p>
      <section
        className="host-schedule-preview"
        aria-label={`Schedule preview for ${name}`}
      >
        <h4>
          3. Preview · {preview.length} appointments on {days.length} dates
        </h4>
        {preview.length ? (
          days.slice(0, 8).map((date) => (
            <div key={date} className="host-schedule-preview-day">
              <strong>
                {new Intl.DateTimeFormat(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${date}T12:00:00Z`))}
              </strong>
              <button
                type="button"
                className="text-button"
                aria-label={`Remove all times on ${date} for ${name}`}
                onClick={() =>
                  removeSlots(preview.filter((slot) => slot.date === date))
                }
              >
                Remove date
              </button>
              <div>
                {preview
                  .filter((slot) => slot.date === date)
                  .map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      className="schedule-slot-remove"
                      aria-label={`Remove ${slot.time} on ${slot.date} for ${name}`}
                      onClick={() => removeSlots([slot])}
                    >
                      {slot.time} ×
                    </button>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <p>{previewError}</p>
        )}
        {days.length > 8 && <p>And {days.length - 8} more dates.</p>}
      </section>
      {!!removedSlots.length && (
        <button
          type="button"
          className="secondary"
          onClick={() => setRemovedSlots([])}
        >
          Restore removed preview times
        </button>
      )}
      <p className="small-text">
        Click a preview time to remove that appointment, or Remove date to
        remove all its times. The previewed appointments are included
        automatically when you save the event.
      </p>
    </fieldset>
  );
}
