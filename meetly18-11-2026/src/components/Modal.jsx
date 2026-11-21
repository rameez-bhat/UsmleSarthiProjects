import { QuestionEditor } from "./QuestionFields";
import { HostPhoneEditor } from "./HostPhoneEditor";
import { expandTimeRanges } from "../time-ranges";
import React, { useState, useEffect, useCallback } from "react";
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
  const [hostDrafts, setHostDrafts] = useState({});
  const [conflictEdited, setConflictEdited] = useState(false);
  useEffect(() => setConflictEdited(false), [modal.conflicts]);
  const updateHostDraft = useCallback(
    (uid, draft) => setHostDrafts((old) => ({ ...old, [uid]: draft })),
    [],
  );
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
  useEffect(() => {
    if (event && !["google-meet", "zoom", "phone"].includes(event.location)) {
      setEvent((old) => ({
        ...old,
        location: "google-meet",
        locationValue: "",
      }));
    }
  }, []);
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
        className={
          modal.type === "event" ? "modal event-editor-modal" : "modal"
        }
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
              onChangeCapture={() => {
                if (modal.conflicts?.length) setConflictEdited(true);
              }}
              onSubmit={(e) => {
                e.preventDefault();
                let slots;
                try {
                  const drafts =
                    event.schedulingMode === "host-slots"
                      ? teamHosts.map((uid) => hostDrafts[uid]).filter(Boolean)
                      : [];
                  const invalid = drafts.find(
                    (draft) => draft.dirty && draft.error,
                  );
                  if (invalid) throw new Error(invalid.error);
                  slots = expandTimeRanges(
                    [
                      ...(event.hostSlots || []),
                      ...drafts.flatMap((draft) => draft.slots),
                    ],
                    event.duration,
                  );
                  if (
                    event.schedulingMode === "host-slots" &&
                    !slots.length &&
                    event.eventKind !== "group" &&
                    !(event.selfSchedulingHostUids || []).some((uid) =>
                      teamHosts.includes(uid),
                    )
                  )
                    throw new Error(
                      "Choose a date and time or range for at least one host before saving.",
                    );
                } catch (error) {
                  setErr(error.message);
                  return;
                }
                setErr("");
                saveEvent({
                  ...event,
                  hostSlots: slots,
                  selfSchedulingHostUids: (
                    event.selfSchedulingHostUids || []
                  ).filter(
                    (uid) => teamHosts.includes(uid) && uid !== organizer?.uid,
                  ),
                  teamHostUids:
                    event.schedulingMode === "host-slots"
                      ? (event.teamHostUids || []).filter(
                          (uid) =>
                            event.eventKind === "group" ||
                            slots.some((slot) => slot.hostUid === uid) ||
                            (event.selfSchedulingHostUids || []).includes(uid),
                        )
                      : event.teamHostUids,
                  id: event.id || saveRequestId,
                });
              }}
            >
              {err && <p role="alert">{err}</p>}
              {!!modal.conflicts?.length && (
                <section role="alert" className="info-banner">
                  <p>
                    These hosts already have meetings at the selected times:
                  </p>
                  <ul>
                    {modal.conflicts.map((item) => (
                      <li key={`${item.hostUid}_${item.startAt}`}>
                        {item.hostName} —{" "}
                        {new Date(item.startAt).toLocaleString(undefined, {
                          timeZone: hostTimezone || "UTC",
                        })}{" "}
                        ({hostTimezone || "UTC"})
                      </li>
                    ))}
                  </ul>
                  <p>
                    Save only the available dates and times? Only the
                    conflicting appointments will be removed; other times for
                    the same host are kept.
                  </p>
                  {conflictEdited && (
                    <p>
                      The schedule changed. Click Save to check the updated
                      times before confirming.
                    </p>
                  )}
                  {!Array.isArray(modal.remainingSlots) ? (
                    <p>Choose different times and click Save to check again.</p>
                  ) : !modal.remainingSlots.length ? (
                    <p>
                      No available appointments remain. Choose different dates
                      or times.
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="primary"
                      disabled={loading || conflictEdited}
                      onClick={() => {
                        const slots = modal.remainingSlots;
                        if (!Array.isArray(slots)) {
                          setErr(
                            "Update schedulerSaveEvent, then click Save again to check individual conflicts.",
                          );
                          return;
                        }
                        if (!slots.length) return;
                        // Use exactly the event and free slots checked by the server.
                        // SaveEvent rechecks calendars before committing this retry.
                        const candidate = modal.event;
                        saveEvent({
                          ...candidate,
                          hostSlots: slots,
                          teamHostUids: (candidate.teamHostUids || []).filter(
                            (uid) =>
                              candidate.eventKind === "group" ||
                              slots.some((slot) => slot.hostUid === uid) ||
                              (candidate.selfSchedulingHostUids || []).includes(
                                uid,
                              ),
                          ),
                          id: candidate.id || saveRequestId,
                        });
                      }}
                    >
                      Save without conflicting dates and times
                    </button>
                  )}
                </section>
              )}

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
                    event.eventKind === "group"
                      ? "group"
                      : event.scheduleCategory ||
                        event.schedulingMode ||
                        "recurring"
                  }
                  onChange={(e) =>
                    setEvent((old) => ({
                      ...old,
                      eventKind:
                        e.target.value === "group" ? "group" : "individual",
                      scheduleCategory:
                        e.target.value === "group"
                          ? "host-slots"
                          : e.target.value,
                      multipleHostTimes: !old.participantUids?.length,
                      schedulingMode:
                        !old.participantUids?.length ||
                        ["host-slots", "group"].includes(e.target.value)
                          ? "host-slots"
                          : e.target.value,
                      assignmentMode:
                        !old.participantUids?.length ||
                        ["host-slots", "group"].includes(e.target.value)
                          ? "host-choice"
                          : "named",
                    }))
                  }
                >
                  <option value="recurring">Recurring availability</option>
                  <option value="fixed">Specific dates and times</option>
                  <option
                    value="group"
                    disabled={!!event.participantUids?.length}
                  >
                    Group event — one topic, multiple hosts
                  </option>
                  <option value="host-slots">
                    Round-robin team — let visitors choose a host and time
                  </option>
                </select>
              </label>
              {event.eventKind === "group" && (
                <p className="info-banner">
                  Group event: create the topic first, then open the group to
                  add hosts, switch them on/off and manage each host’s slots.
                  You can also select hosts below. Share the main event link for
                  host selection, or copy a host-specific link from the event
                  card. Each booking is with one selected host.
                </p>
              )}
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
                        selfSchedulingHostUids: e.target.checked
                          ? old.selfSchedulingHostUids || []
                          : [],
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
                        selfSchedulingHostUids: (
                          old.selfSchedulingHostUids || []
                        ).filter((uid) => uids.includes(uid)),
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
                    duration={event.duration}
                    selfSchedulingHostUids={event.selfSchedulingHostUids || []}
                    onSelfSchedulingChange={(uids) =>
                      change("selfSchedulingHostUids", uids)
                    }
                    onDraftChange={updateHostDraft}
                    hostUids={
                      modal.focusHostUid ? [modal.focusHostUid] : teamHosts
                    }
                    organizer={organizer}
                    value={
                      modal.focusHostUid
                        ? (event.hostSlots || []).filter(
                            (slot) => slot.hostUid === modal.focusHostUid,
                          )
                        : event.hostSlots || []
                    }
                    onChange={(slots) =>
                      change(
                        "hostSlots",
                        modal.focusHostUid
                          ? [
                              ...(event.hostSlots || []).filter(
                                (slot) => slot.hostUid !== modal.focusHostUid,
                              ),
                              ...slots,
                            ]
                          : slots,
                      )
                    }
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
                        selected team. Invite users above. SAMAY assigns one
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
                  Color
                  <input
                    type="color"
                    value={event.color}
                    onChange={(e) => change("color", e.target.value)}
                  />
                </label>
              </div>
              <HostPhoneEditor
                uids={teamHosts}
                organizer={organizer}
                value={event.hostLocations || {}}
                defaultLocation={event.location}
                defaultLink={event.locationValue}
                legacyPhones={event.hostPhones}
                onChange={(choices) =>
                  setEvent((old) => ({
                    ...old,
                    hostLocations: choices,
                    ...(choices[organizer?.uid]
                      ? {
                          location: choices[organizer.uid].location,
                          locationValue:
                            choices[organizer.uid].locationValue || "",
                        }
                      : {}),
                  }))
                }
              />
              {event.location === "meetly" && (
                <p className="small-text muted">
                  Video opens inside SAMAY using your configured Jitsi server.
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
                <p className="small-text">
                  Set both buffers to 0 to allow consecutive meetings, such as
                  one ending at 11:00 and the next starting at 11:00. Existing
                  confirmed bookings retain their saved buffers.
                </p>
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
                  <QuestionEditor
                    key={i}
                    question={q}
                    index={i}
                    onChange={(question) =>
                      change(
                        "questions",
                        event.questions.map((old, j) =>
                          j === i ? question : old,
                        ),
                      )
                    }
                    onRemove={() =>
                      change(
                        "questions",
                        event.questions.filter((_, j) => j !== i),
                      )
                    }
                  />
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
                        type: "text",
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
