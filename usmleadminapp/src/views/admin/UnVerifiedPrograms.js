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
  	const { showLoading, handleAdd,hideLoading, API_KEY,FetchDataFromCollection,DatabaseName,SelectWithComplexConditions,Timestamp,handleUpdate } = useLoading();
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
  const sortableItems = Object.keys(AllPaymentData).flatMap(userKey => {
  let user=AllPaymentData[userKey];
  return {
   uid: user?.profile?.uid,
          StudentUniqueId: user?.profile?.StudentUniqueId,
          email: user?.profile?.email,
          displayName: user?.profile?.displayName,
          phoneCode: user?.profile?.PhoneCountry?.phoneCode,
          phoneNumber: user?.profile?.phoneNumber,
          AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
          Frieda: user.Frieda,
          AssignedOn:user.AssignedOn,
          AssignedYear:user.AssignedYear,
          Status:user.Status,
          TotalCount:user.TotalCount
  }
    return Object.keys(user.RotationData.Rotations).flatMap(rotationKey => {});
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
  const SendReminder = async (emailid,Name,FriedaID,TotalCount) =>
  {
  	showLoading()
  	const DataToNotify={
    to: emailid,
    message: {
      subject: "Reminder – Complete Your Assigned Programs by Sept 19, 2025 (USMLESarthi)",
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <p>Dear ${Name || 'Doctor'},</p>

          <p>This is a gentle reminder that <b>the deadline to complete your program assignments is September 19th, 2025.</b> Please ensure they are completed by then.</p>

          <p><strong>👉 To check your assigned programs:</strong><br/>
          Login to <a href="https://residencymatch.usmlesarthi.com/home" target="_blank">https://residencymatch.usmlesarthi.com/home</a>
          &gt; Click on <em>“Update List”</em></p>

          <p>For step-by-step instructions and best practices, we recommend watching our guidance session
          by senior panelist <strong>Dr. Katherine Htun</strong>:<br/>
          🔗 <a href="https://videos.usmlesarthi.com/programs/contributing-to-sarthi-list-2026-128349" target="_blank">
          Watch Guidance Session</a></p>

          <p>If you face any issues, kindly submit the support form below and our team will get back to you within 24–48 hours:<br/>
          🔗 <a href="https://forms.gle/61kUyfFWJL5iUTDq9" target="_blank">Submit Support Form</a></p>

          <p>Admins will verify your entries once you submit. If admins reject your entries with comments, please promptly correct and resubmit. Once all assigned programs are completed and verified, your access to sarthi 2025 updated list will automatically open.  You will see updated list in the same Sarthi List tab, but a new column “last Updated” will appear now with dates updated. </p>

          <p>We appreciate your contribution to the Sarthi community and look forward to your active participation.</p>

          <p>Best regards,<br/>
          <strong>Team Sarthi</strong></p>
        </body>
      </html>
      `,
    },
  }
  await handleAdd("mail",DataToNotify);
  hideLoading()
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
    		FilterChangingOption = {"Connected with physician":"Connected with physician","Rotation  completed":"Rotation  completed","Rotation postponed":"Rotation postponed","No Reply from Student":"No Reply from Student","Rotation canceled.":"Rotation canceled.","Not connected with physician":"Not connected with physician"};
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

    	let OrderColumn="";
    	let orderDirection=""
    	const currentYearLocal = new Date().getFullYear();
    	let conditionsArray =
    		[
  				[
  					{ name: "AssignedYear", condition: "==", value: currentYearLocal },
    				{ name: "Status", condition: "!=", value: "Completed" },
  				]
			];
    	console.log("conditionsArray---->",conditionsArray)
		result =await SelectWithComplexConditions("HospitalProgramInfo",conditionsArray,"Users");
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
   			let finalDatais={};
   			result.data.forEach(item => {
   			if(typeof finalDatais[item.profile.email]=="undefined")
   			{
   				finalDatais[item.profile.email]=item;
   				finalDatais[item.profile.email].TotalCount=1;
   			}
   			else
   			{
   				finalDatais[item.profile.email].Frieda=finalDatais[item.profile.email].Frieda+"<br>"+item.Frieda;
   				finalDatais[item.profile.email].Status=finalDatais[item.profile.email].Status+"<br>"+item.Status;
   				finalDatais[item.profile.email].TotalCount=finalDatais[item.profile.email].TotalCount+1;
   			}
});
   			setAllPaymentData(finalDatais)

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
            <TableCell onClick={() => requestSort('Frieda')} sx={{ border: "1px solid black" }}>
            	Frieda ID {sortConfig.key === 'Frieda' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        	</TableCell>
            <TableCell onClick={() => requestSort('AssignedOn')} sx={{ border: "1px solid black" }}>
                  Assigned Date {sortConfig.key === 'AssignedOn' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
            <TableCell onClick={() => requestSort('Status')} sx={{ border: "1px solid black" }}>
                 Status {sortConfig.key === 'Status' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>

            <TableCell onClick={() => requestSort('TotalCount')} sx={{ border: "1px solid black" }}>
                 Total Pending {sortConfig.key === 'TotalCount' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
            </TableCell>
             <TableCell sx={{ border: "1px solid black" }}>
                 Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {sortedData.length > 0 ? (
            sortedData.map((rotation, index) => {
              return (
                <TableRow key={index} sx={{ border: "1px solid black" }}>
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
                  <TableCell sx={{ border: "1px solid black" }} dangerouslySetInnerHTML={{ __html: rotation?.Frieda }}></TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>{rotation.AssignedOn?dayjs(new Date(rotation.AssignedOn)).tz('Asia/Kolkata').format(dateFormat):null}</TableCell>

                   <TableCell sx={{ border: "1px solid black" }} dangerouslySetInnerHTML={{ __html: rotation?.Status }}></TableCell>
                  <TableCell sx={{ border: "1px solid black" }}> {rotation?.TotalCount}</TableCell>
                   <TableCell sx={{ border: "1px solid black" }}>  <Button
    variant="contained"
    color="primary"
    size="small"
    onClick={() => SendReminder(rotation.email,rotation.displayName,rotation?.Frieda,rotation?.TotalCount)}
  >
    Notify
  </Button></TableCell>
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
