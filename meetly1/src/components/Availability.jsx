import React, { useState, useEffect } from "react";
import { PageTitle } from "../components/PageTitle";
import { Globe, X, Plus, Check } from "lucide-react";
import { localDate } from "../shared/utils";
export function Availability({ profile, save }) {
  const [schedule, setSchedule] = useState(profile.schedule),
    [overrides, setOverrides] = useState(profile.overrides || {}),
    [date, setDate] = useState(""),
    [overrideStart, setOverrideStart] = useState("09:00"),
    [overrideEnd, setOverrideEnd] = useState("17:00"),
    [closed, setClosed] = useState(true);
  useEffect(() => {
    setSchedule(profile.schedule);
    setOverrides(profile.overrides || {});
  }, [profile]);
  return (
    <>
      <PageTitle
        eyebrow="A RHYTHM THAT WORKS FOR YOU"
        title="Make time yours."
        text="Set your usual hours and leave the rest of your day to you."
      />
      <div className="availability-layout">
        <div className="schedule-card">
          <div className="card-heading">
            <h2>Weekly hours</h2>
            <span>
              <Globe size={15} />
              {profile.timezone}
            </span>
          </div>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day, i) => {
            const key = String(i + 1),
              ranges = schedule[key] || [];
            return (
              <div className="day-row" key={day}>
                <label className="day-label">
                  <input
                    type="checkbox"
                    checked={!!ranges.length}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        [key]: e.target.checked
                          ? [
                              {
                                start: "09:00",
                                end: "17:00",
                              },
                            ]
                          : [],
                      })
                    }
                  />
                  {day}
                </label>
                <div className="day-ranges">
                  {ranges.length ? (
                    ranges.map((r, j) => (
                      <div className="time-range" key={j}>
                        <input
                          aria-label={`${day} start`}
                          type="time"
                          required
                          value={r.start}
                          onChange={(e) =>
                            setSchedule({
                              ...schedule,
                              [key]: ranges.map((x, k) =>
                                k === j
                                  ? {
                                      ...x,
                                      start: e.target.value,
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                        <span>—</span>
                        <input
                          aria-label={`${day} end`}
                          type="time"
                          required
                          value={r.end}
                          onChange={(e) =>
                            setSchedule({
                              ...schedule,
                              [key]: ranges.map((x, k) =>
                                k === j
                                  ? {
                                      ...x,
                                      end: e.target.value,
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                        <button
                          className="icon-button"
                          aria-label="Remove interval"
                          onClick={() =>
                            setSchedule({
                              ...schedule,
                              [key]: ranges.filter((_, k) => k !== j),
                            })
                          }
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="muted">Unavailable</span>
                  )}
                </div>
                <button
                  className="icon-button"
                  aria-label={`Add ${day} interval`}
                  disabled={ranges.length >= 6}
                  onClick={() =>
                    setSchedule({
                      ...schedule,
                      [key]: [
                        ...ranges,
                        {
                          start: "18:00",
                          end: "19:00",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={18} />
                </button>
              </div>
            );
          })}
          <div className="schedule-bottom">
            <p>Buffers and booking limits are set per event type.</p>
            <button
              className="primary"
              onClick={() =>
                save({
                  schedule,
                  overrides,
                })
              }
            >
              Save availability <Check size={16} />
            </button>
          </div>
        </div>
        <div className="overrides-card">
          <span className="eyebrow">FOR THE EXCEPTIONS</span>
          <h2>Date overrides</h2>
          <p>
            A day off, or a different rhythm. Overrides replace your weekly
            hours for that date.
          </p>
          <label>
            Date
            <input
              type="date"
              value={date}
              min={localDate()}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={closed}
              onChange={(e) => setClosed(e.target.checked)}
            />
            Unavailable all day
          </label>
          {!closed && (
            <div className="form-row">
              <input
                type="time"
                value={overrideStart}
                onChange={(e) => setOverrideStart(e.target.value)}
              />
              <input
                type="time"
                value={overrideEnd}
                onChange={(e) => setOverrideEnd(e.target.value)}
              />
            </div>
          )}
          <button
            className="secondary full"
            disabled={!date}
            onClick={() => {
              setOverrides({
                ...overrides,
                [date]: closed
                  ? []
                  : [
                      {
                        start: overrideStart,
                        end: overrideEnd,
                      },
                    ],
              });
              setDate("");
            }}
          >
            Add override <Plus size={16} />
          </button>
          <div className="override-list">
            {Object.entries(overrides)
              .sort()
              .map(([d, r]) => (
                <div key={d}>
                  <span>
                    {d}
                    <small>
                      {r.length
                        ? r.map((x) => `${x.start}–${x.end}`).join(", ")
                        : "Unavailable"}
                    </small>
                  </span>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${d}`}
                    onClick={() => {
                      const n = {
                        ...overrides,
                      };
                      delete n[d];
                      setOverrides(n);
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
          </div>
          <p className="small-text muted">
            Click “Save availability” to apply overrides.
          </p>
        </div>
      </div>
    </>
  );
}
