import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  InputLabel,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem
} from "@mui/material";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Timestamp } from "firebase/firestore";

import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";




import { useLoading } from "../../layout/LoadingContext";
const MatchPlanStatus = {

    "NotApplying": "Not Applying",
    "Withdrawn": "Withdrawn",
    "AccessRemoved": "Access Removed",
    "Upgrade": "Upgrade",
    "Downgrade": "Downgrade",
    "Continuing": "Continuing",
    "Continuing+Upgrade": "Continuing + Upgrade",
    "Continuing+LimitedServices": "Continuing + Limited Services",
    "Current Student":"Current Student"
  };
   const dateFormat = "MM/DD/YYYY";
  let MatchPlanLists = {};
const UserDetails = () => {
  const { did } = useParams();
  const { showLoading, hideLoading, SelectWithComplexConditions,FetchDataFromCollection,handleUpdate,SelectWithComplexConditionsJoin } = useLoading();
  const [MatchPlanListObject, setMatchPlanListObject] = useState({});
  const [filtersReady, setFiltersReady] = useState(false);

  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "EnrollmentDate",
    direction: "ascending"
  });

  const [filters, setFilters] = useState({});
const currentYear = new Date().getFullYear();
const startYear = currentYear - 7;
const yearOptions = Array.from({ length: 20 }, (_, i) => startYear + i);
const validYearOptionsTo = yearOptions.filter(
  (year) => !filters.SeasonFrom || year >= filters.SeasonFrom
);
  useEffect(() => {
  initializePage();
}, []);
useEffect(() => {
  if (!filtersReady) return;   // ✅ prevent initial run
  loadData();
}, [filters, filtersReady]);
  const initializePage = async () => {
  showLoading();

  try {
    // Load plans
    const MatchPlanList = await FetchDataFromCollection(
      "MatchPlans",
      200,
      "Type",
      "==",
      "Match",
      0
    );

    const obj = {};
    MatchPlanList.forEach(item => (obj[item.id] = item));
    setMatchPlanListObject(obj);
    MatchPlanLists=obj;
    // Load saved filters
    const saved = await FetchDataFromCollection(
      "SavedFilters",
      20,
      "filtertype",
      "==",
      "listofallmatchmentor",
      0
    );
console.log("saved======>",saved)
    if (saved.length) {
      setFilters(saved[0]);   // Only set filters
    } else {
      await loadData();       // No saved filters
    }

  } catch (error) {
    console.error(error);
  } finally {
  setFiltersReady(true);
    hideLoading();
  }
};
function convertISTMidnightToUTC(date, isStart = true) {
  const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
  // Set time to IST 00:00:00 or 23:59:59.999
  d.setHours(isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59, isStart ? 0 : 999);
  // Convert IST to UTC by subtracting 5.5 hours
  return new Date(d.getTime() - (5.5 * 60 * 60 * 1000));
}
const buildConditions = () => {
  let baseConditions = [];
console.log("filters=======>",filters)
  if (filters.Plan) {
  const plans = Array.isArray(filters.Plan)
    ? filters.Plan
    : [filters.Plan];

  if (plans.length === 1) {
    baseConditions.push({
      name: "Match.Plan.Name",
      condition: "==",
      value: plans[0],
    });
  } else if (plans.length > 1) {
    baseConditions.push({
      name: "Match.Plan.Name",
      condition: "in",
      value: plans,
    });
  }
}

  // If NO payment filter → single group
  if (!(filters.meetingsDate)) {
    if (!baseConditions.length) {
      baseConditions.push({
        name: "Match.Notes",
        condition: "!=",
        value: "Rameez"
      });
    }

    return [baseConditions];
  }

  // Payment filter exists → create OR groups
  let conditions = [];

  for (let i = 0; i <= 5; i++) {
    const group = [...baseConditions]; // ✅ CLONE base filters

    group.push(
      {
        name: `Match.Platinum.Meetings.${i}.MeetingWithPhysicianMentor.Relation.MeetingDate`,
        condition: ">=",
        value: Timestamp.fromDate(convertISTMidnightToUTC(filters.meetingsDate[0]))
      },
      {
        name: `Match.Platinum.Meetings.${i}.MeetingWithPhysicianMentor.Relation.MeetingDate`,
        condition: "<=",
        value: Timestamp.fromDate(convertISTMidnightToUTC(filters.meetingsDate[1]))
      }
    );


    conditions.push(group);
  }

  return conditions;
};
  const FilterData = async () =>{
  let conditions = [];
    console.log("filters======>",filters)
   if (
  filters.meetingsDate &&
  filters.meetingsDate.length === 2
) {
  filters.meetingsDate = [
    Timestamp.fromDate(
      filters.meetingsDate[0].toDate()
    ),
    Timestamp.fromDate(
      filters.meetingsDate[1].toDate()
    ),
  ];
}

    if (filters.status) {
      conditions.push([
        { name: "Match.Status.Name", condition: "==", value: filters.status }
      ]);
    }
    //if(conditions.length)
    {
      setFiltersReady(true);
      console.log("filters===>",filters)
      let resF=await handleUpdate("SavedFilters", "listofallmatchmentor", filters);
      console.log("resF===>",resF)
    }
    //loadData();
  }
  const loadData = async () => {
  try {
    showLoading();

    const conditions = buildConditions();
console.log("conditions=======>",conditions)
    const result = await SelectWithComplexConditions(
      "UserServices",
      conditions,
      "Users"
    );

    if (result.status !== "success") return;

    const users = result.data;

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const noteConditions = [
          [
            {
              name: "uid",
              condition: "==",
              value: user.uid,
            },
          ],
        ];

        const notes =
          await SelectWithComplexConditionsJoin(
            "UserCommonServiceNotes",
            noteConditions,
            "NotesDate",
            "desc",
            null,
            "UsersRoles",
            "uid",
            "uid"
          );
        const counts = {};

        if (Array.isArray(notes?.data)) {
  notes.data.forEach((note) => {
    const email = note?.AddedBy?.email || "Unknown";
    const noteDate = note?.NotesDate || null;
if(email==user?.profile?.email)
{
  return;
}
    if (!counts[email]) {
      counts[email] = {
        Count: 1,
        NoteDate: noteDate,
      };
    } else {
      counts[email].Count++;

      // Keep the latest note date
      if (
        noteDate &&
        (!counts[email].NoteDate ||
          noteDate.seconds > counts[email].NoteDate.seconds)
      ) {
        counts[email].NoteDate = noteDate;
      }
    }
  });
}
// Mentor Meeting Summary
const meetings = user?.Match?.Platinum?.Meetings || [];

let totalMentorMeetings = 0;
let lastMeetingDate = null;

meetings.forEach((meeting) => {
  const mentorMeeting = meeting?.MeetingWithPhysicianMentor;

  if (
    mentorMeeting &&
    mentorMeeting?.Value === "Completed"
  ) {
    totalMentorMeetings++;

    if (mentorMeeting?.Relation?.MeetingDate) {
      const meetingDate = new Date(mentorMeeting?.Relation?.MeetingDate);

      if (!lastMeetingDate || meetingDate > lastMeetingDate) {
        lastMeetingDate = meetingDate;
      }
    }
  }
});

        /*return {
          ...user,
          NotesCount: counts,
          TotalNotes: Array.isArray(notes?.data)
            ? notes?.data?.length
            : 0,
        };*/
        return {
  ...user,
  NotesCount: counts,
  TotalNotes: Array.isArray(notes?.data)
    ? notes.data.length
    : 0,

  TotalMentorMeetings: totalMentorMeetings,
  LastMentorMeetingDate: lastMeetingDate,
};



      })
    );
    console.log("usersWithCounts==>",usersWithCounts)
    setData(usersWithCounts);
  } catch (err) {
    console.error(err);
  } finally {
    setFiltersReady(false);
    hideLoading();
  }
};
  const formatSeason = (season) => {
  if (!season || isNaN(Number(season))) {
    return season;
  }

  const numericSeason = Number(season);
  return `Match Season ${numericSeason} (Sept ${numericSeason - 1})`;
};
const resetSingleFilter = async (key) => {
  const updatedFilters = {
    ...filters,
    [key]: null
  };

  // Special handling for string fields
  if (key === "status") {
    updatedFilters.status = "";
  }

  setFilters(updatedFilters);

  // Optional: persist to DB
  await handleUpdate(
    "SavedFilters",
    "listofallmatchstudents",
    updatedFilters
  );
};
// ===== PAYMENT HELPERS =====
  const getLatestPaymentDate = (user) => {
    const payments = user?.Match?.Payments || {};
    const dates = Object.values(payments)
      .filter(p => p?.PaymentDate?.seconds)
      .map(p => p.PaymentDate.seconds);

    if (!dates.length) return null;
    return Math.max(...dates);
  };

  const getTotalPaymentAmount = (user) => {
  const payments = user?.Match?.Payments || {};

  const total = Object.values(payments).reduce(
    (sum, p) => sum + (Number(p?.Amount) || 0),
    0
  );

  return Math.round((total + Number.EPSILON) * 100) / 100;
};
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const sortedData = useMemo(() => {
    let sortable = [...data];

    sortable.sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case "EnrollmentDate":
          aVal = a?.Match?.EnrollmentDate?.seconds || 0;
          bVal = b?.Match?.EnrollmentDate?.seconds || 0;
          break;

        case "Season":
          aVal = a?.Match?.Season || 0;
          bVal = b?.Match?.Season || 0;
          break;

        case "PaymentDate":
          aVal = getLatestPaymentDate(a) || 0;
          bVal = getLatestPaymentDate(b) || 0;
          break;

        case "PaymentAmount":
          aVal = getTotalPaymentAmount(a);
          bVal = getTotalPaymentAmount(b);
          break;
        case "Notes":
          aVal = a?.TotalNotes || 0;
          bVal = b?.TotalNotes || 0;
          break;
        case "MentorMeetings":
          aVal = a?.TotalMentorMeetings || 0;
          bVal = b?.TotalMentorMeetings || 0;
          break;
        case "email":
          aVal = a?.profile?.email || "";
          bVal = b?.profile?.email || "";
          break;

        default:
          aVal = a?.profile?.displayName || "";
          bVal = b?.profile?.displayName || "";
      }

      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortable;
  }, [data, sortConfig]);

  const convertDate = (timestamp) => {
    if (!timestamp?.seconds) return "";
    return dayjs(new Date(timestamp.seconds * 1000)).format("MM-DD-YYYY");
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Filters
        </Typography>

        <Grid container spacing={2}>
       <Grid item xs={12} md={3}>
  <TextField
    select
    fullWidth
    label="Plan"
    value={
      Array.isArray(filters.Plan)
        ? filters.Plan
        : filters.Plan
        ? [filters.Plan]
        : []
    }
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        Plan: e.target.value,
      }))
    }
    SelectProps={{
      multiple: true,
      renderValue: (selected) =>
        (Array.isArray(selected) ? selected : [selected])
          .map((pid) => {
            if (pid === "Custom") return "Custom";

            const plan = Object.values(
              MatchPlanListObject || {}
            ).find((p) => p.Pid === pid);

            return plan?.Name || pid;
          })
          .join(", "),
    }}
  >
    {Object.entries(MatchPlanListObject || {}).map(
      ([key, value]) => (
        <MenuItem key={key} value={value.Pid}>
          <Checkbox
            checked={
              (
                Array.isArray(filters.Plan)
                  ? filters.Plan
                  : filters.Plan
                  ? [filters.Plan]
                  : []
              ).indexOf(value.Pid) > -1
            }
          />
          <ListItemText primary={value.Name} />
        </MenuItem>
      )
    )}

    <MenuItem value="Custom">
      <Checkbox
        checked={
          (
            Array.isArray(filters.Plan)
              ? filters.Plan
              : filters.Plan
              ? [filters.Plan]
              : []
          ).indexOf("Custom") > -1
        }
      />
      <ListItemText primary="Custom" />
    </MenuItem>
  </TextField>

  {(Array.isArray(filters.Plan)
    ? filters.Plan.length > 0
    : !!filters.Plan) && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("Plan")}
    >
      Clear
    </Button>
  )}
</Grid>
          <Grid item xs={12} md={6}>
   <InputLabel>Meeting Date</InputLabel>
  <RangePicker
    style={{ width: "100%" }}
    name="MeetingDate"
    label="Meeting Date"
    value={filters.meetingsDate}
    format={dateFormat}
    onChange={(dates) => {
      if (!dates) return;

      const start = dates[0]
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 1)
        .set("millisecond", 0);

      const end = dates[1]
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .set("millisecond", 999);
		 setFilters((prev) => ({
        ...prev,
        meetingsDate: [start, end],
      }));

    }}
    allowClear={false}
  />
   {filters.meetingsDate && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("meetingsDate")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
          
        

          <Grid item xs={12}>
            <Button variant="contained" onClick={FilterData}>
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" mb={2}>
        Match Users Total = {sortedData.length}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell onClick={() => requestSort('StudentUniqueId')}>
              Student ID {sortConfig.key === 'StudentUniqueId' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('email')}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('displayName')}>
              Name {sortConfig.key === 'displayName' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('EnrollmentDate')}>
                  Enrollement Date {sortConfig.key === 'EnrollmentDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('Plan')}>
                Plan {sortConfig.key === 'Plan' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('Status')}>
                Status {sortConfig.key === 'Status' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort('Season')}>
                Match Season {sortConfig.key === 'Season' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort("PaymentDate")}>
                Latest Payment Date
              </TableCell>
              <TableCell
  onClick={() => requestSort("Notes")}
  sx={{
    whiteSpace: "nowrap",
    width: "1%",
  }}
>
  Notes
  {sortConfig.key === "Notes" &&
    (sortConfig.direction === "ascending"
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />)}
</TableCell>

<TableCell
  onClick={() => requestSort("MentorMeetings")}
  sx={{
    whiteSpace: "nowrap",
    width: "1%",
  }}
>
  Mentor Meetings
  {sortConfig.key === "MentorMeetings" &&
    (sortConfig.direction === "ascending"
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />)}
</TableCell>
              
              <TableCell onClick={() => requestSort("PaymentAmount")}>
                Total Payment Amount
              </TableCell>

            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((user, index) => (
              <TableRow key={index}>
              <TableCell>S{user?.profile?.StudentUniqueId}</TableCell>
                  <TableCell>
                    <a
                      href={`/admin/userdetails/${user?.profile?.uid}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '2px 20px',
                        backgroundColor: '#af4cab',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}
                    >
                      {user?.profile?.email}
                    </a>
                  </TableCell>
                  <TableCell>{user?.profile?.displayName}</TableCell>
                   <TableCell>{convertDate(user?.Match?.EnrollmentDate)}</TableCell>
                  <TableCell>{user?.Match?.Plan?.Relation?.Value ||
                    MatchPlanLists?.[user?.Match?.Plan?.Name]?.Name}</TableCell>
                    <TableCell>{user?.Match?.Status?.Relation?.Value ||
                    user?.Match?.Status?.Name}</TableCell>
                  <TableCell>{formatSeason(user?.Match?.Season)}</TableCell>
                  <TableCell>{convertDate(getLatestPaymentDate(user))}</TableCell>
                   <TableCell
  sx={{
    whiteSpace: "nowrap",
    width: "1%",
    verticalAlign: "top",
  }}
>
  {user?.NotesCount
    ? Object.entries(user.NotesCount)
        .sort((a, b) => b[1].Count - a[1].Count)
        .map(([email, info]) => (
          <div key={email} style={{ marginBottom: 6 }}>
            <strong>{email}</strong>: ({info.Count})
            <br />
            {info.NoteDate
              ? dayjs(info.NoteDate.toDate()).format("MM/DD/YYYY")
              : "-"}
          </div>
        ))
    : "-"}
</TableCell>

<TableCell
  sx={{
    whiteSpace: "nowrap",
    width: "1%",
    verticalAlign: "top",
  }}
>
  {user?.TotalMentorMeetings ? (
    <>
      <strong>
        {user?.Match?.Platinum?.AssignedMentor?.label}
        ({user.TotalMentorMeetings})
      </strong>
      <br />
      {user.LastMentorMeetingDate
        ? dayjs(user.LastMentorMeetingDate).format("MM/DD/YYYY")
        : "-"}
    </>
  ) : (
    "-"
  )}
</TableCell>
                <TableCell>₹ {getTotalPaymentAmount(user)}</TableCell>
              
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserDetails;