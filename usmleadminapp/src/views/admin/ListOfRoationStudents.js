import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Select1 from 'react-select';
import DatePicker from 'react-datepicker';
import { DatePicker as AntdDatePicker } from 'antd';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';
import { useLoading } from '../../layout/LoadingContext';
import { useLocation } from 'react-router-dom';
import { Grid,Table, Typography,FormControl,InputLabel,Select,MenuItem,TextField, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, CircularProgress  } from '@mui/material';

import  '../../components/css/style.css';
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
let EmailList=[];
let fitlersSelected=[];
let FilterNameset="";
const IST_OFFSET_MINUTES = 330;
let CompareStartDate;
let innerStartDate;
let innerEndDate;
let innerDynamicField;
let FilterChangingOption={};
const PaginatedTable = (ActualUser, AuthUser ) => {

AuthUser=ActualUser.AuthUser;
ActualUser=ActualUser.ActualUser;
const { loadingAuth,setloadingAuth} = useState(null);
const { LoggedInuser,setLoggedInuser } = useState(ActualUser);
const { showLoading, hideLoading, API_KEY,DatabaseName,Timestamp,SelectWithComplexConditions,FetchDataFromCollection,SelectWithWhereOrAndFetchProfiles,fetchTotalRecordsCount,handleUpdate } = useLoading();
const location = useLocation();
let { objectSerialize, locationcodea } = location.state || {};
console.log("objectSerialize===>",objectSerialize)
console.log("locationcodea===>",locationcodea)
console.log("location===>",location)
const locationcode=locationcodea;
/*const { serializedObject } = useParams();
let objectSerialize = JSON.parse(decodeURIComponent(serializedObject));
const { locationcodearray } = useParams();
const locationcode = JSON.parse(decodeURIComponent(locationcodearray));*/


  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
  const [RotationData, setRotationData] = useState({});
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const pageSize = 1000; // Number of entries per page
  const mainCollectionName = 'RotationDoctors';
  const [CurrentViewData, setCurrentViewData] = useState({});
  const [filterField, setFilterField] = useState('Role');
  const [filterCondition, setFilterCondition] = useState('==');
  const [TotalAmountPaid, setTotalAmountPaid] = useState(0);
  const [idOptions, setIdOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [startDate, setStartDate] = useState(
  dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  const [allChecked, setAllChecked] = useState(false);
const [selectedRows, setSelectedRows] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => {
  loadFiltersfromdatabase("listofrotationstudents")
	loadData();
    //loadTotalRecords();
   	loadFilterOptions();
  },[]);
  const loadFiltersfromdatabase = async(filter) =>{
   const profileDataM = await FetchDataFromCollection("FiltersSaved", 10, "id", "==", filter, null);

  }
	const sumAmounts = (data) => {
  return data.reduce((total, item) => {
    return total + (parseFloat(item.Amount) || 0); // Ensure Amount is treated as a number
  }, 0);
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
 const handleChange = async (event,name) =>
  {
  	let value;
  	console.log("event---->",event)
  	console.log("name---->",name)
  	if(event==null)
  	{
  		setCurrentViewData((prevValues) => {
  		const newValues = { ...prevValues };
  		if (name in newValues)
  		{
    		delete newValues[name]; // Remove the property with the specified key
  		}

  		return newValues;
		});
		return;
  	}
  	else if (event.target)
  	{
  		value = event.target.value;
	}
	else if (event.$d)
	{
  		value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  		value = Timestamp.fromDate(new Date(value))
	}
	else if (event.label)
	{
  		value = event;
	}
	else
	{
  		value = event;  // Consider reviewing if `event.label` is the intended fallback
	}
	checkForChanges(name, value);
	setCurrentViewData((prevValues) => ({
  ...prevValues,
  [name]: value,
}));
console.log("CurrentViewData===>",CurrentViewData)
  }
  const copyEmailsToClipboard = async () => {
	const emailList = EmailList.map(rotation => rotation.email).join('\n');
	navigator.clipboard.writeText(emailList).then(() => {
      alert('Emails copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy emails: ', err);
    });
}
const handleAddDoctorPayment= async (event)=>{
		 const validationErrors = validate();
		 console.log("objectSerialize--->",objectSerialize)
		 console.log("CurrentViewData--->",CurrentViewData)
		 console.log("validationErrors--->",validationErrors)
    	setErrors(validationErrors);
    	if (Object.keys(validationErrors).length === 0)
    	{
    		showLoader()
    		for (const userId in selectedRows)
    		{
    			//selectedRows[userId]={};
    			for (const  codeSelected in selectedRows[userId])
    			{
    				selectedRows[userId][codeSelected]={"LocationCode":codeSelected,"PaymentDetails":CurrentViewData}
    				console.log("codeSelected---->",codeSelected);
    			}
  				if (selectedRows.hasOwnProperty(userId))
  				{
  					handleUpdate("UserServices",userId,{"RotationData":{"DoctorsPayment":selectedRows[userId]}}).then((result) =>
    	 			{

  					})

				}
    	 	/*showLoader();
    	 	const FullArray=AllPaymentData;
    	 	FullArray.push(CurrentViewData);
    	 	handleUpdate("RotationDoctors",did,{"DoctorInfo":{"Payments":FullArray}}).then((result) =>
    	 	{
    	 		hideLoader();
     		setOperationStatus( result.status)
     		setOperationMessage(result.message);
     		setOpen(true);
    	 	})*/
			}
					const DoctPayarray= await paymentObjectToArray(objectSerialize);


  					DoctPayarray.push({"List":selectedRows,"PaymentDetails":CurrentViewData});
  					const DoctPayObj=await convertPaymentArrayToObject(DoctPayarray);
  					handleUpdate("RotationDoctors",objectSerialize.id,{"DoctorInfo":{"Payments":DoctPayObj}}).then((result) =>
    	 			{

    	 				window.location.reload();
    	 				hideLoader()
    	 			})
		}
}

	const validate = () => {
    const errors = {};
  console.log("CurrentViewData--->",CurrentViewData)
   console.log("selectedRows--->",selectedRows)
  if(typeof CurrentViewData['Amount']==="undefined" || CurrentViewData['Amount']==="")
  {
  	errors.Amount="Please Enter Payment Amount.";
  }
  else if(CurrentViewData['Amount']!=='' && typeof CurrentViewData['Amount']!=="undefined" && isNaN(CurrentViewData['Amount']))
  {

  	errors.Amount="Please Enter Valid Amount Without Currency Symbol Etc.";
  }
  if(typeof CurrentViewData['PaymentDate']==="undefined" || typeof CurrentViewData['PaymentDate']!=="object")
  {
  	errors.PaymentDate="Please Select Date Of Payment.";
  }
  if(typeof CurrentViewData['ModeOfPayment']==="undefined" || typeof CurrentViewData['ModeOfPayment']!=="object")
  {
  	errors.ModeOfPayment="Please Select Mode Of Payment.";
  }
  if(Object.values(selectedRows).length === 0)
  {
  	errors.userSelection="Please Select Users.";
  }
   return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  // Toggle function for the date picker visibility
  const togglePicker = () => {
    setShowPicker(!showPicker);
  };
  const paymentObjectToArray = async (Objectfull) => {
  if (!Objectfull?.DoctorInfo?.Payments) {
    return []; // Return an empty array if Payments is null or undefined
  }
  const paymentArray = Object.entries(Objectfull.DoctorInfo.Payments).map(([key, value]) => {
    return { id: key, ...value };
  });
  return paymentArray;
};

// Function to convert payment array back to object with null/undefined check
function convertPaymentArrayToObject(paymentArray) {
  if (!Array.isArray(paymentArray) || paymentArray.length === 0) {
    return {}; // Return an empty object if paymentArray is null, undefined, or empty
  }
  const paymentObject = paymentArray.reduce((acc, item,index) => {

    acc["Payment"+index] = item;
    return acc;
  }, {});

  return paymentObject;
}
  const loadData = async (direction = 'whereor') => {
    setLoading(true);
    let result;
    EmailList=[];
console.log("direction---->",direction)
      innerStartDate=startDate;
    	innerEndDate=startDate;
    	let TempFiltervalue=filterField;
    	fitlersSelected = await FetchDataFromCollection("SavedFilters", 20, "filtertype", "==", "listrotationstudents", 0);
    	if(fitlersSelected.length)
		  {
		    setStartDate(dayjs(fitlersSelected[0].startDate.toDate()))
		    setEndDate(dayjs(fitlersSelected[0].endDate.toDate()))
		    TempFiltervalue=fitlersSelected[0].Cond
		    innerStartDate=fitlersSelected[0].startDate;
    	  innerEndDate=fitlersSelected[0].endDate;
    	  innerDynamicField=fitlersSelected[0].DynamicField;

		    setFilterField(TempFiltervalue)
		  }
    const DateTimestampStart=Timestamp.fromDate(innerStartDate.toDate());
    const DateTimestampEnd=Timestamp.fromDate(innerEndDate.toDate());
    /*const StartDateToSend = Timestamp.fromDate(startDate);
    const EndDateToSend = Timestamp.fromDate(new Date(endDate));
    let WhereOrObject=[{"name":filterField,"condition":">=","value":StartDateToSend},{"name":filterField,"condition":"<=","value":EndDateToSend}];*/
    //let WhereOrObject=[{"name":"RotationData.Rotations.Rotation0.LocationCode.value","condition":"in","value":locationcode},{"name":"RotationData.Rotations.Rotation1.LocationCode.value","condition":"in","value":locationcode},{"name":"RotationData.Rotations.Rotation2.LocationCode.value","condition":"in","value":locationcode}]
   	let WhereOrObject=[];
   	/*let conditionsArray = [
  [
    { name: "RotationData.Rotations.Rotation0.LocationCode.value", condition: "in", value: locationcode },
    { name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
    { name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd }
  ],
  [
    { name: "RotationData.Rotations.Rotation1.LocationCode.value", condition: "in", value: locationcode },
    { name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
    { name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd }
  ],
  [
    { name: "RotationData.Rotations.Rotation2.LocationCode.value", condition: "in", value: locationcode },
    { name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
    { name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd }
  ]
];*/
let conditionsArray = [];

for (let i = 0; i <= 5; i++) {
  for (const code of locationcode) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${i}.LocationCode.value`,
        condition: "==",
        value: code
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: "<=",
        value: DateTimestampEnd
      }
    ]);
  }
  WhereOrObject.push({"name":`RotationData.Rotations.Rotation${i}.LocationCode.value`,"condition":"in","value":locationcode})
}
   		if(direction === 'whereor')
    	{
    	  if(TempFiltervalue==="RotationStartDateConnected")
    	  {
    	    conditionsArray = [];
    	   /*conditionsArray = [
          [
            { name: "RotationData.Rotations.Rotation0.LocationCode.value", condition: "in", value: locationcode },
            { name: "RotationData.Rotations.Rotation0.StartDate", condition: ">=", value: DateTimestampStart },
            { name: "RotationData.Rotations.Rotation0.StartDate", condition: "<=", value: DateTimestampEnd },
            { name: "RotationData.Rotations.Rotation0.RotationStatus.value", condition: "==", value: "Connected with physician" }
          ],
          [
            { name: "RotationData.Rotations.Rotation1.LocationCode.value", condition: "in", value: locationcode },
            { name: "RotationData.Rotations.Rotation1.StartDate", condition: ">=", value: DateTimestampStart },
            { name: "RotationData.Rotations.Rotation1.StartDate", condition: "<=", value: DateTimestampEnd },
            { name: "RotationData.Rotations.Rotation1.RotationStatus.value", condition: "==", value: "Connected with physician" }
          ],
          [
            { name: "RotationData.Rotations.Rotation2.LocationCode.value", condition: "in", value: locationcode },
            { name: "RotationData.Rotations.Rotation2.StartDate", condition: ">=", value: DateTimestampStart },
            { name: "RotationData.Rotations.Rotation2.StartDate", condition: "<=", value: DateTimestampEnd },
            { name: "RotationData.Rotations.Rotation2.RotationStatus.value", condition: "==", value: "Connected with physician" }
          ]
        ];*/
        for (let i = 0; i <= 5; i++) {
  for (const code of locationcode) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${i}.LocationCode.value`,
        condition: "==",
        value: code
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: "<=",
        value: DateTimestampEnd
      },
      {
        name: `RotationData.Rotations.Rotation${i}.RotationStatus.value`,
        condition: "==",
        value: "Connected with physician"
      }
    ]);
  }
}
      }
      else if(TempFiltervalue==="RotationStartDateNotConnected")
      {
        conditionsArray = [];
         for (let i = 0; i <= 5; i++) {
  for (const code of locationcode) {
    conditionsArray.push([
      {
        name: `RotationData.Rotations.Rotation${i}.LocationCode.value`,
        condition: "==",
        value: code
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: ">=",
        value: DateTimestampStart
      },
      {
        name: `RotationData.Rotations.Rotation${i}.StartDate`,
        condition: "<=",
        value: DateTimestampEnd
      },
      {
        name: `RotationData.Rotations.Rotation${i}.RotationStatus.value`,
        condition: "!=",
        value: "Connected with physician"
      }
    ]);
  }
}
      }
    		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users");
    	}
    	else
    	{
    		result = await SelectWithWhereOrAndFetchProfiles("UserServices",WhereOrObject,"Users");

    	}
   		const doctorSelected = await FetchDataFromCollection("RotationDoctors", 10, "__name__", "==", objectSerialize.id, null);
   		if(doctorSelected.length>0)
      	{
      		objectSerialize=doctorSelected[0];
      		if(doctorSelected[0]?.DoctorInfo?.Payments?.length>0)
      		{
      			//setAllPaymentData(doctorSelected[0]?.DoctorInfo?.Payments);
      			let totalAmountPaid=sumAmounts(doctorSelected[0]?.DoctorInfo?.Payments);
      			setTotalAmountPaid(totalAmountPaid);
      		}
      	}

    	 const profileDataM = await FetchDataFromCollection("Rotations", 10, "location_code", "in", locationcode, null);
    	 let profileData = {};
    	 if(profileDataM.length>0)
    	 {



    profileDataM.forEach((profileDataD) => {
    profileData[profileDataD.location_code]=profileDataD

    });
    	 	setRotationData(profileData);
    	 }
    if (result.data.length < pageSize) {
      setIsLastPage(true);
    } else {
      setIsLastPage(false);
    }
    if (direction === 'next') {
    if (result.data.length > 0) {
      setData(result.data);
      }
    } else {
      if (result.data.length > 0) {
      setData(result.data);
      }
    }
    setLoading(false);
    hideLoading();
  };
  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    return formattedDate; // Return the formatted date as a string
  };
const loadTotalRecords = async () => {
    try {
      const count = await fetchTotalRecordsCount(mainCollectionName, "", "",LoggedInuser);
      setTotalRows(count);
    } catch (error) {
      console.error('Error fetching total record count: ', error);
    }
  };
  const handleNextPage = () => {
    if (!isLastPage) {
      setPage(page + 1);
      loadData('next');
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      loadData('previous');
    }
  };
const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)
    	if(value==="RotationStartDate")
    	{
    		togglePicker()
    	}
    	else if(value==="RotationStartDateConnected" || value=== "RotationStartDateNotConnected")
    	{
    		//togglePicker()
    		setShowPicker(true);
    	}
    }
    else if(name==="condition")
    {
    	setFilterCondition(value)

    }
    FilterNameset=name;
    //if(name=="id" || name=="condition")
   //setFilters({ ...filters, [name]: value });
  };





const loadFilterOptions = async () => {
    const idOptions = {
     /* "Role": "User Type",
      "representingEmail": "User Email",
      "DoctorInfo.representingName": "User Name",
    	"DoctorInfo.locationCodes": "Location Code",
    	*/
    	"RotationStartDate": "Rotation Start Date",
    	"RotationStartDateConnected": "Rotation Start Date (Connected Students)",
    	"RotationStartDateNotConnected": "Rotation Start Date (Not Connected Students)",
    };
    const nameOptions = {
      "==": "Equal To",
      "!=": "Not Equal To",
      ">=": "Contains",
      "Range": "Range",
    };

    //adminOptions

    setIdOptions(idOptions);
    setNameOptions(nameOptions);
  };
  const applyFilters = async () => {
  showLoading()
  if(startDate!==null && endDate!==null && (filterField==="RotationStartDate" || filterField==="RotationStartDateConnected" || filterField=== "RotationStartDateNotConnected"))
  {
    let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listrotationstudents","DynamicField":'',"filterName":FilterNameset,"direction":"whereor"}
    let resF=await handleUpdate("SavedFilters", "listrotationstudents", SavedFiltersData);
  	loadData("whereor");
  }
  else
  {
    let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listrotationstudents","DynamicField":'',"filterName":FilterNameset,"direction":"next"}
    let resF=await handleUpdate("SavedFilters", "listrotationstudents", SavedFiltersData);
  	loadData("next");
  }
  setData({});
  loadTotalRecords();
  };
const handleCheckboxChange = (e, userId, rotationCode,item) => {
  if (e.target.checked) {
    if (!item?.RotationData?.['DoctorsPayment']?.[rotationCode]) {
      if (typeof selectedRows[userId] === "undefined") {
        selectedRows[userId] = {};
      }
      selectedRows[userId][rotationCode] = rotationCode;
      setSelectedRows({ ...selectedRows });
    }
  } else {
  	if(selectedRows[userId])
  	{
  		delete selectedRows[userId][rotationCode];
    	setSelectedRows({ ...selectedRows });
  	}

  }
};

const handleSelectAll = (e) => {
  setAllChecked(e.target.checked);
  if (e.target.checked) {
    // Create a new object to hold the updated selected rows
    const updatedSelectedRows = { ...selectedRows }; // Keep existing selected rows

    data.forEach((item) => {
      const userId = item.profile.uid;

      // Initialize the userId if it doesn't already exist in updatedSelectedRows


      Object.entries(item.RotationData?.Rotations || {}).forEach(([key, value]) => {
        const rotationCode = value.LocationCode.value;
		if(locationcode.includes(rotationCode))
		{
			//item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value]
			if (!item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value])
			{
				if (!updatedSelectedRows[userId])
				{
        			updatedSelectedRows[userId] = {};
      			}
          		updatedSelectedRows[userId][rotationCode] = rotationCode;
        	}
		}
        // Only add to selectedRows if it is not in savedRows (already saved rows)

      });
    });

    setSelectedRows(updatedSelectedRows);
  } else {
    // Clear all selected rows, but keep the saved rows intact
    setSelectedRows({});
  }
};
  const totalPages = Math.ceil(totalRows / pageSize);

  if (loadingAuth) return <p>Loading...</p>;
  return (
    <Box>
            <Box sx={{ mb: 4, display: 'flex', gap: 4 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="id-filter-label">Select Filter</InputLabel>
          <Select
            labelId="id-filter-label"
            id="id-filter"
            name="id"
            value={filterField}
            label="Select Filter"
            onChange={handleFilterChange}
          >
            {/* Replace the following options with dynamic data as needed */}
            {Object.entries(idOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        {(filterField!=='RotationStartDate' && filterField!=='RotationStartDateNotConnected' && filterField!=='RotationStartDateConnected' ) && (
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="condition-filter-label">Condition</InputLabel>
          <Select
            labelId="condition-filter-label"
            id="condition-filter"
            name="condition"
            value={filterCondition}
            label="Condition"
            onChange={handleFilterChange}
          >
            {/* Replace the following options with dynamic data as needed */}
             {Object.entries(nameOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        )}
         {(filterField==='RotationStartDate' || filterField==='RotationStartDateNotConnected' || filterField==='RotationStartDateConnected' ) && (
         <div className="date-range-container">


      {1 && (
        <div className="date-range-picker">
          <DatePicker
        selected={startDate.toDate()}
        //onChange={date => setStartDate(date)}
        onChange={(date) => {
  const adjustedStart = dayjs(date).set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0);
  setStartDate(adjustedStart);
}}
        selectsStart
        startDate={startDate.toDate()}
        endDate={endDate.toDate()}
         showYearDropdown
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate.toDate()}
        //onChange={date => setEndDate(date)}
        onChange={(date) => {
  const adjustedEnd = dayjs(date).set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0);
  setEndDate(adjustedEnd);
}}
        selectsEnd
        startDate={startDate.toDate()}
        endDate={endDate.toDate()}
        minDate={startDate.toDate()}
         showYearDropdown
  showMonthDropdown
        placeholderText="End Date"
      />
        </div>
      )}

    </div>
  )
}
     {(filterField!=='RotationStartDate' && filterField!=='RotationStartDateNotConnected' && filterField!=='RotationStartDateConnected' ) && (
        <TextField label="Value" name="value" id="value" value={filterField} onChange={handleFilterChange} />
        )}
        <Button variant="contained" className="FilterButton" onClick={applyFilters}>Apply Filters</Button>
      </Box>
     <Grid container spacing={2} sx={{ p: 1 }}>
         <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        <Typography class="margin0auto" variant="h6" >Doctor Details</Typography>
         </Box>
    </Grid>
    <Grid container spacing={2} sx={{ p: 1 }}>
        <Grid item xs={6}>
            <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Name:</Typography>
                <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 ,overflowWrap:'anywhere'}}>{objectSerialize?.DoctorInfo?.representingName}</Typography>
            </Box>
        </Grid>
        <Grid item xs={6}>
            <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Email:</Typography>
                <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 ,overflowWrap:'anywhere'}}>{objectSerialize?.DoctorInfo?.representingEmail}</Typography>
            </Box>
        </Grid>
        <Grid item xs={6}>
            <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin Name:</Typography>
                <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 ,overflowWrap:'anywhere'}}>{objectSerialize?.DoctorInfo?.adminName}</Typography>
            </Box>
        </Grid>
        <Grid item xs={6}>
            <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Contact :</Typography>
                <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 ,overflowWrap:'anywhere'}}>{objectSerialize?.DoctorInfo?.contact}</Typography>
            </Box>
        </Grid>
        {Object.entries(RotationData).map(([key, value]) => (
  <React.Fragment key={key}>
    <Grid container spacing={2} sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
        <Typography className="margin0auto" style={{
                    padding: '3px 20px',
                    backgroundColor: '#4CAF50',
                    marginBottom: '3px',
                    marginTop: '18px',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    position: 'static',
                  }}>
          Location Code: {value.location_code}
        </Typography>
      </Box>
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
          >
            Student To Pay:
          </Typography>
          <Typography
            variant="body1"
            sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1, overflowWrap: 'anywhere' }}
          >
            ${value.StudentToBeCharged}
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={6}>
        <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
          >
            Physician To Be Paid:
          </Typography>
          <Typography
            variant="body1"
            sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1, overflowWrap: 'anywhere' }}
          >
            ${value.PhysicianToBePaid}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </React.Fragment>
))}
		<Grid item xs={12} style={{marginTop:'30px',fontWeight:'900',display:'flex',textAlign:'center'}} sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }} >
			Data Information
			</Box>
		</Grid>
		<Grid item xs={6} style={{backgroundColor:'rgb(175, 76, 171)',paddingBottom:'11px'}}>
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }} style={{fontWeight:'900',float:'right'}}>
			Start Date: {startDate.toDate().toLocaleDateString()}
			</Box>
		</Grid>
		<Grid item xs={6}  style={{backgroundColor:'rgb(175, 76, 171)'}}>
			<Box sx={{ display: 'flex', p: 0, borderRadius: 1 }} style={{fontWeight:'900',display:'flex',textAlign:'center'}}>
				End Date: {endDate.toDate().toLocaleDateString()}
			</Box>
		</Grid>
    </Grid>
      {/*<Box sx={{ mb: 4, display: 'flex', gap: 4 }}>
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
            {Object.entries(idOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="condition-filter-label">Condition</InputLabel>
          <Select
            labelId="condition-filter-label"
            id="condition-filter"
            name="condition"
            value={filterCondition}
            label="Condition"
            onChange={handleFilterChange}
          >
             {Object.entries(nameOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField label="Value" name="value" id="value" value={filters.value} onChange={handleFilterChange} />
        <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
      </Box>*/}
      <TableContainer component={Paper}>

        <Table>
          <TableHead>
            <TableRow>
            	<TableCell>
          <input
            type="checkbox"
            checked={allChecked}
            onChange={handleSelectAll}
          />
        </TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Student Email</TableCell>
              <TableCell>Rotation Start Date</TableCell>
              <TableCell>Rotation Status</TableCell>
              <TableCell>Doctors Payment</TableCell>
              <TableCell>View Details</TableCell>
            <TableCell>Fee Paid</TableCell>
            <TableCell>Coupon Code</TableCell>
            <TableCell>Calculated Discount</TableCell>
            </TableRow>
          </TableHead>
         <TableBody>
  {data.length > 0 ? (
  (() => {
    let GrandTotal = 0; // Initialize GrandTotal outside of JSX
    let PhysicianToBePaid = 0;
    let AlreadyPaidAmountToDoctor = 0;
    let AlreadyPaidAmountToDoctorObject = {};
    const rows = data.map((item) => {
      return Object.entries(item.RotationData?.Rotations || {}).map(([key, value]) => {
        let TotalFee = 0;
		let CouponCodes = "";
		let DisplayDateOfPayment=0;
		console.log("item====>",item)
		let displayValue=0;
        // Calculate TotalFee for the current rotation (handling multiple payment installments)
        TotalFee = Object.entries(value.RotationPayment || {}).reduce((sum, [keyin, payment]) => {
          if (payment.FeeType !== "application fee") {
          	if(payment.CouponCode!=="")
          	{
          		if(CouponCodes!=="")
          		{
          			CouponCodes +=","+payment.CouponCode
          		}
          		else
          		{
          			CouponCodes +=payment.CouponCode
          		}
          	}

            return sum + (parseFloat(payment.Amount) || 0); // Ensure Amount is treated as a number
          }
          return sum;
        }, 0);

        // Add current rotation's TotalFee to GrandTotal


        // Calculate the difference between StudentToBeCharged and TotalFee
         if (locationcode.includes(value.LocationCode.value))
         {
         	GrandTotal += TotalFee;
        const studentToBeCharged = RotationData?.[value.LocationCode.label]?.StudentToBeCharged;
        const PhyToBePaid = RotationData?.[value.LocationCode.label]?.PhysicianToBePaid;
        if(item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value])
        {
        	if(typeof AlreadyPaidAmountToDoctorObject[value.LocationCode.value]==="undefined")
        	{
        		AlreadyPaidAmountToDoctorObject[value.LocationCode.value]={};
        	}
        	if(typeof AlreadyPaidAmountToDoctorObject[value.LocationCode.value][item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value]?.['PaymentDetails']?.['PaymentDate']?.['seconds']]==="undefined")
        	{
        	  DisplayDateOfPayment=1;
        		AlreadyPaidAmountToDoctorObject[value.LocationCode.value][item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value]?.['PaymentDetails']?.['PaymentDate']?.['seconds']]=item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value]?.['PaymentDetails']['Amount'];
        		AlreadyPaidAmountToDoctor = parseFloat(AlreadyPaidAmountToDoctor) + parseFloat(item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value]?.['PaymentDetails']['Amount']);
        	}
        }
         displayValue = studentToBeCharged
          ? (parseFloat(studentToBeCharged.toFixed(2)) - TotalFee).toFixed(2)
          : 0;
          displayValue=displayValue<0?0:TotalFee<=0?0:displayValue
          if(TotalFee>0)
			PhysicianToBePaid +=(PhyToBePaid - displayValue);
		}
        return locationcode.includes(value.LocationCode.value) ? (
          <TableRow key={key} style={{
    backgroundColor: item?.RotationData?.['DoctorsPayment']?.[value.LocationCode.value] ? '#fff0f8' : 'transparent',
  }}>
          	<TableCell>
  <input
    type="checkbox"
    checked={
      !!(
        (selectedRows[item?.profile?.uid?item?.profile?.uid:item?.uid] &&
          selectedRows[item?.profile?.uid?item?.profile?.uid:item?.uid][value?.LocationCode?.value]) ||
        (item?.RotationData?.['DoctorsPayment']?.[value?.LocationCode?.value] &&
          item?.RotationData?.['DoctorsPayment']?.[value?.LocationCode?.value])
      )
    }
    onChange={(e) => handleCheckboxChange(e, item?.profile?.uid?item?.profile?.uid:item?.uid, value.LocationCode.value,item)}
  />
</TableCell>
            <TableCell>S{item.profile?.StudentUniqueId}</TableCell>
            <TableCell>{item?.profile?.displayName}</TableCell>
            <TableCell> <a
        href={`/admin/userdetails/${item?.profile?.uid?item?.profile?.uid:item?.uid}`}
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
        key={key}
      >
        {item?.profile?.email}
      </a></TableCell>
            <TableCell>{formatDateString(value.StartDate.toDate())}</TableCell>
            <TableCell>{value?.RotationStatus?.label}</TableCell>
            <TableCell> {(typeof item?.RotationData?.DoctorsPayment?.[value.LocationCode.value] !== "undefined" && DisplayDateOfPayment) ? (
    <>
      {dayjs(item.RotationData.DoctorsPayment[value.LocationCode.value].PaymentDetails.PaymentDate.seconds * 1000).format("MM/DD/YYYY")}
      {" ($" + item.RotationData.DoctorsPayment[value.LocationCode.value].PaymentDetails.Amount + ")"}
    </>
  ) : typeof item?.RotationData?.DoctorsPayment?.[value.LocationCode.value] !== "undefined"? (<div style={{ textAlign: 'center' }}><div style={{ cursor: 'pointer', fontSize: '24px' }}>👆 </div><p style={{ cursor: 'pointer' }}>Paid Above!</p></div>): null}</TableCell>
            <TableCell>
              <button
                style={{
                  padding: '3px 20px',
                  backgroundColor: '#4CAF50',
                  marginBottom: '3px',
                  marginRight: '3px',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  display: 'inline-block',
                  fontWeight: 'bold',
                }}
              >
                {value.LocationCode.value}
              </button>
            </TableCell>
            <TableCell>{TotalFee.toFixed(2)}</TableCell>
            <TableCell>{CouponCodes}</TableCell>
            <TableCell>{displayValue < 0 ? 0 : displayValue}</TableCell>
          </TableRow>
        ) : null;
      });
    });

    return (
      <>
        {rows}
        <TableRow>
  {/* Owe To Physician
  <TableCell colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    Owe To Physician: ${PhysicianToBePaid}
  </TableCell>
*/}
  {/* Already Paid To Physician */}
  <TableCell colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
  <a
        href="javascript:void(0)"
        rel="noreferrer"
        style={{
          padding: '2px 20px',
          backgroundColor: '#133337',
          marginBottom: '3px',
          marginRight: '3px',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block',
          fontWeight: 'bold',
        }}

      >
        Already Paid To Physician: ${AlreadyPaidAmountToDoctor}
      </a>

  </TableCell>

  {/* Conditional rendering based on the difference */}
  <TableCell colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    {PhysicianToBePaid - AlreadyPaidAmountToDoctor < 0
      ? `Advance Amount Paid: $${(AlreadyPaidAmountToDoctor - PhysicianToBePaid).toFixed(2)}`
      : `Net Amount to be Paid: $${(PhysicianToBePaid - AlreadyPaidAmountToDoctor).toFixed(2)}`}
  </TableCell>

  {/* Grand Total */}
  <TableCell colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    Grand Total: ${GrandTotal.toFixed(2)}
  </TableCell>
</TableRow>
      </>
    );
  })()
) : (
  <TableRow>
    <TableCell colSpan={6} style={{ textAlign: 'center', fontWeight: 'bold' }}>
      No data found
    </TableCell>
  </TableRow>
)}
</TableBody>
        </Table>
        <Grid container spacing={2} sx={{ p: 1 }}>
<Grid item xs={6}>
                <div class="InputLabel" >Mode Of Payment</div>
                <Select1
        value={CurrentViewData?.['ModeOfPayment']}
        onChange={(event) => handleChange(event,'ModeOfPayment' )}
        variant="outlined"
        placeholder="Mode Of Payment"
        label="Mode Of Payment"
        options={PaymentOptionsList}
        isSearchable
      	/>
      	 {errors.ModeOfPayment  && <span class="validationerror">{errors.ModeOfPayment }</span>}
       </Grid>
       <Grid item xs={6} >
                <div class="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }} style={{ border: '1px solid', margin: '1px' }}><AntdDatePicker
       defaultValue={CurrentViewData['PaymentDate']?dayjs(CurrentViewData['PaymentDate'].toDate().toLocaleString()):null}
       onChange={(event) => handleChange(event,'PaymentDate')}
        dateFormat="dd/mm/yyyy"
        scrollableYearDropdown
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"

      /></Typography>
                </Box>
                {errors.PaymentDate && <span class="validationerror">{errors.PaymentDate}</span>}
              </Grid>
              <Grid item xs={6}>
              <div class="InputLabel"></div>
                  <TextField
                    label="Amount"
                    variant="outlined"
                    fullWidth
                    defaultValue={CurrentViewData?.['Amount']}
                    required
                    onChange={(event) => handleChange(event,'Amount' )}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Amount  && <span class="validationerror">{errors.Amount }</span>}
                </Grid>
                 <Grid item xs={6}>
          <TextField
  label="Notes"
  multiline
  rows={4}
  variant="outlined"
  fullWidth
  value={CurrentViewData?.['Notes']}
   onChange={(event) => handleChange(event,'Notes' )}
  sx={{ my: 2 }}
/>
</Grid>
<Grid item xs={12} style={{ textAlign: 'center', fontWeight: 'bold' }}>
{errors.userSelection  && <span class="validationerror">{errors.userSelection }</span>}
 </Grid>
         </Grid>



          <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddDoctorPayment}
              disabled={!isFormChanged}
            >
              Add
            </Button>
            </Grid>

      </TableContainer>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={handlePreviousPage} disabled={page === 1} variant="contained">Previous</Button>
        <Button onClick={handleNextPage} disabled={isLastPage} variant="contained">Next</Button>
      </Box>
     <Box sx={{ mt: 2, textAlign: 'center' }}>
        <p>Page: {page} of {totalPages}</p>
      </Box>
    </Box>
  );
};

export default PaginatedTable;


