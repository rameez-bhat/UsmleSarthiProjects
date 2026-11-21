import React from "react";
import { PageTitle } from "../components/PageTitle";
import { Copy, Users } from "lucide-react";
export function HostsPage({ copy, profile }) {
  return (
    <>
      <PageTitle
        eyebrow="BETTER CONVERSATIONS, TOGETHER"
        title="A booking page for every host."
        text="Every host signs in to their own workspace, connects calendars, and shares a personal link."
      />
      <div className="host-card">
        <div className="avatar">
          {profile.name
            .split(" ")
            .slice(0, 2)
            .map((x) => x[0])
            .join("")}
        </div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.timezone}</p>
        </div>
        <span className="badge">Host</span>
        <button
          className="secondary"
          onClick={() => copy(`${location.origin}/book/${profile.slug}`)}
        >
          <Copy size={16} />
          Copy booking page
        </button>
      </div>
      <div className="share-panel">
        <Users size={30} />
        <h2>Invite another host to get started</h2>
        <p>
          Share the sign-in page with an existing Mentor, Journalist, Admin,
          CustomerSupport or SuperAdmin. Host permissions come from their
          existing account.
        </p>
        <button className="primary" onClick={() => copy(location.origin)}>
          Copy sign-in link <Copy size={16} />
        </button>
        <p className="muted small-text">
          Administrators can review bookings across hosts. Team hosts can
          publish individual meeting times, or use automatic round-robin
          assignment for dated invitations.
        </p>
      </div>
    </>
  );
}
