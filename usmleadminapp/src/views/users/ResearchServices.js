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
        		rotationValues['Step1Score']['Selected']={'Name':'','Value':''};
        		rotationValues['Step2Score']['Selected']={'Name':'','Value':''};
       			rotationValues['Step3Score']['Selected']={'Name':'','Value':''};
        		rotationValues['NameOfMedicalSchool']='';
        		rotationValues['CountryOfMedicalSchool']='';
       			rotationValues['PriorUSCE']='';
       			rotationValues['StudentTimeOfRotation']='';
       			rotationValues['YearYouAreApplyingForResidency']='';
       			rotationValues['Rotations']=[];
       			setrotationValues(rotationValues);
       		}
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




















 //{UserServicesTaken?.['Match']?.['Plan']?.Name=="Custom" &&(

  return (
    <CenteredBox>

      <CenteredBoxInfo>
        <div className="mainDiv">
          <div className="RotationAdded">
            <div className="TitleDiv">
              <Typography  sx={{ flexGrow: 1, backgroundColor: '#1976d2', p: 1, borderRadius: 2 }}><b>Research Details:</b>  </Typography>
            </div>
             {Object.entries(UserServicesTaken?.['Research']|| {}).map(([key, research], index) =>{
return  (
 <div class="RotationInner">
    <Grid container spacing={2} sx={{ p: 1 }} >
      <Grid item xs={6} >
        <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
          <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Research No:</b>  <font color="blue"><b>{index+1}</b></font></Typography>
        </Box>
      </Grid>
    <Grid item xs={6} >
        <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        </Box>
    </Grid>
    {research['EnrollmentDate']?.seconds &&(

                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Enrollment Date:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>

                        {dayjs(new Date(research['EnrollmentDate']?.seconds * 1000)).format(dateFormat)}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
              {research['CourseName'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Course Name:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {research['CourseName']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
             {(research?.['CourseName']==="C2P Course" || research?.['CourseName']==="RAR Course")  && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Research Topic:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {research['Topic']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
             {research['PublicationType'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Publication Type:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {research['PublicationType']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
               {research['StartDate'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Start Date:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {dayjs(new Date(research['StartDate']?.seconds * 1000)).format(dateFormat)}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
              {research['ResearchStatus'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Start Date:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {research['ResearchStatus']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
              {(research['ResearchStatus'] === 'Completed' || research['ResearchStatus'] === 'Published') && (
                <>
                 {research?.['ResearchReview'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Research Review:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {research['ResearchReview']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                </>
              )}
              <div class="RotationAddedPayment MatchPayment" >
       			<div class="TitleDiv">
                <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Payment Details:</b>  </Typography>
            </div>
            {Object.entries(research?.['Payments'] || {}).map(([Pkey, MpaymentObject], MPaymentindex) => {
       		return (
       				<div class="RotationAddedPaymentBody">
                	<Grid container spacing={2} sx={{ p: 1 }}>
                	  <Grid item xs={6} >
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                        <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Research No No:</b>  <font color="blue"><b>{index+1}</b></font></Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} >
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      </Box>
                    </Grid>
                    {MpaymentObject['FeeType'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Fee Type:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['FeeType']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject['ModeOfPayment'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Mode Of Payment:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['ModeOfPayment']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject['Amount'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Amount:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['Amount']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject['PaymentDate'] && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Payment Date:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {dayjs(new Date(MpaymentObject['PaymentDate']?.seconds * 1000)).format(dateFormat)}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject['Discount']?.['Value'] && (
                  <>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Discount:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['Discount']?.['Value']}
                      </Typography>
                    </Box>
                  </Grid>
                  {MpaymentObject.Discount?.Value === 'Yes' && (
                    <>
                    {MpaymentObject['Discount']?.['Code'] && (
                      <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Discount Code:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['Discount']?.['Code']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject['Discount']?.['Amount'] && (
                      <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Discount Amount:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject['Discount']?.['Amount']}
                      </Typography>
                    </Box>
                  </Grid>
                  )}
                  {MpaymentObject.Discount?.Notes && (
                      <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>
                        Notes:
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        {MpaymentObject.Discount?.Notes}
                      </Typography>
                    </Box>
                  </Grid>
                  )}

                    </>
                  )}


                  </>
                  )}

                </Grid>
              </div>
              )
    })}
    </div>

    </Grid>
</div>

)
            })}

          </div>
        </div>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
