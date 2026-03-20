import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useLoading } from "../../layout/LoadingContext";

const discountTypes = ["Value", "Percentage"];

const serviceOptions = [
  "B2R Bronze Combo",
  "B2R Gold Combo",
  "B2R Platinum Combo",
  "Bronze",
  "Gold",
  "Platinum",
  "Platinum & Hackensack Combo",
  "Quick IV Prep",
  "Quick IV Prep Plus",
  "IV Prep Interactive",
  "IV Prep OnDemand",
  "Soap Success Plan",
  "Soap Success Plan Plus",
  "Turbo CV +",
  "Turbo Match",
  "Rotation Application",
  "Research",
];
let serviceIdMain="";
const EditReferral = () => {
  const { serviceId } = useParams(); // docId without spaces
  serviceIdMain=serviceId;
  const navigate = useNavigate();
  const { FetchDataFromCollection, handleUpdate } = useLoading();

  const [form, setForm] = useState({
    service: "",
    referralDiscountType: "",
    referralDiscountValue: "",
    discountFeeType: "",
    userDiscountType: "",
    userDiscountValue: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ LOAD REFERRAL BY DOCUMENT ID
  useEffect(() => {
    loadReferral();
  }, [serviceId]);

  const loadReferral = async () => {
    try {
      setLoading(true);

      const res = await FetchDataFromCollection(
        "ReferralDiscounts",
        1,
        "__name__",
        "==",
        serviceId,
        0
      );

      if (!res.length) {
        alert("Referral not found");
        navigate("/admin/referrallist");
        return;
      }

      const data = res[0];

      setForm({
        service: data.service,
        referralDiscountType: data.referralDiscountType,
        referralDiscountValue: data.referralDiscountValue,
        discountFeeType: data.discountFeeType,
        userDiscountType: data.userDiscountType,
        userDiscountValue: data.userDiscountValue,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load referral");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ✅ VALIDATION
  const validate = () => {
    const e = {};

    if (!form.service) e.service = "Service required";
    if (!form.referralDiscountType) e.referralDiscountType = "Required";
    if (!form.referralDiscountValue) e.referralDiscountValue = "Required";
    if (!form.userDiscountType) e.userDiscountType = "Required";
    if (!form.userDiscountValue) e.userDiscountValue = "Required";

    if (
      form.referralDiscountType === "Percentage" &&
      Number(form.referralDiscountValue) > 100
    )
      e.referralDiscountValue = "Max 100%";

    if (
      form.userDiscountType === "Percentage" &&
      Number(form.userDiscountValue) > 100
    )
      e.userDiscountValue = "Max 100%";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ UPDATE FIRESTORE DOCUMENT
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        service: form.service,
        referralDiscountType: form.referralDiscountType,
        referralDiscountValue: Number(form.referralDiscountValue),
        discountFeeType: form.discountFeeType,
        userDiscountType: form.userDiscountType,
        userDiscountValue: Number(form.userDiscountValue),
        updatedAt: new Date(),
      };
console.log("payload====>",payload)
      const res=await handleUpdate("ReferralDiscounts", serviceIdMain, payload);
console.log("res====>",res)
      alert("Referral Updated Successfully");
      navigate("/admin/referrallist");
    } catch (err) {
      console.error(err);
      alert("Failed to update referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 700 }}>
        <Typography variant="h6" mb={3}>
          Edit Referral – {form.service}
        </Typography>

        <Grid container spacing={2}>

          {/* SERVICE (READ ONLY) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service"
              value={form.service}
              disabled
            />
          </Grid>
           <Grid item xs={12}>
            <FormControl
              fullWidth
            >
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={form.discountFeeType}
                label="Payment Type"
                name="discountFeeType"
                onChange={handleChange}
              >
                  <MenuItem key="ServiceFee" value="ServiceFee">Service Fee Only</MenuItem>
                  <MenuItem key="ApplicationFee" value="ApplicationFee">Application Fee Only</MenuItem>
                  <MenuItem key="BothFee" value="BothFee">Both Fee</MenuItem>
 
              </Select>
            </FormControl>
          </Grid>

          {/* DISCOUNT OF REFERRAL */}
          <Grid item xs={12}>
            <Typography fontWeight="bold">Discount of Referral</Typography>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.referralDiscountType}>
              <InputLabel>Type</InputLabel>
              <Select
                name="referralDiscountType"
                value={form.referralDiscountType}
                onChange={handleChange}
              >
                {discountTypes.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              name="referralDiscountValue"
              label="Value"
              value={form.referralDiscountValue}
              onChange={handleChange}
              error={!!errors.referralDiscountValue}
              helperText={errors.referralDiscountValue}
            />
          </Grid>

          {/* DISCOUNT OF USER */}
          <Grid item xs={12}>
            <Typography fontWeight="bold">Discount of User</Typography>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.userDiscountType}>
              <InputLabel>Type</InputLabel>
              <Select
                name="userDiscountType"
                value={form.userDiscountType}
                onChange={handleChange}
              >
                {discountTypes.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              name="userDiscountValue"
              label="Value"
              value={form.userDiscountValue}
              onChange={handleChange}
              error={!!errors.userDiscountValue}
              helperText={errors.userDiscountValue}
            />
          </Grid>

          {/* BUTTONS */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Referral"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate("/admin/referrals")}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EditReferral;
