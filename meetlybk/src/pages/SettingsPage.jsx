import React from "react";
import { PageTitle } from "../components/PageTitle";
import { ProfileForm } from "../components/ProfileForm";
import { live, api } from "../firebase";
import { AlertCircle } from "lucide-react";
export function SettingsPage({
  act,
  notify,
  profile,
  setDemo,
  setModal,
  user,
}) {
  return (
    <>
      <PageTitle
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your profile & preferences."
        text="A few details to make your booking page feel like you."
      />
      <ProfileForm
        profile={profile}
        user={user}
        notify={notify}
        save={(v) =>
          act(async () => {
            if (live) await api("SaveProfile", v);
            else
              setDemo((d) => ({
                ...d,
                profile: {
                  ...d.profile,
                  ...v,
                },
              }));
            notify("Profile saved.");
          })
        }
      />
      <div className="info-banner">
        <AlertCircle />
        <p>
          {live
            ? "Firebase mode is active. Calendar connections need OAuth configuration. Emails use your existing mail service."
            : "Demo mode stores changes in this browser only. No emails are sent, and no external calendars are connected."}
        </p>
        {!live && (
          <button
            className="secondary"
            onClick={() =>
              setModal({
                type: "setup",
              })
            }
          >
            Connect Firebase
          </button>
        )}
      </div>
    </>
  );
}
