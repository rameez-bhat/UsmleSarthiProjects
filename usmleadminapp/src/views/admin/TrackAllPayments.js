import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { set } from 'date-fns';
//const admin = require('firebase-admin');
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';

 const dateFormat = "MM/DD/YYYY";
let EmailList=[];
let fitlersSelected=[];
let innerStartDate;
let innerEndDate;
const UserDetails = () => {
  	const { did } = useParams();
	const [OperationMessage, setOperationMessage] = useState('');
	const { showLoading, hideLoading, API_KEY,DatabaseName,SelectWithComplexConditions,Timestamp,FetchDataFromCollection,handleUpdate } = useLoading();
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'RotationFeeDate', name: '' });
	const [FiltersType, setFiltersType] = useState(filters.id);
const [startDate, setStartDate] = useState(
  dayjs().subtract(10, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  	const [startDateView, setStartDateView] = useState(dayjs().subtract(10, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0));
  	const [endDateView, setEndDateView] = useState( dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0));
  	const [conditionType, setconditionType] = useState('');
  	const [filterField, setFilterField] = useState(filters.id);
  	const [idOptions, setIdOptions] = useState([]);
  	const [sortConfig, setSortConfig] = useState({ key: 'AdminInTouch', direction: 'ascending' });
 const getRelevantPayment = (payments) => {
    const priorityOrder = [
      "rotation full payment",
      "rotation balance payment",
      "rotation fee installment",
      "application fee",
    ];

    for (const type of priorityOrder) {
      const payment = payments.find((p) => p?.FeeType === type);
      if (payment) return payment;
    }
    return payments[0]; // Fallback to the first payment if no match
  };
	const sortedData = useMemo(() => {
  // Flatten and filter payment data
  const sortableItems = AllPaymentData.flatMap(user => {
    return Object.keys(user.RotationData.Rotations).flatMap(rotationKey => {
      const rotation = user.RotationData.Rotations[rotationKey];
      const paymentKeys = Object.keys(rotation.RotationPayment || {});
      if(filterField === "RotationStartDate")
      {
       // if()
          EmailList.push({email:user?.profile?.email});

          const payments = paymentKeys.map(
              (key) => rotation.RotationPayment[key]
            );
          const relevantPayment = getRelevantPayment(payments);

            if(typeof relevantPayment==="undefined")
            {

            }
         
            return {
            uid: user?.profile?.uid,
            StudentUniqueId: user?.profile?.StudentUniqueId,
            email: user?.profile?.email,
            displayName: user?.profile?.displayName,
            AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
            FeeType: relevantPayment?.FeeType ? relevantPayment?.FeeType : "N/a",
            AmountPaid: relevantPayment?.Amount ? relevantPayment?.Amount : 'N/a',
            RotationStartDate: rotation.StartDate?rotation.StartDate:null,
            PaymentDate: relevantPayment?.PaymentDate, // Convert Firestore timestamp to JS Date
            RotationStatus: rotation?.RotationStatus?.label,
            RefundData: rotation.RefundData,
            LocationCode: rotation.LocationCode.label,
            ContractStatus: rotation?.ContractStatus?.value,
            // Add other necessary fields here
          };
      }
      else
      {
      return paymentKeys
        .map(paymentKey => {
          const payment = rotation.RotationPayment[paymentKey];
          // Convert startDate and endDate to seconds for comparison
          const startSeconds = startDate.toDate().getTime() / 1000; // Convert milliseconds to seconds
          const endSeconds = endDate.toDate().getTime() / 1000; // Convert milliseconds to seconds

          // Determine if the payment meets the filter criteria
          const isConsidered =
            (filterField === "ApplicationFeeDate" &&
              payment?.FeeType === "application fee" &&
              payment.PaymentDate?.seconds >= startSeconds &&
              payment.PaymentDate?.seconds < endSeconds) || (filterField === "RotationStartDate" &&
              rotation.StartDate?.seconds >= startSeconds &&
              rotation.StartDate?.seconds < endSeconds) ||
            (filterField === "RotationFeeDate" &&
              (payment?.FeeType === "rotation full payment" || payment?.FeeType === "rotation fee installment") &&
              payment.PaymentDate?.seconds >= startSeconds &&
              payment.PaymentDate?.seconds < endSeconds) || (filterField === "RotationInstallementDate" &&
              (payment?.FeeType === "rotation fee installment" ) &&
              payment.PaymentDate?.seconds >= startSeconds &&
              payment.PaymentDate?.seconds < endSeconds)  || (filterField === "AllRotationPaymentsBetween"  &&
              payment.PaymentDate?.seconds >= startSeconds &&
              payment.PaymentDate?.seconds < endSeconds);

          // Exclude items that don't match the filter
          if (!isConsidered) return null;

          // Return the data object for matching payments
          EmailList.push({email:user?.profile?.email});
          return {
            uid: user?.profile?.uid,
            StudentUniqueId: user?.profile?.StudentUniqueId,
            email: user?.profile?.email,
            displayName: user?.profile?.displayName,
            AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
            FeeType: payment?.FeeType,
            AmountPaid: payment?.Amount,
            RotationStartDate: rotation.StartDate,
            PaymentDate: payment.PaymentDate, // Convert Firestore timestamp to JS Date
            RotationStatus: rotation?.RotationStatus?.label,
            RefundData: rotation.RefundData,
            LocationCode: rotation.LocationCode.label,
            ContractStatus: rotation?.ContractStatus?.value,
            // Add other necessary fields here
          };
        })
        .filter(Boolean); // Remove null values
      }
    });
  });

  // Perform sorting based on the sortConfig
  if (sortConfig?.key) {
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  return sortableItems;
}, [AllPaymentData, sortConfig, filterField, startDate, endDate]);


  // Request sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  useEffect(() => {
    //return () => {
    fetchUserData();
 // };

  }, []);
  useEffect(() => {
  }, [did]);


  const loadFilterOptions = async () => {
    const idOptions = {
    	"ApplicationFeeDate": "Application Fee Date",
    	"RotationFeeDate": "Rotation Fee Date",
    	"RotationInstallementDate": "Rotation Installement Date",
    	"RefundRequestDate": "Refund Requested Date",
    	"RefundDate": "Refund Date",
    	"RotationStartDate": "Rotation Start Date",
    	"RotationEnrollmentDate": "Enrollment Date",
    	"AllRotationPaymentsBetween": "All Rotation Payments Between"
    };


    setIdOptions(idOptions);
  };
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
    	else
    	{
    	  console.log("filterField---->",filterField)
    	  let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"trackallpayments","DynamicField":''}
      let resF=await handleUpdate("SavedFilters", "trackallpayments", SavedFiltersData);
    		showLoader()
    		
    		fetchUserData(filterField)
    	}

  };
   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log("filterField---->",filterField)
    if(name==="id")
    {
    	setFilterField(value)

    }
    //if(name=="id" || name=="condition")
   setFilters({ ...filters, [name]: value });
  };
const copyEmailsToClipboard = async () => {
	const emailList = EmailList.map(rotation => rotation.email).join('\n');
	navigator.clipboard.writeText(emailList).then(() => {
      alert('Emails copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy emails: ', err);
    });
}
  const fetchUserData = async (Cond="RotationFeeDate") => {
    try
    {

    	EmailList=[];
    	let result;
    	showLoading();
    	innerStartDate=startDate;
    	innerEndDate=startDate;
    	let TempFiltervalue=filterField;
      fitlersSelected = await FetchDataFromCollection("SavedFilters", 20, "filtertype", "==", "trackallpayments", 0);
    	if(fitlersSelected.length)
		  {
		    setStartDate(dayjs(fitlersSelected[0].startDate.toDate()))
		    setEndDate(dayjs(fitlersSelected[0].endDate.toDate()))
		    Cond=fitlersSelected[0].Cond
		    innerStartDate=fitlersSelected[0].startDate;
    	  innerEndDate=fitlersSelected[0].endDate;
    	  setFilters({id: Cond, name: ''});
		    setFilterField(TempFiltervalue)
		  }
    	//const DateTimestampStart=Timestamp.fromDate(startDate.toDate());
    	//const DateTimestampEnd=Timestamp.fromDate(endDate.toDate());
    	const DateTimestampStart=Timestamp.fromDate(innerStartDate.toDate());
      const DateTimestampEnd=Timestamp.fromDate(innerEndDate.toDate());
    	const date = new Date(DateTimestampStart.seconds * 1000);

// Format the date as a readable string
const readableDate = date.toLocaleString();

console.log("readableDate====>",readableDate);
		setStartDateView(startDate)
		setEndDateView(endDate)
    	loadFilterOptions();
    	let conditionsArray=[];
    	let feeTypeArray;
    	setFiltersType(filters.id)
    	let OrderColumn="";
    	let orderDirection=""
    	//setFilterField(filters.id)
      console.log("Cond---->",Cond)
      const MAX_ROTATIONS = 6;   // Rotation0, Rotation1, Rotation2
const MAX_PAYMENTS = 4; 
    	if(Cond==="RotationFeeDate")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);

   // Payment0 → Payment3

for (let r = 0; r < MAX_ROTATIONS; r++) {
  for (let p = 0; p < MAX_PAYMENTS; p++) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.FeeType`,
        condition: "in",
        value: feeTypeArray
      },
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: "<=",
        value: DateTimestampEnd
      }
    ]);
  }
}
    	}
    	else if(Cond==="AllRotationPaymentsBetween")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);
    		for (let r = 0; r < MAX_ROTATIONS; r++) {
  for (let p = 0; p < MAX_PAYMENTS; p++) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: "<=",
        value: DateTimestampEnd
      }
    ]);
  }
}
    		/*conditionsArray =
    		[
  				[

    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation1.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment0.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment1.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment1.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment2.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment2.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment3.PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "RotationData.Rotations.Rotation2.RotationPayment.Payment3.PaymentDate", condition: "<=", value: DateTimestampEnd }
  				],
			];*/
    	}
    	else if(Cond==="RotationInstallementDate")
    	{

    		feeTypeArray=["rotation fee installment"]
    		setconditionType(feeTypeArray);
    		for (let r = 0; r < MAX_ROTATIONS; r++) {
  for (let p = 0; p < MAX_PAYMENTS; p++) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.FeeType`,
        condition: "in",
        value: feeTypeArray
      },
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
        condition: "<=",
        value: DateTimestampEnd
      }
    ]);
  }
}
    		/*conditionsArray =
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
			];*/
    	}
    	else if(Cond==="ApplicationFeeDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		for (let r = 0; r < MAX_ROTATIONS; r++) 
    		{
          for (let p = 0; p < MAX_PAYMENTS; p++) 
          {
            conditionsArray.push([
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.FeeType`,
                condition: "in",
                value: feeTypeArray
            },
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
                condition: ">=",
                value: DateTimestampStart
            },
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.PaymentDate`,
                condition: "<=",
                value: DateTimestampEnd
            }
          ]);
        }
      }
    		/*conditionsArray =
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
			];*/
    	}
    	else if(Cond==="RotationStartDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		for (let r = 0; r < MAX_ROTATIONS; r++) 
    		{
          for (let p = 0; p < MAX_PAYMENTS; p++) 
          {
            conditionsArray.push([
            {
                name: `RotationData.Rotations.Rotation${r}.StartDate`,
                condition: ">=",
                value: DateTimestampStart
            },
            {
                name: `RotationData.Rotations.Rotation${r}.StartDate`,
                condition: "<=",
                value: DateTimestampEnd
            }
          ]);
        }
      }

    	}
    	else if(Cond==="RotationEnrollmentDate")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		for (let r = 0; r < MAX_ROTATIONS; r++) 
    		{
          for (let p = 0; p < MAX_PAYMENTS; p++) 
          {
            conditionsArray.push([
            {
                name: `RotationData.Rotations.Rotation${r}.EnrollmentDate`,
                condition: ">=",
                value: DateTimestampStart
            },
            {
                name: `RotationData.Rotations.Rotation${r}.EnrollmentDate`,
                condition: "<=",
                value: DateTimestampEnd
            }
          ]);
        }
      }
    	}
    	else if(Cond==="RefundRequestDate")
    	{
    	  	for (let r = 0; r < MAX_ROTATIONS; r++) 
    		{
          for (let p = 0; p < MAX_PAYMENTS; p++) 
          {
            conditionsArray.push([
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.RefundData.RefundRequestDate`,
                condition: ">=",
                value: DateTimestampStart
            },
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.RefundData.RefundRequestDate`,
                condition: "<=",
                value: DateTimestampEnd
            }
          ]);
        }
      }
    	}
    	else if(Cond==="RefundDate")
    	{
    	  	for (let r = 0; r < MAX_ROTATIONS; r++) 
    		{
          for (let p = 0; p < MAX_PAYMENTS; p++) 
          {
            conditionsArray.push([
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.RefundData.RefundRequestDate`,
                condition: ">=",
                value: DateTimestampStart
            },
            {
                name: `RotationData.Rotations.Rotation${r}.RotationPayment.Payment${p}.RefundData.RefundRequestDate`,
                condition: "<=",
                value: DateTimestampEnd
            }
          ]);
        }
      }
    	}
    	console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users",OrderColumn,orderDirection);
		console.log("result---->",result)
		hideLoader()
   		if(result.status==="success")
   		{
   			setAllPaymentData(result.data)

   		}
    }
    catch (error)
    {
      console.error("Error fetching user data:", error);
    }
    hideLoading()
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
  const adjustedStart = dayjs(date).set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0);
  setStartDate(adjustedStart);
}}
        selectsStart
        startDate={startDate}
        endDate={endDate}
         showYearDropdown
          format={dateFormat}
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate}
        //onChange={date => setEndDate(date)}
       onChange={(date) => {
  const adjustedEnd = dayjs(date).set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0);
  setEndDate(adjustedEnd);
}}
        selectsEnd
        value={endDate}
        format={dateFormat}
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
         showYearDropdown
  showMonthDropdown
        placeholderText="End Date"
      />
        </div>

    </div>

        <Button variant="contained" className="FilterButton" onClick={applyFilters}>Apply Filters</Button>
      </Box>
      </Box>
      <CenteredBoxInfo>
      <div style={{
                  width: '45%',
                  margin: '0 auto',
				fontSize: '22px',
				fontWeight: 'bolder'
                }}>Payments Received From Users</div>

 	 <TableContainer component={Paper}>
      <Table>
        <TableHead>



            <TableRow>
            <TableCell onClick={() => requestSort('StudentUniqueId')}>
              Student ID {sortConfig.key === 'StudentUniqueId' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('email')}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('displayName')}>
              Name {sortConfig.key === 'displayName' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            {FiltersType === "ApplicationFeeDate" || FiltersType === "RotationFeeDate" || FiltersType === "RotationStartDate"  || FiltersType === "RotationEnrollmentDate" || FiltersType === "RotationInstallementDate" || FiltersType === "AllRotationPaymentsBetween" ? (
              <>
                <TableCell onClick={() => requestSort('FeeType')}>
                  Payment Type {sortConfig.key === 'FeeType' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('PaymentDate')}>
                  Payment Date {sortConfig.key === 'PaymentDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('RotationStartDate')}>
                  Rotation Start Date {sortConfig.key === 'RotationStartDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('LocationCode')}>
                  Location Code {sortConfig.key === 'LocationCode' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('ContractStatus')}>
                  Contract Status {sortConfig.key === 'ContractStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('RotationStatus')}>
                  Rotation Status {sortConfig.key === 'RotationStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('AmountPaid')}>
                  Amount {sortConfig.key === 'AmountPaid' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>

              </>
            ) : (
              <>
                <TableCell onClick={() => requestSort('RefundData.RefundAmount')}>
                  Refund Amount {sortConfig.key === 'RefundData.RefundAmount' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('RefundData.RefundType.label')}>
                  Refund Type {sortConfig.key === 'RefundData.RefundType.label' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('RefundData.RefundRequestDate')}>
                  Dated {sortConfig.key === 'RefundData.RefundRequestDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
              return (
                <TableRow key={index}>
                <TableCell>
                      S{rotation.StudentUniqueId}
                      </TableCell>
                  <TableCell>
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
                  <TableCell>{rotation.displayName}</TableCell>
                  {FiltersType === "ApplicationFeeDate" || FiltersType === "RotationFeeDate" || FiltersType === "RotationStartDate"  || FiltersType === "RotationEnrollmentDate" || FiltersType === "RotationInstallementDate"  || FiltersType ==="AllRotationPaymentsBetween" ? (
                    <>
                      <TableCell>{rotation.FeeType}</TableCell>
                      <TableCell>{rotation?.PaymentDate?.seconds ? dayjs(new Date(rotation.PaymentDate.seconds * 1000)).format(dateFormat): ''}</TableCell>
                       <TableCell>{rotation?.RotationStartDate?.seconds ?dayjs(new Date(rotation.RotationStartDate.seconds * 1000)).format(dateFormat) : ''}</TableCell>
                      <TableCell>{rotation?.LocationCode}</TableCell>
                      <TableCell>{rotation?.ContractStatus}</TableCell>
                      <TableCell>{rotation?.RotationStatus ?? ''}</TableCell>
                    <TableCell>{rotation?.AmountPaid}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>${rotation.RefundData?.RefundAmount || 'N/A'}</TableCell>
                      <TableCell>{rotation.RefundData?.RefundType?.label || 'N/A'}</TableCell>
                      <TableCell>{rotation.RefundData?.RefundRequestDate ? dayjs(new Date(rotation.RefundData.RefundRequestDate.seconds * 1000)).format(dateFormat) : null}</TableCell>
                    </>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
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
