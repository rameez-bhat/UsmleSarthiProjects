// Prefix searches deliberately preserve Firestore's case-sensitive ordering.
export async function searchUsers(identityDb, input) {
  const value = String(input || "")
    .trim()
    .slice(0, 120);
  if (value.length < 2) return { users: [], next: null };
  const snapshots = await Promise.all(
    ["displayName", "email"].map((field) =>
      identityDb
        .collection("Users")
        .orderBy(field)
        .startAt(value)
        .endAt(value + "\uf8ff")
        .limit(20)
        .select("uid", "displayName", "email")
        .get(),
    ),
  );
  const users = new Map();
  for (const snapshot of snapshots)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Existing save-time identity validation still requires one Users record by UID.
      users.set(doc.id, {
        uid: data.uid || doc.id,
        name: data.displayName || data.email || "",
        email: data.email || "",
      });
    }
  return {
    users: [...users.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    ),
    next: null,
  };
}
