import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function StudentResourceView() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);

  useEffect(() => {
    loadResource();
  }, []);

  const loadResource = async () => {
    const snapshot = await getDocs(collection(db, "StudentResources"));
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setFeature(data?.Features?.[index]);
    }
  };

  if (!feature) {
    return (
      <Typography p={3} color="text.secondary">
        Loading resource…
      </Typography>
    );
  }

  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth={1000} mx="auto">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Resources
      </Button>

      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {feature.title}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box
          className="resource-content"
          sx={{
            "& h1, & h2, & h3": {
              mt: 3,
              mb: 1,
            },
            "& p": {
              mb: 2,
              lineHeight: 1.8,
            },
            "& ul, & ol": {
              pl: 3,
              mb: 2,
            },
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
            },
            "& table, & th, & td": {
              border: "1px solid #ccc",
              p: 1,
            },
          }}
          dangerouslySetInnerHTML={{ __html: feature.contentHtml }}
        />
      </Paper>
    </Box>
  );
}
