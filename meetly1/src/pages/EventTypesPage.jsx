import React from "react";
import { initialEvent, fmt, time } from "../shared/utils";
import {
  Plus,
  CalendarDays,
  Clock,
  Link2,
  ArrowUpRight,
  Video,
  MapPin,
  Phone,
  Copy,
  ArrowRight,
} from "lucide-react";
export function EventTypesPage({
  deleteEvent,
  connections,
  copy,
  eventLink,
  events,
  goPage,
  navigate,
  profile,
  saveEvent,
  setModal,
  upcoming,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR TIME, THOUGHTFULLY SHARED</span>
          <h1>
            Good meetings start here<span>.</span>
          </h1>
          <p>
            A home for every kind of conversation. Set it up once, share it
            anytime.
          </p>
        </div>
        <button
          className="primary"
          onClick={() =>
            setModal({
              type: "event",
              event: {
                ...initialEvent,
              },
            })
          }
        >
          <Plus size={18} />
          New event type
        </button>
      </div>
      <div className="overview-strip">
        <div>
          <span className="metric-icon green">
            <CalendarDays size={20} />
          </span>
          <div>
            <strong>{events.filter((e) => e.active).length}</strong>
            <span>Active event types</span>
          </div>
        </div>
        <div>
          <span className="metric-icon amber">
            <Clock size={20} />
          </span>
          <div>
            <strong>{upcoming.length}</strong>
            <span>Upcoming meetings</span>
          </div>
        </div>
        <div>
          <span className="metric-icon purple">
            <Link2 size={20} />
          </span>
          <div>
            <strong>
              {connections.length}
              <small> / 2</small>
            </strong>
            <span>Calendars connected</span>
          </div>
        </div>
        <div className="booking-link-mini">
          <span>Your personal booking page</span>
          <button onClick={() => navigate(`/book/${profile.slug}`)}>
            {profile.slug}
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
      <div className="section-top">
        <div>
          <h2>
            Your event types <span>{events.length}</span>
          </h2>
          <p>One link. The right conversation.</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate(`/book/${profile.slug}`)}
        >
          View booking page <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="section-top">
        <div>
          <h2>Meetings on a specific date</h2>
          <p>Create one meeting at an exact time and share its booking link.</p>
        </div>
        <button
          className="primary"
          onClick={() =>
            setModal({
              type: "event",
              event: {
                ...initialEvent,
                schedulingMode: "fixed",
                minNotice: 0,
              },
            })
          }
        >
          <Plus size={18} />
          New dated meeting
        </button>
      </div>
      <div className="event-grid">
        {events.map((e) => (
          <article
            className={"event-card" + (!e.active ? " paused" : "")}
            key={e.id}
            style={{
              "--event-color": e.color,
            }}
          >
            <div className="event-card-top">
              <span className="event-symbol">
                <Video size={21} />
              </span>
              <button
                className={"toggle " + (e.active ? "on" : "")}
                aria-label={`${e.active ? "Pause" : "Enable"} ${e.title}`}
                aria-pressed={e.active}
                onClick={() =>
                  saveEvent({
                    ...e,
                    active: !e.active,
                  })
                }
              >
                <span />
              </button>
            </div>
            <p className="small-text muted">
              {e.participantUids?.length
                ? "Calendar sync status is shown in Bookings."
                : "Booking link — a calendar appointment is created after registration."}
            </p>
            <span className="event-kind">
              {e.schedulingMode === "fixed" ? "DATED MEETING" : "ONE-ON-ONE"}
            </span>
            <h3>{e.title}</h3>
            {e.schedulingMode === "fixed" && (
              <p className="meeting-date">
                <CalendarDays size={15} />
                <span>
                  {fmt(e.fixedStartAt, profile.timezone, {
                    year: "numeric",
                  })}{" "}
                  · {time(e.fixedStartAt, profile.timezone)} ({profile.timezone}
                  )
                </span>
              </p>
            )}
            <span className="badge neutral">
              {e.audience === "registered"
                ? "Registered users only"
                : "Anyone with the link"}
            </span>
            <p>
              {e.description ||
                "A focused conversation, at a time that works for both of you."}
            </p>
            <div className="event-meta">
              <span>
                <Clock size={15} />
                {e.duration} min
              </span>
              <span>
                {e.location === "in-person" ? (
                  <MapPin size={15} />
                ) : e.location === "phone" ? (
                  <Phone size={15} />
                ) : (
                  <Video size={15} />
                )}
                {
                  {
                    "google-meet": "Google Meet",
                    teams: "Microsoft Teams",
                    custom: "Meeting link",
                    phone: "Phone call",
                    "in-person": "In person",
                  }[e.location]
                }
              </span>
            </div>
            <div className="event-card-bottom">
              <button onClick={() => copy(eventLink(e))}>
                <Copy size={15} />
                Copy link
              </button>
              <button
                onClick={() =>
                  setModal({
                    type: "event",
                    event: e,
                  })
                }
              >
                Edit <ArrowUpRight size={15} />
              </button>
              <button
                type="button"
                className="danger-text"
                onClick={() => deleteEvent(e)}
              >
                Delete event
              </button>
            </div>
          </article>
        ))}
        <button
          className="new-event-card"
          onClick={() =>
            setModal({
              type: "event",
              event: {
                ...initialEvent,
              },
            })
          }
        >
          <span>
            <Plus size={24} />
          </span>
          <strong>Make room for something new</strong>
          <p>Create a meeting that fits your day.</p>
        </button>
      </div>
      <div className="bottom-grid">
        <div className="next-card">
          <div className="section-top">
            <h2>Coming up next</h2>
            <button className="text-button" onClick={() => goPage("Bookings")}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          {upcoming.length ? (
            upcoming.slice(0, 2).map((b) => (
              <div className="next-row" key={b.id}>
                <div className="date-badge">
                  <strong>
                    {fmt(b.startAt, profile.timezone, {
                      month: undefined,
                    })}
                  </strong>
                  <span>
                    {fmt(b.startAt, profile.timezone, {
                      day: undefined,
                    })}
                  </span>
                </div>
                <div>
                  <strong>{b.eventTitle}</strong>
                  <span>
                    {b.attendeeName} · {time(b.startAt, profile.timezone)}
                  </span>
                </div>
                <span className="badge">Confirmed</span>
              </div>
            ))
          ) : (
            <div className="calm-empty">
              <CalendarDays size={26} />
              <div>
                <strong>A little breathing room.</strong>
                <p>Share a booking link to welcome your next meeting.</p>
              </div>
            </div>
          )}
        </div>
        <div className="tip-card">
          <span className="tip-number">01 / A SMALL SCHEDULING TIP</span>
          <h3>
            Give yourself
            <br />a little space.
          </h3>
          <p>
            Add a buffer between meetings.
            <br />
            Your next conversation will thank you.
          </p>
          <button onClick={() => goPage("Availability")}>
            Make time yours <ArrowUpRight size={16} />
          </button>
          <div className="tip-orbit" />
        </div>
      </div>
    </>
  );
}
