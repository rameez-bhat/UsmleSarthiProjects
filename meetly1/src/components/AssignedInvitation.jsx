import React, { useState, useEffect } from "react";
import { createUUID } from "../shared/utils";
import { api, auth } from "../firebase";
import { RegistrationPanel } from "../components/RegistrationPanel";
import { AuthPanel } from "../components/AuthPanel";
import { signOut } from "firebase/auth";
export function AssignedInvitation({
  event,
  zone,
  authUser,
  organizerId,
  notify,
}) {
  const [meeting, setMeeting] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [version, setVersion] = useState(0),
    [receipt, setReceipt] = useState(null);
  const [requestId] = useState(createUUID);
  const organizer = Boolean(authUser?.uid && authUser.uid === organizerId);
  useEffect(() => {
    let active = true;
    setMeeting(null);
    setError("");
    if (!authUser || organizer) return;
    setBusy(true);
    api("MyMeetings")
      .then((data) => {
        if (active)
          setMeeting(
            data.meetings.find((m) => m.id === `${event.id}_assigned`) || null,
          );
      })
      .catch((e) => {
        if (active && event.audience === "registered") setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [authUser?.uid, event.id, organizer, version]);
  const respond = async (response) => {
    setBusy(true);
    setError("");
    try {
      await api("RespondInvitation", {
        id: meeting.id,
        response,
      });
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const register = async (form) => {
    setBusy(true);
    setError("");
    try {
      const values = new FormData(form);
      setReceipt(
        await api("JoinMeeting", {
          eventId: event.id,
          requestId,
          name: values.get("name"),
          email: values.get("email"),
          notes: values.get("notes"),
          answers: (event.questions || []).map(
            (q, i) => values.get(`answer_${i}`) || "",
          ),
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (receipt)
    return (
      <RegistrationPanel
        id={receipt.id}
        token={receipt.token}
        initial={receipt}
      />
    );
  return (
    <div className="auth-card">
      <h1>{event.title}</h1>
      <p>
        {new Date(event.fixedStartAt).toLocaleString()} · {zone}
      </p>
      {busy && <p role="status">Loading meeting details…</p>}
      {error && <p role="alert">{error}</p>}
      {organizer ? (
        <>
          <p>
            You organized this meeting. Open Bookings to view the joining link
            and registrations.
          </p>
          <a className="primary" href="/bookings">
            Open Bookings
          </a>
        </>
      ) : meeting ? (
        <>
          <p>With {meeting.hostName}</p>
          <p>
            {meeting.status === "invited"
              ? "You are invited. Please accept or decline."
              : meeting.status === "confirmed"
                ? "Your attendance is confirmed."
                : meeting.status === "declined"
                  ? "You declined this invitation."
                  : "This meeting was cancelled."}
          </p>
          {meeting.status === "invited" && meeting.startAt > Date.now() && (
            <div className="invite-actions">
              <button
                className="primary"
                disabled={busy}
                onClick={() => respond("accepted")}
              >
                Accept invitation
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => respond("declined")}
              >
                Decline invitation
              </button>
            </div>
          )}
          {meeting.status === "confirmed" &&
            (/^https:\/\//i.test(meeting.meetingUrl) ? (
              <a
                className="primary"
                href={meeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Join meeting
              </a>
            ) : (
              <p>
                {meeting.syncStatus === "error"
                  ? "Contact your host for joining instructions."
                  : "Your joining link is being prepared."}
              </p>
            ))}
          <button
            className="secondary"
            disabled={busy}
            onClick={() => setVersion((v) => v + 1)}
          >
            Refresh invitation
          </button>
        </>
      ) : (event.audience === "registered" || event.location === "meetly") &&
        !authUser ? (
        <>
          <p>Sign in with your registered account to book this meeting.</p>
          <AuthPanel notify={notify} signInOnly />
        </>
      ) : (
        <>
          <p>
            Book your place at the date and time above.
            {event.audience !== "registered" && event.location !== "meetly"
              ? " No account is required."
              : " Registered users only."}
          </p>
          <form
            aria-label="Meeting registration"
            onSubmit={(e) => {
              e.preventDefault();
              register(e.currentTarget);
            }}
          >
            <label>
              Your name
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={authUser?.displayName || ""}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                defaultValue={authUser?.email || ""}
                readOnly={event.audience === "registered"}
              />
            </label>
            {(event.questions || []).map((q, i) => (
              <label key={i}>
                {q.label}
                <input
                  name={`answer_${i}`}
                  required={q.required}
                  maxLength={1500}
                />
              </label>
            ))}
            <label>
              Notes (optional)
              <textarea name="notes" maxLength={2000} />
            </label>
            <button className="primary" disabled={busy}>
              Confirm booking
            </button>
          </form>
          {!authUser && (
            <details>
              <summary>Already invited? Sign in to respond</summary>
              <AuthPanel notify={notify} signInOnly />
            </details>
          )}
        </>
      )}
      {authUser && !organizer && (
        <button className="text-button" onClick={() => signOut(auth)}>
          Use a different account
        </button>
      )}
      <p>
        <a href="/my-meetings">Open My meetings</a>
      </p>
    </div>
  );
}
