import React from "react";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Globe,
  Mail,
  Video,
  ExternalLink,
  Download,
  ArrowRight,
} from "lucide-react";
import { fmt, time, validURL } from "../shared/utils";
import { live, api } from "../firebase";
export function ManageBookingPage({
  act,
  cancelBooking,
  demo,
  downloadICS,
  loading,
  manage,
  navigate,
  setBookingPage,
  setManage,
}) {
  return (
    <div className="manage-page">
      <div className="success-icon">
        <CheckCircle2 size={36} />
      </div>
      <span className="eyebrow">
        {manage.status === "cancelled"
          ? "BOOKING CANCELLED"
          : "YOU’RE ON THE CALENDAR"}
      </span>
      <h1>
        {manage.status === "cancelled"
          ? "Plans change. That’s okay."
          : "A little time, well spent."}
      </h1>
      <p>
        {manage.eventTitle} with {manage.hostName}
      </p>
      <div className="manage-card">
        <div>
          <CalendarDays />
          {fmt(manage.startAt, manage.attendeeTimezone || manage.timezone, {
            weekday: "long",
            year: "numeric",
          })}
        </div>
        <div>
          <Clock />
          {time(
            manage.startAt,
            manage.attendeeTimezone || manage.timezone,
          )} – {time(manage.endAt, manage.attendeeTimezone || manage.timezone)}
        </div>
        <div>
          <Globe />
          {manage.attendeeTimezone || manage.timezone}
        </div>
        <div>
          <Mail />
          {manage.attendeeEmail}
        </div>
        {validURL(manage.meetingUrl) && (
          <a href={manage.meetingUrl} target="_blank" rel="noreferrer">
            <Video />
            Join meeting <ExternalLink size={15} />
          </a>
        )}
        {manage.syncStatus === "error" && (
          <p className="warning">
            The booking is saved, but calendar sync needs the host’s attention.
          </p>
        )}
        {manage.syncStatus === "pending" && (
          <p className="muted">
            Calendar sync is pending. Refresh shortly to see meeting details.
          </p>
        )}
      </div>
      {manage.status !== "cancelled" && (
        <div className="button-row">
          <button className="secondary" onClick={() => downloadICS(manage)}>
            <Download size={16} />
            Add to calendar
          </button>
          <button
            className="secondary"
            onClick={() =>
              act(async () => {
                const data = live
                  ? await api("PublicEvent", {
                      eventId: manage.eventId,
                    })
                  : {
                      host: demo.profile,
                      events: demo.events,
                    };
                setBookingPage({
                  ...data,
                  eventId: manage.eventId,
                  reschedule: manage,
                });
                setManage(null);
              })
            }
          >
            Reschedule
          </button>
          <button className="danger-text" onClick={() => cancelBooking(manage)}>
            {loading ? "Cancelling…" : "Cancel meeting"}
          </button>
        </div>
      )}
      <button className="text-button" onClick={() => navigate("/")}>
        Back to Meetly <ArrowRight size={16} />
      </button>
    </div>
  );
}
