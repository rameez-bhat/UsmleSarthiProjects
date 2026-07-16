import React, { useEffect, useState } from 'react';
import { countryData } from "../../apis/countryData";
import Select from 'react-select';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
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
const UserTypeList = [
  { value: "", label: "Select User Type" },
  { value: "Admin", label: "Admin" },
  { value: "Default", label: "Default" },
  { value: "Silver", label: "Silver" },
  { value: "Mentor", label: "Mentor" },
  { value: "Journalist", label: "Journalist" }
];
 /* <Button
    variant="outlined"
    color="warning"
    onClick={handleCopyPanelistsToUsers}
  >
    Copy Panelists → Mentor
  </Button>*/
let Newway=false;
const UserDetails = () => {
	const { showLoading, hideLoading, API_KEY,DatabaseName,getMaxStudentUniqueId,handleUpdate, FetchDataFromCollection,Timestamp } = useLoading();
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [StudentName, setStudentName] = useState(null);
	const [StudentEmail, setStudentEmail] = useState(null);
	const [StudentPhone, setStudentPhone] = useState(null);
	const [selectedUserType, setSelectedUserType] = useState({ value: "Default", label: "Default" });
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const [selectedCountry, setSelectedCountry] = useState(null);
	const [selectedCountryWhatApp, setselectedCountryWhatApp] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
    setInitialData({
          StudentName:  '',
          StudentEmail: '',
          StudentPhone: '',
          SameAsWhatsAppNumber: '',
          StudentWhatsappPhone:'',
          StudentWhatsappCountry:''
        });
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
	const handleStudentNameChange=(event)=>{
	setStudentName(event.target.value);
	checkForChanges('StudentName', event.target.value);
	}
	const handleStudentEmailChange=(event)=>{
	setStudentEmail(event.target.value);
	checkForChanges('StudentEmail', event.target.value);
	}
	const handleStudentPhoneChange=(event)=>{
	setStudentPhone(event.target.value);
	checkForChanges('StudentPhone', event.target.value);
	}
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
	const handleChangeStudentDetails = async (event,name="",loop=-1,paymentIndex=-1)=>{
  		let value;
  		if(typeof event.target!="undefined")
  		{
  			value=event.target.value;
  		}
  		else if(typeof event.$d!="undefined")
  		{
  			value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  		}
  		else if(typeof event.label!="undefined")
  		{
  			value=event;
  		}
  		else
  		{
  			value=event.label;
  		}
  		if(name==="StudentWhatsappCountry")
  		{

  			setselectedCountryWhatApp(event);
  		}
  		else
  		{
  			setInitialData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
  		}

      checkForChanges(name, value);
	}
	const handleCopyPanelistsToUsers = async () => {
  const confirmAction = window.confirm(
    "This will copy ALL Panelists and create/update them as Mentor users. Continue?"
  );

  if (!confirmAction) return;

  try {
    showLoading();

    const snapshot = await getDocs(collection(db, "Panelists"));

    if (snapshot.empty) {
      setOperationStatus("Error");
      setOperationMessage("No panelists found.");
      setOpen(true);
      hideLoading();
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const docSnap of snapshot.docs) {
      const panelist = docSnap.data();

      if (!panelist.email) {
        skippedCount++;
        continue;
      }

      const email = panelist.email.toLowerCase();
      const name = panelist.name || "Mentor";
      const password = generateRandomPassword(12);

      try {
        const existingUser = await FetchDataFromCollection(
          "Users",
          1,
          "email",
          "==",
          email,
          0
        );

        const now = Timestamp.fromDate(new Date());

        // ✅ IF USER EXISTS → UPDATE ROLE
        if (existingUser.length > 0) {

          const existingUid = existingUser[0].uid;

          await handleUpdate("UsersRoles", existingUid, {
            uid: existingUid,
            email: email,
            displayName: existingUser[0].displayName || name,
            documentid: existingUid,
            Role: "Mentor",
            updatedAt: now,
          });

          createdCount++;
          continue;
        }

        // ✅ CREATE NEW AUTH USER
        const response = await axios.post(
          "https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/createUser",
          {
            StudentEmail: email,
            password,
            StudentName: name,
          }
        );

        const uid = response.data.data.uid;

        let maxId = await getMaxStudentUniqueId("Users", "StudentUniqueId");
        maxId = Number(maxId) + 1;

        // 🔹 Create Users document
        await handleUpdate("Users", uid, {
          uid,
          email,
          documentid: uid,
          displayName: name,
          StudentUniqueId: maxId,
          createdAt: now,
          updatedAt: now,
          phoneNumber: panelist.phone || "",
        });

        // 🔹 Create UsersRoles document
        await handleUpdate("UsersRoles", uid, {
          uid,
          email,
          documentid: uid,
          displayName: name,
          Role: "Mentor",
          createdAt: now,
          updatedAt: now,
        });

        createdCount++;

      } catch (err) {
        console.log("Error creating:", email, err.message);
        skippedCount++;
      }
    }

    setOperationStatus("Success");
    setOperationMessage(
      `Migration Completed.<br/>
       Processed: ${createdCount}<br/>
       Skipped: ${skippedCount}`
    );
    setOpen(true);

  } catch (error) {
    console.error(error);
    setOperationStatus("Error");
    setOperationMessage(error.message);
    setOpen(true);
  } finally {
    hideLoading();
  }
};
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    var dataTobesend={};
    if (Object.keys(validationErrors).length === 0) {
    	 showLoading()
    	 let StudentEmailNormal=StudentEmail.toLowerCase();
      		let StudentNameNormal=StudentName.toLowerCase();
      		let password=generateRandomPassword(12);
    	try {
      		const documentIdGen = generateDocumentIdFromEmail(StudentEmailNormal);
      		const UserServicesSelectedUn = await FetchDataFromCollection("UnknownPayments", 20, "__name__", "==", documentIdGen, 0);
      		if(UserServicesSelectedUn.length<=0)
      		{
      			const response = await axios.post('https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/createUser', { StudentEmail:StudentEmailNormal, password, StudentName:StudentNameNormal });
      			let MaxStudentUniqueId=await getMaxStudentUniqueId("Users","StudentUniqueId");
      			console.log("MaxStudentUniqueId--->",MaxStudentUniqueId)
      			MaxStudentUniqueId=Number(MaxStudentUniqueId);
      			MaxStudentUniqueId=MaxStudentUniqueId+1;
      			dataTobesend['uid']=response.data.data.uid;
      			dataTobesend['email']=StudentEmailNormal;
      			dataTobesend['displayName']=StudentNameNormal;
      			dataTobesend['StudentUniqueId']=MaxStudentUniqueId;
      			
      			//dataTobesend['createdAt']=new Date().toISOString();
    			//dataTobesend['updatedAt']=new Date().toISOString();
    			dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    			dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
      			dataTobesend['PhoneCountry']={};
      			dataTobesend['PhoneCountry']=selectedCountry;
      			dataTobesend['phoneNumber']=StudentPhone;
      			dataTobesend['SameAsWhatsAppNumber']=initialData['SameAsWhatsAppNumber'];
      			if(initialData['SameAsWhatsAppNumber']==="yes")
      			{
      				dataTobesend['WhatsappCountry']={};
      				dataTobesend['WhatsappCountry']=selectedCountry;
      				dataTobesend['WhatsappNumber']=StudentPhone;
      			}
      			else
      			{
      				dataTobesend['WhatsappCountry']={};
      				dataTobesend['WhatsappCountry']=selectedCountryWhatApp;
      				dataTobesend['WhatsappNumber']=initialData.StudentWhatsappPhone;
      			}
      			const responseSend = await axios.post('https://addleadfromothersource-jwpx2jwsca-uc.a.run.app', { StudentEmail:StudentEmailNormal, password, StudentName:StudentNameNormal, phonecountrycode:selectedCountry, phone:StudentPhone });
				handleUpdate("Users",response.data.data.uid,dataTobesend).then((result) => {
     			dataTobesend={};
     			//dataTobesend['Role']="Default";
     			dataTobesend['Role'] = selectedUserType.value;
     			dataTobesend['email']=StudentEmailNormal;
     			dataTobesend['StudentUniqueId']=MaxStudentUniqueId;
      			dataTobesend['displayName']=StudentNameNormal;
      			dataTobesend['uid']=response.data.data.uid;
      			//dataTobesend['createdAt']=new Date().toISOString();
    			//dataTobesend['updatedAt']=new Date().toISOString();
    			dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    			dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
     			handleUpdate("UsersRoles",response.data.data.uid,dataTobesend).then((result) => {
     			hideLoading();

     			setOperationStatus( response.data.status)
     			//setOperationMessage(result.message);
     			setOperationMessage(result.message+"<a style='color:blue' href='/admin/userdetails/"+response.data.data.uid+"' >Click Here</a>");
     			setOpen(true);
				console.log("response=====>",response.data.data.uid)
				});
     	});
			}
			else
			{
				hideLoading();
    			setOperationStatus("Error")
     			setOperationMessage("Email Already Exists In Unknown Payments On This Email <a target='_blank' style='color:blue' href='/admin/updateunknowpayment/"+documentIdGen+"' >Click Here</a>.");
     			setOpen(true);
			}




    } catch (error) {
      setErrors({'errormessage':error.message});
      console.log("error====>",error)
      let errordata=error.response.data
		setOperationStatus( error.response.data.status)
		setOperationMessage(error.response.data.data)

		const userDataSelected = await FetchDataFromCollection("Users", 20, "email", "==", StudentEmail, 0);
		if(userDataSelected.length)
		{
			console.log("userDataSelected[0].createdAt----->",userDataSelected[0].createdAt)
			if(typeof userDataSelected[0].createdAt==="undefined")
			{
				dataTobesend={};
				dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    			dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
    			handleUpdate("Users",userDataSelected[0].uid,dataTobesend).then((result) =>
    			{
     				handleUpdate("UsersRoles",userDataSelected[0].uid,dataTobesend).then((result) =>
     				{
     				});
     			});

			}
			else
			{
				const userDataSelectedRole = await FetchDataFromCollection("UsersRoles", 20, "uid", "==", userDataSelected[0].uid, 0);
				if(userDataSelectedRole.length)
				{
					if(typeof userDataSelectedRole[0].createdAt==="undefined")
					{
						dataTobesend={};
						dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    					dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
    					handleUpdate("UsersRoles",userDataSelected[0].uid,dataTobesend).then((result) =>
     					{
     					});
    				}
    			}
			}
			setOperationMessage(error.response.data.data+"<a style='color:blue' href='/admin/userdetails/"+userDataSelected[0].uid+"' >Click Here</a>");
		}
		else
		{
			dataTobesend['uid']=errordata?.user?.uid;
      		dataTobesend['email']=StudentEmailNormal;
      		dataTobesend['displayName']=StudentNameNormal;
      		dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
      		dataTobesend['PhoneCountry']={};
      		dataTobesend['PhoneCountry']=selectedCountry;
      		dataTobesend['phoneNumber']=StudentPhone;
      		dataTobesend['SameAsWhatsAppNumber']=initialData['SameAsWhatsAppNumber'];
      		if(initialData['SameAsWhatsAppNumber']==="yes")
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=selectedCountry;
      			dataTobesend['WhatsappNumber']=StudentPhone;
      		}
      		else
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=selectedCountryWhatApp;
      			dataTobesend['WhatsappNumber']=initialData.StudentWhatsappPhone;
      		}
			handleUpdate("Users",errordata?.user?.uid,dataTobesend).then((result) => {
     		dataTobesend={};
     		//dataTobesend['Role']="Default";
     		dataTobesend['Role'] = selectedUserType.value;
     		dataTobesend['email']=StudentEmailNormal;
      		dataTobesend['displayName']=StudentNameNormal;
      		dataTobesend['uid']=errordata?.user?.uid;
      		dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
     		handleUpdate("UsersRoles",errordata?.user?.uid,dataTobesend).then((result) => {
     		hideLoading();

     		setOperationMessage(error.response.data.data+"<a style='color:blue' href='/admin/userdetails/"+errordata?.user?.uid+"' >Click Here</a>");
     	});
     	});
		}
		 console.error("userDataSelected----->", userDataSelected);
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
    if(!StudentName)
    {
    	errors.StudentName="Please Enter Student Name.";
    }
    if(!StudentEmail)
    {
    	errors.StudentEmail="Please Enter Student Email.";
    }
    else if(StudentEmail && !validateEmail(StudentEmail))
    {
    	errors.StudentEmail="Please Enter A Valid Student Email.";
    }
    if (!selectedUserType || selectedUserType.value === "") 
    {
  		errors.UserType = "Please select user type.";
	}
    if(StudentPhone)
    {
    	//errors.StudentPhone="Please Enter Student Phone Number.";
    	if(!selectedCountry)
    	{
    		errors.selectedCountry="Select Country Code.";
    	}
    	else if(StudentPhone && !validatePhoneNumber(StudentPhone))
    	{
    		errors.StudentPhone="Please Enter A Valid Phone Number (Without Country Code).";
    	}
    	if(initialData['SameAsWhatsAppNumber']?.['value']==='' || initialData['SameAsWhatsAppNumber']==='')
    	{
    		errors.SameAsWhatsAppNumber="Please Select If Whatapp Number Is Same.";
    	}
		else if(initialData['SameAsWhatsAppNumber']?.['value']==='no')
    	{
    		if(!selectedCountryWhatApp || selectedCountryWhatApp===null)
    		{
    			errors.StudentWhatsappCountry="Select Country Code.";
    		}
    		if(initialData['StudentWhatsappPhone']==='')
    		{
    			errors.StudentWhatsappPhone="Please Enter Student Whatsapp Number.";
    		}
    		else if(initialData['StudentWhatsappPhone'] && !validatePhoneNumber(initialData['StudentWhatsappPhone'],selectedCountryWhatApp?.value))
    		{
    			errors.StudentWhatsappPhone="Please Enter A Valid Phone Number (Without Country Code).";
    		}

    	}
    }

    return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <Typography class="margin0auto" variant="h6">Create Student Profile</Typography>
        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
              <div class="InputLabel"></div>
                  <TextField
                    label="Student Name"
                    variant="outlined"
                    fullWidth
                    value={StudentName}
                    required
                    onChange={handleStudentNameChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentName  && <span class="validationerror">{errors.StudentName }</span>}
                </Grid>
              <Grid item xs={6}>
              	<div class="InputLabel"></div>
                  <TextField
                    label="Student Email"
                    variant="outlined"
                    fullWidth
                    value={StudentEmail}
                    required
                    onChange={handleStudentEmailChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentEmail  && <span class="validationerror">{errors.StudentEmail }</span>}
                </Grid>
				<Grid item xs={6}>
  <FormControl fullWidth required>
    <div class="InputLabel">User Type</div>
    <Select
      value={selectedUserType}
      onChange={(event) => {
        setSelectedUserType(event);
        checkForChanges("UserType", event?.value);
      }}
      options={UserTypeList}
      placeholder="Select User Type"
      isSearchable
    />
    {errors.UserType && (
      <span class="validationerror">{errors.UserType}</span>
    )}
  </FormControl>
</Grid>
                <Grid item xs={2}>
                <div class="InputLabel">Select Country Code</div>
                <Select
        value={selectedCountry}
        onChange={handleChange}
        options={allCountries}
        placeholder="Country Code"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	{errors.selectedCountry  && <span class="validationerror">{errors.selectedCountry }</span>}
              	</Grid>
              	<Grid item xs={4}>
              	<div class="InputLabel"></div>
                  <TextField
                    label="Student Phone"
                    variant="outlined"
                    fullWidth
                    value={StudentPhone}
                    required
                    placeholder="Phone number without country code"
                    onChange={handleStudentPhoneChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentPhone  && <span class="validationerror">{errors.StudentPhone }</span>}
                  </Grid>
                  <Grid item xs={6}>
                  <FormControl fullWidth  required>
                    <div class="InputLabel" >{StudentPhone?StudentPhone:''}, Same As WhatsApp Number?</div>
                   <Select
                    name="SameAsWhatsAppNumber"
                    value={initialData['SameAsWhatsAppNumber']}
                    label="2nd phone number if different than whatsapp"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'SameAsWhatsAppNumber')}
                     options={SameAsPhoneList}
                  />
                {errors.SameAsWhatsAppNumber  && <span class="validationerror">{errors.SameAsWhatsAppNumber }</span>}
                </FormControl>
                  </Grid>
                   {initialData['SameAsWhatsAppNumber']?.['value'] === 'no' && (
                <>
                <Grid item xs={2}>
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
              	</Grid>
              	<Grid item xs={4}>
              	<div class="InputLabel"></div>
                  <TextField
                    label="Student Whatsapp Number"
                    variant="outlined"
                    fullWidth
                    value={initialData['StudentWhatsappPhone']}
                    required
                    placeholder="Whatsapp number without country code"
                    onChange={(event) => handleChangeStudentDetails(event,'StudentWhatsappPhone')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentWhatsappPhone  && <span class="validationerror">{errors.StudentWhatsappPhone }</span>}
                  </Grid>
                </>
              )}
                </Grid>

          <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}
              disabled={!isFormChanged}
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
