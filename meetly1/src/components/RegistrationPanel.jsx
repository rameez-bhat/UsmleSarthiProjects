import React, { useState, useEffect } from "react";
import { api } from "../firebase";
export function RegistrationPanel({ id, token, initial = null }) {
  const [receipt, setReceipt] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");
    api("Registration", {
      id,
      token,
    })
      .then((data) => {
        if (active) setReceipt(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [id, token, version]);
  const cancel = async () => {
    setBusy(true);
    setError("");
    try {
      setReceipt(
        await api("Registration", {
          id,
          token,
          cancel: true,
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="auth-card">
      <h1>
        {receipt?.status === "cancelled"
          ? "Registration cancelled"
          : "Your meeting registration"}
      </h1>
      {busy && <p role="status">Loading registration…</p>}
      {error && <p role="alert">{error}</p>}
      {receipt && (
        <>
          <h2>{receipt.eventTitle}</h2>
          <p>
            {receipt.attendeeName} · {receipt.attendeeEmail}
          </p>
          <p>With {receipt.hostName}</p>
          <p>
            {new Date(receipt.startAt).toLocaleString()} ·{" "}
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <p>{receipt.status}</p>
          {receipt.status === "confirmed" && (
            <>
              {/^https:\/\//i.test(receipt.meetingUrl) ? (
                <a
                  className="primary"
                  href={receipt.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join meeting
                </a>
              ) : (
                <p>
                  {receipt.syncStatus === "error"
                    ? "Joining instructions are being updated. Contact your host."
                    : "Your joining link is being prepared and will appear here shortly."}
                </p>
              )}
              <button
                className="secondary"
                disabled={
                  busy ||
                  Date.now() >=
                    receipt.startAt - (receipt.cancelHours || 0) * 3600000
                }
                onClick={cancel}
              >
                Cancel my registration
              </button>
            </>
          )}
          <p>
            <a
              href={`${location.origin}/registration/${id}?token=${encodeURIComponent(token)}`}
            >
              Save your private confirmation link
            </a>
          </p>
        </>
      )}
      <button
        className="secondary"
        disabled={busy}
        onClick={() => setVersion((v) => v + 1)}
      >
        Refresh registration
      </button>
    </section>
  );
}
