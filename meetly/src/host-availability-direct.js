import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
export async function loadHostAvailability(uids) {
  const rows = await Promise.all(
    uids.map(async (uid) => {
      const snapshot = await getDoc(doc(db, "scheduler_hosts", uid));
      return [uid, snapshot.exists() ? snapshot.data() : null];
    }),
  );
  return Object.fromEntries(rows);
}
