import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function StudentResourceList() {
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const snapshot = await getDocs(collection(db, "StudentResources"));
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setFeatures(data?.Features || []);
    }
  };

  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Learning Resources
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Curated resources to guide you through your journey.
      </Typography>

      <Stack spacing={2}>
        {features.map((feature, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate(`/user/studentresourceview/${index}`)}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Chip
                  label={`Resource ${index + 1}`}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography fontWeight="600">
                  {feature.title}
                </Typography>
              </Box>

              <ArrowForwardIosIcon color="action" />
            </CardContent>
          </Card>
        ))}

        {!features.length && (
          <Typography color="text.secondary">
            No resources available at the moment.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
