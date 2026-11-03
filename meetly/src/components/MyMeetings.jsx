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
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>My meetings</h1>
          <p>Your scheduled meetings · Times shown in {zone}</p>
        </div>
        <button className="secondary" onClick={() => setVersion((v) => v + 1)}>
          Refresh
        </button>
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : !meetings ? (
        <p role="status">Loading your meetings…</p>
      ) : !meetings.length ? (
        <div className="empty">No scheduled meetings yet.</div>
      ) : (
        meetings.map((m) => (
          <article className="schedule-card" key={m.id}>
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
        ))
      )}
    </section>
  );
}
