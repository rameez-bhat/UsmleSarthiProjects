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
let interviewData={};
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
 const { toArray,showLoading, hideLoading,deleteFieldFromDocument,SelectWithComplexConditionsJoin, API_KEY,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,Timestamp,FetchUniqueData,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser,TooltipsPopovers } = useLoading();
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
         const userDataSelectedInterviews = await FetchDataFromCollection("InterviewsInfo", 20, "UId", "==", id, 0);
        if(userDataSelectedInterviews.length > 0)
        {
          interviewData=userDataSelectedInterviews[0];
        }
        console.log("resultServices--->",resultServices)
        let ServicesList=[];
        if(userDataSelected[0])
        {
          setStudentDataReferral(userDataSelected[0]);
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
    		//LockProfile=true;
    		LockProfile=userDataSelected[0]?.['servicesChoosen']?.lockstudentprofile;
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
   


      <Typography className="" variant="h6">Your Profile({StudentData.email}) {(LockProfile) && ( <label><font color="red">(Is Under Process With Admin. Please Contact Support If You Need Any Updation.)</font></label> )}</Typography>
        <Grid container spacing={2} sx={{ p: 1 }}>



    <div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Select Service:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 3 }}>
    			<Grid item xs={4}>
          <CFormCheck
            id="match"
            label="Match"

            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.match || false}
          />
        </Grid>
        <Grid item xs={4}>
          <CFormCheck
            id="rotation"
            label="Rotation"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.rotation || false}
          />
        </Grid>
        <Grid item xs={4}>
          <CFormCheck
            id="research"
            label="Research"
            onChange={handleCheckboxChange}
            checked={StudentData?.['servicesChoosen']?.research || false}
          />
        </Grid>
  			</Grid>
		</div>
	</div>
			 {(StudentData?.['servicesChoosen']?.match || StudentData?.['servicesChoosen']?.rotation || StudentData?.['servicesChoosen']?.research)&& (
			<div className="RotationAddedPayment MatchPayment" >
       		<div className="TitleDiv">
            	<Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Common Profile:</b>  </Typography>
        	</div>
        	<div className="VisaLetter">
  				<Grid container spacing={1} sx={{ p: 3 }}>
  				<Grid item xs={6}>
              <div className="InputLabel">Student Name</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData.displayName}
                    disabled
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
        disabled={LockProfile}
        isDisabled={LockProfile}
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
                    disabled={LockProfile}
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
                    disabled={LockProfile}
                    isDisabled={LockProfile}
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
        disabled={LockProfile}
        isDisabled={LockProfile}
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
                    disabled={LockProfile}
                    placeholder="Whatsapp number without country code"
                    onChange={(event) => handleChangeStudentDetails(event,'WhatsappNumber')}
                  />
                  {errors.WhatsappNumber  && <span className="validationerror">{errors.WhatsappNumber }</span>}
                  </Grid>
                </>
              )}
                {typeof idWithoutChange !== 'undefined' && (
              <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Admin In Touch</div>
                <Select1
                value={StudentData.AdminInTouch}
        variant="outlined"
        options={AdminOptionsList}
        disabled={LockProfile}
        isDisabled={LockProfile}
        placeholder="Admin In Touch"
        onChange={(event) => handleChangeStudentDetails(event,'AdminInTouch')}
        isSearchable
      />
      	{errors.AdminInTouch  && <span className="validationerror">{errors.AdminInTouch }</span>}
                </div>
               </Grid>
               )}
               <Grid item xs={6}>
              <div className="InputLabel" > </div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Year Of Graduation:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        //value={moment(rotationValues['GraduationDate'])}
        //value={ StudentData['GraduationDate']?dayjs(StudentData['GraduationDate']):null}
        value={StudentData['GraduationDate'] ? typeof StudentData.GraduationDate==="string"?dayjs(StudentData['GraduationDate']):dayjs(StudentData['GraduationDate']?.toDate().toISOString()) : null}
        dateFormat="YYYY" // Customize date format as needed
         yearDropdownItemNumber={50}
         picker="year"
  		name="GraduationDate"
  		disabled={LockProfile}
  		allowClear={false}
  		onChange={(event) => handleChangeStudentDetails(event,'GraduationDate')}
      /></Typography>
                </Box>
                {errors.GraduationDate && <span className="validationerror">{errors.GraduationDate}</span>}
              </Grid>
              <Grid item xs={6}>
              <div className="InputLabel" ></div>
                <FormControl fullWidth>
                <InputLabel>Step 1 Score</InputLabel>
                  <Select
                    checkwhate={StudentData['Step1Score']?.['Selected']?.['Name']}
                    value={ StudentData?.ScoreData?.Step1Score?.Selected?.Name || ''}
                    label="Step 1 Score"
                    required
                    disabled={LockProfile}
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
                    disabled={LockProfile}
                    value={StudentData['ScoreData']['Step1Score']['Selected']['Value']}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step1ScoreMarks')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Step1ScoreMarks  && <span className="validationerror">{errors.Step1ScoreMarks }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
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
                    disabled={LockProfile}
                    value={StudentData['ScoreData']?.['Step2Score']?.['Selected']?.['Value'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'Step2ScoreMarks')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Step2ScoreMarks  && <span className="validationerror">{errors.Step2ScoreMarks }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
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
                    disabled={LockProfile}
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
                    disabled={LockProfile}
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
              {/*<Grid item xs={6}>
              <div className="InputLabel" ></div>
                  <TextField
                    label="Name of Medical School"
                    variant="outlined"
                    name="NameOfMedicalSchool"
                    fullWidth
                    value={rotationValues['NameOfMedicalSchool']}
                    required
                    onChange={(event) => handleRotationChange(event,'NameOfMedicalSchool')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.NameOfMedicalSchool  && <span className="validationerror">{errors.NameOfMedicalSchool }</span>}
                </Grid>*/}
                <Grid item xs={6}>
                  <div className="InputLabel" id="CountryOfMedicalSchool">Country Of Medical School</div>
                <Select1
        value={StudentData['CountryOfMedicalSchool'] || ''}
        onChange={(event) => handleChangeStudentDetails(event,'CountryOfMedicalSchool')}
        variant="outlined"
        labelId="CountryOfMedicalSchool"
        name="CountryOfMedicalSchool"
        options={allCountriesC}
        disabled={LockProfile}
        isDisabled={LockProfile}
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
        disabled={LockProfile}
        isDisabled={LockProfile}
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
                  <TextField
                    label="If You Have Done Prior USCE(number of months)"
                    variant="outlined"
                    name="PriorUSCE"
                    fullWidth
                    disabled={LockProfile}
                    value={StudentData['PriorUSCE'] || ''}
                    required

                    onChange={(event) => handleChangeStudentDetails(event,'PriorUSCE')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.PriorUSCE  && <span className="validationerror">{errors.PriorUSCE }</span>}
                </Grid>
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
                    disabled={LockProfile}
                    rows={4}
                    value={StudentData['redflagexplain'] || ''}
                    required

                    onChange={(event) => handleChangeStudentDetails(event,'redflagexplain')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.redflagexplain  && <span className="validationerror">{errors.redflagexplain }</span>}
                </Grid>
                )
                }

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
                    disabled={LockProfile}
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
              <div className="InputLabel">Primary specialty applying this season</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                  disabled={LockProfile}
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
                   <Grid item xs={6}>
              <div className="InputLabel">Primary specialty applying this season</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                  disabled={LockProfile}
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
                        disabled={LockProfile}
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
                        disabled={LockProfile}
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

               {/*   
                <Grid item xs={6}>
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
                        disabled={LockProfile}
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
                    label="Year you are applying for Residency"
                    required
                    disabled={LockProfile}
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
                    disabled={LockProfile}
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
                    disabled={LockProfile}
                    value={StudentData?.['HomeCountrySpecility'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'HomeCountrySpecility')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HomeCountrySpecility  && <span className="validationerror">{errors.HomeCountrySpecility }</span>}
                </Grid>
                <Grid item xs={6}>
                <div className="InputLabel" >Home Country Specility Additional Details.</div>
                  <TextField
                    label=""
                    variant="outlined"
                    name="HomeCountrySpecilityAdditionalDetails"
                    fullWidth
                    disabled={LockProfile}
                    value={StudentData?.['HomeCountrySpecilityAdditionalDetails'] || ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'HomeCountrySpecilityAdditionalDetails')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HomeCountrySpecilityAdditionalDetails  && <span className="validationerror">{errors.HomeCountrySpecilityAdditionalDetails }</span>}
                </Grid>
                </>
              )}
  				</Grid>
  			</div>
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
  			</div>
  			
  			

  			)}

			 {StudentData?.['servicesChoosen']?.match && (

		<div className="RotationAddedPayment MatchPayment" >
       		<div className="TitleDiv">
            	<Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Fill Match Details:</b>  </Typography>
        	</div>
        	<div className="VisaLetter">
  				<Grid container spacing={1} sx={{ p: 3 }}>

<div className="RotationAddedPayment MatchPayment" >
			<div className="TitleDiv">
			  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>USCE:</b>  </Typography>
			</div>
			{Object.entries(StudentData?.['USCEDATA']).map(([subKey, subValue]) => (
   <div className="RotationAddedPaymentBody" >
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
		  disabled={LockProfile}
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
	 disabled={LockProfile}
	 picker="date"
	  label="USCE-From/To Date"
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
                    disabled={LockProfile}
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
				{subValue?.['USCEState']==="Other" &&(

					<Grid item xs={6}>
			 <div className="InputLabel" >Please Specify Other State</div>
			  <TextField

				variant="outlined"
				disabled={LockProfile}
				fullWidth
				value={subValue['USCEStateOther'] || ''}


				onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'USCEStateOther')}
				sx={{ my: 0, "margin-bottom": "4px" }}
			  />
			  {errors.USCEStateOther?.[subKey]  && <span className="validationerror">{errors.USCEStateOther?.[subKey] }</span>}
			</Grid>

				)}



			<Grid item xs={6}>
			 <div className="InputLabel" >Location(City)</div>
			  <TextField

				variant="outlined"
				disabled={LockProfile}
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
				disabled={LockProfile}
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
              <div className="InputLabel">Type Of USCE</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['TypeofUSCE'] || ''}
                    onChange={(event) => handleChangeStudentDetails(event,'USCEDATA',subKey,'TypeofUSCE')}>
					<MenuItem  value=''>=Select=</MenuItem>
                    <MenuItem  value='Hands On'>Hands On</MenuItem>
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
   ))}
   <div className="AddPaymentButton">
	   <Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"
		  disabled={LockProfile}
		  onClick={() => AddMoreUSCE("USCENO","USCEDATA")}
		>
		  Add USCE
		</Button>
			</Box>
			</Grid>
		</div>
   </div>

   <div className="RotationAddedPayment MatchPayment" >
			<div className="TitleDiv">
			  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Work Experience:</b>  </Typography>
			</div>
			{Object.entries(StudentData?.['WorkExperienceData']).map(([subKey, subValue]) => (
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
		  disabled={LockProfile}
		  onClick={() => DeleteMoreWork(subKey)}
		>
		  Delete Work Exp
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
	  label="Work Experience From/To Date:"
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
        disabled={LockProfile}
        isDisabled={LockProfile}
        placeholder="Country"
        isSearchable
        formatOptionLabel={CountryOption}
      />
      	 {errors.WorkexperienceCountry?.[subKey]  && <span className="validationerror">{errors.WorkexperienceCountry?.[subKey] }</span>}
              	</Grid>

			<Grid item xs={6}>
              <div className="InputLabel">Location(State)</div>
                <FormControl fullWidth>
                  <InputLabel ></InputLabel>
                  <Select
                    value={subValue['WorkexperienceState'] || ''}
                     disabled={LockProfile}
                    isDisabled={LockProfile}
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
                    label="Name of hospital/clinic"
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
                    label="Speciality- in"
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
                    label="Speciality Others Explain"
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
   ))}
   <div className="AddPaymentButton">
	   <Grid item xs={6} >
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
			  <Button
		  variant="contained"
		  color="primary"
		  disabled={LockProfile}
		  onClick={() => AddMoreUSCE("WORKEXP","WorkExperienceData")}
		>
		  Add Exp
		</Button>
			</Box>
			</Grid>
		</div>
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
        disabled={LockProfile}
        isDisabled={LockProfile}
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
                     disabled={LockProfile}
        isDisabled={LockProfile}
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
       

<div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Other Data:</b>  </Typography>
                </div>
                <Grid item xs={6}>
              	 <div className="InputLabel" >  If you are a repeat applicant, mention year(s) in which you have applied, speciality and any interviews</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData['RepeatApplicant'] || ''}

                    multiline
                    rows={4}
                     onChange={(event) => handleChangeStudentDetails(event,'RepeatApplicant')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ResearchMentorsname  && <span className="validationerror">{errors.ResearchMentorsname }</span>}
                </Grid>
              </div>


<div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Save Details:</b>  </Typography>
                </div>
                <Grid className="submitbutton" item xs={12} style={{ display: 'table',marginTop: '10px', gap: '10px' }}>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}
				 disabled={LockProfile}
            >
              Save Data
            </Button>

            </Grid>
</div>


{/*<div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Meeting Notes Section:</b>  </Typography>
                </div>
       		{NoteSectionData?.map((NotesObject, NotesIndex) => {
       		NotesIndexMain=NotesIndex;
       		const NotesDate = NotesObject?.NotesDate
      ? dayjs(new Date(NotesObject.NotesDate.seconds * 1000))
      : dayjs();
       		return (
       				<div className="RotationAddedPaymentBody" key={NotesIndex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>

					<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Meeting No:</b>  <font color="blue"><b>{NotesIndex+1} </b></font></Typography>
                	</Box>
            	</Grid>

            	{NotesObject?.AddedBy?.UserType==="Student" ? (

            	<>

            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              disabled={LockProfile}
              onClick={() => DeleteNotesSec(NotesIndex)}
            >
              Delete Notes {NotesIndex+1}
            </Button>
                </Box>
                </Grid>
                 <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Meeting Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={NotesDate}
        onChange={(event) => HandleNotesSectionChange(event,'NotesDate',NotesIndex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
          disabled={LockProfile}
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.NotesObject?.NotesDate?.[NotesIndex] && <span className="validationerror">{errors.NotesObject?.NotesDate?.[NotesIndex]}</span>}
              </Grid>
              <Grid item xs={6} >
                    <FormControl fullWidth>
                      <InputLabel >Notes For</InputLabel>
                      <Select
  required
  value={NotesObject['NoteFor'] || ''}
  label="Type"
  onChange={(event) => HandleNotesSectionChange(event, 'NoteFor', NotesIndex)}
>
  <MenuItem value="Admin">Admin</MenuItem>
  {UserServicesTaken?.['Match'] && (
    UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'Platinum' ||
    UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'Platinum&HackensackCombo' ||
    UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'B2RPlatinumCombo' ? (
      <MenuItem value="Mentor">Mentor</MenuItem>
    ) : (

      <MenuItem value="Mentor" disabled>Mentor</MenuItem>
    )
  )}
</Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
              
              <Grid item xs={6} sx={{ display: 'none'}}>
              <div className="">
                <div className="InputLabel">Team Member</div>
                <Select1
                value={NotesObject?.TeamMember}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Admin In Touch"
        isDisabled={LockProfile}
        onChange={(event) => HandleNotesSectionChange(event,'TeamMember',NotesIndex)}
        isSearchable
        isMulti
      />
      	{errors.NotesObject?.TeamMember?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.TeamMember?.[NotesIndex] }</span>}
                </div>
               </Grid>

                <Grid item xs={6} sx={{ display: 'none'}}>
                    <FormControl fullWidth>
                      <InputLabel >Type </InputLabel>
                      <Select

                        required
                        value={NotesObject['NoteType'] || ''}
                        label='Type'
                        onChange={(event) => HandleNotesSectionChange(event,'NoteType' ,NotesIndex)}
                      >
                        <MenuItem value='Meeting'>Meeting</MenuItem>
                        <MenuItem value='Touch Point'>Touch Point</MenuItem>
                        <MenuItem value='Team Update'>Team Update</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>

                <Grid item xs={12}>
                <TextField
  					label="Message"
  					multiline
  					rows={6}
  					variant="outlined"
  					fullWidth
  					value={NotesObject?.Notes}
  					onChange={(event) => HandleNotesSectionChange(event,'Notes' ,NotesIndex)}
  					sx={{ my: 2 }}
				/>
                  {errors.NotesObject?.Notes[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.Notes[NotesIndex] }</span>}
                </Grid>
				<Grid item xs={6} sx={{ display: 'none'}}>
                    <FormControl fullWidth>
                      <InputLabel >Action Items </InputLabel>
                      <Select
                        required
                        value={NotesObject['ActionItem'] || ''}
                        label='Action Items'
                        onChange={(event) => HandleNotesSectionChange(event,'ActionItem' ,NotesIndex)}
                      >
                        <MenuItem value='For The Team'>For The Team</MenuItem>
                        <MenuItem value='For Student'>For Student</MenuItem>
                        <MenuItem value='For Both'>For Both</MenuItem>
                      </Select>
                      {errors.NotesObject?.['ActionItem']?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.['ActionItem']?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
            	</>




            	):(
            	<>

            		 <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                	<Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>Note From:</Typography>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>{NotesObject?.AddedBy?.displayName}({NotesObject?.AddedBy?.UserType || "N/A"})</Typography>

                </Box>

              </Grid>
               <Grid item xs={12}>
              <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                	<Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>Details :</Typography>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>{NotesObject?.Notes}</Typography>

                </Box>
                 </Grid>
            	</>
            	)}
          </Grid>
        </div>
      )}

            )}
            <div className="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddNotesSection(NotesIndexMain+1,)}
            >
              Add Notes
            </Button>
                </Box>
            </Grid>
            </div>
            </div>*/}






					{/*<div className="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddNotesSection(NotesIndexMain+1,)}
            >
              Save Data
            </Button>
                </Box>
                </Grid>
            </div>*/}


  				</Grid>
  			</div>
  		</div>

			 )}


                </Grid>
                {StudentData?.['servicesChoosen']?.rotation && (
			  	 <div className="mainDiv">
                <div className="RotationAdded">
                <div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#1976d2', p: 1, borderRadius: 2 }}><b>Rotation Details:</b>  </Typography>
                </div>
                <div className="RotationInner" >
                	<Grid container spacing={2} sx={{ p: 1 }} >
                	<Grid item xs={6} >
                      <div className="InputLabel" ></div>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Rotation No:</b>  <font color="blue"><b></b></font></Typography>

                </Box>
                </Grid>
                <Grid item xs={6} >
                    <FormControl fullWidth>
                      <div className="InputLabel">Will you be a medical student at the time of your rotation?</div>
                      <Select
                        required
                        disabled={LockProfile}
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

                	</Grid>
                	{/*<div className="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              disabled={LockProfile}
              onClick={() => AddNotesSection(NotesIndexMain+1,)}
            >
              Save Data
            </Button>
                </Box>
                </Grid>
            </div>*/}
                </div>
            	</div>
            	</div>
			  )}
				{/* <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">State Of Rotation</div>
                <Select1
                value={StudentData.LocationState}
        variant="outlined"
        options={LocationState}
        placeholder="State Of Rotation"
        disabled={LockProfile}
        isDisabled={LockProfile}
        onChange={(event) => handleChangeStudentDetails(event,'LocationState')}
        isSearchable
      />
      	{errors.LocationState  && <span className="validationerror">{errors.LocationState }</span>}
                </div>

               </Grid>
               	 <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">City Of Rotation</div>
                <Select1
                value={StudentData.LocationCity}
        variant="outlined"
        options={LocationCity}
        placeholder="City Of Rotation"
        disabled={LockProfile}
        isDisabled={LockProfile}
        onChange={(event) => handleChangeStudentDetails(event,'LocationCity')}
        isSearchable
      />
      	{errors.LocationCity  && <span className="validationerror">{errors.LocationCity }</span>}
                </div>

               </Grid>


               <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Rotation Code</div>
                <Select1
                value={StudentData.LocationCode}
        variant="outlined"
        options={LocationCode}
        placeholder="Rotation Code"
        disabled={LockProfile}
        isDisabled={LockProfile}
        onChange={(event) => handleChangeStudentDetails(event,'LocationCode')}
        isSearchable
      />
      	{errors.LocationCode  && <span className="validationerror">{errors.LocationCode }</span>}
                </div>

               </Grid>
               <Grid item xs={6} >
        <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Rotation Start Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={StudentData['RotationStartDate']?dayjs(StudentData['RotationStartDate'].toDate().toISOString()):null}
        onChange={(event) => handleChangeStudentDetails(event,'RotationStartDate' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         disabled={LockProfile}
         picker="date"
          label="Start Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.RotationStartDate && <span className="validationerror">{errors.RotationStartDate}</span>}
              </Grid>*/}
          <Grid className="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddStudentForm}
				 disabled={LockProfile}
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
