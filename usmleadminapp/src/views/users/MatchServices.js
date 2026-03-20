import React, { useEffect, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
const dateFormat="MM/DD/YYYY";
import { CFormCheck } from '@coreui/react'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Select1 from 'react-select';
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
//const admin = require('firebase-admin');

import {
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
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
 const { showLoading, hideLoading,SelectWithComplexConditionsJoin, API_KEY,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,Timestamp,FetchUniqueData,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser,TooltipsPopovers } = useLoading();
	let { id } = useParams();
	let idWithoutChange=id;
	console.log("id======>",id)
	if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [matchSeason, setMatchSeason] = useState('');
	 const [status, setStatus] = useState('');
	 const [Notes, setNotes] = useState({});
	const [plan, setPlan] = useState('');
	const [StudentData, setStudentData] = useState({});
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
    fetchUserData();
  }, []);
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
        const userDataSelectedAgent = await FetchDataFromCollection("AgentUserConnection", 20, "uid", "==", id, 0);
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
        console.log("UserServicesSelected---->",UserServicesSelected)
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
    	if(typeof userDataSelected[0]?.['WorkExperienceData']==="undefined")
    	{
				userDataSelected[0]['WorkExperienceData']={};
				userDataSelected[0]['WorkExperienceData']['WORKEXP0']={};
    	}
    	if(typeof userDataSelected[0]?.['AdminInTouch'] !== 'undefined' && userDataSelected[0]?.['AdminInTouch']!==null)
    	{
    		LockProfile=true;
    	}
    	if(typeof userDataSelected[0]?.['servicesChoosen']==="undefined")
    	{
			userDataSelected[0]['servicesChoosen']={match:false,rotation:false,research:false};
    	}
       setStudentData(userDataSelected[0])
    	setInitialData(userDataSelected[0]);
    	 hideLoading();

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






















  return (
    <CenteredBox>

      <CenteredBoxInfo>

    <div className="RotationAddedPayment " >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Service Info:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}>

        <Grid item xs={6}>
          <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
            <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>Plan:</Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>{UserServicesTaken?.['Match']?.['Plan']?.Name}</Typography>
          </Box>
        </Grid>
        {UserServicesTaken?.['Match']?.['Plan']?.Name=="Custom" &&(

        <Grid item xs={6}>
          <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
            <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>Plan Custom:</Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>{UserServicesTaken?.['Match']?.['Plan']?.Relation?.Value}</Typography>
          </Box>
        </Grid>

        )}
         {(UserServicesTaken?.['Match']?.['Plan']?.Name === 'Platinum' ||
    UserServicesTaken?.['Match']?.['Plan']?.Name === 'Platinum&HackensackCombo' ||
    UserServicesTaken?.['Match']?.['Plan']?.Name === 'B2RPlatinumCombo') && (
    <>
      {UserServicesTaken?.['Match']?.['Platinum']?.AssignedMentor && (
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
            <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
              Assigned Mentor:
            </Typography>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
            >
              {UserServicesTaken?.['Match']?.['Platinum']?.AssignedMentor.label? UserServicesTaken?.['Match']?.['Platinum']?.AssignedMentor.label:UserServicesTaken?.['Match']?.['Platinum']?.AssignedMentor}
            </Typography>
          </Box>
        </Grid>
      )}

      {UserServicesTaken?.['Match']?.['Platinum']?.DateOfMentorAssigned && (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Date Of Mentor Assigned:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {dayjs(UserServicesTaken?.['Match']?.['Platinum']?.DateOfMentorAssigned).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>
)}
{UserServicesTaken?.['Match']?.['Platinum']?.MatchPlanDocument && (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Match Plan Document:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['Platinum']?.MatchPlanDocument}
      </Typography>
    </Box>
  </Grid>
)}

{UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged && (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Mentor Changed:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged?.Value}
      </Typography>
    </Box>
  </Grid>
)}
{UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged?.Value==="Yes" && (
<>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Previous Mentor Name:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged?.Relation?.PreviousMentorName}
      </Typography>
    </Box>
  </Grid>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Reason:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged?.Relation?.Reason}
      </Typography>
    </Box>
  </Grid>

   <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Note:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['Platinum']?.MentorChanged?.Relation?.Notes}
      </Typography>
    </Box>
  </Grid>
</>
)}

{UserServicesTaken?.['Match']?.['Platinum']?.['Meetings']?.map((value, index) => (

<>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Meeting With physician Mentor:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {value?.MeetingWithPhysicianMentor?.Value}
      </Typography>
    </Box>
  </Grid>

 {value?.MeetingWithPhysicianMentor?.Relation && (
 <>
 {value?.MeetingWithPhysicianMentor?.Relation?.MeetingDate && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Meeting Date:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {dayjs(value?.MeetingWithPhysicianMentor?.Relation?.MeetingDate).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>

  )}
  {value?.MeetingWithPhysicianMentor?.Relation?.CompletionDate && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Completion Date:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {dayjs(value?.MeetingWithPhysicianMentor?.Relation?.CompletionDate).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>

  )}
  {value?.MeetingWithPhysicianMentorDuration?.Value && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Meeting Duration:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {value?.MeetingWithPhysicianMentorDuration?.Value ? value?.MeetingWithPhysicianMentorDuration?.Value+" Minutes Approx":''}
      </Typography>
    </Box>
  </Grid>

  )}
  {value?.MeetingWithPhysicianMentor?.Relation?.TopicDiscussed && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Topic Discussed:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {value?.MeetingWithPhysicianMentor?.Relation?.TopicDiscussed}
      </Typography>
    </Box>
  </Grid>

  )}
  {value?.MeetingWithPhysicianMentor?.Relation?.CompletionNotes && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Completion Note:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {value?.MeetingWithPhysicianMentor?.Relation?.CompletionNotes}
      </Typography>
    </Box>
  </Grid>

  )}
 </>

 )}
</>
))}



    </>
  )}
    {UserServicesTaken?.['Match']?.['Season'] && (

  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Match Season:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {`Match Season ` + UserServicesTaken?.['Match']?.['Season']  + ` (Sept ` + (UserServicesTaken?.['Match']?.['Season']  - 1) + `)`}
      </Typography>
    </Box>
  </Grid>
)}
 {UserServicesTaken?.['Match']?.['Status'] && (
<>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Match Status:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['Status']['Name']}
      </Typography>
    </Box>
  </Grid>
   {UserServicesTaken?.['Match']?.['Status']?.['Relation']?.['Value'] && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Future Application Season:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['Status']?.['Relation']?.['Value']}
      </Typography>
    </Box>
  </Grid>
   )}



</>
)}
 {UserServicesTaken?.['Match']?.['PaymentPlan'] && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Payment Plan:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['PaymentPlan']}
      </Typography>
    </Box>
  </Grid>
   )}
 {UserServicesTaken?.['Match']?.['EnrollmentDate'] && (
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Future Application Season:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {dayjs(new Date(UserServicesTaken?.['Match']?.['EnrollmentDate']?.seconds * 1000)).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>
   )}


  			</Grid>
		</div>
	</div>

 {UserServicesTaken?.['Match']?.['Payments']?.['Payment0'] && (
 <>
  <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Payment Details:</b>  </Typography>
                </div>
                <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}>
  			{Object.entries(UserServicesTaken?.['Match']?.['Payments'] || {}).map(([key, MpaymentObject], MPaymentindex) =>(
        <>
        <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Mode Of Payment:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {MpaymentObject['ModeOfPayment']}
      </Typography>
    </Box>
  </Grid>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Payment Date:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {dayjs(new Date(MpaymentObject?.['PaymentDate']?.seconds * 1000)).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Payment Amount:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {MpaymentObject?.Amount}
      </Typography>
    </Box>
  </Grid>

  {MpaymentObject?.['Discount']?.['Value']==="Yes" && (
  <>
    <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Discount:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {MpaymentObject?.['Discount']?.['Value']}
      </Typography>
    </Box>
  </Grid>
   <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Discount Amount:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {MpaymentObject?.['Discount']?.['Amount']}
      </Typography>
    </Box>
  </Grid>
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
        Note:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {MpaymentObject?.['Discount']?.['Notes']}
      </Typography>
    </Box>
  </Grid>
  </>
  )}

  </>
  			))}
  			</Grid>
  			</div>
</div>
</>
)}
 {UserServicesTaken?.['Match']?.['RefundData']?.['RefundAmount'] && (
 <>
  <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Refund Details:</b>  </Typography>
                </div>
                <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}>

  			 {UserServicesTaken?.['Match']?.['RefundData']?.['ModeOfRefund']?.['label'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Team Member in touch:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['RefundData']?.['ModeOfRefund']?.['label']}
      </Typography>
    </Box>
  </Grid>

  			 )}

  			 {UserServicesTaken?.['Match']?.['RefundData']?.['RefundRequestDate'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Refund  Request Date:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {dayjs(new Date(UserServicesTaken?.['Match']?.['RefundData']?.['RefundRequestDate']?.seconds * 1000)).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['RefundData']?.['RefundStatus'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Refund  Status:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['RefundData']?.['RefundStatus']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			  {UserServicesTaken?.['Match']?.['RefundData']?.['RefundType']?.['label'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Refund  Type:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['RefundData']?.['RefundType']?.['label']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['RefundData']?.['ModeOfRefund']?.['label'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Mode Of Refund:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['RefundData']?.['ModeOfRefund']?.['label']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['RefundData']?.['RefundAmount'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Amount Of Refund:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['RefundData']?.['RefundAmount']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			  {UserServicesTaken?.['Match']?.['RefundData']?.['RefundDate'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Refunded On:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {dayjs(new Date(UserServicesTaken?.['Match']?.['RefundData']?.['RefundDate']?.seconds * 1000)).format(dateFormat)}
      </Typography>
    </Box>
  </Grid>
  )}
   {UserServicesTaken?.['Match']?.['RefundData']?.['RefundNote'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Refund Note:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['RefundData']?.['RefundNote']}
      </Typography>
    </Box>
  </Grid>
  )}







  			</Grid>
  			</div>
</div>
</>
)}

{UserServicesTaken?.['Match']?.['OnBoarding'] && (
 <>
  <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>On Boarding Details:</b>  </Typography>
                </div>
                <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}>

  			 {UserServicesTaken?.['Match']?.['OnBoarding']?.['EmailWhatsAppInstructions']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Email & WhatsApp Instructions:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['OnBoarding']?.['EmailWhatsAppInstructions']?.['Value']}
      </Typography>
    </Box>
  </Grid>

  			 )}
           {UserServicesTaken?.['Match']?.['OnBoarding']?.['EmailWhatsAppInstructions']?.['Value'] === 'Other' && (

            <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Email & WhatsApp Instructions Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['OnBoarding']?.['EmailWhatsAppInstructions']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>
           )}
  			 {UserServicesTaken?.['Match']?.['OnBoarding']?.['GoogleClassroomInvitation']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Google Classroom Invitation:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
         {UserServicesTaken?.['Match']?.['OnBoarding']?.['GoogleClassroomInvitation']?.['Value']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['OnBoarding']?.['GoogleClassroomInvitation']?.['Value'] === 'Other' && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Google Classroom Invitation Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['OnBoarding']?.['GoogleClassroomInvitation']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			  {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
      Residency Match Website Access:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] === 'Other' && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Residency Match Website Access Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			 {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] === 'Activated' && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Profile Status:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Relation']?.['ProfileStatus']}
      </Typography>
    </Box>
  </Grid>

  			 )}
  			  {UserServicesTaken?.['Match']?.['OnBoarding']?.['MatchflixAccess']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Matchflix Access:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
        {UserServicesTaken?.['Match']?.['OnBoarding']?.['MatchflixAccess']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['MatchflixAccess']?.['Value'] === 'Other' && (
     <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Matchflix Access Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['MatchflixAccess']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>
  )}
   {UserServicesTaken?.['Match']?.['OnBoarding']?.['Contract']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Contract:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['Contract']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['Contract']?.['Value'] === 'Other' && (
<Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Contract Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['Contract']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>

  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['ClosedTelegramGroup']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Closed Telegram Group:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['ClosedTelegramGroup']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['ClosedTelegramGroup']?.['Value'] === 'Other' && (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Closed Telegram Group Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['ClosedTelegramGroup']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>
  )}

  {UserServicesTaken?.['Match']?.['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Plan Specific Telegram Group:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Value'] === 'Other' && (
<Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Plan Specific Telegram Group Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>

  )}
   {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet With Admin Team:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
   {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Other' && (
       <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet With Admin Team Custom
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>
   )}

    {(UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Completed' || UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Scheduled') && (
<Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet with Admin Team Date:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >



            {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date']?dayjs(new Date(UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date']?.seconds * 1000)).format(dateFormat):null}
      </Typography>
    </Box>
  </Grid>

    )}
   {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] && (
  			 <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet With Pawan:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Value']}
      </Typography>
    </Box>
  </Grid>
  )}
  {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Other' && (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet With Pawan Custom:
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
          {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Other']}
      </Typography>
    </Box>
  </Grid>
  )}
   {(UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Completed' || UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Scheduled') && (
<Grid item xs={6}>
    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}
      >
       Orientation Meet With Pawan Date:
      </Typography>
      <Typography
      kkkk={UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Date']}
        variant="subtitle1"
        color="textSecondary"
        sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
      >
 {UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Date']?dayjs(new Date(UserServicesTaken?.['Match']?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Date'])).format(dateFormat):null}
      </Typography>
    </Box>
  </Grid>

   )}








  			</Grid>
  			</div>
</div>
</>
)}



      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
