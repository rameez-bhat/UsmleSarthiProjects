import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import Select from "react-select";
import dayjs from "dayjs";
import { db } from "../../firebase";
import { DatePicker} from "antd";
import {
collection,
  addDoc,
  getDocs,
  setDoc,
  orderBy,
  updateDoc,
  doc,
  query,
  where,
  or,
  and,
  limit,
  startAt,
  endAt,
  documentId,
  Timestamp,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import IconButton from "@mui/material/IconButton";
import { useLoading } from "../../layout/LoadingContext";

const statusColors = {
  "In progress": "warning",
  Resolved: "success",
  Pending: "error",
};
let ActualUser;
const serviceOptions = ["Rotations", "Match", "Research", "Others"];
const statusStyles = {
  assigned: {
    background: "linear-gradient(90deg,#2193b0,#6dd5ed)", // blue
    chipColor: "#2193b0",
  },
  "In progress": {
    background: "linear-gradient(90deg,#f7971e,#ffd200)", // yellow
    chipColor: "#f7971e",
  },
  "stuck": {
    background: "linear-gradient(90deg,#ff512f,#dd2476)", // red
    chipColor: "#ff512f",
  },
  Pending: {
    background: "linear-gradient(90deg,#ff512f,#dd2476)", // red
    chipColor: "#ff512f",
  },
  Resolved: {
    background: "linear-gradient(90deg,#43cea2,#185a9d)", // green
    chipColor: "#43cea2",
  },
  Closed: {
    background: "linear-gradient(90deg,#43cea2,#185a9d)", // green
    chipColor: "#43cea2",
  },
};

export default function IssueTrackerPage(LoginInUserMain) {
	ActualUser=LoginInUserMain.ActualUser;
	console.log("ActualUser---->",ActualUser)
  const [filters, setFilters] = useState({
  raisedBy: null,
  assignedTo: null,
  status: "",
  createdFrom: null,
  createdTo: null,
  updatedFrom: null,
  updatedTo: null,
});
  const [issues, setIssues] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [adminOptions, setAdminOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const { fetchAdminDataWithJoin,showLoading, hideLoading,} = useLoading();

  const [form, setForm] = useState({
  issueDate: dayjs(),
  service: "",              // 🔥 use lowercase consistently
  issueText: "",
  raisedFrom: {
    mainvalue: "team member",
    relation: null,
  },
  listedDate: dayjs(),
  listedBy: {
    displayName: ActualUser.displayName,
    email: ActualUser.email,
    uid: ActualUser.id,
    id: ActualUser.id,
  },
  duedate:null,
  assignedTo: null,          // 🔥 NEVER {}
  status: "In progress",
  notes: "",
});

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
	const threeMonthsAgo = Timestamp.fromDate(
    dayjs().subtract(3, "month").toDate()
  );
    // Load Issues
  
 let baseFilters = [];

// Always restrict to last 3 months
baseFilters.push(where("updatedAt", ">=", threeMonthsAgo));

// 🔒 Role restriction
if (!ActualUser?.superadmin) {
  baseFilters.push(
    or(
      where("listedBy.uid", "==", ActualUser.id),
      where("assignedTo.value", "==", ActualUser.id)
    )
  );
  baseFilters.push(where("status", "!=", 'Resolved'));
}
else
{
	 baseFilters.push(where("status", "!=", 'Resolved'));
}

// 🔹 Filters
if (filters.status) {
  baseFilters.push(where("status", "==", filters.status));
}

if (filters.raisedBy) {
  baseFilters.push(where("listedBy.uid", "==", filters.raisedBy.value));
}

if (filters.assignedTo) {
  baseFilters.push(where("assignedTo.value", "==", filters.assignedTo.value));
}

if (filters.createdFrom) {
  baseFilters.push(where("createdAt", ">=", filters.createdFrom));
}

if (filters.createdTo) {
  baseFilters.push(where("createdAt", "<=", filters.createdTo));
}
if (filters.updatedFrom) {
  baseFilters.push(where("updatedAt", ">=", filters.updatedFrom));
}
if (filters.updatedTo) {
  baseFilters.push(where("updatedAt", "<=", filters.updatedTo));
}
if (filters.duedateTo) {
  baseFilters.push(where("duedate", "<=", filters.duedateTo));
}
if (filters.duedateFrom) {
  baseFilters.push(where("duedate", ">=", filters.duedateFrom));
}

// 🔥 IMPORTANT: wrap everything in AND
const issueQuery = query(
  collection(db, "IssuesTraker"),
  and(...baseFilters),
  orderBy("updatedAt", "desc")
);
  
  
  
  
  

  const issueSnap = await getDocs(issueQuery);

 /* setIssues(
    issueSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  );*/
  /*const issuesWithHistory = await Promise.all(
  issueSnap.docs.map(async (issueDoc) => {
    const issueData = {
      id: issueDoc.id,
      ...issueDoc.data(),
    };

    // 🔹 Fetch history subcollection
    const historyQuery = query(
      collection(db, "IssuesTraker", issueDoc.id, "History"),
      orderBy("timestamp", "desc")
    );

    const historySnap = await getDocs(historyQuery);

    issueData.history = historySnap.docs.map((hDoc) => ({
      id: hDoc.id,
      ...hDoc.data(),
    }));

    return issueData;
  })
);
setIssues(issuesWithHistory);*/
const issuesWithDetails = await Promise.all(
  issueSnap.docs.map(async (issueDoc) => {
    const issueData = {
      id: issueDoc.id,
      ...issueDoc.data(),
    };

    const historyQuery = query(
      collection(db, "IssuesTraker", issueDoc.id, "History"),
      orderBy("timestamp", "desc")
    );

    const repliesQuery = query(
      collection(db, "IssuesTraker", issueDoc.id, "Replies"),
      orderBy("createdAt", "desc")
    );

    const [historySnap, repliesSnap] = await Promise.all([
      getDocs(historyQuery),
      getDocs(repliesQuery),
    ]);

    issueData.history = historySnap.docs.map((historyDoc) => ({
      id: historyDoc.id,
      ...historyDoc.data(),
    }));

    // Newest reply will be first
    issueData.replies = repliesSnap.docs.map((replyDoc) => ({
      id: replyDoc.id,
      ...replyDoc.data(),
    }));

    return issueData;
  })
);

setIssues(issuesWithDetails);


    // Load Admins
    const adminData = await fetchAdminDataWithJoin(
      "UsersRoles",
      "Users",
      300,
      null,
      "Role",
      "in",
      ["Admin", "SuperAdmin"]
    );

    setAdminOptions(
      adminData.data.map((item) => ({
        value: item.id,
        label: item.displayName || item.email,
        email: item.email,
      }))
    );

    setLoading(false);
  };

  /* ================= STUDENT LIVE SEARCH ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      searchStudents(studentSearch);
    }, 400);
    return () => clearTimeout(delay);
  }, [studentSearch]);

  const searchStudents = async (searchText) => {
  if (!searchText || searchText.length < 2) {
    setStudentOptions([]);
    return;
  }

  setStudentLoading(true);

  try {
    //const lowerSearch = searchText.toLowerCase();
	const lowerSearch = searchText;
    // 1️⃣ Search directly inside UsersRoles
    const rolesQuery = query(
      collection(db, "UsersRoles"),
      where("Role", "not-in", ["Admin", "SuperAdmin"]),
      orderBy("displayName"), // MUST be stored lowercase
      startAt(lowerSearch),
      endAt(lowerSearch + "\uf8ff"),
      limit(10)
    );

    const rolesSnap = await getDocs(rolesQuery);

    if (rolesSnap.empty) {
      setStudentOptions([]);
      setStudentLoading(false);
      return;
    }

    // 2️⃣ Extract valid user IDs
    const userIds = rolesSnap.docs
      .map((doc) => doc.data().uid)
      .filter((id) => typeof id === "string" && id);

    if (!userIds.length) {
      setStudentOptions([]);
      setStudentLoading(false);
      return;
    }

    // 3️⃣ Fetch Users documents
    const usersQuery = query(
      collection(db, "Users"),
      where(documentId(), "in", userIds)
    );

    const usersSnap = await getDocs(usersQuery);

    const results = usersSnap.docs.map((doc) => ({
      value: doc.id,
      label: doc.data().displayName+"("+doc.data().email+")" || doc.data().email,
      email: doc.data().email,
    }));

    setStudentOptions(results);
  } catch (err) {
    console.error("Student search error:", err);
  }

  setStudentLoading(false);
};
const toggleHistory = (issueId, historyId) => {
  setExpandedHistory((prev) => ({
    ...prev,
    [historyId]: !prev[historyId],
  }));
};

const logIssueHistory = async (issueId, actionType, changes) => {
  try {
    const historyRef = doc(
      collection(db, "IssuesTraker", issueId, "History")
    );

    await setDoc(historyRef, {
      action: actionType, // Created | Updated | Resolved
      changes,
      performedBy: {
        uid: ActualUser.id,
        name: ActualUser.displayName,
        email: ActualUser.email,
      },
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    console.error("History logging error:", err);
  }
};
const handleFormChange = (
  event,
  name = "",
  secName = "",
  thirdName = ""
) => {
  let value;

  // Standard MUI input
  if (event?.target) {
    value = event.target.value;
  }
  // Dayjs
  else if (event?.$d) {
    value = Timestamp.fromDate(event.toDate());
  }
  // React Select
  else if (event?.label) {
    value = event;
  } else {
    value = event;
  }

  setForm((prev) => {
    // 1️⃣ Simple field
    if (!secName) {
      return {
        ...prev,
        [name]: value,
      };
    }

    // 2️⃣ Two-level nested
    if (secName && !thirdName) {
      return {
        ...prev,
        [name]: {
          ...prev[name],
          [secName]: value,
        },
      };
    }

    // 3️⃣ Three-level nested
    return {
      ...prev,
      [name]: {
        ...prev[name],
        [secName]: {
          ...prev[name]?.[secName],
          [thirdName]: value,
        },
      },
    };
  });
};

const formatValue = (val) => {
  if (!val) return "—";

  // Firestore Timestamp
  if (val?.toDate) {
    return val.toDate().toLocaleString();
  }

  // Assigned user / Select object
  if (val?.label) {
    return val.label;
  }

  // RaisedFrom object
  if (val?.mainvalue) {
    const relationName = val?.relation?.label || "—";
    return `${val.mainvalue} (${relationName})`;
  }

  // ListedBy object
  if (val?.displayName) {
    return `${val.displayName} (${val.email})`;
  }

  if (typeof val === "object") {
    return JSON.stringify(val, null, 2);
  }

  return val.toString();
};


const handleEdit = (issue) => {
  setEditingId(issue.id);

  setForm({
    issueDate: dayjs(issue.issueDate?.toDate()),
    service: issue.service || "",
    issueText: issue.issueText || "",
    raisedFrom: issue.raisedFrom || {
      mainvalue: "team member",
      relation: null,
    },
    listedDate: dayjs(issue.listedDate?.toDate()),
    listedBy: issue.listedBy || null,
    assignedTo: issue.assignedTo || null,
    duedate:issue.duedate || null,
    status: issue.status || "In progress",
    notes: issue.notes || "",
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};
const handleResolve = async (issueId) => {
  await updateDoc(doc(db, "IssuesTraker", issueId), {
    status: "Resolved",
    updatedAt: Timestamp.now(),
  });

  await logIssueHistory(issueId, "Resolved", {
    status: "Resolved",
  });

  loadData();
};
const resetForm = () => {
  setEditingId(null);

  setForm({
    issueDate: dayjs(),
    service: "",
    issueText: "",
    raisedFrom: {
      mainvalue: "team member",
      relation: null,
    },
    listedDate: dayjs(),
    listedBy: {
      displayName: ActualUser.displayName,
      email: ActualUser.email,
      uid: ActualUser.id,
      id: ActualUser.id,
    },
    duedate:null,
    assignedTo: null,
    status: "In progress",
    notes: "",
  });
};
  /* ================= SAVE ISSUE ================= */
  const saveIssue = async () => {
  if (!form.issueText || !form.service) {
    alert("Please fill required fields");
    return;
  }
showLoading();
  const payload = {
    issueDate: Timestamp.fromDate(form.issueDate.toDate()),
    service: form.service,
    issueText: form.issueText,
    raisedFrom: form.raisedFrom,
    listedBy: form.listedBy,
    assignedTo: form.assignedTo,
    duedate:form.duedate,
    status: form.status,
    notes: form.notes,
    updatedAt: Timestamp.now(),
  };

  try {
  if (editingId) {
  const issueRef = doc(db, "IssuesTraker", editingId);

  // 🔹 Get old data
  const oldSnap = await getDocs(
    query(collection(db, "IssuesTraker"), where(documentId(), "==", editingId))
  );

  const oldData = oldSnap.docs[0]?.data() || {};

  await updateDoc(issueRef, payload);

  // 🔹 Compute changed fields only
  const changes = {};

  Object.keys(payload).forEach((key) => {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(payload[key])) {
      changes[key] = {
        before: oldData[key],
        after: payload[key],
      };
    }
  });

  await logIssueHistory(editingId, "Updated", changes);
hideLoading()
  alert("Issue Updated");
}
 else {
    const newDoc = await addDoc(collection(db, "IssuesTraker"), {
      ...payload,
      createdAt: Timestamp.now(),
    });

    await logIssueHistory(newDoc.id, "Created", payload);
	hideLoading()
    alert("Issue Added");
  }

  resetForm();
  loadData();
} catch (err) {
hideLoading()
  console.error(err);
}
};
const submitReply = async (issueId) => {
  const message = replyText[issueId]?.trim();

  if (!message) {
    alert("Please enter a reply");
    return;
  }

  setReplyLoading((prev) => ({
    ...prev,
    [issueId]: true,
  }));

  try {
    const createdAt = Timestamp.now();

    await addDoc(
      collection(db, "IssuesTraker", issueId, "Replies"),
      {
        message,
        repliedBy: {
          uid: ActualUser.id,
          name: ActualUser.displayName || "",
          email: ActualUser.email || "",
        },
        createdAt,
      }
    );

    /*
     * This is essential. Without updating the parent document,
     * Firestore will not move the replied issue to the top.
     */
    await updateDoc(doc(db, "IssuesTraker", issueId), {
      updatedAt: createdAt,
    });

    setReplyText((prev) => ({
      ...prev,
      [issueId]: "",
    }));

    await loadData();
  } catch (error) {
    console.error("Reply submission failed:", error);
    alert("Reply could not be submitted");
  } finally {
    setReplyLoading((prev) => ({
      ...prev,
      [issueId]: false,
    }));
  }
};
  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box p={4} maxWidth={1300} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Issue Tracker Dashboard
      </Typography>

      <Paper sx={{ p: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>
          Raise New Issue
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Issue Description"
              multiline
              rows={3}
              value={form.issueText}
              onChange={(event) => handleFormChange(event, 'issueText')}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Service"
              value={form.service}
              onChange={(event) => handleFormChange(event, 'service')}
            >
              {serviceOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="From"
              value={form.raisedFrom?.mainvalue}
              onChange={(event) => handleFormChange(event, 'raisedFrom',"mainvalue")}
            >
              <MenuItem value="team member">Team Member</MenuItem>
              <MenuItem value="physician">Physician</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>

          {form?.raisedFrom?.mainvalue === "team member" && (
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                From Team Member?
              </Typography>
              <Select
                options={adminOptions}
                value={form?.raisedFrom?.relation}
                onChange={(event) => handleFormChange(event, 'raisedFrom','relation')}
                isSearchable
              />
            </Grid>
          )}
          {form?.raisedFrom?.mainvalue === "physician" && (
          <>
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                From Physician Email?
              </Typography>
              <TextField
              
              fullWidth
              value={form?.raisedFrom?.relation?.email}
              onChange={(event) => handleFormChange(event, 'raisedFrom','relation','email')}
            />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                From Physician Name?
              </Typography>
              <TextField
              fullWidth
              value={form?.raisedFrom?.relation?.name}
              onChange={(event) => handleFormChange(event, 'raisedFrom','relation','name')}
            />
            </Grid>
            </>
          )}
          {form?.raisedFrom?.mainvalue === "other" && (
          <>
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                From Other Email?
              </Typography>
              <TextField
              
              fullWidth
              value={form?.raisedFrom?.relation?.email}
              onChange={(event) => handleFormChange(event, 'raisedFrom','relation','email')}
            />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                From Other Name?
              </Typography>
              <TextField
              fullWidth
              value={form?.raisedFrom?.relation?.name}
              onChange={(event) => handleFormChange(event, 'raisedFrom','relation','name')}
            />
            </Grid>
            </>
          )}

          {form?.raisedFrom?.mainvalue === "student" && (
            <Grid item xs={12} md={4}>
              <Typography fontWeight="500" mb={1}>
                Select From Student?
              </Typography>
              <Select
                options={studentOptions}
                value={form?.raisedFrom?.relation}
                onChange={(event) => handleFormChange(event, 'raisedFrom','relation')}
                onInputChange={(value) =>
                  setStudentSearch(value)
                }
                isLoading={studentLoading}
                isSearchable
                placeholder="Search student..."
                noOptionsMessage={() =>
                  studentSearch.length < 2
                    ? "Type at least 2 characters"
                    : "No students found"
                }
              />
            </Grid>
          )}

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(event) => handleFormChange(event, 'status')}
            >
              <MenuItem value="assigned">
                Newly Assigned
              </MenuItem>
              <MenuItem value="In progress">
                In Progress
              </MenuItem>
              <MenuItem value="Resolved">
                Resolved
              </MenuItem>
              <MenuItem value="Pending">
                Pending
              </MenuItem>
              <MenuItem value="stuck">
                Stuck/need help
              </MenuItem>
               <MenuItem value="Closed">
                Closed
              </MenuItem>
            </TextField>
          </Grid>
    <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Due Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={form['duedate']?dayjs(form['duedate'].toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event, 'duedate')}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Due Date"
  		variant="outlined"
  		name={`duedate`}
      /></Typography>
                </Box>
              </Grid>

          <Grid item xs={12} md={4}>
            <Typography fontWeight="500" mb={1}>
              Assigned To
            </Typography>
            <Select
              options={adminOptions}
              value={form.assignedTo}
              onChange={(event) => handleFormChange(event, 'assignedTo')}
              isSearchable
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={form.notes}
            onChange={(event) => handleFormChange(event, 'notes')}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={saveIssue}
            >
              Submit Issue
            </Button>
          </Grid>
        </Grid>
      </Paper>
<Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
  <Typography variant="h6" mb={2}>
    Filters
  </Typography>

  <Grid container spacing={3}>
    
    {/* Raised By */}
    <Grid item xs={12} md={3}>
      <Typography fontWeight="500" mb={1}>
        Raised By
      </Typography>
      <Select
        options={adminOptions}
        value={filters.raisedBy}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, raisedBy: val }))
        }
        isClearable
      />
    </Grid>

    {/* Assigned To */}
    <Grid item xs={12} md={3}>
      <Typography fontWeight="500" mb={1}>
        Assigned To
      </Typography>
      <Select
        options={adminOptions}
        value={filters.assignedTo}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, assignedTo: val }))
        }
        isClearable
      />
    </Grid>

    {/* Status */}
    <Grid item xs={12} md={2}>
      <TextField
        select
        fullWidth
        label="Status"
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, status: e.target.value }))
        }
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="assigned">Newly Assigned</MenuItem>
        <MenuItem value="In progress">In Progress</MenuItem>
        <MenuItem value="Resolved">Resolved</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="stuck">Stuck</MenuItem>
        <MenuItem value="Closed">Closed</MenuItem>
      </TextField>
    </Grid>

    {/* Created From */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Created From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            createdFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Created To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            createdTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>
     <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Updated From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            updatedFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Updated To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            updatedTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Due From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            duedateFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Due To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            duedateTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    <Grid item xs={12}>
      <Button
        variant="contained"
        onClick={loadData}
      >
        Apply Filters
      </Button>

      <Button
        sx={{ ml: 2 }}
        onClick={() => {
          setFilters({
            raisedBy: null,
            assignedTo: null,
            status: "",
            createdFrom: null,
            createdTo: null,
            updatedFrom: null,
            updatedTo: null,
          });
          loadData();
        }}
      >
        Reset
      </Button>
    </Grid>

  </Grid>
</Paper>

      {/* ================= ISSUE LIST ================= */}

      {issues.map((issue) => {
      const currentStatusStyle =
    statusStyles[issue.status] || {
      background: "linear-gradient(90deg,#757f9a,#d7dde8)",
      chipColor: "#757f9a",
    };
      return (
  <Paper
    key={issue.id}
    elevation={4}
    sx={{
      p: 3,
      mb: 4,
      borderRadius: 4,
      background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
      transition: "0.3s",
      "&:hover": {
        transform: "scale(1.01)",
      },
    }}
  >
    {/* Header */}
    <Box
      display="flex"
      alignItems="center"
      sx={{
  		background: currentStatusStyle.background,
        p: 2,
        borderRadius: 3,
        color: "white",
      }}
    >
      <Typography fontWeight="bold">
        {issue.service}
      </Typography>

      <Box flexGrow={1} />

      <Chip
        label={issue.status}
        sx={{
          background: "white",
          fontWeight: "bold",
          color: currentStatusStyle.chipColor,
        }}
      />

      <IconButton
        sx={{ color: "white", ml: 1 }}
        onClick={() => handleEdit(issue)}
      >
        <EditIcon />
      </IconButton>

      {issue.status !== "Resolved" && (
        <IconButton
          sx={{ color: "white" }}
          onClick={() => handleResolve(issue.id)}
        >
          <CheckCircleIcon />
        </IconButton>
      )}
    </Box>
{/* Replies */}
<Box
  mt={2}
  sx={{
    backgroundColor: "#fff",
    border: "1px solid #dce3ec",
    borderRadius: 2,
    p: 2,
  }}
>
  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
    Replies
  </Typography>

  <Box display="flex" gap={1} mb={2}>
    <TextField
      fullWidth
      size="small"
      multiline
      minRows={2}
      placeholder="Write a reply..."
      value={replyText[issue.id] || ""}
      onChange={(event) =>
        setReplyText((prev) => ({
          ...prev,
          [issue.id]: event.target.value,
        }))
      }
    />

    <Button
      variant="contained"
      disabled={
        replyLoading[issue.id] ||
        !replyText[issue.id]?.trim()
      }
      onClick={() => submitReply(issue.id)}
    >
      {replyLoading[issue.id] ? "Sending..." : "Reply"}
    </Button>
  </Box>

  {issue.replies?.length > 0 ? (
    issue.replies.map((reply) => (
      <Box
        key={reply.id}
        sx={{
          p: 1.5,
          mb: 1,
          borderRadius: 2,
          backgroundColor: "#f4f7fb",
          borderLeft: "4px solid #1976d2",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Typography variant="body2" fontWeight="bold">
            {reply.repliedBy?.name || "Unknown user"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {reply.createdAt?.toDate
              ? reply.createdAt.toDate().toLocaleString()
              : ""}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          mt={0.5}
          sx={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
          }}
        >
          {reply.message}
        </Typography>
      </Box>
    ))
  ) : (
    <Typography variant="body2" color="text.secondary">
      No replies yet.
    </Typography>
  )}
</Box>
    {/* Body */}
    <Box mt={3}>
      <Typography variant="h6">
        {issue.issueText}
      </Typography>

      <Grid container spacing={2} mt={1}>
      <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Raised From:</strong>{" "}
            {issue?.raisedFrom?.mainvalue}
          </Typography>
        </Grid>
        {issue?.raisedFrom?.mainvalue !== "physician" && (
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>From Team Member:</strong>{" "}
            {issue?.raisedFrom?.relation?.label}
          </Typography>
        </Grid>
        
        )}
        {issue?.raisedFrom?.mainvalue === "physician" && (
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>From Physician:</strong>{" "}
            {issue?.raisedFrom?.relation?.name}({issue?.raisedFrom?.relation?.email})
          </Typography>
        </Grid>
        
        )}
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Raised By:</strong>{" "}
            {issue.listedBy?.displayName}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Assigned To:</strong>{" "}
            {issue.assignedTo?.label || "Not Assigned"}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Created:</strong>{" "}
            {issue.createdAt?.toDate().toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Due Date:</strong>{" "}
            {issue?.duedate?.toDate().toLocaleString()}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Updated:</strong>{" "}
            {issue.updatedAt?.toDate().toLocaleString()}
          </Typography>
        </Grid>
      </Grid>

      {issue.notes && (
        <Typography mt={2}>
          <strong>Notes:</strong> {issue.notes}
        </Typography>
      )}
    </Box>
    <Box mt={3}>
  <Typography variant="subtitle1" fontWeight="bold">
    Change History
  </Typography>

  {issue.history?.map((h, index) => (
    <Box
      key={index}
      sx={{
        borderLeft: "4px solid #1976d2",
        pl: 2,
        mt: 1,
      }}
    >
      <Typography variant="body2">
        <Typography
  variant="body2"
  sx={{ cursor: "pointer", color: "#1976d2" }}
  onClick={() => toggleHistory(issue.id, h.id)}
>
  <strong>{h.action}</strong> by {h.performedBy?.name}({h.performedBy?.email})
</Typography>
      </Typography>
      <Typography variant="caption">
        {h.timestamp?.toDate().toLocaleString()}
      </Typography>
      {expandedHistory[h.id] && h.changes && (
  <Box mt={1}
  sx={{
    background: "#f4f6f8",
    p: 2,
    borderRadius: 2,
    overflowWrap: "break-word",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  }}>
    {Object.entries(h.changes).map(([field, value]) => (
      <Box key={field} mb={1}>
        <Typography variant="caption" fontWeight="bold">
          {field}
        </Typography>

        <Typography variant="body2" color="error">
          Before: {formatValue(value.before)}
        </Typography>

        <Typography variant="body2" color="success.main">
          After: {formatValue(value.after)}
        </Typography>
      </Box>
    ))}
  </Box>
)}

    </Box>
  ))}
</Box>
  </Paper>
)}
)}


    </Box>
  );
}
