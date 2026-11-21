import React, { useState } from "react";
import { Link2, Copy, Check, X } from "lucide-react";
import { live } from "../firebase";
import {
  loadEventShortLink,
  normalizeShortName,
  saveShortLink,
} from "../short-links";
export function EventShortLink({ event, slug, copy }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const edit = async () => {
    setOpen(true);
    setBusy(true);
    setError("");
    try {
      const existing = live ? await loadEventShortLink(event.id) : "";
      setSaved(existing);
      setName(
        existing ||
          normalizeShortName(`${slug}-${event.title}`)
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 60),
      );
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      if (!live)
        throw new Error("Short links require a connected Firebase project.");
      const result = await saveShortLink(event, slug, name);
      setSaved(result);
      setName(result);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="event-short-link" aria-label="Short booking link">
      {!open ? (
        <button type="button" className="short-link-trigger" onClick={edit}>
          <Link2 size={16} /> Create or edit short link
        </button>
      ) : (
        <div className="short-link-panel" aria-busy={busy}>
          <div className="short-link-heading">
            <span>
              <Link2 size={17} /> Short booking link
            </span>
            <button
              type="button"
              className="short-link-close"
              aria-label="Close short-link editor"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              <X size={17} />
            </button>
          </div>
          <label
            className="short-link-label"
            htmlFor={`short-link-${event.id}`}
          >
            Link name
          </label>
          <input
            id={`short-link-${event.id}`}
            className="short-link-input"
            value={name}
            disabled={busy}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="pawan-review"
          />
          <div className="short-link-preview" aria-label="Short link preview">
            <span>{location.host}/b/</span>
            <strong>{normalizeShortName(name) || "your-link"}</strong>
          </div>
          {error && (
            <p className="short-link-error" role="alert">
              {error}
            </p>
          )}
          <div className="short-link-actions">
            <button
              type="button"
              className="primary"
              disabled={busy || !name.trim()}
              onClick={save}
            >
              <Check size={15} />
              {busy ? "Please wait…" : "Save link"}
            </button>
            {saved && (
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => copy(`${location.origin}/b/${saved}`)}
              >
                <Copy size={15} />
                Copy link
              </button>
            )}
          </div>
          <p className="short-link-help">
            Opens this meeting directly. Existing links keep working.
          </p>
        </div>
      )}
    </section>
  );
}
