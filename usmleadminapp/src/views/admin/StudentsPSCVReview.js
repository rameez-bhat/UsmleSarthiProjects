import React, { useEffect, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { CountryWithStates } from "../../apis/countriesWithStates";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Select1 from 'react-select';
import { CFormCheck } from '@coreui/react'
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { USA_States } from "../../apis/usa_states";
//const admin = require('firebase-admin');
const dateFormat="MM/DD/YYYY";
import {
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from 'dayjs';

import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
let interviewData={};
const BASE_URL = "https://student.usmlesarthi.com/register";
const BASE_URL1 = "https://residencymatch.usmlesarthi.com/authenticate";
let referralUrl = "";
let ListOfPanelists=[];
const RedFlagOptions = [
  { value: 'Lack of USCE', label: 'Lack of USCE' },
  { value: 'number of exam attempts', label: 'Number of Exam Attempts' },
  { value: 'YOG', label: 'YOG' },
  { value: 'Gap in experience', label: 'Gap in Experience' },
  { value: 'Other', label: 'Other' }
];
const matchVisaOptionList = [
  { value: 'GC/US citizen H4 EAD', label: 'GC/US citizen H4 EAD' },
  { value: 'Need H1', label: 'Need H1' },
  { value: 'Need J1', label: 'Need J1' },
  { value: 'Others', label: 'Others' }
];
const HowDidYouHearOptions = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Youtube', label: 'Youtube' },
  { value: 'Google', label: 'Google' },
  { value: 'Reviewed Website', label: 'Reviewed Website' },
  { value: 'Reddit', label: 'Reddit' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Profile Review/Discussion with Sarthi team', label: 'Profile Review/Discussion with Sarthi team' },
  { value: 'Refered by Friend/Senior', label: 'Refered by Friend/Senior' },
  { value: 'Others', label: 'Others' }
];
const allCountriesC = countryData.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag,
    phoneCode: country.phoneCode,
    "FieldName":"CountryOfMedicalSchool",
  }));
const currentYear = new Date().getFullYear();
const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
const SameAsPhoneList=[{value:"",label:"Select Value"},{value:"no",label:"No"},{value:"yes",label:"Yes"}];
let ReferralserviceOptions=[];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3',
  };
let AdminOptionsList=[];
let panelistOptions={};
let loopusce=0;
let medicalSchoolOptionsList = [
      ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
      { value: 'Others', label: 'Others' }
    ];
const Step1ScoreDropDown= {'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
const Step2ScoreDropDown= {'Score':'Score','Not taken':'Not taken'}
const UserDetails =  () => {
const navigate = useNavigate();
 const { toArray,ReferralemptyServiceRow,ReferraldiscountTypes,showLoading, hideLoading,deleteFieldFromDocument, API_KEY,Timestamp,DatabaseName,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser } = useLoading();
	const { id } = useParams();
	const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [existingServices, setExistingServices] = useState([]);
  const [services, setServices] = useState([{ ...ReferralemptyServiceRow }]);
	const [StudentData, setStudentData] = useState({});
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const mainCollectionName = 'UsersRoles';
  	const joinCollectionName = 'Users';
  	const handleBack = () => {
    navigate(-1);
  };
  const selectedServices = [...new Set([
  ...services.map((s) => s.service),
  ...existingServices
])];
  useEffect(() => {
	showLoader()
    fetchUserData();
  }, []);
   const handleCheckboxChange = (event) => {
  const { id, checked } = event.target; // Extract id and checked values
  setStudentData((prevState) => ({
    ...prevState,
    servicesChoosen: {
      ...prevState.servicesChoosen, // Spread the existing servicesChoosen data
      [id]: checked, // Dynamically update the specific service by id
    },
  }));
};
const handleCopy = async (url,which) => {
    await navigator.clipboard.writeText(url);
    setCopied(which);
    setTimeout(() => setCopied(false), 2000);
  };
  const fetchUserData = async () => {

  showLoading()
  	const userDataSelected = await FetchDataFromCollection("Users", 20, "uid", "==", id, 0);
    const userDataSelectedAgent = await FetchDataFromCollection("AgentUserConnection", 20, "uid", "==", id, 0);
    const userDataSelectedInterviews = await FetchDataFromCollection("InterviewsInfo", 20, "UId", "==", id, 0);
    const ListOfPanelistsData = await fetchAdminDataWithJoin("UsersRoles","Users",3000,null,"Role","==","Mentor");
    console.log("ListOfPanelists====>",ListOfPanelistsData)
    if(ListOfPanelistsData.data.length)
    {
        ListOfPanelists=ListOfPanelistsData.data
    }
    panelistOptions = Object.entries(ListOfPanelists).map(([email, objec]) => ({
  value: objec.email,
  label: objec.displayName+"("+objec.email+")"

}));
    if(userDataSelectedInterviews.length > 0)
    {
        interviewData=userDataSelectedInterviews[0];
    }
    console.log("userDataSelected====>",userDataSelected)
	setStudentData(userDataSelected[0])
    setInitialData(userDataSelected[0]);
    hideLoading();
    };
  const removeService = async (index) => {
    const updated = [...services];
    const RemovedItem= updated[index];
    updated.splice(index, 1);
    //updated.splice(index, );
    setServices(updated);
    const docId = RemovedItem.service.replace(/\s+/g, "");
    const FieldtobeDeleted=`ReferralObject.Settings.${docId}`;
    //console.log("RemovedItem====>",RemovedItem)
    await deleteFieldFromDocument("Users",id,FieldtobeDeleted);
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
	const handleChangeStudentDetails = async (event,name="",topname="")=>{

  		let value;
  		if(typeof event?.target!="undefined")
  		{
  			value=event.target.value;
  		}
  		else if(typeof event?.[0]?.value!="undefined")
  		{
  		  value=event;
  		}
  		else if(typeof event[0]!="undefined")
  		{
  			value={};
  			value['from']= Timestamp.fromDate(new Date(event[0].toLocaleString('en-GB', { timeZone: 'GMT' })));
			value['to']= Timestamp.fromDate(new Date(event[1].toLocaleString('en-GB', { timeZone: 'GMT' })));
  		}
  		else if(typeof event.$d!="undefined")
  		{
  			value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
			value = Timestamp.fromDate(new Date(value));
  		}
  		else if(typeof event.label!="undefined")
  		{
  			value=event;
  		}
  		else
  		{
  			value=event.label;
  		}
 setStudentData((prevValues) => ({
  ...prevValues,
  journalistreview: {
    ...(prevValues.journalistreview ?? {}),
    [topname]: {
      ...(prevValues.journalistreview?.[topname] ?? {}),
      [name]: value ?? '',
    },
  },
}));

      checkForChanges(name, value);
	}

const handleSubmit = async () => {
  //if (!Referralvalidate()) return;
  let PayloadPrepare={};
  try {
    showLoading();
  
    await handleUpdate("Users", id, StudentData);
    alert("Saved Successfully");
	//navigate("/admin/referrallist");
    //setServices([{ ...ReferralemptyServiceRow }]);
  } catch (err) {
    console.error(err);
    alert("Failed to save");
  } finally {
    hideLoading();
  }
};

	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <button
      onClick={handleBack}
      style={buttonStyle}
      onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
      onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
    >
      Go Back
    </button>
    <div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>{StudentData.displayName}({StudentData.email})</b>  </Typography>
        </div>
    </div>
	<div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>PS Journalist First Review:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>Received in </InputLabel>
              <Select
                value={StudentData?.journalistreview?.firstjournalistreview?.receivedingoogleclassroomcorrect ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "receivedingoogleclassroomcorrect","firstjournalistreview"
                  )
                }
              >
                  <MenuItem value="googleClassroom">Google Class Room</MenuItem>
                  <MenuItem  value="ViaEmail">Via Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>
       <Grid item xs={6}>
  <Box sx={{display: "flex",alignItems: "center",border: "1px solid #ccc",borderRadius: 1}}>
    <Typography variant="subtitle1" color="textSecondary" sx={{flexBasis: "40%",p: 1,borderRight: "1px solid #ccc"}}>Sent To Journalist Date:</Typography>

    <Box sx={{ flexGrow: 1, p: 1 }}>
      <DatePicker
        value={StudentData?.journalistreview?.firstjournalistreview?.senttojournalistdate ? dayjs(StudentData?.journalistreview?.firstjournalistreview?.senttojournalistdate.toDate()): null}
        onChange={(e) =>handleChangeStudentDetails(e,"senttojournalistdate","firstjournalistreview")}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small"
          }
        }}
      />
    </Box>
  </Box>

  {errors.EnrollmentDate && (
    <span className="validationerror">{errors.EnrollmentDate}</span>
  )}
</Grid>
          <Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <Select1
                value={StudentData?.journalistreview?.firstjournalistreview?.senttojournalist ?? ''}
                label="Sent to Journalist"
                options={panelistOptions}
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "senttojournalist","firstjournalistreview"
                  )
                }
              >
              </Select1>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
  <Box sx={{display: "flex",alignItems: "center",border: "1px solid #ccc",borderRadius: 1}}>
    <Typography variant="subtitle1" color="textSecondary" sx={{flexBasis: "40%",p: 1,borderRight: "1px solid #ccc"}}>Received From Journalist Date:</Typography>

    <Box sx={{ flexGrow: 1, p: 1 }}>
      <DatePicker
        value={StudentData?.journalistreview?.firstjournalistreview?.receivedfromjournalistdate ? dayjs(StudentData?.journalistreview?.firstjournalistreview?.receivedfromjournalistdate.toDate()): null}
        onChange={(e) =>handleChangeStudentDetails(e,"receivedfromjournalistdate","firstjournalistreview")}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small"
          }
        }}
      />
    </Box>
  </Box>{errors.EnrollmentDate && (<span className="validationerror">{errors.EnrollmentDate}</span>)}
  </Grid>
          
          <Grid item xs={6}>
              <div className="InputLabel">Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
    				minRows={3}
                    value={StudentData?.journalistreview?.firstjournalistreview?.notes  ?? ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'notes',"firstjournalistreview")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.firstnotes  && <span className="validationerror">{errors.firstnotes }</span>}
                </Grid>
  			</Grid>
  			
		</div>
	</div>
	<div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#de7cc9', p: 1, borderRadius: 2 }}><b>PS Second Journalist Review:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>PS Review</InputLabel>
              <Select
                value={StudentData?.journalistreview?.secondjournalistreview?.psreview  ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(e,"psreview","secondjournalistreview")}
              >
                  <MenuItem value="googleClassroom">Google Class Room</MenuItem>
                  <MenuItem  value="ViaEmail">Via Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
  <Box sx={{display: "flex",alignItems: "center",border: "1px solid #ccc",borderRadius: 1}}>
    <Typography variant="subtitle1" color="textSecondary" sx={{flexBasis: "40%",p: 1,borderRight: "1px solid #ccc"}}>Sent To Journalist Date:</Typography>

    <Box sx={{ flexGrow: 1, p: 1 }}>
      <DatePicker
        value={StudentData?.journalistreview?.secondjournalistreview?.senttojournalistdate ? dayjs(StudentData?.journalistreview?.secondjournalistreview?.senttojournalistdate.toDate()): null}
        onChange={(e) =>handleChangeStudentDetails(e,"senttojournalistdate","secondjournalistreview")}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small"
          }
        }}
      />
    </Box>
  </Box>{errors.EnrollmentDate && (<span className="validationerror">{errors.EnrollmentDate}</span>)}
  </Grid>
          
          <Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <Select1
                value={StudentData?.journalistreview?.secondjournalistreview?.senttojournalist ?? ''}
                label="Sent to Journalist"
                options={panelistOptions}
                onChange={(e) =>handleChangeStudentDetails(e,"senttojournalist","secondjournalistreview")}
              >
              </Select1>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
  <Box sx={{display: "flex",alignItems: "center",border: "1px solid #ccc",borderRadius: 1}}>
    <Typography variant="subtitle1" color="textSecondary" sx={{flexBasis: "40%",p: 1,borderRight: "1px solid #ccc"}}>Received From Journalist Date:</Typography>

    <Box sx={{ flexGrow: 1, p: 1 }}>
      <DatePicker
        value={StudentData?.journalistreview?.secondjournalistreview?.receivedfromjournalistdate ? dayjs(StudentData?.journalistreview?.secondjournalistreview?.receivedfromjournalistdate.toDate()): null}
        onChange={(e) =>handleChangeStudentDetails(e,"receivedfromjournalistdate","secondjournalistreview")}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small"
          }
        }}
      />
    </Box>
  </Box>{errors.EnrollmentDate && (<span className="validationerror">{errors.EnrollmentDate}</span>)}
  </Grid>
          
          <Grid item xs={6}>
              <div className="InputLabel">Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
    				minRows={3}
                    value={StudentData?.journalistreview?.secondjournalistreview?.notes  ?? ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'notes',"secondjournalistreview")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.firstnotes  && <span className="validationerror">{errors.firstnotes }</span>}
                </Grid>
  			</Grid>
  			
		</div>
	</div>
	<div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#a4d8db', p: 1, borderRadius: 2 }}><b>ERAS CV Review JOurnalist:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>CV Review</InputLabel>
              <Select
                value={StudentData?.journalistreview?.erasjournalistreview?.cvreview  ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "cvreview","erasjournalistreview"
                  )
                }
              >
                  <MenuItem value="googleClassroom">Google Class Room</MenuItem>
                  <MenuItem  value="ViaEmail">Via Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>One and Done PS</InputLabel>
              <Select
                value={StudentData?.journalistreview?.erasjournalistreview?.oneanddoneps  ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "oneanddoneps","erasjournalistreview"
                  )
                }
              >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem  value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>One and Done ERAS</InputLabel>
              <Select
                value={StudentData?.journalistreview?.erasjournalistreview?.oneanddoneeras  ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "oneanddoneeras","erasjournalistreview"
                  )
                }
              >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem  value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
              <div className="InputLabel">Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData?.journalistreview?.erasjournalistreview?.notes  ?? ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'notes',"erasjournalistreview")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.firstnotes  && <span className="validationerror">{errors.firstnotes }</span>}
                </Grid>
  			</Grid>
  			
		</div>
	</div>
	<div className="RotationAddedPayment MatchPayment" >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#a4c2db', p: 1, borderRadius: 2 }}><b>Physician Review:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}  alignItems="center">
  			<Grid item xs={6}>
            <FormControl
              fullWidth
            >
              <InputLabel>Physician Review</InputLabel>
              <Select
                value={StudentData?.journalistreview?.physicianjournalistreview?.physicianreview ?? ''}
                label="Type"
                onChange={(e) =>
                  handleChangeStudentDetails(
                    e,
                    "physicianreview","physicianjournalistreview"
                  )
                }
              >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem  value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
         
          <Grid item xs={6}>
              <div className="InputLabel">Notes</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={StudentData?.journalistreview?.physicianjournalistreview?.notes ?? ''}
                    required
                    onChange={(event) => handleChangeStudentDetails(event,'notes',"physicianjournalistreview")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.firstnotes  && <span className="validationerror">{errors.firstnotes }</span>}
                </Grid>
  			</Grid>
  			
		</div>
	</div>
        
    

          <Grid className="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}

            >
              Update
            </Button>
            </Grid>

         <Dialog
        open={open}
        onClose={handleCancel}
      >
        <DialogTitle>Operation Status: {OperationStatus}</DialogTitle>
        <DialogContent>
          <DialogContentText>
           <span dangerouslySetInnerHTML={{ __html: OperationMessage }} />

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
