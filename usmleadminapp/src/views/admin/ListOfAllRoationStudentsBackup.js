import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLoading } from '../../layout/LoadingContext';
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Grid,
  TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
///import DatePicker from 'react-datepicker';
//import 'react-datepicker/dist/react-datepicker.css';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
let startDateConst;
let endDateConst;
let dynamicFieldConst;
dayjs.extend(utc);
dayjs.extend(timezone);
let EmailList=[];
let fitlersSelected=[];
let FilterNameset="";
const IST_OFFSET_MINUTES = 330;
let CompareStartDate;
let innerStartDate;
let innerEndDate;
let innerDynamicField;
let CompareEndDate;
 const dateFormat = "MM/DD/YYYY";
 let LocationCodeDoctorsName={};
let FilterChangingOption={};
const UserDetails = () => {
  	const { did } = useParams();
  	const { showLoading, hideLoading, API_KEY,FetchDataFromCollection,DatabaseName,SelectWithComplexConditions,Timestamp,handleUpdate } = useLoading();
	const [OperationMessage, setOperationMessage] = useState('');
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [errors, setErrors] = useState({});
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'RotationStartDate', name: '' });
	const [FiltersType, setFiltersType] = useState(filters.id);
	const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0));

const [endDate, setEndDate] = useState(dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0));

  	const [startDateView, setStartDateView] = useState(dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0));
  	const [endDateView, setEndDateView] = useState(dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0));
  	const [conditionType, setconditionType] = useState('');
  	const [filterField, setFilterField] = useState(filters.id);
  	const [idOptions, setIdOptions] = useState([]);
  	const [CurrentData, setCurrentData] = useState([]);
  	const [DynamicField, setDynamicField] = useState(null);
  	const [DoctorsDetails, setDoctorsDetails] = useState(null);
  	const [sortConfig, setSortConfig] = useState({ key: 'AdminInTouch', direction: 'ascending' });

	const [selectedFeeType, setSelectedFeeType] = useState(null);

// Updated requestSort function to handle FeeType
const requestSort = (key, feeType = null) => {
  let direction = 'ascending';
  if (sortConfig.key === key && sortConfig.direction === 'ascending') {
    direction = 'descending';
  }

  setSortConfig({ key, direction });
  setSelectedFeeType(feeType); // Track selected FeeType for sorting
};

// Updated sortedData with FeeType sorting logic
const sortedData = useMemo(() => {
let updateDatabase=true;
  const sortableItems = AllPaymentData.flatMap(user => {
    return Object.keys(user.RotationData.Rotations).flatMap(rotationKey => {
      const rotation = user.RotationData.Rotations[rotationKey];


       const StartDateR=new Date(rotation?.StartDate?.seconds * 1000);
       const EnrollmentDateR=new Date(rotation?.EnrollmentDate?.seconds * 1000);
       const ContractSignedDateFetch=new Date(rotation?.ContractSignedDate?.seconds * 1000);rotation.StartDate

      if (filters.id === "RotationStartDate" && !(StartDateR > CompareStartDate && StartDateR <= CompareEndDate)) {
        return [];
      }
      if (filters.id === "RotationEnrollmentDate" && !(EnrollmentDateR > CompareStartDate && EnrollmentDateR <= CompareEndDate)) {
        return [];
      }
      if (filters.id === "ContractStatus" && (rotation.ContractStatus?.label!==DynamicField) ||( filters.id === "ContractStatus" && !(ContractSignedDateFetch > CompareStartDate && ContractSignedDateFetch <= CompareEndDate))) {
        return [];
      }
      if ((filters.id === "Connected" && (rotation.RotationStatus?.label!=="Connected with physician")) || ( filters.id === "Connected" && !(StartDateR > CompareStartDate && StartDateR <= CompareEndDate))) {
        return [];
      }
      if ((filters.id === "NConnected" && (rotation.RotationStatus?.label!=="Not connected with physician")) || ( filters.id === "NConnected" && !(StartDateR > CompareStartDate && StartDateR <= CompareEndDate))) {
        return [];
      }
      if (filters.id === "LocationCodeC" && (rotation.LocationCode?.label!==DynamicField)) {
        return [];
      }
      if (filters.id === "LocationCodeNC" && (rotation.LocationCode?.label!==DynamicField)) {
        return [];
      }
      if (filters.id === "VisaLetterStatus" && (rotation?.RotationVisaSection?.Letter0?.VisaLetterStatus?.label!==DynamicField && rotation?.RotationVisaSection?.Letter1?.VisaLetterStatus?.label!==DynamicField)) {
        return [];
      }
      if (filters.id === "RotationStatus" && (rotation.RotationStatus?.label!==DynamicField)) {
        return [];
      }
      if (filters.id === "RotationReview" && (rotation.RotationReview?.label!==DynamicField)) {
        return [];
      }
      //let fieldrow="RotationData.Rotations."+rotationKey+".RotationStatus.label"
      /*let fieldrow={}
      fieldrow["RotationData"]={};
      fieldrow["RotationData"]["Rotations"]={}
      fieldrow["RotationData"]["Rotations"][rotationKey]={};
       fieldrow["RotationData"]["Rotations"][rotationKey]["RotationStatus"]={label:"",value:""};

      if(updateDatabase)
      {
        console.log("user?.profile?.uid--->",user?.profile?.uid)
        console.log("rotationKey--->",rotationKey)
        console.log("fieldrow--->",fieldrow)
        handleUpdate("UserServices", user?.profile?.uid, fieldrow).then((result) => {})
        //updateDatabase=false;
      }*/
	let RotationVisa1='';
	let HousingCode1='';
	let VPD="";
	let RotationStatus="";
	let RotationReview="";
	if(typeof rotation?.RotationVisa?.label!=="undefined")
	{
		if(RotationVisa1=rotation?.RotationVisa?.label==="Paid for Visa letter")
		{
			if(rotation?.RotationVisaAmountDate)
			{
				VPD=rotation.RotationVisaAmountDate ? dayjs(new Date(rotation.RotationVisaAmountDate.seconds * 1000)).format('MM-DD-YYYY') :"NA";
			}
			RotationVisa1=`${rotation?.RotationVisa?.label} Amount Paid:${rotation.RotationVisaAmount} Payment Date:${VPD}`;
		}
		else
		{
			RotationVisa1=rotation?.RotationVisa?.label;
		}

	}
	if(typeof rotation.HousingCode?.OwnerEmail!=="undefined")
	{
		//HousingCode1=rotation.HousingCode;
		  HousingCode1 = `Owner Email: ${rotation.HousingCode.OwnerEmail}   Owner Name: ${rotation.HousingCode.OwnerName} name: ${rotation.HousingCode.label}`;
	}
	if(typeof rotation.RotationStatus?.label!=="undefined")
	{
		//HousingCode1=rotation.HousingCode;
		  RotationStatus = rotation.RotationStatus?.label;
	}
	if(typeof rotation.RotationReview?.label!=="undefined")
	{
		//HousingCode1=rotation.HousingCode;
		  RotationReview = rotation.RotationReview?.label;
	}
      // Map payments with necessary fields
     EmailList.push({email:user?.profile?.email,displayName:user?.profile?.displayName, phoneNumber: user?.profile?.PhoneCountry?.phoneCode+''+user?.profile?.phoneNumber});
		return {
          uid: user?.profile?.uid,
          StudentUniqueId: user?.profile?.StudentUniqueId,
          email: user?.profile?.email,
          displayName: user?.profile?.displayName,
          phoneCode: user?.profile?.PhoneCountry?.phoneCode,
          phoneNumber: user?.profile?.phoneNumber,
          AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
          RefundData: rotation.RefundData,
          StartDate:rotation.StartDate,
          LocationCode:rotation.LocationCode?.label,
          EnrollmentDate:rotation.EnrollmentDate,
          VisaLetterStatus:rotation.VisaLetterStatus?.label,
          ContractStatus:rotation.ContractStatus?.label,
          ContractSignedDate:rotation?.ContractSignedDate,
          RotationVisa:RotationVisa1,
          RotationVisaSection:rotation?.RotationVisaSection,
          HousingCode:HousingCode1,
          RotationStatus:RotationStatus,
          RotationReview:RotationReview,
          RotationKey:rotationKey,
          PhysicianCheckPoint:rotation.PhysicianCheckPoint?rotation.PhysicianCheckPoint:'',
          StudentCheckPoint:rotation.StudentCheckPoint?rotation.StudentCheckPoint:'',
        };
    });
  });

  // Sorting based on sortConfig and selected FeeType
  if (sortConfig.key === 'PaymentDate' && selectedFeeType) {
    return sortableItems.sort((a, b) => {
      const aDate = a.FeeType === selectedFeeType ? new Date(a.PaymentDate.seconds * 1000) : new Date(0);
      const bDate = b.FeeType === selectedFeeType ? new Date(b.PaymentDate.seconds * 1000) : new Date(0);

      return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
    });
  } else if (sortConfig.key) {
    return sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  return sortableItems;
}, [AllPaymentData, sortConfig, selectedFeeType]);
  useEffect(() => {
    //return () => {
    fetchUserData();
 // };

  }, []);
  useEffect(() => {

  }, [did,fitlersSelected]);

const copyEmailsToClipboard = async () => {
	const emailList = EmailList.map(rotation => rotation.email).join('\n');
	navigator.clipboard.writeText(emailList).then(() => {
      alert('Emails copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy emails: ', err);
    });
}
const copyEmailsNameToClipboard = async () => {
  const emailList = EmailList.map(user => `${user.email}\t${user.displayName}\t'${user.phoneNumber}`).join('\n');
  try {
    await navigator.clipboard.writeText(emailList);
    alert('Emails copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy emails: ', err);
  }
};
  const loadFilterOptions = async () => {
    const idOptions = {
    	"RotationStartDate": "Rotation Start Date",
    	"RotationEnrollmentDate": "Enrollment Date",
    	"ContractStatus": "Contract Status",
    	"VisaLetterStatus": "Visa letter status",
    	"RotationStatus": "Rotation Status",
    	"RotationReview": "Rotation Review",
    	"LocationCodeC": "LocationCode(Connected)",
    	"LocationCodeNC": "LocationCode(Not Connected)",
    	"Connected": "Connected",
    	"NConnected": "Not Connected",

    };


    setIdOptions(idOptions);
  };
  function normalizeDate(input) {
    if (input instanceof Date) return input;
    if (input?.toDate) return input.toDate(); // Firestore Timestamp
    return new Date(input); // ISO string or number
  };
function convertISTMidnightToUTC(date, isStart = true) {
  const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
  // Set time to IST 00:00:00 or 23:59:59.999
  d.setHours(isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59, isStart ? 0 : 999);
  // Convert IST to UTC by subtracting 5.5 hours
  return new Date(d.getTime() - (5.5 * 60 * 60 * 1000));
}
  const HandleCheckPointChange = (event,name,uid,rotationkey) =>
  {
  		showLoader();
  		 showLoader();
  		 let newvalue=event.target.value
  		let dataTobesend = {};
  		dataTobesend['uid'] = uid;
  		dataTobesend['RotationData'] = {"Rotations":{"Rotation0":{[name]:event.target.value}}};
  		console.log("event----->",event.target.value)
  		console.log("name----->",name)
  		console.log("uid----->",uid)
  		console.log("dataTobesend----->",dataTobesend)
  		 handleUpdate("UserServices", uid, dataTobesend).then((result) => {
      setOperationMessage(result.message);

     setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: {
      ...prevValues[name],
      [uid]: {
        ...((prevValues[name] && prevValues[name][uid]) || {}), // Ensure [uid] is initialized
        [rotationkey]: newvalue,
      },
    },
  }));
      setOpen(true);
      hideLoader();
    });
  }
    const applyFilters = async () => {

    	if(startDate===null || endDate===null)
    	{
    		setOperationMessage("Please Select Date Ranges");
    		setOpen(true);
    	}
    	else if (filterField==="")
    	{
    		setOperationMessage("Please Select Filter");
    		setOpen(true);
    	}
    	else if(filterField==="ContractStatus" || filterField==="VisaLetterStatus" || filterField==="RotationStatus" || filterField==="RotationReview")
    	{
    		if(DynamicField===null)
    		{
    			setOperationMessage("Please Select "+filters.id+" Options" );
    			setOpen(true);
    		}
    		else
    		{
    			showLoader()
    			let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallrotationstudents","DynamicField":DynamicField,"filterName":FilterNameset}
    			console.log("SavedFiltersData---->",SavedFiltersData)
    	    let resF= await handleUpdate("SavedFilters", "listofallrotationstudents", SavedFiltersData)
    	    console.log("resF=====>",resF)
    			fetchUserData(filterField)

    		}
    	}
    	else
    	{
    		showLoader()
    		let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallrotationstudents","DynamicField":'',"filterName":FilterNameset}
    		console.log("SavedFiltersData---->",SavedFiltersData)
    	  let resF=await handleUpdate("SavedFilters", "listofallrotationstudents", SavedFiltersData);
    	  console.log("resF=====>",resF)
    		fetchUserData(filterField)
    	}

  };
   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)

    }
    console.log("value=====>",value)
     if(value==="ContractStatus" || value==="VisaLetterStatus" || value==="RotationStatus" || value==="RotationReview")
    {
    	if(value === "ContractStatus")
    	{
    		FilterChangingOption = {"Sent":"Sent","Signed":"Signed","Hold":"Hold","Not Signed":"Not Signed"};
    	}
    	else if(value === "VisaLetterStatus")
    	{
    		FilterChangingOption = {"Letter Requested":"Letter Requested","On Hold":"On Hold","Letter Complete and Sent":"Letter Complete and Sent"};
    	}
    	else if(value === "RotationStatus")
    	{
    		FilterChangingOption = {"Connected with physician":"Connected with physician","Rotation started":"Rotation started","Rotation completed":"Rotation completed","Rotation postponed":"Rotation postponed","No Reply from Student":"No Reply from Student","Rotation canceled.":"Rotation canceled.","Not connected with physician":"Not connected with physician"};
    	}
    	else
    	{
    		FilterChangingOption ={"No Reply":"No Reply","Video review submitted":"Video review submitted","Written review submitted":"Written review submitted","Done Instagram takeover":"Done Instagram takeover",
  "Done Interview with Pawan":"Done Interview with Pawan","Request not sent yet":"Request not sent yet","Request sent":"Request sent"}
    	}
    }
  FilterNameset=name;
    //if(name=="id" || name=="condition")
   setFilters({ ...filters, [name]: value });
  };
    const handleDynamicChange = (e)=>
  {
  	const { name, value } = e.target;
  	setDynamicField(value)

  };

  const fetchUserData = async (Cond="RotationStartDate") =>
  {
    try
    {
    	let result;
    	showLoading()
    	EmailList=[];
    	innerStartDate=startDate;
    	innerEndDate=startDate;
    	innerDynamicField=DynamicField;
    	fitlersSelected = await FetchDataFromCollection("SavedFilters", 20, "filtertype", "==", "listofallrotationstudents", 0);
    	if(fitlersSelected.length)
		  {
		    setStartDate(dayjs(fitlersSelected[0].startDate.toDate()))
		    setEndDate(dayjs(fitlersSelected[0].endDate.toDate()))
		    Cond=fitlersSelected[0].Cond;
		    setDynamicField(fitlersSelected[0].DynamicField)
		    setFilterField(Cond)
		    innerStartDate=fitlersSelected[0].startDate;
    	  innerEndDate=fitlersSelected[0].endDate;
    	  innerDynamicField=fitlersSelected[0].DynamicField;
    	  let SeetNameAswell=false;
		    if(Cond==="ContractStatus" || Cond==="VisaLetterStatus" || Cond==="RotationStatus" || Cond==="RotationReview")
        {
    	    if(Cond === "ContractStatus")
    	    {
    		    FilterChangingOption = {"Sent":"Sent","Signed":"Signed","Hold":"Hold","Not Signed":"Not Signed"};
    	    }
    	    else if(Cond === "VisaLetterStatus")
    	    {
    		    FilterChangingOption = {"Letter Requested":"Letter Requested","On Hold":"On Hold","Letter Complete and Sent":"Letter Complete and Sent"};
    	    }
    	    else if(Cond === "RotationStatus")
    	    {
    		    FilterChangingOption = {"Connected with physician":"Connected with physician","Rotation completed":"Rotation completed","Rotation postponed":"Rotation postponed","No Reply from Student":"No Reply from Student","Rotation canceled.":"Rotation canceled.","Not connected with physician":"Not connected with physician"};
    	    }
    	    else
    	    {
    		    FilterChangingOption ={"No Reply":"No Reply","Video review submitted":"Video review submitted","Written review submitted":"Written review submitted","Done Instagram takeover":"Done Instagram takeover",
            "Done Interview with Pawan":"Done Interview with Pawan","Request not sent yet":"Request not sent yet","Request sent":"Request sent"}
    	    }
    	    SeetNameAswell=true;

        }
        if(SeetNameAswell)
        {
          setFilters({ id:Cond, name: fitlersSelected[0].filtername });
        }
        else
        {
          setFilters({...filters,id:Cond})
        }

		  }
    	console.log("fitlersSelected---->",fitlersSelected)
    	console.log("startDate.toDate()-->",startDate.toDate())
    	console.log("endDate.toDate()-->",endDate.toDate())
    	console.log("Cond-->",Cond)
    	console.log("DynamicField---->",DynamicField)
    	const startDate1 = convertISTMidnightToUTC(innerStartDate, true);
      const endDate1 = convertISTMidnightToUTC(innerEndDate, false);

      console.log("startDate1-->",startDate1)
    	console.log("endDate1-->",endDate1)
      CompareStartDate=startDate1;
      CompareEndDate=endDate1;
      console.log("-------------->",CompareStartDate)
    	const DateTimestampStart=Timestamp.fromDate(startDate1);
    	const DateTimestampEnd=Timestamp.fromDate(endDate1);
		setStartDateView(startDate)
		setEndDateView(endDate)
    	loadFilterOptions();
    	let conditionsArray;
    	let feeTypeArray;
    	setFiltersType(filters.id)
    	let OrderColumn="";
    	let orderDirection=""
    	//setFilterField(filters.id)
    	if(Cond==="RotationFeeDate")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.LocationCode.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.LocationCode.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.LocationCode.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation3.LocationCode.label", condition: "==", value: '' },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation4.LocationCode.label", condition: "==", value: '' },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation5.LocationCode.label", condition: "==", value: '' },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	if(Cond==="RotationStatus")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation3.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation4.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation5.RotationStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	if(Cond==="RotationReview")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation3.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation4.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation5.RotationReview.label", condition: "!=", value: '' },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="ApplicationFeeDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment1.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment2.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment3.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment0.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment1.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment2.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment3.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment0.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment1.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment2.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment3.FeeType", condition: "in", value: feeTypeArray },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
			];
    	}
    	else if(Cond==="RotationStartDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],

			];
    	}
    	else if(Cond==="RotationEnrollmentDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation1.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation2.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation3.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation4.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "RotationData.Rotations.Rotation5.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				]

			];
    	}
    	else if(Cond==="RefundRequestDate")
    	{
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				],

  				[
  					{ name: "RotationData.Rotations.Rotation2.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="RefundDate")
    	{
    		conditionsArray =
    		[
  				[
    				{ name: "RotationData.Rotations.Rotation0.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				],

  				[
  					{ name: "RotationData.Rotations.Rotation2.RefundData.RefundRequestDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RefundData.RefundRequestDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="VisaLetterStatus")
    	{
    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.RotationVisaSection.Letter0.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation0.RotationVisaSection.Letter1.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.RotationVisaSection.Letter0.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
          [
  					{ name: "RotationData.Rotations.Rotation1.RotationVisaSection.Letter1.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.RotationVisaSection.Letter0.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.RotationVisaSection.Letter1.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.RotationVisaSection.Letter0.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.RotationVisaSection.Letter1.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.RotationVisaSection.Letter0.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.RotationVisaSection.Letter1.VisaLetterStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="LocationCodeC")
    	{
    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation0.RotationStatus.label", condition: "==", value: "Connected with physician" },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation1.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation2.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation3.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation4.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation5.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation5.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="LocationCodeNC")
    	{
    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation0.RotationStatus.label", condition: "==", value: "Not connected with physician" },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation1.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation2.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation3.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation4.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation5.LocationCode.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation5.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="Connected")
    	{
    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.RotationStatus.label", condition: "==", value: "Connected with physician" },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation5.RotationStatus.label", condition: "==", value: "Connected with physician" },
  					{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="NConnected")
    	{
    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.RotationStatus.label", condition: "==", value: "Not connected with physician" },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation3.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation4.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation5.RotationStatus.label", condition: "==", value: "Not connected with physician" },
  					{ name: "RotationData.Rotations.Rotation5.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation5.StartDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    	}
    	else if(Cond==="ContractStatus")
    	{

    		conditionsArray =
    		[
  				[
  					{ name: "RotationData.Rotations.Rotation0.ContractStatus.label", condition: "==", value: innerDynamicField },
    				{ name: "RotationData.Rotations.Rotation0.ContractSignedDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.ContractSignedDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation1.ContractStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation1.ContractSignedDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.ContractSignedDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation2.ContractStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation2.ContractSignedDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.ContractSignedDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation3.ContractStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation3.ContractSignedDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation3.ContractSignedDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
  					{ name: "RotationData.Rotations.Rotation4.ContractStatus.label", condition: "==", value: innerDynamicField },
  					{ name: "RotationData.Rotations.Rotation4.ContractSignedDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation4.ContractSignedDate", condition: "<=", value: DateTimestampEnd }
  				]
			];

			console.log("conditionsArray====>",conditionsArray)
    	}
    	console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users");
		let resultDoctors =await SelectWithComplexConditions("RotationDoctors",[[{name:"DoctorInfo.adminName",condition:"!=",value:"Temperory"}]]);
		console.log("resultDoctors---->",resultDoctors)
		console.log("result---->",result)
		hideLoader()
		hideLoading()
		if(resultDoctors.status==="success")
   		{
   			setDoctorsDetails(resultDoctors.data)
   			resultDoctors.data.forEach((doctor, index) =>
   			{
  				if (doctor.DoctorInfo?.locationCodes)
  				{
    				Object.entries(doctor.DoctorInfo.locationCodes).forEach(([key, value]) =>
    				{
     			 		LocationCodeDoctorsName[value] = index; // Map location code to doctor's index
    				});
  				}
			});

   		}
   		if(result.status==="success")
   		{
   			setAllPaymentData(result.data)

   		}
    }
    catch (error)
    {
      console.error("Error fetching user data:", error);
    }
  };



const isDateComparedTrue = (EnrollmentDate, operator, comparisonDate) => {
  // Extract the EnrollmentDate from the rotation object
  const enrollmentDate = EnrollmentDate;

  // Convert Firestore Timestamp to JavaScript Date
  if (enrollmentDate && enrollmentDate.seconds) {
    const enrollmentDateObject = new Date(enrollmentDate.seconds * 1000);

    // Perform the comparison based on the operator provided
    switch (operator) {
      case '>=':
        return enrollmentDateObject >= comparisonDate;
      case '<=':
        return enrollmentDateObject <= comparisonDate;
      case '>':
        return enrollmentDateObject > comparisonDate;
      case '<':
        return enrollmentDateObject < comparisonDate;
      case '==':
        return enrollmentDateObject === comparisonDate;
      default:
        throw new Error(`Invalid operator: ${operator}. Supported operators are: >=, <=, >, <.==`);
    }
  }

  // Return false if there's no valid EnrollmentDate
  return false;
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
const formatUSDate = (d) => {
  if (!d) return "-";
  // Firestore Timestamp (has toDate)
  if (typeof d?.toDate === "function") {
    return d.toDate().toLocaleDateString("en-US");
  }
  // Firestore Timestamp-like { seconds, nanoseconds }
  if (typeof d?.seconds === "number") {
    return new Date(d.seconds * 1000).toLocaleDateString("en-US");
  }
  // Milliseconds since epoch
  if (typeof d === "number") {
    return new Date(d).toLocaleDateString("en-US");
  }
  // ISO/string date
  if (typeof d === "string") {
    const dt = new Date(d);
    return isNaN(+dt) ? "-" : dt.toLocaleDateString("en-US");
  }
  return "-";
};
const hideLoader = () => {
     let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden'); // Example manipulation
    }
  };
  return (
    <CenteredBox>
		 <Box>
            <Box sx={{ mb: 4, display: 'flex', gap: 4 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="id-filter-label">Select Filter</InputLabel>
          <Select
            labelId="id-filter-label"
            id="id-filter"
            name="id"
            value={filters.id}
            label="Select Filter"
            onChange={handleFilterChange}
          >
            {/* Replace the following options with dynamic data as needed */}
            {Object.entries(idOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <div className="date-range-container">


        <div className="date-range-picker">
          <DatePicker
        selected={startDate}
        value={startDate}
        //onChange={date => setStartDate(date)}
        onChange={(date) => {
  const adjustedStart = date.set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0);
  setStartDate(adjustedStart);
}}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        format={dateFormat}
         showYearDropdown
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate}
        //onChange={date => setEndDate(date)}
        onChange={(date) => {
  const adjustedEnd =  date.set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0);
  setEndDate(adjustedEnd);
}}
        selectsEnd
        value={endDate}
        startDate={startDate}
        format={dateFormat}
        endDate={endDate}
        minDate={startDate}
         showYearDropdown
  showMonthDropdown
        placeholderText="End Date"
      />
        </div>

    </div>
         {(filters.id!=="LocationCodeNC" && filters.id!=="LocationCodeC" && filters.id!=="ContractStatus" && filters.id!=="VisaLetterStatus" &&  filters.id!=="RotationStatus" && filters.id!=="RotationReview") ? (
         <>
         </>
    ): (filters.id === "LocationCodeC" || filters.id === "LocationCodeNC" ) ?(
       <FormControl sx={{ minWidth: 220 }}>

          <TextField
                    label={filters.name=="ContractStatus"? " Contract Status":" LocationCode With Status Not Connected"}
                    variant="outlined"
                    fullWidth
                    value={DynamicField}
                    required
                    onChange={handleDynamicChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
        </FormControl>
    ):(
     <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="id-filter-label1">{filters.name}</InputLabel>
          <Select
            labelId="id-filter-label1"

            value={DynamicField}
            label={`Select ${filters.name}`}
            onChange={handleDynamicChange}
          >
            {/* Replace the following options with dynamic data as needed */}
            <MenuItem key="" value="">=Select=</MenuItem>
            {Object.entries(FilterChangingOption).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
    )}
        <Button variant="contained" className="FilterButton" onClick={applyFilters}>Apply Filters</Button>
      </Box>
      </Box>
      <CenteredBoxInfo>
      <div style={{
                  width: '45%',
                  margin: '0 auto',
				fontSize: '22px',
				fontWeight: 'bolder'
                }}>Rotation Users Total={sortedData.length}</div>

 	 <TableContainer component={Paper}>
      <Table sx={{ border: "1px solid black", borderCollapse: "collapse" }}>
        <TableHead>



            <TableRow sx={{ border: "1px solid black" }}>
            <TableCell onClick={() => requestSort('StudentUniqueId')} sx={{ border: "1px solid black" }}>
              Student ID {sortConfig.key === 'StudentUniqueId' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('displayName')} sx={{ border: "1px solid black" }}>
              Name {sortConfig.key === 'displayName' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('email')} sx={{ border: "1px solid black" }}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('phoneNumber')} sx={{ border: "1px solid black" }}>
              Phone {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('StartDate')} sx={{ border: "1px solid black" }}>
            	Rotation Start Date {sortConfig.key === 'StartDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        	</TableCell>
            <TableCell onClick={() => requestSort('EnrollmentDate')} sx={{ border: "1px solid black" }}>
                  Enrollement Date {sortConfig.key === 'EnrollmentDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('ContractStatus')} sx={{ border: "1px solid black" }}>
                Contract Status {sortConfig.key === 'ContractStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('ContractSignedDate')} sx={{ border: "1px solid black" }}>
                Contract Signed Date {sortConfig.key === 'ContractSignedDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('VisaLetterStatus')} sx={{ border: "1px solid black" }}>
                Visa Letter Status {sortConfig.key === 'VisaLetterStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort('LocationCode')} sx={{ border: "1px solid black" }}>
                Location Code {sortConfig.key === 'LocationCode' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('RotationVisa')} sx={{ border: "1px solid black" }}>
                Visa {sortConfig.key === 'RotationVisa' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            <div className="mb-4">
                <table className="border border-gray-300 w-full text-sm rounded-lg overflow-hidden">
                  <tbody>
                    <tr className="border-b">
                      <th className="font-semibold p-2 w-1/3" style={{ border: "1px solid black", padding: "6px" }}>Letter No</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>Letter Type</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>Required</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>Status</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>Letter Status</th>
                    </tr>
                    </tbody>
                    </table>
                </div>
            </TableCell>
             <TableCell onClick={() => requestSort('HousingCode')} sx={{ border: "1px solid black" }}>
                Housing Code {sortConfig.key === 'HousingCode' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('RotationStatus')} sx={{ border: "1px solid black" }}>
                Rotation Status {sortConfig.key === 'RotationStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}

            </TableCell>
            <TableCell onClick={() => requestSort('RotationReview')} sx={{ border: "1px solid black" }}>
                Rotation Review {sortConfig.key === 'RotationReview' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell sx={{ border: "1px solid black" }}>
            Physician CP
            </TableCell>
            <TableCell sx={{ border: "1px solid black" }}>
            Student CP
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
            //console.log("indexindex====>",index)
              return (
                <TableRow key={`${rotation.uid}-${rotation.RotationKey}`} sx={{ border: "1px solid black" }}>
                 <TableCell sx={{ border: "1px solid black" }}>S{rotation?.StudentUniqueId}</TableCell>
                 <TableCell sx={{ border: "1px solid black" }}>{rotation.displayName}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                    <a
                      href={`/admin/userdetails/${rotation.uid}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '2px 20px',
                        backgroundColor: '#af4cab',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}
                    >
                      {rotation.email}
                    </a>
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation.phoneCode}{rotation.phoneNumber}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation.StartDate?dayjs(new Date(rotation.StartDate.seconds * 1000)).tz('Asia/Kolkata').format(dateFormat):null}</TableCell>
                   <TableCell sx={{ border: "1px solid black" }}>{rotation.EnrollmentDate?dayjs(new Date(rotation.EnrollmentDate.seconds * 1000)).tz('Asia/Kolkata').format(dateFormat):null}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}> {rotation?.ContractStatus}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation?.ContractSignedDate?dayjs(new Date(rotation.ContractSignedDate.seconds * 1000)).tz('Asia/Kolkata').format(dateFormat):null}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation?.VisaLetterStatus}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>({ typeof LocationCodeDoctorsName[rotation?.LocationCode]!=="undefined"?DoctorsDetails[LocationCodeDoctorsName[rotation?.LocationCode]]['DoctorInfo']['representingName']:''}) {rotation?.LocationCode}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                  <div key={rotation?.VisaLetterStatus} className="mb-2">
                  <table className="border border-gray-300 w-full text-sm rounded-lg overflow-hidden">
                  <tbody>
  {Object.entries(rotation?.RotationVisaSection || {}).map(([letterKey, letterObj], index) => (

     /* <h5 className="font-semibold">Letter{index +1}</h5>
      <div className="text-sm flex flex-wrap gap-4" style={{ display: "ruby-text" }} >
        <span style={{ marginRight: "15px" }}>
          <strong>Letter Type:</strong> {letterObj?.RotationVisa?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Acceptance Type:</strong> {letterObj?.AcceptanceLetter?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Status:</strong> {letterObj?.RotationVisaStatus?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Letter Status:</strong> {letterObj?.VisaLetterStatus?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
  <strong>Letter Date:</strong> {formatUSDate(letterObj?.RotationVisaAmountDate)}
</span>
      </div>*/

                    <tr className="border-b">
                      <th className="font-semibold p-2 w-1/3" style={{ border: "1px solid black", padding: "6px" }}>Letter{index +1}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.RotationVisa?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.VisaLetterType?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.RotationVisaStatus?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.VisaLetterStatus?.label || "-"}</th>
                    </tr>

  ))}
   </tbody>
                    </table>
    </div>
</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation?.HousingCode}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation?.RotationStatus}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation?.RotationReview}</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}><Grid item xs={6}>
     <div className="InputLabel" >Phycian CP</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"

                  	value={CurrentData?.['PhysicianCheckPoint']?.[rotation.uid]?.[rotation.RotationKey]?CurrentData?.['PhysicianCheckPoint']?.[rotation.uid]?.[rotation.RotationKey]:rotation?.PhysicianCheckPoint}
                    label="Phycian CP"
                    required
                    onChange={(event) => HandleCheckPointChange(event,'PhysicianCheckPoint',rotation.uid,rotation.RotationKey)}
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

       </Grid></TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                  <Grid item xs={6}>
     <div className="InputLabel" >Student CP</div>
     <FormControl fullWidth>
     <Select
                    labelId="status-label"

                  	value={CurrentData?.['StudentCheckPoint']?.[rotation.uid]?.[rotation.RotationKey]?CurrentData?.['StudentCheckPoint']?.[rotation.uid]?.[rotation.RotationKey]:rotation?.StudentCheckPoint}
                    label="Student CP"
                    required
                    onChange={(event) => HandleCheckPointChange(event,'StudentCheckPoint',rotation.uid,rotation.RotationKey)}
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
                      {errors.StudentCheckPoint  && <span className="validationerror">{errors.StudentCheckPoint }</span>}
                    </FormControl>

       </Grid>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow sx={{ border: "1px solid black" }}>
              <TableCell colSpan={6} align="center" sx={{ border: "1px solid black" }}>
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p></p>
       <Button
        variant="contained"
        color="primary"
        onClick={copyEmailsToClipboard}
        style={{ marginBottom: '10px' }}
      >
        Copy Emails to Clipboard
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={copyEmailsNameToClipboard}
        style={{ marginBottom: '10px' }}
      >
        Copy Emails With Name to Clipboard
      </Button>
    </TableContainer>
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
      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
