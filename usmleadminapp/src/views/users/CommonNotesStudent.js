import React, { useEffect, useState } from 'react';
import {useParams,useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
const dateFormat="MM/DD/YYYY";
import { CFormCheck } from '@coreui/react'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Select1 from 'react-select';
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
//const admin = require('firebase-admin');

import {
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
import PlatinumMentorShip from "../admin/PlatinumMentorShip";
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const followupindexLoop=0;
const CrossSellList=[
{value:"match",label:"Match"},
{value:"rotation",label:"Rotation"},
{value:"research",label:"Research"}
]
let Newway=false;
let LockProfile=false;
 	let indexLetter=0;
 	let NotesIndexMain=0
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
let MentorOptionsList=[];
let medicalSchoolOptionsList = [
      ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
      { value: 'Others', label: 'Others' }
    ];
const Step1ScoreDropDown= {'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
const Step2ScoreDropDown= {'Score':'Score','Not taken':'Not taken'}
const UserDetails =  (ActualAuthUser) => {
console.log("ActualAuthUser=====>",ActualAuthUser)
const ActualUser=ActualAuthUser.ActualUser;
const navigate = useNavigate();
 const { showLoading, hideLoading,copyCollection,deletedocumentfromid,SelectWithComplexConditionsJoin, API_KEY,handleUpdateOrCreateByField,SelectWithComplexConditions,DatabaseName,Timestamp,FetchUniqueData,handleUpdate, FetchDataFromCollection ,fetchAdminDataWithJoin,deleteUser,TooltipsPopovers } = useLoading();
	let { id } = useParams();
	let idWithoutChange=id;
	console.log("id======>",id)
	if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [matchSeason, setMatchSeason] = useState('');
	 const [status, setStatus] = useState('');
	 const [Notes, setNotes] = useState({});
	const [plan, setPlan] = useState('');
	const [userData, setUserData] = useState(null);
	const [StudentData, setStudentData] = useState({});
	const [LocationState, setLocationState] = useState(null);
	 const [MatchcreatedAtexists, setMatchcreatedAtexists] = useState(false);
	const [MatchPlanListObject, setMatchPlanListObject] = useState({});
	const [LocationCity, setLocationCity] = useState([{value:'',label:'-None-',FieldName:"LocationCity"}]);
	const [LocationCode, setLocationCode] = useState([{value:'',label:'-None-',FieldName:"LocationCode"}]);
	const [open, setOpen] = useState(false);
	const [MatchValues, setMatchValues] = useState(null);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const [NoteSectionData, setNoteSectionData] = useState([]);
	const [CommonUserNotesData, setCommonUserNotesData] = useState([]);
	const [UserServicesTaken, setUserServicesTaken] = useState({});
	const [rotationValues, setrotationValues] = useState({});
  	const [researchValues, setresearchValues] = useState({});
	const [checkedStates, setCheckedStates] = useState({
    match: false,
    rotation: false,
    research: false,
  });
	const mainCollectionName = 'UsersRoles';
  	const joinCollectionName = 'Users';
  	const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
  showLoading()
  	const LocationStates = await FetchUniqueData("Rotations","state");
  	setMatchValues({Payments:[{Discount:{
      Value: '',
      Code: '',
      Amount: '',
      Notes: ''
    },FeeType:'',ModeOfPayment:'',Amount:'',PaymentDate:'',RotationPaymentNotes:''}],
    Platinum:{Meetings:[]},
    Refund:{
      RequestedDate: '',
      ProcessedDate: '',
      Reason: '',
      Channel: '',
      Note:''
    },PaymentPlan:'',EnrollmentDate:'',RotationFeesToSarthi:''});
  	const options = LocationStates.map(location_code => ({ value: location_code, label: location_code ,FieldName:"LocationState"}));
  	options.unshift({value:'',label:'-None-',FieldName:"LocationState"});
  	setLocationState(options)
  
const adminOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Admin");
//await copyCollection("NotesSectionMatch","UserCommonServiceNotes")
//const mentorOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Mentor");

   adminOptions.data.map((item) => {
    AdminOptionsList.push({label:item.displayName,value:item.id});
    return "h";
    })
		const userDataSelected = await FetchDataFromCollection("Users", 20, "uid", "==", id, 0);
  
    	const  conditionsArrayNote =
    		[
  				[
    				{ name: "uid", condition: "==", value: id },
    				{ name: "NoteType", condition: "!=", value: "Questions" },
    				{ name: "ActionItem", condition: "in", value: ["For Student","For Both"] }
  				]
			];
        const CommonUserNotes =await SelectWithComplexConditionsJoin("UserCommonServiceNotes",conditionsArrayNote,"NotesDate","desc",null,"UsersRoles","uid","uid");

       console.log("CommonUserNotes--->",CommonUserNotes)
       if(CommonUserNotes.status=="success")
        {
        	if(CommonUserNotes.data.length)
        	{
        		setCommonUserNotesData(CommonUserNotes.data)
        	}

        }
        if(typeof userDataSelected[0].followback=="undefined")
        {
        	userDataSelected[0].followback="yes";
        }
    	setUserData(userDataSelected[0]);
    	 hideLoading();

    };

const AddFollowup = (followupno) => {
  /*console.log("CommonUserNotesData---->", CommonUserNotesData);

  // Create a new array instead of mutating the existing one
  const newMeetings = [...CommonUserNotesData, { name: "", description: "" }];

  // Update state with the new array
  setCommonUserNotesData(newMeetings);*/
  setCommonUserNotesData((prevData) => {
    const updatedNotes = [
    ...prevData,
      {
        NotesDate: Timestamp.fromDate(new Date()), // Firestore Timestamp with the current date
        NoteType: '', // Add any other required fields with default values
        TeamMember: '',
        Notes: '',
        CrossSell:'',
        ActionItem: 'For Both',
        AddedBy: {
          displayName: ActualUser.displayName,
          email: ActualUser.email,
          id: ActualUser.id,
          UserType: "Student",
        },
      },
       // Spread the existing notes to keep them in the list
    ];
    return updatedNotes;
  });
};
const validateFollowups = async() =>
{
  const error=[];
  return error;
};
const HandleCommonNotesSectionChange = (event,name,Index) =>{
	let value;
	if(typeof event?.[0]!="undefined")
  	{
  		value=event;
  	}
	else if(typeof event.target!="undefined")
  	{
  		value=event.target.value;
  	}
  	else if(typeof event.$d!="undefined")
  	{
  		value=event.toLocaleString('en-GB', { timeZone: 'GMT' });
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
  		console.log("name1----->",name)
  		console.log("Index----->",Index)
  		console.log("value----->",value)
  		console.log("event----->",event)
  	 setCommonUserNotesData((prevValues) => {
    const updatedNotes = [...prevValues]; // Make a copy of the array
    updatedNotes[Index] = {
      ...updatedNotes[Index], // Copy existing note data
      [name]: value, // Update the specific field
    };

    return updatedNotes;
  });
}
  const DeleteFollowup = async (Index) => {
  try {
  showLoading();
    // Ensure the note has an `id` before attempting to delete
    const noteToDelete = CommonUserNotesData[Index];
    console.log("CommonUserNotesData===>",CommonUserNotesData)
     console.log("Index===>",Index)
    if(typeof noteToDelete?.AddedBy?.id==="undefined" || noteToDelete?.AddedBy?.id===ActualUser.id)
    {
    	if (noteToDelete?.id)
    	{
      		// Call the Firestore function to delete the document by ID
      		await deletedocumentfromid("UserCommonServiceNotes", noteToDelete.id);
    	}

    	// Update the local state to remove the deleted note
    	setCommonUserNotesData((prevData) => {
      	const updatedNotes = [...prevData];
      	updatedNotes.splice(Index, 1); // Remove the note at the specified index
      	return updatedNotes;
    	});
    	console.log(`Deleted note at index ${Index} successfully.`);
    }
    else
    {
    	setOperationMessage("You Are Not Authorized To Delete Notes Owned By="+noteToDelete?.AddedBy?.displayName);
    	setOpen(true);
    }



  } catch (error) {
    console.error(`Failed to delete note at index ${Index}:`, error);
  }
  hideLoading();
};
const SaveFollowups = async () => {
  showLoading();
  const validationErrors = await validateFollowups();

  if (Object.keys(validationErrors).length === 0) {
    let condition = [];
    const updatedFollowUps = { ...CommonUserNotesData };
    console.log("updatedFollowUps====>", updatedFollowUps);

    // Use Promise.all with .map() instead of forEach()
    await Promise.all(
      Object.entries(updatedFollowUps).map(async ([index, FOLLOWUPS]) => {
        console.log("FOLLOWUPS====>", FOLLOWUPS);
        FOLLOWUPS.uid = id;
        FOLLOWUPS.email = userData.email;
        if (FOLLOWUPS.id) {
        if(typeof FOLLOWUPS?.AddedBy?.id==="undefined" || FOLLOWUPS?.AddedBy?.id===ActualUser.id )
        {
          return await handleUpdateOrCreateByField(
            "UserCommonServiceNotes", "id", FOLLOWUPS.id, FOLLOWUPS
          );
        }
        } else {
          return await handleUpdateOrCreateByField(
            "UserCommonServiceNotes", "uid", null, FOLLOWUPS
          );
        }
      })
       
      
    );

    TooltipsPopovers("success", "Updated Successfully!", "Success");
    hideLoading();
  } else {
    seterrors(prevErrors => 
      JSON.stringify(prevErrors) !== JSON.stringify(validationErrors) ? validationErrors : prevErrors
    );
    TooltipsPopovers("error", "Please Fill All Required Fields", "Error");
    hideLoading();
  }
};
const handleCancel = () => {
    setOpen(false);
  };




















  return (
    <CenteredBox>

      <CenteredBoxInfo>

    <div className="RotationAddedPayment " >
       	<div className="TitleDiv">
            <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Follow Up Section:</b>  </Typography>
        </div>
       <div className="VisaLetter">
  			<Grid container spacing={1} sx={{ p: 1 }}>

        {CommonUserNotesData?.map((NotesObject, NotesIndex) => {
       		NotesIndexMain=NotesIndex;
       		console.log("NotesObject===>",NotesObject)
       		console.log("NotesIndex===>",NotesIndex)
       		const NotesDate = NotesObject?.NotesDate
      ? dayjs(new Date(NotesObject.NotesDate.seconds * 1000))
      : dayjs();
       		return (
       				<div className="RotationAddedPaymentBody" key={NotesIndex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Notes No:</b>  <font color="blue"><b>{NotesIndex+1}  By:{NotesObject?.AddedBy?.displayName || "N/A"}({NotesObject?.AddedBy?.id===ActualUser.id? "You": NotesObject?.AddedBy?.UserType || "N/A"})</b></font></Typography>
                	</Box>
            	</Grid>
            	{userData?.followback==="yes" && (
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeleteFollowup(NotesIndex)}
            >
              Delete Notes {NotesIndex+1}
            </Button>
                </Box>
                </Grid>
                )}
                 <Grid item xs={6} >
                 <div className="InputLabel"></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>

                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Notes Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={NotesDate}
        onChange={(event) => HandleCommonNotesSectionChange(event,'NotesDate',NotesIndex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.NotesObject?.NotesDate?.[NotesIndex] && <span className="validationerror">{errors.NotesObject?.NotesDate?.[NotesIndex]}</span>}
              </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Contact? </InputLabel>
                      <Select

                        required
                        value={NotesObject['NoteType'] || ''}
                        label='Type'
                        onChange={(event) => HandleCommonNotesSectionChange(event,'NoteType' ,NotesIndex)}
                      >
                        <MenuItem value='Meeting'>Team Member</MenuItem>
                        <MenuItem value='Mentor'>Mentor/Pannelist</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
					{NotesObject?.['NoteType']=="Meeting" && (
              <Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Team Member</div>
                <Select1
                value={NotesObject?.TeamMember}
        variant="outlined"
        options={AdminOptionsList}
        placeholder="Admin In Touch"
        onChange={(event) => HandleCommonNotesSectionChange(event,'TeamMember',NotesIndex)}
        isSearchable
        isMulti
      />
      	{errors.NotesObject?.TeamMember?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.TeamMember?.[NotesIndex] }</span>}
                </div>
               </Grid>
               )}
               {/*<Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Cross Sell</div>
                <Select1
                value={NotesObject?.CrossSell}
        variant="outlined"
        options={CrossSellList}
        placeholder="Cross Sell"
        onChange={(event) => HandleCommonNotesSectionChange(event,'CrossSell',NotesIndex)}
        isSearchable
        isMulti
      />
      	{errors.NotesObject?.TeamMember?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.TeamMember?.[NotesIndex] }</span>}
                </div>
               </Grid>*/}

               {/* <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Type </InputLabel>
                      <Select

                        required
                        value={NotesObject['NoteType'] || ''}
                        label='Type'
                        onChange={(event) => HandleCommonNotesSectionChange(event,'NoteType' ,NotesIndex)}
                      >
                        <MenuItem value='Meeting'>Meeting</MenuItem>
                        <MenuItem value='Touch Point'>Touch Point</MenuItem>
                        <MenuItem value='Team Update'>Team Update</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>*/}

                <Grid item xs={6}>
                <TextField
  					label="Notes"
  					multiline
  					variant="outlined"
  					fullWidth
  					value={NotesObject?.Notes}
  					onChange={(event) => HandleCommonNotesSectionChange(event,'Notes' ,NotesIndex)}
  					sx={{ my: 2 }}
  					InputProps={{
        sx: {
          '& textarea': {
            overflow: 'hidden', // Hide scrollbar
            minHeight: '50px', // Minimum height
            height: 'auto', // Auto height for growing
          },
        },
      }}
				/>
                  {errors.NotesObject?.Notes[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.Notes[NotesIndex] }</span>}
                </Grid>
				{/*<Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel >Action Items </InputLabel>
                      <Select
                        required
                        value={NotesObject['ActionItem'] || ''}
                        label='Action Items'
                        onChange={(event) => HandleCommonNotesSectionChange(event,'ActionItem' ,NotesIndex)}
                      >
                        <MenuItem value='For The Team'>For The Team</MenuItem>
                        <MenuItem value='For Student'>For Student</MenuItem>
                        <MenuItem value='For Both'>For Both</MenuItem>
                      </Select>
                      {errors.NotesObject?.['ActionItem']?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.['ActionItem']?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>*/}

          </Grid>
        </div>
      )})}
{userData?.followback==="yes" && (
<Grid container spacing={2} sx={{ p: 1 }}>

           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="warning"
              onClick={() => AddFollowup(followupindexLoop)}
            >
              Add Note
            </Button>
                </Box>
                </Grid>
                <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="success"
              onClick={() => SaveFollowups(followupindexLoop)}
            >
              Save Notes
            </Button>
                </Box>
                </Grid>
            </Grid>
)}

  			</Grid>
		</div>
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
	</div>





      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
