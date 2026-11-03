import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
    Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";


import dayjs from "dayjs";
import { db } from "../../firebase";

// Reuse the same Firebase app and authentication as your existing application.
const schedulerDb = getFirestore(db.app, "calendly");
const schedulerAuth = getAuth(db.app);

function toMilliseconds(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.seconds === "number") {
    return (
      value.seconds * 1000 +
      Math.floor((value.nanoseconds || 0) / 1000000)
    );
  }

  const milliseconds =
    typeof value === "number" ? value : new Date(value).getTime();

  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function formatMeeting(document, uid) {
  const data = document.data();

  const participant = data.participants?.find(
    (person) => person.uid === uid,
  );

  const isHost =
    data.ownerId === uid || data.organizerId === uid;

  let status = data.status || "unknown";

  if (!isHost && status !== "cancelled" && participant) {
    const response = participant.response || "invited";

    status = response === "accepted" ? "confirmed" : response;
  }

  const canJoin =
    data.status === "confirmed" &&
    (isHost ||
      (!data.participants?.length && data.attendeeUid === uid) ||
      participant?.response === "accepted");
const attendees = Array.isArray(data.participants)
  ? data.participants.map((person, index) => ({
      id: person.uid || person.email || `participant-${index}`,
      name: person.name || person.displayName || "—",
      email: person.email || "—",
      phone:
        person.phoneNumber ||
        person.phone ||
        person.whatsappNumber ||
        "—",
      response: person.response || "invited",
    }))
  : [];

if (
  data.attendeeUid ||
  data.attendeeEmail ||
  data.attendeeName
) {
  const alreadyIncluded = attendees.some(
    (person) =>
      (data.attendeeUid && person.id === data.attendeeUid) ||
      (data.attendeeEmail &&
        person.email.toLowerCase() ===
          data.attendeeEmail.toLowerCase()),
  );

  if (!alreadyIncluded) {
    attendees.push({
      id: data.attendeeUid || data.attendeeEmail || "attendee",
      name: data.attendeeName || "—",
      email: data.attendeeEmail || "—",
      phone: data.attendeePhone || data.attendeePhoneNumber || "—",
      response: data.status || "unknown",
    });
  }
}
  return {
    id: document.id,
    title: data.eventTitle || "Meeting",
    hostName: data.hostName || "—",
    startAt: toMilliseconds(data.startAt),
    endAt: toMilliseconds(data.endAt),
    status,
    isHost,
attendees,
    role: isHost ? "Host / Organizer" : "Attendee",
    location: data.location || "—",
    meetingUrl: canJoin
      ? data.meetingUrl || data.locationValue || ""
      : "",
  };
}

function statusColor(status) {
  switch (status) {
    case "confirmed":
      return "success";

    case "invited":
    case "pending":
      return "warning";

    case "cancelled":
    case "declined":
      return "error";

    default:
      return "default";
  }
}

export default function MyBookings() {
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
const [selectedMeeting, setSelectedMeeting] = useState(null);

useEffect(() => {
  setSelectedMeeting(null);
}, [uid]);
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  useEffect(() => {
    return onAuthStateChanged(
      schedulerAuth,
      (user) => {
        setUid(user?.uid || null);
        setMeetings([]);
        setError("");
        setAuthReady(true);
      },
      (problem) => {
        setUid(null);
        setMeetings([]);
        setError(problem.message);
        setAuthReady(true);
      },
    );
  }, []);

  useEffect(() => {
    let active = true;

    if (!uid) {
      setLoading(false);
      return;
    }

    async function loadMeetings() {
      setLoading(true);
      setError("");

      try {
        const bookings = collection(
          schedulerDb,
          "scheduler_bookings",
        );

        const snapshots = await Promise.all([
          getDocs(
            query(
              bookings,
              where("attendeeUid", "==", uid),
            ),
          ),

          getDocs(
            query(
              bookings,
              where("participantUids", "array-contains", uid),
            ),
          ),

          getDocs(
            query(
              bookings,
              where("ownerId", "==", uid),
            ),
          ),

          getDocs(
            query(
              bookings,
              where("organizerId", "==", uid),
            ),
          ),
        ]);

        if (
          !active ||
          schedulerAuth.currentUser?.uid !== uid
        ) {
          return;
        }

        // A booking can match several queries. Display it only once.
        const unique = new Map();

        snapshots.forEach((snapshot) => {
          snapshot.docs.forEach((document) => {
            unique.set(
              document.id,
              formatMeeting(document, uid),
            );
          });
        });

        setMeetings(
          [...unique.values()].sort(
            (first, second) =>
              (first.startAt ?? Number.MAX_SAFE_INTEGER) -
              (second.startAt ?? Number.MAX_SAFE_INTEGER),
          ),
        );
      } catch (problem) {
        if (active) {
          setError(
            problem.message || "Unable to load your meetings.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMeetings();

    return () => {
      active = false;
    };
  }, [uid, refreshVersion]);

  const invalidRange =
    Boolean(fromDate && toDate) && fromDate > toDate;

  const filteredMeetings = useMemo(() => {
    if (invalidRange) {
      return [];
    }

    // Dates use the viewer's local timezone.
    const from = fromDate
      ? dayjs(fromDate).startOf("day").valueOf()
      : null;

    // Exclusive start of the following day includes all of "To date".
    const until = toDate
      ? dayjs(toDate).add(1, "day").startOf("day").valueOf()
      : null;

    return meetings.filter((meeting) => {
      if (meeting.startAt === null) {
        return from === null && until === null;
      }

      return (
        (from === null || meeting.startAt >= from) &&
        (until === null || meeting.startAt < until)
      );
    });
  }, [meetings, fromDate, toDate, invalidRange]);

  if (!authReady) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Checking your account…
        </Typography>
      </Box>
    );
  }

  if (!uid) {
    return (
      <Alert severity={error ? "error" : "info"}>
        {error || "Please log in to view your bookings and meetings."}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5">
            My bookings and meetings
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Times shown in {timezone}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => setRefreshVersion((value) => value + 1)}
        >
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="From date"
              type="date"
              value={fromDate}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="To date"
              type="date"
              value={toDate}
              InputLabelProps={{ shrink: true }}
              error={invalidRange}
              helperText={
                invalidRange
                  ? "To date must be on or after From date."
                  : ""
              }
              onChange={(event) => setToDate(event.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Loading your meetings…
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {filteredMeetings.length} meeting(s)
          </Typography>

          {filteredMeetings.length === 0 ? (
            <Alert severity="info">
              {invalidRange
                ? "Choose a valid date range."
                : "No meetings found for the selected dates."}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Meeting</TableCell>
                    <TableCell>Host</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Your role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join</TableCell>
                    <TableCell>Attendees</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id} hover>
                      <TableCell>{meeting.title}</TableCell>

                      <TableCell>{meeting.hostName}</TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {meeting.startAt !== null
                          ? dayjs(meeting.startAt).format("MM/DD/YYYY")
                          : "—"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {meeting.startAt !== null
                          ? dayjs(meeting.startAt).format("hh:mm A")
                          : "—"}

                        {meeting.endAt !== null &&
                          ` – ${dayjs(meeting.endAt).format("hh:mm A")}`}
                      </TableCell>

                      <TableCell>{meeting.role}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={meeting.status}
                          color={statusColor(meeting.status)}
                        />
                      </TableCell>

                      <TableCell>
                        {/^https:\/\//i.test(meeting.meetingUrl) ? (
                          <Button
                            component="a"
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                          >
                            Join
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
  {meeting.isHost ? (
    <Button
      variant="outlined"
      size="small"
      onClick={() => setSelectedMeeting(meeting)}
    >
      View attendees ({meeting.attendees.length})
    </Button>
  ) : (
    "—"
  )}
</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      <Dialog
  open={Boolean(selectedMeeting)}
  onClose={(_, reason) => {
    // Keep the dialog open when clicking outside it.
    if (reason !== "backdropClick") {
      setSelectedMeeting(null);
    }
  }}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    Attendee details
    {selectedMeeting?.title && ` — ${selectedMeeting.title}`}
  </DialogTitle>

  <DialogContent dividers>
    {!selectedMeeting?.attendees.length ? (
      <Alert severity="info">
        No attendee details are saved for this meeting.
      </Alert>
    ) : (
      <TableContainer>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone / WhatsApp</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {selectedMeeting.attendees.map((attendee) => (
              <TableRow key={attendee.id}>
                <TableCell>{attendee.name}</TableCell>

                <TableCell sx={{ overflowWrap: "anywhere" }}>
                  {attendee.email}
                </TableCell>

                <TableCell>{attendee.phone}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={attendee.response}
                    color={
                      attendee.response === "accepted" ||
                      attendee.response === "confirmed"
                        ? "success"
                        : attendee.response === "declined" ||
                            attendee.response === "cancelled"
                          ? "error"
                          : "warning"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setSelectedMeeting(null)}>
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}