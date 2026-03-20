import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { useLoading } from "../../layout/LoadingContext";
import StudentAdditionalMockPayment from "./StudentAdditionalMockPayment";

export default function StudentMocks(ActualAuthUser) {
	const ActualUser=ActualAuthUser.ActualUser;
  let { id } = useParams(); // student uid
  if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}
  const { FetchDataFromCollection, showLoading, hideLoading } = useLoading();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  /* ================= LOAD STUDENT DATA ================= */
  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
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

      if (userDataSelected.length > 0) {
        setStudentData(userDataSelected[0]);
      }
    } catch (e) {
      console.error("Error loading student mocks:", e);
    }
    hideLoading();
    setLoading(false);
  };

  if (loading) return <Typography>Loading…</Typography>;
  if (!studentData) return <Typography>No data found</Typography>;

  const mocks = studentData.studentMocks || [];
  const totalAllowed =
    studentData.studentMocksConfig?.totalMocksAllowed ?? 0;
const price = studentData?.studentMocksConfig?.additionalMockPrice;
  const usedMocks = mocks.filter((m) => m.isTaken).length;

  /* ================= UI ================= */
  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth={1000} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Mock Interview Utilization
      </Typography>

      <Typography color="text.secondary" mb={3}>
        {usedMocks} of {totalAllowed} mocks used
      </Typography>

      {/* MOCK LIST */}
      {mocks.map((mock, index) => (
        <Paper
          key={index}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: mock.isTaken ? 3 : 1,
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography fontWeight="600">
              {mock.title || `Mock Interview ${index + 1}`}
            </Typography>

            <Box flexGrow={1} />

            <Chip
              label={mock.isTaken ? "Completed" : "Pending"}
              color={mock.isTaken ? "success" : "warning"}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {mock.isTaken ? (
            <>
              <Typography mb={1}>
                <strong>Date Taken:</strong>{" "}
                {mock.takenDate?.toDate
                  ? mock.takenDate.toDate().toLocaleDateString()
                  : "—"}
              </Typography>

              <Typography mb={2}>
                <strong>Mentor:</strong>{" "}
                {mock.mentorName || "—"}
              </Typography>

              {mock.notesHtml && (
                <Box
                  sx={{
                    background: "#fafafa",
                    borderRadius: 2,
                    p: 2,
                    "& h1, & h2, & h3": { mt: 2 },
                    "& p": { lineHeight: 1.7 },
                    "& ul": { pl: 3 },
                    "& table": {
                      width: "100%",
                      borderCollapse: "collapse",
                    },
                    "& table, & th, & td": {
                      border: "1px solid #ccc",
                      p: 1,
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: mock.notesHtml,
                  }}
                />
              )}
            </>
          ) : (
            <Typography color="text.secondary">
              This mock has not been taken yet.
            </Typography>
          )}
        </Paper>
      ))}

      {/* PURCHASE ADDITIONAL MOCKS */}
      {totalAllowed > 0 && usedMocks >= totalAllowed && (
        <Paper
          sx={{
            p: 4,
            mt: 4,
            borderRadius: 3,
            textAlign: "center",
            background: "#f4f6ff",
            border: "1px dashed #4f46e5",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Need More Mock Interviews?
          </Typography>

          <Typography color="text.secondary" mb={3}>
            You have used all the mocks included in your plan.
          </Typography>

          <Button
            variant="contained"
            size="large"
           onClick={() => setShowPayment(true)}
          >
            Purchase Additional Mocks ${price}
          </Button>
          

{showPayment && (
  <StudentAdditionalMockPayment studentData={studentData} />
)}
        </Paper>
      )}
    </Box>
  );
}
