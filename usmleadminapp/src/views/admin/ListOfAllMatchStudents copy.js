import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Typography,
  Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles'; 
import  '../../components/css/style.css'; 

let EmailList=[];
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
	const [filters, setFilters] = useState({ id: 'EnrollmentDate', name: '' });
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
  	const [MatchPlanListObject, setMatchPlanListObject] = useState({});
  	const [FilterList, setFilterList] = useState({'Plan':null,'EnrollmentDate':{},'Season':{},'Status':null,PaymentDate:{},Onboard_kindofstudent:null,EmailWhatsAppInstructions:null});
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
const migratePaymentsStructure = async () => {
  const snapshot = await getDocs(collection(db, "UserServices"));

  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    console.log("data====>",data)
    if (
      data?.Match?.Payments &&
      Array.isArray(data.Match.Payments)
    ) {
      const paymentsArray = data.Match.Payments;
      const paymentsObject = {};

      paymentsArray.forEach((payment, index) => {
        paymentsObject[`Payment${index}`] = payment;
      });

      await updateDoc(doc(db, "UserServices", docSnap.id), {
        "Match.Payments": paymentsObject
      });

      updatedCount++;
      console.log("Updated:", docSnap.id);
    }
  }

  console.log("Migration Complete. Updated:", updatedCount);
};
// Updated sortedData with FeeType sorting logic
const sortedData = useMemo(() => {
  const sortableItems = AllPaymentData.flatMap(user => {
  let Payment1='';
  let Payment2='';
  let Payment3='';
 if (user?.Match?.Payments?.Payment0?.Amount) {
  Payment1 = `Amount: ${user.Match.Payments.Payment0.Amount}   Payment Date: ${
    user.Match.Payments.Payment0.PaymentDate ? dayjs(new Date(user.Match.Payments.Payment0.PaymentDate.seconds * 1000)).format('MM-DD-YYYY') : "N/A"
  }`;
}

if (user?.Match?.Payments?.Payment1?.Amount) {
  Payment2 = `Amount: ${user.Match.Payments.Payment1.Amount}   Payment Date: ${
    user.Match.Payments.Payment1.PaymentDate ? dayjs(new Date(user.Match.Payments.Payment1.PaymentDate.seconds * 1000)).format('MM-DD-YYYY') : "N/A"
  }`;
}

if (user?.Payments?.Payment2?.Amount) {
  Payment3 = `Amount: ${user.Match.Payments.Payment2.Amount}   Payment Date: ${
    user.Match.Payments.Payment2.PaymentDate ? dayjs(new Date(user.Match.Payments.Payment2.PaymentDate.seconds * 1000)).format('MM-DD-YYYY') : "N/A"
  }`;
}
	EmailList.push({email:user?.profile?.email});
  		return {
  		email:user.profile.email,
  		StudentUniqueId: user?.profile?.StudentUniqueId,
  		uid:user.profile.uid,
  		displayName:user.profile.displayName,
  		AdminInTouch:user.profile?.AdminInTouch?.label,
  		EnrollmentDate:user.Match.EnrollmentDate,
  		Plan:user.Match.Plan.Relation.Value?user.Match.Plan.Relation.Value:user.Match.Plan.Name,
  		Season:user.Match.Season,
  		Payments:`${Payment1} ${Payment2} ${Payment3}`,
  		}
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
    	"EnrollmentDate": "Enrollment Date",
    	"Season": "Match Season",
    	"PaymentDate": "Payment Date",
    };

    
    setIdOptions(idOptions);
  };
    const applyFilters = async() => {

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
    			let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallmatchstudents","DynamicField":DynamicField,"filterName":FilterNameset}
    	    let resF= await handleUpdate("SavedFilters", "listofallmatchstudents", SavedFiltersData)
    			fetchUserData(filterField)
    		}
    	}
    	else
    	{
    		showLoader()
    		let SavedFiltersData={startDate:Timestamp.fromDate(startDate.toDate()),endDate:Timestamp.fromDate(endDate.toDate()),Cond:filterField,"filtertype":"listofallmatchstudents","DynamicField":'',"filterName":FilterNameset}
    	  let resF=await handleUpdate("SavedFilters", "listofallmatchstudents", SavedFiltersData);
    		fetchUserData(filterField)
    	}
    	
  };
   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)
    	
    }
     if(value==="ContractStatus" || value==="VisaLetterStatus")
    {
    	FilterChangingOption = value === "ContractStatus"
  ? {"Sent":"Sent","Signed":"Signed","Hold":"Hold","Not Signed":"Not Signed"}
      
  : {"Letter Requested":"Letter Requested","On Hold":"On Hold","Letter Complete and Sent":"Letter Complete and Sent"}
    }
    //if(name=="id" || name=="condition")
    FilterNameset=name;
   setFilters({ ...filters, [name]: value });
  };
    const handleDynamicChange = (e)=>
  {
  	const { name, value } = e.target;
  	setDynamicField(value)
  	
  };

  const fetchUserData = async (Cond="EnrollmentDate") => {
    try 
    {
    	let result;
    	innerStartDate=startDate;
    	//await migratePaymentsStructure();
    	innerEndDate=startDate;
    	innerDynamicField=DynamicField;
    	const MatchPlanList = await FetchDataFromCollection("MatchPlans", 200, "Type", "==", "Match", 0);
    	const MatchPlanListObj = {};
         MatchPlanList.map(async item => {
          MatchPlanListObj[item.id] = item;
        });
        setMatchPlanListObject(MatchPlanListObj);
    	fitlersSelected = await FetchDataFromCollection("SavedFilters", 20, "filtertype", "==", "listofallmatchstudents", 0);
    	
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
    		    FilterChangingOption = {"Connected with physician":"Connected with physician","Rotation  completed":"Rotation  completed","Rotation postponed":"Rotation postponed","No Reply from Student":"No Reply from Student","Rotation canceled.":"Rotation canceled.","Not connected with physician":"Not connected with physician"};
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
    	const DateTimestampStart=Timestamp.fromDate(innerStartDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(innerEndDate.toDate());
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
    	if(Cond==="EnrollmentDate")
    	{
    		
    		feeTypeArray=["rotation fee installment","rotation full payment"]
    		//setconditionType(feeTypeArray);
    		conditionsArray = 
    		[
  				[
    				{ name: "Match.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Match.EnrollmentDate", condition: "<=", value: DateTimestampEnd },
  				],
  				[
    				{ name: "Match.EnrollmentDate", condition: ">=", value: DateTimestampStart },
    				{ name: "Match.EnrollmentDate", condition: "<=", value: DateTimestampEnd },
  				]
			];
    	}
    	else if(Cond==="Season")
    	{
    	  const startYear = innerStartDate.toDate().getFullYear();
        const endYear = innerEndDate.toDate().getFullYear();
        console.log("startYear--->",startYear)
        console.log("endYear--->",endYear)
        //console.log("selectedYearE--->",selectedYearE)
      //const DateTimestampStartIn = Timestamp.fromDate(new Date(selectedYearS, 0, 1));
      //const DateTimestampEndIn = Timestamp.fromDate(new Date(selectedYearE, 11, 31, 23, 59, 59));
    		conditionsArray = 
    		[
  				[
    				{ name: "Match.Season", condition: ">=", value: startYear },
    				{ name: "Match.Season", condition: "<=", value: endYear },
  				]
			  ];
    	}
    	else if(Cond==="PaymentDate")
    	{
    		feeTypeArray=["application fee"]
    		//setconditionType(["application fee"]);
    		for (let i = 0; i <= 5; i++) 
    		{
          conditionsArray.push([
            {
              name: `Match.Payments.Payment${i}.PaymentDate`,
              condition: ">=",
              value: DateTimestampStart
            },
            {
              name: `Match.Payments.Payment${i}.PaymentDate`,
              condition: "<=",
              value: DateTimestampEnd
            }
          ]);
        }
    	}
    		console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("UserServices",conditionsArray,"Users");
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
		 <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
  <Typography variant="h6" mb={2}>
    Filters
  </Typography>

  <Grid container spacing={3}>
    
    {/* Raised By */}
    <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="plan-label">Plan</InputLabel>
                  <Select
                    labelId="plan-label"
                    id="plan-select"
                    value={FilterList.Plan}
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
    <Grid item xs={12} md={3}>
      <Typography fontWeight="500" mb={1}>
        Raised By
      </Typography>
      <Select
        options={adminOptions}
        value={filters.raisedBy}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, raisedBy: val }))
        }
        isClearable
      />
    </Grid>

    {/* Assigned To */}
    <Grid item xs={12} md={3}>
      <Typography fontWeight="500" mb={1}>
        Assigned To
      </Typography>
      <Select
        options={adminOptions}
        value={filters.assignedTo}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, assignedTo: val }))
        }
        isClearable
      />
    </Grid>

    {/* Status */}
    <Grid item xs={12} md={2}>
      <TextField
        select
        fullWidth
        label="Status"
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, status: e.target.value }))
        }
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="assigned">Newly Assigned</MenuItem>
        <MenuItem value="In progress">In Progress</MenuItem>
        <MenuItem value="Resolved">Resolved</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="stuck">Stuck</MenuItem>
        <MenuItem value="Closed">Closed</MenuItem>
      </TextField>
    </Grid>

    {/* Created From */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Created From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            createdFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Created To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            createdTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>
     <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Updated From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            updatedFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Updated To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            updatedTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Due From"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            duedateFrom: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    {/* Created To */}
    <Grid item xs={12} md={2}>
      <TextField
        type="date"
        fullWidth
        label="Due To"
        InputLabelProps={{ shrink: true }}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            duedateTo: e.target.value
              ? Timestamp.fromDate(new Date(e.target.value))
              : null,
          }))
        }
      />
    </Grid>

    <Grid item xs={12}>
      <Button
        variant="contained"
        onClick={loadData}
      >
        Apply Filters
      </Button>

      <Button
        sx={{ ml: 2 }}
        onClick={() => {
          setFilters({
            raisedBy: null,
            assignedTo: null,
            status: "",
            createdFrom: null,
            createdTo: null,
            updatedFrom: null,
            updatedTo: null,
          });
          loadData();
        }}
      >
        Reset
      </Button>
    </Grid>

  </Grid>
</Paper>

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
         {(filters.id!=="ContractStatus" && filters.id!=="VisaLetterStatus") ? (
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
                }}>Match Users Total={sortedData.length}</div>  
  
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
            <TableCell onClick={() => requestSort('EnrollmentDate')}>
                  Enrollement Date {sortConfig.key === 'EnrollmentDate' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('Plan')}>
                Plan {sortConfig.key === 'Plan' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort('Season')}>
                Match Season {sortConfig.key === 'Season' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell onClick={() => requestSort('Payments')}>
                Payments {sortConfig.key === 'Payments' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
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
                   <TableCell>{rotation.EnrollmentDate?dayjs(new Date(rotation.EnrollmentDate.seconds * 1000)).format('MM-DD-YYYY'):null}</TableCell>
                  <TableCell>{rotation?.Plan}</TableCell>
                  <TableCell>{`Match Season `+rotation?.Season+` (Sept `+(rotation?.Season-1)+`)`}</TableCell>
                  <TableCell>{rotation?.Payments}</TableCell>
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
