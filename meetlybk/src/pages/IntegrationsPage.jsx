import React from "react";
import { PageTitle } from "../components/PageTitle";
import { live, api } from "../firebase";
import { ArrowUpRight, Globe } from "lucide-react";
export function IntegrationsPage({ act, connections, notify }) {
  return (
    <>
      <PageTitle
        eyebrow="EVERYTHING, IN ONE PLACE"
        title="Bring your calendars together."
        text="Check busy times across Google and Outlook. Keep your bookings in sync."
      />
      <div className="integration-grid">
        {[
          [
            "google",
            "Google Calendar",
            "G",
            "Your primary Google calendar, with automatic conflict checks and event creation.",
          ],
          [
            "zoom",
            "Zoom",
            "Z",
            "Connect your own Zoom account for automatic meeting links. The existing shared Zoom account remains available for eligible team members.",
          ],
          [
            "microsoft",
            "Microsoft Outlook",
            "▦",
            "Your primary Outlook calendar, connected through Microsoft Graph.",
          ],
        ].map(([id, name, logo, description]) => (
          <div className="integration-card" key={id}>
            <div className={"provider-logo " + id}>{logo}</div>
            <span
              className={"badge " + (connections.includes(id) ? "" : "neutral")}
            >
              {connections.includes(id) ? "Connected" : "Not connected"}
            </span>
            <h2>{name}</h2>
            <p>{description}</p>
            <button
              className={connections.includes(id) ? "secondary" : "primary"}
              onClick={() =>
                act(async () => {
                  if (!live) {
                    notify(
                      "Calendar connections require your Firebase project and OAuth credentials.",
                    );
                    return;
                  }
                  if (connections.includes(id)) {
                    await api("Disconnect", {
                      provider: id,
                    });
                    notify("Calendar disconnected.");
                  } else {
                    const r = await api("Connect", {
                      provider: id,
                    });
                    location.assign(r.url);
                  }
                })
              }
            >
              {connections.includes(id)
                ? "Disconnect calendar"
                : id === "zoom"
                  ? "Connect Zoom"
                  : "Connect calendar"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="info-banner">
        <Globe />
        <p>
          <strong>Two calendars. One availability.</strong>
          <br />
          Connected calendars block busy times automatically. Saved bookings are
          also checked in Firestore before a time is reserved.
        </p>
      </div>
    </>
  );
}
