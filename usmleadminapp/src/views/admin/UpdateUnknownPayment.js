import React, { useEffect, useState } from 'react';
import { countryData } from "../../apis/countryData";
import Select1 from 'react-select';
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import axios from 'axios';
import { useParams,useNavigate } from 'react-router-dom';
import { useLoading } from '../../layout/LoadingContext';
import {
  TextField,
  Grid,
	Typography,
  Button,
  Select,
  Dialog,Box,MenuItem,DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
///import DatePicker from 'react-datepicker';
//import 'react-datepicker/dist/react-datepicker.css';
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
	const navigate = useNavigate();
	const { showLoading, hideLoading, API_KEY,getMaxStudentUniqueId,DatabaseName,Timestamp,deletedocumentfromid,handleUpdate, FetchDataFromCollection } = useLoading();
	const { useridd } = useParams();
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const [CurrentData, setCurrentData] = useState({});
  useEffect(() => {
    const fetchUserData = async () => {
    console.log("useridd---->",useridd)
    const UnknowUserSelected = await FetchDataFromCollection("UnknownPayments", 20, "__name__", "==", useridd, 0);
    console.log("UnknowUserSelected---->",UnknowUserSelected)
    if(UnknowUserSelected.length>0)
    {
    	if(typeof UnknowUserSelected[0].ActualEmail==="undefined")
    	{
    		UnknowUserSelected[0].ActualEmail=UnknowUserSelected[0].Email;
    	}
    	setCurrentData(UnknowUserSelected[0]);
    }
    
    setInitialData({
         
        });
    };

    fetchUserData();
  }, []);

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
	const handleChange = async (event,name="")=>
	{
		let value;
		if(event===null)
		{
			setCurrentData((prevValues) => {
    // Create a shallow copy of the current state without the `name` property
    const { [name]: _, ...updatedValues } = prevValues;
    
    // Return the updated object without `name`
    return updatedValues;
  });
  setInitialData((prevValues) => {
    // Create a shallow copy of the current state without the `name` property
    const { [name]: _, ...updatedValues } = prevValues;
    
    // Return the updated object without `name`
    return updatedValues;
  });
  	
      return;
		}
		else if(typeof event.target!="undefined")
  		{
  			value=event.target.value;
  		}
  		else if(typeof event.$d!="undefined")
  		{
  			value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  			value = Timestamp.fromDate(new Date(value))
  		}
  		else if(typeof event.label!="undefined")
  		{
  			value=event;
  		}
  		else
  		{
  			value=event.label;
  		}
  		console.log("value---->",value)
  		console.log("name---->",name)
  		setInitialData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
  		setCurrentData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
      checkForChanges(name, value);
	}
	const generateDocumentIdFromEmail = (email) => {
  // Replace special characters with hyphen before encoding
  const sanitizedEmail = email.replace(/@/g, '-at-').replace(/\./g, '-dot-');
  // Return the Base64 encoded string
  return btoa(sanitizedEmail);
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
const RegisterToKnown = async ()=>
{	let dataTobesend={};
	let ActualUserEmail=CurrentData['ActualEmail'];
	let StudentEmailNormal=CurrentData['ActualEmail'].toLowerCase();
    let StudentNameNormal=CurrentData['Name'].toLowerCase();
    let password=generateRandomPassword(12);
    let ServiceType=CurrentData['ServiceType'];
    showLoader()
    if(ActualUserEmail!=="" && typeof ServiceType!=="undefined")
    {
    	try {
	const response = await axios.post('https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/createUser', { StudentEmail:StudentEmailNormal, password, StudentName:StudentNameNormal });
      		console.log("response----->",response)
      		let MaxStudentUniqueId=await getMaxStudentUniqueId("Users","StudentUniqueId");
      		MaxStudentUniqueId=MaxStudentUniqueId+1;
      		dataTobesend['uid']=response.data.data.uid;
      		dataTobesend['email']=StudentEmailNormal;
      		dataTobesend['displayName']=StudentNameNormal;
      		dataTobesend['StudentUniqueId']=MaxStudentUniqueId;
      		dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
      		dataTobesend['PhoneCountry']={};
      		dataTobesend['PhoneCountry']=CurrentData['PhoneCountryCode'];
      		dataTobesend['phoneNumber']=CurrentData['PhoneNumber'];
      		console.log("dataTobesend===>",dataTobesend)
      		console.log("CurrentData===>",CurrentData)
      		if(typeof CurrentData['SameAsWhatsAppNumber']==="undefined")
      		{
      			CurrentData['SameAsWhatsAppNumber']={"label":'yes',"value":'yes'};
      		}
      		dataTobesend['SameAsWhatsAppNumber']=CurrentData['SameAsWhatsAppNumber']['label'];
      		if(CurrentData['SameAsWhatsAppNumber']['label']==="yes")
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=dataTobesend['PhoneCountry'];
      			dataTobesend['WhatsappNumber']=dataTobesend['phoneNumber'];
      		}
      		else
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=CurrentData['WhatsappCountryCode']?CurrentData['WhatsappCountryCode']:'';
      			dataTobesend['WhatsappNumber']=CurrentData['WhatsappNumber']?CurrentData['WhatsappNumber']:'';
      		}   
      		console.log("dataTobesend===>",dataTobesend)   	
      		console.log("")	
			handleUpdate("Users",response.data.data.uid,dataTobesend).then((result) => {
     		dataTobesend={};
     		dataTobesend['Role']="Default";
     		dataTobesend['email']=CurrentData['ActualEmail'];
     		dataTobesend['StudentUniqueId']=MaxStudentUniqueId;
      		dataTobesend['displayName']=CurrentData['Name'];
      		dataTobesend['uid']=response.data.data.uid;
      		dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
     		handleUpdate("UsersRoles",response.data.data.uid,dataTobesend).then((result) => {
     		hideLoader();
     		let dataTobesendL={};
     		dataTobesendL['uid']=response.data.data.uid;
     		if(typeof CurrentData['ServiceType']!=="undefined")
     		{
     			if(CurrentData['ServiceType']==="Match")
     			{
     				dataTobesendL['Match']={'Payments':{'Payment0':{'Amount':CurrentData['Amount'],'ModeOfPayment':CurrentData['ModeOfPayment'],'PaymentDate':CurrentData['PaymentDate']}}}
     			}
     			else if(CurrentData['ServiceType']==="Research")
     			{
     				dataTobesendL['Research']={'Research0':{'Payments':{'Payment0':{'Amount':CurrentData['Amount'],'FeeType':CurrentData['FeeType'],'ModeOfPayment':CurrentData['ModeOfPayment'],'PaymentDate':CurrentData['PaymentDate']}}}}
     			}
     			else
     			{
     				dataTobesendL['RotationData']={'Rotations':{'Rotation0':{'RotationPayment':{'Payment0':{'Amount':CurrentData['Amount'],'FeeType':CurrentData['FeeType'],'ModeOfPayment':{'label':CurrentData['ModeOfPayment'],'value':CurrentData['ModeOfPayment']},'PaymentDate':CurrentData['PaymentDate']}}}}}
     			}
     		}
     		else
     		{
     			dataTobesendL['RotationData']={'Rotations':{'Rotation0':{'RotationPayment':{'Payment0':{'Amount':CurrentData['Amount'],'FeeType':CurrentData['FeeType'],'ModeOfPayment':{'label':CurrentData['ModeOfPayment'],'value':CurrentData['ModeOfPayment']},'PaymentDate':CurrentData['PaymentDate']}}}}}
     		}
     		
     		console.log("dataTobesend====>",dataTobesend)
     		handleUpdate("UserServices",response.data.data.uid,dataTobesendL).then((result) => {
     		console.log("/userdetails/"+response.data.data.uid)
     		navigate("/admin/userdetails/"+response.data.data.uid)
     		//setOperationMessage("Email Already Exists <a target='_blank' style='color:blue' href='userdetails/"+UserServicesSelectedMain[0].uid+"' >Click Here</a>.");
     		setOperationStatus( response.data.status)
     		setOperationMessage(result.message);
     		setOpen(true);
     		deletedocumentfromid("UnknownPayments",useridd)
			console.log("response=====>",response.data.data.uid)
			});
     	});
     	});
     }
     catch (error) 
     {
     	console.log("error---->",error)
      	setErrors({'errormessage':error.message});
      let errordata=error.response.data
		setOperationStatus( error.response.data.status)
		setOperationMessage(error.response.data.data)

		const userDataSelected = await FetchDataFromCollection("Users", 20, "email", "==", StudentEmailNormal, 0);
		if(userDataSelected.length)
		{
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
      		dataTobesend['PhoneCountry']=CurrentData['PhoneCountryCode'];
      		dataTobesend['phoneNumber']=CurrentData['PhoneNumber'];
      		if(typeof CurrentData['SameAsWhatsAppNumber']==="undefined")
      		{
      			CurrentData['SameAsWhatsAppNumber']={"label":'yes',"value":'yes'};
      		}
      		dataTobesend['SameAsWhatsAppNumber']=CurrentData['SameAsWhatsAppNumber']['label'];
      		if(CurrentData['SameAsWhatsAppNumber']['label']==="yes")
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=dataTobesend['PhoneCountry'];
      			dataTobesend['WhatsappNumber']=dataTobesend['phoneNumber'];
      		}
      		else
      		{
      			dataTobesend['WhatsappCountry']={};
      			dataTobesend['WhatsappCountry']=CurrentData['WhatsappCountryCode']?CurrentData['WhatsappCountryCode']:'';
      			dataTobesend['WhatsappNumber']=CurrentData['WhatsappNumber']?CurrentData['WhatsappNumber']:'';
      		}      		
			handleUpdate("Users",errordata?.user?.uid,dataTobesend).then((result) => {
     		dataTobesend={};
     		dataTobesend['Role']="Default";
     		dataTobesend['email']=StudentEmailNormal;
      		dataTobesend['displayName']=StudentNameNormal;
      		dataTobesend['uid']=errordata?.user?.uid;
			dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
     		handleUpdate("UsersRoles",errordata?.user?.uid,dataTobesend).then((result) => {
     		
     		let dataTobesendL={};
     		dataTobesendL['uid']=errordata?.user?.uid;
     		dataTobesendL['RotationData']={'Rotations':{'Rotation0':{'RotationPayment':{'Payment0':{'Amount':CurrentData['Amount'],'FeeType':CurrentData['FeeType'],'ModeOfPayment':{'label':CurrentData['ModeOfPayment'],'value':CurrentData['ModeOfPayment']},'PaymentDate':CurrentData['PaymentDate']}}}}}
     		console.log("dataTobesend====>",dataTobesend)
     		handleUpdate("UserServices",errordata?.user?.uid,dataTobesendL).then((result) => {
     		hideLoader();
     		deletedocumentfromid("UnknownPayments",useridd)
     		console.log("/userdetails/"+errordata?.user?.uid)
     		navigate("/admin/userdetails/"+errordata?.user?.uid)
     		//setOperationMessage("Email Already Exists <a target='_blank' style='color:blue' href='userdetails/"+UserServicesSelectedMain[0].uid+"' >Click Here</a>.");
     		//setOperationStatus( response.data.status)
     		//setOperationMessage(result.message);
     		//setOpen(true);
     		
			//console.log("response=====>",response.data.data.uid)
			});
     		setOperationMessage(error.response.data.data+"<a style='color:blue' href='/admin/userdetails/"+errordata?.user?.uid+"' >Click Here</a>");
     	});
     	});
		}
		 console.error("userDataSelected----->", userDataSelected);
      console.error("Error signing up", error.response.data.status);
      setOpen(true);
      hideLoader();
    }
    }
    else
    {
    	if(ActualUserEmail!=="")
    	{
    		setErrors({ServiceType:"Please Select Service Type."});
    	}
    	else
    	{
    		setErrors({ActualEmail:"Please Enter Actual Email On Which Account Is To Be Created."});
    	}
    	
    	hideLoader();
    }
    
}
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
    	 showLoader()
    	try 
    	{
    		//const documentId = generateDocumentIdFromEmail(CurrentData['Email']); 
    		//CurrentData['uid']=documentId;
    		//CurrentData['createdAt']=Timestamp.fromDate(new Date());
    		//CurrentData['updatedAt']=Timestamp.fromDate(new Date());
    		const UserServicesSelectedMain = await FetchDataFromCollection("Users", 20, "email", "==", CurrentData['Email'], 0);
    		if(UserServicesSelectedMain.length<=0)
    		{
    			console.log("CurrentData--->",CurrentData)
    			console.log("useridd--->",useridd)
    			handleUpdate("UnknownPayments",useridd,CurrentData).then((result) => {
    				hideLoader()
    				setOperationStatus("Success")
     				setOperationMessage("Successfully Updated.");
     				setOpen(true);
    			})
    			/*const UserServicesSelected = await FetchDataFromCollection("UnknownPayments", 20, "__name__", "==", useridd, 0);
    			console.log("UserServicesSelected====>",UserServicesSelected)
    			if(UserServicesSelected.length<=0)
    			{
    				handleUpdate("UnknownPayments",useridd,CurrentData).then((result) => {
    				hideLoader()
    				
    			})
    			}
    			else
    			{
    				hideLoader();
    				setOperationStatus("Error")
     				setOperationMessage("Email Already Exists You Can't Make Any New Entry On This Email <a target='_blank' style='color:blue' href='listunknownpayments/"+UserServicesSelected[0].PaymentDate.seconds+"/"+UserServicesSelected[0].PaymentDate.seconds+"' >Click Here</a>.");
     				setOpen(true);
    			}*/
    		}
    		else
    		{
    				hideLoader();
    				setOperationStatus("Error")
     				setOperationMessage("Email Already Exists <a target='_blank' style='color:blue' href='/admin/userdetails/"+UserServicesSelectedMain[0].uid+"' >Click Here</a>.");
     				setOpen(true);
    		}
    	} 
    	catch (error) 
    	{
    	}
    }
	}
	const validateEmail = (email) => 
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validate = () => {
    const errors = {};
    if(typeof CurrentData['Name']==="undefined" || CurrentData['Name']==="")
    {
    	errors.Name="Please Enter  Name.";
    }
    if(typeof CurrentData['Email']==="undefined" || CurrentData['Email']==="")
    {
    	errors.Email="Please Enter Email.";
    }
    else if(typeof CurrentData['Email']!=="undefined" && !validateEmail(CurrentData['Email']))
    {
    	errors.Email="Please Enter A Valid  Email.";
    }
    if(typeof CurrentData['FeeType']==="undefined" || CurrentData['FeeType']==="")
    {
    	errors.FeeType="Please Select Payment Type.";
    }
    if(typeof CurrentData['ModeOfPayment']==="undefined" || CurrentData['ModeOfPayment']==="")
    {
    	errors.ModeOfPayment="Please Select Payment Mode.";
    }
    if(typeof CurrentData['Amount']==="undefined" || CurrentData['Amount']==="")
    {
    	errors.Amount="Please Enter Amount.";
    }
    else if(CurrentData['Amount']!=='' && typeof CurrentData['Amount']!=="undefined" && isNaN(CurrentData['Amount']))
  	{
  		errors.Amount="Please Enter Valid Amount Without Currency Symbol Etc.";
  	}
    if(typeof CurrentData['PaymentDate']==="undefined" || typeof CurrentData['PaymentDate']['seconds']==="undefined")
    {
    	errors.PaymentDate="Please Select Payment Date.";
    }
    return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <div class="centerAlign">
      <div class="" variant="h6">Update Unknown Payments</div>
      </div>
        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
              <div class="InputLabel">Name</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={CurrentData['Name']}
                    required
                    onChange={(event) => handleChange(event,'Name')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Name  && <span class="validationerror">{errors.Name }</span>}
                </Grid>
            
                <Grid item xs={6}>
              	<div class="InputLabel">Email</div>
                  <TextField
                    variant="outlined"
                    disabled
                    fullWidth
                    value={CurrentData['Email']}
                    required
                    onChange={(event) => handleChange(event,'Email')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Email  && <span class="validationerror">{errors.Email }</span>}
                </Grid>
                  <Grid item xs={6}>
              	<div class="InputLabel">Actuall Email For Registration</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={CurrentData['ActualEmail']?CurrentData['ActualEmail']:''}
                    required
                    onChange={(event) => handleChange(event,'ActualEmail')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ActualEmail  && <span class="validationerror">{errors.ActualEmail }</span>}
                </Grid>
                <Grid item xs={6}>
     <div class="InputLabel" >Service Type</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
     
                  	value={CurrentData['ServiceType'] || ''}
                    label="Service Type"
                    required
                    onChange={(event) => handleChange(event,'ServiceType')}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="Match">
                        Match
                      </MenuItem>
                      <MenuItem value="Research">
                        Research
                      </MenuItem>
                       <MenuItem value="Rotation">
                        Rotation
                      </MenuItem>
                      <MenuItem value="Unknown">
                        Unknown
                      </MenuItem>
                      </Select>
                      {errors.ServiceType  && <span class="validationerror">{errors.ServiceType }</span>}
                    </FormControl>
      	 
       </Grid>
                <Grid item xs={6}>
     <div class="InputLabel" >Fee Type{CurrentData['FeeType']}</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
                    id="FeeType"
                    name="FeeType"
                    value={CurrentData['FeeType'] || ''}
                    label="Fees Type"
                    required
                    onChange={(event) => handleChange(event,'FeeType')}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="application fee">
                        Application Fee
                      </MenuItem>
                      <MenuItem value="rotation fee installment">
                        Rotation Fee Installment
                      </MenuItem>
                       <MenuItem value="rotation full payment">
                        Rotation Full Payment
                      </MenuItem>
                      <MenuItem value="NA">
                        NA
                      </MenuItem>
                      </Select>
                      {errors.FeeType  && <span class="validationerror">{errors.FeeType }</span>}
                    </FormControl>
      	 
       </Grid>
                <Grid item xs={6} >
                    <FormControl fullWidth>
                    <div class="InputLabel">Mode Of Payment</div>
                      <Select
                        required
                        variant="outlined"
                        value={CurrentData['ModeOfPayment'] || ''}
                        label='Mode Of Payment'
                        onChange={(event) => handleChange(event,'ModeOfPayment')}
                      >
                      	<MenuItem  value=''>
                            Select
                          </MenuItem>
                        {Object.entries(PaymentOptionsList).map(([subKey, subValue]) => (
                          <MenuItem key={subValue.label} value={subValue.label}>
                            {subValue.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ModeOfPayment  && <span class="validationerror">{errors.ModeOfPayment}</span>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
              	<div class="InputLabel">Amount</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={CurrentData['Amount']}
                    required
                    onChange={(event) => handleChange(event,'Amount')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Amount  && <span class="validationerror">{errors.Amount }</span>}
                </Grid>
                  <Grid item xs={6}>
                  <div class="InputLabel"></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={CurrentData['PaymentDate']?dayjs(CurrentData['PaymentDate'].toDate().toISOString()):null}
         onChange={(event) => handleChange(event,'PaymentDate')}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        showYearDropdown  // Enable year dropdown
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date" 
          label="Date Requested"
  		variant="outlined"
  		name={`Payment Date`} 
      /></Typography>
                </Box>
                {errors.PaymentDate && <span class="validationerror">{errors.PaymentDate}</span>}
              </Grid>
               <Grid item xs={6}>
              <TextField
                label="Payment Notes"
                variant="outlined"
                name="MatchDiscountCode"
                fullWidth
                multiline
                rows={4}
                value={CurrentData['PaymentNotes'] || ''} // Provide default value
                required
                onChange={(event) => handleChange(event,'PaymentNotes')}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.PaymentNotes && <span className="validationerror">{errors.PaymentNotes}</span>}
            </Grid>
                <Grid item xs={2}>
                <div class="InputLabel">Select Country Code</div>
                <Select1
        value={CurrentData['PhoneCountryCode']}
        onChange={(event) => handleChange(event,'PhoneCountryCode')}
        options={allCountries}
        placeholder="Country Code"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	{errors.selectedCountry  && <span class="validationerror">{errors.selectedCountry }</span>}
              	</Grid>
              	<Grid item xs={4}>
              	<div class="InputLabel">Phone</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={CurrentData['PhoneNumber'] || ''}
                    required
                    placeholder="Phone number without country code"
                    onChange={(event) => handleChange(event,'PhoneNumber')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentPhone  && <span class="validationerror">{errors.StudentPhone }</span>}
                  </Grid>
                  <Grid item xs={6}>
                  <FormControl fullWidth  required>
                    <div class="InputLabel" >{CurrentData['PhoneNumber']?CurrentData['PhoneNumber']:''}, Same As WhatsApp Number?</div>
                   <Select1
                    name="SameAsWhatsAppNumber"
                    value={CurrentData['SameAsWhatsAppNumber'] || ''}
                    label="2nd phone number if different than whatsapp"
                    required
                    onChange={(event) => handleChange(event,'SameAsWhatsAppNumber')}
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
        value={CurrentData['WhatsappCountryCode'] || ''}
        onChange={(event) => handleChange(event,'WhatsappCountryCode')}
        options={allCountries}
        placeholder="Country Code"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.StudentWhatsappCountry  && <span class="validationerror">{errors.StudentWhatsappCountry }</span>}
              	</Grid>
              	<Grid item xs={4}>
              	<div class="InputLabel">Whatsapp Number</div>
                  <TextField
                    variant="outlined"
                    fullWidth 
                    value={CurrentData['WhatsappNumber'] || ''}
                    required
                    placeholder="Whatsapp number without country code"
                     onChange={(event) => handleChange(event,'WhatsappNumber')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentWhatsappPhone  && <span class="validationerror">{errors.StudentWhatsappPhone }</span>}
                  </Grid>
                </>
              )}
                </Grid>
                
          <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Grid item xs={4}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}
              disabled={!isFormChanged}
            >
              Update
            </Button>
            </Grid>
            <Grid item xs={4}>
            <Button
              variant="contained"
              color="secondary"
              onClick={RegisterToKnown}
            >
              Register Known
            </Button>
            </Grid>
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
