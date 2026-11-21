import React, { useState, useEffect } from "react";
import { live } from "../firebase";
import {
  loadGroupEvent,
  saveGroupHosts,
  updateGroupHosts,
} from "../group-management-direct";
import { selectedUsersDirect } from "../user-search-direct";
import { UserPicker } from "./UserPicker";
export function GroupHostManager({
  initialEvent,
  profile,
  back,
  setModal,
  eventLink,
  copy,
  onUpdated,
  saveEvent,
}) {
  const [event, setEvent] = useState(initialEvent),
    [hosts, setHosts] = useState({}),
    [added, setAdded] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const ids = [
    ...new Set([event.ownerId, ...(event.teamHostUids || [])].filter(Boolean)),
  ];
  useEffect(() => setEvent(initialEvent), [initialEvent]);
  const key = ids.join("|");
  useEffect(() => {
    let active = true;
    if (live)
      selectedUsersDirect([...ids, ...added])
        .then((result) => {
          if (active)
            setHosts(
              Object.fromEntries(
                result.users.map((person) => [person.uid, person]),
              ),
            );
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [key, added.join("|")]);
  async function refresh() {
    if (!live) return;
    setBusy(true);
    setError("");
    try {
      const next = await loadGroupEvent(event.id);
      setEvent(next);
      onUpdated(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [event.id]);
  async function changeHost(change) {
    setBusy(true);
    setError("");
    try {
      const names = Object.fromEntries(
        [...ids, ...added].map((uid) => [
          uid,
          hosts[uid]?.name ||
            event.groupHostNames?.[uid] ||
            (uid === event.ownerId ? profile.name || "Organizer" : "Host"),
        ]),
      );
      const next = live
        ? await saveGroupHosts(event.id, { ...change, hostNames: names })
        : {
            ...updateGroupHosts(event, { ...change, hostNames: names }),
            id: event.id,
          };
      if (!live) await saveEvent(next);
      setEvent(next);
      onUpdated(next);
      setAdded([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="page-heading">
        <div>
          <button type="button" className="text-button" onClick={back}>
            ← Back to Group Meetings
          </button>
          <span className="eyebrow">GROUP EVENT</span>
          <h1>{event.title}</h1>
          <p>
            {event.description ||
              "Manage hosts and their availability for this topic."}
          </p>
        </div>
        <div className="invite-actions">
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => copy(eventLink(event))}
          >
            Copy group link
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => setModal({ type: "event", event })}
          >
            Group settings
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="info-banner">
        Enable hosts to show them on this group's booking page. Switching a host
        off keeps their dates and times and does not cancel existing bookings.
      </div>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Updating group…</p>}
      <details className="tile">
        <summary>Add hosts to this group</summary>
        <UserPicker kind="hosts" value={added} onChange={setAdded} />
        <button
          type="button"
          className="primary"
          disabled={busy || !added.length}
          onClick={() => changeHost({ addHostUids: added })}
        >
          Add selected hosts
        </button>
      </details>
      <div className="group-host-grid">
        {ids.map((uid) => {
          const name =
              hosts[uid]?.name ||
              event.groupHostNames?.[uid] ||
              (uid === event.ownerId ? profile.name || "Organizer" : "Host"),
            enabled = !(event.disabledHostUids || []).includes(uid),
            slots = (event.hostSlots || []).filter(
              (slot) => slot.hostUid === uid,
            );
          return (
            <article key={uid} className="group-host-tile">
              <div className="meeting-tile-top">
                <span className="host-tile-avatar" aria-hidden="true">
                  {name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </span>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label={`Enable ${name}`}
                    checked={enabled}
                    disabled={busy}
                    onChange={(e) =>
                      changeHost({ toggleUid: uid, enabled: e.target.checked })
                    }
                  />
                  {enabled ? "On" : "Off"}
                </label>
              </div>
              <div>
                <h3>
                  {name}
                  {uid === event.ownerId ? " (Organizer)" : ""}
                </h3>
                <p>{hosts[uid]?.email || ""}</p>
                <p>
                  {slots.length} saved times ·{" "}
                  {new Set(slots.map((slot) => slot.date)).size} dates
                </p>
              </div>
              <div className="invite-actions">
                <button
                  type="button"
                  className="primary"
                  disabled={busy}
                  onClick={() =>
                    setModal({ type: "event", event, focusHostUid: uid })
                  }
                >
                  Manage slots
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={busy || !enabled}
                  onClick={() =>
                    copy(`${eventLink(event)}?host=${encodeURIComponent(uid)}`)
                  }
                >
                  Copy host link
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
