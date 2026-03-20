import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import { useLoading } from '../../layout/LoadingContext';
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles'; 
import  '../../components/css/style.css'; 



const UserDetails = () => {
  	const { PStartDate, PEndDate, did } = useParams();
  	const { showLoading, hideLoading, API_KEY,DatabaseName,SelectWithComplexConditions,Timestamp } = useLoading();
  console.log("PStartDate---->", PStartDate);
  console.log("PEndDate---->", PEndDate);

  // Define all the state variables at the top level of the component

  const [OperationMessage, setOperationMessage] = useState('');
  const [AllPaymentData, setAllPaymentData] = useState([]);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ id: 'PaymentDate', name: '' });
  
  // Determine the initial start and end dates based on the presence of PStartDate and PEndDate
  const initialStartDate = PStartDate ? dayjs(new Date(PStartDate * 1000)) : dayjs(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const initialEndDate = PEndDate ? dayjs(new Date(PEndDate * 1000)) : dayjs(new Date());
  
  const initialStartDateView = PStartDate ? dayjs(new Date(PStartDate * 1000)) : dayjs(new Date(new Date().setMonth(new Date().getMonth() - 10)));
  const initialEndDateView = PEndDate ? dayjs(new Date(PEndDate * 1000)) : dayjs(new Date());

  // Use the determined initial values for state
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startDateView, setStartDateView] = useState(initialStartDateView);
  const [endDateView, setEndDateView] = useState(initialEndDateView);

  const [filterField, setFilterField] = useState('');
  const [idOptions, setIdOptions] = useState([]);
  	
	
  useEffect(() => {
   // return () => {
    fetchUserData();
  //};
  
  }, []);
  useEffect(() => {
  }, [did]);


  const loadFilterOptions = async () => {
    const idOptions = {
    	"PaymentDate": "Payment Date"
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
    //if(name=="id" || name=="condition")
   setFilters({ ...filters, [name]: value });
  };

  const fetchUserData = async (Cond="PaymentDate") => {
    try 
    {
    	let result;
    	const DateTimestampStart=Timestamp.fromDate(startDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(endDate.toDate());
		setStartDateView(startDate)
		setEndDateView(endDate)
    	loadFilterOptions();
    	let conditionsArray;
    	setFilterField(Cond)
    	conditionsArray = 
    		[
  				[
    				
    				{ name: "PaymentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "PaymentDate", condition: "<=", value: DateTimestampEnd }
  				]
			];
    		
		result =await SelectWithComplexConditions("UnknownPayments",conditionsArray);
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
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate}
        onChange={date => setEndDate(date)}
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

        <Button variant="contained" className="FilterButton" onClick={applyFilters}>Apply Filters</Button>
      </Box>
      </Box>
      <CenteredBoxInfo>
      <div style={{
                  width: '45%',
                  margin: '0 auto',
				fontSize: '22px',
				fontWeight: 'bolder'
                }}>Unknown Payments Received</div>  
  
 	 <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
    <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
      <TableCell>Payment Type</TableCell>
      <TableCell>Payment Mode</TableCell>
      <TableCell>Amount</TableCell>
      <TableCell>Payment Date</TableCell>
      <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {AllPaymentData.length > 0 ? (
  
    AllPaymentData.map((user, index) => {
      if (
                isDateComparedTrue(user.PaymentDate, ">=", startDateView) &&
                isDateComparedTrue(user.PaymentDate, "<=", endDateView)
              ) {
                return (
                  <TableRow >
                    <TableCell>{user?.Name || 'N/A'}</TableCell>
                    <TableCell>
                      <a
                      	target="_blank"
                        href={`/admin/updateunknowpayment/${user.id}`}
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
                        {user?.Email}
                      </a>
                    </TableCell>
                    <TableCell>{user.FeeType}</TableCell>
                    <TableCell>{user?.ModeOfPayment || 'N/A'}</TableCell>
                    <TableCell>{user?.Amount || 'N/A'}</TableCell>
                    <TableCell>{new Date(user.PaymentDate.seconds * 1000).toLocaleString()}</TableCell>
                    <TableCell>{user?.PaymentNotes || 'N/A'}</TableCell>
                  </TableRow>
                );
              }
    })
  ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No  data available.
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
