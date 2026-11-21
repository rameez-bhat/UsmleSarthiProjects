import React, { useState, useEffect } from "react";
import { sendEmailVerification } from "firebase/auth";
import { zones } from "../shared/utils";
import { Check } from "lucide-react";
export function ProfileForm({ profile, save, onboarding, user, notify }) {
  const [value, setValue] = useState(profile);
  useEffect(() => setValue(profile), [profile]);
  return (
    <form
      className="settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        save(value);
      }}
    >
      {onboarding && (
        <>
          <span className="eyebrow">ONE LAST THING</span>
          <h1>Your personal booking page.</h1>
        </>
      )}
      {user && !user.emailVerified && (
        <div className="warning">
          Verify your email before saving.{" "}
          <button
            type="button"
            className="text-button"
            onClick={async () => {
              try {
                await sendEmailVerification(user);
                notify("Verification email sent.");
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Resend email
          </button>
          <button
            type="button"
            className="text-button"
            onClick={async () => {
              await user.reload();
              await user.getIdToken(true);
              notify("Email status refreshed. You can now save if verified.");
            }}
          >
            I’ve verified my email
          </button>
        </div>
      )}
      <label>
        Display name
        <input
          value={value.name}
          onChange={(e) =>
            setValue({
              ...value,
              name: e.target.value,
            })
          }
          required
          maxLength={80}
        />
      </label>
      <label>
        Booking page link
        <div className="input-prefix">
          <span>/book/</span>
          <input
            value={value.slug}
            onChange={(e) =>
              setValue({
                ...value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              })
            }
            required
            minLength={3}
            maxLength={60}
          />
        </div>
      </label>
      <label>
        Time zone
        <select
          value={value.timezone}
          onChange={(e) =>
            setValue({
              ...value,
              timezone: e.target.value,
            })
          }
        >
          {[...new Set([...zones, value.timezone])].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </label>
      <label>
        A short introduction
        <textarea
          value={value.bio}
          onChange={(e) =>
            setValue({
              ...value,
              bio: e.target.value,
            })
          }
          maxLength={500}
        />
      </label>
      <button className="primary">
        {onboarding ? "Create my booking page" : "Save profile"}
        <Check size={16} />
      </button>
    </form>
  );
}
