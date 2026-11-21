import { doc, getDoc, runTransaction } from "firebase/firestore";
import { auth, db } from "./firebase";
export function normalizeShortName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}
export function validateShortName(value) {
  const name = normalizeShortName(value);
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(name))
    throw new Error("Use 3–60 lowercase letters, numbers or hyphens.");
  return name;
}
export async function saveShortLink(event, slug, input) {
  const name = validateShortName(input);
  const uid = auth.currentUser?.uid;
  if (!uid || !slug)
    throw new Error("Sign in and complete your booking profile first.");
  const ref = doc(db, "scheduler_short_links", name);
  await runTransaction(db, async (tx) => {
    const [existing, source] = await Promise.all([
      tx.get(ref),
      tx.get(doc(db, "scheduler_events", event.id)),
    ]);
    if (!source.exists() || source.data().ownerId !== uid)
      throw new Error("Only the event organizer can create its short link.");
    if (
      existing.exists() &&
      (existing.data().eventId !== event.id || existing.data().ownerId !== uid)
    )
      throw new Error("That short-link name is already taken. Choose another.");
    tx.set(ref, {
      eventId: event.id,
      ownerId: uid,
      slug,
      createdAt: existing.data()?.createdAt || Date.now(),
    });
    tx.set(doc(db, "scheduler_event_links", event.id), { name, ownerId: uid });
  });
  return name;
}
export async function loadEventShortLink(id) {
  const snapshot = await getDoc(doc(db, "scheduler_event_links", id));
  return snapshot.exists() ? snapshot.data().name : "";
}
export async function resolveShortLink(input) {
  const name = validateShortName(input);
  const snapshot = await getDoc(doc(db, "scheduler_short_links", name));
  if (!snapshot.exists())
    throw new Error("This short booking link was not found.");
  const { slug, eventId } = snapshot.data();
  if (!slug || !eventId) throw new Error("This booking link is invalid.");
  return `/book/${encodeURIComponent(slug)}/${encodeURIComponent(eventId)}`;
}
