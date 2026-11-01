// Basic labels only; the callable endpoint separately verifies the requesting host.
import { selectedUids } from "./participants.js";
export async function selectedUsers(identityDb, input) {
  const uids = selectedUids(input);
  if (!uids.length) return { users: [] };
  const queries = [];
  for (let i = 0; i < uids.length; i += 10)
    queries.push(
      identityDb
        .collection("Users")
        .where("uid", "in", uids.slice(i, i + 10))
        .select("uid", "displayName", "email")
        .get(),
    );
  const records = new Map();
  for (const page of await Promise.all(queries))
    for (const doc of page.docs) {
      const data = doc.data();
      records.set(data.uid, [...(records.get(data.uid) || []), data]);
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
}
