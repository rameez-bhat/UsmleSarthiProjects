import React, { useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { fmt, time } from "../shared/utils";
import { Clock, RefreshCw, Download, CalendarDays } from "lucide-react";
import { MeetingEmails } from "../components/MeetingEmails";
export function Bookings({
  bookings,
  zone,
  cancel,
  download,
  retry,
  viewAttendee,
}) {
  const [tab, setTab] = useState("Upcoming"),
    [search, setSearch] = useState("");
  const filtered = bookings.filter(
    (b) =>
      (tab === "Cancelled"
        ? b.status === "cancelled"
        : b.status === "confirmed" &&
          (tab === "Upcoming"
            ? b.startAt >= Date.now()
            : b.startAt < Date.now())) &&
      `${b.attendeeName} ${b.attendeeEmail} ${b.eventTitle}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="A LITTLE CLARITY FOR YOUR DAY"
        title="Your meetings, in view."
        text={`All times shown in ${zone}.`}
      />
      <div className="list-toolbar">
        <div className="tabs">
          {["Upcoming", "Past", "Cancelled"].map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="Search names or meetings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="bookings-list">
        {filtered.length ? (
          filtered.map((b) => (
            <article className="booking-row" key={b.id}>
              <div className="date-badge">
                <strong>
                  {fmt(b.startAt, zone, {
                    month: undefined,
                  })}
                </strong>
                <span>
                  {fmt(b.startAt, zone, {
                    day: undefined,
                  })}
                </span>
              </div>
              <div className="booking-info">
                <h3>{b.eventTitle}</h3>
                <p>
                  {b.attendeeName} <span>·</span> {b.attendeeEmail}
                </p>
                <span>
                  <Clock size={14} />
                  {time(b.startAt, zone)} – {time(b.endAt, zone)}
                </span>
                {b.participants?.length > 0 && (
                  <p>
                    {
                      b.participants.filter((p) => p.response === "accepted")
                        .length
                    }{" "}
                    confirmed ·{" "}
                    {
                      b.participants.filter(
                        (p) => !p.response || p.response === "invited",
                      ).length
                    }{" "}
                    awaiting response ·{" "}
                    {
                      b.participants.filter((p) => p.response === "declined")
                        .length
                    }{" "}
                    declined
                  </p>
                )}
                {b.notes && <p>{b.notes}</p>}
                {b.answers?.filter(Boolean).length > 0 && (
                  <p>{b.answers.filter(Boolean).join(" · ")}</p>
                )}
              </div>
              <div className="booking-actions">
                <MeetingEmails booking={b} />
                {b.status === "confirmed" &&
                  /^https:\/\//i.test(
                    b.meetingUrl || b.locationValue || "",
                  ) && (
                    <a
                      className="primary"
                      href={b.meetingUrl || b.locationValue}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join meeting
                    </a>
                  )}
                <button className="secondary" onClick={() => viewAttendee(b)}>
                  View attendee details
                </button>
                <span
                  className={
                    "badge " + (b.status === "cancelled" ? "neutral" : "")
                  }
                >
                  {b.status}
                </span>
                {b.syncStatus === "synced" && (
                  <small className="muted">
                    {b.externalIds?.google
                      ? "Google Calendar synced"
                      : b.externalIds?.microsoft
                        ? "Outlook calendar synced"
                        : "No external calendar appointment linked"}
                  </small>
                )}
                {b.syncStatus === "error" ? (
                  <button className="danger-text" onClick={() => retry(b)}>
                    <RefreshCw size={14} />
                    Retry calendar sync
                  </button>
                ) : b.syncStatus === "pending" ? (
                  <small className="muted">Calendar sync pending</small>
                ) : null}
                <button className="text-button" onClick={() => download(b)}>
                  <Download size={15} />
                  Calendar file
                </button>
                {b.status === "confirmed" && b.startAt > Date.now() && (
                  <button className="danger-text" onClick={() => cancel(b)}>
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="empty">
            <CalendarDays size={34} />
            <h2>
              No {tab.toLowerCase()} meetings
              {search ? " match your search" : ""}.
            </h2>
            <p>Your bookings will appear here as people reserve a time.</p>
          </div>
        )}
      </div>
    </>
  );
}
