import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import { useLoading } from "../../layout/LoadingContext";

/* ---------------- MONTH LABELS ---------------- */
const MONTH_LABELS = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  sept: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

/* ---------------- CARD GRADIENTS ---------------- */
const cardGradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #ff9966, #ff5e62)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
];

/* ---------------- HTML RENDER ---------------- */
const HtmlBlock = ({ html }) => {
  if (!html) return null;
  return (
    <Box
      sx={{
        "& table": { borderCollapse: "collapse", width: "100%" },
        "& td, & th": {
          border: "1px solid #ccc",
          padding: "8px",
        },
        "& p": { marginBottom: "8px" },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/* ---------------- SECTION BLOCK ---------------- */
const Section = ({ title, color, children }) => (
  <Box mb={3}>
    <Typography
      fontWeight="700"
      mb={1}
      sx={{
        color,
        borderLeft: `5px solid ${color}`,
        paddingLeft: 1,
      }}
    >
      {title}
    </Typography>

    <Box
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: 2,
        padding: 2,
        border: "1px solid #e0e0e0",
      }}
    >
      {children}
    </Box>
  </Box>
);

export default function StudentMatchPlans({ ActualUser }) {
  let { id } = useParams();
  if (!id && ActualUser?.id) {
    id = ActualUser.id;
  }

  const { FetchDataFromCollection, showLoading, hideLoading } = useLoading();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    showLoading();
    try {
      const docs = await FetchDataFromCollection(
        "MeetingNotes",
        1,
        "__name__",
        "==",
        id,
        0
      );

      if (docs.length > 0) {
        setPlans(convertFirestoreToUI(docs[0]));
      }
    } catch (e) {
      console.error("Error loading plans:", e);
    }
    hideLoading();
    setLoading(false);
  };

  /* ================= CONVERT FIRESTORE → UI ================= */
  const convertFirestoreToUI = (doc) => {
    const rows = [];

    Object.entries(doc).forEach(([year, months]) => {
      if (typeof months !== "object") return;

      Object.entries(months).forEach(([monthKey, data]) => {
        rows.push({
          year,
          monthKey,
          sortDate: dayjs(`${year}-${monthKey}`, "YYYY-MMM"),
          matchPlans: data.matchPlans || [],
          goals: data.goals || "",
          needs: data.needs || "",
          matchNotes: data.meetingNotes || data.matchNotes || "",
        });
      });
    });

    return rows.sort((a, b) => a.sortDate - b.sortDate);
  };

  if (loading) {
    return <Typography>Loading…</Typography>;
  }

  if (!plans.length) {
    return (
      <Typography color="text.secondary">
        No match plans available.
      </Typography>
    );
  }

  /* ================= UI ================= */
  return (
    <Box maxWidth={1100} mx="auto" p={3}>
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
        textAlign="center"
        sx={{
          background: "linear-gradient(90deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Match Planning Overview
      </Typography>

      {plans.map((plan, index) => (
        <Paper
          key={index}
          elevation={4}
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "#fafafa",
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              p: 2.5,
              background: cardGradients[index % cardGradients.length],
              color: "#fff",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {MONTH_LABELS[plan.monthKey]} {plan.year}
            </Typography>
          </Box>

          <Box p={3}>
            {/* PLAN FOCUS */}
            {plan.matchPlans.length > 0 && (
              <>
                <Typography fontWeight="600" mb={1}>
                  Plan Focus
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                  {plan.matchPlans.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* GOALS */}
            {plan.goals && (
              <Section title="Goals" color="#667eea">
                <HtmlBlock html={plan.goals} />
              </Section>
            )}

            {/* NEEDS */}
            {plan.needs && (
              <Section title="Needs" color="#43cea2">
                <HtmlBlock html={plan.needs} />
              </Section>
            )}

            {/* MEETING NOTES */}
            {plan.matchNotes && (
              <Section title="Meeting Notes" color="#ff9966">
                <HtmlBlock html={plan.matchNotes} />
              </Section>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
