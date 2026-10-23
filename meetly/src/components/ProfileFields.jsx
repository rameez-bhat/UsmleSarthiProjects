import React from "react";
import { profileLabel } from "../components/profileLabel";
export function ProfileFields({ value }) {
  if (value === null || value === undefined || value === "")
    return <span className="muted">Not provided</span>;
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (typeof value !== "object") return <span>{String(value)}</span>;
  return (
    <dl className="attendee-fields">
      {Object.entries(value).map(([key, item]) => (
        <div key={key}>
          <dt>
            {Array.isArray(value)
              ? `Item ${Number(key) + 1}`
              : profileLabel(key)}
          </dt>
          <dd>
            <ProfileFields value={item} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
