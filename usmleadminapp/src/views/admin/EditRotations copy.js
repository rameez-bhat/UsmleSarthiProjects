import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  InputLabel,
  Select,
  Chip,
  Grid,
} from '@mui/material';
import {
  CFormTextarea
} from '@coreui/react';
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../../firebase';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useLoading } from '../../layout/LoadingContext';

export default function EditRotation() {
  const { location_code } = useParams();
  const navigate = useNavigate();
  const { TooltipsPopovers, showLoading, hideLoading } = useLoading();

  const [loading, setLoading] = useState(true);
  const [formdata, setformdata] = useState({});
  const [errors, setErrors] = useState({});
   const [rotationConfigs, setRotationConfigs] = useState([
    {
      seats_available: '',
      availability_dates: '',
      customDates: [],
      repeatsequence: '',
      repeatsequencecustomMonths: [],
      grouprequired: 'no',
      grouprequiredof: 0,
      needconfirmfromPhysician: 'no',
      needconfirmfromPhysicianMessage: '',
    },
  ]);

  useEffect(() => {
    const fetchRotation = async () => {
      try {
        const q = query(collection(db, 'Rotations'), where('location_code', '==', location_code));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          const AvailabilityDatafromDatabase=docData.data()
          setformdata({
            id: docData.id,
            ...docData.data(),
          });
          if(AvailabilityDatafromDatabase?.availabilityData)
          {
            setRotationConfigs(AvailabilityDatafromDatabase?.availabilityData)
          }

        }
      } catch (err) {
        console.error('Error fetching rotation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRotation();
  }, [location_code]);

const handleChange = (index, key, value) => {
    setRotationConfigs(prev => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const handleDateChange = (index, name, event) => {
    if (event?.$d) {
      if (name === 'repeatsequencecustomMonths') {
        const formattedMonth = dayjs(event.$d).format('YYYY-MM');
        setRotationConfigs(prev => {
          const updated = [...prev];
          const existing = updated[index][name] || [];
          if (!existing.includes(formattedMonth)) {
            updated[index][name] = [...existing, formattedMonth];
          }
          return updated;
        });
      } else {
        const formattedDate = dayjs(event.$d).format('YYYY-MM-DD');
        setRotationConfigs(prev => {
          const updated = [...prev];
          const existing = updated[index][name] || [];
          if (!existing.includes(formattedDate)) {
            updated[index][name] = [...existing, formattedDate];
          }
          return updated;
        });
      }
    }
  };

  const handleDeleteChip = (index, key, value) => {
    setRotationConfigs(prev => {
      const updated = [...prev];
      updated[index][key] = updated[index][key].filter(v => v !== value);
      return updated;
    });
  };

  // Add new section
  const addNewSection = () => {
    setRotationConfigs(prev => [
      ...prev,
      {
        seats_available: '',
        availability_dates: '',
        customDates: [],
        repeatsequence: '',
        repeatsequencecustomMonths: [],
        grouprequired: 'no',
        grouprequiredof: 0,
        needconfirmfromPhysician: 'no',
        needconfirmfromPhysicianMessage: '',
      },
    ]);
  };

  // Remove a section
  const removeSection = (index) => {
    setRotationConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `rotations/${location_code}/${file.name}`);
    showLoading();
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setformdata(prev => ({ ...prev, rotation_image_url: url }));
      TooltipsPopovers('Success', 'Image uploaded successfully!', 'Status');
    } catch (err) {
      console.error('Image upload error:', err);
      TooltipsPopovers('Error', err.message, 'Status');
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading();
    if(formdata['needconfirmfromPhysician']=="yes" && formdata['needconfirmfromPhysicianMessage'].trim()=="")
    {
      setErrors({needconfirmfromPhysicianMessage:"Please Enter Message For Student"});
      return false;
    }
    try {
      const q = query(collection(db, 'Rotations'), where('location_code', '==', location_code));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { ...formdata });
        TooltipsPopovers('Success', 'Rotation updated successfully!', 'Status');
        setTimeout(() => navigate(`/admin/editrotation/${location_code}`), 1500);
      }
    } catch (err) {
      console.error('Error updating rotation:', err);
      TooltipsPopovers('Error', err.message, 'Status');
    } finally {
      hideLoading();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
  <Box>
   {rotationConfigs.map((config, index) => (
        <Box
          key={index}
          sx={{
            mb: 4,
            p: 3,
            border: '1px solid #ccc',
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Rotation Configuration #{index + 1}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InputLabel>Seats Available / Month</InputLabel>
              <TextField
                type="number"
                fullWidth
                value={config.seats_available}
                onChange={(e) => handleChange(index, 'seats_available', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel>Availability</InputLabel>
              <Select
                fullWidth
                value={config.availability_dates}
                onChange={(e) => handleChange(index, 'availability_dates', e.target.value)}
              >
                <MenuItem value="monday">Every Monday</MenuItem>
                <MenuItem value="tuesday">Every Tuesday</MenuItem>
                <MenuItem value="wednesday">Every Wednesday</MenuItem>
                <MenuItem value="thursday">Every Thursday</MenuItem>
                <MenuItem value="friday">Every Friday</MenuItem>
                <MenuItem value="saturday">Every Saturday</MenuItem>
                <MenuItem value="sunday">Every Sunday</MenuItem>
                <MenuItem value="everyday">Every Day</MenuItem>
                <MenuItem value="custom">Custom Dates</MenuItem>
              </Select>
            </Grid>

            {config.availability_dates === 'custom' && (
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <InputLabel>Select Multiple Dates</InputLabel>
                  <DatePicker
                    label="Pick a Date"
                    value={null}
                    onChange={(event) => handleDateChange(index, 'customDates', event)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {config.customDates.map((date) => (
                    <Chip
                      key={date}
                      label={date}
                      color="primary"
                      onDelete={() => handleDeleteChip(index, 'customDates', date)}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <InputLabel>Repeat Sequence</InputLabel>
              <Select
                fullWidth
                value={config.repeatsequence}
                onChange={(e) => handleChange(index, 'repeatsequence', e.target.value)}
              >
                <MenuItem value="allmonths">All Months</MenuItem>
                <MenuItem value="specified months">Specified Months</MenuItem>
              </Select>
            </Grid>

            {config.repeatsequence === 'specified months' && (
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <InputLabel>Select Months</InputLabel>
                  <DatePicker
                    label="Pick a Month"
                    views={['year', 'month']}
                    value={null}
                    onChange={(event) => handleDateChange(index, 'repeatsequencecustomMonths', event)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {config.repeatsequencecustomMonths.map((month) => (
                    <Chip
                      key={month}
                      label={month}
                      color="secondary"
                      onDelete={() => handleDeleteChip(index, 'repeatsequencecustomMonths', month)}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <InputLabel>Group Required</InputLabel>
              <Select
                fullWidth
                value={config.grouprequired}
                onChange={(e) => handleChange(index, 'grouprequired', e.target.value)}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </Select>
            </Grid>

            {config.grouprequired === 'yes' && (
              <Grid item xs={12} sm={6}>
                <InputLabel>Group Of</InputLabel>
                <TextField
                  type="number"
                  fullWidth
                  value={config.grouprequiredof}
                  onChange={(e) => handleChange(index, 'grouprequiredof', e.target.value)}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <InputLabel>Need Confirm From Physician</InputLabel>
              <Select
                fullWidth
                value={config.needconfirmfromPhysician}
                onChange={(e) => handleChange(index, 'needconfirmfromPhysician', e.target.value)}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </Select>
            </Grid>

            {config.needconfirmfromPhysician === 'yes' && (

            )}
            <Grid item xs={12} sm={6}>
                <InputLabel>Message For Student</InputLabel>
                <CFormTextarea
                  rows={2}
                  value={config.needconfirmfromPhysicianMessage}
                  onChange={(e) => handleChange(index, 'needconfirmfromPhysicianMessage', e.target.value)}
                  placeholder="Type your message"
                />
                {errors['needconfirmfromPhysicianMessage']  && <span className="validationerror">{errors['needconfirmfromPhysicianMessage'] }</span>}
              </Grid>
          </Grid>

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => removeSection(index)}
          >
            Remove This Configuration
          </Button>
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={addNewSection}
        sx={{ mt: 2 }}
      >
        + Add Another Rotation Configuration
      </Button>
        <Grid container spacing={2}>
           <Grid item xs={12} sm={6}>
            <InputLabel>Rotation Image</InputLabel>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>

            {formdata?.rotation_image_url && (
              <Box mt={2} textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                <img
                  src={formdata.rotation_image_url}
                  alt="Rotation"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>Rotation Fee Collected By</InputLabel>
            <Select
              fullWidth
              value={formdata?.rotationFeeCollectedBy || ''}
              onChange={(event) => onchangeForm(event, 'rotationFeeCollectedBy')}
            >
              <MenuItem value="usmle">Usmlesarthi</MenuItem>
              <MenuItem value="physician">Physician</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          sx={{ mt: 4, py: 1.2, fontWeight: 600 }}
        >
          Save Changes
        </Button>

    </Box>
  );
}
