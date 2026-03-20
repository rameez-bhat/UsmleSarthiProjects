import React, { useEffect, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { CountryWithStates } from "../../apis/countriesWithStates";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Select1 from 'react-select';
import { CFormCheck } from '@coreui/react'
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { USA_States } from "../../apis/usa_states";
//const admin = require('firebase-admin');
const dateFormat="MM/DD/YYYY";
import {
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from 'dayjs';

import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
let interviewData={};
const BASE_URL = "https://student.usmlesarthi.com/register";
const BASE_URL1 = "https://residencymatch.usmlesarthi.com/authenticate";
let referralUrl = "";

const RedFlagOptions = [
  { value: 'Lack of USCE', label: 'Lack of USCE' },
  { value: 'number of exam attempts', label: 'Number of Exam Attempts' },
  { value: 'YOG', label: 'YOG' },
  { value: 'Gap in experience', label: 'Gap in Experience' },
  { value: 'Other', label: 'Other' }
];
const matchVisaOptionList = [
  { value: 'GC/US citizen H4 EAD', label: 'GC/US citizen H4 EAD' },
  { value: 'Need H1', label: 'Need H1' },
  { value: 'Need J1', label: 'Need J1' },
  { value: 'Others', label: 'Others' }
];
const HowDidYouHearOptions = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Youtube', label: 'Youtube' },
  { value: 'Google', label: 'Google' },
  { value: 'Reviewed Website', label: 'Reviewed Website' },
  { value: 'Reddit', label: 'Reddit' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Profile Review/Discussion with Sarthi team', label: 'Profile Review/Discussion with Sarthi team' },
  { value: 'Refered by Friend/Senior', label: 'Refered by Friend/Senior' },
  { value: 'Others', label: 'Others' }
];
const allCountriesC = countryData.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag,
    phoneCode: country.phoneCode,
    "FieldName":"CountryOfMedicalSchool",
  }));
const currentYear = new Date().getFullYear();
const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
const SameAsPhoneList=[{value:"",label:"Select Value"},{value:"no",label:"No"},{value:"yes",label:"Yes"}];
let ReferralserviceOptions=[];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3',
  };
let AdminOptionsList=[];
let loopusce=0;
let medicalSchoolOptionsList = [
      ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
      { value: 'Others', label: 'Others' }
    ];
const Step1ScoreDropDown= {'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
const Step2ScoreDropDown= {'Score':'Score','Not taken':'Not taken'}
const UserDetails =  () => {
const navigate = useNavigate();
 const { toArray,ReferralemptyServiceRow,ReferraldiscountTypes,showLoading, hideLoading,deleteFieldFromDocument, API_KEY,Timestamp,DatabaseName,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser } = useLoading();
	const { id } = useParams();
	const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [existingServices, setExistingServices] = useState([]);
  const [services, setServices] = useState([{ ...ReferralemptyServiceRow }]);
	const [StudentData, setStudentData] = useState({});
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const mainCollectionName = 'UsersRoles';
  	const joinCollectionName = 'Users';
  	const handleBack = () => {
    navigate(-1);
  };
  const selectedServices = [...new Set([
  ...services.map((s) => s.service),
  ...existingServices
])];
  useEffect(() => {
	showLoader()
    fetchUserData();
  }, []);
   useEffect(() => {
    if(StudentData['CountryOfMedicalSchool'])
	{
		if(StudentData['CountryOfMedicalSchool']?.label)
		{
			if(StudentData['CountryOfMedicalSchool'].label!=="Others")
			{
				const filtered = medicalSchoolOptions.filter(college => college.includes(", "+StudentData['CountryOfMedicalSchool'].label));
				medicalSchoolOptionsList = [
      			...filtered.map(college => ({ value: college, label: college })),
      			{ value: 'Others', label: 'Others' }
    			];
			}
		}
    setStudentData(StudentData);
    }

  }, [StudentData['CountryOfMedicalSchool']]);
   const handleCheckboxChange = (event) => {
  const { id, checked } = event.target; // Extract id and checked values
  setStudentData((prevState) => ({
    ...prevState,
    servicesChoosen: {
      ...prevState.servicesChoosen, // Spread the existing servicesChoosen data
      [id]: checked, // Dynamically update the specific service by id
    },
  }));
};
const handleCopy = async (url,which) => {
    await navigator.clipboard.writeText(url);
    setCopied(which);
    setTimeout(() => setCopied(false), 2000);
  };
  const fetchUserData = async () => {

  showLoading()
  	const userDataSelected = await FetchDataFromCollection("Users", 20, "uid", "==", id, 0);
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
  	console.log("id--->",id)
  	console.log("userDataSelected--->",userDataSelected)
        const userDataSelectedAgent = await FetchDataFromCollection("AgentUserConnection", 20, "uid", "==", id, 0);
        const userDataSelectedInterviews = await FetchDataFromCollection("InterviewsInfo", 20, "UId", "==", id, 0);
        if(userDataSelectedInterviews.length > 0)
        {
          interviewData=userDataSelectedInterviews[0];
        }
          if(typeof userDataSelected[0]?.ReferralObject!="undefined" && typeof userDataSelected[0]?.ReferralObject?.Settings!="undefined")
        	{
        	  console.log("userDataSelected[0].ReferralObject?.Settings----->",userDataSelected[0].ReferralObject?.Settings)
        	  let ServicesList=[];
        	  let ServicesListExisting=[];
        	  Object.entries(userDataSelected[0].ReferralObject?.Settings).map(([key, value]) => {
        	    ServicesListExisting.push(value.service)
        	    //console.log("key====>",key)
        	    ServicesList.push(value)
        	    //ServicesList[key]=value;
        	  })
        	  setServices(ServicesList);
        	}
     	    if(typeof userDataSelected[0].Step1Score!="undefined" && typeof userDataSelected[0].Step1Score==="object")
        	{
        		if(typeof userDataSelected[0].ScoreData==="undefined")
        		{
        			userDataSelected[0].ScoreData={Step1Score:userDataSelected[0].Step1Score,Step2Score:userDataSelected[0].Step2Score,Step3Score:userDataSelected[0].Step3Score};
        		}

        		if(typeof userDataSelected[0].Step1Attempts!="undefined")
        		{
        			userDataSelected[0].ScoreData.Step1Attempts= userDataSelected[0].Step1Attempts;
        		}
        	}
        if (userDataSelectedAgent.length > 0) {
        	if (userDataSelectedAgent[0].AsignedToAgentId != null)
        	{
        		userDataSelected[0].AdminInTouch={label:userDataSelectedAgent[0].AsignedToAgentName,value:userDataSelectedAgent[0].AsignedToAgentId};
        	}
        }
const adminOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Admin");

   adminOptions.data.map((item) => {
    AdminOptionsList.push({label:item.displayName,value:item.id});
    return "h";
    })
      if(userDataSelected[0].displayName===userDataSelected[0].email)
    	{
    	  if(userDataSelected[0]?.DisplayNamePre)
    	  {
    	    userDataSelected[0].displayName=userDataSelected[0]?.DisplayNamePre;
    	  }

    	}
    	if(userDataSelected[0].phone && typeof userDataSelected[0].PhoneCountry==="undefined")
    	{
    		 countryData.map(country => {
        // Check if userDataSelected[0].phone contains country.phoneCode
        const phoneContainsCountryCode = userDataSelected[0].phone.includes(country.phoneCode);

        // Return the country object only if the phone contains the country code
        return phoneContainsCountryCode ? {
            value: country.value,
            label: "(" + country.phoneCode + ")" + country.value,
            flag: country.flag,
            phoneCode: country.phoneCode,
        } : null;
    }).filter(Boolean); // Filter out any null values from the array
    	}

    	if(typeof userDataSelected[0]['GraduationDate']==="undefined")
    	{
    		userDataSelected[0]['GraduationDate']="";
        	userDataSelected[0]['Step1Score']={};
       		userDataSelected[0]['Step2Score']={};
        	userDataSelected[0]['Step3Score']={};
        	userDataSelected[0]['Step1Score']['Selected']={'Name':'','Value':''};
        	userDataSelected[0]['Step2Score']['Selected']={'Name':'','Value':''};
       		userDataSelected[0]['Step3Score']['Selected']={'Name':'','Value':''};
        	//userDataSelected[0]['NameOfMedicalSchool']='';
        	//userDataSelected[0]['CountryOfMedicalSchool']='';
       		userDataSelected[0]['PriorUSCE']='';
       		//userDataSelected[0]['StudentTimeOfRotation']='';
       		//userDataSelected[0]['YearYouAreApplyingForResidency']='';
    	}
    	if(typeof userDataSelected[0]?.['USCEDATA']==="undefined")
    	{
				userDataSelected[0]['USCEDATA']={};
				userDataSelected[0]['USCEDATA']['USCENO0']={};
    	}
    	if(typeof userDataSelected[0]?.['USCEDATA']==="undefined")
    	{
				userDataSelected[0]['USCEDATA']={};
				userDataSelected[0]['USCEDATA']['USCENO0']={};
    	}
    	else
    	{
    	  const newUSCEDATA = {};
        Object.keys(userDataSelected[0]['USCEDATA']).forEach((key, index) =>
        {
          newUSCEDATA[`USCENO${index}`] = userDataSelected[0]['USCEDATA'][key];
        });
        userDataSelected[0]['USCEDATA']=newUSCEDATA;
    	}
    	if(typeof userDataSelected[0]?.['WorkExperienceData']==="undefined")
    	{
				userDataSelected[0]['WorkExperienceData']={};
				userDataSelected[0]['WorkExperienceData']['WORKEXP0']={};
    	}
    	if(typeof userDataSelected[0]?.['ResearchData']==="undefined")
    	{
				userDataSelected[0]['ResearchData']={};
				userDataSelected[0]['ResearchData']['Research0']={};
    	}
    	if(typeof userDataSelected[0]?.['servicesChoosen']==="undefined")
    	{
			userDataSelected[0]['servicesChoosen']={match:false,rotation:false,research:false,lockstudentprofile:false};
    	}

       setStudentData(userDataSelected[0])
    	  setInitialData(userDataSelected[0]);
    	 hideLoading();
    };
  const removeService = async (index) => {
    const updated = [...services];
    const RemovedItem= updated[index];
    updated.splice(index, 1);
    //updated.splice(index, );
    setServices(updated);
    const docId = RemovedItem.service.replace(/\s+/g, "");
    const FieldtobeDeleted=`ReferralObject.Settings.${docId}`;
    //console.log("RemovedItem====>",RemovedItem)
    await deleteFieldFromDocument("Users",id,FieldtobeDeleted);
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
	const handleChangeStudentDetails = async (event,name="",loop=-1,paymentIndex=-1)=>{

  		let value;
  		console.log("event--->",event)
  		if(typeof event.target!="undefined")
  		{
  			value=event.target.value;
  		}
  		else if(typeof event?.[0]?.value!="undefined")
  		{
  		  value=event;
  		}
  		else if(typeof event[0]!="undefined")
  		{
  			value={};
  			value['from']= Timestamp.fromDate(new Date(event[0].toLocaleString('en-GB', { timeZone: 'GMT' })));
			value['to']= Timestamp.fromDate(new Date(event[1].toLocaleString('en-GB', { timeZone: 'GMT' })));
  		}
  		else if(typeof event.$d!="undefined")
  		{
  			value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
			value = Timestamp.fromDate(new Date(value));
  		}
  		else if(typeof event.label!="undefined")
  		{
  			value=event;
  		}
  		else
  		{
  			value=event.label;
  		}

  	if (value === "Not taken" && (name==='Step1Score')) {
  	setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step1Score: {
      ...prevValues.ScoreData?.Step1Score, // Preserve other fields of Step1Score
      Selected: {
      	Name: value,
        Value: value,
      },
    },
     Step2Score: {
      ...prevValues.ScoreData?.Step2Score, // Preserve other fields of Step1Score
      Selected: {
      	Name: value,
        Value: value,
      },
    },
     Step3Score: {
      ...prevValues.ScoreData?.Step3Score, // Preserve other fields of Step1Score
      Selected: {
      	Name: value,
        Value: value,
      },
    },
  },
}));

    }
    else if(name==='GraduationDate')
    {
    	console.log("value======>",value)
    	setInitialData((prevValues) => ({
        ...prevValues,
        GraduationDate: value,
      }));
    	setStudentData((prevValues) => ({
        ...prevValues,
        GraduationDate: value,
      }));
    }
    else if(name==='Step1Score' || name==='Step2Score' || name==='Step3Score')
    {

       setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    [name]: {
      ...prevValues.ScoreData?.[name], // Keep the existing values for this specific name
      Selected: {
        Name: value, // Update the Name field with the new value
      },
    },
  },
}));
      setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    [name]: {
      ...prevValues.ScoreData?.[name], // Keep the existing values for this specific name
      Selected: {
        Name: value, // Update the Name field with the new value
      },
    },
  },
}));
    }
    else if(name==='Step1ScoreMarks' )
    {

      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step1Score: {
      ...prevValues.ScoreData.Step1Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step1Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));

      setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step1Score: {
      ...prevValues.ScoreData.Step1Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step1Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));
    }
    else if(name==='Step2ScoreMarks')
    {
      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step2Score: {
      ...prevValues.ScoreData.Step2Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step2Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));
setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step2Score: {
      ...prevValues.ScoreData.Step2Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step2Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));

    }
    else if(name==='Step1Attempts')
    {
      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step1Attempts: value
  },
}));
      setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step1Attempts: value
  },
}));

    }
     else if(name==='Step2Attempts')
    {
      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step2Attempts: value
  },
}));
      setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step2Attempts: value
  },
}));

    }
    else if(name==='Step3Attempts')
    {
      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step3Attempts: value
  },
}));
      setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData,
    Step3Attempts: value
  },
}));

    }
    else if(name==='Step3ScoreMarks')
    {
      setInitialData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step3Score: {
      ...prevValues.ScoreData.Step3Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step3Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));
setStudentData((prevValues) => ({
  ...prevValues,
  ScoreData: {
    ...prevValues.ScoreData, // Keep the existing ScoreData
    Step3Score: {
      ...prevValues.ScoreData.Step3Score, // Preserve other fields of Step1Score
      Selected: {
        Name: prevValues.ScoreData.Step3Score.Selected.Name, // Preserve the Name from previous state
        Value: value, // Update the Value with the new value
      },
    },
  },
}));
    }
    else if(name==='CountryOfMedicalSchool')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        CountryOfMedicalSchool: value,
      }));
      const filtered = medicalSchoolOptions.filter(college => college.includes(", "+value.label));
      medicalSchoolOptionsList = [
      ...filtered.map(college => ({ value: college, label: college })),
      { value: 'Others', label: 'Others' }
    ];
    setInitialData((prevValues) => ({
        ...prevValues,
        CountryOfMedicalSchool: value,
      }));
    }

    else if(name==='NameOfMedicalSchool')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchool: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchool: value,
      }));
    }
    else if(name==='NameOfMedicalSchoolOthers')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchoolOthers: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchoolOthers: value,
      }));
    }
    else if(name==='PriorUSCE')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        PriorUSCE: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        PriorUSCE: value,
      }));
    }
    else if( name==='StudentTimeOfRotation')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        StudentTimeOfRotation: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        StudentTimeOfRotation: value,
      }));
    }
    else if(name==='YearYouAreApplyingForResidency')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        YearYouAreApplyingForResidency: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        YearYouAreApplyingForResidency: value,
      }));
    }
    else if(loop!==-1)
    {
    	setStudentData((prevValues) => ({
  ...prevValues,
  [name]: {
    ...prevValues[name],
    [loop]: {
      ...prevValues[name][loop],
      [paymentIndex]: value,
    },
  },
}));
      setInitialData((prevValues) => ({
  ...prevValues,
  [name]: {
    ...prevValues[name],
    [loop]: {
      ...prevValues[name][loop],
      [paymentIndex]: value,
    },
  },
}));
    }
    else
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
    	console.log("result--->",StudentData)
  		console.log("value--->",value)

      checkForChanges(name, value);
	}
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    console.log("result--->",StudentData)
    var dataTobesend={};
    if (Object.keys(validationErrors).length === 0) {
    	 showLoading()
    	try {
      //await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard or show a success message
      		var dataTobesendAgent={
        AsignedToAgentId: StudentData.AdminInTouch.value, // Replace 'fieldName' with the actual field you want to update
        AsignedToAgentName: StudentData.AdminInTouch.label,
        uid: id
      }
    		handleUpdate("AgentUserConnection",id,dataTobesendAgent);
      		dataTobesend['PhoneCountry']={};
      		dataTobesend['PhoneCountry']=StudentData.PhoneCountry;
      		dataTobesend['phoneNumber']=StudentData.phoneNumber;
      		dataTobesend['SameAsWhatsAppNumber']=StudentData.SameAsWhatsAppNumber;
      		if(StudentData['SameAsWhatsAppNumber']['value']==="yes")
      		{
      			StudentData['WhatsappCountry']={};
      			StudentData['WhatsappCountry']=StudentData.PhoneCountry;
      			StudentData['WhatsappNumber']=StudentData.phoneNumber;
      		}
      		let WhatAppNumberForApi="";
          if(StudentData?.WhatsappCountry?.phoneCode && StudentData?.WhatsappNumber)
          {
            WhatAppNumberForApi=StudentData?.WhatsappCountry?.phoneCode+StudentData?.WhatsappNumber;
          }
          else if(StudentData?.PhoneCountry?.phoneCode && StudentData?.phoneNumber)
          {
            WhatAppNumberForApi=StudentData?.PhoneCountry?.phoneCode+StudentData?.phoneNumber;
          }
          StudentData['WhatAppNumberForApi']=WhatAppNumberForApi;
      		console.log("result--->",StudentData)
      		await deleteFieldFromDocument("Users",id,"WorkExperienceData");
      		await deleteFieldFromDocument("Users",id,"USCEDATA");
			handleUpdate("Users",id,StudentData).then((result) => {
     		hideLoading();
     		deleteUser(id,"Users",StudentData.email)
     		console.log("result--->",result)
     		setOperationStatus( result.status)
     		setOperationMessage(result.message);
     		setOpen(true);
     	});

    } catch (error) {
      setErrors({'errormessage':error.message});
		setOperationStatus( error.response.data.status)
		setOperationMessage(error.response.data.data)
		const userDataSelected = await FetchDataFromCollection("Users", 20, "email", "==", StudentData.email, 0);
		if(userDataSelected.length)
		{
			setOperationMessage(error.response.data.data+"<a style='color:blue' href='/admin/userdetails/"+userDataSelected[0].uid+"' >Click Here</a>");
		}
      console.error("Error signing up", error.response.data.status);
      setOpen(true);
      hideLoading();
    }
    }
	}
	const DeleteMoreWork = async (DeleteKey) => {
	console.log("DeleteKey---->",DeleteKey)
  setStudentData((prevData) => {
    const updatedUSCEDATA = { ...prevData.WorkExperienceData };

    // Delete the specified key
    delete updatedUSCEDATA[DeleteKey];

    // Extract and sort the remaining keys numerically
    const sortedKeys = Object.keys(updatedUSCEDATA).sort((a, b) => {
      const numA = parseInt(a.replace("WORKEXP", ""), 10);
      const numB = parseInt(b.replace("WORKEXP", ""), 10);
      return numA - numB;
    });

    // Rebuild the USCEDATA object with shifted keys
    const shiftedUSCEDATA = {};
    sortedKeys.forEach((key, index) => {
      shiftedUSCEDATA[`WORKEXP${index}`] = updatedUSCEDATA[key];
    });

    // Update the StudentData state
    return {
      ...prevData,
      WorkExperienceData: shiftedUSCEDATA,
    };
  });
};
	const DeleteMoreUSCE = async (DeleteKey) => {
	console.log("DeleteKey---->",DeleteKey)
  setStudentData((prevData) => {
    const updatedUSCEDATA = { ...prevData.USCEDATA };

    // Delete the specified key
    delete updatedUSCEDATA[DeleteKey];

    // Extract and sort the remaining keys numerically
    const sortedKeys = Object.keys(updatedUSCEDATA).sort((a, b) => {
      const numA = parseInt(a.replace("USCENO", ""), 10);
      const numB = parseInt(b.replace("USCENO", ""), 10);
      return numA - numB;
    });

    // Rebuild the USCEDATA object with shifted keys
    const shiftedUSCEDATA = {};
    sortedKeys.forEach((key, index) => {
      shiftedUSCEDATA[`USCENO${index}`] = updatedUSCEDATA[key];
    });

    // Update the StudentData state
    return {
      ...prevData,
      USCEDATA: shiftedUSCEDATA,
    };
  });
};
  const AddMoreUSCE = async (KeyFound,TypeofInf)=>
  {
  console.log("StudentData---->",StudentData)
				 setStudentData((prevData) => {
    const existingKeys = Object.keys(prevData[TypeofInf]);
console.log("existingKeys---->",existingKeys)
    // Generate the new key (e.g., "USCENO0")
      const highestKeyNumber = Math.max(
      ...existingKeys.map((key) => parseInt(key.replace(KeyFound, ""), 10))
    );

    // Generate the new key
    const newKey = `${KeyFound}${highestKeyNumber + 1}`;
    console.log("newKey---->",newKey)
    console.log("highestKeyNumber---->",highestKeyNumber)

    return {
      ...prevData,
      [TypeofInf]: {
        [newKey]: {}, // Add the new entry first
        ...prevData[TypeofInf],    // Spread the existing entries
      },
    };
  });

  	}
  const addMoreService = () => {
    setServices([...services, { ...ReferralemptyServiceRow }]);
  };
  const Referralvalidate = () => {
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
  const handleChange = (index, field, value) => {
  const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };
const handleSubmit = async () => {
  if (!Referralvalidate()) return;
  let PayloadPrepare={};
  try {
    showLoading();
  
    for (const s of services) {
      if (!s.service) continue;

      // ✅ Create document ID by removing spaces
      const docId = s.service.replace(/\s+/g, "");
      PayloadPrepare[docId]={
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
    }
    const PayloadPrepareSave={"ReferralObject":{"Settings":PayloadPrepare}}
    console.log("PayloadPrepare===>",PayloadPrepare)
    await handleUpdate("Users", id, PayloadPrepareSave);
    alert("Referral Services Added Successfully");
	//navigate("/admin/referrallist");
    //setServices([{ ...ReferralemptyServiceRow }]);
  } catch (err) {
    console.error(err);
    alert("Failed to save referrals");
  } finally {
    hideLoading();
  }
};
	const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber,Country) => {
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
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, Country);
      return parsedNumber && parsedNumber.isValid();
    } catch (e) {
      return false;
    }
  };
	const validate = () => {
    const errors = {};
    if(!StudentData.displayName)
    {
    	errors.displayName="Please Enter Student Name.";
    }
    if(!StudentData.email)
    {
    	errors.email="Please Enter Student Email.";
    }
    else if(StudentData.email && !validateEmail(StudentData.email))
    {
    	errors.email="Please Enter A Valid Student Email.";
    }
    if(!StudentData.phoneNumber)
    {
    	errors.phoneNumber="Please Enter Student Phone Number.";
    }
    else if(StudentData.phoneNumber && !validatePhoneNumber(StudentData.phoneNumber,StudentData?.PhoneCountry?.value))
    {
    	errors.phoneNumber="Please Enter A Valid Phone Number (Without Country Code).";
    }
    if(!StudentData.PhoneCountry)
    {
    	errors.selectedCountry="Select Country Code.";
    }
    if(StudentData['SameAsWhatsAppNumber']?.['value']==='' || StudentData['SameAsWhatsAppNumber']==='' || typeof StudentData['SameAsWhatsAppNumber']==="undefined")
    {
    	errors.SameAsWhatsAppNumber="Please Select If Whatapp Number Is Same.";
    }
	else if(StudentData['SameAsWhatsAppNumber']?.['value']==='no')
    {
    	if(!StudentData.WhatsappCountry || StudentData.WhatsappCountry ===null)
    	{
    		errors.WhatsappCountry="Select Country Code.";
    	}
    	if(StudentData['WhatsappNumber']==='' || typeof StudentData['WhatsappNumber']==="undefined")
    	{
    		errors.WhatsappNumber="Please Enter Student Whatsapp Number.";
    	}
    	else if(StudentData['WhatsappNumber'] && !validatePhoneNumber(StudentData['WhatsappNumber'],StudentData?.WhatsappCountry?.value))
    	{
    		errors.WhatsappNumber="Please Enter A Valid Phone Number (Without Country Code).";
    	}

    }
   	if(typeof StudentData['AdminInTouch']==='undefined')
    {
    	errors.AdminInTouch="Please Select Admin In Touch Of Student.";
    }
    /*if(StudentData['GraduationDate']==="")
    {
    	errors.GraduationDate="Please Select Date Of Graduation";
    }*/
    if(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Name']==="")
    {
    	errors.Step1Score="Please Select Step 1 Score";
    }
    else if(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Name']==="Score" && (StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Value']==="" || typeof StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Value']==="undefined"))
    {
    	errors.Step1ScoreMarks="Please Enter Step 1 Score";
    }
    else if(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Name']==="Score" && isNaN(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Value']) )
    {
    	errors.Step1ScoreMarks="Please Enter A Valud Step 1 Score";
    }
    else if(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Name']==="Fail" && (StudentData['ScoreData']?.['Step1Attempts']==="" || !StudentData['ScoreData']?.['Step1Attempts']))
    {
    	errors.Step1Attempts="Please Select Attempts";
    }
    if(StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Name']==="")
    {
    	errors.Step2Score="Please Select Step 2 Score";
    }
    else if(StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Name']==="Score" && (StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Value']==="" || typeof StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Value']==="undefined"))
    {
    	errors.Step2ScoreMarks="Please Enter Step 2 Score";
    }
    else if(StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Name']==="Score" && isNaN(StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Value']) )
    {
    	errors.Step1ScoreMarks="Please Enter A Valud Step 2 Score";
    }
    if(StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Name']==="")
    {
    	errors.Step3Score="Please Select Step 3 Score";
    }
    else if(StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Name']==="Score" && (StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Value']==="" || typeof StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Value']==="undefined"))
    {
    	errors.Step3ScoreMarks="Please Enter Step 3 Score";
    }
    else if(StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Name']==="Score" && isNaN(StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Value']) )
    {
    	errors.Step1ScoreMarks="Please Enter A Valud Step 3 Score";
    }
    if(StudentData?.['NameOfMedicalSchool']==="")
    {
    	errors.NameOfMedicalSchool="Please Enter Name Of The School";
    }
    else if(StudentData?.['NameOfMedicalSchool']?.['value']==="Others" && (StudentData['NameOfMedicalSchoolOthers']==="" || typeof StudentData['NameOfMedicalSchoolOthers']==="undefined"))
    {
    	errors.NameOfMedicalSchoolOthers="Please Enter Name Of The School";
    }
    if(StudentData['CountryOfMedicalSchool']==="")
    {
    	errors.CountryOfMedicalSchool="Please Select Country Of Medical School";
    }
    if((StudentData['StudentTimeOfRotation']==="" || typeof StudentData['StudentTimeOfRotation']==="undefined"))
    {
    	errors.StudentTimeOfRotation="Please Select Will you be a medical student at the time of your rotation?";
    }
    return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <button
      onClick={handleBack}
      style={buttonStyle}
      onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
      onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
    >
      Go Back
    </button>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
   
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 650,
          width: "100%",
          p: 4,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🎯 Referral Link
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Share your personal referral link to give discounts to your referrals.
        </Typography>

        {/* USER INFO */}
      

        {/* REFERRAL URL */}
        {/*<Grid container spacing={1}>
          <Grid item xs={10}>
            <TextField
              fullWidth
              value={BASE_URL+"?ref="+id}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={2}>
            <Tooltip title="Copy Referral Link">
              <IconButton
                color={copied==1 ? "success" : "primary"}
                onClick={(e) =>handleCopy(BASE_URL+"?ref="+id,1)}
                sx={{
                  border: "1px solid",
                  height: "56px",
                  width: "56px",
                }}
              >
                {copied==1 ? <CheckCircleIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>*/}
         <Grid container spacing={1}>
          <Grid item xs={10}>
            <TextField
              fullWidth
              value={BASE_URL1+"?ref="+id}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={2}>
            <Tooltip title="Copy Referral Link">
              <IconButton
                color={copied==2 ? "success" : "primary"}
                onClick={(e) =>handleCopy(BASE_URL1+"?ref="+id,2)}
                sx={{
                  border: "1px solid",
                  height: "56px",
                  width: "56px",
                }}
              >
                {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {/* SUCCESS MESSAGE */}
        {copied==2 && (
          <Typography mt={2} color="success.main" fontWeight="bold">
            ✅ Referral link copied successfully!
          </Typography>
        )}

        {/* ACTION BUTTONS */}
        <Box display="flex" gap={2} mt={4}>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.4 }}
             onClick={(e) =>handleCopy(BASE_URL1+"?ref="+id,2)}
          >
            Copy Link
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.4 }}
            onClick={() => {
    const message = `${BASE_URL1}?ref=${id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }}
          >
            Share on WhatsApp
          </Button>
        </Box>
      </Paper>
    </Box>
      <Typography className="margin0auto" variant="h6">Update Student Profile</Typography>
       <div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Select Service:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 3 }}>
    			<Grid item xs={3}>
          <CFormCheck
            id="match"
            label="Match"

            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.match || false}
          />
        </Grid>
        <Grid item xs={3}>
          <CFormCheck
            id="rotation"
            label="Rotation"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.rotation || false}
          />
        </Grid>
        <Grid item xs={3}>
          <CFormCheck
            id="research"
            label="Research"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.research || false}
          />
        </Grid>
        <Grid item xs={3}>
          <CFormCheck
            id="lockstudentprofile"
            label="Lock Student Profile"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.lockstudentprofile || false}
          />
        </Grid>
        <Grid item xs={3}>
          <CFormCheck
            id="enablestudentreferral"
            label="Enable Student Referral"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.enablestudentreferral || false}
          />
        </Grid>
        <Grid item xs={3}>
          <CFormCheck
            id="enableresourceforstudent"
            label="Enable Resources For Student"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.enableresourceforstudent || true}
          />
        </Grid>
  			</Grid>
		</div>
	</div>
	<div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Referral Settings:</b>  </Typography>
        </div>
       <div className="VisaLetter">
       <Grid item xs={6} sx={{p:2}} >
        <InputLabel>Service</InputLabel>
      </Grid>
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
    			{services.map((row, index) => (
  <>

      {/* SERVICE */}
      <Grid item xs={6} >
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
      <Grid item xs={12} md={5}>
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
      <Grid item xs={12} md={5}>
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
        <Grid item xs={1} display="flex" justifyContent="flex-end">
          <IconButton
            color="error"
            onClick={() => removeService(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      )}
    </>
))}


        {/* ADD MORE SERVICE BUTTON */}
        <Button
          variant="outlined"
          color="primary"
          onClick={addMoreService}
          sx={{ m: 3 }}
        >
          ➕ Add More Service
        </Button>

        {/* SUBMIT */}
        <Button
          variant="contained"
          color="primary"
          
          onClick={handleSubmit}

        >
        Submit
        </Button>
  			</Grid>
		</div>
	</div>
        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
              <div className="InputLabel">Student Name</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData.displayName}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'displayName')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.displayName  && <span className="validationerror">{errors.displayName }</span>}
                </Grid>
              <Grid item xs={6}>
              	<div className="InputLabel">Student Email</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    disabled
                    value={StudentData.email}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'email')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.email  && <span className="validationerror">{errors.email }</span>}
                </Grid>
                 <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="meeting-label">Student's Perception on Sarthi Service</InputLabel>
                <Select
                  value={StudentData.studentsperceptiononsarthi}
                  label="Student's Perception on Sarthi Service"
                  required
                  onChange={(event) => handleChangeStudentDetails(event,'studentsperceptiononsarthi')}
                >
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Satisfied">Satisfied</MenuItem>
                  <MenuItem value="Not Satisfied">Not Satisfied</MenuItem>
                </Select>
                {errors.studentsperceptiononsarthi && <span className="validationerror">{errors.studentsperceptiononsarthi}</span>}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              	<div className="InputLabel">Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    
                    value={StudentData.perceptionnote}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'perceptionnote')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.perceptionnote  && <span className="validationerror">{errors.perceptionnote }</span>}
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Number of Interviews:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{interviewData?.NumInterviews || 0}</Typography>
                </Box>
              </Grid>
            
                <Grid item xs={2}>
                <div className="InputLabel">Select Country Code</div>
                <Select1
        value={StudentData.PhoneCountry}
        onChange={(event) => handleChangeStudentDetails(event,'PhoneCountry')}
        options={allCountries}
        placeholder="Country Code"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	{errors.PhoneCountry  && <span className="validationerror">{errors.PhoneCountry }</span>}
              	</Grid>
              	<Grid item xs={4}>
              	<div className="InputLabel">Student Phone</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData.phoneNumber?StudentData.phoneNumber:StudentData.phone}
                    defaultValue={StudentData.phoneNumber?StudentData.phoneNumber:StudentData.phone}
                    required
                    placeholder="Phone number without country code"
                    onChange={(event) => handleChangeStudentDetails(event,'phoneNumber')}
                  />
                  {errors.phoneNumber  && <span className="validationerror">{errors.phoneNumber }</span>}
                  </Grid>
                  <Grid item xs={6}>
                  <FormControl fullWidth  required>
                    <div className="InputLabel" >{StudentData.phoneNumber?StudentData.phoneNumber:StudentData.phone}, Same As WhatsApp Number?</div>
                   <Select1
                    value={StudentData.SameAsWhatsAppNumber}
                    variant="outlined"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'SameAsWhatsAppNumber')}
                    options={SameAsPhoneList}
                  />
                {errors.SameAsWhatsAppNumber  && <span className="validationerror">{errors.SameAsWhatsAppNumber }</span>}
                </FormControl>
                  </Grid>
                   {StudentData['SameAsWhatsAppNumber']?.['value'] === 'no' && (
                <>
                <Grid item xs={2}>
                <div className="InputLabel">Select Country Code</div>
                <Select1
        value={StudentData.WhatsappCountry}
        onChange={(event) => handleChangeStudentDetails(event,'WhatsappCountry')}
        options={allCountries}
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.WhatsappCountry  && <span className="validationerror">{errors.WhatsappCountry }</span>}
              	</Grid>
              	<Grid item xs={4}>
              	<div className="InputLabel">Student Whatsapp Number</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData.WhatsappNumber}
                    required
                    placeholder="Whatsapp number without country code"
                    onChange={(event) => handleChangeStudentDetails(event,'WhatsappNumber')}
                  />
                  {errors.WhatsappNumber  && <span className="validationerror">{errors.WhatsappNumber }</span>}
                  </Grid>
                </>
              )}

              <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Admin In Touch</div>
                <Select1
                value={StudentData.AdminInTouch}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Admin In Touch"
        onChange={(event) => handleChangeStudentDetails(event,'AdminInTouch')}
        isSearchable
      />
      	{errors.AdminInTouch  && <span className="validationerror">{errors.AdminInTouch }</span>}
                </div>
               </Grid>
               <Grid item xs={6}>
              <div className="InputLabel" > </div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Year Of Graduation:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        //value={moment(rotationValues['GraduationDate'])}
       // value={ StudentData['GraduationDate']? typeof StudentData['GraduationDate']==="string" ? dayjs(StudentData['GraduationDate']):dayjs(new Date(StudentData['GraduationDate'].seconds * 1000)).format("YYYY"):null}
        dateFormat="YYYY"
        value={
    StudentData['GraduationDate']
      ? typeof StudentData['GraduationDate'] === "string"
        ? dayjs(StudentData['GraduationDate'])
        : dayjs(new Date(StudentData['GraduationDate'].seconds * 1000))
      : null
  }
         yearDropdownItemNumber={50}
         picker="year"
  		name="GraduationDate"
  		allowClear={false}
  		onChange={(event) => handleChangeStudentDetails(event,'GraduationDate')}
      /></Typography>
                </Box>
                {errors.GraduationDate && <span className="validationerror">{errors.GraduationDate}</span>}
              </Grid>
               <Grid item xs={6}>
              <div className="InputLabel" >If you extended graduation by more than 6 months, let us know</div>
                <FormControl fullWidth>
                <InputLabel></InputLabel>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData.GraduationExtendedMoreThan6Months}
                    required
                    placeholder="If you extended graduation by more than 6 months, let us know"
                    onChange={(event) => handleChangeStudentDetails(event,'GraduationExtendedMoreThan6Months')}
                  />
                  {errors.GraduationExtendedMoreThan6Months && <span className="validationerror">{errors.GraduationExtendedMoreThan6Months}</span>}
                </FormControl>
              </Grid>
               <Grid item xs={6}>
                  <div className="InputLabel" id="CountryOfMedicalSchool">Country Of Medical School</div>
                <Select1
        value={StudentData['CountryOfMedicalSchool'] || ''}
        onChange={(event) => handleChangeStudentDetails(event,'CountryOfMedicalSchool')}
        variant="outlined"
        labelId="CountryOfMedicalSchool"
        name="CountryOfMedicalSchool"
        options={allCountriesC}
        placeholder="Country Of Medical School"
        label="Country Of Medical School"
        title="Country Of Medical School"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.CountryOfMedicalSchool  && <span className="validationerror">{errors.CountryOfMedicalSchool }</span>}
              	</Grid>
              	<Grid item xs={6}>
                  <div className="InputLabel" id="CountryOfMedicalSchool">Name of Medical School</div>
                <Select1
        value={StudentData['NameOfMedicalSchool'] || ''}
        onChange={(event) => handleChangeStudentDetails(event,'NameOfMedicalSchool')}
        variant="outlined"
        options={medicalSchoolOptionsList}
        placeholder="Name of Medical School"
        label="Name of Medical School"
        title="Name of Medical School"
        isSearchable
      />
      	 {errors.NameOfMedicalSchool  && <span className="validationerror">{errors.NameOfMedicalSchool }</span>}
              	</Grid>
              	 {StudentData['NameOfMedicalSchool']?.['value'] === 'Others' && (
        <Grid item xs={6}>
              <div className="InputLabel" ></div>
                  <TextField
                    label="Enter Name of Medical School"
                    variant="outlined"
                    fullWidth
                    value={StudentData['NameOfMedicalSchoolOthers'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'NameOfMedicalSchoolOthers')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.NameOfMedicalSchoolOthers  && <span className="validationerror">{errors.NameOfMedicalSchoolOthers }</span>}
                </Grid>
                )}
              <Grid item xs={6}>
              <div className="InputLabel" ></div>
                <FormControl fullWidth>
                <InputLabel>Step 1 Score</InputLabel>
                  <Select
                    checkwhate={StudentData['Step1Score']?.['Selected']?.['Name']}
                    value={ StudentData?.ScoreData?.Step1Score?.Selected?.Name || ''}
                    label="Step 1 Score"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step1Score')}
                  >
                    {Object.entries(Step1ScoreDropDown).map(([subKey, subValue]) => (
                      <MenuItem key={subKey} value={subKey}>
                        {subValue}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.Step1Score && <span className="validationerror">{errors.Step1Score}</span>}
                </FormControl>
              </Grid>
              {StudentData?.['ScoreData']?.['Step1Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <TextField
                    label="Step 1 Score"
                    variant="outlined"
                    name="Step1ScoreMarks"
                    fullWidth
                    value={StudentData['ScoreData']['Step1Score']['Selected']['Value']}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step1ScoreMarks')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Step1ScoreMarks  && <span className="validationerror">{errors.Step1ScoreMarks }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
              <div className="InputLabel"></div>
                <FormControl fullWidth>
                  <div className="InputLabel" >Any Step 1 Failure?</div>
                  <Select
                    value={StudentData['ScoreData']?.['Step1Attempts'] || ''}
                    label="Attempts"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step1Attempts')}
                  >

                    <MenuItem  value='0'>0</MenuItem>
                    <MenuItem  value='1'>1</MenuItem>
                    <MenuItem  value='2'>2</MenuItem>
                    <MenuItem  value='3'>3</MenuItem>
                  </Select>
                  {errors.Step1Attempts && <span className="validationerror">{errors.Step1Attempts}</span>}
                </FormControl>
              </Grid>


              <Grid item xs={6}>
              <div className="InputLabel"></div>
                <FormControl fullWidth>
                  <InputLabel >Step 2 CK Score</InputLabel>
                  <Select
                    value={StudentData?.ScoreData?.Step2Score?.Selected?.Name || ''}
                    label="Step 2 CK Score"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step2Score')}
                  >
                    {Object.entries(Step2ScoreDropDown).map(([subKey, subValue]) => (
                      <MenuItem key={subKey} value={subKey}>
                        {subValue}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.Step2Score && <span className="validationerror">{errors.Step2Score}</span>}
                </FormControl>
              </Grid>
              {StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <TextField
                    label="Step 2 Score"
                    variant="outlined"
                    name="Step2ScoreMarks"
                    fullWidth
                    value={StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Value'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step2ScoreMarks')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Step2ScoreMarks  && <span className="validationerror">{errors.Step2ScoreMarks }</span>}
                </Grid>
              )}
               <Grid item xs={6}>
              <div className="InputLabel"></div>
                <FormControl fullWidth>
                  <div className="InputLabel" >Any Step 2 Failure?</div>
                  <Select
                    value={StudentData['ScoreData']?.['Step2Attempts'] || ''}
                    label="Attempts"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step2Attempts')}
                  >

                    <MenuItem  value='0'>0</MenuItem>
                    <MenuItem  value='1'>1</MenuItem>
                    <MenuItem  value='2'>2</MenuItem>
                    <MenuItem  value='3'>3</MenuItem>
                  </Select>
                  {errors.Step2Attempts && <span className="validationerror">{errors.Step2Attempts}</span>}
                </FormControl>
              </Grid>
               <Grid item xs={6}>
               <div className="InputLabel" ></div>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Step 3 Score</InputLabel>
                  <Select
                    labelId="status-label"
                    id="Step3Score"
                    name="Step3Score"
                    value={StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Name'] || ''}
                    label="Step 3 Score"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step3Score')}
                  >
                    {Object.entries(Step2ScoreDropDown).map(([subKey, subValue]) => (
                      <MenuItem key={subKey} value={subKey}>
                        {subValue}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.Step3Score && <span className="validationerror">{errors.Step3Score}</span>}
                </FormControl>
              </Grid>
              {StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <TextField
                    label="Score 3 Score"
                    variant="outlined"
                    name="Step3ScoreMarks"
                    fullWidth
                    value={StudentData['ScoreData']?.['Step3Score']?.['Selected']?.['Value'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step3ScoreMarks')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Step3ScoreMarks  && <span className="validationerror">{errors.Step3ScoreMarks }</span>}
                </Grid>
              )}
               <Grid item xs={6}>
              <div className="InputLabel"></div>
                <FormControl fullWidth>
                  <div className="InputLabel" >Any Step 3 Failure?</div>
                  <Select
                    value={StudentData['ScoreData']?.['Step3Attempts'] || ''}
                    label="Attempts"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step3Attempts')}
                  >

                    <MenuItem  value='0'>0</MenuItem>
                    <MenuItem  value='1'>1</MenuItem>
                    <MenuItem  value='2'>2</MenuItem>
                    <MenuItem  value='3'>3</MenuItem>
                  </Select>
                  {errors.Step3Attempts && <span className="validationerror">{errors.Step3Attempts}</span>}
                </FormControl>
              </Grid>
				 <Grid item xs={6}>
              <div className="InputLabel">Any other information/red flag you want us to be aware of</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={StudentData?.['redflag'] || ''}
                    options={RedFlagOptions}
                    label="Any other information/red flag you want us to be aware of"
                    onChange={(event) => handleChangeStudentDetails(event,'redflag')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Lack of USCE'>Lack of USCE</MenuItem>
                    <MenuItem  value='number of exam attempts'>number of exam attempts</MenuItem>
                    <MenuItem  value='YOG'>YOG</MenuItem>
                    <MenuItem  value='Gap in experience'>Gap in experience</MenuItem>
                    <MenuItem  value='Other'>Other</MenuItem>
                  </Select>
                  {errors.redflag && <span className="validationerror">{errors.redflag}</span>}
                </FormControl>
              </Grid>
              {StudentData?.['redflag'] !== '' && typeof StudentData?.['redflag']!="undefined" && (
					<Grid item xs={6}>
              	 <div className="InputLabel" >{StudentData?.['redflag']} explain?</div>
                  <TextField
                    variant="outlined"
                    name="PriorUSCE"
                    fullWidth
                    multiline
                    rows={4}
                    value={StudentData['redflagexplain'] || ''}
                    required

                    onChange={(event) => handleChangeStudentDetails(event,'redflagexplain')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.redflagexplain  && <span className="validationerror">{errors.redflagexplain }</span>}
                </Grid>
                )}

                  <Grid item xs={6}>
              <div className="InputLabel">How did you hear about us.</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                   <Select1
                    value={typeof StudentData?.['HDUGAU'] === 'string' ? {value:StudentData?.['HDUGAU'],label:StudentData?.['HDUGAU']} : StudentData?.['HDUGAU']}
                    options={HowDidYouHearOptions}
                    label="How did you hear about us."
                    required
                    isMulti
                    isSearchable
                    onChange={(event) => handleChangeStudentDetails(event,'HDUGAU')}
                  />

                  {errors.redflag && <span className="validationerror">{errors.redflag}</span>}
                </FormControl>
              </Grid>
              {(Array.isArray(StudentData?.['HDUGAU'])
  ? StudentData['HDUGAU'].map(item => item.value)  // Extract values from objects
  : typeof StudentData?.['HDUGAU'] === 'string'
    ? [StudentData['HDUGAU']]  // Convert string to array
    : []
).some(value => value === 'Others') && (
					 <Grid item xs={6}>
              	 <div className="InputLabel" ></div>
                  <TextField
                    label="Please explain here about others."
                    variant="outlined"
                    name="PriorUSCE"
                    fullWidth
                    multiline
                    rows={4}
                    value={StudentData['HDUGAUOther'] || ''}
                    required

                    onChange={(event) => handleChangeStudentDetails(event,'HDUGAUOther')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HDUGAUOther  && <span className="validationerror">{errors.HDUGAUOther }</span>}
                </Grid>
              )}

              	 <Grid item xs={6}>
              	 <div className="InputLabel" ></div>
                  <TextField
                    label="If You Have Done Prior USCE(number of months)"
                    variant="outlined"
                    name="PriorUSCE"
                    fullWidth
                    value={StudentData['PriorUSCE'] || ''}
                    required

                    onChange={(event) => handleChangeStudentDetails(event,'PriorUSCE')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.PriorUSCE  && <span className="validationerror">{errors.PriorUSCE }</span>}
                </Grid>
<div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Visa And Other Details:</b>  </Typography>
                </div>
                <Grid container spacing={2} sx={{ p: 1 }}>
                 <Grid item xs={6}>
  <div className="InputLabel">VISA REQUIREMENT.</div>
  <FormControl fullWidth>
    <Select1
      value={StudentData?.['VisaRequirement']}
      options={matchVisaOptionList}
      label="VISA REQUIREMENT."
      required
      isMulti
      isSearchable
      onChange={(event) => handleChangeStudentDetails(event, 'VisaRequirement')}
    />
    {errors.VisaRequirement && <span className="validationerror">{errors.VisaRequirement}</span>}
  </FormControl>
</Grid>

{/* Show text field if "Others" is selected */}
{Array.isArray(StudentData?.['VisaRequirement']) &&
  StudentData['VisaRequirement'].some(item => item.value === 'Others') && (
    <Grid item xs={6}>
      <div className="InputLabel">Others Please Explain?</div>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={StudentData?.['VisaRequirementOthers'] || ''}
        onChange={(event) => handleChangeStudentDetails(event, 'VisaRequirementOthers')}
        sx={{ my: 0, "margin-bottom": "4px" }}
      />
      {errors.VisaRequirementOthers && <span className="validationerror">{errors.VisaRequirementOthers}</span>}
    </Grid>
)}


<Grid item xs={6}>
      <div className="InputLabel">If You Are A Repeating Applicant, Mention Years(s) In Which You Have Applied, Speciality And Any Interview</div>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={StudentData?.['ProfileRepeating'] || ''}
        onChange={(event) => handleChangeStudentDetails(event, 'ProfileRepeating')}
        sx={{ my: 0, "margin-bottom": "4px" }}
      />
      {errors.ProfileRepeating && <span className="validationerror">{errors.ProfileRepeating}</span>}
    </Grid>
</Grid>
              </div>




				<div className="RotationAddedPayment MatchPayment" >
			<div className="TitleDiv">
			  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>USCE:</b>  </Typography>
			</div>
			{Object.entries(StudentData?.['USCEDATA'] || {}).map(([subKey, subValue]) => {
console.log("subKey---->",subKey)
subKey=subKey.replace("USCENO","");
subKey=subKey.replace("-Infinity","");
if(isNaN(subKey))
{
  subKey="USCENO"+loopusce;
  loopusce=loopusce+1;
}
   return (
   			<div className="RotationAddedPaymentBody">
				<Grid container spacing={2} sx={{ p: 1 }}>

				<Grid item xs={6}>
				  <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
					<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>USCE NO:{Number(subKey.replace("USCENO",""))+1}</b>  <font color="blue"><b>  </b></font></Typography>
				</Box>
			</Grid>
			<Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"

		  onClick={() => DeleteMoreUSCE(subKey)}
		>
		  Delete USCE
		</Button>
			</Box>
			</Grid>
		   <Grid item xs={6} >
			<div className="InputLabel" ></div>
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
			  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>USCE-From/To Date:</Typography>
			  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><RangePicker
	value={subValue['USCEDateRange']?.['from']?[dayjs(new Date(subValue['USCEDateRange']['from'].seconds * 1000)),dayjs(new Date(subValue['USCEDateRange']['to'].seconds * 1000))]:null}
   onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'USCEDateRange',subValue)}
	format={dateFormat} // Customize date format as needed
	scrollableYearDropdown  // Make year dropdown scrollable
	 yearDropdownItemNumber={50}

	 picker="date"
	variant="outlined"
  /></Typography>
			</Box>
			{errors?.USCEDateRange?.[subKey] && <span className="validationerror">{errors?.USCEDateRange?.[subKey]}</span>}
		  </Grid>
		  <Grid item xs={6}>
                <FormControl fullWidth>
                	 <div className="InputLabel" >Location(State)</div>
                  <Select
                    value={subValue['USCEState'] || '=Select='}
                    label="Location(State)"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'USCEState')}
                  >
                  	<MenuItem key="=Select=" value="=Select=" >
                        =Select=
                      </MenuItem>
                    {USA_States.map((item) => (
                      <MenuItem key={item.name} value={item.name}>
                        {item.name}
                      </MenuItem>

                    ))}
                    <MenuItem  value='Other'>
                       Other
                      </MenuItem>
                  </Select>
                  {errors.USCEState && <span className="validationerror">{errors.USCEState}</span>}
                </FormControl>
              </Grid>

			<Grid item xs={6}>
			 <div className="InputLabel" >Location(City)</div>
			  <TextField

				variant="outlined"
				fullWidth
				value={subValue['USCEcity'] || ''}
				onChange={(event) =>  handleChangeStudentDetails(event,'USCEDATA',subKey,'USCEcity')}
				sx={{ my: 0, "margin-bottom": "4px" }}
			  />
			  {errors.USCEcity?.[subKey]  && <span className="validationerror">{errors.USCEcity?.[subKey] }</span>}
			</Grid>
			<Grid item xs={6}>
			 <div className="InputLabel" >Clinic Name</div>
			  <TextField
				variant="outlined"
				fullWidth
				value={subValue['USCEclinicname'] || ''}
				onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'USCEclinicname')}
				sx={{ my: 0, "margin-bottom": "4px" }}
			  />
			  {errors.USCEclinicname?.[subKey]  && <span className="validationerror">{errors.USCEclinicname?.[subKey] }</span>}
			</Grid>
			 <Grid item xs={6}>
              <div className="InputLabel">Speciality- in</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['ResearchSpecility'] || ''}
                    label="Speciality- in"
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'ResearchSpecility')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Internal Medicine'>Internal Medicine</MenuItem>
                    <MenuItem  value='Family Medicine'>Family Medicine</MenuItem>
                    <MenuItem  value='General Surgery'>General Surgery</MenuItem>
                    <MenuItem  value='Child Neurology'>Child Neurology</MenuItem>
                    <MenuItem  value='Obstetrics and Gynecology'>Obstetrics and Gynecology</MenuItem>
                    <MenuItem  value='Transitional Year'>Transitional Year</MenuItem>
                    <MenuItem  value='Radiology Diagnostic'>Radiology Diagnostic</MenuItem>
                    <MenuItem  value='Internal Medicine/ Pediatrics'>Internal Medicine/ Pediatrics</MenuItem>
                    <MenuItem  value='Neurology'>Neurology</MenuItem>
                    <MenuItem  value='Pediatrics'>Pediatrics</MenuItem>
                    <MenuItem  value='Psychiatry'>Psychiatry</MenuItem>
                    <MenuItem  value='Anesthesiology'>Anesthesiology</MenuItem>
                    <MenuItem  value='Pathology'>Pathology</MenuItem>
                    <MenuItem  value='Prelim Program'>Prelim Program</MenuItem>
                    <MenuItem  value='Other'>Other</MenuItem>
                  </Select>
                  {errors.ResearchSpecility && <span className="validationerror">{errors.ResearchSpecility}</span>}
                </FormControl>
              </Grid>
              {subValue?.['ResearchSpecility']==="Other" &&(
			 <Grid item xs={6}>
            	<div className="InputLabel" >Speciality Others Explain</div>
                  <TextField
                    label="Speciality Others Explain"
                    variant="outlined"
                    fullWidth
                    value={subValue['ResearchSpecilityOthers'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'ResearchSpecilityOthers')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.ResearchSpecilityOthers  && <span className="validationerror">{errors?.ResearchSpecilityOthers  }</span>}
            </Grid>
       )}
       <Grid item xs={6}>
            	<div className="InputLabel" >Name Of Preceptor</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={subValue['NameOfPreceptor'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'NameOfPreceptor')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.ResearchSpecilityOthers  && <span className="validationerror">{errors?.ResearchSpecilityOthers  }</span>}
            </Grid>
             <Grid item xs={6}>
              <div className="InputLabel">Hands On</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['HandsOn'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'HandsOn')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Tele'>Tele</MenuItem>
                    <MenuItem  value='Observership'>Observership</MenuItem>
                    <MenuItem  value='Combo'>Combo</MenuItem>
                  </Select>
                  {errors.ResearchSpecility && <span className="validationerror">{errors.ResearchSpecility}</span>}
                </FormControl>
              </Grid>
               <Grid item xs={6}>
              <div className="InputLabel">Status</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['Status'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'Status')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Not started'>Not started</MenuItem>
                    <MenuItem  value='Ongoing'>Ongoing</MenuItem>
                    <MenuItem  value='Completed'>Completed</MenuItem>
                  </Select>
                  {errors.ResearchSpecility && <span className="validationerror">{errors.ResearchSpecility}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
              <div className="InputLabel">USCE Notes</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['uscenotesdrop'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'uscenotesdrop')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Research'>Research</MenuItem>
                    <MenuItem  value='Job'>Job</MenuItem>
                    <MenuItem  value='Exam prep'>Exam prep</MenuItem>
                  </Select>
                  {errors.ResearchSpecility && <span className="validationerror">{errors.ResearchSpecility}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
            	<div className="InputLabel" >Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={subValue['FreeFlowNote'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'FreeFlowNote')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.FreeFlowNote  && <span className="validationerror">{errors?.FreeFlowNote  }</span>}
            </Grid>
			</Grid>
			</div>
       );
       })}

   </div>
   <div className="AddPaymentButton">
	   <Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"
		  onClick={() => AddMoreUSCE("USCENO","USCEDATA")}
		>
		  Add USCE
		</Button>
			</Box>
			</Grid>
		</div>

<div className="RotationAddedPayment MatchPayment" >
			<div className="TitleDiv">
			  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Work Experience:</b>  </Typography>
			</div>
			{Object.entries(StudentData?.['WorkExperienceData'] || {}).map(([subKey, subValue]) => {
   console.log("subValue?.['WorkExperienceData']?.label--->",subValue?.['WorkexperienceCountry']?.label);
   return (
   <div className="RotationAddedPaymentBody" >
				<Grid container spacing={2} sx={{ p: 1 }}>

				<Grid item xs={6}>
				  <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
					<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>WORK EXP NO:{Number(subKey.replace("WORKEXP",""))+1}</b>  <font color="blue"><b>  </b></font></Typography>
				</Box>
			</Grid>
			<Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"

		  onClick={() => DeleteMoreWork(subKey)}
		>
		  Delete Work
		</Button>
			</Box>
			</Grid>
		   <Grid item xs={6} >
			<div className="InputLabel" ></div>
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
			  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Work Experience From/To Date:</Typography>
			  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><RangePicker
	value={subValue['WorkexperienceDateRange']?.['from']?[dayjs(new Date(subValue['WorkexperienceDateRange']['from'].seconds * 1000)),dayjs(new Date(subValue['WorkexperienceDateRange']['to'].seconds * 1000))]:null}
   onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'WorkexperienceDateRange',subValue)}
	format={dateFormat} // Customize date format as needed
	scrollableYearDropdown  // Make year dropdown scrollable
	 yearDropdownItemNumber={50}
	 picker="date"
	variant="outlined"
  /></Typography>
			</Box>
			{errors?.WorkexperienceDateRange?.[subKey] && <span className="validationerror">{errors?.WorkexperienceDateRange?.[subKey]}</span>}
		  </Grid>
		  <Grid item xs={6}>
                  <div className="InputLabel">Country</div>
                <Select1
        value={subValue['WorkexperienceCountry'] || ''}
        onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'WorkexperienceCountry')}
        variant="outlined"
        options={allCountriesC}
        placeholder="Country"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.ResearchCountry  && <span className="validationerror">{errors.ResearchCountry }</span>}
              	</Grid>
       <Grid item xs={6}>
              <div className="InputLabel">Location(State)</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['WorkexperienceState'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'WorkexperienceState')}
                  >
                  <MenuItem  value="">=Select=</MenuItem>
                  {
                  Object.entries((subValue?.['WorkexperienceCountry'] && CountryWithStates["'"+subValue?.['WorkexperienceCountry']?.label+"'"]) ? CountryWithStates["'"+subValue?.['WorkexperienceCountry']?.label+"'"]?.['states']:{}).map(([subKeyS, subValueS]) => {

                  return (
                  <MenuItem  value={subValueS?.name}>{subValueS?.name}</MenuItem>
                  )})}

					</Select>
					</FormControl>
					{errors.WorkexperienceState?.[subKey]  && <span className="validationerror">{errors.WorkexperienceState?.[subKey] }</span>}
			</Grid>
			 <Grid item xs={6}>
              	 <div className="InputLabel" >Location(City)</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={subValue['Workexperiencecity'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'Workexperiencecity')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Workexperiencecity?.[subKey]  && <span className="validationerror">{errors.Workexperiencecity }</span>}
                </Grid>
                <Grid item xs={6}>
              	 <div className="InputLabel" > Name of hospital/clinic</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={subValue['Workexperienclinicname'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'Workexperienclinicname')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Workexperienclinicname?.[subKey]  && <span className="validationerror">{errors.Workexperienclinicname?.[subKey] }</span>}
                </Grid>
                 <Grid item xs={6}>
              <div className="InputLabel">Speciality- in</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['WorkexperienSpecility'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'WorkexperienSpecility')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Internal Medicine'>Internal Medicine</MenuItem>
                    <MenuItem  value='Family Medicine'>Family Medicine</MenuItem>
                    <MenuItem  value='General Surgery'>General Surgery</MenuItem>
                    <MenuItem  value='Child Neurology'>Child Neurology</MenuItem>
                    <MenuItem  value='Obstetrics and Gynecology'>Obstetrics and Gynecology</MenuItem>
                    <MenuItem  value='Transitional Year'>Transitional Year</MenuItem>
                    <MenuItem  value='Radiology Diagnostic'>Radiology Diagnostic</MenuItem>
                    <MenuItem  value='Internal Medicine/ Pediatrics'>Internal Medicine/ Pediatrics</MenuItem>
                    <MenuItem  value='Neurology'>Neurology</MenuItem>
                    <MenuItem  value='Pediatrics'>Pediatrics</MenuItem>
                    <MenuItem  value='Psychiatry'>Psychiatry</MenuItem>
                    <MenuItem  value='Anesthesiology'>Anesthesiology</MenuItem>
                    <MenuItem  value='Pathology'>Pathology</MenuItem>
                    <MenuItem  value='Prelim Program'>Prelim Program</MenuItem>
                    <MenuItem  value='Other'>Other</MenuItem>
                  </Select>
                  {errors.WorkexperienSpecility?.[subKey] && <span className="validationerror">{errors.WorkexperienSpecility?.[subKey]}</span>}
                </FormControl>
              </Grid>
               {subValue?.['WorkexperienSpecility']==="Other" &&(
			 <Grid item xs={6}>
            	<div className="InputLabel" >Speciality Others Explain</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={subValue['WorkexperienSpecilityOthers'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'WorkExperienceData',subKey,'WorkexperienSpecilityOthers')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.WorkexperienSpecilityOthers?.[subKey]  && <span className="validationerror">{errors?.WorkexperienSpecilityOthers?.[subKey]  }</span>}
            </Grid>
               )}
   </Grid>
   </div>
   )})}
   </div>
   <div className="AddPaymentButton">
	   <Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"

		  onClick={() => AddMoreUSCE("WORKEXP","WorkExperienceData")}
		>
		  Add Exp
		</Button>
			</Box>
			</Grid>
		</div>













       <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Research:</b>  </Typography>
                </div>

            {Object.entries(StudentData?.['ResearchData'] || {}).map(([subKey, subValue]) => (
        <div className="RotationAddedPaymentBody" >
				<Grid container spacing={2} sx={{ p: 1 }}>

               <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Research From/To Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><RangePicker
        value={subValue['ResearchDateRange']?.['from']?[dayjs(new Date(subValue['ResearchDateRange']['from'].seconds * 1000)),dayjs(new Date(subValue['ResearchDateRange']['to'].seconds * 1000))]:null}
       onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchDateRange')}
        format={dateFormat} // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Research From/To Date:"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors?.ResearchDateRange && <span className="validationerror">{errors?.ResearchDateRange}</span>}
              </Grid>
               <Grid item xs={6}>
                  <div className="InputLabel">Country</div>
                <Select1
        value={subValue['ResearchCountry'] || ''}
        onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchCountry')}
        variant="outlined"
        options={allCountriesC}
        placeholder="Country"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	{errors.ResearchCountry  && <span className="validationerror">{errors.ResearchCountry }</span>}
              	</Grid>
       <Grid item xs={6}>
              <div className="InputLabel">Location(State)</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['ResearchState'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchState')}
                  >
                  <MenuItem  value="">=Select=</MenuItem>
                  {
                  Object.entries((subValue?.['ResearchCountry'] && CountryWithStates["'"+subValue?.['ResearchCountry']?.label+"'"]) ? CountryWithStates["'"+subValue?.['ResearchCountry']?.label+"'"]?.['states']:{}).map(([subKeyS, subValueS]) => {

                  return (
                  <MenuItem  value={subValueS?.name}>{subValueS?.name}</MenuItem>
                  )})}

					</Select>
					</FormControl>
					{errors.ResearchState  && <span className="validationerror">{errors.ResearchState }</span>}
			</Grid>









                <Grid item xs={6}>
              	 <div className="InputLabel" >Location(City)</div>
                  <TextField
                    label="Location(City)"
                    variant="outlined"
                    fullWidth
                    value={subValue['Researchcity'] || ''}


                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'Researchcity')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Researchcity  && <span className="validationerror">{errors.Researchcity }</span>}
                </Grid>
                <Grid item xs={6}>
              	 <div className="InputLabel" > Name of hospital/clinic</div>
                  <TextField
                    label="Name of hospital/clinic"
                    variant="outlined"
                    fullWidth
                    value={subValue['Researchclinicname'] || ''}


                    onChange={(event) =>handleChangeStudentDetails(event,'ResearchData',subKey,'Researchclinicname')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Researchclinicname  && <span className="validationerror">{errors.Researchclinicname }</span>}
                </Grid>
                 <Grid item xs={6}>
              <div className="InputLabel">Speciality- in</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['ResearchSpecility'] || ''}
                    label="Speciality- in"
                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchSpecility')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Internal Medicine'>Internal Medicine</MenuItem>
                    <MenuItem  value='Family Medicine'>Family Medicine</MenuItem>
                    <MenuItem  value='General Surgery'>General Surgery</MenuItem>
                    <MenuItem  value='Child Neurology'>Child Neurology</MenuItem>
                    <MenuItem  value='Obstetrics and Gynecology'>Obstetrics and Gynecology</MenuItem>
                    <MenuItem  value='Transitional Year'>Transitional Year</MenuItem>
                    <MenuItem  value='Radiology Diagnostic'>Radiology Diagnostic</MenuItem>
                    <MenuItem  value='Internal Medicine/ Pediatrics'>Internal Medicine/ Pediatrics</MenuItem>
                    <MenuItem  value='Neurology'>Neurology</MenuItem>
                    <MenuItem  value='Pediatrics'>Pediatrics</MenuItem>
                    <MenuItem  value='Psychiatry'>Psychiatry</MenuItem>
                    <MenuItem  value='Anesthesiology'>Anesthesiology</MenuItem>
                    <MenuItem  value='Pathology'>Pathology</MenuItem>
                    <MenuItem  value='Prelim Program'>Prelim Program</MenuItem>
                    <MenuItem  value='Other'>Other</MenuItem>
                  </Select>
                  {errors.ResearchSpecility && <span className="validationerror">{errors.ResearchSpecility}</span>}
                </FormControl>
              </Grid>
              {subValue?.['ResearchSpecility']==="Other" &&(
			 <Grid item xs={6}>
            	<div className="InputLabel" >Speciality Others Explain</div>
                  <TextField
                    label="Speciality Others Explain"
                    variant="outlined"
                    fullWidth
                    value={subValue['ResearchSpecilityOthers'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchSpecilityOthers')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.ResearchSpecilityOthers  && <span className="validationerror">{errors?.ResearchSpecilityOthers  }</span>}
            </Grid>
       )}
              <Grid item xs={6}>
              	 <div className="InputLabel" >  Mentor's Name</div>
                  <TextField
                    label="Mentor's Name"
                    variant="outlined"
                    fullWidth
                    value={subValue['ResearchMentorsname'] || ''}


                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchMentorsname')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ResearchMentorsname  && <span className="validationerror">{errors.ResearchMentorsname }</span>}
                </Grid>
                 <Grid item xs={6}>
              	 <div className="InputLabel" >  publication/status</div>
                  <TextField
                    label="publication/status"
                    variant="outlined"
                    fullWidth
                    value={subValue['ResearchPublicationStatus'] || ''}


                    onChange={(event) => handleChangeStudentDetails(event,'ResearchData',subKey,'ResearchPublicationStatus')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ResearchPublicationStatus  && <span className="validationerror">{errors.ResearchPublicationStatus }</span>}
                </Grid>


       </Grid>
       </div>
       ))}
   <div className="AddPaymentButton">
	   <Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"
		  onClick={() => AddMoreUSCE("Research","ResearchData")}
		>
		  Add Exp
		</Button>
			</Box>
			</Grid>
		</div>





       </div>
              
        <Grid item xs={6}>
              <div className="InputLabel">Primary specialty applying this season</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                  multiple
                    value={toArray(StudentData?.PrimarySpecialtyApplyThisSeason)}
                    label="Primary specialty applying this season"
                    onChange={(event) => handleChangeStudentDetails(event,'PrimarySpecialtyApplyThisSeason')}
                  >
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Internal Medicine'>Internal Medicine</MenuItem>
                    <MenuItem  value='Family Medicine'>Family Medicine</MenuItem>
                    <MenuItem  value='General Surgery'>General Surgery</MenuItem>
                    <MenuItem  value='Child Neurology'>Child Neurology</MenuItem>
                    <MenuItem  value='Obstetrics and Gynecology'>Obstetrics and Gynecology</MenuItem>
                    <MenuItem  value='Transitional Year'>Transitional Year</MenuItem>
                    <MenuItem  value='Radiology Diagnostic'>Radiology Diagnostic</MenuItem>
                    <MenuItem  value='Internal Medicine/ Pediatrics'>Internal Medicine/ Pediatrics</MenuItem>
                    <MenuItem  value='Neurology'>Neurology</MenuItem>
                    <MenuItem  value='Pediatrics'>Pediatrics</MenuItem>
                    <MenuItem  value='Psychiatry'>Psychiatry</MenuItem>
                    <MenuItem  value='Anesthesiology'>Anesthesiology</MenuItem>
                    <MenuItem  value='Pathology'>Pathology</MenuItem>
                    <MenuItem  value='Prelim Program'>Prelim Program</MenuItem>
                    <MenuItem  value='Other'>Other</MenuItem>
                  </Select>
                  {errors.PrimarySpecialtyApplyThisSeason && <span className="validationerror">{errors.PrimarySpecialtyApplyThisSeason}</span>}
                </FormControl>
              </Grid>
				{toArray(StudentData?.PrimarySpecialtyApplyThisSeason).includes("Other") &&(
			 <Grid item xs={6}>
            	<div className="InputLabel" >Speciality Others Explain</div>
                  <TextField
                    label="Speciality Others Explain"
                    variant="outlined"
                    fullWidth
                    value={StudentData['PrimarySpecialtyApplyThisSeasonOthers'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'PrimarySpecialtyApplyThisSeasonOthers')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.PrimarySpecialtyApplyThisSeasonOthers  && <span className="validationerror">{errors?.PrimarySpecialtyApplyThisSeasonOthers  }</span>}
            </Grid>
       )}
                <Grid item xs={6}>
              	 <div className="InputLabel" >  Volunteering Experience(In months)</div>
                  <TextField
                    label=""
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={StudentData['VolunterringExperience'] || ''}


                    onChange={(event) => handleChangeStudentDetails(event,'VolunterringExperience')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.VolunterringExperience  && <span className="validationerror">{errors.VolunterringExperience }</span>}
                </Grid>
                 <Grid item xs={6} >
                    <FormControl fullWidth>
                      <div className="InputLabel">Do you have a US Masters (MS) Degree?</div>
                      <Select
                        required
                        value={StudentData['DoYouHaveMasters'] || ''}
                        label='Do you have a US Masters (MS) Degree?'
                        onChange={(event) => handleChangeStudentDetails(event,'DoYouHaveMasters')}
                      >
                       <MenuItem  value="">=Select=</MenuItem>
                        <MenuItem  value="yes">Yes</MenuItem>
                        <MenuItem  value="no">No</MenuItem>
                      </Select>
                      {errors.StudentTimeOfRotation  && <span className="validationerror">{errors.StudentTimeOfRotation }</span>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} >
                    <FormControl fullWidth>
                      <div className="InputLabel">ECFMG Certificate</div>
                      <Select
                        required
                        value={StudentData['ECFMGCertificate'] || ''}
                        label='ECFMG Certificate'
                        onChange={(event) => handleChangeStudentDetails(event,'ECFMGCertificate')}
                      >
                       <MenuItem  value="">=Select=</MenuItem>
                        <MenuItem  value="yes">Yes</MenuItem>
                        <MenuItem  value="no">No</MenuItem>
                      </Select>
                      {errors.StudentTimeOfRotation  && <span className="validationerror">{errors.StudentTimeOfRotation }</span>}
                    </FormControl>
                  </Grid>

                  {StudentData?.['ECFMGCertificate']==="yes" && (

						<Grid item xs={6}>
              <div className="InputLabel" > </div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Year ECFMG Certified:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={ StudentData['ECFMGCertificateDate']?dayjs(new Date(StudentData['ECFMGCertificateDate'].seconds * 1000)):null}
         yearDropdownItemNumber={50}
         picker="date"
  		name="ECFMGCertificateDate"
  		allowClear={false}
  		onChange={(event) => handleChangeStudentDetails(event,'ECFMGCertificateDate')}
      /></Typography>
                </Box>
                {errors.GraduationDate && <span className="validationerror">{errors.GraduationDate}</span>}
              </Grid>

                  )}
                {/*<Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <TextField
                    label="Will you be a medical student at the time of your rotation?"
                    variant="outlined"
                    name="StudentTimeOfRotation"
                    fullWidth
                    value={rotationValues['StudentTimeOfRotation']}
                    required
                    onChange={(event) => handleRotationChange(event,'StudentTimeOfRotation')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentTimeOfRotation  && <span className="validationerror">{errors.StudentTimeOfRotation }</span>}
                </Grid>*/}
                <Grid item xs={6} >
                    <FormControl fullWidth>
                      <div className="InputLabel">Will you be a medical student at the time of your rotation?</div>
                      <Select
                        required
                        value={StudentData['StudentTimeOfRotation'] || ''}
                        label='Will you be a medical student at the time of your rotation?'
                        onChange={(event) => handleChangeStudentDetails(event,'StudentTimeOfRotation')}
                      >
                        <MenuItem  value="yes">Yes</MenuItem>
                        <MenuItem  value="no">No</MenuItem>
                        <MenuItem  value="unsure">Unsure</MenuItem>
                      </Select>
                      {errors.StudentTimeOfRotation  && <span className="validationerror">{errors.StudentTimeOfRotation }</span>}
                    </FormControl>
                  </Grid>
                   <Grid item xs={6}>
                <FormControl fullWidth>
                	 <div className="InputLabel" >Year you are applying for Residency</div>
                  <Select
                    value={StudentData['YearYouAreApplyingForResidency'] || ''}
                    valueD={StudentData['YearYouAreApplyingForResidency']}
                    label="Year you are applying for Residency"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'YearYouAreApplyingForResidency')}
                  >
                    {MatchSessionList.map((item) => (
                      <MenuItem key={item} value={item}>
                        {`Match Season `+item+` (Sept `+(item-1)+`)`}
                      </MenuItem>

                    ))}
                    <MenuItem  value='Undecided/Later'>
                        Undecided/Later
                      </MenuItem>
                  </Select>
                  {errors.matchSeason && <span className="validationerror">{errors.matchSeason}</span>}
                </FormControl>
              </Grid>
               <Grid item xs={6}>
                <FormControl fullWidth>
                	 <div className="InputLabel" >Do You Have Home Country Residency?</div>
                  <Select
                    value={StudentData['HomeCountryResidencyOption'] || ''}
                    label="Do You Have Home Country Residency"
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'HomeCountryResidencyOption')}
                  >
                      <MenuItem key="no" value="no">No</MenuItem>
                      <MenuItem key="yes" value="yes">Yes</MenuItem>
                  </Select>
                  {errors.HomeCountryResidencyOption && <span className="validationerror">{errors.HomeCountryResidencyOption}</span>}
                </FormControl>
              </Grid>
              {StudentData?.['HomeCountryResidencyOption'] === 'yes' && (
              <>
                <Grid item xs={6}>
                <div className="InputLabel" >Home Country Specility.</div>
                  <TextField
                    label=""
                    variant="outlined"
                    name="HomeCountrySpecility"
                    fullWidth
                    value={StudentData?.['HomeCountrySpecility'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'HomeCountrySpecility')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HomeCountryResidencyOption  && <span className="validationerror">{errors.HomeCountryResidencyOption }</span>}
                </Grid>
                <Grid item xs={6}>
                <div className="InputLabel" >Home Country Specility Additional Details.</div>
                  <TextField
                    label=""
                    variant="outlined"
                    name="HomeCountrySpecilityAdditionalDetails"
                    fullWidth
                    value={StudentData?.['HomeCountrySpecilityAdditionalDetails'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'HomeCountrySpecilityAdditionalDetails')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HomeCountrySpecilityAdditionalDetails  && <span className="validationerror">{errors.HomeCountrySpecilityAdditionalDetails }</span>}
                </Grid>
                </>
              )}
                {/* <Grid item xs={6}>
                 <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Year you are applying for Residency:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        //value={moment(rotationValues['GraduationDate'])}
        value={ StudentData['YearYouAreApplyingForResidency']?dayjs(StudentData['YearYouAreApplyingForResidency']):null}
        dateFormat="YYYY-MM" // Customize date format as needed
        actualdate={StudentData['YearYouAreApplyingForResidency']}
         yearDropdownItemNumber={50}
         picker="month"
  		name="YearYouAreApplyingForResidency"
  		allowClear={true}
  		onChange={(event) => handleChangeStudentDetails(event,'YearYouAreApplyingForResidency')}
      /></Typography>
                </Box>
                {errors.YearYouAreApplyingForResidency && <span className="validationerror">{errors.YearYouAreApplyingForResidency}</span>}
              </Grid>*/}
                </Grid>

          <Grid className="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}

            >
              Update
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
