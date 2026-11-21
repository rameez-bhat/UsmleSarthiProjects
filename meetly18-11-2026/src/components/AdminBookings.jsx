import React, { useState, useEffect } from "react";
import { api } from "../firebase";
import { PageTitle } from "../components/PageTitle";
export function AdminBookings({ notify, viewAttendee }) {
  const [rows, setRows] = useState([]),
    [next, setNext] = useState(null),
    [busy, setBusy] = useState(false);
  const load = async (after = null) => {
    setBusy(true);
    try {
      const result = await api("AdminBookings", {
        after,
      });
      setRows((old) =>
        after ? [...old, ...result.bookings] : result.bookings,
      );
      setNext(result.next);
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION"
        title="Bookings across all hosts"
        text="Times are displayed in U.S. Eastern Time. This view is read only."
      />
      <button className="secondary" disabled={busy} onClick={() => load()}>
        Refresh
      </button>
      <div className="admin-bookings">
        {rows.map((b) => (
          <article className="admin-booking" key={b.id}>
            <h3>{b.eventTitle}</h3>
            <p>
              {b.attendeeName} · {b.attendeeEmail}
            </p>
            <p>Host: {b.hostName}</p>
            <p>
              {new Intl.DateTimeFormat("en-US", {
                timeZone: "America/New_York",
                dateStyle: "medium",
                timeStyle: "long",
              }).format(new Date(b.startAt))}
            </p>
            <span className="badge">{b.status}</span>
            <p>Calendar sync: {b.syncStatus}</p>
            <button className="secondary" onClick={() => viewAttendee(b)}>
              View attendee details
            </button>
          </article>
        ))}
      </div>
      {!rows.length && !busy && <p>No bookings found.</p>}
      {next && (
        <button className="primary" disabled={busy} onClick={() => load(next)}>
          Load more bookings
        </button>
      )}
      {busy && <p role="status">Loading bookings…</p>}
    </>
  );
}
