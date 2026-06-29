import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLoading } from '../../layout/LoadingContext';
import RotationTable from "./SpeedFast/RotationTable";
const { RangePicker } = DatePicker;

import {
  Box,
  Button,
  Select,
  InputLabel,
  Typography,	
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
let AdminOptionsList=[];
let SetMainFilters;
const mainCollectionName = 'UsersRoles';
  	const joinCollectionName = 'Users';
let CompareEndDate;
 const dateFormat = "MM/DD/YYYY";
 const FilterContractStatusOption = {"Sent":"Sent","Signed":"Signed","Hold":"Hold","Not Signed":"Not Signed"};
 const FilterVisaLetterStatusOption = {"Letter Requested":"Letter Requested","On Hold":"On Hold","Letter Complete and Sent":"Letter Complete and Sent"};
 const FilterRotationStatusOption = {"Connected with physician":"Connected with physician","Rotation started":"Rotation started","Rotation completed":"Rotation completed","Rotation postponed":"Rotation postponed","No Reply from Student":"No Reply from Student","Rotation canceled.":"Rotation canceled.","Not connected with physician":"Not connected with physician"};
 const FilterRotationReviewOption ={"No Reply":"No Reply","Video review submitted":"Video review submitted","Written review submitted":"Written review submitted","Done Instagram takeover":"Done Instagram takeover",
  "Done Interview with Pawan":"Done Interview with Pawan","Request not sent yet":"Request not sent yet","Request sent":"Request sent"}
 let LocationCodeDoctorsName={};
let FilterChangingOption={};
const UserDetails = () => {
  	const { did } = useParams();
  	const { showLoading, hideLoading, API_KEY,FetchDataFromCollection,DatabaseName,SelectWithComplexConditions,Timestamp,handleUpdate,fetchAdminDataWithJoin } = useLoading();
	const [OperationMessage, setOperationMessage] = useState('');
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [errors, setErrors] = useState({});
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({});
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
    return Object.keys(user?.RotationData?.Rotations || {}).flatMap(rotationKey => {
      const rotation = user.RotationData.Rotations[rotationKey];


        const StartDateR=new Date(rotation?.StartDate?.seconds * 1000);
       const EnrollmentDateR=new Date(rotation?.EnrollmentDate?.seconds * 1000);

   
       if (SetMainFilters?.EnrollmentAdminInTouch) {
       if(!user?.profile?.EnrollmentAdminInTouch?.value || SetMainFilters?.EnrollmentAdminInTouch!=user?.profile?.EnrollmentAdminInTouch?.value)
       {
       	return [];
       }
       }
       

       if (
    SetMainFilters?.rotationStartDate &&
    SetMainFilters?.rotationStartDate.length === 2
  ) {
  const CompareStartDateR = convertISTMidnightToUTC(SetMainFilters.rotationStartDate[0]);
const CompareEndDateR = convertISTMidnightToUTC(SetMainFilters.rotationStartDate[1]);
  if (!(StartDateR > CompareStartDateR && StartDateR <= CompareEndDateR)) {
        return [];
      }
  }

  if (
    SetMainFilters?.enrollmentDate &&
    SetMainFilters?.enrollmentDate.length === 2
  ) {
   const CompareEnrollmentStartDateR = convertISTMidnightToUTC(SetMainFilters.enrollmentDate[0]);
const CompareEnrollmentEndDateR = convertISTMidnightToUTC(SetMainFilters.enrollmentDate[1]);
    if (!(EnrollmentDateR > CompareEnrollmentStartDateR && EnrollmentDateR <= CompareEnrollmentEndDateR)) {
        return [];
      }
  }

  if (SetMainFilters?.contractstatus) {
   if (rotation?.ContractStatus?.label!= SetMainFilters.contractstatus) {
        return [];
      }
  }

  if (SetMainFilters?.rotationstatus) {
  if (rotation?.RotationStatus?.label!= SetMainFilters.rotationstatus) {
        return [];
      }

  }

  if (SetMainFilters?.rotationreview) {
   if (rotation?.RotationReview!= SetMainFilters.rotationreview) {
        return [];
      }

  }

  if (SetMainFilters?.locationcode) {
  if (rotation?.LocationCode?.label!= SetMainFilters.locationcode) {
        return [];
      }
  }
  if (SetMainFilters?.PhysicianCheckPoint) {
    if (rotation?.PhysicianCheckPoint!= SetMainFilters.PhysicianCheckPoint) {
        return [];
      }
  }
if (SetMainFilters?.StudentCheckPoint) {
 if (rotation?.StudentCheckPoint!= SetMainFilters.StudentCheckPoint) {
        return [];
      }

  }
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
          EnrollmentAdminInTouch:user?.profile?.EnrollmentAdminInTouch,
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
    	"ContractStatusWithEnrollementDate": "Contract Status(Enroll)",
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
    	else if(filterField==="ContractStatus" || filterField === "ContractStatusWithEnrollementDate" || filterField==="VisaLetterStatus" || filterField==="RotationStatus" || filterField==="RotationReview")
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
  setFilters(prev => ({
    ...prev,
    [name]: value,
  }));
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
    	console.log("fitlersSelected===>",fitlersSelected)
    	if(fitlersSelected.length)
		  {
		  	 let savedFilters = {
    ...fitlersSelected[0]
  };

  // Enrollment Date
  if (
    savedFilters.enrollmentDate &&
    savedFilters.enrollmentDate.length === 2
  ) {
    savedFilters.enrollmentDate = [
      dayjs(
        savedFilters.enrollmentDate[0].toDate()
      ),
      dayjs(
        savedFilters.enrollmentDate[1].toDate()
      ),
    ];
  }

  // Rotation Start Date
  if (
    savedFilters.rotationStartDate &&
    savedFilters.rotationStartDate.length === 2
  ) {
    savedFilters.rotationStartDate = [
      dayjs(
        savedFilters.rotationStartDate[0].toDate()
      ),
      dayjs(
        savedFilters.rotationStartDate[1].toDate()
      ),
    ];
  }
		  	setFilters(savedFilters);
		  	SetMainFilters=savedFilters;
    	  	const adminOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Admin");

   adminOptions.data.map((item) => {
    AdminOptionsList.push({label:item.displayName,value:item.id});
    return "h";
    })
		
		  }

    	const startDate1 = convertISTMidnightToUTC(innerStartDate, true);
      const endDate1 = convertISTMidnightToUTC(innerEndDate, false);


      CompareStartDate=startDate1;
      CompareEndDate=endDate1;

    	const DateTimestampStart=Timestamp.fromDate(startDate1);
    	const DateTimestampEnd=Timestamp.fromDate(endDate1);
		setStartDateView(startDate)
		setEndDateView(endDate)
    	loadFilterOptions();
    	let conditionsArray=[];
    	let feeTypeArray;
    	setFiltersType(filters.id)
    	let OrderColumn="";
    	let orderDirection="";
    	//setFilterField(filters.id)
    	for (let i = 0; i <= 5; i++) 
    	{

    		 let currentConditions = [];


  if (
    SetMainFilters?.rotationStartDate &&
    SetMainFilters?.rotationStartDate.length === 2
  ) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.StartDate`,
      condition: ">=",
      value: Timestamp.fromDate(convertISTMidnightToUTC(SetMainFilters.rotationStartDate[0]))
    });

    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.StartDate`,
      condition: "<=",
      value: Timestamp.fromDate(convertISTMidnightToUTC(SetMainFilters.rotationStartDate[1]))
    });
  }

  if (
    SetMainFilters?.enrollmentDate &&
    SetMainFilters?.enrollmentDate.length === 2
  ) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.EnrollmentDate`,
      condition: ">=",
      value: Timestamp.fromDate(convertISTMidnightToUTC(SetMainFilters.enrollmentDate[0]))
    });

    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.EnrollmentDate`,
      condition: "<=",
      value:  Timestamp.fromDate(convertISTMidnightToUTC(SetMainFilters.enrollmentDate[1]))
    });
  }

  if (SetMainFilters?.contractstatus) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.ContractStatus.label`,
      condition: "==",
      value: SetMainFilters.contractstatus
    });
  }

  if (SetMainFilters?.rotationstatus) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.RotationStatus.label`,
      condition: "==",
      value: SetMainFilters.rotationstatus
    });
  }

  if (SetMainFilters?.rotationreview) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.RotationReview`,
      condition: "==",
      value: SetMainFilters.rotationreview
    });
  }

  if (SetMainFilters?.locationcode) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.LocationCode.label`,
      condition: "==",
      value: SetMainFilters.locationcode
    });
  }
  if (SetMainFilters?.PhysicianCheckPoint) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.PhysicianCheckPoint`,
      condition: "==",
      value: SetMainFilters.PhysicianCheckPoint
    });
  }
if (SetMainFilters?.StudentCheckPoint) {
    currentConditions.push({
      name: `RotationData.Rotations.Rotation${i}.StudentCheckPoint`,
      condition: "==",
      value: SetMainFilters.StudentCheckPoint
    });
  }



  conditionsArray.push(currentConditions);
  }
  console.log("conditionsArray===>",conditionsArray)

    	
		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users");
		let resultDoctors =await SelectWithComplexConditions("RotationDoctors",[[{name:"DoctorInfo.adminName",condition:"!=",value:"Temperory"}]]);
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
const formatDateForExcel = (d) => {
  if (!d) return "";
  // Firestore Timestamp .toDate()
  if (typeof d.toDate === "function") {
    return dayjs(d.toDate()).format("DD/MM/YYYY");
  }
  // Timestamp-like { seconds }
  if (typeof d.seconds === "number") {
    return dayjs(new Date(d.seconds * 1000)).format("DD/MM/YYYY");
  }
  // Fallback for Date/string
  const dt = new Date(d);
  if (!isNaN(+dt)) {
    return dayjs(dt).format("DD/MM/YYYY");
  }
  return "";
};
 const FilterData = async () => {

  let conditions = [];
  const filtersToSave = {
  ...filters,
};

if (
  filtersToSave.enrollmentDate &&
  filtersToSave.enrollmentDate.length === 2
) {
  filtersToSave.enrollmentDate = [
    Timestamp.fromDate(
      filtersToSave.enrollmentDate[0].toDate()
    ),
    Timestamp.fromDate(
      filtersToSave.enrollmentDate[1].toDate()
    ),
  ];
}
if (
  filtersToSave.rotationStartDate &&
  filtersToSave.rotationStartDate.length === 2
) {
  filtersToSave.rotationStartDate = [
    Timestamp.fromDate(
      filtersToSave.rotationStartDate[0].toDate()
    ),
    Timestamp.fromDate(
      filtersToSave.rotationStartDate[1].toDate()
    ),
  ];
}
console.log("filters----->",filters)
  // Rotation Start Date
  if (
    filters.rotationStartDate &&
    filters.rotationStartDate.length === 2
  ) {
    conditions.push([
      {
        name: "StartDate",
        condition: ">=",
        value: filters.rotationStartDate[0].toDate(),
      },
      {
        name: "StartDate",
        condition: "<=",
        value: filters.rotationStartDate[1].toDate(),
      },
    ]);
  }

  // Enrollment Date
  if (
    filters.enrollmentDate &&
    filters.enrollmentDate.length === 2
  ) {
    conditions.push([
      {
        name: "EnrollmentDate",
        condition: ">=",
        value: filters.enrollmentDate[0].toDate(),
      },
      {
        name: "EnrollmentDate",
        condition: "<=",
        value: filters.enrollmentDate[1].toDate(),
      },
    ]);
  }

  // Contract Status
  if (filters.contractstatus) {
    conditions.push([
      {
        name: "ContractStatus.label",
        condition: "==",
        value: filters.contractstatus,
      },
    ]);
  }

  // Visa Letter Status
  if (filters.visaletterstatus) {
    conditions.push([
      {
        name: "RotationVisaSection.Letter0.VisaLetterStatus.label",
        condition: "==",
        value: filters.visaletterstatus,
      },
    ]);
  }

  // Rotation Status
  if (filters.rotationstatus) {
    conditions.push([
      {
        name: "RotationStatus.label",
        condition: "==",
        value: filters.rotationstatus,
      },
    ]);
  }

  // Rotation Review
  if (filters.rotationreview) {
    conditions.push([
      {
        name: "RotationReview.label",
        condition: "==",
        value: filters.rotationreview,
      },
    ]);
  }

  // Location Code
  if (filters.locationcode) {
    conditions.push([
      {
        name: "LocationCode.label",
        condition: "==",
        value: filters.locationcode,
      },
    ]);
  }

  // Enrollment Admin In Touch
  if (filters.EnrollmentAdminInTouch) {
    conditions.push([
      {
        name: "EnrollmentAdminInTouch.label",
        condition: "==",
        value: filters.EnrollmentAdminInTouch,
      },
    ]);
  }

  // Physician Check Point
  if (filters.PhysicianCheckPoint) {
    conditions.push([
      {
        name: "PhysicianCheckPoint",
        condition: "==",
        value: filters.PhysicianCheckPoint,
      },
    ]);
  }

  // Student Check Point
  if (filters.StudentCheckPoint) {
    conditions.push([
      {
        name: "StudentCheckPoint",
        condition: "==",
        value: filters.StudentCheckPoint,
      },
    ]);
  }

 // setFiltersReady(true);
filtersToSave['filtertype']="listofallrotationstudents";
filtersToSave['id']="listofallrotationstudents";
  const ress=await handleUpdate(
    "SavedFilters",
    "listofallrotationstudents",
    filtersToSave
  );
console.log("ress---->",ress)
  console.log(
    "Rotation Filters Applied:",
    conditions
  );

  fetchUserData();
};
const clearFilter = (filterName) => {
  setFilters((prev) => ({
    ...prev,
    [filterName]: Array.isArray(prev[filterName]) ? [] : "",
  }));
};
const buildVisaLettersString = (rotation) => {
  const section = rotation?.RotationVisaSection || {};
  const parts = [];

  Object.entries(section).forEach(([letterKey, letterObj], idx) => {
    const label = letterObj?.RotationVisa?.label || "-";
    const type = letterObj?.VisaLetterType?.label || "-";
    const status = letterObj?.RotationVisaStatus?.label || "-";
    const letterStatus = letterObj?.VisaLetterStatus?.label || "-";

    parts.push(
      `Letter ${idx + 1}: ${label} | Type: ${type} | Status: ${status} | Letter: ${letterStatus}`
    );
  });

  return parts.join(" ; ");
};

const copyTableForExcel = async () => {
  if (!sortedData || !sortedData.length) {
    alert("No data available to copy.");
    return;
  }

  // 👉 Adjust headers to match your table columns order
  const header = [
    "Student ID",
    "Name",
    "Email",
    "Phone",
    "Rotation Start Date",
    "Enrollment Date",
    "Contract Status",
    "Contract Signed Date",
    "Visa Letter Status",
    "Location Code / Doctor",
    "Visa Letters",
    "Housing Code",
    "Rotation Status",
    "Rotation Review",
    "Physician CP",
    "Student CP",
  ];

  const lines = [header.join("\t")]; // tab-separated

  sortedData.forEach((row) => {
    const phone = `${row.phoneCode || ""}${row.phoneNumber || ""}`;

    const locationDoctor =
      (typeof LocationCodeDoctorsName[row.LocationCode] !== "undefined" &&
        DoctorsDetails?.[LocationCodeDoctorsName[row.LocationCode]]?.DoctorInfo
          ?.representingName) ||
      "";

    const visaLetters = buildVisaLettersString(row);

    const line = [
      row.StudentUniqueId ? `S${row.StudentUniqueId}` : "",
      row.displayName || "",
      row.email || "",
      String(phone),
      formatDateForExcel(row.StartDate),
      formatDateForExcel(row.EnrollmentDate),
      row.ContractStatus || "",
      formatDateForExcel(row.ContractSignedDate),
      row.VisaLetterStatus || "",
      `${locationDoctor ? `(${locationDoctor}) ` : ""}${row.LocationCode || ""}`,
      visaLetters,
      row.HousingCode || "",
      row.RotationStatus || "",
      row.RotationReview || "",
      row.PhysicianCheckPoint || "",
      row.StudentCheckPoint || "",
    ];

    lines.push(line.join("\t"));
  });

  const tsv = lines.join("\n");

  try {
    await navigator.clipboard.writeText(tsv);
    alert("Table data copied in Excel format (tab-separated). Just paste in Excel.");
  } catch (err) {
    console.error("Failed to copy table data: ", err);
    alert("Failed to copy table data. Check browser permissions.");
  }
};

const hideLoader = () => {
     let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden'); // Example manipulation
    }
  };
  return (
  <CenteredBox>

    {/* FILTER BAR + DATE PICKERS */}
    <Box>
     <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Filters
        </Typography>

       <Grid container spacing={2} sx={{ mb: 4 }}>

  {/* Filter Type */}
  <Grid item xs={12} md={6}>
   <InputLabel>Rotation Start Date</InputLabel>
  <RangePicker
    style={{ width: "100%" }}
    
    label="Rotation Start Date"
    value={filters.rotationStartDate}
    format={dateFormat}
    onChange={(dates) => {
      if (!dates) return;

      const start = dates[0]
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 1)
        .set("millisecond", 0);

      const end = dates[1]
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .set("millisecond", 999);
	 setFilters((prev) => ({
        ...prev,
        rotationStartDate: [start, end],
      }));
      setStartDate(start);
      setEndDate(end);
    }}
    allowClear={false}
  />
  {filters.rotationStartDate && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("rotationStartDate")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
<Grid item xs={12} md={6}>
   <InputLabel>Enrollment Date</InputLabel>
  <RangePicker
    style={{ width: "100%" }}
    name="enrollmentDate"
    label="Enrollment Date"
    value={filters.enrollmentDate}
    format={dateFormat}
    onChange={(dates) => {
      if (!dates) return;

      const start = dates[0]
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 1)
        .set("millisecond", 0);

      const end = dates[1]
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 59)
        .set("millisecond", 999);
		 setFilters((prev) => ({
        ...prev,
        enrollmentDate: [start, end],
      }));

    }}
    allowClear={false}
  />
   {filters.enrollmentDate && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("enrollmentDate")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
<Grid item xs={12} md={3}>
    <FormControl fullWidth>
      <InputLabel>Contract Status</InputLabel>
      <Select
        name="contractstatus"
        id="contractstatus"
        value={filters.contractstatus || ''}
        label="Contract Status"
        onChange={handleFilterChange}
      >
        {Object.entries(FilterContractStatusOption).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
      {filters.contractstatus && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("contractstatus")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
  </Grid>
  <Grid item xs={12} md={3}>
    <FormControl fullWidth>
      <InputLabel>Visa Letter Status</InputLabel>
      <Select
        name="visaletterstatus"
        id="visaletterstatus"
        value={filters.visaletterstatus || ''}
        label="Visa Letter Status"
        onChange={handleFilterChange}
      >
        {Object.entries(FilterVisaLetterStatusOption).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {filters.visaletterstatus && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("visaletterstatus")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
  </Grid>
   <Grid item xs={12} md={3}>
    <FormControl fullWidth>
      <InputLabel>Rotation Status</InputLabel>
      <Select
        name="rotationstatus"
        id="rotationstatus"
        value={filters.rotationstatus || ''}
        label="Rotation Status"
        onChange={handleFilterChange}
      >
        {Object.entries(FilterRotationStatusOption).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {filters.rotationstatus && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("rotationstatus")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
  </Grid>

   <Grid item xs={12} md={3}>
    <FormControl fullWidth>
      <InputLabel>Location Code</InputLabel>

        <TextField
              name="locationcode"
              fullWidth
              value={filters.locationcode || ''}
             onChange={handleFilterChange}
            />
    </FormControl>
    {filters.locationcode && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("locationcode")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
  </Grid>
   
  <Grid item xs={12} md={3}>
  <FormControl fullWidth>
    <InputLabel>Enrollment Admin In Touch</InputLabel>
    <Select
      name="EnrollmentAdminInTouch"
      value={filters.EnrollmentAdminInTouch || ""}
      label="Enrollment Admin In Touch"
      onChange={handleFilterChange}
    >
      {AdminOptionsList?.map((option) => (
        <MenuItem
          key={option.value || option}
          value={option.value || option}
        >
          {option.label || option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  {filters.EnrollmentAdminInTouch && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("EnrollmentAdminInTouch")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
 <Grid item xs={12} md={3}>
  <FormControl fullWidth>
    <InputLabel>Physican CP</InputLabel>
    <Select
      name="PhysicianCheckPoint"
      value={filters.PhysicianCheckPoint || ""}
      label="Physican CP"
      onChange={handleFilterChange}
    >
      	<MenuItem value="">-Select-</MenuItem>
    	<MenuItem value="Not sent">Not sent</MenuItem>
        <MenuItem value="Waiting on Student">Waiting on Student</MenuItem>
        <MenuItem value="Confirmed with Student">Confirmed with Student</MenuItem>
        <MenuItem value="Rescheduled">Rescheduled</MenuItem>
    </Select>
  </FormControl>
  {filters.PhysicianCheckPoint && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("PhysicianCheckPoint")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
<Grid item xs={12} md={3}>
  <FormControl fullWidth>
    <InputLabel>Student CP</InputLabel>
    <Select
      name="StudentCheckPoint"
      value={filters.StudentCheckPoint || ""}
      label="Student CP"
      onChange={handleFilterChange}
    >
      	<MenuItem value="">-Select-</MenuItem>
    	<MenuItem value="Not sent">Not sent</MenuItem>
        <MenuItem value="Waiting on Student">Waiting on Student</MenuItem>
        <MenuItem value="Confirmed with Student">Confirmed with Student</MenuItem>
        <MenuItem value="Rescheduled">Rescheduled</MenuItem>
    </Select>
  </FormControl>
  {filters.StudentCheckPoint && (
    <Button
      size="small"
      color="error"
      onClick={() => clearFilter("StudentCheckPoint")}
      sx={{ mt: 1 }}
    >
      Clear
    </Button>
  )}
</Grid>
 <Grid item xs={12}>
<Grid item xs={12} md={3}>
  <FormControl fullWidth>
<Button variant="contained" className="FilterButton" onClick={FilterData}>
          Apply Filters
        </Button>

</FormControl>
</Grid>
</Grid>
</Grid>
      </Paper>

    </Box>

    {/* TOTAL COUNT */}
    <CenteredBoxInfo>
      <div
        style={{
          width: "45%",
          margin: "0 auto",
          fontSize: "22px",
          fontWeight: "bolder",
        }}
      >
        Rotation Users Total = {sortedData.length}
      </div>

      {/* ⚡ VIRTUALIZED TABLE (react-window) */}
      <RotationTable
        sortedData={sortedData}
        DoctorsDetails={DoctorsDetails}
        LocationCodeDoctorsName={LocationCodeDoctorsName}
        CurrentData={CurrentData}
        HandleCheckPointChange={HandleCheckPointChange}
        sortConfig={sortConfig}
        requestSort={requestSort}
        containerHeight={700} // customize height
      />

      {/* COPY BUTTONS */}
      <div style={{ marginTop: "20px" }}>
      <Button
    variant="contained"
    color="secondary"
    onClick={copyTableForExcel}
    style={{ marginRight: "10px" }}
  >
    Copy Table for Excel
  </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={copyEmailsToClipboard}
          style={{ marginRight: "10px" }}
        >
          Copy Emails to Clipboard
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={copyEmailsNameToClipboard}
        >
          Copy Emails With Name
        </Button>
      </div>

      {/* SUCCESS/ERROR DIALOG */}
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Operation Status</DialogTitle>
        <DialogContent>
          <DialogContentText>{OperationMessage}</DialogContentText>
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
