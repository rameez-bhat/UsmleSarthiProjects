import React from "react";
import { Availability } from "../components/Availability";
import { live, api } from "../firebase";
export function AvailabilityPage({ act, notify, profile, setDemo }) {
  return (
    <Availability
      profile={profile}
      save={(v) =>
        act(async () => {
          if (live) await api("SaveAvailability", v);
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
