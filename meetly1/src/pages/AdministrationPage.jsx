import React from "react";
import { AdminAccountManager } from "../components/AdminAccountManager";
import { AdminBookings } from "../components/AdminBookings";
export function AdministrationPage({ notify, viewAttendee }) {
  return (
    <>
      <AdminAccountManager />
      <AdminBookings notify={notify} viewAttendee={viewAttendee} />
    </>
  );
}
