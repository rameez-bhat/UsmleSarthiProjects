import React, { useState } from "react";
export function DateRangeCalendar({
  from,
  to,
  onChange,
  label = "Date range",
}) {
  const [month, setMonth] = useState(
    (from || new Date().toISOString().slice(0, 10)).slice(0, 7),
  );
  const [choosingEnd, setChoosingEnd] = useState(false);
  const date = new Date(`${month}-01T12:00:00Z`);
  const count = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const offset = (date.getUTCDay() + 6) % 7;
  const move = (step) =>
    setMonth(
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + step, 1))
        .toISOString()
        .slice(0, 7),
    );
  return (
    <section className="range-calendar" aria-label={label}>
      <div className="range-calendar-heading">
        <button
          type="button"
          className="secondary"
          aria-label={`${label} previous month`}
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
          aria-label={`${label} next month`}
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <p className="small-text">
        {choosingEnd
          ? "Choose the end date"
          : "Choose the start date, then the end date"}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,minmax(0,1fr))",
          gap: 4,
        }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={`day${i}`}
            aria-hidden="true"
            style={{ textAlign: "center" }}
          >
            {d}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const d = `${month}-${String(i + 1).padStart(2, "0")}`;
          const chosen = !!from && d >= from && d <= (to || from);
          return (
            <button
              type="button"
              key={d}
              aria-label={`${label} ${d}`}
              aria-pressed={chosen}
              className="secondary"
              style={{
                padding: "8px 2px",
                background: chosen ? "#176b57" : undefined,
                color: chosen ? "white" : undefined,
              }}
              onClick={() => {
                if (!choosingEnd || d < from) {
                  onChange(d, "");
                  setChoosingEnd(true);
                } else {
                  onChange(from, d);
                  setChoosingEnd(false);
                }
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </section>
  );
}
