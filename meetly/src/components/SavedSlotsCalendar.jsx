import React, { useState, useEffect } from "react";
export function SavedSlotsCalendar({ slots, selected, onSelect }) {
  const [month, setMonth] = useState(selected.slice(0, 7));
  useEffect(() => {
    if (selected) setMonth(selected.slice(0, 7));
  }, [selected]);
  const date = new Date(
    `${month || new Date().toISOString().slice(0, 7)}-01T12:00:00Z`,
  );
  const count = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const offset = (date.getUTCDay() + 6) % 7;
  const counts = new Map();
  for (const slot of slots)
    counts.set(slot.date, (counts.get(slot.date) || 0) + 1);
  const move = (step) =>
    setMonth(
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step, 1))
        .toISOString()
        .slice(0, 7),
    );
  return (
    <section
      className="saved-slots-calendar"
      aria-label="Saved appointment calendar"
    >
      <div className="saved-calendar-heading">
        <button
          type="button"
          className="secondary"
          aria-label="Previous saved month"
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <strong>
          {date.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </strong>
        <button
          type="button"
          className="secondary"
          aria-label="Next saved month"
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <div className="saved-calendar-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={`week${i}`} aria-hidden="true">
            {d}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const day = `${month}-${String(i + 1).padStart(2, "0")}`;
          const n = counts.get(day) || 0;
          return (
            <button
              type="button"
              key={day}
              disabled={!n}
              aria-label={`${day}, ${n} saved appointments`}
              aria-pressed={selected === day}
              className={`${n ? "has-slots" : ""} ${selected === day ? "selected" : ""}`}
              onClick={() => onSelect(day)}
            >
              {i + 1}
              {!!n && <small>{n}</small>}
            </button>
          );
        })}
      </div>
      <p className="small-text">
        Highlighted dates have saved times. Select a date to edit them.
      </p>
    </section>
  );
}
