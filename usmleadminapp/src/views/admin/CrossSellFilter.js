import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

let EmailList=[];
let FilterChangingOption={};
const UserDetails = () => {
  	const { did } = useParams();
  	const { showLoading, hideLoading, API_KEY,DatabaseName,SelectWithComplexConditions,Timestamp } = useLoading();
	const [OperationMessage, setOperationMessage] = useState('');
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'crossSell', name: '' });
	//const [FiltersType, setFiltersType] = useState(filters.id);
	const [startDate, setStartDate] = useState(
  dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  	//const [startDateView, setStartDateView] = useState(dayjs(new Date(new Date().setMonth(new Date().getMonth() - 10))));
  	//const [endDateView, setEndDateView] = useState(dayjs(new Date()));
  	//const [conditionType, setconditionType] = useState('');
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
  let Payment1='';
  let Payment2='';
  let Payment3='';
console.log("user====>",user)
	EmailList.push({email:user?.profile?.email});
  		return {
  		email:user.profile.email,
  		StudentUniqueId: user?.profile?.StudentUniqueId,
  		uid:user.uid,
  		displayName:user.profile.displayName,
  		AdminInTouch:user.profile?.AdminInTouch?.label,
  		followupdate:user.profile?.followupdate,
  		followuprequired:user.profile?.followuprequired,
  		CrossSellStatus:user?.CrossSellStatus,
  		LastFollowUpDate:user?.LastFollowUpDate,
  		AddedBy:user.AddedBy,
  		NoteType:user.NoteType,
  		Notes:user.Notes,
  		Payments:`${Payment1} ${Payment2} ${Payment3}`,
  		}
  });

   if (sortConfig.key) {
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
const copyEmailsToClipboard = async () => {
	const emailList = EmailList.map(rotation => rotation.email).join('\n');
	navigator.clipboard.writeText(emailList).then(() => {
      alert('Emails copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy emails: ', err);
    });
}

  const loadFilterOptions = async () => {
    const idOptions = {
    	"crossSell": "No Filter",
    	"followupdate": "Followup Date",
    	"CrossSellStatus": "Cross Sell Status",
    	"LastFollowUpDate": "Last Followup"
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
    	else if(filterField==="ContractStatus" || filterField==="VisaLetterStatus")
    	{
    		if(DynamicField===null)
    		{
    			setOperationMessage("Please Select "+filters.id+" Options" );
    			setOpen(true);
    		}
    		else
    		{
    			showLoader()
    			fetchUserData(filterField)
    		}
    	}
    	else
    	{
    		showLoader()
    		fetchUserData(filterField)
    	}
    	
  };
   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)
    	
    }
     if(value==="CrossSellStatus")
    {
    	FilterChangingOption = value === "CrossSellStatus"
  ? {"interested":"Interested","not interested":"Not Interested","maybe":"May Be"}
      
  : {"Letter Requested":"Letter Requested","On Hold":"On Hold","Letter Complete and Sent":"Letter Complete and Sent"}
    }
    //if(name=="id" || name=="condition")
   setFilters({ ...filters, [name]: value });
  };
    const handleDynamicChange = (e)=>
  {
  	const { name, value } = e.target;
  	setDynamicField(value)
  	
  };

  const fetchUserData = async (Cond="crossSell") => {
    try 
    {
    	let result;
    	const DateTimestampStart=Timestamp.fromDate(startDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(endDate.toDate());
		//setStartDateView(startDate)
		//setEndDateView(endDate)
		EmailList=[];
		showLoading()
    	loadFilterOptions();
    	let conditionsArray=[];
    	let feeTypeArray;
    	//setFiltersType(filters.id)
    	let OrderColumn="";
    	let orderDirection=""
    	//setFilterField(filters.id)
    	console.log("Cond--->",Cond)
    	if(Cond==="followupdate")
    	{
    		
    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		//setconditionType(feeTypeArray);
    		conditionsArray = 
    		[
  				[
    				{ name: "NoteType", condition: "==", value: "Cross Sell" },
    				{ name: "profile.followupdate", condition: ">=", value: DateTimestampStart },
    				{ name: "profile.followupdate", condition: "<=", value: DateTimestampEnd },
  				],
			];
    	}
    	else if(Cond==="crossSell")
    	{
    		feeTypeArray=["application fee"]
    		//setconditionType(["application fee"]);
    		conditionsArray = 
    		[
  				[
    				{ name: "NoteType", condition: "==", value: "Cross Sell" },
  				]

			];
    	}
    	else if(Cond==="CrossSellStatus")
    	{
    		feeTypeArray=["application fee"]
    		//setconditionType(["application fee"]);
    		conditionsArray = 
    		[
  				[
    				{ name: "CrossSellStatus", condition: "==", value: DynamicField },
  				]

			];
    	}
    	else if(Cond==="LastFollowUpDate")
    	{
    		feeTypeArray=["application fee"]
    		//setconditionType(["application fee"]);
    		conditionsArray = 
    		[
  				[
    				{ name: "LastFollowUpDate", condition: ">=", value: DateTimestampStart },
    				{ name: "LastFollowUpDate", condition: "<=", value: DateTimestampEnd },
  				]

			];
    	}
    		console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("CrossSellFollowups",conditionsArray,"Users");
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
         {(filters.id!=="CrossSellStatus" ) ? (
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
                }}>User Selected For Cross Sell Total={sortedData.length}</div>  
  
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
            <TableCell onClick={() => requestSort('LastFollowUpDate')}>
                  Last Updated {sortConfig.key === 'LastFollowUpDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('CrossSellStatus')}>
                  Status {sortConfig.key === 'CrossSellStatus' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('Notes')}>
                  Notes  {sortConfig.key === 'Notes' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('followupdate')}>
                Followup Date {sortConfig.key === 'followupdate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('AddedBy')}>
                Added By {sortConfig.key === 'AddedBy' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
              return (
                <TableRow key={index}>
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
                  <TableCell>{rotation['LastFollowUpDate'] ? typeof rotation.followupdate==="string"?dayjs(rotation['LastFollowUpDate']).format("MM-DD-YYYY"):dayjs(new Date(rotation['LastFollowUpDate']?.seconds*1000)).format("MM-DD-YYYY") : null}</TableCell>
                  <TableCell>{rotation.CrossSellStatus}</TableCell>
                  <TableCell>{rotation.Notes}</TableCell>
                  <TableCell>{rotation['followupdate'] ? typeof rotation.followupdate==="string"?dayjs(rotation['followupdate']).format("MM-DD-YYYY"):dayjs(new Date(rotation['followupdate']?.seconds*1000)).format("MM-DD-YYYY") : null}</TableCell>
                  <TableCell>{rotation.AddedBy.displayName}({rotation.AddedBy.UserType})</TableCell>
                  

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
