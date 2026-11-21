import React, { useState } from "react";
import { Clock, ArrowRight } from "lucide-react";
import { fmt, time } from "../shared/utils";
import { HostChoiceBooking } from "../components/HostChoiceBooking";
import { AssignedInvitation } from "../components/AssignedInvitation";
export function BookingPage({ data, getSlots, book, notify, authUser }) {
  const [event, setEvent] = useState(
    data.events.find((e) => e.id === data.eventId) || null,
  );
  if (!event)
    return (
      <div className="public-directory">
        <div className="avatar large">
          {data.host.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </div>
        <span className="eyebrow">LET’S FIND A LITTLE TIME</span>
        <h1>Meet with {data.host.name}.</h1>
        <p>{data.host.bio}</p>
        <div className="public-event-list">
          {data.events.map((e) => (
            <button
              key={e.id}
              onClick={() => setEvent(e)}
              style={{
                "--event-color": e.color,
              }}
            >
              <span className="color-dot" />
              <div>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <p>
                  {e.audience === "registered"
                    ? "Registered users only"
                    : "Anyone with the link"}
                  {e.schedulingMode === "fixed"
                    ? ` · ${fmt(e.fixedStartAt, data.host.timezone, {
                        year: "numeric",
                      })} ${time(e.fixedStartAt, data.host.timezone)} (${data.host.timezone})`
                    : ""}
                </p>
                <span>
                  <Clock size={15} />
                  {e.duration} minutes
                </span>
              </div>
              <ArrowRight size={22} />
            </button>
          ))}
        </div>
      </div>
    );

  if (event.assignedCount)
    return (
      <AssignedInvitation
        key={authUser?.uid || "guest"}
        event={event}
        zone={
          Intl.DateTimeFormat().resolvedOptions().timeZone || data.host.timezone
        }
        authUser={authUser}
        organizerId={data.host.id}
        notify={notify}
      />
    );
  return (
    <HostChoiceBooking
      key={event.id}
      event={event}
      data={data}
      getSlots={getSlots}
      book={book}
      notify={notify}
      authUser={authUser}
    />
  );
}
