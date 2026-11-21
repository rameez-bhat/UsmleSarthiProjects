import { PhoneContact } from "../components/PhoneContact";
import React, { useState, useEffect } from "react";
import { live, api } from "../firebase";
export function MyMeetings({ uid }) {
  const [meetings, setMeetings] = useState(null),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setMeetings(null);
    setError("");
    if (!live) {
      setMeetings([]);
      return;
    }
    api("MyMeetings")
      .then((data) => {
        if (active) setMeetings(data.meetings);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [uid, version]);
  const [responding, setResponding] = useState(null);
  const respond = async (id, response) => {
    setResponding(id);
    setError("");
    try {
      await api("RespondInvitation", {
        id,
        response,
      });
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setResponding(null);
    }
  };
  const [view, setView] = useState("upcoming");
  const visible = (meetings || [])
    .filter(
      (m) =>
        view === "all" ||
        (view === "invited"
          ? m.status === "invited"
          : view === "past"
            ? m.startAt < Date.now()
            : m.startAt >= Date.now()),
    )
    .sort((a, b) =>
      view === "past" ? b.startAt - a.startAt : a.startAt - b.startAt,
    );
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <section className="meetings-dashboard">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SCHEDULE</span>
          <h1>My meetings</h1>
          <p>Your scheduled meetings · Times shown in {zone}</p>
        </div>
        <button className="secondary" onClick={() => setVersion((v) => v + 1)}>
          Refresh
        </button>
      </div>
      <div className="schedule-tabs" role="group" aria-label="Filter meetings">
        {[
          ["upcoming", "Upcoming"],
          ["invited", "Invitations"],
          ["past", "Past"],
          ["all", "All meetings"],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            aria-pressed={view === key}
            className={view === key ? "active" : ""}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : !meetings ? (
        <p role="status">Loading your meetings…</p>
      ) : !visible.length ? (
        <div className="schedule-empty">
          <span aria-hidden="true">◷</span>
          <h2>No {view === "all" ? "scheduled" : view} meetings</h2>
          <p>Your meetings will appear here when booked or invited.</p>
        </div>
      ) : (
        <div className="meeting-card-grid">
          {visible.map((m) => (
            <article className="schedule-card meeting-tile" key={m.id}>
              <div className="meeting-tile-top">
                <div className="meeting-date-stamp">
                  <span>
                    {new Date(m.startAt).toLocaleDateString(undefined, {
                      month: "short",
                    })}
                  </span>
                  <strong>{new Date(m.startAt).getDate()}</strong>
                </div>
                <span
                  className={`schedule-status ${m.status === "invited" ? "pending" : ""}`}
                >
                  {m.status === "invited" ? "Invitation" : m.status}
                </span>
              </div>
              <h2>{m.eventTitle}</h2>
              <p>With {m.hostName}</p>
              <p>
                {new Date(m.startAt).toLocaleString()} –{" "}
                {new Date(m.endAt).toLocaleTimeString()} · {zone}
              </p>
              <p>
                {m.status === "invited"
                  ? "Invitation awaiting your response"
                  : m.status}
              </p>
              {m.status === "invited" && m.startAt > Date.now() && (
                <div className="invite-actions">
                  <button
                    className="primary"
                    disabled={responding === m.id}
                    onClick={() => respond(m.id, "accepted")}
                  >
                    Accept invitation
                  </button>
                  <button
                    className="secondary"
                    disabled={responding === m.id}
                    onClick={() => respond(m.id, "declined")}
                  >
                    Decline invitation
                  </button>
                </div>
              )}
              {m.status === "confirmed" && (
                <PhoneContact instructions={m.meetingUrl || m.locationValue} />
              )}
              {m.status === "confirmed" &&
                (/^https:\/\//i.test(m.meetingUrl) ? (
                  <a
                    className="primary"
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join meeting
                  </a>
                ) : (
                  <p>
                    {m.meetingUrl ||
                      (m.syncStatus === "error"
                        ? "Joining instructions are being updated. Contact your host."
                        : "Joining instructions will appear here.")}
                  </p>
                ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
