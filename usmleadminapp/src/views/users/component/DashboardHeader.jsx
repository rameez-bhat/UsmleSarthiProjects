import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  Box,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import DescriptionIcon from "@mui/icons-material/Description";

const DashboardHeader = ({
  displayName,
  progress = 0,
  lastUpdated,
  reviewStatus = {},
}) => {
  const renderChip = (title, completed) => (
    <Chip
      icon={
        completed ? (
          <CheckCircleIcon />
        ) : (
          <HourglassTopIcon />
        )
      }
      color={completed ? "success" : "warning"}
      label={title}
      sx={{
        mr: 1,
        mb: 1,
        fontWeight: 600,
      }}
    />
  );

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        mb: 4,
      }}
    >
      <CardContent>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={2}
        >
          <DescriptionIcon
            color="primary"
            sx={{ fontSize: 38 }}
          />

          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Personal Statement & CV Review
            </Typography>

            <Typography color="text.secondary">
              Welcome back, {displayName}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ mb: 1 }}
        >
          Overall Progress
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {progress}% Complete
        </Typography>

        <Grid container spacing={1}>

          <Grid item>
            {renderChip(
              "First Review",
              reviewStatus.first
            )}
          </Grid>

          <Grid item>
            {renderChip(
              "Second Review",
              reviewStatus.second
            )}
          </Grid>

          <Grid item>
            {renderChip(
              "ERAS CV",
              reviewStatus.eras
            )}
          </Grid>

          <Grid item>
            {renderChip(
              "Mentor Review",
              reviewStatus.mentor
            )}
          </Grid>

        </Grid>

        <Typography
          variant="caption"
          display="block"
          mt={3}
        >
          Last Updated: {lastUpdated}
        </Typography>

      </CardContent>
    </Card>
  );
};

export default DashboardHeader;