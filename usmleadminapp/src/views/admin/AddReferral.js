import React, { useState, useEffect } from "react";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router-dom";
import { useLoading } from "../../layout/LoadingContext";

let ReferralserviceOptions=[];

const AddReferral = () => {
  const { handleUpdate, FetchDataFromCollection,ReferralemptyServiceRow,ReferraldiscountTypes } = useLoading();
  const navigate = useNavigate();
  const [existingServices, setExistingServices] = useState([]);
  const [services, setServices] = useState([{ ...ReferralemptyServiceRow }]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Get already selected services
  //const selectedServices = services.map((s) => s.service);
  const selectedServices = [...new Set([
  ...services.map((s) => s.service),
  ...existingServices
])];
useEffect(() => {
  fetchExistingReferrals();
}, []);

const fetchExistingReferrals = async () => {
  try {
    const list = await FetchDataFromCollection(
      "ReferralDiscounts",
      500,
      "service",
      "!=",
      "",
      0
    );

	const Matchlist = await FetchDataFromCollection(
      "MatchPlans",
      500,
      "Pid",
      "!=",
      "",
      0
    );
    ReferralserviceOptions = Matchlist.map(item => {
  return item.Name || item.Pid || item.id;
});
ReferralserviceOptions.push("Rotation Application");
console.log("ReferralserviceOptions---->",ReferralserviceOptions)
    const savedServices = list.map((doc) => doc.service);
    console.log("savedServices---->",savedServices)
    console.log("list---->",list)
    setExistingServices(savedServices);
  } catch (err) {
    console.error("Failed to fetch existing referrals:", err);
  }
};
  const handleChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const addMoreService = () => {
    setServices([...services, { ...ReferralemptyServiceRow }]);
  };

  const removeService = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const validate = () => {
    const newErrors = [];

    services.forEach((row, index) => {
      const rowErrors = {};

      if (!row.service) rowErrors.service = "Service required";
      if (!row.referralDiscountType) rowErrors.referralDiscountType = "Required";
      if (!row.discountFeeType) rowErrors.discountFeeType = "Required";
      if (!row.referralDiscountValue) rowErrors.referralDiscountValue = "Required";
      if (!row.userDiscountType) rowErrors.userDiscountType = "Required";
      if (!row.userDiscountValue) rowErrors.userDiscountValue = "Required";

      if (
        row.referralDiscountType === "Percentage" &&
        Number(row.referralDiscountValue) > 100
      ) {
        rowErrors.referralDiscountValue = "Max 100%";
      }

      if (
        row.userDiscountType === "Percentage" &&
        Number(row.userDiscountValue) > 100
      ) {
        rowErrors.userDiscountValue = "Max 100%";
      }

      newErrors[index] = rowErrors;
    });

    setErrors(newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

const handleSubmit = async () => {
  if (!validate()) return;

  try {
    setLoading(true);

    for (const s of services) {
      if (!s.service) continue;

      // ✅ Create document ID by removing spaces
      const docId = s.service.replace(/\s+/g, "");

      const payload = {
        service: s.service,
        id:docId,
        referralDiscountType: s.referralDiscountType,
        referralDiscountValue: Number(s.referralDiscountValue),
        discountFeeType: s.discountFeeType,
        userDiscountType: s.userDiscountType,
        userDiscountValue: Number(s.userDiscountValue),
        createdAt: new Date(),
      };

      // ✅ Each service saved as its own document
      await handleUpdate("ReferralDiscounts", docId, payload);
    }

    alert("Referral Services Added Successfully");
	navigate("/admin/referrallist");
    setServices([{ ...ReferralemptyServiceRow }]);
  } catch (err) {
    console.error(err);
    alert("Failed to save referrals");
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper sx={{ p: 4, width: "90%", maxWidth: 1100 }}>
        <Typography variant="h6" mb={3}>
          Add Referral Services
        </Typography>

       {services.map((row, index) => (
  <Box
    key={index}
    sx={{
      border: "1px solid #ccc",
      p: 2,
      mb: 3,
      borderRadius: 2,
      background: "#fafafa",
    }}
  >
    <Grid container spacing={2} alignItems="center">

      {/* SERVICE */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!errors?.[index]?.service}>
          <InputLabel>Service</InputLabel>
          <Select
            value={row.service}
            label="Service"
            onChange={(e) =>
              handleChange(index, "service", e.target.value)
            }
          >
            {ReferralserviceOptions.map((service) => (
              <MenuItem
                key={service}
                value={service}
                disabled={
                  selectedServices.includes(service) &&
                  service !== row.service
                }
              >
                {service}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
            <FormControl
              fullWidth
              error={!!errors?.[index]?.discountFeeType}
            >
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={row.discountFeeType}
                label="Type"
                onChange={(e) =>
                  handleChange(
                    index,
                    "discountFeeType",
                    e.target.value
                  )
                }
              >
                  <MenuItem key="ServiceFee" value="ServiceFee">Service Fee Only</MenuItem>
                  <MenuItem key="ApplicationFee" value="ApplicationFee">Application Fee Only</MenuItem>
                  <MenuItem key="BothFee" value="BothFee">Both Fee</MenuItem>
 
              </Select>
            </FormControl>
          </Grid>

      {/* ===== DISCOUNT OF REFERRAL ===== */}
      <Grid item xs={12} md={4}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Discount of Referral
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={!!errors?.[index]?.referralDiscountType}
            >
              <InputLabel>Type</InputLabel>
              <Select
                value={row.referralDiscountType}
                label="Type"
                onChange={(e) =>
                  handleChange(
                    index,
                    "referralDiscountType",
                    e.target.value
                  )
                }
              >
                {ReferraldiscountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
           

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Value"
              value={row.referralDiscountValue}
              onChange={(e) =>
                handleChange(
                  index,
                  "referralDiscountValue",
                  e.target.value
                )
              }
              error={!!errors?.[index]?.referralDiscountValue}
              helperText={errors?.[index]?.referralDiscountValue}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* ===== DISCOUNT OF USER ===== */}
      <Grid item xs={12} md={4}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Discount of User
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={!!errors?.[index]?.userDiscountType}
            >
              <InputLabel>Type</InputLabel>
              <Select
                value={row.userDiscountType}
                label="Type"
                onChange={(e) =>
                  handleChange(
                    index,
                    "userDiscountType",
                    e.target.value
                  )
                }
              >
                {ReferraldiscountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Value"
              value={row.userDiscountValue}
              onChange={(e) =>
                handleChange(
                  index,
                  "userDiscountValue",
                  e.target.value
                )
              }
              error={!!errors?.[index]?.userDiscountValue}
              helperText={errors?.[index]?.userDiscountValue}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* DELETE BUTTON */}
      {services.length > 1 && (
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <IconButton
            color="error"
            onClick={() => removeService(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  </Box>
))}


        {/* ADD MORE SERVICE BUTTON */}
        <Button
          variant="outlined"
          color="primary"
          onClick={addMoreService}
          sx={{ mb: 3 }}
        >
          ➕ Add More Service
        </Button>

        {/* SUBMIT */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Referral Services"}
        </Button>
      </Paper>
    </Box>
  );
};

export default AddReferral
