const pending = new Map();
const listeners = new Set();
let snapshot = { count: 0, labels: [] };
const labels = {
  Access: "Checking account access…",
  Workspace: "Loading your dashboard…",
  SearchUsers: "Searching users…",
  SelectedUsers: "Loading selected users…",
  MeetingEmails: "Loading email notifications…",
  SaveNotifications: "Saving email settings…",
  SearchHosts: "Searching hosts…",
  MyMeetings: "Loading your meetings…",
  RespondInvitation: "Saving your invitation response…",
  AttendeeDetails: "Loading attendee details…",
  SaveProfile: "Saving your profile…",
  SaveAvailability: "Saving availability…",
  SaveEvent: "Saving your meeting…",
  DeleteEvent: "Deleting event…",
  PublicPage: "Loading the booking page…",
  PublicEvent: "Loading the meeting…",
  Slots: "Checking available times…",
  Book: "Booking your meeting…",
  Reschedule: "Rescheduling your meeting…",
  Cancel: "Cancelling your meeting…",
  Connect: "Preparing the calendar connection…",
  Disconnect: "Disconnecting the calendar…",
  RetrySync: "Requesting calendar synchronization…",
  AdminBookings: "Loading meeting reports…",
  Room: "Opening your meeting room…",
  JoinMeeting: "Confirming your meeting registration…",
  Registration: "Loading your registration…",
};
function publish() {
  snapshot = { count: pending.size, labels: [...new Set(pending.values())] };
  listeners.forEach((listener) => listener());
}
export const getRequestActivity = () => snapshot;
export function subscribeRequestActivity(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export async function trackRequest(name, execute) {
  const key = Symbol(name);
  pending.set(key, labels[name] || "Processing your request…");
  publish();
  try {
    return await execute();
  } finally {
    pending.delete(key);
    publish();
  }
}
