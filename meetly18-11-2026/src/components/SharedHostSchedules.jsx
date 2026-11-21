import React, { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db, live, api } from "../firebase";
import { HostSlotEditor } from "./HostSlotEditor";
import { expandTimeRanges } from "../time-ranges";

export function SharedHostSchedules({ profile }) {
  const [events, setEvents] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [version, setVersion] = useState(0),
    [selected, setSelected] = useState(null);
  const uid = auth?.currentUser?.uid;
  useEffect(() => {
    let active = true;
    setEvents([]);
    if (!live || !uid) return;
    setLoading(true);
    setError("");
    getDocs(
      query(
        collection(db, "scheduler_host_assignments"),
        where("hostUid", "==", uid),
      ),
    )
      .then((snapshot) => {
        if (active)
          setEvents(
            snapshot.docs
              .map((doc) => ({ ...doc.data(), id: doc.id }))
              .filter((event) => event.active && event.ownerId !== uid),
          );
      })
      .catch((problem) => {
        if (active) setError(problem.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [uid, version]);
  if (!live || !uid) return null;
  return (
    <section className="shared-host-schedules">
      <h2>Your shared meetings</h2>
      <p>
        Organizers have allowed you to manage your own slots for these meetings.
      </p>
      <button
        type="button"
        className="secondary"
        disabled={loading}
        onClick={() => setVersion((v) => v + 1)}
      >
        Refresh shared meetings
      </button>
      {loading && <p role="status">Loading shared meetings…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !events.length && !error && (
        <p>No meetings currently allow you to add your own slots.</p>
      )}
      <div className="meeting-card-grid">
        {events.map((event) => (
          <article className="schedule-card meeting-tile" key={event.id}>
            <div className="meeting-tile-top">
              <span className="host-tile-avatar" aria-hidden="true">
                {(event.title || "M").slice(0, 1).toUpperCase()}
              </span>
              <span
                className={`schedule-status ${event.hostSlots?.length ? "" : "pending"}`}
              >
                {event.hostSlots?.length ? "Published" : "Needs your slots"}
              </span>
            </div>
            <h3>{event.title}</h3>
            <p>
              {event.duration} minutes · {event.hostSlots?.length || 0} of your
              published slots
            </p>
            <p className="small-text">
              {event.hostSlots?.length
                ? "Slots added · You can update your times."
                : "Action needed · Add your availability slots."}
            </p>
            <button
              type="button"
              className="primary"
              onClick={() => setSelected(event)}
            >
              Manage my slots
            </button>
          </article>
        ))}
      </div>
      {selected && (
        <OwnSlotEditor
          key={selected.id}
          event={selected}
          uid={uid}
          profile={profile}
          close={() => setSelected(null)}
          saved={() => {
            setSelected(null);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </section>
  );
}
function OwnSlotEditor({ event, uid, profile, close, saved }) {
  const [slots, setSlots] = useState(event.hostSlots || []),
    [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(null);
  const updateDraft = useCallback((_uid, value) => setDraft(value), []);
  async function save(forced) {
    setError("");
    setConflict(null);
    try {
      if (!forced && draft?.dirty && draft.error) throw new Error(draft.error);
      const values =
        forced ||
        expandTimeRanges([...slots, ...(draft?.slots || [])], event.duration);
      setBusy(true);
      await api("SaveOwnSlots", { eventId: event.eventId, hostSlots: values });
      saved();
    } catch (problem) {
      setError(problem.message);
      if (problem.details?.conflicts) setConflict(problem.details);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-overlay">
      <section
        className="modal event-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Manage my slots: ${event.title}`}
      >
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={close}
        >
          Close
        </button>
        <h2>{event.title} — My slots</h2>
        <p>
          You can change only your slots. The organizer controls the meeting,
          hosts, locations and permissions.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <HostSlotEditor
            hostUids={[uid]}
            value={slots}
            onChange={setSlots}
            duration={event.duration}
            timezone={profile.timezone}
            onDraftChange={updateDraft}
          />
          {error && <p role="alert">{error}</p>}
          {conflict && (
            <div className="info-banner">
              <p>These times conflict with existing meetings:</p>
              <ul>
                {conflict.conflicts.map((slot) => (
                  <li key={slot.startAt}>
                    {new Date(slot.startAt).toLocaleString(undefined, {
                      timeZone: profile.timezone,
                    })}{" "}
                    · {profile.timezone}
                  </li>
                ))}
              </ul>
              {conflict.remainingSlots?.length ? (
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => save(conflict.remainingSlots)}
                >
                  Save without conflicting dates and times
                </button>
              ) : (
                <p>No free choices remain. Choose different dates or times.</p>
              )}
            </div>
          )}
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Saving my slots…" : "Save my slots"}
          </button>
        </form>
      </section>
    </div>
  );
}
