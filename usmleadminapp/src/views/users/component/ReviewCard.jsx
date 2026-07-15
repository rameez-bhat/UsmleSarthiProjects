// components/ReviewCard.jsx

import React from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Box,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PendingIcon from "@mui/icons-material/Pending";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const formatDate = (date) => {
  if (!date) return "-";

  try {
    if (date.toDate) {
      return dayjs(date.toDate()).format("MMM DD, YYYY");
    }

    return dayjs(date).format("MMM DD, YYYY");
  } catch {
    return "-";
  }
};

const ReviewCard = ({
  title,
  color = "#1976d2",
  review = {},
}) => {

  const completed =
    review?.receivedfromjournalistdate ||
    review?.receivedfromphysiciandate;

  const getStatus = () => {
    if (completed)
      return {
        label: "Completed",
        color: "success",
        icon: <CheckCircleIcon />,
      };

    if (
      review?.senttojournalistdate ||
      review?.senttophysiciandate
    )
      return {
        label: "In Progress",
        color: "warning",
        icon: <HourglassTopIcon />,
      };

    return {
      label: "Pending",
      color: "default",
      icon: <PendingIcon />,
    };
  };

  const status = getStatus();

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
        transition: ".25s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
      }}
    >
      <Box
        sx={{
          background: color,
          color: "#fff",
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
        >
          {title}
        </Typography>

        <Chip
          icon={status.icon}
          color={status.color}
          label={status.label}
        />
      </Box>

      <CardContent>

        <Grid container spacing={2}>

          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Reviewer
            </Typography>

            <Typography
              display="flex"
              alignItems="center"
              gap={1}
            >
              <PersonIcon fontSize="small" />
              {review?.senttojournalist?.label ||
                review?.senttophysician?.label ||
                "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Review Source
            </Typography>

            <Typography>
              {review?.receivedvia || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Submitted
            </Typography>

            <Typography
              display="flex"
              alignItems="center"
              gap={1}
            >
              <CalendarMonthIcon fontSize="small" />
              {formatDate(
                review?.senttojournalistdate ||
                  review?.senttophysiciandate
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Review Returned
            </Typography>

            <Typography
              display="flex"
              alignItems="center"
              gap={1}
            >
              <AssignmentTurnedInIcon fontSize="small" />

              {formatDate(
                review?.receivedfromjournalistdate ||
                  review?.receivedfromphysiciandate
              )}
            </Typography>
          </Grid>

        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="subtitle1"
          fontWeight="bold"
          mb={2}
        >
          <ChatBubbleOutlineIcon
            sx={{
              mr: 1,
              verticalAlign: "middle",
            }}
          />
          Feedback
        </Typography>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "#f8fafc",
            p: 2,
            minHeight: 180,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            whiteSpace: "pre-wrap",
          }}
        >
          <Typography
            variant="body2"
            lineHeight={1.9}
          >
            {review?.notes ||
              "No feedback has been added yet."}
          </Typography>
        </Paper>

      </CardContent>
    </Card>
  );
};

export default ReviewCard;