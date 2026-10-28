import React from "react";
import { Bookings } from "../components/Bookings";
import { api } from "../firebase";
export function BookingsPage({
  act,
  bookings,
  cancelBooking,
  downloadICS,
  notify,
  profile,
  viewAttendee,
}) {
  return (
    <Bookings
      bookings={bookings}
      viewAttendee={viewAttendee}
      zone={profile.timezone}
      cancel={cancelBooking}
      download={downloadICS}
      retry={(b) =>
        act(async () => {
          await api("RetrySync", {
            id: b.id,
          });
          notify("Calendar sync queued.");
        })
      }
    />
  );
}
