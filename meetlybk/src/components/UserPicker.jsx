import React, { useState, useEffect } from "react";
import { live, api } from "../firebase";
export function UserPicker({ value, onChange, kind = "users" }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [known, setKnown] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [next, setNext] = useState(null);
  const [selectedBusy, setSelectedBusy] = useState(false),
    [selectedError, setSelectedError] = useState(""),
    [selectedRetry, setSelectedRetry] = useState(0);
  const selectionKey = JSON.stringify([...new Set(value)].sort());
  useEffect(() => {
    let active = true;
    const missing = JSON.parse(selectionKey).filter((uid) => !known[uid]);
    setSelectedError("");
    if (!live || !missing.length) {
      setSelectedBusy(false);
      return;
    }
    setSelectedBusy(true);
    api("SelectedUsers", {
      uids: missing,
    })
      .then((data) => {
        if (active)
          setKnown((old) => ({
            ...old,
            ...Object.fromEntries(data.users.map((u) => [u.uid, u])),
          }));
      })
      .catch((e) => {
        if (active) setSelectedError(e.message);
      })
      .finally(() => {
        if (active) setSelectedBusy(false);
      });
    return () => {
      active = false;
    };
  }, [selectionKey, selectedRetry]);
  useEffect(() => {
    let active = true;
    setUsers([]);
    setNext(null);
    setError("");
    if (search.trim().length < 2) {
      setBusy(false);
      return;
    }
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        if (!live) {
          if (active) setError("Connect Firebase to search registered users.");
          return;
        }
        let after = null,
          matches = [];
        {
          const page = await api(
            kind === "hosts" ? "SearchHosts" : "SearchUsers",
            {
              search,
              after,
            },
          );
          if (!active) return;
          matches = [...matches, ...page.users];
          after = page.next;
          setUsers([...new Map(matches.map((u) => [u.uid, u])).values()]);
          setKnown((old) => ({
            ...old,
            ...Object.fromEntries(page.users.map((u) => [u.uid, u])),
          }));
          setNext(after);
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setBusy(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, kind]);
  return (
    <fieldset className="user-picker">
      <legend>
        {kind === "hosts"
          ? "Round-robin team hosts"
          : "Invite registered users to this meeting"}
      </legend>
      <p className="small-text muted">
        {kind === "hosts"
          ? "Select up to 20 participating hosts. Meetly assigns one available host for each dated meeting."
          : "Selected users receive an invitation and must accept before becoming confirmed attendees. Up to 100 invitees."}
      </p>
      <label>
        {kind === "hosts"
          ? "Search hosts by name or email"
          : "Search users by name or email"}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            kind === "hosts" ? "Search team hosts" : "Type a name or email"
          }
        />
      </label>
      <div className="selected-users">
        {value.map((uid) => (
          <button
            type="button"
            className="secondary"
            key={uid}
            onClick={() => onChange(value.filter((x) => x !== uid))}
          >
            {known[uid]?.email ||
              known[uid]?.name ||
              (selectedBusy ? "Loading user…" : "User unavailable")}{" "}
            ×
          </button>
        ))}
      </div>
      {selectedBusy && <p role="status">Loading selected users…</p>}
      {selectedError && (
        <p role="alert">
          {selectedError}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => setSelectedRetry((v) => v + 1)}
          >
            Retry loading selected users
          </button>
        </p>
      )}
      <div className="user-results" aria-label="Registered users">
        {users.map((u) => (
          <label key={u.uid}>
            <input
              type="checkbox"
              checked={value.includes(u.uid)}
              disabled={
                !value.includes(u.uid) &&
                value.length >= (kind === "hosts" ? 20 : 100)
              }
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...value, u.uid]
                    : value.filter((x) => x !== u.uid),
                )
              }
            />
            <span>
              {u.name}
              <small>{u.email}</small>
              {kind === "hosts" && u.role && <small>{u.role}</small>}
            </span>
          </label>
        ))}
      </div>
      {busy && (
        <p role="status">
          {kind === "hosts" ? "Searching eligible hosts…" : "Searching users…"}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {!busy && !error && !users.length && (
        <p>
          {search.trim().length < 2
            ? "Type at least 2 characters to search."
            : "No matching users."}
        </p>
      )}
      {kind === "hosts" && (
        <p className="small-text muted">
          Search is case-sensitive. Only Admin, CustomerSupport, SuperAdmin,
          Mentor and Journalist accounts with completed Meetly profiles appear.
          Refine your prefix if a host does not appear.
        </p>
      )}
      {kind === "users" && (
        <p className="small-text muted">
          Search matches the beginning of a name or email and is case-sensitive.
          Up to 20 matches from each field.
        </p>
      )}
      {next && !busy && (
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            setBusy(true);
            try {
              const page = await api(
                kind === "hosts" ? "SearchHosts" : "SearchUsers",
                {
                  search,
                  after: next,
                },
              );
              setUsers((old) => [
                ...new Map(
                  [...old, ...page.users].map((u) => [u.uid, u]),
                ).values(),
              ]);
              setKnown((old) => ({
                ...old,
                ...Object.fromEntries(page.users.map((u) => [u.uid, u])),
              }));
              setNext(page.next);
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Load more users
        </button>
      )}
    </fieldset>
  );
}
