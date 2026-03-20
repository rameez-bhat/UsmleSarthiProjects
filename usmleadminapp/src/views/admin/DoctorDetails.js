import React, { useEffect, useState, useRef } from 'react';
import { Link,useParams } from 'react-router-dom';
import { DatePicker} from "antd";
import Select1 from 'react-select';
import dayjs from 'dayjs';
import _ from 'lodash';
import { KeyboardArrowDown } from '@mui/icons-material';
import {
  Typography,
  CircularProgress,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  Select,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,IconButton
} from '@mui/material';
let ActualUser;
import { useLoading } from '../../layout/LoadingContext';
import { ColoredTabs, ColoredTab, CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';

const DateFormatForAll="MM/DD/YYYY";

 	let AdminOptionsList=[];
 	let Newway=false;
 	let indexLetter=0;
 	let NotesIndexMain=0
const UserDetails = (LoginInUserMain) => {

ActualUser=LoginInUserMain.ActualUser;
 const { deleteFieldFromDocumentWhere,showLoading,TooltipsPopovers,deleteDuplicateNotes,SelectWithComplexConditionsJoin,deleteFieldFromDocument, hideLoading, API_KEY,deletedocumentfromid,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,FetchDataFromCollection,handleUpdateEx,FetchUniqueData,FetchUniqueDataFull,fetchAdminDataWithJoin,Timestamp,handleUpdate } = useLoading();

  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [DoctorData, setDoctorData] = useState({});
  	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	useEffect(() => {
	fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
      showLoading();

      try {
      	const userDataSelected = await FetchDataFromCollection("RotationDoctors", 20, "id", "==", id, 0);
      	console.log("userDataSelected--->",userDataSelected)
      	if(userDataSelected.length)
      	{
      		setDoctorData(userDataSelected[0])
      	}
		hideLoading();
      } 
      catch (error) 
      {
        console.error('Error fetching user data:', error);
        hideLoading()
      }
    };
	const handleCancel = () => {
    setOpen(false);
  };
  const handleDeleteLocationCode = async (locationCodeKey) => {
  if (!DoctorData?.id) {
    console.error('No doctor ID available');
    return;
  }

  const confirmDelete = window.confirm(`Are you sure you want to delete location code "${locationCodeKey}"?`);
  if (!confirmDelete) return;

  showLoading();
  try {
    await deleteFieldFromDocument("RotationDoctors", DoctorData.id, `DoctorInfo.locationCodes.${locationCodeKey}`);
   await deleteFieldFromDocumentWhere("Rotations","location_code","==",locationCodeKey,"DoctorDetails","DoctorAssigned","no")
    setDoctorData((prevData) => {
      const updatedLocationCodes = { ...prevData.DoctorInfo.locationCodes };
      delete updatedLocationCodes[locationCodeKey];
      return {
        ...prevData,
        DoctorInfo: {
          ...prevData.DoctorInfo,
          locationCodes: updatedLocationCodes,
        },
      };
    });
    setOperationMessage(`Deleted location code ${locationCodeKey} successfully.`);
    setOperationStatus('success');
    setOpen(true);
  } catch (error) {
    console.error('Error deleting location code:', error);
    setOperationMessage('Failed to delete location code.');
    setOperationStatus('error');
    setOpen(true);
  }
  hideLoading();
};
  return (
    <CenteredBox>


      <CenteredBoxInfo>
        <Box sx={{ width: '100%', p: 3 }}>

         <Grid container spacing={2} sx={{ p: 1 }}>
         <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        <Typography className="margin0auto" variant="h6" >Doctor Profile</Typography>
         </Box>
        </Grid>

        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{DoctorData?.DoctorInfo?.adminName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Contact:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{DoctorData?.DoctorInfo?.contact}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Doctor Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}> {DoctorData?.DoctorInfo?.doctorName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{DoctorData?.DoctorInfo?.representingName}</Typography>
                </Box>
              </Grid>
               <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Email:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{DoctorData?.representingEmail}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Year Of Graduation:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{DoctorData?.['createdAt'] ? typeof DoctorData?.GraduationDate==="string"?dayjs(DoctorData['createdAt']).format("YYYY"):dayjs(new Date(DoctorData['createdAt']?.seconds*1000)).format("YYYY") : null}</Typography>
                </Box>
                </Grid>
               {DoctorData?.DoctorInfo?.locationCodes && (
  <>
    {Object.entries(DoctorData.DoctorInfo.locationCodes).map(([LocationCodeIndex, LocationCodeObject], indexL) => (
      <Grid item xs={6} key={LocationCodeIndex}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, backgroundColor: '#f0f0f0', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Location Code {indexL + 1}:
            </Typography>
            <Typography variant="body2">{LocationCodeIndex}</Typography>
          </Box>

          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteLocationCode(LocationCodeIndex)}
          >
            🗑️
          </IconButton>
        </Box>
      </Grid>
    ))}
  </>
)}
                </Grid>
                 
               <div className="margin0autoonly">
           <Grid item xs={12} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                 <Link to={'/admin/doctorupdate/'+id}> <Button
              variant="contained"
              color="success"
              className="MarginoAuto"
            >
              Update Profile
            </Button>
            </Link>
                </Box>
                </Grid>
            </div>

          
        </Box>
         <Box sx={{ width: '100%', p: 3 }}>

         <Grid container spacing={2} sx={{ p: 1 }}>
         <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        <Typography className="margin0auto" variant="h6" >Doctor Payments</Typography>
         </Box>
        </Grid>
        <Grid container spacing={2} sx={{ p: 1 }}>
 {DoctorData?.DoctorInfo?.Payments && (
  <>
    {Object.entries(DoctorData.DoctorInfo.Payments).map(([PaymentDetailsIndex, PaymentDetailsObject], indexL) => (
       <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{JSON.stringify(PaymentDetailsObject)}</Typography>
                </Box>
              </Grid>
    ))}
  </>
)}
</Grid>
 </Box>
         <Dialog
        open={open}
        onClose={handleCancel}

      >
        <DialogTitle>Operation Status</DialogTitle>
        <DialogContent>
          <DialogContentText>

           {OperationMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Ok
          </Button>

        </DialogActions>
      </Dialog>

      
      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
