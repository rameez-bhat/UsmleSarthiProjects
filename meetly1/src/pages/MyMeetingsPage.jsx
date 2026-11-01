import React from "react";
import { MyMeetings } from "../components/MyMeetings";
export function MyMeetingsPage({ user }) {
  return <MyMeetings uid={user?.uid} />;
}
