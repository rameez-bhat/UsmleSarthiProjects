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
import OnBoardingHtml from "./OnBoarding";
import PlatinumMentorShip from "./PlatinumMentorShip";
import ChiefMentorShip from "./ChiefMentorShip";
import UserServices from "./UserServices";
import CommonNotes from "./CommonNotes";
import StudentEnqueries from "./StudentEnqueries";
import AnswerQuestionsTab from "./AnswerQuestionsTab";
import {CountryWithStates} from "../../apis/countriesWithStates1";
const DateFormatForAll="MM/DD/YYYY";
import Research from "./Research";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { doc, setDoc, updateDoc, deleteField,deleteDoc,increment } from "firebase/firestore";
import { db } from "../../firebase";
let AlreadySavedPayment={};
let NewPaymentadded={};
let NewPaymentaddedForSeats={};
let paymentSuccessURL="";
let AlreadySavedPaymentMatch=[];
let NewPaymentaddedMatch=[];
let panelistRealData={};
let AlreadySavedPaymentResearch={};
let NewPaymentaddedResearch={};
let paymentParams={};
let AlreadRotationForBooking={};
let rotationFeeItselfStatus=false;
const matchVisaOptionList = [
  { value: 'GC/US citizen H4 EAD', label: 'GC/US citizen H4 EAD' },
  { value: 'Need H1', label: 'Need H1' },
  { value: 'Need J1', label: 'Need J1' },
  { value: 'Others', label: 'Others' }
];
dayjs.extend(utc);
dayjs.extend(timezone);
 	let AdminOptionsList=[];
 	let Newway=false;
 	let previoussignedDate=null;
 	let indexLetter=0;
 	let NotesIndexMain=0
 	let newRotationsView={};
 	let ListOfPanelists=[];
 	let ChiefMentorlists=[];
 	let InitialMatchData={};
const UserDetails = (LoginInUserMain) => {

ActualUser=LoginInUserMain.ActualUser;
 const { showLoading,TooltipsPopovers,DeleteDocumentWhere,deleteDuplicateNotes,handleAdd,SelectWithComplexConditionsJoin,deleteFieldFromDocument, hideLoading, API_KEY,deletedocumentfromid,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,FetchDataFromCollection,handleUpdateEx,FetchUniqueData,FetchUniqueDataFull,fetchAdminDataWithJoin,Timestamp,handleUpdate } = useLoading();
  const currentYear = new Date().getFullYear();
  const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
  const MatchStatusNotApplyingList = Array.from({ length: 7 }, (v, i) => currentYear + i);
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
  const ContractStatusOptionsList= [{
  label:'Sent',
  value:'Sent'
  },
  {
  label:'Signed',
  value:'Signed'
  },
  {
  label:'Hold',
  value:'Hold'
  },
  {
  label:'Not Signed',
  value:'Not Signed'
  },
  ];
  const RotationPaymentStatusOptionsList= [
  	{
  		label:'Paid Only Registration Fees',
  		value:'Paid Only Registration Fees'
  	},
  	{
  		label:'Paid Rotation+Registration Fees',
  		value:'Paid Rotation+Registration Fees'
  	},
  	{
  		label:'First Installment Of Rotation Fees',
  		value:'First Installment Of Rotation Fees'
 	},
  	{
  		label:'Paid Second Installment Of Rotation Fees',
  		value:'Paid Second Installment Of Rotation Fees'
  	},
  	{
  		label:'Sent Payment link',
  		value:'Sent Payment link'
  	},
  	{
  		label:'Custom Note',
  		value:'Custom Note'
  	},
  ];
  const RotationStatus= [
  	{
  		label:'Connected with physician',
  		value:'Connected with physician'
  	},
  	{
  		label:'Rotation started',
  		value:'Rotation started'
  	},
  	{
  		label:'Rotation completed',
  		value:'Rotation completed'
  	},
  	{
  		label:'Rotation postponed',
  		value:'Rotation postponed'
 	},
  	{
  		label:'No Reply from Student',
  		value:'No Reply from Student'
  	},
  	{
  		label:'Physician not replying',
  		value:'Physician not replying'
  	},
  	{
  		label:'Rotation canceled.',
  		value:'Rotation canceled.'
  	},
  	{
  		label:'Not connected with physician',
  		value:'Not connected with physician'
  	},
  ];
  const RotationReview= [
  	{
  		label:'No Reply',
  		value:'No Reply'
  	},
  	{
  		label:'Video review submitted',
  		value:'Video review submitted'
  	},
  	{
  		label:'Written review submitted',
  		value:'Written review submitted'
 	},
 	{
  		label:'Done Instagram takeover',
  		value:'Done Instagram takeover'
 	},
 	{
  		label:'Done Interview with Pawan',
  		value:'Done Interview with Pawan'
 	},
 	{
  		label:'Request not sent yet',
  		value:'Request not sent yet'
 	},
 	{
  		label:'Request sent',
  		value:'Request sent'
 	},

  ];

  const RotationVisa= [
  	{
  		label:'Visa Letter',
  		value:'Paid for Visa letter'
  	},
  	{
  		label:'Acceptance Letter',
  		value:'Acceptance Letter'
  	},
  	{
  		label:'Other Letter',
  		value:'Other Letter'
  	},
  	{
  		label:'Do not need Visa',
  		value:'Do not need Visa'
  	},

  ];
  const RotationVisaOther= [
  	{
  		label:'Visa Letter',
  		value:'Paid for Visa letter'
  	},
  	{
  		label:'Acceptance Letter',
  		value:'Acceptance Letter'
  	},
  	{
  		label:'Other Letter',
  		value:'Other Letter'
  	},
  	{
  		label:'Do not need Visa',
  		value:'Do not need Visa'
  	},

  ];
  const RotationVisaLetterOfPurposeOptions= [
  	{
  		label:'Sent',
  		value:'Sent'
  	},
  	{
  		label:'Signed',
  		value:'Signed'
  	},
  	{
  		label:'Hold',
  		value:'Hold'
  	},

  ];
  const RotationVisaLetterStatusOptions= [
  	{
  		label:'Letter Requested',
  		value:'Letter Requested'
  	},
  	{
  		label:'On Hold',
  		value:'On Hold'
  	},
  	{
  		label:'Letter Complete and Sent',
  		value:'Letter Complete and Sent'
  	},

  ];
  const RotationVisaStatusOptions= [
  	{
  		label:'Accepted',
  		value:'Accepted'
  	},
  	{
  		label:'Rejected',
  		value:'Rejected'
  	},
  	{
  		label:'Pending',
  		value:'Pending'
  	},

  ];

  const RotationVisaLetterType= [
  	{
  		label:'From Physician',
  		value:'From Physician'
  	},
  	{
  		label:'From Sarthi',
  		value:'From Sarthi'
  	},
  	{
  		label:'From US Lawyer',
  		value:'From US Lawyer'
  	}

  ];
  const RotationAcceptanceLetter= [
  	{
  		label:'From Physician',
  		value:'From Physician'
  	},
  	{
  		label:'From Sarthi',
  		value:'From Sarthi'
  	},
  	{
  		label:'From US Lawyer',
  		value:'From US Lawyer'
  	}
  	];
  const HousingStatus= [
  	{
  		label:'Yes',
  		value:'Yes'
  	},
  	{
  		label:'No',
  		value:'No'
  	}

  ];
  const HousingAssistanceList=[{
  		label:'Yes',
  		value:'Yes'
  	},
  	{
  		label:'No',
  		value:'No'
  	}];
  const RotationRefund= [
  	{
  		label:'Visa advance fees',
  		value:'Visa advance fees'
  	},
  	{
  		label:'Rotation fees',
  		value:'Rotation fees'
  	},
  	{
  		label:'Rotation application fees',
  		value:'Rotation application fees'
  	},
  	{
  		label:'Visa invitation letter fees',
  		value:'Visa invitation letter fees'
  	},
  	{
  		label:'Acceptance letter fees',
  		value:'Acceptance letter fees'
  	}

  ];
   const RotationRefundMatch= [
  	{
  		label:'Visa advance fees',
  		value:'Visa advance fees'
  	},
  	{
  		label:'Rotation fees',
  		value:'Rotation fees'
  	},
  	{
  		label:'Match Plan',
  		value:'Match Plan'
  	},
  	{
  		label:'Rotation application fees',
  		value:'Rotation application fees'
  	},
  	{
  		label:'Visa invitation letter fees',
  		value:'Visa invitation letter fees'
  	},
  	{
  		label:'Acceptance letter fees',
  		value:'Acceptance letter fees'
  	}

  ];
  const RotationLOROptionList=[
  	{
  		label:'Need to Remind Physician',
  		value:'Need to Remind Physician'
  	},
  	{
  		label:'Reminded Physician',
  		value:'Reminded Physician'
  	},
  	{
  		label:'LOR completed',
  		value:'LOR completed'
  	}]
  const MatchPlanStatus = {

    "NotApplying": "Not Applying",
    "Withdrawn": "Withdrawn",
    "AccessRemoved": "Access Removed",
    "Upgrade": "Upgrade",
    "Downgrade": "Downgrade",
    "Continuing": "Continuing",
    "Continuing+Upgrade": "Continuing + Upgrade",
    "Continuing+LimitedServices": "Continuing + Limited Services",
    "Current Student":"Current Student"
  };
  const MatchPaymentPlans = {
 	"Full Payment Received":"Full Payment Received",
 	"On Installments":"On Installments",
 	"Custom":"Custom"
 };
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [matchSeason, setMatchSeason] = useState('');
  const [MatchPlanListObject, setMatchPlanListObject] = useState({});
  const [customPlan, setCustomPlan] = useState('');
  const [SilverInteractiveMocks, setSilverInteractiveMocks] = useState(0);
  const [SilverOnDemandMocks, setSilverOnDemandMocks] = useState(null);
  const [MatchStatusNotApplyingSelected, setMatchStatusNotApplyingSelected] = useState([]);
  const [Notes, setNotes] = useState({});
  const [errors, setErrors] = useState({});
  const [errorsResearch, seterrorsResearch] = useState({});
  const [EnquiriesWithRotation, setEnquiriesWithRotation] = useState([]);
  const [OperationMessage, setOperationMessage] = useState({});
  const [open, setOpen] = useState(false);
  const [OnBoardingOpen, setOnBoardingOpen] = useState(false);
  const [MatchcreatedAtexists, setMatchcreatedAtexists] = useState(false);
  const [MatchValues, setMatchValues] = useState(null);
  const [NoteSectionData, setNoteSectionData] = useState([]);
  const [CommonUserNotesData, setCommonUserNotesData] = useState([]);
  const [rotationValues, setrotationValues] = useState({});
  const [researchValues, setresearchValues] = useState({});
  const [LocationCodes, setLocationCodes] = useState(null);
  const [HousingCodes, setHousingCodes] = useState(null);
  const [FutureApplicationSeasonCustomNote, setFutureApplicationSeasonCustomNote] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [UserServicesTaken, setUserServicesTaken] = useState({});
  const contentRef = useRef(null);
  let CancleApplicationFeeType="";
  let CancleApplicationModeOfPayment="";
  let CancleApplicationCouponCode="";
  let CancleApplicationPaymentAmount="";
  let CancleApplicationPaymentDate="";
  let CancleApplicationCustomNote="";
  useEffect(() => {
  if (rotationValues?.['Rotations']?.[0]?.['ContractStatus']?.label === 'Signed' && !rotationValues?.['Rotations']?.[0]?.['ContractSignedDate'])
  {
      const newRotationsView = [...rotationValues['Rotations']];
      newRotationsView[0] = {
        ...newRotationsView[0],
        'ContractSignedDate': Timestamp.fromDate(new Date()),
      };
      setrotationValues((prevValues) => ({
      ...prevValues,
      'Rotations': newRotationsView,
    }));
  }
  else if(rotationValues?.['Rotations']?.[1]?.['ContractStatus']?.label === 'Signed' && !rotationValues?.['Rotations']?.[1]?.['ContractSignedDate'])
  {


    const newRotationsView = [...rotationValues['Rotations']];
    newRotationsView[1] = {
      ...newRotationsView[1],
      'ContractSignedDate': Timestamp.fromDate(new Date()),
    };
    setrotationValues((prevValues) => ({
      ...prevValues,
      'Rotations': newRotationsView,
    }));
  }
   else if(rotationValues?.['Rotations']?.[2]?.['ContractStatus']?.label === 'Signed' && !rotationValues?.['Rotations']?.[2]?.['ContractSignedDate'])
   {


    const newRotationsView = [...rotationValues['Rotations']];
    newRotationsView[2] = {
      ...newRotationsView[2],
      'ContractSignedDate': Timestamp.fromDate(new Date()),
    };
    setrotationValues((prevValues) => ({
      ...prevValues,
      'Rotations': newRotationsView,
    }));
  }
   else if(rotationValues?.['Rotations']?.[3]?.['ContractStatus']?.label === 'Signed' && !rotationValues?.['Rotations']?.[3]?.['ContractSignedDate'])
   {
    const newRotationsView = [...rotationValues['Rotations']];
    newRotationsView[3] = {
      ...newRotationsView[3],
      'ContractSignedDate': Timestamp.fromDate(new Date()),
    };
    setrotationValues((prevValues) => ({
      ...prevValues,
      'Rotations': newRotationsView,
    }));
  }
  else if(rotationValues?.['Rotations']?.[4]?.['ContractStatus']?.label === 'Signed' && !rotationValues?.['Rotations']?.[4]?.['ContractSignedDate'])
   {
    const newRotationsView = [...rotationValues['Rotations']];
    newRotationsView[4] = {
      ...newRotationsView[4],
      'ContractSignedDate': Timestamp.fromDate(new Date()),
    };
    setrotationValues((prevValues) => ({
      ...prevValues,
      'Rotations': newRotationsView,
    }));
  }
}, [rotationValues?.['Rotations']?.[0]?.['ContractStatus'], rotationValues?.['Rotations']?.[1]?.['ContractStatus'], rotationValues?.['Rotations']?.[2]?.['ContractStatus'], rotationValues?.['Rotations']?.[3]?.['ContractStatus'],rotationValues?.['Rotations']?.[4]?.['ContractStatus']]);
	useEffect(() => {
  }, [id,MatchValues, rotationValues,researchValues]);
  useEffect(() => {
    fetchUserData();
    if (contentRef.current) {
      handleScroll(); // Initial check

    }
  }, [id,setMatchValues, setrotationValues]);
  const  getNameByCode= async (code) => {
  const state = CountryWithStates[239].states.find(item => item.code === code.toUpperCase());
  return state ? state.name : null;
};
  const fetchUserData = async () => {
      setLoading(true);
      /*console.log("CountryWithStates---->",CountryWithStates[239].states)
      const HospitalList = await FetchUniqueDataFull("Hospital","HName");
      console.log("HospitalList---->",HospitalList)
        HospitalList.map(async item => {

          if(item.State)
          {
            console.log("documentid---->",item.documentid)
            console.log("HName---->",item.HName)
            let documentid=item.documentid;
            let DataSet=item;
            if(typeof documentid=="undefined")
            {
              documentid=item.id;

            }
            if(DataSet.HName==null || typeof DataSet.HName=="undefined")
            {
               console.log("Found undefined---->",item)
              console.log("StateName---->",StateName)
              console.log("documentid2---->",DataSet.HName)
            }
            const StateName= await getNameByCode(item.State)
            if(StateName!=null && typeof documentid!="undefined")
            {
              DataSet.State=StateName;
              //await handleUpdate("Hospital",documentid,DataSet)
            }

          }
        });*/

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
     const Locationcode = await FetchUniqueData("Rotations","location_code");
    
     //await deleteDuplicateNotes();
     //getRecordsWithEnrollmentDateAfter( "UserServicesBK1", "2024-09-01T00:00:00Z");
     
     const options = Locationcode.map(location_code => ({ value: location_code, label: location_code ,FieldName:"LocationCode"}));
     options.unshift({value:'',label:'-None-',FieldName:"LocationCode"});
     setLocationCodes(options);
     const HousingCodeList = await FetchUniqueDataFull("Housings","housingId");
     const optionsHousing = HousingCodeList.map(housing => ({ value: housing.housingId, label: housing.title,OwnerName:housing.landlordName,OwnerEmail:housing.email,FieldName:"HousingCode"}));
     setHousingCodes(optionsHousing)
      try {
        const userDataSelected = await FetchDataFromCollection("Users", 20, "uid", "==", id, 0);

        const userDataSelectedAgent = await FetchDataFromCollection("AgentUserConnection", 20, "uid", "==", id, 0);
        //ListOfPanelists = await FetchDataFromCollection("Panelists", 2000, null, null, null, 0);
        const ListOfPanelistsData = await fetchAdminDataWithJoin("UsersRoles","Users",3000,null,"Role","==","Mentor");
        const ChiefMentorData = await fetchAdminDataWithJoin("UsersRoles","Users",3000,null,"Role","==","chiefmentor");
        if(ListOfPanelistsData.data.length)
        {
          ListOfPanelists=ListOfPanelistsData.data
        }
      let   panelistOptions = Object.entries(ListOfPanelists).map(([email, objec]) => {
  panelistRealData[objec.email] = objec;

  return {
    value: objec.email,
    label: `${objec.displayName} (${objec.email})`
  };
});
        if(ChiefMentorData.data.length)
        {
          ChiefMentorlists=ChiefMentorData.data
        }
     	const adminOptions = await fetchAdminDataWithJoin("UsersRoles","Users",300,null,"Role","==","Admin");
		      if(typeof userDataSelected[0].Step1Score!=="undefined" && typeof userDataSelected[0].Step1Score==="object")
        	{
        		//userDataSelected[0].ScoreData={Step1Score:userDataSelected[0].Step1Score,Step2Score:userDataSelected[0].Step2Score,Step3Score:userDataSelected[0].Step3Score};
        		if(typeof userDataSelected[0].Step1Attempts!="undefined")
        		{
        			userDataSelected[0].ScoreData.Step1Attempts= userDataSelected[0].Step1Attempts;
        		}
        	}
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
        if (userDataSelectedAgent.length > 0) {
        	if (userDataSelectedAgent[0].AsignedToAgentId != null)
        	{
        		userDataSelected[0].AsignedToAgentId = userDataSelectedAgent[0].AsignedToAgentId;
          		userDataSelected[0].AsignedToAgentName = userDataSelectedAgent[0].AsignedToAgentName;
        	}

        }
        const UserServicesSelected = await FetchDataFromCollection("UserServices", 20, "__name__", "==", id, 0);
        if(UserServicesSelected.length > 0)
        {
        	Newway=true;
        	if(typeof UserServicesSelected[0]?.RotationData?.Rotations!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertRotationsObjectToArray(doc));

        		UserServicesSelected[0].RotationData.Rotations=convertedData[0].RotationData.Rotations;
        		AlreadRotationForBooking = JSON.parse(JSON.stringify(UserServicesSelected[0].RotationData.Rotations));
        		//if(UserServicesSelected[0].RotationData.Rotations=convertedData[0].RotationData.Rotations)

        	}
        	if(typeof UserServicesSelected[0]?.Match!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertMatchObjectToArray(doc));
        		UserServicesSelected[0].Match=convertedData[0].Match;
        		InitialMatchData = JSON.parse(JSON.stringify(UserServicesSelected[0].Match));
        	}
        	if(typeof UserServicesSelected[0]?.Research!=="undefined")
        	{

        		const convertedData = UserServicesSelected.map(doc => convertResearchObjectToArray(doc));
        		UserServicesSelected[0].Research=convertedData[0].Research;
        	}
        }


        const MatchPlanList = await FetchDataFromCollection("MatchPlans", 200, "Type", "==", "Match", 0);
        //const Matchlist = await FetchDataFromCollection("MatchPlans",500,"Pid","!=","",0);
        const  conditionsArrayNote =
    		[
  				[
    				{ name: "uid", condition: "==", value: id },
    				{ name: "NoteType", condition: "!=", value: "Questions" },
  				]
			  ];
        //const NoteSectionDataObj =await SelectWithComplexConditionsJoin("NotesSectionMatch",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        const CommonUserNotes =await SelectWithComplexConditionsJoin("UserCommonServiceNotes",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        /*if(NoteSectionDataObj.status=="success")
        {
        	if(NoteSectionDataObj.data.length)
        	{
        		setNoteSectionData(NoteSectionDataObj.data)
        	}

        }*/
        if(CommonUserNotes.status=="success")
        {
        	if(CommonUserNotes.data.length)
        	{
        		setCommonUserNotesData(CommonUserNotes.data)
        	}

        }
        const conditionsArrayEnquiry = [
      [{ name: "email", condition: "==", value: userDataSelected?.[0].email }],
      [{ name: "uid", condition: "==", value: userDataSelected?.[0].uid }]
    ];
    const EnquiriesList = await SelectWithComplexConditionsJoin("Enquiries", conditionsArrayEnquiry, "timestamp", "desc", null, "UsersRoles", "email", "email");

    if (EnquiriesList.status === "success" && EnquiriesList.data.length) {
      await fetchRotationDetailsForEnquiries(EnquiriesList.data);
    }
        //copyDocument('Users', 'fAOICMDcf5OWecNqLfuT4maEISw2', 'Users', 'oGtMolxkvjZ3ZJ08a3lwVGwoOcf1');
        const MatchPlanListObj = {};
         MatchPlanList.map(async item => {
          MatchPlanListObj[item.id] = item;
        });

        userDataSelected[0]["Services"]={};
		if(UserServicesSelected.length > 0)
		{
			 userDataSelected[0]["Services"]=UserServicesSelected[0];
			 setUserServicesTaken(UserServicesSelected[0]);
		}
        setMatchPlanListObject(MatchPlanListObj);
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
        	setPlan(userDataSelected[0]["Services"]?.Match?.Plan?.Name || '')
			setMatchSeason(userDataSelected[0]["Services"]?.Match?.Season || '')
			setStatus(userDataSelected[0]["Services"]?.Match?.Status?.Name || '');
			setNotes(userDataSelected[0]["Services"]?.Match?.Notes)
			if(userDataSelected[0]["Services"]?.Match?.createdAt)
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
				/*if(typeof userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value!=="undefined" && typeof userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value==="array")
				{
					console.log('userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value---->',typeof userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value)
					setMatchStatusNotApplyingSelected(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value || [])
					if(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Value?.includes("Other"))
					{
						setFutureApplicationSeasonCustomNote(userDataSelected[0]["Services"]?.Match?.Status?.Relation?.Other || '')
					}
				}*/

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
       	setrotationValues(rotationValues);
        }
		setUserData(userDataSelected[0]);
        // Set initial form data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    const formatFirestoreDate = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};
const fetchRotationDetailsForEnquiries = async (enquiries) => {
    const enrichedEnquiries = await Promise.all(
      enquiries.map(async (NotesObject) => {
        if (NotesObject?.rotationId) {
          const rotationDetails = await getRotationDetails(NotesObject.rotationId);
          return { ...NotesObject, rotationDetails };
        }
        return NotesObject;
      })
    );
    setEnquiriesWithRotation(enrichedEnquiries);
  };
   const getRotationDetails = async (rotationid) => {
    const rotationData = await FetchDataFromCollection("Rotations", 1, "__name__", "==", rotationid, 0);
    return rotationData?.length ? rotationData[0] : null;
  };
const convertRotationsObjectToArray = (rotationData) => {
  // Check if rotationData contains the Rotations field and if it's an object
  if (
    rotationData &&
    rotationData.RotationData &&
    rotationData.RotationData.Rotations &&
    typeof rotationData.RotationData.Rotations === 'object'
  ) {
    // Convert Rotations to an array and maintain sequence
    const rotationsArray = Object.entries(rotationData.RotationData.Rotations)
      .sort(([a], [b]) => a.localeCompare(b)) // Optional: Sort keys to maintain order if needed
      .map(([key, rotation]) => {

        // Convert RotationPayment from object to array and maintain sequence
        if (rotation && rotation.RotationPayment && typeof rotation.RotationPayment === 'object') {
          rotation.RotationPayment = Object.entries(rotation.RotationPayment)
            .sort(([a], [b]) => a.localeCompare(b)) // Maintain payment sequence
            .map(([paymentKey, payment]) => payment);
        //AlreadySavedPayment[rotation?.['LocationCode']?.['value']]=rotation.RotationPayment;
        AlreadySavedPayment[rotation?.['LocationCode']?.['value']] = JSON.parse(JSON.stringify(rotation.RotationPayment));

        }

        return {
          ...rotation,
          rotationKey: key, // Optionally preserve original key if needed
        };
      });

    // Return updated rotationData with Rotations as an array
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

const convertRotationsArrayToMap = (rotationData) => {
  if (rotationData && rotationData.Rotations && Array.isArray(rotationData.Rotations)) {
    const rotationsMap = rotationData.Rotations.reduce((acc, rotationkk, index) => {
      const key = `Rotation${index}`;

      // Convert RotationPayment from array to object if it exists
      let updatedRotation = { ...rotationkk }; // Create a shallow copy of rotationkk

      if (rotationkk.RotationPayment && Array.isArray(rotationkk.RotationPayment)) {
        NewPaymentadded[rotationkk?.['LocationCode']?.['value']]=rotationkk.RotationPayment;
        if(!NewPaymentaddedForSeats[rotationkk?.['LocationCode']?.['value']])
        {
          NewPaymentaddedForSeats[rotationkk?.['LocationCode']?.['value']]={}
        }
         NewPaymentaddedForSeats[rotationkk?.['LocationCode']?.['value']]['RotationDetails']=rotationkk;
        updatedRotation.RotationPayment = rotationkk.RotationPayment.reduce((paymentAcc, payment, paymentIndex) => {
          const keyPayment = `Payment${paymentIndex}`;
          paymentAcc[keyPayment] = payment;
          return paymentAcc;
        }, {});
      }

      acc[key] = updatedRotation; // Use the updated rotation
      return acc;
    }, {});

    return {
      ...rotationData,
      Rotations: rotationsMap,
    };
  }

  // If Rotations is not an array, return rotationData as is
  return rotationData;
};
/*const convertResearchObjectToArray = (rotationData) => {
  // Check if rotationData contains the Research field and if it's an object
  if (rotationData && rotationData.Research && typeof rotationData.Research === 'object') {
    // Convert the map to an array
    const rotationsArray = Object.keys(rotationData.Research).map(key => {
      const rotation = rotationData.Research[key];
      const ResearKey=formatDateToString(rotation['StartDate']);
      console.log("rotation--->",rotation)
      // Convert Payments from object to array if it exists
      if (rotation && rotation.Payments && typeof rotation.Payments === 'object') {
        rotation.Payments = Object.keys(rotation.Payments).map(paymentKey => rotation.Payments[paymentKey]);
        const List={...rotation.Payments,CourseName:rotation['CourseName'],PublicationType:rotation['PublicationType'],ResearchStatus:rotation['ResearchStatus']}
         AlreadySavedPaymentResearch[ResearKey] = JSON.parse(JSON.stringify(List));
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
};*/
const convertResearchObjectToArray = (rotationData) => {

  if (rotationData && rotationData.Research && typeof rotationData.Research === 'object') {
    const rotationsArray = Object.keys(rotationData.Research).map((key) => {
      const rotation = rotationData.Research[key];
      const ResearKey = formatDateToString(rotation['StartDate']);

      // Convert Payments from object to array
      if (rotation && rotation.Payments && typeof rotation.Payments === 'object') {
        const paymentArray = Object.keys(rotation.Payments).map(
          (paymentKey) => rotation.Payments[paymentKey]
        );

        // Store a deep copy of each payment with extra metadata
        AlreadySavedPaymentResearch[ResearKey] = paymentArray.map((payment) => ({
          ...payment,
          CourseName: rotation['CourseName'],
          PublicationType: rotation['PublicationType'],
          ResearchStatus: rotation['ResearchStatus'],
        }));

        // Replace Payments with the array
        rotation.Payments = paymentArray;
      }

      return rotation;
    });

    return {
      ...rotationData,
      Research: rotationsArray,
    };
  }

  return rotationData;
};
const formatDateToString = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};
const convertResearchArrayToObject = (rotationData) => {

  // Check if rotationData contains the Research field and if it's an array
  if (rotationData && rotationData.Research && Array.isArray(rotationData.Research)) {
    // Convert the array back to an object
    const researchObject = rotationData.Research.reduce((acc, rotation, index) => {
      const rotationKey = `Research${index}`;
      const ResearKey=formatDateToString(rotation['StartDate']);
       NewPaymentaddedResearch[ResearKey]=[];
      // Convert Payments array back to an object if it exists
      if (rotation && Array.isArray(rotation.Payments)) {
        rotation.Payments = rotation.Payments.reduce((paymentAcc, payment, paymentIndex) => {
          const paymentKey = `Payment${paymentIndex}`;
          paymentAcc[paymentKey] = payment;


         NewPaymentaddedResearch[ResearKey].push({...payment,CourseName:rotation['CourseName'],PublicationType:rotation['PublicationType'],ResearchStatus:rotation['ResearchStatus']});
          return paymentAcc;
        }, {});
        console.log("rotation.Payments---->",rotation.Payments)
      }

      acc[rotationKey] = rotation;
      return acc;
    }, {});


    // Return the newly created researchObject
    return {
      ...rotationData,
      Research: researchObject,
    };
  }

  // If Research is not an array, return rotationData as is
  return rotationData;
};
const convertMatchObjectToArray = (matchData) => {
  // Check if matchData contains the Match field and if it's an object
  if (matchData && matchData.Match && typeof matchData.Match === 'object') {
    // Convert the Payments object to an array
    if (matchData.Match.Payments && typeof matchData.Match.Payments === 'object') {
      matchData.Match.Payments = Object.keys(matchData.Match.Payments).map(paymentKey => matchData.Match.Payments[paymentKey]);
      AlreadySavedPaymentMatch = matchData.Match.Payments.map((payment) => ({
          ...payment,
          Plan: matchData.Match['Plan']?.Name,
        }));

      //AlreadySavedPaymentMatch=JSON.parse(JSON.stringify(matchData.Match.Payments));

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
const convertMatchArrayToObject = (matchData) => {
  // Check if matchData exists and if Payments is an array
  const matchDatain=matchData;
  console.log("matchData====>",matchData)
  if (matchDatain && Array.isArray(matchDatain.Payments)) {
    // Convert Payments array back to an object
    matchDatain.Payments = matchDatain.Payments.reduce((acc, payment, index) => {
      const paymentKey = `Payment${index}`;
      acc[paymentKey] = payment;
      return acc;
    }, {});
  }
console.log("matchDatain====>",matchDatain)
  return matchDatain;
};
/*const convertMatchObjectToArray = (matchData) => {
  if (matchData && matchData.Match && typeof matchData.Match === 'object') {
    
    const matchArray = Object.entries(matchData.Match)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, match]) => {

        // Convert Payments object → array
        if (match?.Payments && typeof match.Payments === 'object') {
          match.Payments = Object.entries(match.Payments)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([pKey, payment]) => payment);
        }

        return {
          ...match,
          matchKey: key
        };
      });

    return {
      ...matchData,
      Match: matchArray
    };
  }

  return matchData;
};
const convertMatchArrayToObject = (matchData) => {
  if (matchData && Array.isArray(matchData.Match)) {

    const matchMap = matchData.Match.reduce((acc, match, index) => {
      const key = `match${index}`;

      let updatedMatch = { ...match };

      // Convert Payments array → object
      if (Array.isArray(match.Payments)) {
        updatedMatch.Payments = match.Payments.reduce((pAcc, payment, pIndex) => {
          pAcc[`Payment${pIndex}`] = payment;
          return pAcc;
        }, {});
      }

      acc[key] = updatedMatch;
      return acc;
    }, {});

    return {
      ...matchData,
      Match: matchMap
    };
  }

  return matchData;
};*/


  const OnBoardingPopupOpen = ()=>{
  setOnBoardingOpen(true);
  }
  const OnBoardingClose = ()=>{
  setOnBoardingOpen(false);
  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
const validate = () => {
    const errors = {};
    if(!matchSeason)
    {
    	errors.matchSeason="Please Select Match Season";
    }
    if(!plan || plan.trim()==="")
    {
    	errors.plan="Please Select Match Plan";
    }
    else if(plan==="Custom" && !customPlan)
    {
    	errors.customPlan="Please Enter Value";
    }
    else if(plan==="SilverOnDemand" && SilverOnDemandMocks==null)
    {
    	errors.SilverOnDemandMocks="Please Select Mocks";
    }
    else if(plan==="SilverInteractive" && !SilverInteractiveMocks)
    {
    	errors.SilverInteractiveMocks="Please Select Mocks";
    }
    else if(plan==="Platinum" || plan==="Platinum&HackensackCombo"  || plan==="B2RPlatinumCombo" )
    {

    }
    /*if(!status)
    {
    	errors.status="Please Select Match Status";
    }*/
    //if(status==="NotApplying" && !MatchStatusNotApplyingSelected.length)
    if(status==="NotApplying" && (MatchStatusNotApplyingSelected==='' ||  typeof MatchStatusNotApplyingSelected==="undefined"))
    {
    	errors.MatchStatusNotApplyingSelected="Please Select Choice";
    }
    else if(status==="NotApplying" && MatchStatusNotApplyingSelected.length && MatchStatusNotApplyingSelected.includes("Other") && !FutureApplicationSeasonCustomNote)
    {
    	errors.FutureApplicationSeasonCustomNote="Please Enter Note";
    }
    if(MatchValues['PaymentPlan']==="")
    {
    	errors.MatchPaymentPlan="Please Select Match Plan";
    }
    if(MatchValues['EnrollmentDate']==="")
    {
    	errors.EnrollmentDate="Please Select Enrollement Date";
    }
    if(MatchValues['PaymentPlan']==="")
    {
    	errors.MatchPaymentPlan="Please Select Match Plan";
    }
    if(typeof MatchValues['PaymentPlan']==="undefined")
    {
    	errors.MatchPaymentPlan="Please Select Payment Plan";
    }
    else if(MatchValues['PaymentPlan']==="")
    {
    	errors.MatchPaymentPlan="Please Select Payment Plan";
    }
    if(typeof MatchValues['EnrollmentDate']==="undefined")
    {
    	errors.EnrollmentDate="Please Select Date";
    }
    else if(MatchValues['EnrollmentDate']==="")
    {
    	errors.EnrollmentDate="Please Select Date";
    }
    if(MatchValues?.['Refund']?.['Value']==="Yes")
    {
    	if(MatchValues?.['Refund']?.['RequestedDate']==="")
    	{
    		errors.MatchRefundRequestedDate="Please Select Refund Requested Date";
    	}
    	if(MatchValues?.['Refund']?.['ProcessedDate']==="")
    	{
    		errors.MatchRefundProcessedDate="Please Select Refund Processed Date";
    	}
    	if(MatchValues?.['Refund']?.['Reason']==="")
    	{
    		errors.MatchRefundReason="Please Enter Valid Reason Of Refund";
    	}
    	if(MatchValues?.['Refund']?.['Amount']==="")
    	{
    		errors.MatchRefundAmount="Please Enter Valid Refund Amount";
    	}
    }
    if(typeof  MatchValues['Payments']==="undefined")
    {
    	MatchValues['Payments']=[];
    }
     NoteSectionData.forEach((Notes,NotesInd) => {
      if(Notes['Notes']==="")
    	{
    		if(typeof errors?.NotesObject==="undefined")
    		{
    			errors.NotesObject={};
    		}
    		if(typeof errors?.NotesObject.Notes==="undefined")
    		{
    			errors.NotesObject.Notes={};
    		}
    		errors.NotesObject.Notes[NotesInd]="Please Enter Notes";
    	}
     })
    MatchValues['Payments'].forEach((Payt,Pyindex) => {
    	if(Payt['ModeOfPayment']==="")
    	{
    		if(typeof errors.MatchModeOfPayment==="undefined")
    		{
    			errors.MatchModeOfPayment={};
    		}
    		errors.MatchModeOfPayment[Pyindex]="Please Select Mode Of Payment";
    	}
    	if(Payt['Amount']==="" || typeof Payt['Amount']==="undefined")
    	{
    		if(typeof errors.MatchAmount==="undefined")
    		{
    			errors.MatchAmount={};
    		}
    		errors.MatchAmount[Pyindex]="Please Enter Amount";
    	}
    	else if(Payt['Amount']!=="" && typeof Payt['Amount']!=="undefined" && isNaN(Payt['Amount']))
    	{
    		if(typeof errors.MatchAmount==="undefined")
    		{
    			errors.MatchAmount={};
    		}
    		errors.MatchAmount[Pyindex]="Please Enter Valid Amount!(Without Any Special Character)";
    	}
    	if(Payt['PaymentDate']==="")
    	{
    		if(typeof errors.MatchPaymentDate==="undefined")
    		{
    			errors.MatchPaymentDate={};
    		}
    		errors.MatchPaymentDate[Pyindex]="Please Select Payment Date";
    	}
    	if(Payt['Discount']['Value']==="Yes")
    	{
    		if(Payt['Discount']['Amount']==="" || typeof Payt['Discount']['Amount']==="undefined")
    		{
    			if(typeof errors.MatchDiscountAmount==="undefined")
    			{
    				errors.MatchDiscountAmount={};
    			}
    			errors.MatchDiscountAmount[Pyindex]="Please Enter Discount Amount";
    		}
    		else if(Payt['Discount']['Amount']!=="" && typeof Payt['Discount']['Amount']!=="undefined" && isNaN(Payt['Discount']['Amount']))
    		{
    			if(typeof errors.MatchDiscountAmount==="undefined")
    			{
    				errors.MatchDiscountAmount={};
    			}
    			errors.MatchDiscountAmount[Pyindex]="Please Enter Valid Discount Amount!(Without Any Special Character)";
    		}
    	}
    })
    return errors;

  };

  const handleChangeMultiple = (event) => {
    let { target: { value } } = event;
    /*if(value.length>0)
    {
    	if(value[value.length-1]==="Other")
    	{
    		value=["Other"];
    	}
    	if(value.length===2 && value[0]==="Other")
    	{
    		value=[value[value.length-1]]
    	}
    }*/
    //setMatchStatusNotApplyingSelected(typeof value === 'string' ? value.split(',') : value);
     setMatchStatusNotApplyingSelected(value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };
  const handleFutureApplicationSeasonCustomNoteChange = (event) => {
    setFutureApplicationSeasonCustomNote(event.target.value);
  };

  const handlePlanChange = (event) => {
    setPlan(event.target.value);
  };

  const handleCustomPlanChange = (event) => {
    setCustomPlan(event.target.value);
  };

  const handleSilverInteractiveMocksChange = (event) => {
    setSilverInteractiveMocks(event.target.value);
  };
  const DateToYear = (dateString) => {
    const date = new Date(dateString);

// Example: Get the year only
	return date.getFullYear();
  };
 const handleNotesChange=(event) => {
    setNotes(event.target.value)
  };
const AddResearch =  async (loopindex) => {
  if(typeof researchValues['Research']==="undefined")
  {
  	researchValues['Research']=[];
  }
const newResearch = [...researchValues['Research']];
newResearch.push({});
setresearchValues((prevValues) => ({
    ...prevValues,
    Research: newResearch,
  }));
//setresearchValues(researchValues)
}
const DeleteResearch = (researchindex)=>{
 setresearchValues((prevValues) => {
    // Create a copy of the current rotations
    let newResearch = [...prevValues['Research']];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedRotation = newResearch.filter((_, index) => index !== researchindex);
    // Update the specific RotationPayment array in the copied rotations
    newResearch = updatedRotation;

    // Return the new state
    return {
      ...prevValues,
      Research: newResearch,
    };
  });
}
const AddFollowup = (followupno) => {
  /*console.log("CommonUserNotesData---->", CommonUserNotesData);

  // Create a new array instead of mutating the existing one
  const newMeetings = [...CommonUserNotesData, { name: "", description: "" }];

  // Update state with the new array
  setCommonUserNotesData(newMeetings);*/
  setCommonUserNotesData((prevData) => {
    const updatedNotes = [
    ...prevData,
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
          UserType: "Admin",
        },
      },
       // Spread the existing notes to keep them in the list
    ];
    return updatedNotes;
  });
};
const validateFollowups = async() =>
{
  const error=[];
  return error;
};
/*const DeleteFollowup = async(Followupid,FollowupIndex) =>{
      if(typeof Followupid!=="undefined")
      {
         const DeletionCondition=[
                              [
                                { name: "id", condition: "==", value: Followupid }
                              ]
                            ];
        let RetResultFollowups= deletedocumentfromid(DatabaseName,"followups",Followupid);
        console.log("RetResultFollowups====>",RetResultFollowups)
        if(RetResultFollowups['status']==="success")
        {
          TooltipsPopovers(RetResultFollowups['status'],RetResultFollowups['message'],"Status");
          //fetchData();
        }
      }
      else
      {
       setCommonUserNotesData((prevFollowUps) => {
  // Create a shallow copy of the object
  const updatedFollowUps = { ...prevFollowUps };

  // Delete the property at FollowupIndex
  delete updatedFollowUps[FollowupIndex];
  // Return the updated object
  return updatedFollowUps;
});
    TooltipsPopovers("success","Deleted Successfully!","Status");
          fetchData();
      }

  };*/
  const DeleteFollowup = async (Index) => {
  try {
  showLoading();
    // Ensure the note has an `id` before attempting to delete
    const noteToDelete = CommonUserNotesData[Index];
    if(typeof noteToDelete?.AddedBy?.id==="undefined" || noteToDelete?.AddedBy?.id===ActualUser.id || noteToDelete?.AddedBy?.UserType==="Student")
    {
    	if (noteToDelete?.id)
    	{
      		// Call the Firestore function to delete the document by ID
      		await deletedocumentfromid("UserCommonServiceNotes", noteToDelete.id);
      		await DeleteDocumentWhere("CrossSellFollowups", "id","==",noteToDelete.id);

    	}

    	// Update the local state to remove the deleted note
    	setCommonUserNotesData((prevData) => {
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
const SaveFollowups = async () => {
  showLoading();
  const validationErrors = await validateFollowups();

  if (Object.keys(validationErrors).length === 0) {
    let condition = [];
    const updatedFollowUps = { ...CommonUserNotesData };


    // Use Promise.all with .map() instead of forEach()
    await Promise.all(
      Object.entries(updatedFollowUps).map(async ([index, FOLLOWUPS]) => {
      //let CrossSellData=FOLLOWUPS;
      //CrossSellData.id=id;

        FOLLOWUPS.uid = id;
        FOLLOWUPS.email = userData.email;
        FOLLOWUPS.profile = userData;
      //console.log("CrossSellData--->",CrossSellData)
      console.log("FOLLOWUPS--->",FOLLOWUPS)
        if (FOLLOWUPS.id)
        {
          //CrossSellData.Followupid=FOLLOWUPS.id;
          if(typeof FOLLOWUPS?.AddedBy?.id==="undefined" || FOLLOWUPS?.AddedBy?.id===ActualUser.id || FOLLOWUPS?.AddedBy?.UserType==="Student")
          {
            if(FOLLOWUPS.NoteType==="Cross Sell")
            {
              await handleUpdateOrCreateByField(
              "CrossSellFollowups", "uid", id, FOLLOWUPS
              );
            }
            return await handleUpdateOrCreateByField(
              "UserCommonServiceNotes", "id", FOLLOWUPS.id, FOLLOWUPS
            );

          }
        } else
        {
          FOLLOWUPS.LastFollowUpDate=Timestamp.fromDate(new Date());
          if(FOLLOWUPS.NoteType==="Cross Sell")
            {
              await handleUpdateOrCreateByField(
              "CrossSellFollowups", "uid", id, FOLLOWUPS
              );
            }
          return await handleUpdateOrCreateByField(
            "UserCommonServiceNotes", "uid", null, FOLLOWUPS
          );

        }
      }


      )


    );
    const  conditionsArrayNote =
    		[
  				[
    				{ name: "uid", condition: "==", value: id }
  				]
			  ];
        //const NoteSectionDataObj =await SelectWithComplexConditionsJoin("NotesSectionMatch",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        const CommonUserNotes =await SelectWithComplexConditionsJoin("UserCommonServiceNotes",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        /*if(NoteSectionDataObj.status=="success")
        {
        	if(NoteSectionDataObj.data.length)
        	{
        		setNoteSectionData(NoteSectionDataObj.data)
        	}

        }*/
        if(CommonUserNotes.status=="success")
        {
        	if(CommonUserNotes.data.length)
        	{
        		setCommonUserNotesData(CommonUserNotes.data)
        	}

        }
const re=await handleUpdateOrCreateByField(
            "Users", "uid", userData.uid, userData
          );
    TooltipsPopovers("success", "Updated Successfully!", "Success");
    hideLoading();
  } else {
    seterrors(prevErrors =>
      JSON.stringify(prevErrors) !== JSON.stringify(validationErrors) ? validationErrors : prevErrors
    );
    TooltipsPopovers("error", "Please Fill All Required Fields", "Error");
    hideLoading();
  }
};

const handleResearchChange =  async (event,name="",SecName="",loop=-1,paymentIndex=-1) => {
let value;

// Determine the value based on the event properties
if (event.target) {
  value = event.target.value;
} else if (event.$d) {
  //value = event.format("YYYY-MM-DD HH:mm:ss");
  value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  value = Timestamp.fromDate(new Date(value))
} else if (event.label) {
  value = event;
} else {
  value = event;  // Consider reviewing if `event.label` is the intended fallback
}

let newResearchValues = {};

// Create a deep copy of the current researchValues['Research'] or an empty object if undefined
newResearchValues = researchValues['Research'];

// Initialize the nested structures as needed

if (!newResearchValues[loop]) {
  newResearchValues[loop] = {};
}



// Update the appropriate location with the new value
if (paymentIndex !== -1) {
if (!newResearchValues[loop]['Payments']) {
  newResearchValues[loop]['Payments'] = [];
}
if (!newResearchValues[loop]['Payments'][paymentIndex]) {
  newResearchValues[loop]['Payments'][paymentIndex] = {};
}
if(SecName!=='')
{
	if(typeof newResearchValues[loop]['Payments'][paymentIndex][name]==="undefined")
	{
		newResearchValues[loop]['Payments'][paymentIndex][name]={};
	}
	newResearchValues[loop]['Payments'][paymentIndex][name][SecName] = value;
}
else
{
	newResearchValues[loop]['Payments'][paymentIndex][name] = value;
}

} else {
  newResearchValues[loop][name] = value;
}
// Set the updated research values into the state
setresearchValues((prevValues) => ({
  ...prevValues,
  'Research': newResearchValues,
}));
}
const handleRotationChange = async (event,name="",loop=-1,paymentIndex=-1) => {

  let value;
  if(typeof event.target!="undefined")
  {
  	value=event.target.value;
  }
  else if(typeof event.$d!="undefined")
  {
    //value = moment(event).toDate();
  	value= event.toDate();
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

    if (value === "Not taken" && (name==='Step1Score')) {
      setrotationValues((prevValues) => ({
        ...prevValues,
        Step1Score: {
          ...prevValues.Step1Score,
          Selected: { Name: value, Value: value },
        },
        Step2Score: {
          ...prevValues.Step2Score,
          Selected: { Name: value, Value: value },
        },
        Step3Score: {
          ...prevValues.Step3Score,
          Selected: { Name: value, Value: value },
        },
      }));
    }
    else if(name==='GraduationDate')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        GraduationDate: value,
      }));
    }
    else if(name==='Step1ScoreMarks' )
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        Step1Score: {
          ...prevValues.Step1Score,
          Selected: { Name: rotationValues['Step1Score']['Selected']['Name'], Value: value },
        },
      }));
    }
    else if(name==='Step2ScoreMarks')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        Step2Score: {
          ...prevValues['Step2Score'],
          Selected: { Name: rotationValues['Step2Score']['Selected']['Name'], Value: value },
        },
      }));
    }
    else if(name==='Step1Attempts')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        Step1Attempts: value
      }));
    }
    else if(name==='Step3ScoreMarks')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        Step3Score: {
          ...prevValues['Step3Score'],
          Selected: { Name: rotationValues['Step3Score']['Selected']['Name'], Value: value },
        },
      }));
    }
    else if(name==='NameOfMedicalSchool')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchool: value,
      }));
    }
    else if(name==='NameOfMedicalSchoolOthers')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        NameOfMedicalSchoolOthers: value,
      }));
    }
    else if(name==='PriorUSCE')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        PriorUSCE: value,
      }));
    }
    else if( name==='StudentTimeOfRotation')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        StudentTimeOfRotation: value,
      }));
    }
    else if(name==='YearYouAreApplyingForResidency')
    {
    	setrotationValues((prevValues) => ({
        ...prevValues,
        YearYouAreApplyingForResidency: value,
      }));
    }
    else if(name==='EnrollmentDate')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'EnrollmentDate': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='PhysicianCheckPoint')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'PhysicianCheckPoint': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='StudentCheckPoint')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'StudentCheckPoint': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='LocationCode')
    {
      value={value:value.value.replace(/\s+/g, ''),label:value.label.replace(/\s+/g, ''),FieldName:value.FieldName};
    	 const newRotations = [...rotationValues['Rotations']];
  newRotations[loop] = {
    ...newRotations[loop],
    'LocationCode': value
  };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
     // setLocationCodeSelected(event);
      const LocationS = await FetchDataFromCollection("Rotations",5000,"location_code","==",value.value,0);
      if(LocationS.length)
      {
      		rotationValues['Rotations'][loop]['LocationCode']=value;
      		rotationValues['Rotations'][loop]['StateOfRotation']=LocationS[0].state || "";
        	rotationValues['Rotations'][loop]['Speciality']=LocationS[0].specialty || "";
       		rotationValues['Rotations'][loop]['TypeOfRotation']=LocationS[0].type || "";
       		rotationValues['Rotations'][loop]['DurationOfRotation']=LocationS[0].duration || "";
       		//rotationValues['Rotations'][loop]['DurationOfRotation']=LocationS[0].duration;
       		setrotationValues(rotationValues)
      }
      else
      {
      		rotationValues['Rotations'][loop]['LocationCode']=value;
      		rotationValues['Rotations'][loop]['StateOfRotation']='';
        	rotationValues['Rotations'][loop]['Speciality']='';
       		rotationValues['Rotations'][loop]['TypeOfRotation']='';
       		rotationValues['Rotations'][loop]['DurationOfRotation']='';
       		rotationValues['Rotations'][loop]['DurationOfRotation']='';
       		setrotationValues(rotationValues)
      }
      setrotationValues(rotationValues);
    // const options = LocationS.map(state => ({ value: state.id, label: state.location_code ,FieldName:"LocationCode"}));
     //setRotationStates(options);
    }
    else if(name==='DurationOfRotation')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'DurationOfRotation': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationType')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationType': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationRescheduledFrom')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationRescheduledFrom': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='ContractStatus')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'ContractStatus': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='ContractHoldNote')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'ContractHoldNote': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='ContractSignedDate')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'ContractSignedDate': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='StartDate')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'StartDate': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationPaymentStatus')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationPaymentStatus': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
     else if(name==='PhysicianName')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'PhysicianName': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationStatus')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationStatus': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationReview')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationReview': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
     else if(name==='RotationFeesToSarthi')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationFeesToSarthi': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationNotes')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'RotationNotes': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationVisa')
    {


      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['RotationVisa'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationVisaAmount')
    {

      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['RotationVisaAmount'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationVisaAmountDate')
    {

      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['RotationVisaAmountDate'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='VisaLetterType')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['VisaLetterType'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='VisaLetterOfPurpose')
    {

       const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['VisaLetterOfPurpose'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='VisaLetterStatus')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['VisaLetterStatus'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationVisaStatus')
    {

       const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['RotationVisaStatus'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='AcceptanceLetter')
    {

      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['AcceptanceLetter'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='VisaLetterNote')
    {

       const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationVisaSection'][paymentIndex]['VisaLetterNote'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingAssistanceNeeded')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingAssistanceNeeded': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingApplicationFeePaidStatus')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingApplicationFeePaidStatus': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingCode')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingCode': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingApplicationAmount')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingApplicationAmount': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingAmount')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingAmount': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='HousingNotes')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
   		 ...newRotations[loop],
    		'HousingNotes': value
  		};
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='TeamMemberInTouchForRefund')
    {
      const newRotations = [...rotationValues['Rotations']];

  		newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'TeamMemberInTouchForRefund': value,
        }
      };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundRequestDate')
    {
      const newRotations = [...rotationValues['Rotations']];

  		newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundRequestDate': value,
        }
      };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundStatus')
    {
      const newRotations = [...rotationValues['Rotations']];

  		newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundStatus': value,
        }
      };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundType')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundType': value,
        }
      };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='ModeOfRefund')
    {
      const newRotations = [...rotationValues['Rotations']];
      newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'ModeOfRefund': value,
        }
      };

    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundAmount')
    {
      const newRotations = [...rotationValues['Rotations']];
       newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundAmount': value,
        }
      };
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundDate')
    {
      const newRotations = [...rotationValues['Rotations']];
       newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundDate': value,
        }
      };

    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RefundNote')
    {
      const newRotations = [...rotationValues['Rotations']];
  		 newRotations[loop] = {
        ...newRotations[loop],
        'RefundData': {
          ...(newRotations[loop].RefundData || {}),
          'RefundNote': value,
        }
      };

    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='FeeType')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['FeeType'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='ModeOfPayment')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['ModeOfPayment'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='CouponCode')
    {
     const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['CouponCode'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));

    }
    else if(name==='RotationPaymentAmount')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['Amount'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='PaymentDate')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['PaymentDate'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='PaymentNotify')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['PaymentNotify'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='NotifyDate')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['NotifyDate'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else if(name==='RotationPaymentNotes')
    {
      const newRotations = [...rotationValues['Rotations']];
  		newRotations[loop]['RotationPayment'][paymentIndex]['RotationPaymentNotes'] = value;
    	setrotationValues((prevValues) => ({
        ...prevValues,
        'Rotations': newRotations,
      }));
    }
    else
    {
      setrotationValues((prevValues) => ({
        ...prevValues,
        [name]: {
          ...prevValues[name],
          Selected: { Name: value},
          //Selected: { Name: value, Value: rotationValues[name]['Selected']['Value'] },
        },
      }));
    }
  };
const AddRotationPayment = (PaymentLoop,RotationLoop,Type="Rotation") =>{
		if(Type==="Rotation")
		{
			if(typeof rotationValues['Rotations']==="undefined")
			{
				rotationValues['Rotations']=[];
			}
			const newRotations = [...rotationValues['Rotations']];
  newRotations[RotationLoop]['RotationPayment'].push({FeeType:'',Amount:'',PaymentDate:'',PaymentActualAddedDate:Timestamp.fromDate(new Date(dayjs())),ModeOfPayment:'',CouponCode:'',RotationPaymentNotes:''});
  setrotationValues((prevValues) => ({
    ...prevValues,
    Rotations: newRotations,
  }));
		}
		else if(Type==="Research")
		{
			if(typeof researchValues['Research']==="undefined")
			{
				researchValues['Research']=[];
			}
			if(typeof researchValues['Research'][RotationLoop]['Payments']==="undefined")
			{
				researchValues['Research'][RotationLoop]['Payments']=[];
			}
			const newRotations = [...researchValues['Research']];
  newRotations[RotationLoop]['Payments'].push({FeeType:'',Amount:'',PaymentDate:'',PaymentActualAddedDate:Timestamp.fromDate(new Date(dayjs())),ModeOfPayment:'',CouponCode:'',RotationPaymentNotes:''});
  setresearchValues((prevValues) => ({
    ...prevValues,
    Research: newRotations,
  }));
		}
		else
		{
			if(typeof MatchValues['Payments']==="undefined")
			{
				MatchValues['Payments']=[];
			}
			const existingPayments = MatchValues?.Payments || [];

  // 🔴 Reset all previous PaymentNotify
  const newRotations = existingPayments.map((p) => ({
    ...p,
    PaymentNotify: "no"
  }));
    
			console.log("MatchValues['Payments']====>",MatchValues['Payments'])
			//const newRotations = [...MatchValues['Payments']];
  newRotations.push({Discount:{
      Value: '',
      Code: '',
      Amount: '',
      Notes: ''
    },ModeOfPayment:'',Amount:'',PaymentDate:'',PaymentActualAddedDate:Timestamp.fromDate(new Date(dayjs()))});
    console.log("newRotations====>",newRotations)
  setMatchValues((prevValues) => ({
    ...prevValues,
    Payments: newRotations,
  }));
		}
  };
const AddRotation = (RotationIndex) =>{
  	const newRotations = [...rotationValues['Rotations']];
  newRotations.push({
    EnrollmentDate: '',
    LocationCode: '',
    StateOfRotation: '',
    Speciality:'',
    TypeOfRotation:'',
    DurationOfRotation:'',
    ContractStatus:'',
    ContractHoldNote:'',
    StartDate:'',
    RotationPaymentStatus:'',
    PhysicianName:'',
    RotationStatus:'',
    RotationReview:'',
    RotationVisa:'',
    RotationVisaAmount:'',
    VisaLetterType:'',
    AcceptanceLetter:'',
    VisaLetterNote:'',
    HousingApplicationFeePaidStatus:'',
    HousingCode:'',
    HousingApplicationAmount:'',
    HousingAmount:'',
    HousingNotes:'',
    RotationFeesToSarthi:'',
    RefundType:'',
    RefundNote:'',
    RotationPayment:[{CustomNote:CancleApplicationCustomNote,FeeType:CancleApplicationFeeType,Amount:CancleApplicationPaymentAmount,PaymentDate:CancleApplicationPaymentDate,ModeOfPayment:CancleApplicationModeOfPayment,CouponCode:CancleApplicationCouponCode}],
  });
  setrotationValues((prevValues) => ({
    ...prevValues,
    Rotations: newRotations,
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
/*const DeleteRotation =  (rotationindex)=>{
	setrotationValues( (prevValues) => {
    // Create a copy of the current rotations
    let newRotations = [...prevValues['Rotations']];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedRotation = newRotations.filter((_, index) => index !== rotationindex);
    // Update the specific RotationPayment array in the copied rotations
    newRotations = updatedRotation;

    // Return the new state
    return {
      ...prevValues,
      Rotations: newRotations,
    };
  });

}*/
const DeleteBooking = async (locationCode, monthYear,id) =>
{
   const rotationObject = await FetchDataFromCollection(
    "Rotations",
    20,
    "location_code",
    "==",
    locationCode,
    0
  );

  // 5️⃣ Check if booking exists
  if (rotationObject.length) {
    const rotationDoc = rotationObject[0];
    const docId = rotationDoc?.DOCUMENTID || rotationDoc?.documentid || rotationDoc?.id;

    if (rotationDoc?.Bookings?.[monthYear]?.[id]) {
      const bookingPath = `Bookings.${monthYear}.${id}`;

      // ✅ Confirmation popup
      const confirmDelete = window.confirm(
        "⚠️ This seat is already booked.\nDo you want to unreserve this seat?"
      );

      if (confirmDelete) {
        try {
          const resDel = await deleteFieldFromDocument("Rotations", docId, bookingPath);
          console.log("✅ Booking deleted:", bookingPath, resDel);
        } catch (err) {
          console.error("❌ Error deleting booking:", err);
        }
      } else {
        console.log("🚫 Deletion cancelled by user.");
        return; // stop further execution
      }
    }
  }
}
const DeleteRotation = async (rotationIndex) => {
  // 1️⃣ Make a copy of current state
  const currentRotations = [...rotationValues.Rotations]; // assuming from useState

  // 2️⃣ Identify deleted rotation
  const deletedRotation = currentRotations.find((_, index) => index === rotationIndex);

  if (!deletedRotation) {
    console.warn("⚠️ No rotation found at index:", rotationIndex);
    return;
  }

  // 3️⃣ Extract details
  const locationCode = deletedRotation?.LocationCode?.value;
  const startDate = deletedRotation?.StartDate?.seconds
    ? new Date(deletedRotation.StartDate.seconds * 1000)
    : new Date(deletedRotation?.StartDate);

  const month = String(startDate.getMonth() + 1).padStart(2, "0");
  const year = startDate.getFullYear();
  const monthYear = `${month}-${year}`;


  // 4️⃣ Fetch rotation document from Firestore
  const rotationObject = await FetchDataFromCollection(
    "Rotations",
    20,
    "location_code",
    "==",
    locationCode,
    0
  );

  // 5️⃣ Check if booking exists
  if (rotationObject.length) {
    const rotationDoc = rotationObject[0];
    const docId = rotationDoc?.DOCUMENTID || rotationDoc?.documentid || rotationDoc?.id;

    if (rotationDoc?.Bookings?.[monthYear]?.[id]) {
      const bookingPath = `Bookings.${monthYear}.${id}`;

      // ✅ Confirmation popup
      const confirmDelete = window.confirm(
        "⚠️ This seat is already booked.\nDo you want to unreserve this seat?"
      );

      if (confirmDelete) {
        try {
          const resDel = await deleteFieldFromDocument("Rotations", docId, bookingPath);
          console.log("✅ Booking deleted:", bookingPath, resDel);
        } catch (err) {
          console.error("❌ Error deleting booking:", err);
        }
      } else {
        console.log("🚫 Deletion cancelled by user.");
        return; // stop further execution
      }
    }
  }

  // 6️⃣ Remove from local state
  const updatedRotations = currentRotations.filter((_, index) => index !== rotationIndex);

  setrotationValues((prevValues) => ({
    ...prevValues,
    Rotations: updatedRotations,
  }));
};
const validateOnBoarding = () => {
    const errors = {};
  if(typeof MatchValues['OnBoarding']=="undefined")
  {
  	errors['FullForm']="You Can't Submit Empty Form";
  }
  else
  {
  	Object.keys(MatchValues['OnBoarding']).map((key,value) =>{

  	if(MatchValues['OnBoarding'][key]['Value']==="Other")
  	{
  		if(typeof MatchValues['OnBoarding'][key]['Relation']==="undefined")
  		{
  			errors[key+'Custom']="Please Enter Custom Value";
  		}
  		else if(typeof MatchValues['OnBoarding'][key]['Relation']['Other']==="undefined")
  		{
  			errors[key+'Custom']="Please Enter Custom Value";
  		}
  	}
  	if(key==="ResidencyMatchWebsiteAccess")
  	{
  		if(MatchValues['OnBoarding'][key]['Value']==="Activated")
  		{
  			if(typeof MatchValues['OnBoarding'][key]['Relation']==="undefined")
  			{
  				errors[key+'ProfileStatus']="Please Select Profile Status";
  			}
  		}

  	}
  	else if(key==="OrientationMeetWithAdminTeam" || key==="OrientationMeetWithPawan")
  	{
  		if(MatchValues['OnBoarding'][key]['Value']==="Completed")
  		{
  			if(typeof MatchValues['OnBoarding'][key]['Relation']==="undefined")
  			{
  				errors[key+'Date']="Please Select Date Of Completion";
  			}
  		}

  	}
  	return '';
  });
  if(Object.keys(errors).length !== 0)
  {
  	errors['FullForm']="Please Go To The Form And Check Errors";
  }
  }




    return errors;
  };
const SaveOnBoarding = () => {
showLoading();
const validationErrors = validateOnBoarding();
setErrors(validationErrors);
 if (Object.keys(validationErrors).length === 0) {

    	 let dataTobesend={};
    	 dataTobesend['uid']=id;
    	dataTobesend['Match']=MatchValues;
     	handleUpdate("UserServices",id,dataTobesend).then((result) => {
     		setOperationMessage(result.message);
     		hideLoading();
     		setOpen(true);

     	});
    }
    else
    {
    	hideLoading();
    	setOperationMessage(errors['FullForm']);
     	setOpen(true);
    }
}
const validateRotation = () => {
    const errors = {};
   rotationValues['Rotations'].forEach((rotat,Roindex) => {
   	if(typeof rotat['LocationCode']?.['value']!="undefined" && rotat['LocationCode']?.['value']!=='')
   	{
  	if(rotat['EnrollmentDate']==='')
  	{
  		if (typeof errors.EnrollmentDate === "undefined")
  		{
      		errors.EnrollmentDate = [];
    	}
  		errors.EnrollmentDate[Roindex]="Please Select Rotation Enrollment Date.";
  	}
  	if(rotat['RotationFeesToSarthi']==='')
  	{
  		if (typeof errors.RotationFeesToSarthi === "undefined")
  		{
      		errors.RotationFeesToSarthi = [];
    	}
  		errors.RotationFeesToSarthi[Roindex]="Please Select If Rotation Fees Is Taken By Sarthi.";
  	}
  	if(rotat['LocationCode']['FieldName']==='' || rotat['LocationCode']==='')
  	{
  		if (typeof errors.LocationCode === "undefined")
  		{
      		errors.LocationCode = [];
    	}
  		errors.LocationCode[Roindex]="Please Select Location Code.";
  	}
  	if(rotat?.['ContractStatus']?.['label']==='' || rotat['ContractStatus']==='')
  	{
  		if (typeof errors.ContractStatus === "undefined")
  		{
      		errors.ContractStatus = [];
    	}
  		errors.ContractStatus[Roindex]="Please Select Contract Status.";
  	}
  	else if(rotat?.['ContractStatus']?.['label']==='Hold')
  	{
  		if(rotat['ContractHoldNote']==='' || typeof rotat['ContractHoldNote']==='undefined')
  		{
  			if (typeof errors.ContractHoldNote === "undefined")
  			{
      			errors.ContractHoldNote = [];
    		}
  			errors.ContractHoldNote[Roindex]="Please Enter Note For Contract Hold.";
  		}
  	}
  	if(rotat['StartDate']==='')
  	{
  		if (typeof errors.StartDate === "undefined")
  		{
      		errors.StartDate = [];
    	}
  		errors.StartDate[Roindex]="Please Select Rotation Start Date.";
  	}
  	if(rotat?.['RotationPaymentStatus']?.['label']==='' || rotat?.['RotationPaymentStatus']==='')
  	{
  		if (typeof errors.RotationPaymentStatus === "undefined")
  		{
      		errors.RotationPaymentStatus = [];
    	}
  		errors.RotationPaymentStatus[Roindex]="Please Select Rotation Start Date.";
  	}
  	/*if(rotat['PhysicianName']==='')
  	{
  		if (typeof errors.PhysicianName === "undefined")
  		{
      		errors.PhysicianName = [];
    	}
  		errors.PhysicianName[Roindex]="Please Select Rotation Start Date.";
  	}*/
  	if(rotat?.['RotationStatus']?.['label']==='' || rotat?.['RotationStatus']==='')
  	{
  		if (typeof errors.RotationStatus === "undefined")
  		{
      		errors.RotationStatus = [];
    	}
  		errors.RotationStatus[Roindex]="Please Select Rotation Status.";
  	}
  	if((rotat?.['RotationReview']?.['label']==='' || rotat?.['RotationReview']==='') &&  rotat['RotationStatus']?.['label']==='Rotation  completed')
  	{
  		if (typeof errors.RotationReview === "undefined")
  		{
      		errors.RotationReview = [];
    	}
  		errors.RotationReview[Roindex]="Please Select Rotation Review.";
  	}
  	/*if(rotat['RotationVisa']['label']==='' || rotat['RotationVisa']==='')
  	{
  		if (typeof errors.RotationVisa === "undefined")
  		{
      		errors.RotationVisa = [];
    	}
  		errors.RotationVisa[Roindex]="Please Select Rotation Visa.";
  	}
  	else if(rotat['RotationVisa']['label']==='Paid Only Registration Fees')
  	{
  		if(rotat['RotationVisaAmount']==="")
  		{
  			if (typeof errors.RotationVisa === "undefined")
  			{
      			errors.RotationVisaAmount = [];
    		}
  			errors.RotationVisaAmount[Roindex]="Please Enter Visa Amount";
  		}
  		if(rotat['VisaLetterType']['label']==='' || rotat['VisaLetterType']==='')
  		{
  			if (typeof errors.VisaLetterType === "undefined")
  			{
      			errors.VisaLetterType = [];
    		}
  			errors.VisaLetterType[Roindex]="Please Select Visa Status.";
  		}
  		if(rotat['AcceptanceLetter']['label']==='' || rotat['AcceptanceLetter']==='')
  		{
  			if (typeof errors.AcceptanceLetter === "undefined")
  			{
      			errors.AcceptanceLetter = [];
    		}
  			errors.AcceptanceLetter[Roindex]="Please Select Acceptance Letter.";
  		}
  	}*/
  	/*if(rotat['HousingAssistanceNeeded']?.['label']==='' || rotat['HousingAssistanceNeeded']==='' || typeof rotat['HousingAssistanceNeeded']==="undefined")
  	{
  		if (typeof errors.HousingAssistanceNeeded === "undefined")
  		{
      		errors.HousingAssistanceNeeded = [];
    	}
  		errors.HousingAssistanceNeeded[Roindex]="Please Select If Housing Assistance Is Needed.";
  	}
  	if(rotat['HousingApplicationFeePaidStatus']['label']==='' || rotat['HousingApplicationFeePaidStatus']==='')
  	{
  		if (typeof errors.HousingApplicationFeePaidStatus === "undefined")
  		{
      		errors.HousingApplicationFeePaidStatus = [];
    	}
  		errors.HousingApplicationFeePaidStatus[Roindex]="Please Select If Application Fee Is Paid.";
  	}*/
  	if((rotat?.['HousingCode']?.['label']==='' || rotat?.['HousingCode']==='') && rotat['HousingApplicationFeePaidStatus']?.value==="yes")
  	{
  		if (typeof errors.HousingCode === "undefined")
  		{
      		errors.HousingCode = [];
    	}
  		errors.HousingCode[Roindex]="Please Select Housing Code.";
  	}
  	 if(rotat?.['RefundData']?.['RefundType']?.['label']!=='' && rotat['RefundData']!=='' && typeof rotat['RefundData']!=="undefined")
  	{
  		/*if(rotat['RefundData']['TeamMemberInTouchForRefund']?.['label']==='' || typeof rotat['RefundData']['TeamMemberInTouchForRefund']==="undefined")
  		{
  			if (typeof errors.TeamMemberInTouchForRefund === "undefined")
  			{
      			errors.TeamMemberInTouchForRefund = [];
    		}
  			errors.TeamMemberInTouchForRefund[Roindex]="Please Select Mode Of Refund.";
  		}
  		if(rotat?.['RefundData']?.['ModeOfRefund']==='' || typeof rotat?.['RefundData']?.['ModeOfRefund']==="undefined")
  		{
  			if (typeof errors.ModeOfRefund === "undefined")
  			{
      			errors.ModeOfRefund = [];
    		}
  			errors.ModeOfRefund[Roindex]="Please Select Mode Of Refund.";
  		}
  		if(rotat?.['RefundData']?.['RefundAmount']==='' || typeof rotat['RefundData']?.['RefundAmount']==="undefined")
  		{
  			if (typeof errors.RefundAmount === "undefined")
  			{
      			errors.RefundAmount = [];
    		}
  			errors.RefundAmount[Roindex]="Please Enter Amount To Refund.";
  		}
  		else if(rotat?.['RefundData']?.['RefundAmount']!=='' && typeof rotat?.['RefundData']?.['RefundAmount']!=="undefined" && isNaN(rotat['RefundData']['RefundAmount']))
  		{
  			if (typeof errors.RefundAmount === "undefined")
  			{
      			errors.RefundAmount = [];
    		}
  			errors.RefundAmount[Roindex]="Please Enter Valid Amount Without Currency Symbol Etc.";
  		}
  		if(rotat?.['RefundData']?.['RefundDate']==='' || typeof rotat?.['RefundData']?.['RefundDate']==="undefined")
  		{
  			if (typeof errors.RefundDate === "undefined")
  			{
      			errors.RefundDate = [];
    		}
  			errors.RefundDate[Roindex]="Please Select Date Of Refund.";
  		}
  		if(rotat['RefundData']?.['RefundNote']==='')
  		{
  			if (typeof errors.RefundNote === "undefined")
  			{
      			errors.RefundNote = [];
    		}
  			errors.RefundNote[Roindex]="Please Enter Reason Of Refund.";
  		}*/
  	}
  	}
  	rotat['RotationPayment'].forEach((Payt,Paindex) => {
  		if(Payt['ModeOfPayment']['label']==='' || Payt['ModeOfPayment']==='')
  		{
  			if (typeof errors.ModeOfPayment === "undefined")
  			{
      			errors.ModeOfPayment = [];
      			errors.ModeOfPayment[Roindex]=[];
    		}
  			errors.ModeOfPayment[Roindex][Paindex]="Please Select Mode Of Payment.";
  		}
  		if(Payt['FeeType']?.['label']==='' || Payt['FeeType']==='' || typeof Payt['FeeType']==="undefined")
  		{
  			if (typeof errors.FeeType === "undefined")
  			{
      			errors.FeeType = [];
      			errors.FeeType[Roindex]=[];
    		}
  			errors.FeeType[Roindex][Paindex]="Please Select Fee Type.";
  		}
  		if(Payt['Amount']==='' || typeof Payt['Amount']==="undefined")
  		{
  			if (typeof errors.Amount === "undefined")
  			{
      			errors.Amount = [];
      			errors.Amount[Roindex]=[];
    		}
  			errors.Amount[Roindex][Paindex]="Please Enter Payment Amount.";
  		}
  		else if(Payt['Amount']!=='' && typeof Payt['Amount']!=="undefined" && isNaN(Payt['Amount']))
  		{
  			if (typeof errors.Amount === "undefined")
  			{
      			errors.Amount = [];
      			errors.Amount[Roindex]=[];
    		}
  			errors.Amount[Roindex][Paindex]="Please Enter Valid Payment Amount. Like(34 without currency symbol)";
  		}
  		if(Payt['PaymentDate']==='')
  		{
  			if (typeof errors.PaymentDate === "undefined")
  			{
      			errors.PaymentDate = [];
      			errors.PaymentDate[Roindex]=[];
    		}
  			errors.PaymentDate[Roindex][Paindex]="Please Select Payment Date.";
  		}
  	})
  });



    return errors;
  };
 const detectCriticalRotationChanges = (oldRotations, newRotations) => {
  const criticalChanges = {
    fullPaymentWithChanges: [],      // Full payment + location/date changed
    multipleInstallmentsWithChanges: [], // Multiple installments + location/date changed
    allCritical: []                  // All critical rotations combined
  };

  newRotations.forEach((newRotation, index) => {
    // Skip if no location or date
    if (!newRotation?.LocationCode?.value || !newRotation?.StartDate) return;

    const oldRotation = oldRotations[index];
    
    // Check if this rotation has critical payment status
    const paymentStatus = checkCriticalPaymentStatus(newRotation);
    
    // If no critical payment, skip
    if (!paymentStatus.isCritical) return;

    // Check for location/date changes
    const locationChanged = oldRotation?.LocationCode?.value !== newRotation.LocationCode.value;
    const dateChanged = oldRotation?.StartDate ? 
      formatFirestoreDate(oldRotation.StartDate) !== formatFirestoreDate(newRotation.StartDate) : 
      false;
    
    const hasLocationDateChange = locationChanged || dateChanged;

    // If both critical payment AND location/date change
    if (hasLocationDateChange) {
      const changeInfo = {
        index: index + 1,
        location: {
          old: oldRotation?.LocationCode?.value || 'N/A',
          new: newRotation.LocationCode.value,
          changed: locationChanged
        },
        date: {
          old: oldRotation?.StartDate ? formatFirestoreDate(oldRotation.StartDate) : 'N/A',
          new: formatFirestoreDate(newRotation.StartDate),
          changed: dateChanged
        },
        payment: {
          type: paymentStatus.type,
          details: paymentStatus.details,
          amount: paymentStatus.amount,
          installments: paymentStatus.installments
        },
        rotation: newRotation
      };

      // Categorize by payment type
      if (paymentStatus.type === 'full') {
        criticalChanges.fullPaymentWithChanges.push(changeInfo);
      } else if (paymentStatus.type === 'multiple_installments') {
        criticalChanges.multipleInstallmentsWithChanges.push(changeInfo);
      }

      criticalChanges.allCritical.push(changeInfo);
    }
  });

  return criticalChanges;
};

// Helper function to check critical payment status
const checkCriticalPaymentStatus = (rotation) => {
  const result = {
    isCritical: false,
    type: null,
    details: null,
    amount: null,
    installments: 0
  };

  if (!rotation.RotationPayment || !Array.isArray(rotation.RotationPayment)) {
    return result;
  }

  const payments = rotation.RotationPayment;
  const validPayments = payments.filter(p => p.Amount && parseFloat(p.Amount) > 0);
  
  if (validPayments.length === 0) return result;

  // Check for FULL PAYMENT
  const fullPayment = payments.find(p => 
    p.FeeType === 'rotation full payment' && p.Amount && parseFloat(p.Amount) > 0
  );

  if (fullPayment) {
    result.isCritical = true;
    result.type = 'full';
    result.details = 'Full rotation payment detected';
    result.amount = fullPayment.Amount;
    return result;
  }

  // Check for MULTIPLE INSTALLMENTS
  const installments = payments.filter(p => 
    p.FeeType === 'rotation fee installment' && p.Amount && parseFloat(p.Amount) > 0
  );

  if (installments.length > 1) {
    result.isCritical = true;
    result.type = 'multiple_installments';
    result.details = `Multiple installments (${installments.length}) detected`;
    result.installments = installments.length;
    result.amount = installments.reduce((sum, p) => sum + parseFloat(p.Amount), 0);
    return result;
  }

  // Check for 1 installment + any other payment type
  if (installments.length === 1 && validPayments.length > 1) {
    result.isCritical = true;
    result.type = 'multiple_installments';
    result.details = `1 installment + ${validPayments.length - 1} other payment(s)`;
    result.installments = 1;
    result.amount = validPayments.reduce((sum, p) => sum + parseFloat(p.Amount), 0);
    return result;
  }

  return result;
};

// Enhanced logging function
const logCriticalRotationChanges = (criticalChanges) => {
  console.log("══════════════════════════════════════════");
  console.log("🔴 CRITICAL ROTATION CHANGES DETECTED");
  console.log("══════════════════════════════════════════");

  if (criticalChanges.allCritical.length === 0) {
    console.log("✅ No critical rotations with changes found");
    return;
  }

  console.log(`📊 TOTAL CRITICAL ROTATIONS: ${criticalChanges.allCritical.length}`);
  
  // Log Full Payment + Changes
  if (criticalChanges.fullPaymentWithChanges.length > 0) {
    console.log("\n💰 FULL PAYMENT + LOCATION/DATE CHANGES:");
    criticalChanges.fullPaymentWithChanges.forEach(rot => {
      console.log(`  Rotation #${rot.index}:`);
      console.log(`    └─ Location: ${rot.location.old} → ${rot.location.new} ${rot.location.changed ? '✓' : '✗'}`);
      console.log(`    └─ Date: ${rot.date.old} → ${rot.date.new} ${rot.date.changed ? '✓' : '✗'}`);
      console.log(`    └─ Payment: $${rot.payment.amount} (FULL PAYMENT)`);
    });
  }

  // Log Multiple Installments + Changes
  if (criticalChanges.multipleInstallmentsWithChanges.length > 0) {
    console.log("\n💳 MULTIPLE INSTALLMENTS + LOCATION/DATE CHANGES:");
    criticalChanges.multipleInstallmentsWithChanges.forEach(rot => {
      console.log(`  Rotation #${rot.index}:`);
      console.log(`    └─ Location: ${rot.location.old} → ${rot.location.new} ${rot.location.changed ? '✓' : '✗'}`);
      console.log(`    └─ Date: ${rot.date.old} → ${rot.date.new} ${rot.date.changed ? '✓' : '✗'}`);
      console.log(`    └─ Payment: ${rot.payment.installments} installments, Total: $${rot.payment.amount}`);
      console.log(`    └─ Details: ${rot.payment.details}`);
    });
  }

  console.log("\n══════════════════════════════════════════");
};
const getYearMonth = (date) => {
  if (!date) return null;
  
  let dateObj;
  if (date.seconds) {
    // Firestore Timestamp
    dateObj = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    // JavaScript Date object
    dateObj = date;
  } else if (typeof date === 'string') {
    // String date
    dateObj = new Date(date);
  } else {
    return null;
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${month}-${year}`; // Format: YYYY-MM
};

// Updated change detection function
const detectLocationDateChanges = (oldRotations, newRotations) => {
  const changes = {
    locationChanged: [],
    dateChanged: [],
    bothChanged: [],
    hasChanges: false
  };

  newRotations.forEach((newRotation, index) => {
    // Skip if no location or date in new rotation
    if (!newRotation?.LocationCode?.value || !newRotation?.StartDate) return;

    const oldRotation = oldRotations[index];
    
    // Skip if no old rotation to compare with
    if (!oldRotation) return;

    const oldLocation = oldRotation.LocationCode?.value;
    const newLocation = newRotation.LocationCode.value;
    
    // Compare only year and month
    const oldYearMonth = oldRotation.StartDate ? getYearMonth(oldRotation.StartDate) : null;
    const newYearMonth = newRotation.StartDate ? getYearMonth(newRotation.StartDate) : null;

    const locationChanged = oldLocation !== newLocation;
    const dateChanged = oldYearMonth !== newYearMonth;

    if (locationChanged && dateChanged) {
      changes.bothChanged.push({
        index: index + 1,
        oldLocation,
        newLocation,
        oldYearMonth,
        newYearMonth,
        rotation: newRotation
      });
      changes.hasChanges = true;
    } else if (locationChanged) {
      changes.locationChanged.push({
        index: index + 1,
        oldLocation,
        newLocation,
        yearMonth: newYearMonth,
        rotation: newRotation
      });
      changes.hasChanges = true;
    } else if (dateChanged) {
      changes.dateChanged.push({
        index: index + 1,
        oldYearMonth,
        newYearMonth,
        location: newLocation,
        rotation: newRotation
      });
      changes.hasChanges = true;
    }
  });

  return changes;
};
// Function to check if a rotation has changes AND critical payment
const hasCriticalChange = (oldRotation, newRotation) => {
  if (!newRotation?.LocationCode?.value || !newRotation?.StartDate) return false;

  // Check for location/date changes
  const locationChanged = oldRotation?.LocationCode?.value !== newRotation.LocationCode.value;
  const dateChanged = oldRotation?.StartDate ? 
    formatFirestoreDate(oldRotation.StartDate) !== formatFirestoreDate(newRotation.StartDate) : 
    false;
  
  if (!locationChanged && !dateChanged) return false;

  // Check for critical payment
  const payments = newRotation.RotationPayment || [];
  const validPayments = payments.filter(p => p.Amount && parseFloat(p.Amount) > 0);
  
  if (validPayments.length === 0) return false;

  // Check full payment
  const hasFullPayment = payments.some(p => p.FeeType === 'rotation full payment');
  if (hasFullPayment) return true;

  // Check multiple installments
  const installments = payments.filter(p => p.FeeType === 'rotation fee installment').length;
  if (installments > 1) return true;
  if (installments === 1 && validPayments.length > 1) return true;

  return false;
};
const SaveRotation = async (event) =>{
	const validationErrors = validateRotation();

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
    showLoading();
    const oldRotations = AlreadRotationForBooking || [];
    const newRotations = [...rotationValues.Rotations];
    
    //const criticalChanges = detectCriticalRotationChanges(oldRotations, newRotations);
     const changes = detectLocationDateChanges(oldRotations, newRotations);

    if (changes.hasChanges) 
    {
      if (changes.locationChanged.length > 0) 
      {
        for (const change of changes.locationChanged) {
        await DeleteBooking(change.oldLocation,change.yearMonth,id);
        }
      }
      if (changes.dateChanged.length > 0) 
      {
        for (const change of changes.dateChanged) {
        await DeleteBooking(change.location,change.oldYearMonth,id);
        }
      }
      if (changes.bothChanged.length > 0) 
      {
        for (const change of changes.bothChanged) {
        await DeleteBooking(change.oldLocation,change.oldYearMonth,id);
        }
      }
    }
    //await SaveBookings(toRemove, toAdd, toUpdate);
    let dataTobesend={};
    	dataTobesend['uid']=id;
    	const org=rotationValues;

    	const convertedDataForSaving = convertRotationsArrayToMap(org);
    	const resultPay=detectNewPayments(AlreadySavedPayment,NewPaymentadded);
    	console.log("resultPay======>",resultPay)
    	
    	if(Object.keys(resultPay).length)
    	{
    	  
    	  //sendPaymentConfirmation(resultPay);
    	}
    	if (Object.keys(resultPay).length) 
    	{
        //sendPaymentConfirmation(resultPay);
        const confirmReserve = confirm("Do you want to reserve this seat?");
        
        if (confirmReserve) 
        {
          Object.keys(resultPay).forEach(async key => 
          {
            const paymentsPro = resultPay[key][0];
            const RotationCodeCheck=key
            const LocationCheckStart=NewPaymentaddedForSeats[key]['RotationDetails']['StartDate'];
            //const locationCode = deletedRotation?.LocationCode?.value;
            const startDate = LocationCheckStart?.seconds
              ? new Date(LocationCheckStart.seconds * 1000)
              : new Date(LocationCheckStart);
            const DateDay = String(startDate.getDate()).padStart(2, "0");
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            const year = startDate.getFullYear();
            const monthYearDay = `${year}-${month}-${DateDay}`;
            const monthYear = `${month}-${year}`;
            console.log("paymentsPro===>",paymentsPro)
            const rotationObject = await FetchDataFromCollection(
              "Rotations",
              20,
              "location_code",
              "==",
              RotationCodeCheck,
              0
            );
            if (rotationObject.length) 
            {
                let bookingData = {
                    uid: id,
                    email: userData.email,
                    locationCode: RotationCodeCheck,
                    startDate: monthYearDay,
                    amount: paymentsPro.Amount
                  };
                const rotationDoc = rotationObject[0];
                const docIdCheck = rotationDoc?.DOCUMENTID || rotationDoc?.documentid || rotationDoc?.id;
                const rotationData = rotationDoc;
                if (!rotationData.Bookings) rotationData.Bookings = {};
                if (!rotationData.Bookings[monthYear]) rotationData.Bookings[monthYear] = {};
                rotationData.Bookings[monthYear][id] = bookingData;
                const ReCh=await handleUpdate("Rotations",docIdCheck,rotationData);
                console.log("ReCh------>",ReCh)
                alert("Seat reserved successfully!");
              } 
              else 
              {
                alert("Rotation not found for this location code.");
              }
          })
            
        } 
        else 
        {
          alert("Seat reservation cancelled.");
        }
      }

    	dataTobesend['RotationData']=convertedDataForSaving;
    	if(Newway)
    	{
    	  console.log("UserServices---->",dataTobesend)
    		handleUpdateEx("UserServices",id,dataTobesend).then((result) => {
    		console.log("result--->",result)
     		setOperationMessage(result.message);
     		setOpen(true);
     		hideLoading();
     	});
    	}
    	else
    	{
    		handleUpdate("UserServices",id,dataTobesend).then((result) => {
     		setOperationMessage(result.message);
     		setOpen(true);
     		hideLoading();
     	});
    	}



    }
    else
    {
    	setOperationMessage("Please Go To The Form And Check Errors");
     	setOpen(true);
    }
}
const isSamePayment = (a, b) => {
  return (
    a.Amount === b.Amount &&
    new Date(a.PaymentDate?.seconds * 1000).getTime() === new Date(b.PaymentDate?.seconds * 1000).getTime()
  );
};

const detectNewPayments = (savedPayments, newPayments,PaymentType="rotation") => {

if(PaymentType==="rotation")
{
  const result = {};
  Object.keys(newPayments).forEach((rotationKey) => {
      console.log("rotationKey---->",rotationKey)
      console.log("newPayments[rotationKey]---->",newPayments[rotationKey])
    const newList = newPayments[rotationKey] || [];
    const oldList = savedPayments[rotationKey] || [];
    const addedPayments = newList.filter((newPayment) =>
      !oldList.some((oldPayment) => isSamePayment(oldPayment, newPayment))
    );

    if (addedPayments.length > 0) {
      result[rotationKey] = addedPayments;
    }
  });
  return result;
}
else if(PaymentType==="match")
{
  return newPayments.filter(
    (newPayment) =>
      !savedPayments.some((oldPayment) => isSamePayment(oldPayment, newPayment))
  );

}
else if(PaymentType==="research" )
{
  const result = {};
  Object.keys(newPayments).forEach((rotationKey) => {
    const newList = newPayments[rotationKey] || [];
    const oldList = savedPayments[rotationKey] || [];
    const addedPayments = newList.filter((newPayment) =>
      !oldList.some((oldPayment) => isSamePayment(oldPayment, newPayment))
    );

    if (addedPayments.length > 0) {
      result[rotationKey] = addedPayments;
    }
  });
  return result;
}

};
const sendPaymentConfirmation = async (PaymentObject,ServiceType="rotation") => {
 /* const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
*/

if(ServiceType=="rotation")
{
  for (const [RotationCode, payments] of Object.entries(PaymentObject))
  {
    let dataTobesend={};
    for (const payment of payments)
    {
       const date = new Date(payment.PaymentDate.seconds * 1000);

// Format to MM/DD/YYYY
const usFormattedDate = `${(date.getMonth() + 1)
  .toString()
  .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
       const DataToNotify={
    to: userData.email,
    message: {
      subject: "Payment Confirmation ",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <p>Dear ${userData.displayName || 'Student'},</p>

            <p>Thank you for your Payment( Details are below).</p>

            <ul>
              <li>Rotation Code: ${RotationCode}.</li>
              <li>Amount: $${payment.Amount}</li>
              <li>Payment Date: ${usFormattedDate}</li>
            </ul>
            <p>Please Login To Your Dashboard <a href="https://student.usmlesarthi.com/">Here</a> To Check More Details.</p>

            <p>Thanks & Regards,<br/>
            USMLE Sarthi Team</p>
          </body>
        </html>
      `,
    },
  }
    const docuId=userData.uid+"_"+RotationCode;
    const resk=await deletedocumentfromid("NotifyPayments",docuId);
    if(payment.PaymentNotify==="yes")
    {
        dataTobesend=payment;
        dataTobesend['uid']=userData.uid;
        dataTobesend['displayName']=userData.displayName;
        dataTobesend['RotationCode']=RotationCode;
        dataTobesend['email']=userData.email;
        dataTobesend['NotificationType']="rotation";
        handleUpdate("NotifyPayments", docuId, dataTobesend)
    }
    await handleAdd("mail",DataToNotify);
    }
  }
}
else if(ServiceType=="match")
{
    let dataTobesend={};
    for (const payment of PaymentObject)
    {
       const date = new Date(payment.PaymentDate.seconds * 1000);

// Format to MM/DD/YYYY
const usFormattedDate = `${(date.getMonth() + 1)
  .toString()
  .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
       const DataToNotify={
    to: userData.email,
    message: {
      subject: "Payment Confirmation ",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <p>Dear ${userData.displayName || 'Student'},</p>

            <p>Thank you for your Payment( Details are below).</p>

            <ul>
              <li>Service:Match</li>
              <li>Plan:${payment.Plan}</li>
              <li>Amount: $${payment.Amount}</li>
              <li>Payment Date: ${usFormattedDate}</li>
            </ul>
            <p>Please Login To Your Dashboard <a href="https://student.usmlesarthi.com/">Here</a> To Check More Details.</p>

            <p>Thanks & Regards,<br/>
            USMLE Sarthi Team</p>
          </body>
        </html>
      `,
    },
  }
    const docuId=userData.uid+"_Match";
    const resk=await deletedocumentfromid("NotifyPayments",docuId);

    if(payment.PaymentNotify==="yes")
    {
        dataTobesend=payment;
        dataTobesend['uid']=userData.uid;
        dataTobesend['displayName']=userData.displayName;
        dataTobesend['email']=userData.email;
        dataTobesend['Plan']=payment.Plan;
        dataTobesend['NotificationType']="match";
        handleUpdate("NotifyPayments", docuId, dataTobesend)
    }
    await handleAdd("mail",DataToNotify);

    }
}
else if(ServiceType=="research")
{
  for (const [RotationCode, payments] of Object.entries(PaymentObject))
  {

    let dataTobesend={};
    for (const payment of payments)
    {
       const date = new Date(payment.PaymentDate.seconds * 1000);

// Format to MM/DD/YYYY
const usFormattedDate = `${(date.getMonth() + 1)
  .toString()
  .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
       const DataToNotify={
    to: userData.email,
    message: {
      subject: "Payment Confirmation ",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <p>Dear ${userData.displayName || 'Student'},</p>

            <p>Thank you for your Payment( Details are below).</p>

            <ul>
              <li>Service: Research.</li>
              <li>CourseName: ${payment.CourseName}</li>
              <li>PublicationType: ${payment.PublicationType}</li>
              <li>ResearchStatus: ${payment.ResearchStatus}</li>
              <li>Amount: $${payment.Amount}</li>
              <li>Payment Date: ${usFormattedDate}</li>
            </ul>
            <p>Please Login To Your Dashboard <a href="https://student.usmlesarthi.com/">Here</a> To Check More Details.</p>

            <p>Thanks & Regards,<br/>
            USMLE Sarthi Team</p>
          </body>
        </html>
      `,
    },
  }
    const docuId=userData.uid+"_"+RotationCode;
    const resk=await deletedocumentfromid("NotifyPayments",docuId);

    if(payment.PaymentNotify==="yes")
    {
        dataTobesend=payment;
        dataTobesend['uid']=userData.uid;
        dataTobesend['displayName']=userData.displayName;
        dataTobesend['RotationCode']=RotationCode;
        dataTobesend['PublicationType']=payment.PublicationType;
        dataTobesend['CourseName']=payment.CourseName;
        dataTobesend['ResearchStatus']=payment.ResearchStatus;
        dataTobesend['email']=userData.email;
        dataTobesend['NotificationType']="research";
        handleUpdate("NotifyPayments", docuId, dataTobesend)
    }
    await handleAdd("mail",DataToNotify);
    }
  }
}

  //await handleAdd("mail",)
};
const DeleteLetter = (LetterIndex, RotationLoop) => {

  // Clone the existing Rotations
  const newRotations = [...rotationValues['Rotations']];

  // Get the current RotationVisaSection object
  const currentVisaSection = { ...newRotations[RotationLoop]['RotationVisaSection'] };

  // Delete the specified key
  delete currentVisaSection[`Letter${LetterIndex}`];

  // Reorder the keys
  const reorderedVisaSection = {};
  Object.values(currentVisaSection).forEach((value, index) => {
    reorderedVisaSection[`Letter${index}`] = value;
  });

  // Update the RotationVisaSection with reordered keys
  newRotations[RotationLoop]['RotationVisaSection'] = reorderedVisaSection;

  // Update the state
  setrotationValues((prevValues) => ({
    ...prevValues,
    Rotations: newRotations,
  }));
};
const AddRotationLetter = (Letterindex,RotationLoop) =>
{
	const newRotations = [...rotationValues['Rotations']];
  newRotations[RotationLoop]['RotationVisaSection']['Letter'+Letterindex]={}
  setrotationValues((prevValues) => ({
    ...prevValues,
    Rotations: newRotations,
  }));
}
const DeletePayment = (paymentindex,RotationLoop,Type="Rotation")=>{
  if(Type==='Rotation')
  {
  	setrotationValues((prevValues) => {
    // Create a copy of the current rotations
    const newRotations = [...prevValues['Rotations']];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedRotationPayment = newRotations[RotationLoop]['RotationPayment'].filter((_, index) => index !== paymentindex);
    // Update the specific RotationPayment array in the copied rotations
    newRotations[RotationLoop]['RotationPayment'] = updatedRotationPayment;

    // Return the new state
    return {
      ...prevValues,
      Rotations: newRotations,
    };
  });
  }
  else if(Type==='Research')
  {
  	setresearchValues((prevValues) => {
    // Create a copy of the current rotations
    const newResearch = [...prevValues['Research']];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedResearchPayment = newResearch[RotationLoop]['Payments'].filter((_, index) => index !== paymentindex);
    // Update the specific RotationPayment array in the copied rotations
    newResearch[RotationLoop]['Payments'] = updatedResearchPayment;

    // Return the new state
    return {
      ...prevValues,
      Research: newResearch,
    };
  });
  }
  else
  {
  	setMatchValues((prevValues) => {
    // Create a copy of the current rotations
    const newRotations = [...prevValues['Payments']];
    // Create a copy of the RotationPayment array without the item to be deleted
    const updatedRotationPayment = newRotations.filter((_, index) => index !== paymentindex);
    // Update the specific RotationPayment array in the copied rotations
    const newRotations2 = updatedRotationPayment;

    // Return the new state
    return {
      ...prevValues,
      Payments: newRotations2,
    };
  });
  }


}
const handleSilverOnDemandMocksChange = (event) => {
    setSilverOnDemandMocks(event.target.value);
  };
const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowScrollDown(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight);
    }
  };
const HandleOnBoardingChange = (event,name,hasrelation=false,subname="") =>{
if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowScrollDown(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight);
    }
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
if(typeof MatchValues['OnBoarding']=="undefined")
{
	MatchValues['OnBoarding']={};
}

      let newval=MatchValues['OnBoarding'];
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
        'OnBoarding': newval,
      }));
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
const HandleMentorChange = (event,name,hasrelation=false,subname="") =>{
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
if(typeof MatchValues['MentorAssignment']=="undefined")
{
	MatchValues['MentorAssignment']={Meetings:[]};
}

      let newval=MatchValues['MentorAssignment'];
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
        'MentorAssignment': newval,
      }));
}
const HandleMatchChange = (event,name,PayInd) =>{
let value;
  if(typeof event.target!="undefined")
  {
  	value=event.target.value;
  }
  else if(typeof event.$d!="undefined")
  {
  	value=event;
  }
  else if(typeof event.label!="undefined")
  {
  	value=event;
  }
  else if(typeof event[0]!="undefined")
  {
  	value=event;
  }
  else
  {
  	 value=event.label;
  }
  	if(typeof MatchValues['Payments']==="undefined")
    {
    		MatchValues['Payments']=[];
    }
    if(name==='PaymentPlan')
    {
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'PaymentPlan': value,
      }));

    }
    else if(name==='ModeOfPayment')
    {

    	let newval=MatchValues['Payments'];
		newval[PayInd]['ModeOfPayment']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
    else if(name==='MatchPaymentAmount')
    {

    	let newval=MatchValues['Payments'];
		newval[PayInd]['Amount']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
    else if(name==='PaymentDate')
    {

    	let newval=MatchValues['Payments'];
		newval[PayInd]['PaymentDate']=value.toLocaleString('en-GB', { timeZone: 'GMT' });
		newval[PayInd]['PaymentDate'] = Timestamp.fromDate(new Date(newval[PayInd]['PaymentDate']));
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
    else if(name==='PaymentNotify')
    {

    	let newval=MatchValues['Payments'];
		newval[PayInd]['PaymentNotify']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
    else if(name==='NotifyDate')
    {

    	let newval=MatchValues['Payments'];
		newval[PayInd]['NotifyDate']=value.toLocaleString('en-GB', { timeZone: 'GMT' });
		newval[PayInd]['NotifyDate'] = Timestamp.fromDate(new Date(newval[PayInd]['NotifyDate']));
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
    else if(name==='EnrollmentDate')
    {
    	let tmp=value.toLocaleString('en-GB', { timeZone: 'GMT' });
    	tmp = Timestamp.fromDate(new Date(tmp));
    	setMatchValues((prevValues) => ({
        ...prevValues,
        EnrollmentDate: tmp,
      }));
    }
    else  if(name==='DiscountValue' )
	{
		let newval=MatchValues['Payments'];
		newval[PayInd]['Discount']['Value']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));

    }
    else  if(name==='DiscountCode' )
	{
      let newval=MatchValues['Payments'];
		newval[PayInd]['Discount']['Code']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));

    }
   	else  if(name==='DiscountAmount' )
	{

		let newval=MatchValues['Payments'];
		newval[PayInd]['Discount']['Amount']=value;

    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
    }
  else  if(name==='DiscountNotes' )
	{
      let newval=MatchValues['Payments'];
		newval[PayInd]['Discount']['Notes']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
  }
  else  if(name==='GeneralNotes' )
	{
      let newval=MatchValues['Payments'];
		newval[PayInd]['GeneralNotes']=value;
    	setMatchValues((prevValues) => ({
        ...prevValues,
        'Payments': newval,
      }));
  }
  else  if(name==='TeamMemberInTouchForRefund' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['TeamMemberInTouchForRefund']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
    else  if(name==='RefundRequestDate' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
    	newval['RefundRequestDate']=value.toLocaleString('en-GB', { timeZone: 'GMT' });
		newval['RefundRequestDate'] = Timestamp.fromDate(new Date(newval['RefundRequestDate']));
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
  else  if(name==='RefundStatus' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['RefundStatus']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
  else  if(name==='RefundType' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['RefundType']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
    else  if(name==='ModeOfRefund' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['ModeOfRefund']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
  else  if(name==='RefundAmount' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['RefundAmount']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
    else  if(name==='RefundDate' )
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
    	newval['RefundDate']=value.toLocaleString('en-GB', { timeZone: 'GMT' });
		newval['RefundDate'] = Timestamp.fromDate(new Date(newval['RefundDate']));
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
    else  if(name==='RefundNote')
	{
    	let newval=MatchValues['RefundData'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['RefundNote']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'RefundData': newval,
      }));
    }
    else  if(name==='RefundValue' )
	{
    	let newval=MatchValues['Refund'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['Value']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'Refund': newval,
      }));
    }

    else  if(name==='RefundRequestedDate' )
	{
    	let newval=MatchValues['Refund'];
    	if(typeof newval==="undefined")
    	{
			newval={};
    	}
		newval['RequestedDate']=value.toLocaleString('en-GB', { timeZone: 'GMT' });
		newval['RequestedDate'] = Timestamp.fromDate(new Date(newval['RequestedDate']));
		setMatchValues((prevValues) => ({
        ...prevValues,
        'Refund': newval,
      }));
    }
    else  if(name==='RefundReason' )
	{
    	let newval=MatchValues['Refund'];
		newval['Reason']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'Refund': newval,
      }));
    }
  else  if(name==='RefundChannel' )
	{
    	let newval=MatchValues['Refund'];
		newval['Channel']=value;
		setMatchValues((prevValues) => ({
        ...prevValues,
        'Refund': newval,
      }));
  }
  else
  {
		setMatchValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
  }
}
const handleMatchSeasonChange = (event) => {
    setMatchSeason(event.target.value);
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
const handleDynamicChange= (event, plan)=>{
	switch (plan) {
    case 'SilverOnDemand':
      handleSilverOnDemandMocksChange(event);
      break;
    case 'SilverInteractive':
      handleSilverInteractiveMocksChange(event);
      break;
    // Add more cases as needed for other plans
    default:
      console.error(`Unhandled plan: ${plan}`);
      break;
  }
}
const validateResearch = () => {
    const errors = {};
   researchValues['Research'].forEach((rotat,Roindex) => {
  	if( typeof rotat['EnrollmentDate']==="undefined" || rotat['EnrollmentDate']==='')
  	{
  		if (typeof errors.EnrollmentDate === "undefined")
  		{
      		errors.EnrollmentDate = [];
    	}
  		errors.EnrollmentDate[Roindex]="Please Select Enrollment Date.";
  	}
  	if( typeof rotat['CourseName']==="undefined" || rotat['CourseName']==='')
  	{
  		if (typeof errors.CourseName === "undefined")
  		{
      		errors.CourseName = [];
    	}
  		errors.CourseName[Roindex]="Please Select Course Name.";
  	}
  	/*if(typeof rotat['Topic']==="undefined" || rotat['Topic']==='')
  	{
  		if (typeof errors.Topic === "undefined")
  		{
      		errors.Topic = [];
    	}
  		errors.Topic[Roindex]="Please Select Topic.";
  	}*/
  	if(typeof rotat['StartDate']==="undefined" || rotat['StartDate']==='')
  	{
  		if (typeof errors.StartDate === "undefined")
  		{
      		errors.StartDate = [];
    	}
  		errors.StartDate[Roindex]="Please Select Start Date.";
  	}
  	/*if(typeof rotat['PublicationType']==="undefined" || rotat['PublicationType']==='')
  	{
  		if (typeof errors.PublicationType === "undefined")
  		{
      		errors.PublicationType = [];
    	}
  		errors.PublicationType[Roindex]="Please Select Publication Type.";
  	}*/
  	if(typeof rotat['ResearchStatus']==="undefined" || rotat['ResearchStatus']==='')
  	{
  		if (typeof errors.ResearchStatus === "undefined")
  		{
      		errors.ResearchStatus = [];
    	}
  		errors.ResearchStatus[Roindex]="Please Select Research Status.";
  	}
  	if(typeof rotat['Payments']!=="undefined")
  	{
  		rotat['Payments'].forEach((Paymnt,PayIndex) =>
  		{
  			if(typeof Paymnt['FeeType']==="undefined" || Paymnt['FeeType']==='')
  			{
  				if (typeof errors.FeeType === "undefined")
  				{
      				errors.FeeType = [];
    			}
    			if (typeof errors.FeeType[Roindex] === "undefined")
  				{
      				errors.FeeType[Roindex] = [];
    			}
  				errors.FeeType[Roindex][PayIndex]="Please Select Fee Type.";
  			}
  			if(typeof Paymnt['ModeOfPayment']==="undefined" || Paymnt['ModeOfPayment']==='')
  			{
  				if (typeof errors.ModeOfPayment === "undefined")
  				{
      				errors.ModeOfPayment = [];
    			}
    			if (typeof errors.ModeOfPayment[Roindex] === "undefined")
  				{
      				errors.ModeOfPayment[Roindex] = [];
    			}
  				errors.ModeOfPayment[Roindex][PayIndex]="Please Select Mode Of Payment.";
  			}
  			if(typeof Paymnt['Amount']==="undefined" || Paymnt['Amount']==='')
  			{
  				if (typeof errors.Amount === "undefined")
  				{
      				errors.Amount = [];
    			}
    			if (typeof errors.Amount[Roindex] === "undefined")
  				{
      				errors.Amount[Roindex] = [];
    			}
  				errors.Amount[Roindex][PayIndex]="Please Enter Amount.";
  			}
  			else if(rotat['Amount']!=='' && typeof rotat['Amount']!=="undefined" && isNaN(rotat['Amount']))
  			{
  				if (typeof errors.Amount === "undefined")
  				{
      				errors.Amount = [];
    			}
  				errors.Amount[Roindex]="Please Enter Valid Amount Without Currency Symbol Etc.";
  			}
  			if(typeof Paymnt['PaymentDate']==="undefined" || Paymnt['PaymentDate']==='')
  			{
  				if (typeof errors.PaymentDate === "undefined")
  				{
      				errors.PaymentDate = [];
    			}
    			if (typeof errors.PaymentDate[Roindex] === "undefined")
  				{
      				errors.PaymentDate[Roindex] = [];
    			}
  				errors.PaymentDate[Roindex][PayIndex]="Please Select Payment Date.";
  			}
  		})
  	}
  });

    console.log("Rotation Errors=======>",errors)

    return errors;
  };
/*const handleUpdateResearch = () => {
    //status
    //matchSeason
    showLoading();
    var dataTobesend={};
    dataTobesend['uid']=id;

    dataTobesend['Research']=researchValues['Research'];
    const org = dataTobesend;
  console.log("dataTobesend--->",dataTobesend)
  // Convert Payments array to an object if necessary
  const convertedDataForSaving = convertResearchArrayToObject(org);
  console.log("convertedDataForSaving--->",convertedDataForSaving)
    const validationErrors = validateResearch();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {

     	handleUpdate("UserServices",id,dataTobesend).then((result) => {
     		setOperationMessage(result.message);
     		setOpen(true);
     		hideLoading();
     	});


    }
    else
    {
    	 hideLoading();
    }
  };*/
/*const AddNotesSection = (index) => {
 setNoteSectionData((prevData) => {
    const updatedNotes = [...prevData]; // Clone the existing array
    updatedNotes.splice(index, 0, {
      NotesDate: Timestamp.fromDate(new Date()), // Firestore Timestamp with the current date
      NoteType: '', // Add any other required fields with default values
      TeamMember: '',
      Notes: '',
      ActionItem: '',
      AddedBy:{displayName:ActualUser.displayName,email:ActualUser.email,id:ActualUser.id,UserType:"Admin"}
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
          UserType: "Admin",
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
    if(typeof noteToDelete?.AddedBy?.id==="undefined" || noteToDelete?.AddedBy?.id===ActualUser.id || noteToDelete?.AddedBy?.UserType==="Student")
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
  	 setNoteSectionData((prevValues) => {
    const updatedNotes = [...prevValues]; // Make a copy of the array
    updatedNotes[Index] = {
      ...updatedNotes[Index], // Copy existing note data
      [name]: value, // Update the specific field
    };

    return updatedNotes;
  });
}
const NextFollowupChange = (event,name) =>
{
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
  	setUserData((prevValues) => ({
  ...prevValues,
 [name]: value
}));
}
const handleCopy = async (url,which) => {
    await navigator.clipboard.writeText(url);

  };
const HandleCommonNotesSectionChange = (event,name,Index) =>{
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
  	 setCommonUserNotesData((prevValues) => {
    const updatedNotes = [...prevValues]; // Make a copy of the array
    updatedNotes[Index] = {
      ...updatedNotes[Index], // Copy existing note data
      [name]: value, // Update the specific field
    };

    return updatedNotes;
  });
}
  const handleUpdateResearch = async () => {
  showLoading();
  let dataTobesend = {};

  // Prepare the data to be sent
  dataTobesend['uid'] = id;
  dataTobesend['Research'] = _.cloneDeep(researchValues['Research']);
 console.log("dataTobesend['Research']--->",dataTobesend['Research'])
  // Convert Research array back to an object if necessary
  const convertedDataForSaving = convertResearchArrayToObject(dataTobesend);
  // Update dataTobesend with the converted Research object
  //dataTobesend['Research'] = { ...convertedDataForSaving };

  // Validate Research data before saving
  const validationErrors = validateResearch();
  console.log("validationErrors---->",validationErrors)
  seterrorsResearch(validationErrors);

  if (Object.keys(validationErrors).length === 0) {
    // Proceed to update the data
    const resultPay=detectNewPayments(AlreadySavedPaymentResearch,NewPaymentaddedResearch,"research");
    	if(Object.keys(resultPay).length)
    	{
    	  sendPaymentConfirmation(resultPay,"research");
    	}

    dataTobesend['Research']=convertedDataForSaving['Research'];
    console.log("dataTobesend['Research']--->",dataTobesend['Research'])
    await deleteFieldFromDocument("UserServices",id,"Research");
    handleUpdate("UserServices", id, dataTobesend).then((result) => {
      setOperationMessage(result.message);
      setOpen(true);
      hideLoading();
    });
  } else {
    // If there are validation errors, hide the loader
    setOperationMessage("Please Go To The Form And Check Errors");
    setOpen(true);
    hideLoading();
  }
};
const calculatePlatinumMeetingAmount = (durationMinutes) => {
  if (!durationMinutes) return 0;

  const hours = Number(durationMinutes) / 60;

  return Math.round(hours * 100); // $100 per hour
};
const syncMentorEarnings = async ({
  db,
  studentId,
  newData,
  oldData
}) => {
  const newMeetings = newData?.Platinum?.Meetings || [];
  const oldMeetings = oldData?.Platinum?.Meetings || [];
console.log("newMeetings====>",newMeetings)
console.log("oldMeetings====>",oldMeetings)
console.log("newData====>",newData)
console.log("oldData====>",oldData)
  const newMentorEmail =
    newData?.Platinum?.AssignedMentor?.value;

  const oldMentorEmail =
    oldData?.Platinum?.AssignedMentor?.value;

  const newMentorId = panelistRealData?.[newMentorEmail]?.uid;
  const oldMentorId = panelistRealData?.[oldMentorEmail]?.uid;

  const maxLen = Math.max(newMeetings.length, oldMeetings.length);

  for (let i = 0; i < maxLen; i++) {
    const newMeeting = newMeetings[i] || null;
    const oldMeeting = oldMeetings[i] || null;
	console.log("newMeeting=====>",newMeeting)
	console.log("oldMeeting=====>",oldMeeting)
    const serviceKey = `platinum_meeting_${i}`;

    const newCompleted =
      newMeeting?.MeetingWithPhysicianMentor?.Value === "Completed";

    const oldCompleted =
      oldMeeting?.MeetingWithPhysicianMentor?.Value === "Completed";

    const newDuration =
      newMeeting?.MeetingWithPhysicianMentorDuration?.Value;

    const oldDuration =
      oldMeeting?.MeetingWithPhysicianMentorDuration?.Value;

    const newAmount = newCompleted
      ? calculatePlatinumMeetingAmount(newDuration)
      : 0;

    const oldAmount = oldCompleted
      ? calculatePlatinumMeetingAmount(oldDuration)
      : 0;
    // =========================
    // 🔴 CASE 1: REMOVED / NOT COMPLETED
    // =========================
    if (!newCompleted && oldCompleted && oldMentorId) {
      await updateDoc(
        doc(db, "Users", oldMentorId, "Earnings", studentId),
        {
          [`services.${serviceKey}`]: deleteField()
        }
      );
      continue;
    }

    // =========================
    // 🔴 CASE 2: NEWLY COMPLETED
    // =========================
    if (newCompleted && !oldCompleted && newMentorId) {
      await setDoc(
        doc(db, "Users", newMentorId, "Earnings", studentId),
        {
          studentId,
          email: userData?.email,
          displayName: userData?.displayName,

          services: {[serviceKey]:{
            service: "platinumMeeting",
            amount: newAmount,
            duration: newDuration || 0,
            meetingDate:
              newMeeting?.MeetingWithPhysicianMentor?.MeetingDate || null,
            updatedAt: new Date(),
            createdAt: new Date()
          }
        }},
        { merge: true }
      );
      continue;
    }

    // =========================
    // 🔴 CASE 3: MENTOR CHANGED
    // =========================
    if (newCompleted && oldCompleted && newMentorId !== oldMentorId) {
      if (oldMentorId) {
        await updateDoc(
          doc(db, "Users", oldMentorId, "Earnings", studentId),
          {
            [`services.${serviceKey}`]: deleteField()
          }
        );
      }

      if (newMentorId) {
        await setDoc(
          doc(db, "Users", newMentorId, "Earnings", studentId),
          {
            studentId,
            email: userData?.email,
            displayName: userData?.displayName,

            services: {[serviceKey]:{
              service: "platinumMeeting",
              amount: newAmount,
              duration: newDuration || 0,
              meetingDate:
                newMeeting?.MeetingWithPhysicianMentor?.MeetingDate || null,
              updatedAt: new Date(),
              createdAt: new Date()
            }
          }},
          { merge: true }
        );
      }

      continue;
    }

    // =========================
    // 🔴 CASE 4: UPDATED (DURATION CHANGE)
    // =========================
    if (
      newCompleted &&
      oldCompleted &&
      newMentorId === oldMentorId &&
      newAmount !== oldAmount &&
      newMentorId
    ) {
      await setDoc(
        doc(db, "Users", newMentorId, "Earnings", studentId),
        {
          services: {[serviceKey]:{
            service: "platinumMeeting",
            amount: newAmount,
            duration: newDuration || 0,
            meetingDate:
              newMeeting?.MeetingWithPhysicianMentor?.MeetingDate || null,
            updatedAt: new Date()
          }
        }},
        { merge: true }
      );
    }
  }
};
const handleUpdateForm = async () => {

  showLoading();
  let dataTobesend = {};
  dataTobesend['uid'] = id;
  dataTobesend['Match'] = { ...MatchValues };

  if (!MatchcreatedAtexists) {
    dataTobesend['Match']['createdAt'] = new Date().toISOString();
    setMatchcreatedAtexists(true);
  }

  dataTobesend['Match']['updatedAt'] = new Date().toISOString();
  dataTobesend['Match']['Notes'] = Notes || '';
  dataTobesend['Match']['Plan'] = { Name: plan };
  dataTobesend['Match']['Season'] = matchSeason;
  dataTobesend['Match']['Status'] = { Name: status, Relation: {} };
  dataTobesend['Match']['Plan']['Relation'] = {};

  if (plan === "SilverOnDemand") {
    dataTobesend['Match']['Plan']['Relation'] = {
      Name: "SilverOnDemandMocks",
      Value: SilverOnDemandMocks,
    };
  } else if (plan === "Custom") {
    dataTobesend['Match']['Plan']['Relation'] = {
      Name: "customPlan",
      Value: customPlan,
    };
  } else if (plan === "SilverInteractive") {
    dataTobesend['Match']['Plan']['Relation'] = {
      Name: "SilverInteractiveMocks",
      Value: SilverInteractiveMocks,
    };
  }

  if (status === "NotApplying") {
    dataTobesend['Match']['Status']['Relation'] = {
      Name: "MatchStatusChoose",
      Value: MatchStatusNotApplyingSelected,
    };
    if (MatchStatusNotApplyingSelected === "Other") {
      dataTobesend['Match']['Status']['Relation']['Other'] = FutureApplicationSeasonCustomNote;
    }
  }
  // Payments needs to be converted from an array back to an object
  const org = dataTobesend['Match'];
  NewPaymentaddedMatch = dataTobesend['Match']['Payments'].map((payment) => ({
          ...payment,
          Plan: dataTobesend['Match']['Plan']?.Name,
        }));
  //NewPaymentaddedMatch=dataTobesend['Match']['Payments'];
  // Convert Payments array to an object if necessary
  const convertedDataForSaving = convertMatchArrayToObject(org);

  // Update dataTobesend['Match'] with the converted Payments object
  dataTobesend['Match'] = { ...convertedDataForSaving };

  // Validate the form before saving
  const validationErrors = validate();


  if (Object.keys(validationErrors).length === 0 || Object.keys(validationErrors).length === 7) {
    // Proceed to update the data
    /* NoteSectionData.forEach(async(NotesOb,NotesInd) => {
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
    handleUpdate("UserServices", id, dataTobesend).then(async (result) => {
       const  conditionsArrayNote =
    		[
  				[
    				{ name: "uid", condition: "==", value: id }
  				]
			];
    const NoteSectionDataObj =await SelectWithComplexConditionsJoin("NotesSectionMatch",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");
        console.log("NoteSectionDataObj======>",NoteSectionDataObj)
        if(NoteSectionDataObj.status=="success")
        {
        	if(NoteSectionDataObj.data.length)
        	{
        		setNoteSectionData(NoteSectionDataObj.data)
        	}

        }
      setOperationMessage(result.message);
      setOpen(true);
      hideLoading();
    });*/
    (async () => {
  await Promise.all(
    NoteSectionData.map(async (NotesOb) => {
      let re;
      NotesOb.uid = id;
      if (NotesOb.id) {
        re = await handleUpdateOrCreateByField("NotesSectionMatch", "id", NotesOb.id, NotesOb);
      } else {
        re = await handleUpdateOrCreateByField("NotesSectionMatch", "uid", null, NotesOb);
      }
    })
  );
      const resultPay=detectNewPayments(AlreadySavedPaymentMatch,NewPaymentaddedMatch,"match");
    	if(Object.keys(resultPay).length)
    	{
    	  sendPaymentConfirmation(resultPay,"match");
    	}
  // Execute handleUpdate only after all promises in map have resolved
    await deleteFieldFromDocument("UserServices",id,"Match");
    //await syncMentorEarnings(db,id,dataTobesend?.Match,InitialMatchData);
    await syncMentorEarnings({
  db,
  studentId: id,
  newData: dataTobesend?.Match,
  oldData: InitialMatchData
});
  handleUpdate("UserServices", id, dataTobesend).then(async (result) => {
    const conditionsArrayNote = [
      [{ name: "uid", condition: "==", value: id }],
    ];

    const NoteSectionDataObj = await SelectWithComplexConditionsJoin(
      "NotesSectionMatch",
      conditionsArrayNote,
      "NotesDate",
      "desc",
      null,
      "UsersRoles",
      "uid",
      "uid"
    );

    console.log("NoteSectionDataObj======>", NoteSectionDataObj);
    if (NoteSectionDataObj.status === "success" && NoteSectionDataObj.data.length) {
      setNoteSectionData(NoteSectionDataObj.data);
    }
	
    setOperationMessage(result.message);
    setOpen(true);
    hideLoading();
  });
})();
  } else {
    // If there are validation errors, hide the loader
    TooltipsPopovers("error","Please Fill All Required Fields.","Status")
    setErrors(validationErrors);
    hideLoading();
  }
};

const GetDynamicValue = () =>{
	switch (plan) {
    case 'SilverOnDemand':
      return SilverOnDemandMocks;
    case 'SilverInteractive':
      return SilverInteractiveMocks;
    // Add more cases as needed for other plans
    default:
      return '';
  }

}
const handleCancel = () => {
    setOpen(false);
  };

  if (loading) {
    return (
      <CenteredBox>
        <CircularProgress />
      </CenteredBox>
    );
  }

  if (!userData) {
    return (
      <CenteredBox>
        <Typography>No user data available</Typography>
      </CenteredBox>
    );
  }
let lastPaymentIndex = 0;
let lastRotationIndex =0;
  return (
    <CenteredBox>
      <ColoredTabs value={value} onChange={handleChange} aria-label="user details tabs">
        <ColoredTab label="Match Plan" />
        <ColoredTab label="Rotations" />
        <ColoredTab label="Research" />
        <ColoredTab label="Product Summary" />
        <ColoredTab label="Notes" />
        <ColoredTab label="Enquiries" />
        <ColoredTab label="Chats" />
      </ColoredTabs>

      <CenteredBoxInfo>
        <Box sx={{ width: '100%', p: 3 }}>

         <Grid container spacing={2} sx={{ p: 1 }}>
         <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        <Typography className="margin0auto" variant="h6" jjjj={plan}>User Profile</Typography>
         </Box>
        </Grid>

        <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData.displayName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Email:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData.email}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Phone:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.PhoneCountry?.label} {userData.phoneNumber}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin In Touch:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData.AsignedToAgentName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Year Of Graduation:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData['GraduationDate'] ? typeof userData.GraduationDate==="string"?dayjs(userData['GraduationDate']).format("YYYY"):dayjs(new Date(userData['GraduationDate']?.seconds*1000)).format("YYYY") : null}</Typography>
                </Box>
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Step 1 Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.Step1Score?.Selected?.Name || ''}</Typography>
                </Box>
                </Grid>
                {userData['ScoreData']?.['Step1Score']?.['Selected']?.['Name'] === 'Fail' && (
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Attempts:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData['Step1Attempts'] || ''}</Typography>
                </Box>
                </Grid>
                )}
                {userData?.ScoreData?.['Step1Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                	<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Step 1 Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.['Step1Score']['Selected']['Value'] || ''}</Typography>
                </Box>
                </Grid>
                )}
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Step 2 CK Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.Step2Score?.Selected?.Name || ''}</Typography>
                </Box>
                </Grid>
                {userData?.ScoreData?.['Step2Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Step 2 Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.['Step2Score']?.['Selected']?.['Value'] || ''}</Typography>
                </Box>
                </Grid>
                )}

                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Step 3 Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.Step3Score?.Selected?.Name || ''}</Typography>
                </Box>
                </Grid>
                {userData?.ScoreData?.['Step3Score']?.['Selected']?.['Name'] === 'Score' && (
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Score 3 Score:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData?.ScoreData?.['Step3Score']?.['Selected']?.['Value'] || ''}</Typography>
                </Box>
                </Grid>
                )}
                 <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Country Of Medical School:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData['CountryOfMedicalSchool']?.['label'] || ''}</Typography>
                </Box>
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Name Of Medical School:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData['NameOfMedicalSchool']?.['label'] || ''}</Typography>
                </Box>
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>If You Have Done Prior USCE(number of months):</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData['PriorUSCE'] || ''}</Typography>
                </Box>
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Will You Be A Medical Student At The Time Of Your Rotation:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData['StudentTimeOfRotation'] || ''}</Typography>
                </Box>
                </Grid>
                <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Year you are applying for Residency:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{ userData['YearYouAreApplyingForResidency']?userData['YearYouAreApplyingForResidency']:null || ''}</Typography>
                </Box>
                </Grid>
                </Grid>

               <div className="margin0autoonly">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                 <Link to={'/admin/updateprofile/'+id}> <Button
              variant="contained"
              color="success"
              className="MarginoAuto"
            >
              Update Profile
            </Button>
            </Link>
                </Box>
                </Grid>
                 <Grid item xs={12} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1, paddingLeft:2}}>
                 <Link to={'/admin/studentpscvreview/'+id}> <Button
              variant="contained"
              color="success"
              className="MarginoAuto"
            >
              Student PSCV Reviews
            </Button>
            </Link>
                </Box>
                </Grid>
                <Grid item xs={12} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1, paddingLeft:2}}>
                 <Link to={'/admin/studentmocks/'+id}> <Button
              variant="contained"
              color="success"
              className="MarginoAuto"
            >
              Student Mocks
            </Button>
            </Link>
                </Box>
                </Grid>
                <Grid item xs={12} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1, paddingLeft:2}}>
                 <Link to={'/admin/studentmatchplans/'+id}> <Button
              variant="contained"
              color="success"
              className="MarginoAuto"
            >
              Student Match Plans
            </Button>
            </Link>
                </Box>
                </Grid>
               
            </div>

          <TabPanel value={value} index={0}>
				{/*<div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Notes Section:</b>  </Typography>
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
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Notes No:</b>  <font color="blue"><b>{NotesIndex+1}  By:{NotesObject?.AddedBy?.displayName || "N/A"}({NotesObject?.AddedBy?.UserType || "N/A"})</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeleteNotesSec(NotesIndex)}
            >
              Delete Notes {NotesIndex+1}
            </Button>
                </Box>
                </Grid>
                 <Grid item xs={6} >
                 <div className="InputLabel"></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>

                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Notes Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={NotesDate}
        onChange={(event) => HandleNotesSectionChange(event,'NotesDate',NotesIndex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.NotesObject?.NotesDate?.[NotesIndex] && <span className="validationerror">{errors.NotesObject?.NotesDate?.[NotesIndex]}</span>}
              </Grid>
              <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Team Member</div>
                <Select1
                value={NotesObject?.TeamMember}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Admin In Touch"
        onChange={(event) => HandleNotesSectionChange(event,'TeamMember',NotesIndex)}
        isSearchable
        isMulti
      />
      	{errors.NotesObject?.TeamMember?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.TeamMember?.[NotesIndex] }</span>}
                </div>
               </Grid>

                <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Type </InputLabel>
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

                <Grid item xs={6}>
                <TextField
  					label="Notes"
  					multiline
  					rows={4}
  					variant="outlined"
  					fullWidth
  					value={NotesObject?.Notes}
  					onChange={(event) => HandleNotesSectionChange(event,'Notes' ,NotesIndex)}
  					sx={{ my: 2 }}
				/>
                  {errors.NotesObject?.Notes[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.Notes[NotesIndex] }</span>}
                </Grid>
				<Grid item xs={6}>
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


            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="plan-label">Plan</InputLabel>
                  <Select
                    labelId="plan-label"
                    id="plan-select"
                    value={plan}
                    label="Plan"
                    required
                    onChange={handlePlanChange}
                  >
                    {Object.entries(MatchPlanListObject).map(([key, value]) => (
                      <MenuItem key={key} value={key}>{value.Name}</MenuItem>
                    ))}
                    <MenuItem value={'Custom'}>Custom</MenuItem>
                  </Select>
                  {errors.plan && <span className="validationerror">{errors.plan}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="GeneralNotify">Notify User</InputLabel>
                  <Select
                    labelId="plan-label"
                    id="GeneralNotify"
                    value={MatchValues['GeneralNotify'] || 'no'}
                    label="Notify User"
                    required
                    onChange={(event) => HandleMatchChange(event,'GeneralNotify' )}
                  >
                    <MenuItem value="no">No</MenuItem>
              		<MenuItem value="yes">Yes</MenuItem>
                  </Select>
                  {errors.MatchPaymentPlan && <span className="validationerror">{errors.MatchPaymentPlan}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                  <TextField
                    label="Total Amount To Pay"
                    variant="outlined"
                    fullWidth
                    value={MatchValues['TotalAmountToPay'] || MatchPlanListObject?.[plan]?.fee}
                    required
                    onChange={(event) => HandleMatchChange(event,'TotalAmountToPay' )}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.customPlan  && <span className="validationerror">{errors.customPlan }</span>}
                </Grid>
              <PlatinumMentorShip
            MatchValues={MatchValues}
            plan={plan}
            ListOfPanelists={ListOfPanelists}
            HandlePlatinumChange={HandlePlatinumChange}
            MatchPlanListObject={MatchPlanListObject}
            errors={errors}
            DeleteMeetings={DeleteMeetings}
            AddMeetings={AddMeetings}
            HandlePlatinumMeetingsChange={HandlePlatinumMeetingsChange}
          />
          <ChiefMentorShip
            MatchValues={MatchValues}
            plan={plan}
            ListOfPanelists={ListOfPanelists}
            ChiefMentorlists={ChiefMentorlists}
            MatchPlanListObject={MatchPlanListObject}
            HandlePlatinumChange={HandleMentorChange}
            errors={errors}
            DeleteMeetings={DeleteMeetings}
            AddMeetings={AddMeetings}
            HandlePlatinumMeetingsChange={HandlePlatinumMeetingsChange}
          />
              {plan === 'Custom' && (
                <Grid item xs={6}>
                  <TextField
                    label="Custom Plan"
                    variant="outlined"
                    fullWidth
                    value={customPlan}
                    required
                    onChange={handleCustomPlanChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.customPlan  && <span className="validationerror">{errors.customPlan }</span>}
                </Grid>
              )}
              {plan !== 'Custom' && plan && MatchPlanListObject[plan]?.Relation?.length > 0 && (
                MatchPlanListObject[plan].Relation.map((item,indexT) => (
                  <Grid item xs={6} key={indexT}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>{item.Title}</InputLabel>
                      <Select
                        labelId={`label-${plan}`}
                        id={`select-${plan}`}
                        required
                        checkwhat={`handle${plan}MocksChange`}
                        checkwhate="4"
                        value={GetDynamicValue(plan)}
                        label={item.Title}
                        onChange={(event) => handleDynamicChange(event, plan)}
                      >
                        {Object.entries(item.Values).map(([subKey, subValue]) => (
                          <MenuItem key={subKey} value={subKey}>
                            {subValue}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors[`${plan}Mocks`]  && <span className="validationerror">{errors[`${plan}Mocks`] }</span>}
                    </FormControl>
                  </Grid>
                ))
              )}
            </Grid>
            <Grid container spacing={2} sx={{ "margin-top": '8px' }}>



              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="match-season-label">Match Season</InputLabel>
                  <Select
                    labelId="match-season-label"
                    id="match-season-select"
                    value={matchSeason}
                    label="Match Season"
                    required
                    onChange={handleMatchSeasonChange}
                  >
                  {!MatchSessionList.includes(matchSeason) && matchSeason && (
      <MenuItem key={`stored-${matchSeason}`} value={matchSeason}>
        {`Match Season ` + matchSeason + ` (Sept ` + (matchSeason - 1) + `)`}
      </MenuItem>
    )}
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
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select"
                    value={status}
                    label="Status"
                    required
                    onChange={handleStatusChange}
                  >
                    {Object.entries(MatchPlanStatus).map(([subKey, subValue]) => (
                      <MenuItem key={subKey} value={subKey}>
                        {subValue}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && <span className="validationerror">{errors.status}</span>}
                </FormControl>
              </Grid>
              {status === 'NotApplying' && status && (
                <Grid item xs={6} key="Choose">
                  <FormControl fullWidth>
                    <InputLabel id={`label-Choose`}>Future Application Season</InputLabel>
                    <Select
                      labelId={`label-Choose`}
                      id={`select-Choose`}
                      value={MatchStatusNotApplyingSelected}
                      label='Future Application Season'
                      required
                      onChange={handleChangeMultiple}
                      //renderValue={(selected) => selected.join(', ')}
                    >
                      {MatchStatusNotApplyingList.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                       <MenuItem key="Other" value="Other">
                          Other
                        </MenuItem>
                    </Select>
                    {errors.MatchStatusNotApplyingSelected && <span className="validationerror">{errors.MatchStatusNotApplyingSelected}</span>}
                  </FormControl>
                </Grid>
                 )}
            {MatchStatusNotApplyingSelected==='Other' && (
                <Grid item xs={6}>
                  <TextField
                    label="Custom Note"
                    variant="outlined"
                    fullWidth
                    value={FutureApplicationSeasonCustomNote}
                    required
                    onChange={handleFutureApplicationSeasonCustomNoteChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.FutureApplicationSeasonCustomNote  && <span className="validationerror">{errors.FutureApplicationSeasonCustomNote }</span>}
                </Grid>

              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="plan-label">Payment Plan</InputLabel>
                  <Select
                    labelId="plan-label"
                    id="plan-select"
                    value={MatchValues['PaymentPlan']}
                    label="Payment Plan"
                    required
                    onChange={(event) => HandleMatchChange(event,'PaymentPlan' )}
                  >
                    {Object.entries(MatchPaymentPlans).map(([key, value]) => (
                      <MenuItem key={key} value={key}>{value}</MenuItem>
                    ))}
                  </Select>
                  {errors.MatchPaymentPlan && <span className="validationerror">{errors.MatchPaymentPlan}</span>}
                </FormControl>
              </Grid>
              {MatchValues?.['PaymentPlan']==='On Installments' && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="TotalInstallments">No Of Installements</InputLabel>
                  <Select
                    labelId="plan-label"
                    id="TotalInstallments"
                    value={MatchValues['TotalInstallments']}
                    label="No Of Installements"
                    required
                    onChange={(event) => HandleMatchChange(event,'TotalInstallments' )}
                  >
                    <MenuItem value="1">1</MenuItem>
              		<MenuItem value="2">2</MenuItem>
              		<MenuItem value="3">3</MenuItem>
              		<MenuItem value="4">4</MenuItem>
              		<MenuItem value="5">5</MenuItem>
              		<MenuItem value="6">6</MenuItem>
              		<MenuItem value="7">7</MenuItem>
              		<MenuItem value="8">8</MenuItem>
              		<MenuItem value="9">9</MenuItem>
              		<MenuItem value="10">10</MenuItem>
                  </Select>
                  {errors.MatchPaymentPlan && <span className="validationerror">{errors.MatchPaymentPlan}</span>}
                </FormControl>
              </Grid>
              )}

      	<Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Enrollment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MatchValues['EnrollmentDate']?dayjs(MatchValues['EnrollmentDate'].toDate().toISOString()):null}
        onChange={(event) => HandleMatchChange(event,'EnrollmentDate' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        showYearDropdown  // Enable year dropdown
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Enrollment Date"
  		variant="outlined"
  		name={`EnrollmentDate`}
      /></Typography>
                </Box>
                {errors.EnrollmentDate && <span className="validationerror">{errors.EnrollmentDate}</span>}
              </Grid>




              <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Payment Details:</b>  </Typography>
                </div>
       		{MatchValues?.['Payments']?.map((MpaymentObject, MPaymentindex) => {
       		return (
       				<div className="RotationAddedPaymentBody" key={MPaymentindex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Payment No:</b>  <font color="blue"><b>{MPaymentindex+1}</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeletePayment(MPaymentindex,0,"Match")}
            >
              Delete Payment {MPaymentindex+1}
            </Button>
                </Box>
                </Grid>
                <Grid item xs={6} key={plan}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Mode Of Payment</InputLabel>
                      <Select
                        labelId={`label-${plan}`}
                        id={`select-${plan}`}
                        required
                        value={MpaymentObject['ModeOfPayment'] || ''}
                        label='Mode Of Payment'
                        onChange={(event) => HandleMatchChange(event,'ModeOfPayment' ,MPaymentindex)}
                      >
                        {Object.entries(PaymentOptionsList).map(([subKey, subValue]) => (
                          <MenuItem key={subValue.label} value={subValue.label}>
                            {subValue.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.MatchModeOfPayment?.[MPaymentindex]  && <span className="validationerror">{errors.MatchModeOfPayment?.[MPaymentindex]}</span>}
                    </FormControl>
                  </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Payment Amount"
                    variant="outlined"
                    fullWidth
                    value={MpaymentObject['Amount']}
                    required
                    onChange={(event) => HandleMatchChange(event,'MatchPaymentAmount',MPaymentindex)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.MatchAmount?.[MPaymentindex]  && <span className="validationerror">{errors.MatchAmount?.[MPaymentindex] }</span>}
                </Grid>
                <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MpaymentObject.PaymentDate?dayjs(MpaymentObject.PaymentDate.toDate().toISOString()):null}
        onChange={(event) => HandleMatchChange(event,'PaymentDate',MPaymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.MatchPaymentDate?.[MPaymentindex] && <span className="validationerror">{errors.MatchPaymentDate?.[MPaymentindex]}</span>}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel >Discount</InputLabel>
                  <Select
                    labelId="Discount-Value"
                    id="Discount-Value"
                    defaultValue={MpaymentObject['Discount']['Value']}
                    label="Discount"
                    onChange={(event) => HandleMatchChange(event,'DiscountValue',MPaymentindex )}
                  >
                      <MenuItem key="Yes" value="Yes">Yes</MenuItem>
                      <MenuItem key="No" value="No">No</MenuItem>
                  </Select>
                  {errors.plan && <span className="validationerror">{errors.plan}</span>}
                </FormControl>
              </Grid>
             {MpaymentObject.Discount.Value === 'Yes' && (
        <div className="VisaLetter">
          <Grid container spacing={2} sx={{ p: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Discount Code"
                variant="outlined"
                name="MatchDiscountCode"
                fullWidth
                value={MpaymentObject['Discount']['Code']}
                required
                onChange={(event) => HandleMatchChange(event, 'DiscountCode',MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.HousingApplicationAmount && <span className="validationerror">{errors.HousingApplicationAmount}</span>}
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Discount Amount"
                variant="outlined"
                name="DiscountAmount"
                fullWidth
               value={MpaymentObject['Discount']['Amount']}
                required
                onChange={(event) => HandleMatchChange(event, 'DiscountAmount',MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.MatchDiscountAmount?.[MPaymentindex] && <span className="validationerror">{errors.MatchDiscountAmount?.[MPaymentindex]}</span>}
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Notes"
                variant="outlined"
                name="DiscountNote"
                fullWidth
                value={MpaymentObject.Discount.Notes || ''} // Provide default value
                required
                onChange={(event) => HandleMatchChange(event, 'DiscountNotes',MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.HousingAmount && <span className="validationerror">{errors.HousingAmount}</span>}
            </Grid>
          </Grid>
        </div>
      )}
       <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Added On:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
  defaultValue={
    MpaymentObject['PaymentActualAddedDate']
      ? dayjs(MpaymentObject['PaymentActualAddedDate'].toDate().toISOString())
      : dayjs() // Default to today
  }
  onChange={(event) => HandleMatchChange(event, 'PaymentActualAddedDate', MPaymentindex)}
  dateFormat="dd/mm/yyyy"
  scrollableYearDropdown
  disabled
  yearDropdownItemNumber={50}
  picker="date"
  label="Payment Added On"
  variant="outlined"
/></Typography>
                </Box>
                {errors.PaymentDate?.[MPaymentindex] && <span className="validationerror">{errors.PaymentDate?.[MPaymentindex]}</span>}
              </Grid>
              <Grid item xs={6}>
                <div className="InputLabel">Need Notify</div>
     <FormControl fullWidth>
     <Select

                    id="PaymentNotify"
                    name="FeeType"
                    value={MpaymentObject['PaymentNotify'] || 'no'}
                    label="Need Notify"
                    required
                    onChange={(event) => HandleMatchChange(event,'PaymentNotify',MPaymentindex)}
                  >
                       <MenuItem value="no">
                        No
                      </MenuItem>
                      <MenuItem value="yes">
                        Yes
                      </MenuItem>
                      </Select>
                      {errors.PaymentNotify?.[MPaymentindex]  && <span className="validationerror">{errors.PaymentNotify?.[MPaymentindex] }</span>}
                    </FormControl>

       </Grid>
        {MpaymentObject?.['PaymentNotify'] === 'yes' && (
        <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Notify On Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MpaymentObject['NotifyDate']?dayjs(MpaymentObject['NotifyDate'].toDate().toISOString()):null}
        onChange={(event) => HandleMatchChange(event,'NotifyDate',MPaymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Notify On Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate?.[MPaymentindex] && <span className="validationerror">{errors.PaymentDate?.[MPaymentindex]}</span>}
              </Grid>
        )}
<Grid item xs={6}>
              <TextField
                label="General Notes"
                variant="outlined"
                multiline
                rows={4}
                name="DiscountNote"
                fullWidth
                value={MpaymentObject.GeneralNotes || ''} // Provide default value
                required
                onChange={(event) => HandleMatchChange(event, 'GeneralNotes',MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
            	 </Grid>

            	 </Grid>
            	 </div>
            )})}
            <div className="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddRotationPayment(lastPaymentIndex+1,0,"Match")}
            >
              Add Payment
            </Button>
                </Box>
                </Grid>
            </div>
            </div>






 <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Refund:</b>  </Typography>
                </div>
       <div className="VisaLetter">
       <Grid container spacing={2} sx={{ p: 1 }}>
       <Grid item xs={6}>
                <div className="InputLabel">Team Member in touch</div>
                <Select1
        value={MatchValues?.RefundData?.['TeamMemberInTouchForRefund'] || ''}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Team Member in touch"
        onChange={(event) => HandleMatchChange(event,'TeamMemberInTouchForRefund')}
        isSearchable
      />
      	{errors.TeamMemberInTouchForRefund  && <span className="validationerror">{errors.TeamMemberInTouchForRefund }</span>}
               </Grid>
               <Grid item xs={6} >
                <div className="InputLabel" >Refund Date</div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Refund Request Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MatchValues?.['RefundData']?.['RefundRequestDate']?dayjs(MatchValues?.RefundData?.['RefundRequestDate'].toDate().toISOString()):null}
        onChange={(event) => HandleMatchChange(event,'RefundRequestDate' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Refund Request Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors?.RefundData?.RefundRequestDate && <span className="validationerror">{errors?.RefundData?.RefundRequestDate}</span>}
              </Grid>
              <Grid item xs={6}>
     <div className="InputLabel" >Refund Status</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
                    id="FeeType"
                    name="FeeType"
                    value={MatchValues?.RefundData?.['RefundStatus'] || ''}
                    label="Refund Status"
                    required
                    onChange={(event) => HandleMatchChange(event,'RefundStatus')}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="Refunded">
                        Refunded
                      </MenuItem>
                      <MenuItem value="Pending">
                        Pending
                      </MenuItem>
                       <MenuItem value="Unclear">
                        Unclear
                      </MenuItem>
                      <MenuItem value="Refund denied">
                        Refund denied
                      </MenuItem>
                      </Select>
                      {errors.RefundStatus?.[index]  && <span className="validationerror">{errors.RefundStatus?.[index] }</span>}
                    </FormControl>

       </Grid>
    	<Grid item xs={6}>

    	<div className="InputLabel" >Refund Type?</div>
                <Select1
        value={MatchValues?.RefundData?.['RefundType']}
        onChange={(event) => HandleMatchChange(event,'RefundType' )}
        variant="outlined"
        placeholder="Refund Type?"
        label="Refund Type"
        options={RotationRefundMatch}
        isSearchable
      	/>
      	 {errors?.RefundData?.RefundType && <span className="validationerror">{errors?.RefundData?.RefundType }</span>}
       </Grid>
       {MatchValues?.RefundData?.['RefundType']?.value==="Match Plan" &&(
			 <Grid item xs={6}>
            	<div className="InputLabel" >{MatchValues?.RefundData?.['RefundType']?.value} Name</div>
                  <TextField
                    label="Match Plan Name"
                    variant="outlined"
                    fullWidth
                    value={MatchValues?.['RefundData']?.['RefundMatchPlanName']}
                    onChange={(event) => HandleMatchChange(event,'RefundMatchPlanName')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.RefundData?.RefundMatchPlanName  && <span className="validationerror">{errors?.RefundData?.RefundMatchPlanName  }</span>}
            </Grid>
       )}
       <Grid item xs={6}>
                <div className="InputLabel" >Mode Of Refund</div>
                <Select1
        value={MatchValues?.RefundData?.['ModeOfRefund']}
        onChange={(event) => HandleMatchChange(event,'ModeOfRefund')}
        variant="outlined"
        placeholder="Mode Of Refund"
        label="Mode Of Refund"
        options={PaymentOptionsList}
        isSearchable
      	/>
      	 {errors?.RefundData?.ModeOfRefund  && <span className="validationerror">{errors?.RefundData?.ModeOfRefund }</span>}
       </Grid>
       <Grid item xs={6}>
                <div className="InputLabel" >Refund Amount</div>
                  <TextField
                    label="Refund Amount"
                    variant="outlined"
                    fullWidth
                    value={MatchValues?.['RefundData']?.['RefundAmount']}
                    required
                    onChange={(event) => HandleMatchChange(event,'RefundAmount')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors?.RefundData?.RefundAmount  && <span className="validationerror">{errors?.RefundData?.RefundAmount  }</span>}
                </Grid>
                <Grid item xs={6} >
                <div className="InputLabel" >Date Refunded</div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Date Refunded:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MatchValues?.RefundData?.['RefundDate']?dayjs(MatchValues?.RefundData?.['RefundDate'].toDate().toISOString()):null}
        onChange={(event) => HandleMatchChange(event,'RefundDate' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Date Refunded"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.RefundDate?.RefundDate && <span className="validationerror">{errors.RefundDate?.RefundDate }</span>}
              </Grid>
       <Grid item xs={6}>
       <div className="InputLabel" >Refund Note</div>
                 <TextField
                    label="Refund Note"
                    variant="outlined"
                    multiline
  					rows={4}
                    fullWidth
                    value={MatchValues?.RefundData?.['RefundNote']}
                    required
                    onChange={(event) => HandleMatchChange(event,'RefundNote')}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
      	 {errors.RefundData?.RefundNote && <span className="validationerror">{errors.RefundData?.RefundNote }</span>}
       </Grid>
       </Grid>
       </div>
       </div>





            </Grid>
            <Grid className="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdateForm}
            >
              Update
            </Button>
          </Grid>




          <Grid container  spacing={1}  sx={{ width: '100%', p: 3 }} >
            <Button
              variant="contained"
              color="error"
              onClick={OnBoardingPopupOpen}
              sx={{ width: '100%' }}
            >
               ONBOARDING & ACCESS
            </Button>
          </Grid>
          </TabPanel>






          {/*Tab Rotation Start From Here*/}
          <TabPanel value={value} index={1}>
          <div className="mainDiv">
                <div className="RotationAdded">
                <div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#1976d2', p: 1, borderRadius: 2 }}><b>Rotation Details:</b>  </Typography>
                </div>
                {rotationValues['Rotations'].map((rotation, index) => {
                	lastRotationIndex = index;
                	indexLetter=0;
                	previoussignedDate="";
                	rotationFeeItselfStatus=false;
                	paymentSuccessURL="";
                	const paymentParams = {
  session_id: "",               // from backend / Stripe
  studentUID:userData.uid,
  studentEmail:userData.email,
  rotationCode:rotation['LocationCode'].label,
  bookingStartDate:formatFirestoreDate(rotation['StartDate']),
  TotalInstallements: 1,
  InstallementNo: 1,
  AllowTesting: "no",
  AdminLink: "yes",
  amount:0,
  paymentStatus: "success",
  PaymentType: "Rotation",
  FeeType: "Application",
  PromotionDataDiscountAmount: 0,
  PromotionDataDiscountText: "",
};

                	if(typeof rotation['RotationVisaSection']==="undefined")
                	{
                		rotation['RotationVisaSection']={};
                		rotation['RotationVisaSection']['Letter0']={};
                		if(typeof rotation['RotationVisa']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['RotationVisa']=rotation['RotationVisa'];
                		}
                		if(typeof rotation['RotationVisaAmount']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['RotationVisaAmount']=rotation['RotationVisaAmount'];
                		}
                		if(typeof rotation['RotationVisaAmountDate']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['RotationVisaAmountDate']=rotation['RotationVisaAmountDate'];
                		}
                		if(typeof rotation['VisaLetterType']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['VisaLetterType']=rotation['VisaLetterType'];
                		}
                		if(typeof rotation['VisaLetterOfPurpose']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['VisaLetterOfPurpose']=rotation['VisaLetterOfPurpose'];
                		}
                		if(typeof rotation['VisaLetterStatus']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['VisaLetterStatus']=rotation['VisaLetterStatus'];
                		}
                		if(typeof rotation['RotationVisaStatus']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['RotationVisaStatus']=rotation['RotationVisaStatus'];
                		}
                		if(typeof rotation['AcceptanceLetter']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['AcceptanceLetter']=rotation['AcceptanceLetter'];
                		}
                		if(typeof rotation['VisaLetterNote']!=="undefined")
                		{
                			rotation['RotationVisaSection']['Letter0']['VisaLetterNote']=rotation['VisaLetterNote'];
                		}
                	}
                return (<div className="RotationInner" key={index}>
                <Grid container spacing={2} sx={{ p: 1 }} >

                      <Grid item xs={6} jkk={index}>
                      <div className="InputLabel" ></div>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Rotation No:</b>  <font color="blue"><b>{index+1}</b></font></Typography>

                </Box>
                </Grid>
                <Grid item xs={6} jkk={index}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="secondary"
              onClick={() => DeleteRotation(index)}
            >
              Delete Rotation {index+1}
            </Button>
                </Box>
                </Grid>
                <Grid item xs={6}>
     <div class="InputLabel" >Phycian CP</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"

                  	value={rotation['PhysicianCheckPoint']? rotation['PhysicianCheckPoint']:''}
                    label="Phycian CP"
                    required
                    onChange={(event) => handleRotationChange(event,'PhysicianCheckPoint',index )}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="Not sent">
                        Not sent
                      </MenuItem>
                      <MenuItem value="Waiting on Physician">
                        Waiting on Physician
                      </MenuItem>
                       <MenuItem value="Confirmed with Physician">
                        Confirmed with Physician
                      </MenuItem>
                      <MenuItem value="Rescheduled">
                        Rescheduled
                      </MenuItem>
                      </Select>
                      {errors.PhysicianCheckPoint  && <span class="validationerror">{errors.PhysicianCheckPoint }</span>}
                    </FormControl>

       </Grid>
       <Grid item xs={6}>
     <div class="InputLabel" >Student CP</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"

                  	value={rotation['StudentCheckPoint']? rotation['StudentCheckPoint']:""}
                    label="Student CP"
                    required
                    onChange={(event) => handleRotationChange(event,'StudentCheckPoint',index )}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="Not sent">
                        Not sent
                      </MenuItem>
                      <MenuItem value="Waiting on Student">
                        Waiting on Student
                      </MenuItem>
                       <MenuItem value="Confirmed with Student">
                        Confirmed with Student
                      </MenuItem>
                      <MenuItem value="Rescheduled">
                        Rescheduled
                      </MenuItem>
                      </Select>
                      {errors.StudentCheckPoint  && <span class="validationerror">{errors.StudentCheckPoint }</span>}
                    </FormControl>

       </Grid>
                <Grid item xs={6}>
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Enrollment Date:{}</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={rotation['EnrollmentDate']?dayjs(rotation['EnrollmentDate'].toDate()):null}
        onChange={(event) => handleRotationChange(event,'EnrollmentDate',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        showYearDropdown  // Enable year dropdown
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Enrollment Date"
  		variant="outlined"
  		name={`EnrollmentDate[${index}]`}
      /></Typography>
                </Box>
                {errors.EnrollmentDate?.[index] && <span className="validationerror">{errors.EnrollmentDate?.[index]}</span>}
              </Grid>
                  <Grid item xs={6}>
                  <div className="InputLabel" >Location Code</div>
                <Select1
        value={rotation['LocationCode']}
        onChange={(event) => handleRotationChange(event,'LocationCode',index )}
        variant="outlined"
        name={`LocationCode[${index}]`}
        options={LocationCodes}
        placeholder="Location Code"
        label="Location Code"
        isSearchable
      />
      	 {errors.LocationCode?.[index]  && <span className="validationerror">{errors.LocationCode?.[index] }</span>}
       </Grid>
            {/*<Grid item xs={6} jkk={index}>
            <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Duration Of Rotation:</b>  <div className="RightSide"><font color="blue" ><b>{rotation['DurationOfRotation']}</b></font></div></Typography>
                </Box>
            </Grid>*/}
            <Grid item xs={6}>
            <div className="InputLabel" ></div>
              <TextField
                label="Duration Of Rotation"
                variant="outlined"
                fullWidth
                value={rotation['DurationOfRotation']} // Provide default value
                required
                onChange={(event) => handleRotationChange(event,'DurationOfRotation',index )}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.DurationOfRotation && <span className="validationerror">{errors.DurationOfRotation}</span>}
            </Grid>
            <Grid item xs={6}>
     <div className="InputLabel" > Rotation Type</div>
     <FormControl fullWidth>
     <Select

                    value={rotation?.['RotationType'] || 'New Rotation'}
                    label="Rotation Type"
                    required
                    onChange={(event) => handleRotationChange(event,'RotationType',index)}
                  >
                      <MenuItem value="New Rotation">
                        New Rotation
                      </MenuItem>
                      <MenuItem value="Rescheduled Rotation">
                        Rescheduled Rotation
                      </MenuItem>
                      </Select>
                      {errors.RotationType?.[index]  && <span className="validationerror">{errors.RotationType?.[index] }</span>}
                    </FormControl>

       </Grid>
        {rotation?.['RotationType'] === 'Rescheduled Rotation' && (
                <Grid item xs={6}>
                  <div className="InputLabel" >Changed From</div>
                <Select1
        value={rotation['RotationRescheduledFrom']}
        onChange={(event) => handleRotationChange(event,'RotationRescheduledFrom',index )}
        variant="outlined"
        options={LocationCodes}
        placeholder="Changed From"
        label="Changed From"
        isSearchable
      />
                  {errors.RotationReschedulesFrom?.[index]  && <span className="validationerror">{errors.RotationReschedulesFrom?.[index] }</span>}
                </Grid>
              )}
                 <Grid item xs={6}>
                 <div className="InputLabel" >Contract Status</div>
                <Select1
        value={rotation['ContractStatus']}
        onChange={(event) => handleRotationChange(event,'ContractStatus',index )}
        variant="outlined"
        name={`ContractStatus[${index}]`}
        placeholder="Contract Status"
        label="Contract Status"
        options={ContractStatusOptionsList}
        isSearchable
      	/>
      	 {errors.ContractStatus?.[index]  && <span className="validationerror">{errors.ContractStatus?.[index] }</span>}
       </Grid>
        {rotation['ContractStatus']?.['value'] === 'Hold' && (
                <Grid item xs={6}>
                 <div className="InputLabel" ></div>
                  <TextField
                    label="Contract Hold Notes"
                    variant="outlined"
                    fullWidth
                    value={rotation['ContractHoldNote']}
                    required
                     onChange={(event) => handleRotationChange(event,'ContractHoldNote',index )}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ContractHoldNote?.[index]  && <span className="validationerror">{errors.ContractHoldNote?.[index] }</span>}
                </Grid>
              )}
          {rotation['ContractStatus']?.['value'] === 'Signed' && (
                <Grid item xs={6} >
        <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Signed Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={rotation['ContractSignedDate']?dayjs(rotation['ContractSignedDate'].toDate()):dayjs()}
        onChange={(event) => handleRotationChange(event,'ContractSignedDate',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Signed Date"
  		variant="outlined"
  		name={`Signed Date`}
  		disabled
      /></Typography>
                </Box>
                {errors.StartDate?.[index] && <span className="validationerror">{errors.StartDate?.[index]}</span>}
              </Grid>
              )}
        <Grid item xs={6} >
        <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Start Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={rotation['StartDate']?dayjs.unix(rotation['StartDate'].seconds).tz('Asia/Kolkata'):null}
        onChange={(event) => handleRotationChange(event,'StartDate',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Start Date"
  		variant="outlined"
  		name={`StartDate[${index}]`}
      /></Typography>
                </Box>
                {errors.StartDate?.[index] && <span className="validationerror">{errors.StartDate?.[index]}</span>}
              </Grid>
              <Grid item xs={6}>
              <div className="InputLabel">Rotation Payment Status</div>
                <Select1
        value={rotation['RotationPaymentStatus']}
        onChange={(event) => handleRotationChange(event,'RotationPaymentStatus',index )}
        variant="outlined"
        name={`RotationPaymentStatus[${index}]`}
        placeholder="Rotation Payment Status"
        label="Rotation Payment Status"
        options={RotationPaymentStatusOptionsList}
        isSearchable
      	/>
      	 {errors.RotationPaymentStatus?.[index]  && <span className="validationerror">{errors.RotationPaymentStatus?.[index] }</span>}
       </Grid>

    <Grid item xs={6}>
     <div className="InputLabel" >Rotation Status</div>
                <Select1
        value={rotation['RotationStatus']}
        onChange={(event) => handleRotationChange(event,'RotationStatus',index )}
        variant="outlined"
        name={`RotationStatus[${index}]`}
        placeholder="Rotation Status"
        label="Rotation Status"
        options={RotationStatus}
        isSearchable
      	/>
      	 {errors.RotationStatus?.[index]  && <span className="validationerror">{errors.RotationStatus?.[index] }</span>}
       </Grid>

       {rotation['RotationStatus']?.['label'] === 'Rotation  completed' && (
       <>
       <Grid item xs={6}>
       <div className="InputLabel">Rotation Review</div>
                <Select1
        value={rotation['RotationReview']}
        onChange={(event) => handleRotationChange(event,'RotationReview',index )}
        variant="outlined"
        name={`RotationReview[${index}]`}
        placeholder="Rotation Review"
        label="Rotation Review"
        options={RotationReview}
        isSearchable
      	/>
      	 {errors.RotationReview?.[index]  && <span className="validationerror">{errors.RotationReview?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
       <div className="InputLabel">Status Of LOR</div>
                <Select1
        value={rotation['RotationStatusOfLOR']}
        onChange={(event) => handleRotationChange(event,'RotationStatusOfLOR',index )}
        variant="outlined"
        placeholder="Status Of LOR"
        label="Status Of LOR"
        options={RotationLOROptionList}
        isSearchable
      	/>
      	 {errors.RotationReview?.[index]  && <span className="validationerror">{errors.RotationReview?.[index] }</span>}
       </Grid>
       </>
       )}
        <Grid item xs={6}>
     <div className="InputLabel"> Rotation Fees To Sarthi</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
                    id="RotationFeesToSarthi"
                    name="RotationFeesToSarthi"
                    value={rotation?.['RotationFeesToSarthi'] || ''}
                    label="Rotation Fees To Sarthi"
                    required
                    onChange={(event) => handleRotationChange(event,'RotationFeesToSarthi',index)}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="yes">
                        Yes
                      </MenuItem>
                      <MenuItem value="no">
                        No
                      </MenuItem>
                      </Select>
                      {errors.RotationFeesToSarthi?.[index]  && <span className="validationerror">{errors.RotationFeesToSarthi?.[index] }</span>}
                    </FormControl>

       </Grid>
        <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <FormControl fullWidth className="NoTop">
                  <TextField
  label="Custom Notes"
  multiline
  variant="outlined"
	name="RotationNotes"
	id="NoTop"
  value={rotation['RotationNotes']}
  onChange={(event) => handleRotationChange(event,'RotationNotes',index)}
  sx={{ my: 2 }}
  InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
/>
</FormControl>
                  {errors.RotationNotes?.[index]  && <span className="validationerror">{errors.RotationNotes?.[index] }</span>}
                </Grid>
       <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>VISA INVITE LETTER:</b>  </Typography>
                </div>
       <div className="VisaLetter">
       {
       //rotation['RotationVisaSection']?.map((LetterObject, LetterIndex) => {
       Object.entries(rotation['RotationVisaSection'] || {}).map(([LetterIndex, LetterObject], indexL) => {
       indexLetter=indexL;
    return (
       <div className="RotationAddedPaymentBody" >
        <Grid container spacing={2} sx={{ p: 1 }} >
        <Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Letter No:</b>  <font color="blue"><b>{indexL+1}</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeleteLetter(indexL,index)}
            >
              Delete Letter {indexL+1}
            </Button>
                </Box>
                </Grid>
        <Grid item xs={6}>
        <div className="InputLabel" >Paid for a Letter</div>
                <Select1
        value={LetterObject['RotationVisa']}
        onChange={(event) => handleRotationChange(event,'RotationVisa',index,LetterIndex )}
        variant="outlined"
        placeholder="Paid For A Letter"
        label="Visa Status"
        options={RotationVisa}
        isSearchable
      	/>
      	 {errors.RotationVisa?.[index]  && <span className="validationerror">{errors.RotationVisa?.[index] }</span>}
       </Grid>
       {(LetterObject?.['RotationVisa']?.['value'] === 'Paid for Visa letter' || LetterObject?.['RotationVisa']?.['value'] === 'Acceptance Letter') && (
   <>
       <Grid item xs={6}>
       <div className="InputLabel" ></div>
                  <TextField
                    label={LetterObject?.['RotationVisa']?.['label']+' Amount'}
                    variant="outlined"
                    fullWidth
                    value={LetterObject['RotationVisaAmount']}
                    required
                    onChange={(event) => handleRotationChange(event,'RotationVisaAmount',index,LetterIndex)}
                    sx={{ my: 0, "margin-bottom": "4px" }}

                  />
                  {errors.RotationVisaAmount?.[index]  && <span className="validationerror">{errors.RotationVisaAmount?.[index] }</span>}
    </Grid>
    <Grid item xs={6} >
        <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={LetterObject['RotationVisaAmountDate']?dayjs(LetterObject['RotationVisaAmountDate'].toDate().toISOString()):null}
        onChange={(event) => handleRotationChange(event,'RotationVisaAmountDate',index,LetterIndex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.RotationVisaAmountDate?.[index] && <span className="validationerror">{errors.RotationVisaAmountDate?.[index]}</span>}
              </Grid>
    <Grid item xs={6}>
    		<div className="InputLabel" >{rotation?.['RotationVisa']?.['label']} Required</div>
                <Select1
        value={LetterObject['VisaLetterType']}
        onChange={(event) => handleRotationChange(event,'VisaLetterType',index,LetterIndex )}
        variant="outlined"
        placeholder={LetterObject?.['RotationVisa']?.['label']+ ' Required'}
        label="Visa Letter Required"
        options={RotationVisaLetterType}
        isSearchable
      	/>
      	 {errors.VisaLetterType?.[index]  && <span className="validationerror">{errors.VisaLetterType?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
    		<div className="InputLabel" >Letter Of Purpose</div>
                <Select1
        value={LetterObject['VisaLetterOfPurpose']}
        onChange={(event) => handleRotationChange(event,'VisaLetterOfPurpose',index,LetterIndex )}
        variant="outlined"
        placeholder="Letter Of Purpose"
        label="Letter Of Purpose"
        options={RotationVisaLetterOfPurposeOptions}
        isSearchable
      	/>
      	 {errors.VisaLetterOfPurpose?.[index]  && <span className="validationerror">{errors.VisaLetterOfPurpose?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
    		<div className="InputLabel" >{LetterObject?.['RotationVisa']?.['label']} Status</div>
                <Select1
        value={LetterObject['VisaLetterStatus']}
        onChange={(event) => handleRotationChange(event,'VisaLetterStatus',index,LetterIndex )}
        variant="outlined"
        placeholder="Letter Status"
        label="Letter Status"
        options={RotationVisaLetterStatusOptions}
        isSearchable
      	/>
      	 {errors.VisaLetterStatus?.[index]  && <span className="validationerror">{errors.VisaLetterStatus?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
    		<div className="InputLabel" >Visa Status</div>
                <Select1
        value={LetterObject['RotationVisaStatus']}
        onChange={(event) => handleRotationChange(event,'RotationVisaStatus',index,LetterIndex )}
        variant="outlined"
        placeholder="Visa Status"
        label="Visa Status"
        options={RotationVisaStatusOptions}
        isSearchable
      	/>
      	 {errors.RotationVisaStatus?.[index]  && <span className="validationerror">{errors.RotationVisaStatus?.[index] }</span>}
       </Grid>
   {/*<Grid item xs={6}>
    <div className="InputLabel" >Acceptance Letter</div>
                <Select1
        value={LetterObject['AcceptanceLetter']}
        onChange={(event) => handleRotationChange(event,'AcceptanceLetter',index,LetterIndex )}
        variant="outlined"
        name={`AcceptanceLetter[${index}]`}
        placeholder="Acceptance Letter"
        label="Acceptance Letter"
        options={RotationAcceptanceLetter}
        isSearchable
      	/>
      	 {errors.AcceptanceLetter?.[index]  && <span className="validationerror">{errors.AcceptanceLetter?.[index] }</span>}
       </Grid>*/}
  </>


    )}
    <Grid item xs={12}>
    <div className="InputLabel" ></div>
                 <TextField
                    label="Custom Notes"
                    variant="outlined"
                    multiline
                    fullWidth
                    value={LetterObject['VisaLetterNote']}
                    required
                    onChange={(event) => handleRotationChange(event,'VisaLetterNote',index,LetterIndex)}
                     InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
                  />
      	 {errors.VisaLetterNote?.[index]  && <span className="validationerror">{errors.VisaLetterNote?.[index] }</span>}
       </Grid>
    </Grid>
    </div>);
       })}
   </div>
    <div className="AddPaymentButton">
           <Grid item xs={6} >

                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddRotationLetter(indexLetter+1,index)}
            >
              Add Letter
            </Button>
                </Box>
                </Grid>
            </div>
   </div>
    <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>HOUSING:</b>  </Typography>
                </div>
       <div className="VisaLetter">
        <div className="VisaLetterContainer">
        <Grid container spacing={2} sx={{ p: 1 }} >
        <Grid item xs={6}>
       	<div className="InputLabel">Housing Assistance Needed?</div>
                <Select1
        value={rotation['HousingAssistanceNeeded']}
        onChange={(event) => handleRotationChange(event,'HousingAssistanceNeeded',index )}
        variant="outlined"
        name={`HousingApplicationFeePaidStatus[${index}]`}
        placeholder="Housing Assistance Needed?"
        label="Housing Assistance Needed"
        options={HousingAssistanceList}
        isSearchable
      	/>
      	 {errors.HousingAssistanceNeeded?.[index]  && <span className="validationerror">{errors.HousingAssistanceNeeded?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
       	<div className="InputLabel" >Housing Application Fee Paid?</div>
                <Select1
        value={rotation['HousingApplicationFeePaidStatus'] || ''}
        onChange={(event) => handleRotationChange(event,'HousingApplicationFeePaidStatus',index )}
        variant="outlined"
        name={`HousingApplicationFeePaidStatus[${index}]`}
        placeholder="Housing Application Fee Paid?"
        label="Housing Application fee paid"
        options={HousingStatus}
        isSearchable
      	/>
      	 {errors.HousingApplicationFeePaidStatus?.[index]  && <span className="validationerror">{errors.HousingApplicationFeePaidStatus?.[index] }</span>}
       </Grid>
        {rotation?.['HousingApplicationFeePaidStatus']?.['value'] === 'Yes' && (
        <Grid container spacing={2} sx={{ p: 1 }}>
       <Grid item xs={6}>
                  <div className="InputLabel" >Housing Code</div>
                <Select1
        value={rotation['HousingCode']}
        onChange={(event) => handleRotationChange(event,'HousingCode',index )}
        variant="outlined"
        options={HousingCodes}
        placeholder="Housing Code"
        label="Housing Code"
        isSearchable
      />
                  {errors.HousingApplicationAmount?.[index]  && <span className="validationerror">{errors.HousingApplicationAmount?.[index] }</span>}
    </Grid>
    <Grid item xs={6}>
       <div className="InputLabel" ></div>
                  <TextField
                    label="Housing Application Amount"
                    variant="outlined"
                    name="HousingApplicationAmount"
                    fullWidth
                    value={rotation['HousingApplicationAmount']}
                    required
                    onChange={(event) => handleRotationChange(event,'HousingApplicationAmount',index)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.HousingApplicationAmount?.[index]  && <span className="validationerror">{errors.HousingApplicationAmount?.[index] }</span>}
    </Grid>
    <Grid item xs={6}>
    <div className="InputLabel" ></div>
                 <TextField
                    label="Housing Amount"
                    variant="outlined"
                    name="HousingAmount"
                    fullWidth
                    value={rotation['HousingAmount']}
                    required
                    onChange={(event) => handleRotationChange(event,'HousingAmount',index)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
      	 {errors.HousingAmount?.[index]  && <span className="validationerror">{errors.HousingAmount?.[index] }</span>}
       </Grid>
    </Grid>

    )}
     <Grid item xs={12}>
    <div className="InputLabel" ></div>
                 <TextField
                    label="Custom Notes"
                    variant="outlined"
                    multiline
                    fullWidth
                    value={rotation['HousingNotes']}
                    required
                    onChange={(event) => handleRotationChange(event,'HousingNotes',index)}
                     InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
                  />
      	 {errors.HousingNotes?.[index]  && <span className="validationerror">{errors.HousingNotes?.[index] }</span>}
       </Grid>
     </Grid>
     </div>
     </div>
     </div>

      <div className="RotationAddedPayment MatchPayment" >
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Refund:</b>  </Typography>
                </div>
       <div className="VisaLetter">
       <Grid container spacing={2} sx={{ p: 1 }}>
       <Grid item xs={6}>
                <div className="InputLabel">Team Member in touch</div>
                <Select1
        value={rotation?.['RefundData']?.['TeamMemberInTouchForRefund'] || ''}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Team Member in touch"
        onChange={(event) => handleRotationChange(event,'TeamMemberInTouchForRefund',index)}
        isSearchable
      />
      	{errors.TeamMemberInTouchForRefund  && <span className="validationerror">{errors.TeamMemberInTouchForRefund }</span>}
               </Grid>
               <Grid item xs={6} >
                <div className="InputLabel" >Refund Date</div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Refund Request Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={rotation?.['RefundData']?.['RefundRequestDate']?dayjs(rotation?.['RefundData']?.['RefundRequestDate'].toDate().toISOString()):null}
        onChange={(event) => handleRotationChange(event,'RefundRequestDate',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Refund Request Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.RefundRequestDate?.[index] && <span className="validationerror">{errors.RefundRequestDate?.[index]}</span>}
              </Grid>
              <Grid item xs={6}>
     <div className="InputLabel" >Refund Status</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
                    id="FeeType"
                    name="FeeType"
                    value={rotation?.['RefundData']?.['RefundStatus'] || ''}
                    label="Refund Status"
                    required
                    onChange={(event) => handleRotationChange(event,'RefundStatus',index)}
                  >
                      <MenuItem value="">
                        -Select-
                      </MenuItem>
                      <MenuItem value="Refunded">
                        Refunded
                      </MenuItem>
                      <MenuItem value="Pending">
                        Pending
                      </MenuItem>
                       <MenuItem value="Unclear">
                        Unclear
                      </MenuItem>
                      <MenuItem value="Refund denied">
                        Refund denied
                      </MenuItem>
                      </Select>
                      {errors.RefundStatus?.[index]  && <span className="validationerror">{errors.RefundStatus?.[index] }</span>}
                    </FormControl>

       </Grid>
    	<Grid item xs={6}>

    	<div className="InputLabel" >Refund Type?</div>
                <Select1
        value={rotation?.['RefundData']?.['RefundType']}
        onChange={(event) => handleRotationChange(event,'RefundType',index )}
        variant="outlined"
        placeholder="Refund Type?"
        label="Refund Type"
        options={RotationRefund}
        isSearchable
      	/>
      	 {errors.RefundType?.[index] && <span className="validationerror">{errors.RefundType?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
                <div className="InputLabel" >Mode Of Refund</div>
                <Select1
        value={rotation?.['RefundData']?.['ModeOfRefund']}
        onChange={(event) => handleRotationChange(event,'ModeOfRefund',index)}
        variant="outlined"
        placeholder="Mode Of Refund"
        label="Mode Of Refund"
        options={PaymentOptionsList}
        isSearchable
      	/>
      	 {errors.ModeOfRefund?.[index]  && <span className="validationerror">{errors.ModeOfRefund?.[index] }</span>}
       </Grid>
       <Grid item xs={6}>
                <div className="InputLabel" >Refund Amount</div>
                  <TextField
                    label="Refund Amount"
                    variant="outlined"
                    fullWidth
                    value={rotation?.['RefundData']?.['RefundAmount']}
                    required
                    onChange={(event) => handleRotationChange(event,'RefundAmount',index)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.RefundAmount?.[index]  && <span className="validationerror">{errors.RefundAmount?.[index] }</span>}
                </Grid>
                <Grid item xs={6} >
                <div className="InputLabel" >Date Refunded</div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Date Refunded:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={rotation?.['RefundData']?.['RefundDate']?dayjs(rotation?.['RefundData']?.['RefundDate'].toDate().toISOString()):null}
        onChange={(event) => handleRotationChange(event,'RefundDate',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Date Refunded"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.RefundDate?.[index] && <span className="validationerror">{errors.RefundDate?.[index]}</span>}
              </Grid>
       <Grid item xs={6}>
       <div className="InputLabel" >Refund Note</div>
                 <TextField
                    label="Refund Note"
                    variant="outlined"
                    multiline
                    fullWidth
                    value={rotation?.['RefundData']?.['RefundNote']}
                    required
                    onChange={(event) => handleRotationChange(event,'RefundNote',index)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                     InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
                  />
      	 {errors.RefundNote?.[index] && <span className="validationerror">{errors.RefundNote?.[index] }</span>}
       </Grid>
       </Grid>
       </div>
       </div>
       </Grid>
       		<div className="RotationAddedPayment">
       			<div className="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Payment Details:</b>  </Typography>
                </div>
       		{ rotation['RotationPayment'].map((paymentObject, Paymentindex) => {
       		lastPaymentIndex = Paymentindex;
       		//rotationFeeItselfStatus
       		if(paymentObject['FeeType']==="application fee")
       		{
       		  //paymentParams['amount']=paymentObject['Amount'];
       		  paymentParams['amount'] = Number(
    Number(paymentObject['Amount']*100).toFixed(2)
  );
  //const queryString = new URLSearchParams(paymentParams).toString();
//paymentSuccessURL = `https://residencymatch.usmlesarthi.com/payment-success-error?${queryString}`;
       		}
       		
       		if(rotation['RotationStatus']?.['label'] === 'Rotation canceled.' && paymentObject['FeeType']==="application fee")
       		{
       			CancleApplicationFeeType=paymentObject['FeeType'];
 				CancleApplicationModeOfPayment=paymentObject['ModeOfPayment'];
 				CancleApplicationCouponCode=paymentObject['CouponCode'];
  				CancleApplicationPaymentAmount=paymentObject['Amount'];
  				CancleApplicationPaymentDate=paymentObject['PaymentDate']?dayjs(paymentObject['PaymentDate'].toDate().toISOString()):null;
  				CancleApplicationCustomNote=paymentObject['RotationPaymentNotes'];
  				//{"here you are"}
       		}
       		else if(rotation['RotationStatus']?.['label'] !== 'Rotation canceled.')
       		{
       			CancleApplicationFeeType="";
 				CancleApplicationModeOfPayment="";
 				CancleApplicationCouponCode="";
  				CancleApplicationPaymentAmount="";
  				CancleApplicationPaymentDate="";
  				CancleApplicationCustomNote="";
       		}
       		return (
       				<div className="RotationAddedPaymentBody" key={Paymentindex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                	<div className="InputLabel" ></div>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Payment No:</b>  <font color="blue"><b>{Paymentindex+1}</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeletePayment(Paymentindex,index)}
            >
              Delete Payment {Paymentindex+1}
            </Button>
                </Box>
                </Grid>
                <Grid item xs={6}>
     <div className="InputLabel" >Fee Type</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"
                    id="FeeType"
                    name="FeeType"
                    value={paymentObject['FeeType']}
                    label="Fees Type"
                    required
                    onChange={(event) => handleRotationChange(event,'FeeType',index,Paymentindex)}
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
                      <MenuItem value="rotation balance payment">
                        Balance Payment
                      </MenuItem>
                      </Select>
                      {errors.FeeType?.[index]  && <span className="validationerror">{errors.FeeType?.[index] }</span>}
                    </FormControl>

       </Grid>

                <Grid item xs={6}>
                <div className="InputLabel" >Mode Of Payment</div>
                <Select1
        value={paymentObject['ModeOfPayment']}
        onChange={(event) => handleRotationChange(event,'ModeOfPayment',index,Paymentindex )}
        variant="outlined"
        name={`ModeOfPayment[${index}]`}
        placeholder="Mode Of Payment"
        label="Mode Of Payment"
        options={PaymentOptionsList}
        isSearchable
      	/>
      	 {errors.ModeOfPayment?.[index]?.[Paymentindex]  && <span className="validationerror">{errors.ModeOfPayment?.[index]?.[Paymentindex] }</span>}
       </Grid>
       <Grid item xs={6}>
       <div className="InputLabel" ></div>
                  <TextField
                    label="Coupon Code"
                    variant="outlined"
                    name="CouponCode"
                    fullWidth
                    value={paymentObject['CouponCode']}
                    required
                    onChange={(event) => handleRotationChange(event,'CouponCode',index,Paymentindex)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.CouponCode?.[index]?.[Paymentindex]  && <span className="validationerror">{errors.CouponCode?.[index]?.[Paymentindex] }</span>}
                </Grid>
                <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <TextField
                    label="Payment Amount"
                    variant="outlined"
                    name="RotationPaymentAmount"
                    fullWidth
                    value={paymentObject['Amount']}
                    required
                    onChange={(event) => handleRotationChange(event,'RotationPaymentAmount',index,Paymentindex)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Amount?.[index]?.[Paymentindex]  && <span className="validationerror">{ errors.Amount?.[index]?.[Paymentindex] }</span>}
                </Grid>
                <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={paymentObject['PaymentDate']?dayjs(paymentObject['PaymentDate'].toDate().toISOString()):null}
        onChange={(event) => handleRotationChange(event,'PaymentDate',index,Paymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[Paymentindex] && <span className="validationerror">{errors.PaymentDate?.[index]?.[Paymentindex]}</span>}
              </Grid>
               <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Added On:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
  defaultValue={
    paymentObject['PaymentActualAddedDate']
      ? dayjs(paymentObject['PaymentActualAddedDate'].toDate().toISOString())
      : dayjs() // Default to today
  }
  onChange={(event) => handleRotationChange(event, 'PaymentActualAddedDate', index, Paymentindex)}
  dateFormat="dd/mm/yyyy"
  scrollableYearDropdown
  disabled
  yearDropdownItemNumber={50}
  picker="date"
  label="Payment Added On"
  variant="outlined"
/></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[Paymentindex] && <span className="validationerror">{errors.PaymentDate?.[index]?.[Paymentindex]}</span>}
              </Grid>
              <Grid item xs={6}>
                <div className="InputLabel">Need Notify</div>
     <FormControl fullWidth>
     <Select

                    id="PaymentNotify"
                    name="FeeType"
                    value={paymentObject['PaymentNotify'] || 'no'}
                    label="Need Notify"
                    required
                    onChange={(event) => handleRotationChange(event,'PaymentNotify',index,Paymentindex)}
                  >
                       <MenuItem value="no">
                        No
                      </MenuItem>
                      <MenuItem value="yes">
                        Yes
                      </MenuItem>
                      </Select>
                      {errors.PaymentNotify?.[index]  && <span className="validationerror">{errors.PaymentNotify?.[index] }</span>}
                    </FormControl>

       </Grid>
        {paymentObject?.['PaymentNotify'] === 'yes' && (
        <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Notify On Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={paymentObject['NotifyDate']?dayjs(paymentObject['NotifyDate'].toDate().toISOString()):null}
        onChange={(event) => handleRotationChange(event,'NotifyDate',index,Paymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Notify On Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[Paymentindex] && <span className="validationerror">{errors.PaymentDate?.[index]?.[Paymentindex]}</span>}
              </Grid>
        )}
              <Grid item xs={6}>
                <div className="InputLabel" ></div>
                  <FormControl fullWidth className="NoTop">
                  <TextField
  label="Custom Notes"
  multiline
  variant="outlined"
	name="RotationPaymentNotes"
	id="NoTop"
  value={paymentObject['RotationPaymentNotes']}
  onChange={(event) => handleRotationChange(event,'RotationPaymentNotes',index,Paymentindex)}
  sx={{ my: 2 }}
   InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
/>
</FormControl>
                  {errors.RotationPaymentNotes?.[index]?.[Paymentindex]  && <span className="validationerror">{errors.Amount?.[index]?.[Paymentindex] }</span>}
                </Grid>





            	 </Grid>
            	 </div>
            )})
            }
            
            
            
             
            <div className="AddPaymentButton">
            <Grid item xs={6}>
            <Box sx={{ display: 'flex', p: 2, borderRadius: 1 }}>
<Button
              variant="contained"
              color="secondary"
              onClick={() => handleCopy("https://residencymatch.usmlesarthi.com/payment-success-error?" +
            new URLSearchParams(paymentParams).toString(),index)}
            >
            Copy Payment URL

    </Button>
    </Box>

</Grid>
           <Grid item xs={6} >

                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddRotationPayment(lastPaymentIndex+1,index)}
            >
              Add Payment
            </Button>
                </Box>
                </Grid>
            </div>
            </div>

            </div>
                    )})}
                 <div className="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="warning"
              onClick={() => AddRotation(lastRotationIndex+1)}
            >
              Add Rotation
            </Button>
                </Box>
                </Grid>
            </div>

            	<div className="AddSaveButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="success"
              onClick={() => SaveRotation(lastRotationIndex+1)}
            >
              Save
            </Button>
                </Box>
                </Grid>
            </div>
              </div>




			</div>
          </TabPanel>

          <TabPanel value={value} index={2}>
             <Research
            researchValues={researchValues}
            setresearchValues={setresearchValues}
            DeleteResearch={DeleteResearch}
            AddResearch={AddResearch}
            handleResearchChange={handleResearchChange}
            DeletePayment={DeletePayment}
            PaymentOptionsList={PaymentOptionsList}
            AddRotationPayment={AddRotationPayment}
            handleUpdateResearch={handleUpdateResearch}
            errors={errorsResearch}
            RotationReview={RotationReview}
          />
          </TabPanel>
          <TabPanel value={value} index={3}>
             <UserServices
            MatchValues={MatchValues}
            plan={plan}
            HandlePlatinumChange={HandlePlatinumChange}
            errors={errors}
            rotationValues={rotationValues}
            DeleteMeetings={DeleteMeetings}
            AddMeetings={AddMeetings}
            UserServicesTaken={UserServicesTaken}
            HandlePlatinumMeetingsChange={HandlePlatinumMeetingsChange}
            MatchPlanListObject={MatchPlanListObject}
          />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <CommonNotes
            CommonUserNotesData={CommonUserNotesData}
            DeleteFollowup={DeleteFollowup}
            SaveFollowups={SaveFollowups}
            ActualUser={ActualUser}
            AddFollowup={AddFollowup}
            UserData={userData}
            errors={errors}
            NextFollowupChange={NextFollowupChange}
            AdminOptionsList={AdminOptionsList}
            plan={plan}
            HandleCommonNotesSectionChange={HandleCommonNotesSectionChange}
          />
          </TabPanel>
          <TabPanel value={value} index={5}>
            <StudentEnqueries
            EnquiriesWithRotation={EnquiriesWithRotation}
            DeleteFollowup={DeleteFollowup}
            SaveFollowups={SaveFollowups}
            ActualUser={ActualUser}
            AddFollowup={AddFollowup}
            UserData={userData}
            errors={errors}
            NextFollowupChange={NextFollowupChange}
            AdminOptionsList={AdminOptionsList}
            plan={plan}
            HandleCommonNotesSectionChange={HandleCommonNotesSectionChange}
          />
          </TabPanel>
          <TabPanel value={value} index={6}>
            <AnswerQuestionsTab
            EnquiriesWithRotation={EnquiriesWithRotation}
            DeleteFollowup={DeleteFollowup}
            SaveFollowups={SaveFollowups}
            ActualUser={ActualUser}
            AddFollowup={AddFollowup}
            UserData={userData}
            errors={errors}
            NextFollowupChange={NextFollowupChange}
            AdminOptionsList={AdminOptionsList}
            plan={plan}
            HandleCommonNotesSectionChange={HandleCommonNotesSectionChange}
          />
          </TabPanel>
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

      <Dialog
        open={OnBoardingOpen}
        onClose={OnBoardingClose}

        PaperProps={{
    sx: {
      width: '90%',
      maxWidth: '100%',
      overflow: 'auto',
    },
  }}
      >
        <DialogTitle>ONBOARDING & ACCESS</DialogTitle>
        <DialogContent
        className="PaddingTop"
        PaperProps={{
    sx: {
      height: '100%',
      overflowY: 'auto',
      position: 'relative',
      paddingTop:'15px'
    },
  }}

        onScroll={handleScroll}
        ref={contentRef}
  >
          <DialogContentText>
          <OnBoardingHtml
            MatchValues={MatchValues}
            HandleOnBoardingChange={HandleOnBoardingChange}
            errors={errors}
          />

          </DialogContentText>
        </DialogContent>
        <DialogActions>


        </DialogActions>
        {showScrollDown && (
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1400, // Ensure it appears above other elements
            backgroundColor: '#b2ebf2',
            border: '1px solid blue',
          }}
          onClick={() => {
            contentRef.current.scrollBy({ top: 100, behavior: 'smooth' });
          }}
        >
          <KeyboardArrowDown />
        </IconButton>
      )}
       <div className="AddSaveButtonOnBoard">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="success"
              onClick={() => SaveOnBoarding(lastRotationIndex+1)}
              className="MarginoAuto"
            >
              Save
            </Button>
                </Box>
                </Grid>
            </div>
      </Dialog>
      </CenteredBoxInfo>
      
    </CenteredBox>
    
  );
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export default UserDetails;
