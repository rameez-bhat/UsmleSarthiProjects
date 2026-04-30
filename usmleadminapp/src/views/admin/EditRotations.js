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
  IconButton,
  Grid,
} from '@mui/material';
import {
  CFormTextarea
} from '@coreui/react';
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../../firebase';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import  '../../components/css/style.css';
import { useLoading } from '../../layout/LoadingContext';
let tempMonth;

export default function EditRotation() {
  const { location_code } = useParams();

  const navigate = useNavigate();
  const { TooltipsPopovers, showLoading, hideLoading,Timestamp } = useLoading();

  const [loading, setLoading] = useState(true);
  const [formdata, setformdata] = useState({});
  const [errors, setErrors] = useState({});
  const [pickerView, setPickerView] = useState("year");
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  let currentView="";
   const [rotationConfigs, setRotationConfigs] = useState([
    {
      seats_available: '',
      availability_dates: 'everyday',
      customDates: [],
      repeatsequence: 'allmonths',
      repeatsequencecustomMonths: [],
      grouprequired: 'no',
      grouprequiredof: 0,
      needconfirmfromPhysician: 'no',
      needconfirmfromPhysicianMessage: '',
      fee: 0,
      hasDiscount: "no",
  discountType: "",    // or "amount"
  discountValue: "",
  discountFrom: "",
  discountTo: "",
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
          const CommonSet={}
           CommonSet['id']=docData.id;
           CommonSet['visaLetterBy'] = AvailabilityDatafromDatabase?.visaLetterBy || {
  physician: false,
  lawyer: false,
  sarthi: false,

  physicianDetails: {
    letterHeads: [],
    fees: {
      clinic: { fee: 0, securityDeposit: 0 },
      hospital: { fee: 0, securityDeposit: 0 },
      university: { fee: 0, securityDeposit: 0 },
    },
  },

  lawyerF: { fee: 0, securityDeposit: 0 },
  sarthiF: { fee: 0, securityDeposit: 0 },
};
          if(AvailabilityDatafromDatabase?.rotationFeeCollectedBy)
          {
            CommonSet['rotationFeeCollectedBy']=AvailabilityDatafromDatabase?.rotationFeeCollectedBy;
          }
          CommonSet['fee']=Number(
      String(
        AvailabilityDatafromDatabase.fee
          ? AvailabilityDatafromDatabase.fee
          : AvailabilityDatafromDatabase.StudentToBeCharged
      ).replace(/[^0-9.]/g, "")
    );
          if(!AvailabilityDatafromDatabase?.hasDiscount)
          {
            CommonSet['hasDiscount']="no";
            CommonSet['discountType']="";
            CommonSet['discountValue']="";
            CommonSet['discountFrom']="";
            CommonSet['discountTo']="";
          }
          else
          {
            CommonSet['hasDiscount']=AvailabilityDatafromDatabase?.hasDiscount;
            CommonSet['discountType']=AvailabilityDatafromDatabase?.discountType;
            CommonSet['discountValue']=AvailabilityDatafromDatabase?.discountValue;
            CommonSet['discountFrom']=AvailabilityDatafromDatabase?.discountFrom;
            CommonSet['discountTo']=AvailabilityDatafromDatabase?.discountTo;
          }
          if(AvailabilityDatafromDatabase?.rotation_image_url)
          {
            CommonSet['rotation_image_url']=AvailabilityDatafromDatabase?.rotation_image_url;
          }
          if(AvailabilityDatafromDatabase?.TotalInstallements)
          {
            CommonSet['TotalInstallements']=AvailabilityDatafromDatabase?.TotalInstallements;
          }
          if(AvailabilityDatafromDatabase?.rank)
          {
            CommonSet['rank']=AvailabilityDatafromDatabase?.rank;
          }
          if(AvailabilityDatafromDatabase?.registration_fee)
          {
            CommonSet['registration_fee']=AvailabilityDatafromDatabase?.registration_fee;
          }
          setformdata(CommonSet);
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
const onchangeForm = (event,name) =>
{ 
  console.log("event---->",event)
  let value; 
  if(typeof event.target!="undefined")
  { 
    value=event.target.value; 
  } 
  else if(typeof event.$d!="undefined") 
  { 
    if(name=="discountFrom")
    {
      let dt = new Date(event);
      dt.setHours(0, 0, 0, 0); 
      value=Timestamp.fromDate(dt);
    }
    else if(name=="discountTo")
    {
      let dt = new Date(event);
      dt.setHours(23, 59, 59, 999); 
      value=Timestamp.fromDate(dt);
    }
    
  }
  else if(typeof event.label!="undefined") 
  { 
    value=event; 
  } 
  else if(typeof event[0]!="undefined") 
  { 
    value=event; 
  } 
  setformdata((prevValues) => ({ ...prevValues, [name]: value, })); 
}
const handlePhysicianLetterHeadChange = (event) => {
  const selected = event.target.value;

  setformdata(prev => {
    const fees = { ...prev.visaLetterBy?.physicianDetails?.fees };

    selected.forEach(head => {
      if (!fees[head]) {
        fees[head] = { fee: 0, securityDeposit: 0 };
      }
    });

    return {
      ...prev,
      visaLetterBy: {
        ...prev.visaLetterBy,
        physicianDetails: {
          ...prev.visaLetterBy.physicianDetails,
          letterHeads: selected,
          fees,
        },
      },
    };
  });
};
const handlePhysicianFeeChange = (head, field, value) => {
if(field=="notes")
{
  setformdata(prev => ({
    ...prev,
    visaLetterBy: {
      ...prev.visaLetterBy,
      physicianDetails: {
        ...prev.visaLetterBy.physicianDetails,
        fees: {
          ...prev.visaLetterBy.physicianDetails.fees,
          [head]: {
            ...prev.visaLetterBy.physicianDetails.fees[head],
            [field]: value,
          },
        },
      },
    },
  }));
}
else
{
  setformdata(prev => ({
    ...prev,
    visaLetterBy: {
      ...prev.visaLetterBy,
      physicianDetails: {
        ...prev.visaLetterBy.physicianDetails,
        fees: {
          ...prev.visaLetterBy.physicianDetails.fees,
          [head]: {
            ...prev.visaLetterBy.physicianDetails.fees[head],
            [field]: Number(value),
          },
        },
      },
    },
  }));
}
  
};
const handleChange = (index, key, value) => {
    setRotationConfigs(prev => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };
const handleVisaLetterChange = (key) => {
  setformdata(prev => {
    const updated = { ...prev.visaLetterBy, [key]: !prev.visaLetterBy[key] };

    if (key === "physician" && prev.visaLetterBy.physician) {
      updated.physicianDetails = {
        letterHeads: [],
        fees: {
          clinic: { fee: 0, securityDeposit: 0 },
          hospital: { fee: 0, securityDeposit: 0 },
          university: { fee: 0, securityDeposit: 0 },
        },
      };
    }

    if (key === "lawyer" && prev.visaLetterBy.lawyer) {
      updated.lawyerF = { fee: 0, securityDeposit: 0 };
    }

    if (key === "sarthi" && prev.visaLetterBy.sarthi) {
      updated.sarthiF = { fee: 0, securityDeposit: 0 };
    }

    return { ...prev, visaLetterBy: updated };
  });
};
  const handleDateChange = (index, name, event) => {
    if (event?.$d) {
      if (name === 'repeatsequencecustomMonths') {
      const updatedDate = new Date(event.$d); // make a copy
      updatedDate.setFullYear(selectedYear);
      console.log("selectedYear----->",selectedYear)
        const formattedMonth = dayjs(updatedDate).format('YYYY-MM');
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
   // e.preventDefault();
    showLoading();
    if(rotationConfigs[0]['needconfirmfromPhysician']=="yes" && rotationConfigs[0]['needconfirmfromPhysicianMessage'].trim()=="")
    {
      setErrors({'needconfirmfromPhysicianMessage0':"Please Enter Message For Student"});
      hideLoading();
      return false;
    }
    if(rotationConfigs.length>1)
    {
      if(rotationConfigs[1]['needconfirmfromPhysician']=="yes" && rotationConfigs[1]['needconfirmfromPhysicianMessage'].trim()=="")
    {
      setErrors({'needconfirmfromPhysicianMessage1':"Please Enter Message For Student"});
      hideLoading();
      return false;
    }
    }
   /* if (
  formdata?.visaLetterBy?.lawyer &&
  (!formdata.visaLetterBy.lawyerF?.fee &&
   !formdata.visaLetterBy.lawyerF?.securityDeposit)
) {
  TooltipsPopovers("Error", "Please enter Lawyer fee or security deposit", "Status");
  hideLoading();
  return;
}

if (
  formdata?.visaLetterBy?.sarthi &&
  (!formdata.visaLetterBy.sarthiF?.fee &&
   !formdata.visaLetterBy.sarthiF?.securityDeposit)
) {
  TooltipsPopovers("Error", "Please enter Sarthi fee or security deposit", "Status");
  hideLoading();
  return;
}*/
if (formdata?.visaLetterBy?.physician) {
  const heads = formdata.visaLetterBy.physicianDetails.letterHeads;

  if (!heads.length) {
    TooltipsPopovers("Error", "Select at least one Physician Letterhead", "Status");
    hideLoading();
    return;
  }

  for (let h of heads) {
    const feeObj = formdata.visaLetterBy.physicianDetails.fees[h];
    //const feeObj = formdata.visaLetterBy.physicianDetails.fees[h];
  	const feeEmpty = feeObj?.fee === null || feeObj?.fee === undefined || feeObj?.fee === "";
  	const secEmpty = feeObj?.securityDeposit === null || feeObj?.securityDeposit === undefined || feeObj?.securityDeposit === "";
    if (feeEmpty && secEmpty) {
      TooltipsPopovers(
        "Error",
        `Enter fee or security deposit for ${h} letterhead`,
        "Status"
      );
      hideLoading();
      return;
    }
  }
}
    try {
      const q = query(collection(db, 'Rotations'), where('location_code', '==', location_code));
      const snapshot = await getDocs(q);
      const DataToSave={
        rotationFeeCollectedBy:formdata.rotationFeeCollectedBy || '',
        rotation_image_url:formdata?.rotation_image_url || '',
        TotalInstallements:formdata?.TotalInstallements || 1,
        hasDiscount:formdata?.hasDiscount ,
        discountType:formdata?.discountType ,
        discountValue:formdata?.discountValue ,
        discountFrom:formdata?.discountFrom ,
        discountTo:formdata?.discountTo ,
        rank:Number(formdata?.rank || 1000),
        fee:formdata?.fee ,
        registration_fee:formdata?.registration_fee,
        availabilityData: rotationConfigs,
        visaLetterBy: {
  physician: formdata.visaLetterBy.physician,
  lawyer: formdata.visaLetterBy.lawyer,
  sarthi: formdata.visaLetterBy.sarthi,

  physicianDetails: formdata.visaLetterBy.physician
    ? formdata.visaLetterBy.physicianDetails
    : null,

  lawyerF: formdata.visaLetterBy.lawyer
    ? formdata.visaLetterBy.lawyerF
    : null,

  sarthiF: formdata.visaLetterBy.sarthi
    ? formdata.visaLetterBy.sarthiF
    : null,
}
        };
        
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
       const res=await updateDoc(docRef, DataToSave);
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
            Rotation Configuration<font color="blue">({location_code})</font> #{index + 1}
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
                    views={['day']}
                    onChange={(event) => handleDateChange(index, 'customDates', event)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {config.customDates.map((date) => (
                    <Chip
                      key={date}
                      label={dayjs(date).format("DD")}
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
                    onViewChange={(view) => setPickerView(view)}
                    //onChange={(event) => handleDateChange(index, 'repeatsequencecustomMonths', event)}
                    onChange={(event,view) => {
                    if(pickerView=="year"){
                    setSelectedYear(dayjs(event).year())}
                    }}
      // only act when user accepts the selection (month + year)

      onAccept={(event) => {
      handleDateChange(index, 'repeatsequencecustomMonths', event)
      }}
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


            <Grid item xs={12} sm={6}>
                <InputLabel>Confirmation Message</InputLabel>
                <CFormTextarea
                  rows={2}
                  value={config.needconfirmfromPhysicianMessage}
                  onChange={(e) => handleChange(index, 'needconfirmfromPhysicianMessage', e.target.value)}
                  placeholder="Type your message"
                />
                {errors[`needconfirmfromPhysicianMessage${index}`]  && <span className="validationerror">{errors[`needconfirmfromPhysicianMessage${index}`] }</span>}
              </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
<Tooltip title="Remove This Configuration">
          <IconButton
  color="error"
  sx={{ mt: 2 }}
  onClick={() => removeSection(index)}
>
  <DeleteIcon />
</IconButton>
</Tooltip>
  </Box>
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end">
  <Tooltip title="Add More Configurations">
    <IconButton
      color="primary"
      size="small"
      onClick={addNewSection}
      sx={{
        mt: 1,
        border: "1px dashed",
        borderRadius: 2,
      }}
    >
      <AddCircleOutlineIcon fontSize="small" />
    </IconButton>
  </Tooltip>
</Box>
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
          <Grid item xs={12} sm={6}>
      <InputLabel>Registration Fee/ Application Fee</InputLabel>
      <TextField
        type="number"
        fullWidth
        value={formdata.registration_fee}
        onChange={(event) => onchangeForm(event, "registration_fee")}
      />
    </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>Maximum Number Of Installements</InputLabel>
            <Select
              fullWidth
              value={formdata?.TotalInstallements || ''}
              onChange={(event) => onchangeForm(event, 'TotalInstallements')}
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
              <MenuItem value="5">5</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>Rotation View Order Number</InputLabel>
            <TextField
        type="number"
        fullWidth
        value={formdata.rank}
        onChange={(event) => onchangeForm(event, "rank")}
      />
          </Grid>
         
          <Grid item xs={12} sm={6}>
      <InputLabel>Rotation Fee</InputLabel>
      <TextField
        type="number"
        fullWidth
        value={formdata.fee}
        onChange={(event) => onchangeForm(event, "fee")}
      />
    </Grid>
          {/* ------------- DISCOUNT SECTION ----------------- */}
<Grid item xs={12} sm={6}>
  <InputLabel>Add Discount?</InputLabel>
  <Select
    fullWidth
    value={formdata.hasDiscount}
    onChange={(event) => onchangeForm(event, "hasDiscount" )}
  >
    <MenuItem value="no">No</MenuItem>
    <MenuItem value="yes">Yes</MenuItem>
  </Select>
</Grid>

{formdata.hasDiscount === "yes" && (
  <>
    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Type</InputLabel>
      <Select
        fullWidth
        value={formdata.discountType}
        onChange={(event) => onchangeForm(event, "discountType" )}
      >
        <MenuItem value="amount">Amount</MenuItem>
        <MenuItem value="percentage">Percentage</MenuItem>
      </Select>
    </Grid>

    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Value</InputLabel>
      <TextField
        type="number"
        fullWidth
        value={formdata.discountValue}
        onChange={(event) => onchangeForm(event, "discountValue")}
      />
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount From</InputLabel>
        <DatePicker
          value={formdata.discountFrom ? dayjs(formdata.discountFrom.toDate?.() || formdata.discountFrom) : null}
          onChange={(event) => onchangeForm(event, "discountFrom")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount To</InputLabel>
        <DatePicker
          value={formdata.discountTo ? dayjs(formdata.discountTo.toDate?.() || formdata.discountTo) : null}
          onChange={(event) => onchangeForm(event, "discountTo")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
    </Grid>
  </>
)}
<Grid item xs={12}>
  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
    Visa Letter By
  </Typography>

  <Box display="flex" gap={3} flexWrap="wrap">

    <Box display="flex" alignItems="center" gap={1}>
      <input
        type="checkbox"
        checked={formdata?.visaLetterBy?.physician || false}
        onChange={() => handleVisaLetterChange("physician")}
      />
      <Typography>Physician Letter</Typography>
    </Box>

    <Box display="flex" alignItems="center" gap={1}>
      <input
        type="checkbox"
        checked={formdata?.visaLetterBy?.lawyer || false}
        onChange={() => handleVisaLetterChange("lawyer")}
      />
      <Typography>US Lawyer Letter</Typography>
    </Box>

    <Box display="flex" alignItems="center" gap={1}>
      <input
        type="checkbox"
        checked={formdata?.visaLetterBy?.sarthi || false}
        onChange={() => handleVisaLetterChange("sarthi")}
      />
      <Typography>Sarthi Letter</Typography>
    </Box>

  </Box>
</Grid>
{formdata?.visaLetterBy?.physician && (
  <Grid item xs={12}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
      Physician Visa Letter – Letterhead
    </Typography>

    {/* MULTI SELECT LETTERHEAD */}
    <Select
      fullWidth
      multiple
      value={formdata.visaLetterBy?.physicianDetails?.letterHeads || []}
      onChange={handlePhysicianLetterHeadChange}
      renderValue={(selected) =>
        selected.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")
      }
    >
      <MenuItem value="clinic">Clinic Letterhead</MenuItem>
      <MenuItem value="hospital">Hospital Letterhead</MenuItem>
      <MenuItem value="university">University Letterhead</MenuItem>
    </Select>

    {/* FEES PER LETTERHEAD */}
    <Box mt={2}>
      {(formdata.visaLetterBy?.physicianDetails?.letterHeads || []) .map((type) => (
        <Box key={type} mb={3} p={2} border="1px solid #ddd" borderRadius={2}>
          <Typography fontWeight={600}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Letterhead
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <InputLabel>Fee</InputLabel>
              <TextField
                type="number"
                fullWidth
                value={formdata.visaLetterBy.physicianDetails?.fees[type]?.fee || 0}
                onChange={(e) =>
                  handlePhysicianFeeChange(type, "fee", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel>Security Deposit</InputLabel>
              <TextField
                type="number"
                fullWidth
                value={
                  formdata.visaLetterBy.physicianDetails.fees[type]?.securityDeposit || 0
                }
                onChange={(e) =>
                  handlePhysicianFeeChange(type, "securityDeposit", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>Notes</InputLabel>
              <TextField
                type="text"
                fullWidth
                value={
                  formdata.visaLetterBy.physicianDetails.fees[type]?.notes || ""
                }
                onChange={(e) =>
                  handlePhysicianFeeChange(type, "notes", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  </Grid>
)}
{formdata?.visaLetterBy?.lawyer && (
  <Grid item xs={12} sm={6}>
    <Typography fontWeight={600}>US Lawyer Visa Letter</Typography>

    <InputLabel>Fee</InputLabel>
    <TextField
      type="number"
      fullWidth
      value={formdata.visaLetterBy.lawyerF?.fee}
      onChange={(e) =>
        setformdata(prev => ({
          ...prev,
          visaLetterBy: {
            ...prev.visaLetterBy,
            lawyerF: {
              ...prev.visaLetterBy.lawyerF,
              fee: Number(e.target.value),
            },
          },
        }))
      }
    />

    <InputLabel>Security Deposit</InputLabel>
    <TextField
      type="number"
      fullWidth
      value={formdata.visaLetterBy.lawyerF?.securityDeposit}
      onChange={(e) =>
        setformdata(prev => ({
          ...prev,
          visaLetterBy: {
            ...prev.visaLetterBy,
            lawyerF: {
              ...prev.visaLetterBy.lawyerF,
              securityDeposit: Number(e.target.value),
            },
          },
        }))
      }
    />
  </Grid>
)}
{formdata?.visaLetterBy?.sarthi && (
  <Grid item xs={12} sm={6}>
    <Typography fontWeight={600}>Sarthi Visa Letter</Typography>

    <InputLabel>Fee</InputLabel>
    <TextField
      type="number"
      fullWidth
      value={formdata.visaLetterBy.sarthiF?.fee}
      onChange={(e) =>
        setformdata(prev => ({
          ...prev,
          visaLetterBy: {
            ...prev.visaLetterBy,
            sarthiF: {
              ...prev.visaLetterBy.sarthiF,
              fee: Number(e.target.value),
            },
          },
        }))
      }
    />

    <InputLabel>Security Deposit</InputLabel>
    <TextField
      type="number"
      fullWidth
      value={formdata.visaLetterBy.sarthiF?.securityDeposit}
      onChange={(e) =>
        setformdata(prev => ({
          ...prev,
          visaLetterBy: {
            ...prev.visaLetterBy,
            sarthiF: {
              ...prev.visaLetterBy.sarthiF,
              securityDeposit: Number(e.target.value),
            },
          },
        }))
      }
    />
  </Grid>
)}
        </Grid>
        

        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="button"
          onClick={() => handleSubmit()}
          sx={{ mt: 4, py: 1.2, fontWeight: 600 }}
        >
          Save Changes
        </Button>

    </Box>
  );
}
