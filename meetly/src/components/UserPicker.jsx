import React, { useState, useEffect } from "react";
import { live } from "../firebase";
import {
  searchUsersDirect,
  searchHostsDirect,
  selectedUsersDirect,
  initialHostsDirect,
} from "../user-search-direct";
export function UserPicker({ value, onChange, kind = "users" }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [known, setKnown] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
    selectedUsersDirect(missing)
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
    setError("");
    if (search.trim().length < 2 && kind !== "hosts") {
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
          const page =
            kind === "hosts"
              ? await (search.trim().length < 2
                  ? initialHostsDirect()
                  : searchHostsDirect(search))
              : await searchUsersDirect(search);
          if (!active) return;
          matches = [...matches, ...page.users];
          after = page.next;
          setUsers([...new Map(matches.map((u) => [u.uid, u])).values()]);
          setKnown((old) => ({
            ...old,
            ...Object.fromEntries(page.users.map((u) => [u.uid, u])),
          }));
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
          ? "Select up to 20 participating hosts. SAMAY assigns one available host for each dated meeting."
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
      {kind === "hosts" ? (
        <label>
          Selected meeting hosts
          <select
            multiple
            size={10}
            value={value}
            onChange={(e) => {
              const next = [...e.target.selectedOptions].map(
                (option) => option.value,
              );
              if (next.length > 20) {
                setError("Select up to 20 hosts.");
                return;
              }
              onChange(next);
            }}
          >
            {[
              ...new Map(
                [
                  ...value.map((uid) => known[uid] || { uid, name: uid }),
                  ...users,
                ].map((user) => [user.uid, user]),
              ).values(),
            ].map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.name} — {user.email || ""}
                {user.role ? ` (${user.role})` : ""}
              </option>
            ))}
          </select>
          <span className="small-text muted">
            Use Ctrl (Windows) or Command (Mac) to select multiple hosts. Search
            above to find more hosts.
          </span>
        </label>
      ) : (
        <>
          <details
            className="user-results"
            open={search.trim().length >= 2 || undefined}
          >
            <summary>
              {kind === "hosts"
                ? "Choose hosts (searchable)"
                : "Choose registered users"}
            </summary>
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
          </details>
        </>
      )}
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
          Mentor and Journalist accounts appear. Hosts must complete their SAMAY
          profile before the meeting can be saved. Search uses a case-sensitive
          prefix.
        </p>
      )}
      {kind === "users" && (
        <p className="small-text muted">
          Search matches the beginning of a name or email and is case-sensitive.
          Up to 20 matches from each field.
        </p>
      )}
    </fieldset>
  );
}
