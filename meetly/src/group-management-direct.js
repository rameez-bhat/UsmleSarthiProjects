import { doc, getDoc, runTransaction, collection } from "firebase/firestore";
import { auth, db } from "./firebase";
export async function loadGroupEvent(id) {
  const snapshot = await getDoc(doc(db, "scheduler_events", id));
  if (!snapshot.exists()) throw new Error("Group event not found.");
  return { ...snapshot.data(), id: snapshot.id };
}
export function updateGroupHosts(event, change) {
  const hosts = [
    ...new Set([
      event.ownerId,
      ...(event.teamHostUids || []),
      ...(change.addHostUids || []),
    ]),
  ];
  if (hosts.length > 20) throw new Error("A group supports up to 20 hosts.");
  if (change.toggleUid && !hosts.includes(change.toggleUid))
    throw new Error("Select a host in this group.");
  const disabled = new Set(event.disabledHostUids || []);
  if (change.toggleUid) {
    if (change.enabled) disabled.delete(change.toggleUid);
    else disabled.add(change.toggleUid);
  }
  return {
    ...event,
    teamHostUids: hosts,
    disabledHostUids: [...disabled].filter((uid) => hosts.includes(uid)),
    groupHostNames: {
      ...(event.groupHostNames || {}),
      ...(change.hostNames || {}),
    },
    slotsVersion: (event.slotsVersion || 0) + 1,
    updatedAt: Date.now(),
  };
}
export async function saveGroupHosts(id, change) {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Please sign in.");
  return runTransaction(db, async (tx) => {
    const ref = doc(db, "scheduler_events", id),
      snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw new Error("Group event not found.");
    const event = snapshot.data();
    if (event.ownerId !== uid || event.eventKind !== "group" || event.deletedAt)
      throw new Error("Only this group's organizer can manage its hosts.");
    const next = updateGroupHosts(event, change);
    tx.set(ref, next);
    tx.set(doc(db, "scheduler_public_events", id), {
      ownerId: next.ownerId,
      active: next.active,
      eventKind: "group",
      schedulingMode: "host-slots",
      duration: next.duration,
      minNotice: next.minNotice || 0,
      teamHostUids: next.teamHostUids,
      disabledHostUids: next.disabledHostUids,
      groupHostNames: next.groupHostNames,
      hostSlots: next.hostSlots || [],
      updatedAt: next.updatedAt,
    });
    tx.set(doc(collection(db, "scheduler_audit")), {
      action: "group-hosts-updated",
      actor: uid,
      eventId: id,
      at: next.updatedAt,
      before: {
        hosts: event.teamHostUids || [],
        disabled: event.disabledHostUids || [],
      },
      after: { hosts: next.teamHostUids, disabled: next.disabledHostUids },
    });
    return { ...next, id };
  });
}
