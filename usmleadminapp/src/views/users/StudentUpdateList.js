import React, { useEffect, useState } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/Campaign";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import dayjs from "dayjs";

import { db } from "../../firebase";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function StudentUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------------------------
  // DATE
  // -----------------------------------------------------

  const convertToDayjs = (value) => {
    if (!value) return null;

    if (value?.toDate) {
      return dayjs(value.toDate());
    }

    return dayjs(value);
  };

  // -----------------------------------------------------
  // LOAD
  // -----------------------------------------------------

  const loadUpdates = async () => {
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "StudentUpdates"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const now = dayjs();

      const list = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((item) => {
          const publishAt =
            convertToDayjs(item.publishAt);

          const expiresAt =
            convertToDayjs(item.expiresAt);

          // Not published yet
          if (
            publishAt &&
            now.isBefore(publishAt)
          ) {
            return false;
          }

          // Already expired
          if (
            expiresAt &&
            now.isAfter(expiresAt)
          ) {
            return false;
          }

          return true;
        });

      setUpdates(list);
    } catch (err) {
      console.error(
        "Error loading student updates:",
        err
      );

      setError(
        err.message ||
          "Unable to load updates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  // -----------------------------------------------------
  // LOADING
  // -----------------------------------------------------

  if (loading) {
    return (
      <Box
        minHeight={300}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: {
          xs: 1,
          md: 1,
        },
      }}
    >
      {/* HEADER */}

      <Box mb={3}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <CampaignIcon
            color="primary"
            sx={{ fontSize: 32 }}
          />

          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Updates & Announcements
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Important information and
              announcements for students.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* NO UPDATE */}

      {!error && updates.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <CampaignIcon
            sx={{
              fontSize: 50,
              color: "text.disabled",
              mb: 1,
            }}
          />

          <Typography
            variant="h6"
            color="text.secondary"
          >
            No new updates
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            There are currently no active
            announcements.
          </Typography>
        </Paper>
      )}

      {/* UPDATES */}

      <Stack spacing={2.5}>
        {updates.map((item) => {
          const publishAt =
            convertToDayjs(item.publishAt);

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: {
                    xs: 2,
                    md: 3,
                  },

                  pt: {
                    xs: 2,
                    md: 2.5,
                  },

                  pb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  {item.title}
                </Typography>

                {publishAt && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    mt={0.75}
                  >
                    <AccessTimeIcon
                      sx={{
                        fontSize: 15,
                        color:
                          "text.secondary",
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {publishAt.format(
                        "DD MMM YYYY, hh:mm A"
                      )}
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* HTML CONTENT */}

              <Box
                className="student-update-content"
                sx={{
                  px: {
                    xs: 2,
                    md: 3,
                  },

                  py: {
                    xs: 2,
                    md: 2.5,
                  },

                  overflowX: "auto",

                  "& p:first-of-type": {
                    mt: 0,
                  },

                  "& p:last-child": {
                    mb: 0,
                  },

                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                  },

                  "& iframe": {
                    maxWidth: "100%",
                  },

                  "& table": {
                    borderCollapse:
                      "collapse",
                    width: "100%",
                    my: 2,
                  },

                  "& table td, & table th":
                    {
                      border:
                        "1px solid #ccc",
                      padding: "8px",
                    },

                  "& a": {
                    color: "primary.main",
                    wordBreak:
                      "break-word",
                  },

                  "& ul, & ol": {
                    pl: 3,
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    item.contentHtml || "",
                }}
              />
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}