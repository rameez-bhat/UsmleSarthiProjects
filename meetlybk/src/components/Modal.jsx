import React, { useState, useEffect } from "react";
import { createUUID } from "../shared/utils";
import { X, Plus, Check, ArrowRight } from "lucide-react";
import { UserPicker } from "../components/UserPicker";
import { HostSlotEditor } from "../components/HostSlotEditor";
import { EmailSettingsFields } from "../components/EmailSettingsFields";
import { AttendeePanel } from "../components/AttendeePanel";
export function Modal({
  modal,
  close,
  saveEvent,
  loading,
  hostTimezone,
  organizer,
}) {
  const [saveRequestId] = useState(createUUID);
  const [event, setEvent] = useState(() =>
      !modal.event?.id && !modal.event?.participantUids?.length
        ? {
            ...modal.event,
            multipleHostTimes: true,
            scheduleCategory: modal.event?.schedulingMode || "recurring",
            schedulingMode: "host-slots",
            assignmentMode: "host-choice",
          }
        : modal.event,
    ),
    [config, setConfig] = useState(""),
    [err, setErr] = useState("");
  const teamHosts = [
    ...new Set(
      [organizer?.uid, ...(event?.teamHostUids || [])].filter(Boolean),
    ),
  ];
  useEffect(() => {
    const last = document.activeElement;
    const key = (e) => {
      if (e.key === "Escape" && !loading) close();
      if (e.key === "Tab") {
        const nodes = [
          ...document.querySelectorAll(
            ".modal button:not([disabled]),.modal input,.modal select,.modal textarea",
          ),
        ].filter((el) => el.offsetParent !== null);
        if (!nodes.length) return;
        const a = nodes[0],
          b = nodes.at(-1);
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    document.querySelector(".modal button")?.focus();
    return () => {
      document.removeEventListener("keydown", key);
      last?.focus();
    };
  }, [loading]);
  const change = (k, v) =>
    setEvent((e) => ({
      ...e,
      [k]: v,
    }));
  return (
    <div className="modal-overlay">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={close}
          disabled={loading}
        >
          <X size={21} />
        </button>
        {modal.type === "event" ? (
          <>
            <span className="eyebrow">A SPACE FOR CONVERSATION</span>
            <h2 id="dialog-title">
              {event.id ? "Edit event type" : "Create an event type"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEvent({
                  ...event,
                  id: event.id || saveRequestId,
                });
              }}
            >
              <label>
                Event name
                <input
                  required
                  maxLength={80}
                  value={event.title}
                  onChange={(e) => change("title", e.target.value)}
                  placeholder="A good conversation"
                />
              </label>
              {event.id && (
                <p className="info-banner">
                  Changes to this booking link apply to future registrations.
                  Existing booked calendar appointments and Zoom links are not
                  replaced. Cancel and rebook an appointment to change its
                  meeting provider.
                </p>
              )}
              <label>
                Meeting schedule
                <select
                  value={
                    event.scheduleCategory ||
                    event.schedulingMode ||
                    "recurring"
                  }
                  onChange={(e) =>
                    setEvent((old) => ({
                      ...old,
                      scheduleCategory: e.target.value,
                      multipleHostTimes: !old.participantUids?.length,
                      schedulingMode:
                        !old.participantUids?.length ||
                        e.target.value === "host-slots"
                          ? "host-slots"
                          : e.target.value,
                      assignmentMode:
                        !old.participantUids?.length ||
                        e.target.value === "host-slots"
                          ? "host-choice"
                          : "named",
                    }))
                  }
                >
                  <option value="recurring">Recurring availability</option>
                  <option value="fixed">Specific dates and times</option>
                  <option value="host-slots">
                    Round-robin team — let visitors choose a host and time
                  </option>
                </select>
              </label>
              {(event.scheduleCategory || event.schedulingMode) !==
                "host-slots" && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!event.multipleHostTimes}
                    disabled={!!event.participantUids?.length}
                    onChange={(e) =>
                      setEvent((old) => ({
                        ...old,
                        multipleHostTimes: e.target.checked,
                        hostSlots:
                          e.target.checked &&
                          !old.hostSlots?.length &&
                          old.meetingDate
                            ? [
                                {
                                  hostUid: organizer?.uid,
                                  date: old.meetingDate,
                                  time: old.meetingTime || "09:00",
                                  timezone:
                                    old.meetingTimezone ||
                                    hostTimezone ||
                                    "UTC",
                                },
                              ]
                            : old.hostSlots || [],
                        scheduleCategory:
                          old.scheduleCategory ||
                          old.schedulingMode ||
                          "recurring",
                        schedulingMode: e.target.checked
                          ? "host-slots"
                          : old.scheduleCategory || "recurring",
                        assignmentMode: e.target.checked
                          ? "host-choice"
                          : "named",
                      }))
                    }
                  />
                  Publish multiple dates and times for each host
                </label>
              )}
              {(event.scheduleCategory || event.schedulingMode) !==
                "host-slots" && (
                <p className="small-text muted">
                  Multiple dates are enabled by default. Turn this off only to
                  use weekly availability or create one shared appointment with
                  invited attendees.
                </p>
              )}
              {!!event.participantUids?.length && (
                <p className="small-text muted">
                  Assigned invitations refer to one shared appointment. To
                  publish multiple self-booking options, use a separate event
                  without preassigned invitees.
                </p>
              )}
              {event.schedulingMode === "host-slots" && (
                <>
                  <p className="small-text muted">
                    {organizer?.name || "The organizer"} is included as a host
                    alongside selected team members. Add meeting times for each
                    host. Visitors choose a published time and its named host.
                    This differs from automatic round-robin assignment for a
                    dated invitation.
                  </p>
                  <UserPicker
                    kind="hosts"
                    value={event.teamHostUids || []}
                    onChange={(uids) =>
                      setEvent((old) => ({
                        ...old,
                        teamHostUids: uids,
                        hostSlots: (old.hostSlots || []).filter(
                          (slot) =>
                            slot.hostUid === organizer?.uid ||
                            uids.includes(slot.hostUid),
                        ),
                      }))
                    }
                  />
                  <label>
                    Booking closes before each appointment (minutes)
                    <input
                      type="number"
                      min="0"
                      max="10080"
                      required
                      value={event.minNotice}
                      onChange={(e) => change("minNotice", +e.target.value)}
                    />
                  </label>
                  <p className="small-text muted">
                    Use 0 to allow booking until the appointment starts. Saving
                    dates is allowed at any time; past appointments and
                    appointments inside this cutoff are hidden from visitors.
                    Your explicitly selected dates are not restricted by a
                    rolling booking horizon.
                  </p>
                  <HostSlotEditor
                    hostUids={teamHosts}
                    organizer={organizer}
                    value={event.hostSlots || []}
                    onChange={(slots) => change("hostSlots", slots)}
                    timezone={hostTimezone}
                  />
                </>
              )}
              {event.schedulingMode === "fixed" && (
                <>
                  {event.id && event.participantUids?.length > 0 && (
                    <p className="small-text muted">
                      For a saved assigned meeting, cancel it from Bookings and
                      create a new meeting to change settings or attendees.
                    </p>
                  )}
                  <UserPicker
                    value={event.participantUids || []}
                    onChange={(uids) => change("participantUids", uids)}
                  />
                  <label>
                    Meeting capacity (invitees and public bookings)
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={event.capacity || 100}
                      onChange={(e) =>
                        change("capacity", Number(e.target.value))
                      }
                    />
                  </label>
                  <label>
                    Host assignment
                    <select
                      value={event.assignmentMode || "named"}
                      onChange={(e) => change("assignmentMode", e.target.value)}
                    >
                      <option value="named">Host this meeting myself</option>
                      <option value="round-robin">
                        Round robin — assign an available team host
                      </option>
                    </select>
                  </label>
                  {event.assignmentMode === "round-robin" && (
                    <>
                      <UserPicker
                        kind="hosts"
                        value={event.teamHostUids || []}
                        onChange={(uids) => change("teamHostUids", uids)}
                      />
                      <p className="small-text muted">
                        The organizer is included as a host alongside the
                        selected team. Invite users above. Meetly assigns one
                        available host using weekly hours, connected calendars,
                        booking limits and fair rotation.
                      </p>
                    </>
                  )}
                  <div className="form-row">
                    <label>
                      Meeting date
                      <input
                        type="date"
                        required
                        value={event.meetingDate || ""}
                        onChange={(e) => change("meetingDate", e.target.value)}
                      />
                    </label>
                    <label>
                      Meeting start time
                      <input
                        type="time"
                        required
                        value={event.meetingTime || "09:00"}
                        onChange={(e) => change("meetingTime", e.target.value)}
                      />
                    </label>
                  </div>
                  <p className="small-text muted">
                    Time zone:{" "}
                    {hostTimezone ||
                      event.meetingTimezone ||
                      "Your profile time zone"}
                    . With selected users this creates one shared invitation
                    meeting; users must accept before becoming confirmed
                    attendees. Without selected users it creates one bookable
                    meeting, subject to calendar conflicts. It uses the date and
                    time above instead of weekly hours.
                  </p>
                </>
              )}
              <label>
                Who can book?
                <select
                  value={event.audience || "anyone"}
                  onChange={(e) => change("audience", e.target.value)}
                >
                  <option value="anyone">Anyone with the link</option>
                  <option value="registered">Registered users only</option>
                </select>
              </label>
              {event.audience === "registered" && (
                <p className="small-text muted">
                  The attendee must sign in with a verified account that exists
                  in the USMLESarthi Users collection.
                </p>
              )}
              <label>
                Description
                <textarea
                  value={event.description}
                  onChange={(e) => change("description", e.target.value)}
                  maxLength={2000}
                />
              </label>
              <div className="form-row">
                <label>
                  Duration (minutes)
                  <input
                    type="number"
                    min="15"
                    max="240"
                    required
                    value={event.duration}
                    onChange={(e) => change("duration", +e.target.value)}
                  />
                </label>
                <label>
                  Color
                  <input
                    type="color"
                    value={event.color}
                    onChange={(e) => change("color", e.target.value)}
                  />
                </label>
              </div>
              <label>
                Location
                <select
                  value={event.location}
                  onChange={(e) => change("location", e.target.value)}
                >
                  <option value="custom">Custom meeting link</option>
                  <option value="google-meet">
                    Google Meet (automatic or paste a link)
                  </option>
                  <option value="zoom">Zoom (API or paste a link)</option>
                  <option value="meetly">Meetly video room (Jitsi)</option>
                  <option value="teams">
                    Microsoft Teams (supported Outlook accounts)
                  </option>
                  <option value="phone">Phone call</option>
                  <option value="in-person">In person</option>
                </select>
              </label>
              {["custom", "phone", "in-person", "google-meet", "zoom"].includes(
                event.location,
              ) && (
                <label>
                  {event.location === "google-meet"
                    ? "Google Meet link (optional; leave blank to generate automatically)"
                    : event.location === "zoom"
                      ? "Zoom join link (optional; leave blank to create through API)"
                      : event.location === "custom"
                        ? "Meeting URL (optional)"
                        : event.location === "phone"
                          ? "Phone number"
                          : "Address"}
                  <input
                    type={
                      ["custom", "google-meet", "zoom"].includes(event.location)
                        ? "url"
                        : "text"
                    }
                    value={event.locationValue}
                    onChange={(e) => change("locationValue", e.target.value)}
                  />
                </label>
              )}
              {event.location === "meetly" && (
                <p className="small-text muted">
                  Video opens inside Meetly using your configured Jitsi server.
                  Registered attendees must accept their invitation before
                  joining. A separate video server/provider is required.
                </p>
              )}
              <EmailSettingsFields
                value={event.notifications}
                onChange={(value) => change("notifications", value)}
              />
              <details>
                <summary>Scheduling rules & questions</summary>
                <div className="form-row">
                  {[
                    ["minNotice", "Minimum notice (minutes)", 0, 10080],
                    ["horizonDays", "Booking horizon (days)", 1, 365],
                    ["bufferBefore", "Buffer before (minutes)", 0, 120],
                    ["bufferAfter", "Buffer after (minutes)", 0, 120],
                    ["dailyLimit", "Max host bookings per day", 1, 50],
                    ["cancelHours", "Cancellation cutoff (hours)", 0, 72],
                  ]
                    .filter(
                      ([key]) =>
                        event.schedulingMode !== "host-slots" ||
                        !["minNotice", "horizonDays"].includes(key),
                    )
                    .map(([key, label, min, max]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="number"
                          required
                          min={min}
                          max={max}
                          value={event[key]}
                          onChange={(e) => change(key, +e.target.value)}
                        />
                      </label>
                    ))}
                </div>
                {event.questions.map((q, i) => (
                  <div className="question-editor" key={i}>
                    <input
                      aria-label="Question text"
                      placeholder="Your question"
                      value={q.label}
                      required
                      onChange={(e) =>
                        change(
                          "questions",
                          event.questions.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  label: e.target.value,
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          change(
                            "questions",
                            event.questions.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    required: e.target.checked,
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Remove question"
                      onClick={() =>
                        change(
                          "questions",
                          event.questions.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-button"
                  disabled={event.questions.length >= 10}
                  onClick={() =>
                    change("questions", [
                      ...event.questions,
                      {
                        label: "",
                        required: false,
                      },
                    ])
                  }
                >
                  <Plus size={15} />
                  Add a question
                </button>
              </details>
              <div className="modal-footer">
                <button className="secondary" type="button" onClick={close}>
                  Cancel
                </button>
                <button className="primary" disabled={loading}>
                  {loading ? "Saving meeting…" : "Save event type"}{" "}
                  <Check size={17} />
                </button>
              </div>
            </form>
          </>
        ) : modal.type === "setup" ? (
          <>
            <span className="eyebrow">CONNECT YOUR WORKSPACE</span>
            <h2 id="dialog-title">Your Firebase project.</h2>
            <p>
              Deploy the included backend first. Then paste your public Firebase
              web configuration as JSON.
            </p>
            <p className="small-text muted">
              Firebase console → Project settings → Your apps → Web app → SDK
              configuration. Never paste a service-account private key or OAuth
              client secret.
            </p>
            <textarea
              className="config-input"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder={
                '{"apiKey":"…","authDomain":"…","projectId":"…","appId":"…"}'
              }
            />
            {err && <p className="warning">{err}</p>}
            <button
              className="primary"
              onClick={() => {
                try {
                  const c = JSON.parse(config);
                  if (
                    !c.apiKey ||
                    !c.authDomain ||
                    !c.projectId ||
                    !c.appId ||
                    c.private_key
                  )
                    throw Error(
                      "Enter only the public web configuration with apiKey, authDomain, projectId and appId.",
                    );
                  localStorage.setItem(
                    "meetly.firebase",
                    JSON.stringify({
                      apiKey: c.apiKey,
                      authDomain: c.authDomain,
                      projectId: c.projectId,
                      appId: c.appId,
                    }),
                  );
                  location.reload();
                } catch (e) {
                  setErr(e.message);
                }
              }}
            >
              Connect project <ArrowRight size={17} />
            </button>
          </>
        ) : modal.type === "attendee" ? (
          <AttendeePanel details={modal.details} />
        ) : modal.type === "link" ? (
          <>
            <h2 id="dialog-title">Copy your link</h2>
            <input
              readOnly
              value={modal.value}
              onFocus={(e) => e.target.select()}
            />
          </>
        ) : (
          <>
            <span className="eyebrow">A QUICK CONFIRMATION</span>
            <h2 id="dialog-title">{modal.title}</h2>
            <p>{modal.body}</p>
            <div className="modal-footer">
              <button className="secondary" onClick={close}>
                {modal.cancelLabel || "Keep meeting"}
              </button>
              <button
                className="primary"
                disabled={loading}
                onClick={modal.action}
              >
                {loading
                  ? "Processing…"
                  : modal.confirmLabel || "Cancel meeting"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
