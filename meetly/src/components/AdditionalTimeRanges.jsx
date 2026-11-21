import React from "react";
export function AdditionalTimeRanges({ value = [], onChange, label }) {
  return (
    <div className="additional-time-ranges">
      {value.map((range, index) => (
        <fieldset className="host-schedule-section" key={index}>
          <legend>Additional time range {index + 1}</legend>
          <div className="form-row">
            {[
              ["start", "Starts"],
              ["end", "Ends"],
            ].map(([key, title]) => (
              <label key={key}>
                {title}
                <input
                  type="time"
                  aria-label={`${label} additional range ${index + 1} ${title}`}
                  value={range[key]}
                  onChange={(e) =>
                    onChange(
                      value.map((old, i) =>
                        i === index ? { ...old, [key]: e.target.value } : old,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove time range
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="secondary"
        onClick={() => onChange([...value, { start: "20:30", end: "00:00" }])}
      >
        Add another time range
      </button>
      <p className="small-text">
        An end time of 12:00 AM means midnight at the end of the selected day.
      </p>
    </div>
  );
}
