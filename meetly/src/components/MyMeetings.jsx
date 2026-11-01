import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { live, db, auth, api } from "../firebase";

function toMilliseconds(value) {
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (value && typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  if (typeof value === "number") {
    return value;
  }

  return new Date(value).getTime();
}

function formatMeeting(document, uid) {
  const booking = document.data();
  const participant = booking.participants?.find(
    (person) => person.uid === uid,
  );

  const response = participant?.response || "invited";

  const status =
    booking.status === "cancelled"
      ? "cancelled"
      : participant
        ? response === "accepted"
          ? "confirmed"
          : response
        : booking.status;

  const canJoin =
    booking.status === "confirmed" &&
    (!booking.participants?.length ||
      (participant && response === "accepted"));

  return {
    id: document.id,
    eventTitle: booking.eventTitle || "Meeting",
    hostName: booking.hostName || "Host",
    startAt: toMilliseconds(booking.startAt),
    endAt: toMilliseconds(booking.endAt),
    status,
    syncStatus: booking.syncStatus,
    meetingUrl: canJoin
      ? booking.meetingUrl || booking.locationValue || ""
      : "",
  };
}

export function MyMeetings({ uid }) {
  const [meetings, setMeetings] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [responding, setResponding] = useState(null);

  // Prevent responses started under an old account from updating this screen.
  const session = useRef(0);

  useEffect(() => {
    session.current += 1;
    setResponding(null);

    return () => {
      session.current += 1;
    };
  }, [uid]);

  useEffect(() => {
    let active = true;

    setMeetings(null);
    setError("");

    async function loadMeetings() {
      if (!live) {
        if (active) setMeetings([]);
        return;
      }

      if (!uid || auth.currentUser?.uid !== uid) {
        if (active) setError("Please sign in to view your meetings.");
        return;
      }

      try {
        const bookings = collection(db, "scheduler_bookings");

        const [invitations, directBookings] = await Promise.all([
          getDocs(
            query(
              bookings,
              where("participantUids", "array-contains", uid),
            ),
          ),
          getDocs(
            query(
              bookings,
              where("attendeeUid", "==", uid),
            ),
          ),
        ]);

        if (!active || auth.currentUser?.uid !== uid) {
          return;
        }

        const uniqueMeetings = new Map();

        for (const snapshot of [invitations, directBookings]) {
          for (const document of snapshot.docs) {
            uniqueMeetings.set(
              document.id,
              formatMeeting(document, uid),
            );
          }
        }

        setMeetings(
          [...uniqueMeetings.values()].sort(
            (first, second) => first.startAt - second.startAt,
          ),
        );
      } catch (error) {
        if (active) {
          setError(error.message || "Unable to load your meetings.");
        }
      }
    }

    loadMeetings();

    return () => {
      active = false;
    };
  }, [uid, version]);

  async function respond(id, response) {
    const currentSession = session.current;

    setResponding(id);
    setError("");

    try {
      await api("RespondInvitation", { id, response });

      if (
        session.current === currentSession &&
        auth.currentUser?.uid === uid
      ) {
        setVersion((value) => value + 1);
      }
    } catch (error) {
      if (session.current === currentSession) {
        setError(error.message || "Unable to update your invitation.");
      }
    } finally {
      if (session.current === currentSession) {
        setResponding(null);
      }
    }
  }

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>My meetings</h1>
          <p>Your scheduled meetings · Times shown in {zone}</p>
        </div>

        <button
          type="button"
          className="secondary"
          disabled={meetings === null && !error}
          onClick={() => setVersion((value) => value + 1)}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p role="alert">{error}</p>
      ) : meetings === null ? (
        <p role="status">Loading your meetings…</p>
      ) : meetings.length === 0 ? (
        <div className="empty">No scheduled meetings yet.</div>
      ) : (
        meetings.map((meeting) => (
          <article className="schedule-card" key={meeting.id}>
            <h2>{meeting.eventTitle}</h2>

            <p>With {meeting.hostName}</p>

            <p>
              {new Date(meeting.startAt).toLocaleString()} –{" "}
              {new Date(meeting.endAt).toLocaleTimeString()} · {zone}
            </p>

            <p>
              {meeting.status === "invited"
                ? "Invitation awaiting your response"
                : meeting.status}
            </p>

            {meeting.status === "invited" &&
              meeting.startAt > Date.now() && (
                <div className="invite-actions">
                  <button
                    type="button"
                    className="primary"
                    disabled={responding !== null}
                    onClick={() => respond(meeting.id, "accepted")}
                  >
                    {responding === meeting.id
                      ? "Updating…"
                      : "Accept invitation"}
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    disabled={responding !== null}
                    onClick={() => respond(meeting.id, "declined")}
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
                  rel="noopener noreferrer"
                >
                  Join meeting
                </a>
              ) : (
                <p>
                  {meeting.meetingUrl ||
                    (meeting.syncStatus === "error"
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