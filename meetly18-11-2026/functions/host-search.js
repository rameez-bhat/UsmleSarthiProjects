import { HOST_ROLES } from "./access.js";
import { searchUsers } from "./user-search.js";

export async function searchHosts(identityDb, schedulerDb, input) {
  const result = await searchUsers(identityDb, input);
  const candidates = [
    ...new Map(
      result.users
        .filter((u) => typeof u.uid === "string" && u.uid)
        .map((u) => [u.uid, u]),
    ).values(),
  ];
  if (!candidates.length) return { users: [], next: null };
  // Batch authoritative role checks; do not trust a Role copied into Users.
  const batches = [];
  for (let offset = 0; offset < candidates.length; offset += 10) {
    batches.push(
      identityDb
        .collection("UsersRoles")
        .where(
          "uid",
          "in",
          candidates.slice(offset, offset + 10).map((u) => u.uid),
        )
        .select("uid", "Role")
        .get(),
    );
  }
  const roles = new Map();
  for (const page of await Promise.all(batches))
    for (const doc of page.docs) {
      const role = doc.data();
      roles.set(role.uid, [...(roles.get(role.uid) || []), role.Role]);
    }
  const eligible = candidates.filter(
    (u) =>
      roles.get(u.uid)?.length === 1 &&
      HOST_ROLES.includes(roles.get(u.uid)[0]),
  );
  if (!eligible.length) return { users: [], next: null };
  const profiles = await schedulerDb.getAll(
    ...eligible.map((u) =>
      schedulerDb.collection("scheduler_hosts").doc(u.uid),
    ),
  );
  const ready = new Set(profiles.filter((p) => p.exists).map((p) => p.id));
  return {
    users: eligible
      .filter((u) => ready.has(u.uid))
      .map((u) => ({ ...u, role: roles.get(u.uid)[0] })),
    next: null,
  };
}
