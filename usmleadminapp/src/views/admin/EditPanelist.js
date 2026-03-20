// AddEditPanelist.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper
} from "@mui/material";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AddEditPanelist() {

  const { match_id } = useParams(); // optional
  const navigate = useNavigate();

  const isEditMode = !!match_id;

  const [loading, setLoading] = useState(true);
  const [formdata, setFormData] = useState({
    name: "",
    email: ""
  });
  const [errors, setErrors] = useState({});

  // 🔹 Load panelist if editing
  useEffect(() => {
    if (isEditMode) {
      loadPanelist();
    } else {
      setLoading(false);
    }
  }, []);

  const loadPanelist = async () => {
    try {
      const docRef = doc(db, "Panelists", match_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else {
        alert("Panelist not found");
        navigate("/admin/panelists");
      }
    } catch (error) {
      console.error("Error loading panelist:", error);
    }
    setLoading(false);
  };

  // 🔹 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Validation
  const validate = () => {
    const newErrors = {};

    if (!formdata.name.trim()) {
      newErrors.name = "Panelist name is required";
    }

    if (!formdata.email.trim()) {
      newErrors.email = "Email is required";
    }

    return newErrors;
  };

  // 🔹 Save (Add or Update)
  const savePanelist = async () => {

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {

      if (isEditMode) {
        // 🔥 UPDATE
        const docRef = doc(db, "Panelists", match_id);

        await updateDoc(docRef, {
          name: formdata.name,
          namesmall: formdata.name.toLowerCase(),
          email: formdata.email,
          updatedAt: Timestamp.now()
        });

        alert("Panelist updated successfully!");

      } else {
        // 🔥 CREATE
        const newDocRef = doc(db, "Panelists"); // auto ID

        await setDoc(newDocRef, {
          id: newDocRef.id,
          name: formdata.name,
          namesmall: formdata.name.toLowerCase(),
          email: formdata.email,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        alert("Panelist added successfully!");
      }

      navigate("/admin/listofpanelist");

    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving panelist");
    }
  };

  if (loading) return <h3>Loading...</h3>;

  return (
    <Box p={4}>
      <Paper sx={{ p: 4, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? "Edit Panelist" : "Add Panelist"}
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={12}>
            <TextField
              label="Panelist Name"
              name="name"
              fullWidth
              value={formdata.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              fullWidth
              value={formdata.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={savePanelist}
            >
              {isEditMode ? "Update Panelist" : "Add Panelist"}
            </Button>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
}