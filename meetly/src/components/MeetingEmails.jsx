import React, { useState } from "react";
import { defaultEmails } from "../shared/utils";
import { api } from "../firebase";
import { EmailSettingsFields } from "../components/EmailSettingsFields";
export function MeetingEmails({ booking }) {
  const [open, setOpen] = useState(false),
    [data, setData] = useState(null),
    [settings, setSettings] = useState(defaultEmails),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const load = async (action, mailId) => {
    setBusy(true);
    setError("");
    try {
      const result = await api("MeetingEmails", {
        id: booking.id,
        ...(action
          ? {
              action,
            }
          : {}),
        ...(mailId
          ? {
              mailId,
            }
          : {}),
      });
      setData(result);
      setSettings(result.settings);
      if (action)
        setMessage(
          action === "retry"
            ? "The failed email was queued for retry."
            : "Pending invitations were queued. Previously queued messages were retained.",
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="meeting-emails">
      <button
        type="button"
        className="secondary"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
      >
        Email settings & delivery
      </button>
      {open && (
        <section className="email-status-panel">
          <h3>Email notifications</h3>
          {busy && <p role="status">Loading email settings…</p>}
          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
          {data && (
            <>
              {!data.emailEnabled && !data.messages.length && (
                <p>
                  Email delivery needs to be enabled by your administrator
                  before messages can be sent.
                </p>
              )}
              <EmailSettingsFields value={settings} onChange={setSettings} />
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await api("SaveNotifications", {
                      eventId: data.eventId,
                      notifications: settings,
                    });
                    setMessage("Email settings saved.");
                    await load();
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Save email settings
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => load("invitations")}
              >
                Send pending invitations
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => load()}
              >
                Refresh delivery status
              </button>
              <p className="small-text muted">
                Notices use your existing mail service. A queued message is not
                proof of delivery; sent/failed status appears only if your
                service records it.
              </p>
              <div className="email-delivery-list">
                {!data.messages.length ? (
                  <p>No email notices have been queued for this meeting yet.</p>
                ) : (
                  data.messages.map((row) => (
                    <article key={row.id}>
                      <strong>{row.subject}</strong>
                      <p>{row.to.join(", ")}</p>
                      <p>
                        {{
                          PENDING: "Queued",
                          PROCESSING: "Sending",
                          SUCCESS: "Sent to mail server",
                          FORWARDED: "Queued in your mail service",
                          ERROR: "Failed",
                          RETRY: "Queued for retry",
                        }[row.state] || row.state}
                      </p>
                      {row.hasError && (
                        <p>
                          Email delivery failed. Ask your administrator to check
                          the email provider configuration.
                        </p>
                      )}
                      {row.state === "ERROR" && (
                        <button
                          type="button"
                          disabled={busy}
                          className="secondary"
                          onClick={() => load("retry", row.id)}
                        >
                          Retry failed email
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
