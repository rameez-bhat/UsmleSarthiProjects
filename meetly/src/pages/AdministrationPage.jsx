import React from "react";
import { AdminBookings } from "../components/AdminBookings";
export function AdministrationPage({ notify, viewAttendee }) {
  return <AdminBookings notify={notify} viewAttendee={viewAttendee} />;
}
