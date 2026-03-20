import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import Select1 from 'react-select';
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import JoditEditor from "jodit-react";
import { useLoading } from "../../layout/LoadingContext";
let panelistOptions={}
let groupedOptions;
export default function EditStudentMocksAdmin() {
  const { id } = useParams(); // user uid
  const {
    FetchDataFromCollection,
    handleUpdate,
    showLoading,
    hideLoading,
    fetchAdminDataWithJoin,
  } = useLoading();

  const [studentData, setStudentData] = useState(null);
  const [panelists, setPanelists] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [teamEmails, setTeamEmails] = useState([]);

  /* ================= LOAD USER + PANELISTS ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    showLoading();
    try {
      const userDataSelected = await FetchDataFromCollection(
        "Users",
        20,
        "uid",
        "==",
        id,
        0
      );

      const ListOfPanelists = await FetchDataFromCollection(
        "Panelists",
        2000,
        null,
        null,
        null,
        0
      );
      const ListOfTeam = await fetchAdminDataWithJoin(
      "UsersRoles",
      "Users",
      300,
      null,
      "Role",
      "in",
      ["SuperAdmin","Admin"]
    );
	setTeamEmails(ListOfTeam.data.map((item) => item.email));
groupedOptions = [
  {
    label: "Panelists",
    options: Object.entries(ListOfPanelists).map(
  ([email, objec]) => ({
    value: objec.email,
    label: objec.name,
  }))
  },
  {
    label: "Team",
    options: ListOfTeam.data.map((item) => ({
    value: item.email,
    label: item.displayName,
  }))
  }
  
];

      if (userDataSelected.length > 0) {
        const user = userDataSelected[0];

        if (!Array.isArray(user.studentMocks)) {
          user.studentMocks = [];
        }

        if (!user.studentMocksConfig) {
          user.studentMocksConfig = { totalMocksAllowed: 0,additionalMockPrice: 2500 };
        }

        setStudentData(user);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
    hideLoading();
    setLoading(false);
  };

  /* ============ AUTO SYNC MOCK COUNT ============ */
  useEffect(() => {
    if (!studentData) return;

    const total = studentData.studentMocksConfig.totalMocksAllowed ?? 0;

    setStudentData((prev) => {
      let mocks = [...(prev.studentMocks || [])];

      if (mocks.length < total) {
        for (let i = mocks.length; i < total; i++) {
          mocks.push({
            title: `Mock Interview ${i + 1}`,
            isTaken: false,
            takenDate: null,
            mentorId: null,
            mentorName: null,
            notesHtml: "",
          });
        }
      } else if (mocks.length > total) {
        mocks = mocks.slice(0, total);
      }

      return { ...prev, studentMocks: mocks };
    });
  }, [studentData?.studentMocksConfig?.totalMocksAllowed]);

  /* ================= HELPERS ================= */
  const updateMock = (index, key, value) => {
    setStudentData((prev) => {
      const mocks = [...prev.studentMocks];
      mocks[index][key] = value;
      return { ...prev, studentMocks: mocks };
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    setStudentData((prev) => {
      const mocks = [...prev.studentMocks];
      const [moved] = mocks.splice(result.source.index, 1);
      mocks.splice(result.destination.index, 0, moved);
      return { ...prev, studentMocks: mocks };
    });
  };

  const isEmptyHtml = (html) =>
    !html ||
    html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === "";

  /* ================= VALIDATION ================= */
  const validate = () => {
    const errs = {};
	/*if (
  studentData.studentMocksConfig.additionalMockPrice == null ||
  studentData.studentMocksConfig.additionalMockPrice < 0
) {
  errs.additionalMockPrice =
    "Additional mock price must be a valid amount";
}*/
    studentData.studentMocks.forEach((m, i) => {
      if (!m.title?.trim()) errs[`title_${i}`] = "Title required";

      if (m.isTaken) {
        if (!m.takenDate) errs[`date_${i}`] = "Date required";
        if (!m.mentorEmail) errs[`mentor_${i}`] = "Mentor required";
        const isTeamMentor = teamEmails.includes(m.mentorEmail);
		if ( isTeamMentor) 
		{
  			if (isEmptyHtml(m.notesHtml)) 
  			{
    			errs[`notes_${i}`] = "Notes required when mock is taken by team";
  			}
		}
      }

      
    });

    return errs;
  };

  /* ================= SAVE ================= */
  const saveMocks = async () => {
    const v = validate();
    console.log("v ====>",v)
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    showLoading();
    try {
      await handleUpdate("Users", id, {
        studentMocks: studentData.studentMocks,
        studentMocksConfig: studentData.studentMocksConfig,
      });
      alert("Mocks updated successfully");
    } catch (e) {
      console.error(e);
      alert("Error saving mocks");
    }
    hideLoading();
  };

  if (loading || !studentData) return <Typography>Loading…</Typography>;

  /* ================= UI ================= */
  return (
    <Box p={4} maxWidth={1100} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Mock Interviews – Admin Management
      </Typography>

      {/* MOCK COUNT */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography fontWeight="600" mb={1}>
          Number of Mocks in Plan (0–10)
        </Typography>

        <TextField
          type="number"
          inputProps={{ min: 0, max: 10 }}
          value={studentData.studentMocksConfig.totalMocksAllowed}
          onChange={(e) =>
            setStudentData((prev) => ({
              ...prev,
              studentMocksConfig: {
                totalMocksAllowed: Number(e.target.value),
              },
            }))
          }
        />
      </Paper>
      <Paper sx={{ p: 3, mb: 4 }}>
  <Typography fontWeight="600" mb={1}>
    Additional Mock Purchase Amount
  </Typography>

  <TextField
    type="number"
    fullWidth
    inputProps={{ min: 0 }}
    value={studentData.studentMocksConfig.additionalMockPrice ?? ""}
    placeholder="Enter amount per additional mock"
    onChange={(e) =>
      setStudentData((prev) => ({
        ...prev,
        studentMocksConfig: {
          ...prev.studentMocksConfig,
          additionalMockPrice: Number(e.target.value),
        },
      }))
    }
  />
{errors[`additionalMockPrice`] && (
                        <Typography color="error" mt={1}>
                          {errors[`additionalMockPrice`]}
                        </Typography>
                      )}
  <Typography variant="caption" color="text.secondary">
    This amount will be charged when the student purchases extra mocks
  </Typography>
</Paper>

      {/* MOCK LIST */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="mocks">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {studentData.studentMocks.map((mock, index) => (
                <Draggable
                  key={index}
                  draggableId={`mock-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ p: 3, mb: 3, borderRadius: 3 }}
                    >
                      <Box display="flex" alignItems="center">
                        <Box {...provided.dragHandleProps} mr={1}>
                          <DragIndicatorIcon />
                        </Box>

                        <Typography fontWeight="600">
                          Mock #{index + 1}
                        </Typography>

                        <Box flexGrow={1} />

                        <Chip
                          label={mock.isTaken ? "Completed" : "Pending"}
                          color={mock.isTaken ? "success" : "warning"}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <TextField
                        label="Title"
                        fullWidth
                        value={mock.title}
                        error={!!errors[`title_${index}`]}
                        helperText={errors[`title_${index}`]}
                        onChange={(e) =>
                          updateMock(index, "title", e.target.value)
                        }
                      />

                      <Select
                        fullWidth
                        sx={{ mt: 2 }}
                        value={mock.isTaken ? "Yes" : "No"}
                        onChange={(e) =>
                          updateMock(
                            index,
                            "isTaken",
                            e.target.value === "Yes"
                          )
                        }
                      >
                        <MenuItem value="No">Not Taken</MenuItem>
                        <MenuItem value="Yes">Taken</MenuItem>
                      </Select>

                      {mock.isTaken && (
                        <>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Date Taken"
                              value={
                                mock.takenDate
                                  ? dayjs(mock.takenDate.toDate())
                                  : null
                              }
                              onChange={(date) =>
                                updateMock(
                                  index,
                                  "takenDate",
                                  Timestamp.fromDate(date.toDate())
                                )
                              }
                              sx={{ mt: 2, width: "100%" }}
                            />
                          </LocalizationProvider>
	{errors[`date_${index}`] && (
                        <Typography color="error" mt={1}>
                          {errors[`date_${index}`]}
                        </Typography>
                      )}
                          <Select1
  styles={{
    control: (base) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: errors[`mentor_${index}`] ? '#d32f2f' : '#ccc',
      boxShadow: 'none',
      minHeight: '44px',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}
  value={
    mock.mentorEmail
      ? {
          value: mock.mentorEmail,
          label: mock.mentorName,
        }
      : null
  }
  options={groupedOptions}
  placeholder="Assigned Mentor"
  isSearchable
  onChange={(selected) => {
    updateMock(index, "mentorEmail", selected?.value || null);
    updateMock(index, "mentorName", selected?.label || null);
  }}
/>
{errors[`mentor_${index}`] && (
                        <Typography color="error" mt={1}>
                          {errors[`mentor_${index}`]}
                        </Typography>
                      )}
                        </>
                      )}

                      <Typography mt={3} fontWeight="600">
                        Notes
                      </Typography>

                      <JoditEditor
                        value={mock.notesHtml}
                        onBlur={(c) =>
                          updateMock(index, "notesHtml", c)
                        }
                      />

                      {errors[`notes_${index}`] && (
                        <Typography color="error" mt={1}>
                          {errors[`notes_${index}`]}
                        </Typography>
                      )}
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 3 }}
        onClick={saveMocks}
      >
        Save Mock Configuration
      </Button>
    </Box>
  );
}
