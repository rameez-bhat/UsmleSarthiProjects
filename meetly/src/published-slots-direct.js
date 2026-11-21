import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { publishedSlots } from "./published-slots";
export async function loadPublishedSlots(event) {
  let source = event;
  try {
    const snapshot = await getDoc(doc(db, "scheduler_public_events", event.id));
    if (snapshot.exists())
      source = { ...event, ...snapshot.data(), id: event.id };
  } catch {
    // Older events/rules can use the sanitized event already loaded on this page.
  }
  return publishedSlots(source);
}
