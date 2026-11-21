import React, { useState, useEffect } from "react";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { fitsAvailabilityPreview } from "../host-availability-preview";
import { compileScheduleBlocks } from "../schedule-blocks";
import { zones } from "../shared/utils";
const newBlock = () => ({
  dateMode: "range",
  dates: [""],
  from: "",
  to: "",
  ranges: [{ start: "09:00", end: "11:30" }],
});
export function HostScheduleOptions({
  uid,
  name,
  timezone,
  duration,
  value,
  onDraftChange,
  availability,
}) {
  const [blocks, setBlocks] = useState(() => [newBlock()]);
  const [zone, setZone] = useState(timezone || "UTC");
  const [removed, setRemoved] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const update = (index, patch) =>
    setBlocks((old) =>
      old.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    );
  let slots = [],
    replaceDates = [],
    error = "",
    excluded = 0;
  const dirty = blocks.some((b) =>
    b.dateMode === "range" ? b.from || b.to : b.dates.some(Boolean),
  );
  try {
    const compiled = compileScheduleBlocks(blocks, uid, zone, duration);
    replaceDates = compiled.replaceDates;
    slots = compiled.slots.filter(
      (s) => !removed.includes(`${s.date}|${s.time}`),
    );
    if (availability) {
      const before = slots.length;
      slots = slots.filter((s) =>
        fitsAvailabilityPreview(s, availability, duration),
      );
      excluded = before - slots.length;
    }
    if (dirty && !slots.length)
      error = "No appointments fit the selected times and host availability.";
  } catch (problem) {
    error = problem.message;
  }
  const key = JSON.stringify({
    hostUid: uid,
    slots,
    replaceDates,
    error: dirty ? error : "",
    dirty: !!dirty,
  });
  useEffect(() => {
    onDraftChange?.(uid, JSON.parse(key));
  }, [uid, key, onDraftChange]);
  const days = [...new Set(slots.map((s) => s.date))].sort();
  return (
    <fieldset className="host-schedule-card">
      <legend>{name}</legend>
      <p>
        {duration} minute appointments ·{" "}
        {value.filter((s) => s.hostUid === uid).length} saved choices
      </p>
      <p>
        Each block has its own times and dates. Later blocks replace earlier
        blocks on matching dates, including previously saved times for those
        dates.
      </p>
      <label>
        Host schedule time zone
        <select value={zone} onChange={(e) => setZone(e.target.value)}>
          {[...new Set([zone, ...zones])].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </label>
      {blocks.map((block, index) => (
        <fieldset key={index} className="host-schedule-section">
          <legend>
            Schedule block {index + 1}
            {index > 0 ? " · Overrides matching dates above" : ""}
          </legend>
          <h4>1. Choose time ranges</h4>
          {block.ranges.map((range, ri) => (
            <div key={ri} className="form-row">
              {[
                ["start", "Starts"],
                ["end", "Ends"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}
                  <input
                    type="time"
                    aria-label={`Block ${index + 1} time range ${ri + 1} ${label}`}
                    value={range[field]}
                    onChange={(e) =>
                      update(index, {
                        ranges: block.ranges.map((r, i) =>
                          i === ri ? { ...r, [field]: e.target.value } : r,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  update(index, {
                    ranges: block.ranges.filter((_, i) => i !== ri),
                  })
                }
              >
                Remove time range
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            onClick={() =>
              update(index, {
                ranges: [...block.ranges, { start: "20:30", end: "00:00" }],
              })
            }
          >
            Add time range
          </button>
          <p className="small-text">
            12:00 AM as the end time means midnight at the end of the day.
          </p>
          <h4>2. Apply these times to dates</h4>
          <label>
            Date selection
            <select
              value={block.dateMode}
              onChange={(e) => update(index, { dateMode: e.target.value })}
            >
              <option value="range">Date range</option>
              <option value="multiple">Multiple dates</option>
              <option value="single">Single date</option>
            </select>
          </label>
          {block.dateMode === "range" ? (
            <div className="range-editor-row">
              <DateRangeCalendar
                label={`${name} block ${index + 1}`}
                from={block.from}
                to={block.to}
                onChange={(from, to) => update(index, { from, to })}
              />
              <div className="range-editor-fields">
                {[
                  ["from", "From date"],
                  ["to", "Through date"],
                ].map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      type="date"
                      value={block[field]}
                      onChange={(e) =>
                        update(index, { [field]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(block.dateMode === "single"
                ? block.dates.slice(0, 1)
                : block.dates
              ).map((date, di) => (
                <div className="schedule-input-row" key={di}>
                  <label>
                    Date {di + 1}
                    <input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        update(index, {
                          dates: block.dates.map((d, i) =>
                            i === di ? e.target.value : d,
                          ),
                        })
                      }
                    />
                  </label>
                  {block.dateMode === "multiple" && (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        update(index, {
                          dates: block.dates.filter((_, i) => i !== di),
                        })
                      }
                    >
                      Remove date
                    </button>
                  )}
                </div>
              ))}
              {block.dateMode === "multiple" && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => update(index, { dates: [...block.dates, ""] })}
                >
                  Add date
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setBlocks((old) => old.filter((_, i) => i !== index))
            }
          >
            Remove schedule block {index + 1}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="secondary"
        onClick={() => setBlocks((old) => [...old, newBlock()])}
      >
        Add schedule block
      </button>
      <section className="host-schedule-preview">
        <h4>
          Preview · {slots.length} appointments on {days.length} dates
        </h4>
        {error && <p role="status">{error}</p>}
        {(showAll ? days : days.slice(0, 8)).map((date) => (
          <div key={date} className="host-schedule-preview-day">
            <strong>{date}</strong>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setRemoved((old) => [
                  ...old,
                  ...slots
                    .filter((s) => s.date === date)
                    .map((s) => `${s.date}|${s.time}`),
                ])
              }
            >
              Remove date
            </button>
            <div>
              {slots
                .filter((s) => s.date === date)
                .map((s) => (
                  <button
                    type="button"
                    key={s.time}
                    className="schedule-slot-remove"
                    onClick={() =>
                      setRemoved((old) => [...old, `${s.date}|${s.time}`])
                    }
                  >
                    {s.time} ×
                  </button>
                ))}
            </div>
          </div>
        ))}
        {days.length > 8 && (
          <button
            type="button"
            className="secondary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : `Show ${days.length - 8} more dates`}
          </button>
        )}
      </section>
      {!!removed.length && (
        <button
          type="button"
          className="secondary"
          onClick={() => setRemoved([])}
        >
          Restore removed preview times
        </button>
      )}
      {availability && (
        <p role="status">
          {excluded} appointments outside this host’s Availability were
          automatically excluded.
        </p>
      )}
    </fieldset>
  );
}
