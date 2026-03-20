import React, { useEffect, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { CountryWithStates } from "../../apis/countriesWithStates";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
const dateFormat="MM/DD/YYYY";
import { CFormCheck } from '@coreui/react'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Select1 from 'react-select';
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { USA_States } from "../../apis/usa_states";
//const admin = require('firebase-admin');

import {
Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Paper,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
import PlatinumMentorShip from "../admin/PlatinumMentorShip";
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
let MyTotalEarnings=0;
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
let Newway=false;
let whatsappurl="";
let LockProfile=false;
 	let indexLetter=0;
 	let NotesIndexMain=0
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
let MentorOptionsList=[];
let medicalSchoolOptionsList = [
      ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
      { value: 'Others', label: 'Others' }
    ];
const Step1ScoreDropDown= {'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
const Step2ScoreDropDown= {'Score':'Score','Not taken':'Not taken'}
const UserDetails =  (ActualAuthUser) => {
console.log("ActualAuthUser=====>",ActualAuthUser)
const ActualUser=ActualAuthUser.ActualUser;
const navigate = useNavigate();
 const { showLoading, hideLoading,deleteFieldFromDocument,SelectWithComplexConditionsJoin, API_KEY,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,Timestamp,FetchUniqueData,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser,TooltipsPopovers } = useLoading();
	let { id } = useParams();
	let idWithoutChange=id;
	console.log("id======>",id)
	if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}
	const [copied, setCopied] = useState(false);
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [matchSeason, setMatchSeason] = useState('');
	 const [status, setStatus] = useState('');
	 const [Notes, setNotes] = useState({});
	const [plan, setPlan] = useState('');
	const [StudentData, setStudentData] = useState({});
	const [StudentDataReferral, setStudentDataReferral] = useState({});
	const [LocationState, setLocationState] = useState(null);
	 const [MatchcreatedAtexists, setMatchcreatedAtexists] = useState(false);
	const [MatchPlanListObject, setMatchPlanListObject] = useState({});
	const [LocationCity, setLocationCity] = useState([{value:'',label:'-None-',FieldName:"LocationCity"}]);
	const [LocationCode, setLocationCode] = useState([{value:'',label:'-None-',FieldName:"LocationCode"}]);
	const [open, setOpen] = useState(false);
	const [MatchValues, setMatchValues] = useState(null);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const [NoteSectionData, setNoteSectionData] = useState([]);
	const [UserServicesTaken, setUserServicesTaken] = useState({});
	const [rotationValues, setrotationValues] = useState({});
  	const [researchValues, setresearchValues] = useState({});
  	const [menuOpen, setMenuOpen] = useState(false);
  	const [services, setServices] = useState([]);
	const [checkedStates, setCheckedStates] = useState({
    match: false,
    rotation: false,
    research: false,
  });
	const mainCollectionName = 'UsersRoles';
  	const joinCollectionName = 'Users';
  	const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };
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

    }
    setStudentData(StudentData);
  }, [StudentData['CountryOfMedicalSchool']]);
  const handleCopy = async (url,which) => {
    await navigator.clipboard.writeText(url);
    setCopied(which);
    setTimeout(() => setCopied(false), 2000);
  };
  const fetchUserData = async () => {
  showLoading()
  	const LocationStates = await FetchUniqueData("Rotations","state");
  	setMatchValues({Payments:[{Discount:{
      Value: '',
      Code: '',
      Amount: '',
      Notes: ''
    },FeeType:'',ModeOfPayment:'',Amount:'',PaymentDate:'',RotationPaymentNotes:''}],
    Platinum:{Meetings:[]},
    Refund:{
      RequestedDate: '',
      ProcessedDate: '',
      Reason: '',
      Channel: '',
      Note:''
    },PaymentPlan:'',EnrollmentDate:'',RotationFeesToSarthi:''});
  	const options = LocationStates.map(location_code => ({ value: location_code, label: location_code ,FieldName:"LocationState"}));
  	options.unshift({value:'',label:'-None-',FieldName:"LocationState"});
  	setLocationState(options)
  	const userDataSelected = await FetchDataFromCollection("Users", 20, "uid", "==", id, 0);
  	console.log("userDataSelected--->",userDataSelected)
        const userDataSelectedAgent = await FetchDataFromCollection("AgentUserConnection", 20, "uid", "==", id, 0);
        console.log("userDataSelectedAgent--->",userDataSelectedAgent)
        const resultServices = await FetchDataFromCollection("ReferralDiscounts",200,"service","!=","",0);
        console.log("resultServices--->",resultServices)
        let ServicesList=[];
        if(userDataSelected[0])
        {
          setStudentDataReferral(userDataSelected[0]);
          const phoneNumber ="919306193724"; // ✅ Replace with your WhatsApp number (country code + number)
    		const message = encodeURIComponent(`Hello Sarthi Team, I Want to promote your services my email is:${userDataSelected[0].email}`);
    
    // Opens WhatsApp (mobile or desktop)
    	whatsappurl = `https://wa.me/${phoneNumber}?text=${message}`;
          //console.log("StudentDataReferral----->",StudentDataReferral)
        }
        if(resultServices.length)
        {
          for (const item of resultServices) {
            ServicesList[item.id]=item;
          }
           setServices(ServicesList);
        }
         if(typeof userDataSelected[0]?.ReferralObject!="undefined" && typeof userDataSelected[0]?.ReferralObject?.Settings!="undefined")
        	{
        	  console.log("userDataSelected[0].ReferralObject?.Settings----->",userDataSelected[0].ReferralObject?.Settings)
        	  
        	  let ServicesListExisting=[];
        	  Object.entries(userDataSelected[0].ReferralObject?.Settings).map(([key, value]) => {
        	    ServicesListExisting.push(value.service)
        	    //console.log("key====>",key)
        	    //ServicesList.push(value)
        	    ServicesList[key]=value;
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
        		userDataSelected[0].AsignedToAgentId = userDataSelectedAgent[0].AsignedToAgentId;
          		userDataSelected[0].AsignedToAgentName = userDataSelectedAgent[0].AsignedToAgentName;
        	}

        }
        const UserServicesSelected = await FetchDataFromCollection("UserServices", 20, "__name__", "==", id, 0);
        setUserServicesTaken(UserServicesSelected[0]);
        /*const UserServicesSelected = await FetchDataFromCollection("UserServices", 20, "__name__", "==", id, 0);
        console.log("UserServicesSelected====>",UserServicesSelected)
        if(UserServicesSelected.length > 0)
        {
        	Newway=true;
        	if(typeof UserServicesSelected[0]?.RotationData?.Rotations!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertRotationsObjectToArray(doc));

        		UserServicesSelected[0].RotationData.Rotations=convertedData[0].RotationData.Rotations;
        		//if(UserServicesSelected[0].RotationData.Rotations=convertedData[0].RotationData.Rotations)

        	}
        	if(typeof UserServicesSelected[0]?.Match!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertMatchObjectToArray(doc));
        		UserServicesSelected[0].Match=convertedData[0].Match;
        	}
        	if(typeof UserServicesSelected[0]?.Research!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertResearchObjectToArray(doc));
        		UserServicesSelected[0].Research=convertedData[0].Research;
        	}
        }
        //userDataSelected[0]["Services"]={};
		if(UserServicesSelected.length > 0)
		{
			 userDataSelected[0]["Services"]=UserServicesSelected[0];
			 setUserServicesTaken(UserServicesSelected[0]);
		}*/
        if(typeof userDataSelected[0]["Services"]!="undefined")
        {
        	if(typeof userDataSelected[0]["Services"]['Research']!="undefined")
       		{
       			 setresearchValues({Research:userDataSelected[0]["Services"]['Research']})
       		}

        	if(typeof userDataSelected[0]["Services"]['RotationData']!="undefined")
       		{
       			 setrotationValues(userDataSelected[0]["Services"]['RotationData'])

       		}
       		else
       		{
       			rotationValues['GraduationDate']="";
        		rotationValues['Step1Score']={};
       			rotationValues['Step2Score']={};
        		rotationValues['Step3Score']={};
        		//rotationValues['Step1Score']['Values']={'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
        		rotationValues['Step1Score']['Selected']={'Name':'','Value':''};
        		//rotationValues['Step2Score']['Values']={'Score':'Score','Not taken':'Not taken'};
        		rotationValues['Step2Score']['Selected']={'Name':'','Value':''};
        		//rotationValues['Step3Score']['Values']={'Score':'Score','Not taken':'Not taken'};
       			rotationValues['Step3Score']['Selected']={'Name':'','Value':''};
        		rotationValues['NameOfMedicalSchool']='';
        		rotationValues['CountryOfMedicalSchool']='';
       			rotationValues['PriorUSCE']='';
       			rotationValues['StudentTimeOfRotation']='';
       			rotationValues['YearYouAreApplyingForResidency']='';
       			rotationValues['Rotations']=[];
       			setrotationValues(rotationValues);
       		}
        	//if(typeof userDataSelected[0]["PaymentsDetails"]['Matchplan']
        	//setPlan(userDataSelected[0]["Services"]?.Match?.Plan?.Name || '')
			//setMatchSeason(userDataSelected[0]["Services"]?.Match?.Season || '')
				//setStatus(userDataSelected[0]["Services"]?.Match?.Status?.Name || '');
			//setNotes(userDataSelected[0]["Services"]?.Match?.Notes)
			/*if(userDataSelected[0]["Services"]?.Match?.createdAt)
			{
				setMatchcreatedAtexists(true);
			}
			if(userDataSelected[0]["Services"]?.Match)
			{
				if(typeof userDataSelected[0]["Services"]['Match']['Platinum']==="undefined")
				{
					userDataSelected[0]["Services"]['Match']['Platinum']={'Meetings':[]};

				}
				setMatchValues(userDataSelected[0]["Services"]['Match']);
			}

			if(userDataSelected[0]["Services"]?.Match?.Plan?.Name==="Custom")
			{
				setCustomPlan(userDataSelected[0]["Services"]?.Match?.Plan?.Relation?.Value || '')
			}
			else if(userDataSelected[0]?.Services?.Match?.Plan?.Name==='SilverInteractive')
			{
				setSilverInteractiveMocks(userDataSelected[0]["Services"]?.Match?.Plan?.Relation?.Value || '')
			}
			else if(userDataSelected[0]?.Services?.Match?.Plan?.Name==='SilverOnDemand')
			{

				setSilverOnDemandMocks(userDataSelected[0]["Services"]?.Match?.Plan?.Relation?.Value || '')
			}
			if(userDataSelected[0]["Services"]?.Match?.Status?.Name==="NotApplying")
			{
				setMatchStatusNotApplyingSelected(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value || '')
				if(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value==="Other")
				{
					setFutureApplicationSeasonCustomNote(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Other || '')
				}

			}*/

        }
        else
        {
        	rotationValues['GraduationDate']="";
        rotationValues['Step1Score']={};
        rotationValues['Step2Score']={};
        rotationValues['Step3Score']={};
        rotationValues['Step1Score']['Values']={'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
        rotationValues['Step1Score']['Selected']={'Name':'','Value':''};
        rotationValues['Step2Score']['Values']={'Score':'Score','Not taken':'Not taken'};
        rotationValues['Step2Score']['Selected']={'Name':'','Value':''};
        rotationValues['Step3Score']['Values']={'Score':'Score','Not taken':'Not taken'};
        rotationValues['Step3Score']['Selected']={'Name':'','Value':''};
        rotationValues['NameOfMedicalSchool']='';
        rotationValues['CountryOfMedicalSchool']='';
       	rotationValues['PriorUSCE']='';
       	rotationValues['StudentTimeOfRotation']='';
       	rotationValues['YearYouAreApplyingForResidency']='';
       	rotationValues['Rotations']=[];
       	//setrotationValues(rotationValues);
        }
const adminOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Admin");
//const mentorOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Mentor");

   adminOptions.data.map((item) => {
    AdminOptionsList.push({label:item.displayName,value:item.id});
    return "h";
    })

     const MatchPlanList = await FetchDataFromCollection("MatchPlans", 20, null, null, null, 0);
    const MatchPlanListObj = {};
         MatchPlanList.map(async item => {
          MatchPlanListObj[item.id] = item;
        });
        setMatchPlanListObject(MatchPlanListObj);
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
        	userDataSelected[0]['NameOfMedicalSchool']='';
        	userDataSelected[0]['CountryOfMedicalSchool']='';
       		userDataSelected[0]['PriorUSCE']='';
       		userDataSelected[0]['StudentTimeOfRotation']='';
       		userDataSelected[0]['YearYouAreApplyingForResidency']='';
    	}
    	const  conditionsArrayNote =
    		[
  				[
    				{ name: "uid", condition: "==", value: id },
    				{ name: "ActionItem", condition: "in", value: ["For Student","For Both"] }
  				]
			];
        const NoteSectionDataObj =await SelectWithComplexConditionsJoin("NotesSectionMatch",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        if(NoteSectionDataObj.status=="success")
        {
        	if(NoteSectionDataObj.data.length)
        	{
        		setNoteSectionData(NoteSectionDataObj.data)
        	}

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
    	if(userDataSelected[0]?.['servicesChoosen']?.lockstudentprofile)
    	{
    		LockProfile=true;
    	}
    	console.log("userDataSelected[0]------>",userDataSelected[0])
       setStudentData(userDataSelected[0])
    	setInitialData(userDataSelected[0]);
    	 hideLoading();

    };

	const handleCancel = () => {
    setOpen(false);
  };
  const handleMatchSeasonChange = (event) => {
    setMatchSeason(event.target.value);
  };
  const convertRotationsObjectToArray = (rotationData) => {
  // Check if rotationData contains the Rotations field and if it's an object
  if (rotationData && rotationData.RotationData && rotationData.RotationData.Rotations && typeof rotationData.RotationData.Rotations === 'object') {
    // Convert the map to an array
    const rotationsArray = Object.keys(rotationData.RotationData.Rotations).map(key => {
      const rotation = rotationData.RotationData.Rotations[key];

      // Convert RotationPayment from object to array if it exists
      if (rotation && rotation.RotationPayment && typeof rotation.RotationPayment === 'object') {
        rotation.RotationPayment = Object.keys(rotation.RotationPayment).map(paymentKey => rotation.RotationPayment[paymentKey]);
      }

      return rotation;
    });

    return {
      ...rotationData,
      RotationData: {
        ...rotationData.RotationData,
        Rotations: rotationsArray,
      },
    };
  }

  // If Rotations is not an object, return rotationData as is
  return rotationData;
};
const convertMatchObjectToArray = (matchData) => {
  // Check if matchData contains the Match field and if it's an object
  if (matchData && matchData.Match && typeof matchData.Match === 'object') {
    // Convert the Payments object to an array
    if (matchData.Match.Payments && typeof matchData.Match.Payments === 'object') {
      matchData.Match.Payments = Object.keys(matchData.Match.Payments).map(paymentKey => matchData.Match.Payments[paymentKey]);
    }

    // Return the updated matchData
    return {
      ...matchData,
      Match: {
        ...matchData.Match, // Ensure we keep other properties of Match intact
      },
    };
  }
  // If Match is not an object, return matchData as is
  return matchData;
};
const convertResearchObjectToArray = (rotationData) => {
  // Check if rotationData contains the Research field and if it's an object
  if (rotationData && rotationData.Research && typeof rotationData.Research === 'object') {
    // Convert the map to an array
    const rotationsArray = Object.keys(rotationData.Research).map(key => {
      const rotation = rotationData.Research[key];

      // Convert Payments from object to array if it exists
      if (rotation && rotation.Payments && typeof rotation.Payments === 'object') {
        rotation.Payments = Object.keys(rotation.Payments).map(paymentKey => rotation.Payments[paymentKey]);
      }

      return rotation;
    });

    return {
      ...rotationData,
      Research: rotationsArray, // Replace Research object with the new array
    };
  }

  // If Research is not an object, return rotationData as is
  return rotationData;
};
const convertMatchArrayToObject = (matchData) => {
  // Check if matchData exists and if Payments is an array
  const matchDatain=matchData;
  if (matchDatain && Array.isArray(matchDatain.Payments)) {
    // Convert Payments array back to an object
    matchDatain.Payments = matchDatain.Payments.reduce((acc, payment, index) => {
      const paymentKey = `Payment${index}`;
      acc[paymentKey] = payment;
      return acc;
    }, {});
  }

  return matchDatain;
};
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
  	const  getStatesByCountryName = async (countryName)=> {
  const country = CountryWithStates.find(c => c.name === countryName);
  return country ? country.states : null; // Return states if country is found, else null
};
	const handleChangeStudentDetails = async (event,name="",loop=-1,paymentIndex=-1,val)=>{

  		let value;
  		console.log("event---->",event)
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
console.log("name---->",name)
console.log("loop---->",loop)
console.log("paymentIndex---->",paymentIndex)
console.log("val---->",value)
  	if (value === "Not taken" && (name==='Step1Score'))
  	{
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
    value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
    	setInitialData((prevValues) => ({
        ...prevValues,
        GraduationDate: value,
      }));
    	setStudentData((prevValues) => ({
        ...prevValues,
        GraduationDate: value,
      }));
      console.log("value=======>",value)
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
     else if(name==='LocationState')
    {
    	console.log("LocationState=======>",value)
    	if(value.value!=="")
    	{
    		let RotationCities = await FetchDataFromCollection("Rotations", 20, "state", "==", value.value, 0);
    		console.log("RotationCities------->",RotationCities)
    		const uniqueCities = [...new Set(RotationCities.map(rotationdata => rotationdata.city))];

const options = uniqueCities.map(city => ({
  value: city,
  label: city,
  FieldName: "LocationCity"
}));
  				options.unshift({value:'',label:'-None-',FieldName:"LocationCity"});

  				setLocationCity(options)

    	}
    	setStudentData((prevValues) => ({
        ...prevValues,
        LocationState: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        LocationState: value,
      }));
    }
     else if(name==='LocationCity')
    {
    	if(value.value!=="")
    	{
    		let RotationCodes = await FetchDataFromCollection("Rotations", 20, "city", "==", value.value, 0);
    		console.log("RotationCodes------->",RotationCodes)
    		const uniqueCodes = [...new Set(RotationCodes.map(rotationdata => rotationdata.location_code))];

const options = uniqueCodes.map(codes => ({
  value: codes,
  label: codes,
  FieldName: "LocationCodes"
}));
  				options.unshift({value:'',label:'-None-',FieldName:"LocationCodes"});

  				setLocationCode(options)
    	}
    	setStudentData((prevValues) => ({
        ...prevValues,
        LocationCity: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        LocationCity: value,
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
    else if(name==='redflag')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        redflag: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        redflag: value,
      }));
      setMenuOpen(false);
    }
    else if(name==='HomeCountryResidencyOption')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        HomeCountryResidencyOption: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        HomeCountryResidencyOption: value,
      }));
    }
    else if(name==='HDUGAU')
    {
    	setStudentData((prevValues) => ({
        ...prevValues,
        HDUGAU: value,
      }));
      setInitialData((prevValues) => ({
        ...prevValues,
        HDUGAU: value,
      }));
      setMenuOpen(false);
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

      checkForChanges(name, value);
	}
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    var dataTobesend={};
    if (Object.keys(validationErrors).length === 0) {
    	 showLoading()
    	try {
      //await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard or show a success message
      		/*var dataTobesendAgent={
        AsignedToAgentId: StudentData.AdminInTouch.value, // Replace 'fieldName' with the actual field you want to update
        AsignedToAgentName: StudentData.AdminInTouch.label,
        uid: id
      }
    		handleUpdate("AgentUserConnection",id,dataTobesendAgent);*/
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
      		console.log("result--->",StudentData)
      		await deleteFieldFromDocument("Users",id,"WorkExperienceData");
      		await deleteFieldFromDocument("Users",id,"USCEDATA");
			handleUpdate("Users",id,StudentData).then((result) => {
     		hideLoading();
     		 NoteSectionData.forEach(async(NotesOb,NotesInd) => {
     let re;
     	NotesOb.uid=id
		if(NotesOb.id)
		{
			 re=await handleUpdateOrCreateByField("NotesSectionMatch","id",NotesOb.id,NotesOb)
		}
		else
		{
			 re=await handleUpdateOrCreateByField("NotesSectionMatch","uid",null,NotesOb)
		}
		console.log("re------->",re)
    })
     		/*let dataTobesendS={};
     		dataTobesendS['RotationData']={};
     		//dataTobesendS['RotationPayment']=[];
     		dataTobesendS['uid']=id;
     		dataTobesendS['RotationData']['Rotations']={};
     		dataTobesendS['RotationData']['Rotations']['Rotation0']={StartDate:StudentData['RotationStartDate'],LocationCode:StudentData['LocationCode']};
     		dataTobesendS['RotationData']['Rotations']['Rotation0']['RotationPayment']={};
     		handleUpdate("UserServices",id,dataTobesendS).then((result) => {
     		console.log("result-=====>",dataTobesendS)
     		})*/
     		//deleteUser(id,"Users",StudentData.email)
     		console.log("result--->",result)
     		setOperationStatus( result.status)
     		setOperationMessage(result.message);
     		setOpen(true);
     	});

    } catch (error) {
    	console.log("error=======>",error)
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
      hideLoader();
    }
    }
    else
    {
    	TooltipsPopovers("error","You Have Require Fields Missing ,Please Fill Required Details","Status")
    }
	}
	const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const HandlePlatinumChange = (event,name,hasrelation=false,subname="") =>{
let value;
	if(typeof event.target!="undefined")
  {
  	value=event.target.value;
  }
  else if(typeof event.$d!="undefined")
  {
  	value=event.toLocaleString('en-GB', { timeZone: 'GMT' });
  }
  else if(typeof event.label!="undefined")
  {
  	value=event;
  }
  else
  {
  	 value=event.label;
  }
if(typeof MatchValues['Platinum']=="undefined")
{
	MatchValues['Platinum']={Meetings:[]};
}

      let newval=MatchValues['Platinum'];
      if(hasrelation && subname==="")
      {
      	if(typeof newval[name]==="undefined")
      	{
      		newval[name]={};
      	}
      	newval[name]['Value']=value;
      }
      else if(hasrelation && subname!=="")
      {
      	if(typeof newval[name]['Relation']==="undefined")
      	{
      		newval[name]['Relation']={};
      	}
      	newval[name]['Relation'][subname]=value;
      }
      else
      {
      	newval[name]=value;
      }

    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Platinum': newval,
      }));
}
const DeleteMeetings =  (rotationindex)=>{
	setMatchValues((prevValues) => {
    // Create a copy of the current rotations
    let newRotations = prevValues['Platinum'];
    let newRotations2 = newRotations['Meetings'];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedRotation = newRotations2.filter((_, index) => index !== rotationindex);
    // Update the specific RotationPayment array in the copied rotations
    newRotations['Meetings'] = updatedRotation;

    // Return the new state
    return {
      ...prevValues,
      Platinum: newRotations,
    };
  });

}
const HandlePlatinumMeetingsChange = (event,name,hasrelation=false,subname="",index) =>{

let value;
	if(typeof event.target!="undefined")
  {
  	value=event.target.value;
  }
  else if(typeof event.$d!="undefined")
  {
  	value=event.toLocaleString('en-GB', { timeZone: 'GMT' });
  }
  else if(typeof event.label!="undefined")
  {
  	value=event;
  }
  else
  {
  	 value=event.label;
  }
	if(typeof MatchValues['Platinum']==="undefined")
	{
		MatchValues['Platinum']={Meetings:[]};
	}
	else if(typeof MatchValues['Platinum']['Meetings']==="undefined")
	{
		MatchValues['Platinum']['Meetings']=[];
	}
	let newval1=MatchValues['Platinum'];
	let newval=newval1['Meetings'];
	if(typeof newval[index]==="undefined")
	{
		newval[index]={};
	}
      if(hasrelation && subname==="")
      {
      	if(typeof newval[index][name]==="undefined")
      	{
      		newval[index][name]={};
      	}
      	newval[index][name]['Value']=value;
      }
      else if(hasrelation && subname!=="")
      {
      	if(typeof newval[index][name]['Relation']=="undefined")
      	{
      		newval[index][name]['Relation']={};
      	}
      	newval[index][name]['Relation'][subname]=value;
      }
      else
      {
      	newval[index][name]=value;
      }
		newval1['Meetings']=newval;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Platinum': newval1,
      }));
}
const AddMeetings = (MeetingIndex) =>{
  if(typeof MatchValues['Platinum']==="undefined")
  {
  		MatchValues['Platinum']={'Meetings':[]}
  		setMatchValues(MatchValues);
  }
  else if(typeof MatchValues['Platinum']?.['Meetings']==="undefined")
  {
  	MatchValues['Platinum']['Meetings']=[]
  	setMatchValues(MatchValues);
  }
  	const newRotations = MatchValues['Platinum'];
  	const newMeetings=newRotations['Meetings']
  newMeetings.push({
  });
  newRotations['Meetings']=newMeetings;
  setMatchValues((prevValues) => ({
    ...prevValues,
    Platinum: newRotations,
  }));
  }
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
   /*	if(typeof StudentData['AdminInTouch']==='undefined')
    {
    	errors.AdminInTouch="Please Select Admin In Touch Of Student.";
    }*/
    /*if(StudentData['GraduationDate']==="")
    {
    	errors.GraduationDate="Please Select Date Of Graduation";
    }*/
    /*if(StudentData['ScoreData']?.['Step1Score']?.['Selected']?.['Name']==="")
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
    if(( typeof StudentData?.['LocationCode']?.['value']==="undefined" ||  StudentData?.['LocationCode']?.['value']===""))
    {
    	errors.LocationCode="Please Select Rotation State -> Rotation City and Then -> Location Code";
    }
    if(( typeof StudentData?.['RotationStartDate']?.['seconds']==="undefined" ||  StudentData?.['RotationStartDate']?.['seconds']===""))
    {
    	errors.RotationStartDate="Please Select Rotation Start Date.";
    }*/
    return errors;
  };
 /*  const AddNotesSection = (index) => {
 setNoteSectionData((prevData) => {
    const updatedNotes = [...prevData]; // Clone the existing array
    updatedNotes.splice(index, 0, {
      NotesDate: Timestamp.fromDate(new Date()), // Firestore Timestamp with the current date
      NoteType: '', // Add any other required fields with default values
      TeamMember: '',
      Notes: '',
      ActionItem: 'For Both',
      AddedBy:{displayName:ActualUser.displayName,email:ActualUser.email,id:ActualUser.id,UserType:"Student"}
    });
    return updatedNotes;
  });
};*/
const AddNotesSection = (index) => {
  setNoteSectionData((prevData) => {
    const updatedNotes = [
      {
        NotesDate: Timestamp.fromDate(new Date()), // Firestore Timestamp with the current date
        NoteType: '', // Add any other required fields with default values
        TeamMember: '',
        Notes: '',
        ActionItem: 'For Both',
        AddedBy: {
          displayName: ActualUser.displayName,
          email: ActualUser.email,
          id: ActualUser.id,
          UserType: "Student",
        },
      },
      ...prevData, // Spread the existing notes to keep them in the list
    ];
    return updatedNotes;
  });
};

const DeleteNotesSec = async (Index) => {
  try {
  showLoading();
    // Ensure the note has an `id` before attempting to delete
    const noteToDelete = NoteSectionData[Index];
    if(noteToDelete?.AddedBy?.id===ActualUser.id)
    {
    	if (noteToDelete?.id)
    	{
      		// Call the Firestore function to delete the document by ID
      		await deletedocumentfromid("NotesSectionMatch", noteToDelete.id);
    	}

    	// Update the local state to remove the deleted note
    	setNoteSectionData((prevData) => {
      	const updatedNotes = [...prevData];
      	updatedNotes.splice(Index, 1); // Remove the note at the specified index
      	return updatedNotes;
    	});
    	console.log(`Deleted note at index ${Index} successfully.`);
    }
    else
    {
    	setOperationMessage("You Are Not Authorized To Delete Notes Owned By="+noteToDelete?.AddedBy?.displayName);
    	setOpen(true);
    }



  } catch (error) {
    console.error(`Failed to delete note at index ${Index}:`, error);
  }
  hideLoading();
};
const HandleNotesSectionChange = (event,name,Index) =>{
	let value;
	if(typeof event?.[0]!="undefined")
  	{
  		value=event;
  	}
	else if(typeof event.target!="undefined")
  	{
  		value=event.target.value;
  	}
  	else if(typeof event.$d!="undefined")
  	{
  		value=event.toLocaleString('en-GB', { timeZone: 'GMT' });
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
  		console.log("name----->",name)
  		console.log("Index----->",Index)
  		console.log("value----->",value)
  		console.log("event----->",event)
  	 setNoteSectionData((prevValues) => {
    const updatedNotes = [...prevValues];
    updatedNotes[Index] = {
      ...updatedNotes[Index],
      [name]: value
    };

    return updatedNotes;
  });
}

const handlePlanChange = (event) => {
    setPlan(event.target.value);
  };


	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>

      {typeof idWithoutChange !== 'undefined' && (
      <button
      onClick={handleBack}
      style={buttonStyle}
      onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
      onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
    >
      Go Back
    </button>
    )}
    {StudentDataReferral?.servicesChoosen?.enablestudentreferral ? (
    
    
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
    ) : (<Box
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
          At this time you are not eligible to earn Referral discounts. However if you are interested, please get in touch with the Sarthi team <a href={whatsappurl} target="_blank">Here</a> to activate this feature and start earning. 
        </Typography>
        </Paper>
        </Box>)}
      <div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Referral Earnings:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<TableContainer component={Paper} sx={{ mt: 2 }}>
  <Table size="small" sx={{ border: "1px solid #ddd" }}>
    <TableHead sx={{ backgroundColor: "#1976d2" }}>
      <TableRow>
        <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
          Referral Email
        </TableCell>
        <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
          User Name
        </TableCell>
        <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
          Registration Date
        </TableCell>
        <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
          User Payments
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {Object.values(StudentDataReferral?.ReferralObject?.MyReferrals || {}).length === 0 && (
        <TableRow>
          <TableCell colSpan={4} align="center">
            No referrals found.
          </TableCell>
        </TableRow>
      )}
{
MyTotalEarnings=0 

}
      {Object.values(StudentDataReferral?.ReferralObject?.MyReferrals || {}).map(
        (row, index) => {
          const paymentsArray = Object.values(row?.Payments || {});

          return (
            <TableRow
              key={index}
              sx={{
                backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
              }}
            >
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.displayName}</TableCell>
              <TableCell>
                {row.createdAt?.toDate().toLocaleString()}
              </TableCell>

              {/* ✅ NESTED PAYMENT TABLE */}
              <TableCell>
                {paymentsArray.length === 0 ? (
                  <div style={{ color: "#888" }}>No Payments</div>
                ) : (
                  <Table
                    size="small"
                    sx={{
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#ffffce",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <TableHead sx={{ backgroundColor: "#ffecb3" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Rotation
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Your Credits
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Date
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paymentsArray.map((rotation, rIndex) => {
                        const rotationPayments = Object.values(rotation || {});

                        return rotationPayments.map((pay, pIndex) => {
                          MyTotalEarnings =
                            MyTotalEarnings + Number(pay.MyDiscount || 0);

                          return (
                            <TableRow
                              key={`${rIndex}-${pIndex}`}
                              sx={{
                                backgroundColor:
                                  pIndex % 2 === 0 ? "#fffde7" : "#fff9c4",
                              }}
                              hover
                            >
                              <TableCell>{pay.rotationcode}</TableCell>
                              <TableCell>{pay.PaymentType}</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: "#2e7d32" }}>
                                ${pay.AmountPaidByUser}
                              </TableCell>
                              <TableCell sx={{ color: "#d32f2f", fontWeight: 600 }}>
                                ${pay.MyDiscount}
                              </TableCell>
                              <TableCell>
                                {pay.PaymentDate
                                  ?.toDate()
                                  .toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })}
                    </TableBody>
                  </Table>
                )}
              </TableCell>
            </TableRow>
          );
        }
      )}

      {/* ✅ TOTAL ROW FIXED */}
      <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
        <TableCell colSpan={3}>
          <b>Total Earnings</b>
        </TableCell>
        <TableCell>
          <b>${MyTotalEarnings}</b>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>




  			</Grid>
		</div>
	</div>
    <div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Referral Settings:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Service</b></TableCell>
              <TableCell><b>Discount On </b></TableCell>
              <TableCell><b>Your Discount</b></TableCell>
              <TableCell><b>Referred User Discount</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.values(services).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No referrals found.
                </TableCell>
              </TableRow>
            )}

    			
            {Object.values(services).map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.service}</TableCell>
                 <TableCell>
                  {row.discountFeeType=="ServiceFee"?"Service Fee Only": row.discountFeeType=="ApplicationFee"?"Application Fee Only":"Both Fee"}
                </TableCell>

                <TableCell>
                  {row.referralDiscountType=="Value"?"$"+row.referralDiscountValue:row.referralDiscountValue+"%"}
                </TableCell>

                <TableCell>
                   { row.userDiscountType=="Value"?"$"+row.userDiscountValue:row.userDiscountValue+"%"}
                </TableCell>

               
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>



  			</Grid>
		</div>
	</div>



      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
