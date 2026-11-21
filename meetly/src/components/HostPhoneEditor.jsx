import React, { useEffect, useState } from "react";
import { live } from "../firebase";
import { selectedUsersDirect } from "../user-search-direct";
export function HostPhoneEditor({
  uids,
  organizer,
  value = {},
  onChange,
  defaultLocation = "google-meet",
  defaultLink = "",
  legacyPhones = {},
}) {
  const [people, setPeople] = useState({});
  const key = JSON.stringify(uids);
  useEffect(() => {
    let active = true;
    if (live)
      selectedUsersDirect(uids)
        .then(({ users }) => {
          if (active)
            setPeople(Object.fromEntries(users.map((p) => [p.uid, p])));
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [key]);
  return (
    <fieldset>
      <legend>Location for each host</legend>
      <p>
        Choose a separate meeting location for the organizer and every selected
        host.
      </p>
      {uids.map((uid) => {
        const label =
          uid === organizer?.uid
            ? `${organizer.name || "Organizer"} (Organizer)`
            : people[uid]?.name || people[uid]?.email || "Selected host";
        const choice = value[uid] || {
          location: defaultLocation,
          locationValue: defaultLink,
          phone: legacyPhones[uid] || "",
        };
        const update = (patch) =>
          onChange({
            ...Object.fromEntries(
              uids.map((id) => [
                id,
                value[id] || {
                  location: defaultLocation,
                  locationValue: defaultLink || "",
                  phone: legacyPhones[id] || "",
                },
              ]),
            ),
            [uid]: { ...choice, ...patch },
          });
        return (
          <div className="host-location-card" key={uid}>
            <h4>{label}</h4>
            <label>
              Location for {label}
              <select
                value={choice.location}
                onChange={(e) => update({ location: e.target.value })}
              >
                <option value="google-meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="phone">Direct/WhatsApp Phone Call</option>
              </select>
            </label>
            {choice.location === "phone" ? (
              <label>
                Phone number for {label}
                <input
                  type="tel"
                  required
                  maxLength={30}
                  placeholder="+919876543210"
                  value={choice.phone || ""}
                  onChange={(e) => update({ phone: e.target.value })}
                />
              </label>
            ) : (
              <label>
                {choice.location === "zoom" ? "Zoom" : "Google Meet"} link for{" "}
                {label} (optional; leave blank to generate)
                <input
                  type="url"
                  maxLength={500}
                  value={choice.locationValue || ""}
                  onChange={(e) => update({ locationValue: e.target.value })}
                />
              </label>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
