import React, { useEffect, useState } from 'react';
import { countryData } from "../../apis/countryData";
import { Link,useParams } from 'react-router-dom';
import Select from 'react-select';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import axios from 'axios';
//const admin = require('firebase-admin');
import {
  TextField,
  Grid,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const SameAsPhoneList=[{value:"",label:"Select Value"},{value:"no",label:"No"},{value:"yes",label:"Yes"}];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));

let Newway=false;
const UserDetails = () => {
	const { showLoading, hideLoading, API_KEY,SelectWithWhereAnd,copyCollection,updateOrAddFieldInCollection,DatabaseName,getMaxStudentUniqueId,handleUpdate, FetchDataFromCollection,Timestamp } = useLoading();
	const [errors, setErrors] = useState({});
	const { id } = useParams();
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [open, setOpen] = useState(false);
	const [DoctorData, setDoctorData] = useState({});
	const [RotationList, setRotationList] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
   	//updateOrAddFieldInCollection("Rotations","StudentUniqueId","")
    //copyCollection("Rotations","RotationsBK");
    showLoading()
    const userDataSelected = await FetchDataFromCollection("RotationDoctors", 20, "id", "==", id, 0);
      	console.log("userDataSelected--->",userDataSelected)
      	let AlllocationCodes=[];
      	if(userDataSelected.length)
      	{
      		const doctor = userDataSelected[0];
      		
      		if (doctor?.DoctorInfo?.locationCodes) 
      		{
    			AlllocationCodes = Object.keys(doctor?.DoctorInfo?.locationCodes || {}).reduce((acc, key) => 
    			{
      				acc.push({ location_code: doctor.DoctorInfo.locationCodes[key] });
      				return acc;
    			}, []); 
  			}






  setDoctorData({
    ...doctor.DoctorInfo,  // extract the fields inside DoctorInfo
    representingEmail: doctor.representingEmail,
    locationCode:AlllocationCodes,
  });
      		//setDoctorData(userDataSelected[0])
      	}
	let WhereOrObject=[{"name":"DoctorAssigned","condition":"==","value":"no"}];
    const results = await SelectWithWhereAnd("Rotations", WhereOrObject);	
    console.log("results----->",results)
   		if(results.status=="success")
    	{
    		 console.log("results.data----->",results.data)
    		setRotationList(results.data)
    	}
    	hideLoading();
    };

    fetchUserData();
  }, []);
   const handleChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    console.log('Selected country:', selectedOption);
  };
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
	const generateRandomPassword = (length = 12) =>
	{
  		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  		let password = '';
  		for (let i = 0; i < length; i++)
  		{
    		const randomIndex = Math.floor(Math.random() * chars.length);
    		password += chars[randomIndex];
  		}
  		return password;
	};
	const generateDocumentIdFromEmail = (email) => {
  // Replace special characters with hyphen before encoding
  const sanitizedEmail = email.replace(/@/g, '-at-').replace(/\./g, '-dot-');
  // Return the Base64 encoded string
  return btoa(sanitizedEmail);
};
	const handleChangeDoctorDetails = async (event, name = "", loop = -1, paymentIndex = -1) => {
  let value;

  if (Array.isArray(event)) {
    // For multi-select: save array of selected values
    value = event;
  } else if (typeof event.target !== "undefined") {
    value = event.target.value;
  } else if (typeof event.$d !== "undefined") {
    value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
  } else if (typeof event.label !== "undefined") {
    value = event;
  } else {
    value = event.label;
  }

  console.log("event====>", event)
  console.log("value====>", value)

  setDoctorData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
}
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    var dataTobesend={};
    if (Object.keys(validationErrors).length === 0) {
    	 showLoading()
    	 	let adminContact=DoctorData.contact.toLowerCase();
      		let representingEmail=DoctorData.representingEmail.toLowerCase();
      		let locationcodeObject={};
      	
      		let dataTobesend = {
  DoctorInfo: {
    adminName: DoctorData.adminName,
    contact: adminContact,
    doctorName: DoctorData.doctorName,
    representingName: DoctorData.representingName,
    locationCode: locationcodeObject || [],
  },
  representingEmail: DoctorData.representingEmail.toLowerCase(),
  updatedAt: Timestamp.fromDate(new Date())
};

    	try {
      		const UserServicesSelectedUn = await FetchDataFromCollection("RotationDoctors", 20, "representingEmail", "==", representingEmail, 0);
      		if(UserServicesSelectedUn.length<=0)
      		{
      			console.log("dataTobesend----->",dataTobesend)
      			for (const item of (DoctorData.locationCode || [])) 
      			{
      				locationcodeObject[item.location_code] = item.location_code;
      				const CheckRotation = await FetchDataFromCollection("Rotations", 20, "location_code", "==", item.location_code, 0);
      				if (CheckRotation.length) 
      				{
        				const CheckRotationid = CheckRotation[0].id;
        				const RotationUpdateData = {
          						"DoctorAssigned": "yes",
          						"DoctorDetails": {
            								id: id,
            								representingEmail: representingEmail
          							}
        						};
        					console.log("CheckRotation---->",CheckRotation)
        				await handleUpdate("Rotations", CheckRotationid, RotationUpdateData);
      				}
    			}
    			dataTobesend['DoctorInfo']['locationCodes']=locationcodeObject;
      			handleUpdate("RotationDoctors",id,dataTobesend).then((result) => {
      			console.log("result======>",result)
      			setOperationStatus("Success")
      			
     			setOperationMessage("Doctor Successfully Added.");
     			setOpen(true);
      			hideLoading();
      			})
      		}
			else
			{
				console.log("dataTobesend----->",dataTobesend)
				console.log("UserServicesSelectedUn----->",UserServicesSelectedUn)
				if(UserServicesSelectedUn[0].id!==id)
				{
					hideLoading();
    				setOperationStatus("Error")
     				setOperationMessage("Email Already Exists.");
     				setOpen(true);
				}
				else
				{
					for (const item of (DoctorData.locationCode || [])) 
      			{
      				locationcodeObject[item.location_code] = item.location_code;
      				const CheckRotation = await FetchDataFromCollection("Rotations", 20, "location_code", "==", item.location_code, 0);
      				if (CheckRotation.length) 
      				{
        				const CheckRotationid = CheckRotation[0].id;
        				const RotationUpdateData = {
          						"DoctorAssigned": "yes",
          						"DoctorDetails": {
            								id: id,
            								representingEmail: representingEmail
          							}
        						};
        					console.log("CheckRotation---->",CheckRotation)
        				await handleUpdate("Rotations", CheckRotationid, RotationUpdateData);
      				}
    			}
    			dataTobesend['DoctorInfo']['locationCodes']=locationcodeObject;
					handleUpdate("RotationDoctors",id,dataTobesend).then((result) => {
      			setOperationStatus("Success")
      			
     			setOperationMessage("Doctor Successfully Added.");
     			setOpen(true);
      			hideLoading();
      			})
				}
				
			}




    } catch (error) {
      setErrors({'errormessage':error.message});
      console.log("error====>",error)
		setOperationStatus( "error")
		setOperationMessage(error.message)

      console.error("Error signing up", error.response.data.status);
      setOpen(true);
      hideLoading();
    }
    }
	}
	const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, selectedCountry.value);
      return parsedNumber && parsedNumber.isValid();

    } catch (e) {
      return false;
    }
  };
	const validate = () => {
    const errors = {};
    if(!DoctorData.adminName)
    {
    	errors.adminName="Please Enter Admin Name.";
    }
    if(!DoctorData.contact)
    {
    	errors.contact="Please Enter Admin Contacts.";
    }
    if(!DoctorData.doctorName)
    {
    	errors.doctorName="Please Enter Doctor Name.";
    }
    if(!DoctorData.representingName)
    {
    	errors.representingName="Please Enter Representing Name.";
    }
    if(!DoctorData.representingEmail)
    {
    	errors.representingEmail="Please Enter Representing Email.";
    }
    else if(!validateEmail(DoctorData.representingEmail))
    {
    	errors.representingEmail="Please Enter Valid Email.";
    }
    return errors;
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <Typography class="margin0auto" variant="h6">Create Doctor Profile</Typography>
        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
              <div class="InputLabel">Admin Name</div>
                  <TextField
                    label=""
                    variant="outlined"
                    fullWidth
                    value={DoctorData?.adminName}
                    required
                    onChange={(event) => handleChangeDoctorDetails(event,'adminName')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.adminName  && <span class="validationerror">{errors.adminName }</span>}
                </Grid>
                <Grid item xs={6}>
              	<div class="InputLabel">Admin Contact (comma separate In case of multiple)</div>
                  <TextField
                    label=""
                    variant="outlined"
                    fullWidth
                    value={DoctorData?.contact}
                    required
                    onChange={(event) => handleChangeDoctorDetails(event,'contact')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.contact  && <span class="validationerror">{errors.contact}</span>}
                </Grid>
              <Grid item xs={6}>
              	<div class="InputLabel">Doctor Name</div>
                  <TextField
                    label=""
                    variant="outlined"
                    fullWidth
                    value={DoctorData?.doctorName}
                    required
                    onChange={(event) => handleChangeDoctorDetails(event,'doctorName')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.doctorName  && <span class="validationerror">{errors.doctorName}</span>}
                </Grid>

                <Grid item xs={6}>
              	<div class="InputLabel">Representing Name</div>
                  <TextField
                    
                    variant="outlined"
                    fullWidth
                    value={DoctorData?.representingName}
                    required
                    onChange={(event) => handleChangeDoctorDetails(event,'representingName')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.representingName  && <span class="validationerror">{errors.representingName}</span>}
                </Grid>
                <Grid item xs={6}>
              	<div class="InputLabel">Representing Email</div>
                  <TextField
                    label=""
                    variant="outlined"
                    fullWidth
                    value={DoctorData.representingEmail}
                    required
                    onChange={(event) => handleChangeDoctorDetails(event,'representingEmail')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.representingEmail  && <span class="validationerror">{errors.representingEmail}</span>}
                </Grid>
                 <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Location code</div>
                <Select
                value={DoctorData?.locationCode}
        variant="outlined"
        options={RotationList}
        placeholder="Admin In Touch"
        getOptionLabel={(e) => e.location_code} // ✅ bind label
      	getOptionValue={(e) => e.location_code} // ✅ bind value
        onChange={(event) => handleChangeDoctorDetails(event,'locationCode')}
        isSearchable
        isMulti
      />
      	{errors?.locationCode  && <span className="validationerror">{errors?.locationCode }</span>}
                </div>
               </Grid>
              {/*  <Grid item xs={2}>
                <div class="InputLabel">Select Country Code</div>
                <Select
        value={selectedCountryWhatApp}
        onChange={(event) => handleChangeStudentDetails(event,'StudentWhatsappCountry')}
        options={allCountries}
        placeholder="Country Code"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.StudentWhatsappCountry  && <span class="validationerror">{errors.StudentWhatsappCountry }</span>}
              	</Grid>*/}
                </Grid>

          <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}
            >
              Add
            </Button>
            </Grid>

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
