import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from "firebase/firestore";
import { identityDb } from "./firebase";
import { trackRequest } from "./request-activity";

// Searches the existing default database using its existing Firestore rules.
export async function searchUsersDirect(input) {
  const value = String(input || "")
    .trim()
    .slice(0, 120);
  if (value.length < 2) return { users: [], next: null };
  if (!identityDb) throw new Error("Firebase is not configured.");
  return trackRequest("SearchUsers", async () => {
    const usersRef = collection(identityDb, "Users");
    const snapshots = await Promise.all(
      ["displayName", "email"].map((field) =>
        getDocs(
          query(
            usersRef,
            orderBy(field),
            startAt(value),
            endAt(value + "\uf8ff"),
            limit(20),
          ),
        ),
      ),
    );
    const users = new Map();
    for (const snapshot of snapshots) {
      for (const document of snapshot.docs) {
        const data = document.data();
        const uid = data.uid || document.id;
        users.set(uid, {
          uid,
          name: data.displayName || data.email || "",
          email: data.email || "",
        });
      }
    }
    return {
      users: [...users.values()].sort((a, b) => a.name.localeCompare(b.name)),
      next: null,
    };
  });
}

const HOST_ROLES = new Set([
  "Admin",
  "CustomerSupport",
  "SuperAdmin",
  "Mentor",
  "Journalist",
]);

// Only trusted UsersRoles records determine eligibility. Saving the event
// independently checks the host role and scheduler profile on the server.
export async function searchHostsDirect(input) {
  const { users } = await searchUsersDirect(input);
  if (!users.length) return { users: [], next: null };
  return trackRequest("SearchHosts", async () => {
    const ids = [...new Set(users.map((user) => user.uid).filter(Boolean))];
    const roleQueries = [];
    for (let offset = 0; offset < ids.length; offset += 10) {
      roleQueries.push(
        getDocs(
          query(
            collection(identityDb, "UsersRoles"),
            where("uid", "in", ids.slice(offset, offset + 10)),
          ),
        ),
      );
    }
    const records = new Map();
    for (const snapshot of await Promise.all(roleQueries)) {
      for (const item of snapshot.docs) {
        const data = item.data();
        if (!records.has(data.uid)) records.set(data.uid, []);
        records.get(data.uid).push(data.Role);
      }
    }
    return {
      users: users
        .filter(
          (user) =>
            records.get(user.uid)?.length === 1 &&
            HOST_ROLES.has(records.get(user.uid)[0]),
        )
        .map((user) => ({ ...user, role: records.get(user.uid)[0] })),
      next: null,
    };
  });
}

// Resolve saved selections by UID in the existing default database.
export async function selectedUsersDirect(input = []) {
  if (
    !Array.isArray(input) ||
    input.length > 100 ||
    input.some(
      (uid) => typeof uid !== "string" || !/^[a-zA-Z0-9_-]{1,110}$/.test(uid),
    )
  ) {
    throw new Error("Select up to 100 registered users.");
  }
  const uids = [...new Set(input)];
  if (!uids.length) return { users: [] };
  if (!identityDb) throw new Error("Firebase is not configured.");
  return trackRequest("SelectedUsers", async () => {
    const pages = [];
    for (let i = 0; i < uids.length; i += 10) {
      pages.push(
        getDocs(
          query(
            collection(identityDb, "Users"),
            where("uid", "in", uids.slice(i, i + 10)),
          ),
        ),
      );
    }
    const records = new Map();
    for (const page of await Promise.all(pages)) {
      for (const item of page.docs) {
        const user = item.data();
        if (!records.has(user.uid)) records.set(user.uid, []);
        records.get(user.uid).push(user);
      }
    }
    return {
      users: uids
        .filter((uid) => records.get(uid)?.length === 1)
        .map((uid) => {
          const user = records.get(uid)[0];
          return {
            uid,
            name: typeof user.displayName === "string" ? user.displayName : "",
            email: typeof user.email === "string" ? user.email : "",
          };
        }),
    };
  });
}
