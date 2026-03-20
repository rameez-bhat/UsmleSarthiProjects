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

 const dateFormat = "MM/DD/YYYY";
 const dateFormatWithDate = "MM/DD/YYYY h:m:s";
let EmailList=[];
let  JoinFullArray=[
 // { collection: "UserCommonServiceNotes", leftField: "uid", rightField: "uid", conditions: [] },
  { collection: "Users", leftField: "uid", rightField: "uid", conditions: [] }
];
const UserDetails = () => {
  	const { did } = useParams();
	const [OperationMessage, setOperationMessage] = useState('');
	const { showLoading, hideLoading, API_KEY,fetchAllJoinData,SelectSuperComplexConditionsForView,DatabaseName,SelectWithComplexConditions,Timestamp } = useLoading();
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'NotesDate', name: '' });
	const [FiltersType, setFiltersType] = useState(filters.id);
	const [startDate, setStartDate] = useState(
  dayjs(new Date().setMonth(new Date().getMonth() - 11)).hour(0).minute(0).second(1)
);
  	const [endDate, setEndDate] = useState(
  dayjs().hour(23).minute(59).second(59)
);
  	const [startDateView, setStartDateView] = useState(dayjs(new Date(new Date().setMonth(new Date().getMonth() - 11))));
  	const [endDateView, setEndDateView] = useState(dayjs(new Date()));
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
    return user;
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
    	"NotesDate": "Date Between",
    };


    setIdOptions(idOptions);
  };
    const applyFilters = () => {

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
  const fetchUserData = async (Cond="NotesDate") => {
    try
    {

    	EmailList=[];
    	let result;
    	showLoading();

    	const DateTimestampStart=Timestamp.fromDate(startDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(endDate.toDate());
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
      console.log("Cond---->",DateTimestampStart.toDate())
       console.log("Cond---->",DateTimestampEnd.toDate())
    	if(Cond==="NotesDate")
    	{

    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		conditionsArray =
    		[
  				[
    				{ name:'NotesDate',condition:">=",value:DateTimestampStart },
    				{ name:'NotesDate',condition:"<=",value:DateTimestampEnd },
    				{ name:'NoteRegarding',condition:"==",value:"Rotation" },
    				{ name:'AddedBy.UserType',condition:"==",value:"Admin" }
  				],
  			];
    		setconditionType(feeTypeArray);
    		//JoinFullArray[0].conditions.push({name:'NotesDate',condition:">=",value:DateTimestampStart});
    		//JoinFullArray[0].conditions.push({name:'NotesDate',condition:"<=",value:DateTimestampEnd});
    		//JoinFullArray[0].conditions.push({name:'NoteRegarding',condition:"==",value:"Rotation"});
    		
    	}
    	console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("UserCommonServiceNotesRecent",conditionsArray,"","NotesDate","desc");
		//result =await SelectSuperComplexConditionsForView("UserCommonServiceNotes",conditionsArray,JoinFullArray,"NotesDate","desc",null,null);
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
        onChange={date => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
         showYearDropdown
          format={dateFormatWithDate}
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate}
        onChange={date => setEndDate(date)}
        selectsEnd
        value={endDate}
        format={dateFormatWithDate}
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
                }}>Recent Answered Question Of Rotation</div>

 	 <TableContainer component={Paper}>
      <Table>
        <TableHead>



            <TableRow>
            <TableCell onClick={() => requestSort('email')}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('AddedBy.displayName')}>
                  Added By {sortConfig.key === 'AddedBy.displayName' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('NotesDate')}>
              Name {sortConfig.key === 'NotesDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort('Notes')}>
              Question {sortConfig.key === 'Notes' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
			
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
            console.log("rotation---->",rotation)
              return (
                <TableRow key={index}>
                  <TableCell>
                    <a
                      href={`/admin/reply/${rotation.uid}`}
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
                  <TableCell>{rotation?.AddedBy?.displayName}</TableCell>
                <TableCell>{rotation?.NotesDate?.seconds ? dayjs(new Date(rotation.NotesDate.seconds * 1000)).format(dateFormatWithDate): ''}</TableCell>
                <TableCell>{rotation.Notes}</TableCell>
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
      {/*<Button
        variant="contained"
        color="primary"
        onClick={copyEmailsToClipboard}
        style={{ marginBottom: '10px' }}
      >
        Copy Emails to Clipboard
      </Button>*/}
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
