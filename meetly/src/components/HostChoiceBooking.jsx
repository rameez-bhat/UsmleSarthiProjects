import { CalendarHostTimes } from "./CalendarHostTimes";
import React, { useState, useEffect } from "react";
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
  const [slots, setSlots] = useState([]);
  const [requestMonth, setRequestMonth] = useState(() =>
    dateInZone(
      event.schedulingMode === "fixed" ? event.fixedStartAt : Date.now(),
      Intl.DateTimeFormat().resolvedOptions().timeZone || data.host.timezone,
    ).slice(0, 7),
  );
  const explicitTimes = event.schedulingMode === "host-slots";
  const [hostInfo, setHostInfo] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
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
    };
  }, [event.id, version, requestMonth]);
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
      {explicitTimes &&
        live &&
        authUser?.uid === (event.ownerId || data.host.id) && (
          <button
            className="secondary"
            type="button"
            onClick={async () => {
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
        )}
      {!ready ? (
        <p role="status">Checking host availability…</p>
      ) : (
        <CalendarHostTimes
          slots={slots}
          hosts={hostInfo.filter(
            (host) => !data.reschedule || host.uid === data.reschedule.ownerId,
          )}
          zone={zone}
          visibleMonth={explicitTimes ? undefined : requestMonth}
          onMonthChange={explicitTimes ? undefined : setRequestMonth}
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
          onSelect={(slot) => {
            setSelected(slot);
            setRequestId(createUUID());
          }}
          onDateChange={() => setSelected(null)}
        />
      )}
      {diagnostics && (
        <section aria-label="Organizer availability diagnostics">
          <h2>Why each host time is shown or hidden</h2>
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
                <label key={i}>
                  {q.label}
                  <textarea
                    name={`answer_${i}`}
                    required={q.required}
                    maxLength={1500}
                  />
                </label>
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
