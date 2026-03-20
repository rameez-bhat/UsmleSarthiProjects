import React, { useEffect, useState } from 'react';
import Select1 from 'react-select';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
//const admin = require('firebase-admin');
import {
  TextField,
  Grid,
  Box,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles'; 
import  '../../components/css/style.css'; 
const PaymentOptionsList= [{
  label:'Stripe',
  value:'Stripe'
  },
  {
  label:'Zelle',
  value:'Zelle'
  },
  {
  label:'Wire',
  value:'Wire'
  },
  {
  label:'Transfer',
  value:'Transfer'
  },
  {
  label:'Cheque',
  value:'Cheque'
  },
  ];

const UserDetails = () => {
  	const { did } = useParams();
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const { showLoading, hideLoading, API_KEY,DatabaseName,Timestamp,handleUpdate, FetchDataFromCollection } = useLoading();
	const [OperationStatus, setOperationStatus] = useState('');
	const [CurrentViewData, setCurrentViewData] = useState({});
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [userData,setuserData] = useState(null);
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	
  useEffect(() => {

    fetchUserData();
  }, [did]);
   useEffect(() => {
	setCurrentViewData(CurrentViewData)
	 
  }, [CurrentViewData]);
  const fetchUserData = async () => {
    try {
    setInitialData({
          ModeOfPayment:  {},
          Amount: '',
          PaymentDate: {}
        });
      console.log("Fetching user data for ID:", did);
      const doctorSelected = await FetchDataFromCollection("RotationDoctors", 10, "__name__", "==", did, null);
      //const Payments = await FetchDataFromCollection("RotationDoctors", 10, "DoctorInfo.Payments.PaymentDate", ">=", timestamp, did);
      //console.log("timestamp--->",timestamp)
    //console.log("Payments--->",Payments)
      if(doctorSelected.length>0)
      {
      	if(doctorSelected[0]?.DoctorInfo?.Payments?.length>0)
      	{
      		setAllPaymentData(doctorSelected[0]?.DoctorInfo?.Payments);
      	}
      }
      console.log("AllPaymentData--->",AllPaymentData)
      // Ensure that we have data before setting it
      if (doctorSelected && doctorSelected.length > 0) {
        setuserData(doctorSelected[0]);
        console.log("Fetched doctor data:", doctorSelected[0]);
      } else {
        console.log("No data found for the provided ID.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange = async (event,name) => 
  {
  	console.log("CurrentViewData====>",CurrentViewData)
  	console.log("event====>",event)
  	let value;
  	if(event==null)
  	{
  		setCurrentViewData((prevValues) => {
  		const newValues = { ...prevValues };
  		if (name in newValues) 
  		{
    		delete newValues[name]; // Remove the property with the specified key
  		}

  		return newValues;
		});
		return;
  	}
  	else if (event.target) 
  	{
  		value = event.target.value;
	} 
	else if (event.$d) 
	{
  		value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  		value = Timestamp.fromDate(new Date(value))
	} 
	else if (event.label) 
	{
  		value = event;
	} 
	else 
	{
  		value = event;  // Consider reviewing if `event.label` is the intended fallback
	}
	checkForChanges(name, value);
	setCurrentViewData((prevValues) => ({
  ...prevValues,
  [name]: value,
}));
	console.log("CurrentViewData===>",CurrentViewData)
  }
	const handleCancel = () => {
    setOpen(false);
  };



	const showLoader = () => {
   let elements =document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('hidden'); // Example manipulation
    }
  };

  const hideLoader = () => {
     let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden'); // Example manipulation
    }
  };
	const handleAddDoctorPayment= async (event)=>{
		 const validationErrors = validate();
		 console.log("validationErrors--->",validationErrors)
    	setErrors(validationErrors);
    	if (Object.keys(validationErrors).length === 0) 
    	{
    	 	showLoader();
    	 	const FullArray=AllPaymentData;
    	 	FullArray.push(CurrentViewData);
    	 	handleUpdate("RotationDoctors",did,{"DoctorInfo":{"Payments":FullArray}}).then((result) => 
    	 	{
    	 		hideLoader();
     		setOperationStatus( result.status)
     		setOperationMessage(result.message);
     		setOpen(true);
    	 	})
    	 	
		}
}

	const validate = () => {
    const errors = {};
  console.log("CurrentViewData--->",CurrentViewData)
  if(typeof CurrentViewData['Amount']==="undefined" || CurrentViewData['Amount']==="")
  {
  	errors.Amount="Please Enter Payment Amount.";
  }
  if(typeof CurrentViewData['PaymentDate']==="undefined" || typeof CurrentViewData['PaymentDate']!=="object")
  {
  	errors.PaymentDate="Please Select Date Of Payment.";
  }
  if(typeof CurrentViewData['ModeOfPayment']==="undefined" || typeof CurrentViewData['ModeOfPayment']!=="object")
  {
  	errors.ModeOfPayment="Please Select Mode Of Payment.";
  }
   return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <div style={{
                  width: '45%',
                  margin: '0 auto',
				fontSize: '22px',
				fontWeight: 'bolder'
                }}>Add Doctors Payments For Roations</div>
     	 	<Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Email:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingEmail}</Typography>
                </Box>
              </Grid>
               <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin adminName:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Contact:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.contact}</Typography>
                </Box>
              </Grid>
            </Grid>  
<Grid container spacing={2} sx={{ p: 1 }}>                                                                                                                                                                                                                                                                                                                                           
<Grid item xs={6}>
                <div class="InputLabel" >Mode Of Payment</div>
                <Select1
        value={CurrentViewData?.['ModeOfPayment']}
        onChange={(event) => handleChange(event,'ModeOfPayment' )}
        variant="outlined"
        placeholder="Mode Of Payment"
        label="Mode Of Payment"
        options={PaymentOptionsList}
        isSearchable
      	/>
      	 {errors.ModeOfPayment  && <span class="validationerror">{errors.ModeOfPayment }</span>}
       </Grid>
       <Grid item xs={6} >
                <div class="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
       defaultValue={CurrentViewData['PaymentDate']?dayjs(CurrentViewData['PaymentDate'].toDate().toLocaleString()):null}
       onChange={(event) => handleChange(event,'PaymentDate')}
        dateFormat="dd/mm/yyyy" 
        scrollableYearDropdown 
         yearDropdownItemNumber={50}
         picker="date" 
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate && <span class="validationerror">{errors.PaymentDate}</span>}
              </Grid>
              <Grid item xs={6}>
              <div class="InputLabel"></div>
                  <TextField
                    label="Amount"
                    variant="outlined"
                    fullWidth
                    defaultValue={CurrentViewData?.['Amount']}
                    required
                    onChange={(event) => handleChange(event,'Amount' )}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Amount  && <span class="validationerror">{errors.Amount }</span>}
                </Grid>
         </Grid>   
 
                
          <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddDoctorPayment}
              disabled={!isFormChanged}
            >
              Add
            </Button>
            </Grid>
            <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Amount</TableCell>
        <TableCell>Mode Of Payment</TableCell>
        <TableCell>Payment Date</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {AllPaymentData.length > 0 ? (
        AllPaymentData.map((value, index) => (
          <TableRow key={index}>
            <TableCell>{value.Amount}</TableCell>
            <TableCell>{value.ModeOfPayment.label}</TableCell>
            <TableCell>{dayjs(value.PaymentDate.toDate()).format('ddd, DD MMM YYYY')}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold' }}>
            No data found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>

         <Dialog
        open={open}
        onClose={handleCancel}
      >
        <DialogTitle>Operation Status: {OperationStatus}</DialogTitle>
        <DialogContent>
          <DialogContentText>
           <span dangerouslySetInnerHTML={{ __html: OperationMessage }} />
          
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
