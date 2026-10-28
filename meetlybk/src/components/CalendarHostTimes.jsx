import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react";
import { dateInZone, time } from "../shared/utils";

export function CalendarHostTimes({
  slots,
  hosts,
  zone,
  selected,
  onSelect,
  onDateChange,
  visibleMonth,
  onMonthChange,
  minMonth,
  maxMonth,
}) {
  const slotsByDate = useMemo(() => {
    const groups = new Map();
    for (const slot of slots) {
      const date = dateInZone(slot.start, zone);
      if (visibleMonth && !date.startsWith(visibleMonth)) continue;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date).push(slot);
    }
    return groups;
  }, [slots, zone, visibleMonth]);
  const dates = [...slotsByDate.keys()].sort();
  const dateKey = dates.join("|");
  const [day, setDay] = useState(() => dates[0] || "");
  const [month, setMonth] = useState("");
  useEffect(() => {
    const next = selected
      ? dateInZone(selected.start, zone)
      : dates.includes(day)
        ? day
        : dates[0] || "";
    setDay(next);
    setMonth((next || dateInZone(Date.now(), zone)).slice(0, 7));
  }, [dateKey, zone]);
  const viewMonth =
    visibleMonth ||
    month ||
    (dates[0] || dateInZone(Date.now(), zone)).slice(0, 7);
  const [year, monthNumber] = viewMonth.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const label = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(first);
  const shiftMonth = (by) => {
    const next = new Date(Date.UTC(year, monthNumber - 1 + by, 1));
    const nextMonth = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    setMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };
  const daySlots = slotsByDate.get(day) || [];
  const dayLabel = day
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${day}T12:00:00Z`))
    : "Choose an available date";
  return (
    <div className="team-calendar-layout">
      <section className="team-calendar" aria-label="Available meeting dates">
        <div className="team-calendar-title">
          <span className="eyebrow">01 / CHOOSE A DATE</span>
          <CalendarDays size={20} />
        </div>
        <div className="team-month-navigation">
          <button
            type="button"
            aria-label="Previous available month"
            disabled={
              viewMonth <=
              (onMonthChange ? minMonth : dates[0]?.slice(0, 7) || viewMonth)
            }
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 aria-live="polite">{label}</h2>
          <button
            type="button"
            aria-label="Next available month"
            disabled={
              viewMonth >=
              (onMonthChange
                ? maxMonth
                : dates.at(-1)?.slice(0, 7) || viewMonth)
            }
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="team-calendar-weekdays" aria-hidden="true">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="team-calendar-days">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const iso = `${viewMonth}-${String(i + 1).padStart(2, "0")}`;
            const count = slotsByDate.get(iso)?.length || 0;
            return (
              <button
                type="button"
                key={iso}
                disabled={!count}
                aria-pressed={day === iso}
                aria-label={`${iso}, ${count} available times`}
                className={`${count ? "has-times" : ""} ${day === iso ? "selected" : ""}`}
                onClick={() => {
                  setDay(iso);
                  onDateChange?.();
                }}
              >
                <span>{i + 1}</span>
                {count > 0 && <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="team-calendar-legend">
          <i /> Highlighted dates have available meetings
        </p>
        <p className="team-calendar-zone">
          Times shown in <strong>{zone}</strong>
        </p>
      </section>
      <section
        className="team-day-slots"
        aria-label="Hosts and times for selected date"
      >
        <span className="eyebrow">02 / CHOOSE YOUR HOST & TIME</span>
        <h2>{dayLabel}</h2>
        <p className="muted">
          {daySlots.length} available {daySlots.length === 1 ? "time" : "times"}{" "}
          · Choose who you would like to meet.
        </p>
        {hosts.map((host) => {
          const available = daySlots.filter((s) => s.hostUid === host.uid);
          return (
            <section key={host.uid} className="team-host-card">
              <div className="team-host-heading">
                <span className="team-host-avatar" aria-hidden="true">
                  {host.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <h3>
                    {host.name}
                    {host.organizer ? " (Organizer)" : ""}
                  </h3>
                  <p>
                    {available.length
                      ? `${available.length} times available`
                      : "No available times on this date"}
                  </p>
                </div>
              </div>
              <div className="team-time-buttons">
                {available.map((slot) => (
                  <button
                    type="button"
                    aria-label={`${host.name}, ${time(slot.start, zone)} – ${time(slot.end, zone)}`}
                    key={`${slot.hostUid}_${slot.start}`}
                    aria-pressed={
                      selected?.hostUid === slot.hostUid &&
                      selected?.start === slot.start
                    }
                    className={
                      selected?.hostUid === slot.hostUid &&
                      selected?.start === slot.start
                        ? "selected"
                        : ""
                    }
                    onClick={() => onSelect(slot)}
                  >
                    <Clock size={14} />
                    {time(slot.start, zone)}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!slots.length && (
          <p>
            No bookable times are available for this schedule right now.
            Published times may be booked, past the booking cutoff, or blocked
            by a connected calendar.
          </p>
        )}
      </section>
    </div>
  );
}
