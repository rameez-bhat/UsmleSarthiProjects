export function createUUID() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error("Open this application using HTTPS or localhost.");
  }

  globalThis.crypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

const dateFormatters = new Map();
export function dateInZone(ms, zone) {
  if (!dateFormatters.has(zone))
    dateFormatters.set(
      zone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
  const p = Object.fromEntries(
    dateFormatters
      .get(zone)
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

export function wallTimeToMillis(date, time, zone) {
  const target = Date.parse(`${date}T${time}:00Z`);
  let guess = target;
  for (let n = 0; n < 4; n++) {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date(guess))
        .map((x) => [x.type, x.value]),
    );
    guess +=
      target - Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  }
  return guess;
}

export const zones = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
  "UTC",
];

export const initialEvent = {
  title: "",
  description: "",
  duration: 30,
  color: "#267c68",
  location: "custom",
  locationValue: "",
  minNotice: 120,
  horizonDays: 60,
  bufferBefore: 0,
  bufferAfter: 10,
  dailyLimit: 8,
  cancelHours: 0,
  active: true,
  questions: [],
  schedulingMode: "recurring",
  audience: "anyone",
  meetingDate: "",
  meetingTime: "09:00",
};

export const fmt = (ms, zone, opts = {}) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    day: "numeric",
    month: "short",
    ...opts,
  }).format(new Date(ms));

export const time = (ms, zone) =>
  fmt(ms, zone, {
    day: undefined,
    month: undefined,
    hour: "2-digit",
    minute: "2-digit",
  });

export const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const validURL = (v) => /^https:\/\//i.test(v || "");

export const defaultEmails = {
  enabled: true,
  invitations: true,
  confirmations: true,
  cancellations: true,
  hostUpdates: true,
  reminderMinutes: [1440, 60],
};
