import React from "react";
import { Availability } from "../components/Availability";
import { live } from "../firebase";
import { saveSchedulerAvailability } from "../firestore-scheduler";
export function AvailabilityPage({ act, notify, profile, setDemo }) {
  return (
    <Availability
      profile={profile}
      save={(v) =>
        act(async () => {
          if (live) await saveSchedulerAvailability(v);
          else
            setDemo((d) => ({
              ...d,
              profile: {
                ...d.profile,
                ...v,
              },
            }));
          notify("Availability saved.");
        })
      }
    />
  );
}
