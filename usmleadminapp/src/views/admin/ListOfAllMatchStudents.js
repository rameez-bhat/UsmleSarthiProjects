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
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem
} from "@mui/material";
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

  const [filters, setFilters] = useState({
    Plan: null,
    enrollmentFrom: null,
    enrollmentTo: null,
    SeasonFrom:null,
    SeasonTo:null,
    PaymentDateFrom: null,
    PaymentDateTo: null,
    status: ""
  });
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
      "listofallmatchstudents",
      0
    );

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
const buildConditions = () => {
  let baseConditions = [];

  // Season
  if (filters.SeasonFrom && filters.SeasonTo) {
    baseConditions.push(
      { name: "Match.Season", condition: ">=", value: filters.SeasonFrom },
      { name: "Match.Season", condition: "<=", value: filters.SeasonTo }
    );
  }

  // Plan
  /*if (filters.Plan) {
    baseConditions.push({
      name: "Match.Plan.Name",
      condition: "==",
      value: filters.Plan
    });
  }*/
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

  // Enrollment
  if (filters.enrollmentFrom && filters.enrollmentTo) {
    baseConditions.push(
      { name: "Match.EnrollmentDate", condition: ">=", value: filters.enrollmentFrom },
      { name: "Match.EnrollmentDate", condition: "<=", value: filters.enrollmentTo }
    );
  }

  // Status
  if (filters.status) {
    baseConditions.push({
      name: "Match.Status.Name",
      condition: "==",
      value: filters.status
    });
  }
   if (filters.Onboard_kindofstudent) {
    baseConditions.push({
      name: "Match.OnBoarding.Onboard_kindofstudent.Value",
      condition: "==",
      value: filters.Onboard_kindofstudent
    });
  }
  if (filters.EmailWhatsAppInstructions) {
    baseConditions.push({
      name: "Match.OnBoarding.EmailWhatsAppInstructions.Value",
      condition: "==",
      value: filters.EmailWhatsAppInstructions
    });
  }
  if (filters.GoogleClassroomInvitation) {
    baseConditions.push({
      name: "Match.OnBoarding.GoogleClassroomInvitation.Value",
      condition: "==",
      value: filters.GoogleClassroomInvitation
    });
  }
  if (filters.ResidencyMatchWebsiteAccess) {
    baseConditions.push({
      name: "Match.OnBoarding.ResidencyMatchWebsiteAccess.Value",
      condition: "==",
      value: filters.ResidencyMatchWebsiteAccess
    });
  }
  if (filters.MatchflixAccess) {
    baseConditions.push({
      name: "Match.OnBoarding.MatchflixAccess.Value",
      condition: "==",
      value: filters.MatchflixAccess
    });
  }
  if (filters.Contract) {
    baseConditions.push({
      name: "Match.OnBoarding.Contract.Value",
      condition: "==",
      value: filters.Contract
    });
  }
  if (filters.ClosedTelegramGroup) {
    baseConditions.push({
      name: "Match.OnBoarding.ClosedTelegramGroup.Value",
      condition: "==",
      value: filters.ClosedTelegramGroup
    });
  }
  if (filters.PlanSpecificTelegramGroup) {
    baseConditions.push({
      name: "Match.OnBoarding.PlanSpecificTelegramGroup.Value",
      condition: "==",
      value: filters.PlanSpecificTelegramGroup
    });
  }
  if (filters.OrientationMeetWithAdminTeam) {
    baseConditions.push({
      name: "Match.OnBoarding.OrientationMeetWithAdminTeam.Value",
      condition: "==",
      value: filters.OrientationMeetWithAdminTeam
    });
  }
  if (filters.OrientationMeetWithPawan) {
    baseConditions.push({
      name: "Match.OnBoarding.OrientationMeetWithPawan.Value",
      condition: "==",
      value: filters.OrientationMeetWithPawan
    });
  }

  // If NO payment filter → single group
  if (!(filters.PaymentDateFrom && filters.PaymentDateTo)) {
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
        name: `Match.Payments.Payment${i}.PaymentDate`,
        condition: ">=",
        value: filters.PaymentDateFrom
      },
      {
        name: `Match.Payments.Payment${i}.PaymentDate`,
        condition: "<=",
        value: filters.PaymentDateTo
      }
    );

    conditions.push(group);
  }

  return conditions;
};
  const FilterData = async () =>{
  let conditions = [];
    if (filters.SeasonFrom && filters.SeasonTo) {
  conditions.push([
    { name: "Match.Season", condition: ">=", value: filters.SeasonFrom },
    { name: "Match.Season", condition: "<=", value: filters.SeasonTo }
  ]);
}
    if (filters.enrollmentFrom && filters.enrollmentTo) {
      conditions.push([
        { name: "Match.EnrollmentDate", condition: ">=", value: filters.enrollmentFrom },
        { name: "Match.EnrollmentDate", condition: "<=", value: filters.enrollmentTo }
      ]);
    }

    if (filters.PaymentDateFrom && filters.PaymentDateTo) {
      conditions.push([
          { name: `Match.Payments.Payment0.PaymentDate`, condition: ">=", value: filters.PaymentDateFrom },
          { name: `Match.Payments.Payment0.PaymentDate`, condition: "<=", value: filters.PaymentDateTo }
        ]);
    }

    if (filters.status) {
      conditions.push([
        { name: "Match.Status.Name", condition: "==", value: filters.status }
      ]);
    }
    //if(conditions.length)
    {
      setFiltersReady(true);
      let resF=await handleUpdate("SavedFilters", "listofallmatchstudents", filters);
    }
    //loadData();
  }
  const loadData = async () => {
  try {
    showLoading();

    const conditions = buildConditions();

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
          <Grid item xs={12} md={3}>
  <TextField
    select
    fullWidth
    label="Match Season From"
    value={filters.SeasonFrom || ""}
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        SeasonFrom: e.target.value ? Number(e.target.value) : null,
        // reset SeasonTo if invalid
        SeasonTo:
          prev.SeasonTo && e.target.value && prev.SeasonTo < Number(e.target.value)
            ? null
            : prev.SeasonTo
      }))
    }
  >
    <MenuItem value="">Select Year</MenuItem>
    {yearOptions.map((year) => (
      <MenuItem key={year} value={year}>
        {`Match Season ` + year + ` (Sept ` + (year - 1) + `)`}
      </MenuItem>
    ))}
  </TextField>
  {filters.SeasonFrom && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("SeasonFrom")}
    >
      Clear
    </Button>
  )}
</Grid>

          <Grid item xs={12} md={3}>
  <TextField
    select
    fullWidth
    label="Match Season To"
    value={filters.SeasonTo || ""}
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        SeasonTo: e.target.value ? Number(e.target.value) : null
      }))
    }
  >
    <MenuItem value="">Select Year</MenuItem>
    {validYearOptionsTo.map((year) => (
      <MenuItem key={year} value={year}>
        {`Match Season ` + year + ` (Sept ` + (year - 1) + `)`}
      </MenuItem>
    ))}
  </TextField>
  {filters.SeasonTo && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("SeasonTo")}
    >
      Clear
    </Button>
  )}
</Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value
                }))
              }
            >
              {Object.entries(MatchPlanStatus).map(([subKey, subValue]) => (
                      <MenuItem key={subKey} value={subKey}>
                        {subValue}
                      </MenuItem>
                    ))}
            </TextField>
            {filters.status && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("status")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Enrollment From"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
      filters.enrollmentFrom?.seconds
        ? dayjs(
            new Date(filters.enrollmentFrom.seconds * 1000)
          ).format("YYYY-MM-DD")
        : ""
    }
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        enrollmentFrom: e.target.value
          ? Timestamp.fromDate(new Date(e.target.value + "T00:00:00"))
          : null
      }))
    }
            />
            {filters.enrollmentFrom && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("enrollmentFrom")}
    >
      Clear
    </Button>
  )}
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Enrollment To"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
      filters.enrollmentTo?.seconds
        ? dayjs(
            new Date(filters.enrollmentTo.seconds * 1000)
          ).format("YYYY-MM-DD")
        : ""
    }
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        enrollmentTo: e.target.value
          ? Timestamp.fromDate(new Date(e.target.value + "T23:59:59"))
          : null
      }))
    }
            />
            {filters.enrollmentTo && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("enrollmentTo")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Payment Date From"
              fullWidth
              InputLabelProps={{ shrink: true }}
               value={
      filters.PaymentDateFrom?.seconds
        ? dayjs(
            new Date(filters.PaymentDateFrom.seconds * 1000)
          ).format("YYYY-MM-DD")
        : ""
    }
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        PaymentDateFrom: e.target.value
          ? Timestamp.fromDate(new Date(e.target.value + "T00:00:00"))
          : null
      }))
    }
            />
             {filters.PaymentDateFrom && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("PaymentDateFrom")}
    >
      Clear
    </Button>
  )}
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Payment Date To"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
      filters.PaymentDateTo?.seconds
        ? dayjs(
            new Date(filters.PaymentDateTo.seconds * 1000)
          ).format("YYYY-MM-DD")
        : ""
    }
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        PaymentDateTo: e.target.value
          ? Timestamp.fromDate(new Date(e.target.value + "T23:59:59"))
          : null
      }))
    }
            />
            {filters.PaymentDateTo && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("PaymentDateTo")}
    >
      Clear
    </Button>
  )}
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Kind of Student"
              value={filters?.Onboard_kindofstudent || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  Onboard_kindofstudent: e.target.value
                }))
              }
            >
              <MenuItem value='needy'>Needy</MenuItem>
              <MenuItem value='self-sufficient'>Self-sufficient</MenuItem>
              <MenuItem value='normal'>Normal</MenuItem>
            </TextField>
            {filters.Onboard_kindofstudent && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("Onboard_kindofstudent")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Email & WhatsApp Instructions"
              value={filters?.EmailWhatsAppInstructions || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  EmailWhatsAppInstructions: e.target.value
                }))
              }
            >
              <MenuItem value='Sent'>Sent</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.EmailWhatsAppInstructions && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("EmailWhatsAppInstructions")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Google Classroom Invitation"
              value={filters?.GoogleClassroomInvitation || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  GoogleClassroomInvitation: e.target.value
                }))
              }
            >
              <MenuItem value='Sent'>Sent</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.GoogleClassroomInvitation && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("GoogleClassroomInvitation")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Residency Match Website Access"
              value={filters?.ResidencyMatchWebsiteAccess || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  ResidencyMatchWebsiteAccess: e.target.value
                }))
              }
            >
              <MenuItem value='Activated'>Activated</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.ResidencyMatchWebsiteAccess && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("ResidencyMatchWebsiteAccess")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Matchflix Access"
              value={filters?.MatchflixAccess || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  MatchflixAccess: e.target.value
                }))
              }
            >
              <MenuItem value='Activated'>Activated</MenuItem>
              <MenuItem value='Account Not Created'>Account Not Created</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.MatchflixAccess && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("MatchflixAccess")}
    >
      Clear
    </Button>
  )}
          </Grid>
           <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Contract"
              value={filters?.Contract || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  Contract: e.target.value
                }))
              }
            >
              <MenuItem value='Sent & Signed'>Sent & Signed</MenuItem>
              <MenuItem value='Sent but not Signed'>Sent but not Signed</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.Contract && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("Contract")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Closed Telegram Group"
              value={filters?.ClosedTelegramGroup || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  ClosedTelegramGroup: e.target.value
                }))
              }
            >
              <MenuItem value='Joined'>Joined</MenuItem>
              <MenuItem value='Link Sent but not Joined'>Link Sent but not Joined</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.ClosedTelegramGroup && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("ClosedTelegramGroup")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Plan Specific Telegram Group"
              value={filters?.PlanSpecificTelegramGroup || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  PlanSpecificTelegramGroup: e.target.value
                }))
              }
            >
              <MenuItem value='Joined'>Joined</MenuItem>
              <MenuItem value='Link Sent but not Joined'>Link Sent but not Joined</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.PlanSpecificTelegramGroup && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("PlanSpecificTelegramGroup")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Orientation Meet With Admin Team"
              value={filters?.OrientationMeetWithAdminTeam || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  OrientationMeetWithAdminTeam: e.target.value
                }))
              }
            >
              <MenuItem value='Completed'>Completed</MenuItem>
              <MenuItem value='Scheduled'>Scheduled</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.OrientationMeetWithAdminTeam && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("OrientationMeetWithAdminTeam")}
    >
      Clear
    </Button>
  )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Orientation Meet With Pawan"
              value={filters?.OrientationMeetWithPawan || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  OrientationMeetWithPawan: e.target.value
                }))
              }
            >
              <MenuItem value='Completed'>Completed</MenuItem>
              <MenuItem value='Scheduled'>Scheduled</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
            {filters.OrientationMeetWithPawan && (
    <Button
      size="small"
      color="error"
      onClick={() => resetSingleFilter("OrientationMeetWithPawan")}
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