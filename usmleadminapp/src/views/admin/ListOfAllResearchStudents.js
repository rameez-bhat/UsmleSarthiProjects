import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

let fitlersSelected=[];
let FilterNameset="";
const IST_OFFSET_MINUTES = 330; 
let CompareStartDate;
let innerStartDate;
let innerEndDate;
let innerDynamicField;
let FilterChangingOption={};
const UserDetails = () => {
  	const { did } = useParams();
  	const { showLoading, hideLoading,handleUpdate,FetchDataFromCollection, API_KEY,DatabaseName,SelectWithComplexConditions,Timestamp } = useLoading();
	const [OperationMessage, setOperationMessage] = useState('');
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'ResearchStartDate', name: '' });
	const [FiltersType, setFiltersType] = useState(filters.id);
		const [startDate, setStartDate] = useState(
  dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  	const [startDateView, setStartDateView] = useState(dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0));
  	const [endDateView, setEndDateView] = useState(dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0));
  	const [conditionType, setconditionType] = useState('');
  	const [filterField, setFilterField] = useState(filters.id);
  	const [idOptions, setIdOptions] = useState([]);
  	const [DynamicField, setDynamicField] = useState(null);
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
  const sortableItems = AllPaymentData.flatMap(user => {
    return Object.keys(user.Research).flatMap(rotationKey => {
      const rotation = user.Research[rotationKey];


       const StartDateR=new Date(rotation.StartDate.seconds * 1000);
       const EnrollmentDateR=new Date(rotation.EnrollmentDate.seconds * 1000);
      if (filters.id === "ResearchStartDate" && !(StartDateR > startDateView && StartDateR <= endDateView)) {
        return [];
      }
      if (filters.id === "ResearchEnrollmentDate" && !(EnrollmentDateR > startDateView && EnrollmentDateR <= endDateView)) {
        return [];
      }
      //if(value==="ResearchStatus" || value==="CourseName")
      if (filters.id === "CourseName" && (DynamicField !== rotation.CourseName) ) {
        return [];
      }
      if (filters.id === "CourseName"  && !(StartDateR > startDateView && StartDateR <= endDateView)) {
        return [];
      }

      // Map payments with necessary fields
		return {
          uid: user?.profile?.uid,
          StudentUniqueId: user?.profile?.StudentUniqueId,
          email: user?.profile?.email,
          displayName: user?.profile?.displayName,
          AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
          StartDate:rotation.StartDate,
          EnrollmentDate:rotation.EnrollmentDate,
          ResearchStatus:rotation.ResearchStatus,
          CourseName:rotation.CourseName
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
  }, [did]);


  const loadFilterOptions = async () => {
    const idOptions = {
    	"ResearchStartDate": "Research Start Date",
    	"ResearchEnrollmentDate": "Enrollment Date",
    	"ResearchStatus": "Research Status",
    	"CourseName": "Course Name",
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
    	else if(filterField==="ResearchStatus" || filterField==="CourseName")
    	{
    		if(DynamicField===null)
    		{
    			setOperationMessage("Please Select "+filters.id+" Options" );
    			setOpen(true);
    		}
    		else
    		{
    			showLoader()
    			let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallresearchstudents","DynamicField":DynamicField,"filterName":FilterNameset}
    	    let resF= await handleUpdate("SavedFilters", "listofallresearchstudents", SavedFiltersData)
    			fetchUserData(filterField)
    		}
    	}
    	else
    	{
    		showLoader()
    		let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallresearchstudents","DynamicField":'',"filterName":FilterNameset}
    	  let resF=await handleUpdate("SavedFilters", "listofallresearchstudents", SavedFiltersData);
    		fetchUserData(filterField)
    	}

  };
   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)

    }
    	console.log("value====>",value)
    	console.log("name====>",name)
     if(value==="ResearchStatus" || value==="CourseName")
    {
    	FilterChangingOption = value === "CourseName"
  ? {"IRC Course":"IRC Course","C2P Course":"C2P Course","RAR Course":"RAR Course","CIBNP":"CIBNP"}

  : {"Completed":"Completed","Published":"Published","Under Peer Review":"Under Peer Review","Not Completed":"Not Completed","Presented":"Presented"}
    }
    //if(name=="id" || name=="condition")
    console.log("FilterChangingOption====>",FilterChangingOption)
     FilterNameset=name;
   setFilters({ ...filters, [name]: value });
  };
    const handleDynamicChange = (e)=>
  {
  	const { name, value } = e.target;
  	setDynamicField(value)

  };

  const fetchUserData = async (Cond="ResearchStartDate") => {
    try
    {
    	let result;
    	showLoading();
    	innerStartDate=startDate;
    	innerEndDate=startDate;
    	innerDynamicField=DynamicField;
    	fitlersSelected = await FetchDataFromCollection("SavedFilters", 20, "filtertype", "==", "listofallresearchstudents", 0);
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
    	  if(Cond==="ResearchStatus" || Cond==="CourseName")
        {
    	      FilterChangingOption = Cond === "CourseName"
              ? {"IRC Course":"IRC Course","C2P Course":"C2P Course","RAR Course":"RAR Course","CIBNP":"CIBNP"}

            : {"Completed":"Completed","Published":"Published","Under Peer Review":"Under Peer Review","Not Completed":"Not Completed","Presented":"Presented"}
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
    	const DateTimestampStart=Timestamp.fromDate(innerStartDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(innerEndDate.toDate());
		setStartDateView(startDate)
		setEndDateView(endDate)
    	loadFilterOptions();
    	let conditionsArray;
    	let feeTypeArray;
    	setFiltersType(filters.id)
    	let OrderColumn=null;
    	let orderDirection=null;
    	//setFilterField(filters.id)
    	if(Cond==="ResearchStartDate")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		setconditionType(feeTypeArray);
    		conditionsArray =
    		[
  				[

    				{ name: "Research.Research0.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research0.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "Research.Research1.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research1.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "Research.Research2.StartDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research2.StartDate", condition: "<=", value: DateTimestampEnd }
  				],
			];
    	}
    	else if(Cond==="ResearchEnrollmentDate")
    	{
    		conditionsArray =
    		[
    			[
    				{ name: "Research.Research0.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research0.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "Research.Research1.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research1.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[

    				{ name: "Research.Research2.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research2.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  			];
    	}
    	else if(Cond==="ResearchStatus")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		OrderColumn="Research.Research0.ResearchStatus";
    	 	orderDirection="asc";
    		conditionsArray =
    		[
    			[
    				{ name: "Research.Research0.ResearchStatus", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research0.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research0.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "Research.Research1.ResearchStatus", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research1.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research1.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "Research.Research2.ResearchStatus", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research2.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research2.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  			];
    	}
    	else if(Cond==="CourseName")
    	{
    		feeTypeArray=["application fee"]
    		setconditionType(["application fee"]);
    		console.log("DynamicField---->",DynamicField)
    		OrderColumn="Research.Research0.CourseName";
    	 	orderDirection="asc";
    		conditionsArray =
    		[
    			[
    				{ name: "Research.Research0.CourseName", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research0.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research0.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "Research.Research1.CourseName", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research1.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research1.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  				[
    				{ name: "Research.Research2.CourseName", condition: "==", value: innerDynamicField },
    				{ name: "Research.Research2.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Research.Research2.EnrollmentDate", condition: "<=", value: DateTimestampEnd }
  				],
  			];
    	}

		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users",OrderColumn,orderDirection);
		console.log("result---->",result)
		hideLoader()
		hideLoading()
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
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
         showYearDropdown
  showMonthDropdown
        placeholderText="End Date"
      />
        </div>

    </div>
         {(filters.id!=="ResearchStatus" && filters.id!=="CourseName" ) ? (
         <>

         </>
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
                }}>Research Users Total={sortedData.length}</div>

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
            <TableCell onClick={() => requestSort('StartDate')}>
            	Start Date {sortConfig.key === 'StartDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        	</TableCell>
            <TableCell onClick={() => requestSort('EnrollmentDate')}>
                  Enrollement Date {sortConfig.key === 'EnrollmentDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('ResearchStatus')}>
                Contract Status {sortConfig.key === 'ResearchStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('CourseName')}>
                Course Name {sortConfig.key === 'CourseName' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
              return (
                <TableRow >
                <TableCell>S{rotation?.StudentUniqueId}</TableCell>
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
                  <TableCell>{rotation.StartDate?dayjs(new Date(rotation.StartDate.seconds * 1000)).format('MM-DD-YYYY'):null}</TableCell>
                   <TableCell>{rotation.EnrollmentDate?dayjs(new Date(rotation.EnrollmentDate.seconds * 1000)).format('MM-DD-YYYY'):null}</TableCell>
                  <TableCell>{rotation?.ResearchStatus}</TableCell>
                  <TableCell>{rotation?.CourseName}</TableCell>
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
