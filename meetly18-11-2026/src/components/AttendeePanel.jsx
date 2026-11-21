import React, { useState } from "react";
import { api } from "../firebase";
import { fmt, time } from "../shared/utils";
import { ProfileFields } from "../components/ProfileFields";
export function AttendeePanel({ details }) {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  if (details.participants)
    return (
      <div>
        <h2 id="dialog-title">Meeting attendees</h2>
        <p>{details.booking.eventTitle}</p>
        {details.participants.map((p) => (
          <button
            className="secondary"
            key={p.uid}
            onClick={async () => {
              try {
                setSelected(
                  await api("AttendeeDetails", {
                    id: details.booking.id,
                    participantUid: p.uid,
                  }),
                );
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            {p.name} · {p.email} · {p.response || "invited"}
          </button>
        ))}
        {error && <p role="alert">{error}</p>}
        {selected && (
          <AttendeePanel
            key={selected.booking.attendeeEmail}
            details={selected}
          />
        )}
      </div>
    );
  const booking = details.booking,
    zone = booking.timezone || "UTC";
  return (
    <div className="attendee-panel">
      <span className="eyebrow">BOOKING DETAILS</span>
      <h2 id="dialog-title">{booking.attendeeName}</h2>
      <p>{booking.attendeeEmail}</p>
      <dl className="attendee-fields">
        <div>
          <dt>Meeting</dt>
          <dd>{booking.eventTitle}</dd>
        </div>
        <div>
          <dt>Host</dt>
          <dd>{booking.hostName}</dd>
        </div>
        <div>
          <dt>Date and time</dt>
          <dd>
            {fmt(booking.startAt, zone, {
              weekday: "long",
              year: "numeric",
            })}{" "}
            · {time(booking.startAt, zone)} – {time(booking.endAt, zone)} (
            {zone})
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{booking.status}</dd>
        </div>
        <div>
          <dt>Attendee time zone</dt>
          <dd>{booking.attendeeTimezone || zone}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{booking.notes || "Not provided"}</dd>
        </div>
      </dl>
      <h3>Booking answers</h3>
      {booking.answers?.length ? (
        <ProfileFields value={booking.answers} />
      ) : (
        <p className="muted">No additional answers submitted.</p>
      )}
      <h3>Registered user profile</h3>
      {details.profile ? (
        <ProfileFields value={details.profile} />
      ) : (
        <p className="muted">
          {details.profileState === "unavailable"
            ? "The linked profile is unavailable or needs an identity check."
            : "No verified registered profile is linked to this booking. Guest details are shown above."}
        </p>
      )}
      {details.account && (
        <>
          <h3>Account details</h3>
          <ProfileFields value={details.account} />
        </>
      )}
      <p className="small-text muted">
        Profile details are read only. Security credentials are excluded.
      </p>
    </div>
  );
}
