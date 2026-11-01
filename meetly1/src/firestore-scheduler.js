import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, identityDb, api } from "./firebase";
import { trackRequest } from "./request-activity";

const adminRoles = ["Admin", "CustomerSupport", "SuperAdmin"];
const hostRoles = [...adminRoles, "Mentor", "Journalist"];

function currentUid() {
  const user = auth?.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error("Sign in with a verified account to use the scheduler.");
  }
  return user.uid;
}

export async function getSchedulerAccess() {
  const uid = currentUid();
  return trackRequest("Access", async () => {
    const snapshot = await getDocs(
      query(
        collection(identityDb, "UsersRoles"),
        where("uid", "==", uid),
        limit(2),
      ),
    );
    const role = snapshot.size === 1 ? snapshot.docs[0].data().Role : null;
    return {
      role,
      isAdmin: adminRoles.includes(role),
      canHost: hostRoles.includes(role),
    };
  });
}

export async function getSchedulerWorkspace() {
  const uid = currentUid();
  return trackRequest("Workspace", async () => {
    const owned = (name, field) =>
      getDocs(query(collection(db, name), where(field, "==", uid)));
    const [profile, events, protectedWorkspace, connections] =
      await Promise.all([
        getDoc(doc(db, "scheduler_hosts", uid)),
        owned("scheduler_events", "ownerId"),
        api("Workspace", {}),
        owned("scheduler_connections", "ownerId"),
      ]);
    return {
      profile: profile.exists() ? profile.data() : null,
      events: events.docs
        .filter((item) => !item.data().deletedAt)
        .map((item) => ({ id: item.id, ...item.data() })),
      bookings: protectedWorkspace.bookings,
      connections: connections.docs.map((item) => item.data().provider),
    };
  });
}

export async function saveSchedulerAvailability({ schedule, overrides = {} }) {
  const uid = currentUid();
  return trackRequest("SaveAvailability", () =>
    updateDoc(doc(db, "scheduler_hosts", uid), {
      schedule,
      overrides,
      updatedAt: Date.now(),
    }),
  );
}

const defaultSchedule = () =>
  Object.fromEntries(
    Array.from({ length: 7 }, (_, index) => [
      String(index + 1),
      index < 5 ? [{ start: "09:00", end: "17:00" }] : [],
    ]),
  );

export async function saveSchedulerProfile(input) {
  const uid = currentUid();
  const slug = String(input.slug || "")
    .trim()
    .toLowerCase();
  const name = String(input.name || "")
    .trim()
    .slice(0, 80);
  const bio = String(input.bio || "")
    .trim()
    .slice(0, 500);
  if (typeof input.timezone !== "string" || !input.timezone)
    throw new Error("Choose a valid time zone.");
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format();
  } catch {
    throw new Error("Choose a valid time zone.");
  }
  if (!name || !/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug))
    throw new Error(
      "Enter a name and a booking link of 3–60 letters, numbers or hyphens.",
    );
  return trackRequest("SaveProfile", () =>
    runTransaction(db, async (tx) => {
      const profileRef = doc(db, "scheduler_hosts", uid);
      const slugRef = doc(db, "scheduler_slugs", slug);
      const introRef = doc(db, "scheduler_events", `${uid}_intro`);
      const [profile, claim, intro] = await Promise.all([
        tx.get(profileRef),
        tx.get(slugRef),
        tx.get(introRef),
      ]);
      if (claim.exists() && claim.data().ownerId !== uid)
        throw new Error("That booking link is already taken.");
      const timestamp = Date.now();
      const next = {
        name,
        bio,
        slug,
        timezone: input.timezone,
        email: auth.currentUser.email || "",
        updatedAt: timestamp,
      };
      if (!profile.exists()) {
        Object.assign(next, {
          schedule: defaultSchedule(),
          overrides: {},
          createdAt: timestamp,
        });
        if (!intro.exists())
          tx.set(introRef, {
            ownerId: uid,
            title: "Introductory call",
            description: "",
            duration: 30,
            minNotice: 120,
            horizonDays: 60,
            bufferBefore: 0,
            bufferAfter: 10,
            dailyLimit: 8,
            capacity: 100,
            cancelHours: 0,
            location: "custom",
            locationValue: "",
            color: "#187b68",
            active: true,
            notifications: {
              enabled: true,
              invitations: true,
              confirmations: true,
              cancellations: true,
              hostUpdates: true,
              reminderMinutes: [1440, 60],
            },
            questions: [],
          });
      }
      if (
        profile.exists() &&
        profile.data().slug &&
        profile.data().slug !== slug
      )
        tx.delete(doc(db, "scheduler_slugs", profile.data().slug));
      tx.set(slugRef, { ownerId: uid });
      tx.set(profileRef, next, { merge: true });
      return { ok: true };
    }),
  );
}

export async function saveSchedulerNotifications(eventId, input = {}) {
  const uid = currentUid();
  if (typeof eventId !== "string" || !/^[a-zA-Z0-9_-]{1,110}$/.test(eventId))
    throw new Error("Invalid event identifier.");
  const notifications = {};
  for (const key of [
    "enabled",
    "invitations",
    "confirmations",
    "cancellations",
    "hostUpdates",
  ]) {
    if (input[key] !== undefined && typeof input[key] !== "boolean")
      throw new Error(`Invalid email setting: ${key}.`);
    notifications[key] = input[key] ?? true;
  }
  const reminders = input.reminderMinutes ?? [1440, 60];
  if (
    !Array.isArray(reminders) ||
    reminders.some((n) => ![1440, 60, 15].includes(n))
  )
    throw new Error("Choose supported email reminder times.");
  notifications.reminderMinutes = [...new Set(reminders)].sort((a, b) => b - a);
  return trackRequest("SaveNotifications", () =>
    runTransaction(db, async (tx) => {
      const ref = doc(db, "scheduler_events", eventId);
      const event = await tx.get(ref);
      if (!event.exists()) throw new Error("Meeting not found.");
      tx.update(ref, { notifications });
      tx.set(doc(collection(db, "scheduler_audit")), {
        eventId,
        actorUid: uid,
        action: "notification-settings-updated",
        notifications,
        at: Date.now(),
      });
      return { ok: true };
    }),
  );
}
