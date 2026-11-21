import React from "react";
import { SharedHostSchedules } from "../components/SharedHostSchedules";

export function ManageSlotsPage({ profile }) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Manage your slots</h1>
          <p>
            Meetings created by others where you can add or update your own
            times.
          </p>
        </div>
      </div>
      <SharedHostSchedules profile={profile} />
    </section>
  );
}
