import { HttpsError } from "firebase-functions/v2/https";
import { normalizeHostPhones, phoneInstructions } from "./phone-location.js";
export function normalizeHostLocations(
  input,
  hostIds,
  fallback,
  labels = new Map(),
) {
  return Object.fromEntries(
    hostIds.map((uid) => {
      const value = input?.[uid] || {
        location: fallback.location,
        locationValue: fallback.locationValue,
        phone: fallback.hostPhones?.[uid],
      };
      const location = value.location;
      const locationValue =
        typeof value.locationValue === "string"
          ? value.locationValue.trim().slice(0, 500)
          : "";
      if (!["google-meet", "zoom", "phone"].includes(location))
        throw new HttpsError(
          "invalid-argument",
          "Choose a location for every host.",
        );
      if (location === "phone")
        return [
          uid,
          {
            location,
            phone: normalizeHostPhones({ [uid]: value.phone }, [uid], labels)[
              uid
            ],
            locationValue: "",
          },
        ];
      if (
        locationValue &&
        !(
          location === "google-meet"
            ? /^https:\/\/meet\.google\.com\/[a-z0-9-]+(?:\?[^\s]*)?$/i
            : /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/j\/\d+(\?[^\s]*)?$/i
        ).test(locationValue)
      )
        throw new HttpsError(
          "invalid-argument",
          `Enter a valid ${location === "zoom" ? "Zoom" : "Google Meet"} link for ${labels.get(uid) || "this host"}.`,
        );
      return [uid, { location, locationValue }];
    }),
  );
}
export function eventForHost(event, uid) {
  const choice = event.hostLocations?.[uid];
  if (!choice) return event;
  return {
    ...event,
    location: choice.location,
    locationValue:
      choice.location === "phone"
        ? phoneInstructions({ hostPhones: { [uid]: choice.phone } }, uid)
        : choice.locationValue || "",
  };
}
