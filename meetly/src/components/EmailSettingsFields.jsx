import React from "react";
import { defaultEmails } from "../shared/utils";
export function EmailSettingsFields({ value, onChange }) {
  const settings = {
    ...defaultEmails,
    ...value,
  };
  return (
    <fieldset className="email-settings">
      <legend>Meetly email notifications</legend>
      {[
        ["enabled", "Enable meeting emails"],
        ["invitations", "Email invited users"],
        ["confirmations", "Email confirmations and changes"],
        ["cancellations", "Email cancellations and declined invitations"],
        ["hostUpdates", "Notify assigned host and organizing admin"],
      ].map(([key, label]) => (
        <label className="checkbox-label" key={key}>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(e) =>
              onChange({
                ...settings,
                [key]: e.target.checked,
              })
            }
          />
          {label}
        </label>
      ))}
      <p className="small-text muted">
        Connected calendar providers may also send their own invitations.
      </p>
      <p className="small-text muted">
        Email reminders to confirmed attendees and hosts
      </p>
      {[
        [1440, "24 hours before"],
        [60, "1 hour before"],
        [15, "15 minutes before"],
      ].map(([minutes, label]) => (
        <label className="checkbox-label" key={minutes}>
          <input
            type="checkbox"
            checked={settings.reminderMinutes.includes(minutes)}
            onChange={(e) =>
              onChange({
                ...settings,
                reminderMinutes: e.target.checked
                  ? [...settings.reminderMinutes, minutes]
                  : settings.reminderMinutes.filter((n) => n !== minutes),
              })
            }
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
