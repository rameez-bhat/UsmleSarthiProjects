import { BookingQuestion } from "./QuestionFields";
import { CalendarHostTimes } from "./CalendarHostTimes";
import React, { useState, useEffect, useRef } from "react";
import { createUUID, zones, fmt, time, dateInZone } from "../shared/utils";
import { live, api } from "../firebase";
import { AuthPanel } from "../components/AuthPanel";
export function HostChoiceBooking({
  event,
  data,
  getSlots,
  book,
  notify,
  authUser,
}) {
  const [chosenHost, setChosenHost] = useState(() =>
    event.eventKind === "group" && !data.reschedule
      ? new URLSearchParams(location.search).get("host") || ""
      : "",
  );
  const [slots, setSlots] = useState([]);
  const selectionRequest = useRef(0);
  const [checkingSlot, setCheckingSlot] = useState(false);
  const [provisional, setProvisional] = useState(false);
  const [requestMonth, setRequestMonth] = useState(() =>
    dateInZone(
      event.schedulingMode === "fixed" ? event.fixedStartAt : Date.now(),
      Intl.DateTimeFormat().resolvedOptions().timeZone || data.host.timezone,
    ).slice(0, 7),
  );
  const explicitTimes = event.schedulingMode === "host-slots";
  const [hostInfo, setHostInfo] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [diagnosticLogin, setDiagnosticLogin] = useState(false);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const [zone, setZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [requestId, setRequestId] = useState(createUUID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setReady(false);
    setSelected(null);
    setError("");
    getSlots(
      explicitTimes ? "" : `month:${requestMonth}`,
      event,
      data.host,
      data.reschedule,
    )
      .then((values) => {
        if (active) {
          setProvisional(values.provisional === true);
          const list = Array.isArray(values) ? values : values.slots || [];
          setSlots(
            data.reschedule
              ? list.filter((s) => s.hostUid === data.reschedule.ownerId)
              : list,
          );
          const fallback = new Map();
          const ownerId = event.ownerId || data.host.id;
          if (ownerId)
            fallback.set(ownerId, {
              uid: ownerId,
              name: data.host.name || "Organizer",
              organizer: true,
            });
          for (const slot of [...(event.hostSlots || []), ...list])
            fallback.set(slot.hostUid, {
              ...fallback.get(slot.hostUid),
              uid: slot.hostUid,
              name: slot.hostName || fallback.get(slot.hostUid)?.name || "Host",
            });
          setHostInfo(
            Array.isArray(values.hosts) ? values.hosts : [...fallback.values()],
          );
          setDiagnostics(null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      selectionRequest.current += 1;
    };
  }, [event.id, version, requestMonth]);
  const selectSlot = async (slot) => {
    const request = ++selectionRequest.current;
    setSelected(null);
    setError("");
    setCheckingSlot(true);
    try {
      if (live && provisional) {
        const result = await api("Slots", {
          eventId: event.id,
          hostUid: slot.hostUid,
          startAt: slot.start,
        });
        if (request !== selectionRequest.current) return;
        if (
          !result.slots?.some(
            (candidate) =>
              candidate.hostUid === slot.hostUid &&
              candidate.start === slot.start,
          )
        ) {
          setSlots((old) =>
            old.filter(
              (candidate) =>
                !(
                  candidate.hostUid === slot.hostUid &&
                  candidate.start === slot.start
                ),
            ),
          );
          throw new Error(
            "This time is no longer available for this host. Please choose another time.",
          );
        }
      }
      if (request !== selectionRequest.current) return;
      setSelected(slot);
      setRequestId(createUUID());
    } catch (problem) {
      if (request === selectionRequest.current) setError(problem.message);
    } finally {
      if (request === selectionRequest.current) setCheckingSlot(false);
    }
  };
  return (
    <section className="team-booking-page">
      <span className="eyebrow">CHOOSE YOUR HOST AND TIME</span>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>
        {event.duration} minutes ·{" "}
        {event.audience === "registered"
          ? "Registered users only"
          : "Anyone with the link"}
      </p>
      <label>
        Display time zone
        <select value={zone} onChange={(e) => setZone(e.target.value)}>
          {[...new Set([zone, ...zones])].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </label>
      <button
        className="secondary"
        type="button"
        onClick={() => setVersion((v) => v + 1)}
      >
        Refresh available times
      </button>
      {error && <p role="alert">{error}</p>}
      {live && (
        <section className="availability-tools">
          {authUser && (
            <>
              <p className="small-text">
                {authUser
                  ? `Signed in on SAMAY as ${authUser.email || authUser.displayName || "a registered account"}.`
                  : "You are not signed in on this SAMAY website. Sign-in on another website does not establish this site's session."}
              </p>
              <button
                className="secondary"
                type="button"
                onClick={async () => {
                  setError("");
                  if (!authUser) {
                    setDiagnosticLogin(true);
                    setError(
                      "Sign in here as the event organizer to inspect availability reasons.",
                    );
                    return;
                  }
                  try {
                    const result = await api("Slots", {
                      eventId: event.id,
                      diagnostics: true,
                    });
                    setDiagnostics(result);
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Check host availability reasons
              </button>
            </>
          )}
          {diagnosticLogin && !authUser && <AuthPanel notify={notify} />}
        </section>
      )}
      {provisional && (
        <p className="small-text">
          Published times load directly. Select a time to verify live calendar
          availability before booking.
        </p>
      )}
      {checkingSlot && (
        <p role="status">
          Checking this host’s calendar for your selected time…
        </p>
      )}
      {!ready ? (
        <p role="status">Checking host availability…</p>
      ) : event.eventKind === "group" && !chosenHost && !data.reschedule ? (
        <section aria-label="Choose a host for this event">
          <h2>Choose your host for {event.title}</h2>
          {!hostInfo.length && (
            <p>
              No hosts are currently available for this group. Please check
              again later.
            </p>
          )}
          <div className="group-host-grid">
            {hostInfo.map((host) => (
              <button
                type="button"
                key={host.uid}
                className="group-host-tile"
                onClick={() => setChosenHost(host.uid)}
              >
                <span className="host-tile-avatar" aria-hidden="true">
                  {(host.name || "Host")
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <h3>
                    {host.name}
                    {host.organizer ? " (Organizer)" : ""}
                  </h3>
                  <p>
                    {slots.filter((slot) => slot.hostUid === host.uid).length}{" "}
                    published times
                  </p>
                  <span>View available times</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          {chosenHost && !data.reschedule && (
            <div className="info-banner">
              <p>
                {hostInfo.some((host) => host.uid === chosenHost)
                  ? `You are booking ${event.title} with ${hostInfo.find((host) => host.uid === chosenHost)?.name}.`
                  : "This host is not available for this event."}
              </p>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  selectionRequest.current += 1;
                  setSelected(null);
                  setChosenHost("");
                }}
              >
                Choose another host
              </button>
            </div>
          )}
          <CalendarHostTimes
            slots={
              chosenHost
                ? slots.filter((slot) => slot.hostUid === chosenHost)
                : slots
            }
            hosts={hostInfo.filter(
              (host) =>
                (!chosenHost || host.uid === chosenHost) &&
                (!data.reschedule || host.uid === data.reschedule.ownerId),
            )}
            zone={zone}
            visibleMonth={
              explicitTimes || event.schedulingMode === "fixed"
                ? undefined
                : requestMonth
            }
            onMonthChange={
              explicitTimes || event.schedulingMode === "fixed"
                ? undefined
                : setRequestMonth
            }
            minMonth={
              event.schedulingMode === "fixed"
                ? requestMonth
                : dateInZone(Date.now(), zone).slice(0, 7)
            }
            maxMonth={
              event.schedulingMode === "fixed"
                ? requestMonth
                : dateInZone(
                    Date.now() + (event.horizonDays || 60) * 86400000,
                    zone,
                  ).slice(0, 7)
            }
            selected={selected}
            onSelect={selectSlot}
            onDateChange={() => {
              selectionRequest.current += 1;
              setCheckingSlot(false);
              setSelected(null);
            }}
          />
        </>
      )}
      {diagnostics && (
        <section aria-label="Organizer availability diagnostics">
          <h2>Why each host time is shown or hidden</h2>
          {(diagnostics.hosts || []).map((host) => (
            <p key={host.uid}>
              <strong>{host.name}</strong>: {host.publishedCount} saved times;{" "}
              {host.availableCount} available.
            </p>
          ))}
          {!diagnostics.diagnostics?.length && (
            <p>
              No saved host times were returned for this event. Reopen the event
              editor and check that its dates and times were saved.
            </p>
          )}
          {(diagnostics.diagnostics || []).map((row) => (
            <p key={`${row.hostUid}_${row.startAt}`}>
              <strong>{row.hostName}</strong> ·{" "}
              {fmt(row.startAt, zone, { year: "numeric" })}{" "}
              {time(row.startAt, zone)} ·{" "}
              {availabilityReasonLabels[row.reason] ||
                "Availability check failed"}
            </p>
          ))}
        </section>
      )}
      {selected && (
        <>
          <h2>Your booking details</h2>
          <p className="info-banner team-booking-confirmation" role="status">
            <strong>You are booking with {selected.hostName}.</strong>
          </p>
          <p>
            {fmt(selected.start, zone, {
              year: "numeric",
            })}{" "}
            at {time(selected.start, zone)} · {zone}
          </p>
          {event.audience === "registered" && !authUser ? (
            <AuthPanel notify={notify} signInOnly />
          ) : (
            <form
              className="booking-form"
              aria-label="Host meeting registration"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                setSubmitting(true);
                try {
                  await book(
                    {
                      hostUid: selected.hostUid,
                      startAt: selected.start,
                      name: form.get("name"),
                      email:
                        event.audience === "registered"
                          ? authUser.email
                          : form.get("email"),
                      notes: form.get("notes"),
                      answers: (event.questions || []).map(
                        (_, i) => form.get(`answer_${i}`) || "",
                      ),
                      timezone: zone,
                      requestId,
                    },
                    event,
                    data.reschedule,
                  );
                } catch (err) {
                  setError(err.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <label>
                Your name
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={
                    data.reschedule?.attendeeName || authUser?.displayName || ""
                  }
                  readOnly={!!data.reschedule}
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  defaultValue={
                    data.reschedule?.attendeeEmail || authUser?.email || ""
                  }
                  readOnly={
                    !!data.reschedule || event.audience === "registered"
                  }
                />
              </label>
              {(event.questions || []).map((q, i) => (
                <BookingQuestion
                  key={i}
                  question={q}
                  index={i}
                  value={data.reschedule?.answers?.[i]}
                />
              ))}
              <label>
                Notes
                <textarea
                  name="notes"
                  maxLength={2000}
                  defaultValue={data.reschedule?.notes || ""}
                />
              </label>
              <button className="primary" disabled={submitting}>
                {submitting
                  ? "Confirming…"
                  : `Confirm booking with ${selected.hostName}`}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}

const availabilityReasonLabels = {
  available: "Available to book",
  past: "This meeting time has passed",
  minimum_notice: "Inside the minimum booking notice",
  booking_horizon: "Outside the booking horizon",
  daily_limit: "Host daily booking limit reached",
  existing_booking: "Overlaps an existing booking or its buffer",
  calendar_busy: "Host's connected calendar is busy, including buffers",
  calendar_configuration:
    "Host calendar connection or backend OAuth configuration needs attention",
  host_access: "Host account permission needs attention",
  availability_check_failed:
    "Could not verify host availability; check schedulerSlots logs and reconnect the host's calendar if needed",
};
