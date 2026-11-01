import React, { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
} from "firebase/firestore";
import { db, identityDb, auth } from "../firebase";
import { getSchedulerAccess } from "../firestore-scheduler";
import { searchUsersDirect } from "../user-search-direct";

export function AdminAccountManager() {
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const act = async (fn) => {
    setBusy(true);
    setMessage("");
    try {
      if (!(await getSchedulerAccess()).isAdmin)
        throw new Error("Administrator access required.");
      await fn();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };
  const inspect = (user) =>
    act(async () => {
      const [host, events, owned, organized, identity, attending, invited] =
        await Promise.all([
          getDoc(doc(db, "scheduler_hosts", user.uid)),
          getDocs(
            query(
              collection(db, "scheduler_events"),
              where("ownerId", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "scheduler_bookings"),
              where("ownerId", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "scheduler_bookings"),
              where("organizerId", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(identityDb, "Users"),
              where("uid", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "scheduler_bookings"),
              where("attendeeUid", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "scheduler_bookings"),
              where("participantUids", "array-contains", user.uid),
            ),
          ),
        ]);
      const editable = host.exists()
        ? Object.fromEntries(
            ["name", "bio", "timezone", "schedule", "overrides"].map((key) => [
              key,
              host.data()[key] ?? (key === "overrides" ? {} : ""),
            ]),
          )
        : null;
      setProfile(editable ? JSON.stringify(editable, null, 2) : "");
      const appointments = [
        ...new Map(
          [
            ...owned.docs,
            ...organized.docs,
            ...attending.docs,
            ...invited.docs,
          ].map((item) => [item.id, item]),
        ).values(),
      ];
      setAccount({
        ...user,
        user: identity.docs[0]?.data() || {},
        events: events.docs.map((item) => ({ id: item.id, ...item.data() })),
        bookings: appointments.map((item) => {
          const { tokenHash, tokenCipher, roomKey, ...rest } = item.data();
          return { id: item.id, ...rest };
        }),
      });
    });
  return (
    <section className="tile">
      <h2>Manage a host or user</h2>
      <p>
        You remain signed in as the administrator. Select an account to inspect
        its profile, events and bookings.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          act(async () => setMatches((await searchUsersDirect(search)).users));
        }}
      >
        <label>
          Search account by name or email
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            minLength={2}
            required
          />
        </label>
        <button className="secondary" disabled={busy}>
          Search accounts
        </button>
      </form>
      {matches.map((user) => (
        <button
          key={user.uid}
          type="button"
          className="secondary"
          disabled={busy}
          onClick={() => inspect(user)}
        >
          {user.name} — {user.email}
        </button>
      ))}
      {busy && <p role="status">Loading account…</p>}
      {message && <p role="status">{message}</p>}
      {account && (
        <>
          <h3>
            Managing {account.name} ({account.email})
          </h3>
          <button
            type="button"
            className="secondary"
            onClick={() => setAccount(null)}
          >
            Exit account management
          </button>
          {profile ? (
            <>
              <label>
                Scheduler profile and availability (JSON)
                <textarea
                  rows={16}
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={() =>
                  act(async () => {
                    const input = JSON.parse(profile);
                    const keys = [
                      "name",
                      "bio",
                      "timezone",
                      "schedule",
                      "overrides",
                    ];
                    if (
                      Object.keys(input).some((key) => !keys.includes(key)) ||
                      typeof input.name !== "string" ||
                      !input.name.trim()
                    )
                      throw new Error("Enter valid profile fields only.");
                    new Intl.DateTimeFormat("en", {
                      timeZone: input.timezone,
                    }).format();
                    validateAvailability(input.schedule, input.overrides);
                    const ref = doc(db, "scheduler_hosts", account.uid);
                    await runTransaction(db, async (tx) => {
                      const current = await tx.get(ref);
                      if (!current.exists())
                        throw new Error("Host profile not found.");
                      tx.update(ref, { ...input, updatedAt: Date.now() });
                      tx.set(doc(collection(db, "scheduler_audit")), {
                        action: "admin-profile-update",
                        actorUid: auth.currentUser.uid,
                        targetUid: account.uid,
                        at: Date.now(),
                        before: Object.fromEntries(
                          keys.map((key) => [key, current.data()[key] ?? null]),
                        ),
                        after: input,
                      });
                    });
                    setMessage(
                      "Account settings saved. Administrator and target account recorded in audit history.",
                    );
                  })
                }
              >
                Save account settings
              </button>
            </>
          ) : (
            <p>This user has no scheduler host profile.</p>
          )}
          <details>
            <summary>User profile</summary>
            <pre>{JSON.stringify(account.user, null, 2)}</pre>
          </details>
          <details>
            <summary>Events ({account.events.length})</summary>
            <pre>{JSON.stringify(account.events, null, 2)}</pre>
          </details>
          <details>
            <summary>Bookings ({account.bookings.length})</summary>
            <pre>{JSON.stringify(account.bookings, null, 2)}</pre>
          </details>
        </>
      )}
    </section>
  );
}

function validateAvailability(schedule, overrides = {}) {
  const check = (ranges) =>
    Array.isArray(ranges) &&
    ranges.length <= 6 &&
    ranges.every(
      (range, index) =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(range.start) &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(range.end) &&
        range.start < range.end &&
        (!index || ranges[index - 1].end <= range.start),
    );
  if (
    !schedule ||
    Object.keys(schedule).length !== 7 ||
    !Object.entries(schedule).every(
      ([key, value]) => /^[1-7]$/.test(key) && check(value),
    )
  )
    throw new Error(
      "Availability needs seven weekdays with valid non-overlapping time ranges.",
    );
  if (
    !overrides ||
    typeof overrides !== "object" ||
    Array.isArray(overrides) ||
    Object.keys(overrides).length > 180 ||
    !Object.entries(overrides).every(
      ([date, ranges]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(Date.parse(date)) &&
        check(ranges),
    )
  )
    throw new Error("Invalid date availability overrides.");
}
