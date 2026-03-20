
import {
  Typography,
  CircularProgress,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  Select,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,IconButton
} from '@mui/material';
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
const DateFormatForAll="MM/DD/YYYY";
const followupindexLoop=0;
let NotesIndexMain=0;
const CrossSellList=[
{value:"match",label:"Match"},
{value:"rotation",label:"Rotation"},
{value:"research",label:"Research"}
]
const formatDate = (dateString) => dayjs(dateString).format('dddd, MMMM D, YYYY');

const CommonNotes = ({ ActualUser,NextFollowupChange,UserData,CommonUserNotesData,DeleteFollowup,SaveFollowups,AddFollowup,errors,AdminOptionsList,plan,HandleCommonNotesSectionChange }) => {

  return (
    <>
    <div className="RotationAddedPayment MatchPayment UserServices">
          <div className="TitleDiv">
            <Typography sx={{ flexGrow: 1, backgroundColor: '#b2f2d9', p: 1, borderRadius: 2 }}><b>Follow Up Status:</b></Typography>
          </div>
          <div className="">
           <div className="container">
    <div className="cards">
    <Grid container spacing={2} sx={{ p: 1 }}>
     <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Follow Up Required </InputLabel>
                      <Select

                        required
                        value={UserData['followuprequired'] || ''}
                        label='Type'
                        onChange={(event) => NextFollowupChange(event,'followuprequired' )}
                      >
                        <MenuItem value='no'>No</MenuItem>
                        <MenuItem value='yes'>Yes</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Alow Student To Follow Back </InputLabel>
                      <Select

                        required
                        value={UserData['followback'] || ''}
                        label='Type'
                        onChange={(event) => NextFollowupChange(event,'followback' )}
                      >
                        <MenuItem value='no'>No</MenuItem>
                        <MenuItem value='yes'>Yes</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
    <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>

                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Followup Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        value={UserData?.['followupdate'] ? dayjs(new Date(UserData['followupdate']?.seconds *1000)) : null}
        onChange={(event) => NextFollowupChange(event,'followupdate' )}
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
    </Grid>
    </div>
    </div>
    </div>
	</div>
    
    <div className="RotationAddedPayment MatchPayment UserServices">
          <div className="TitleDiv">
            <Typography sx={{ flexGrow: 1, backgroundColor: '#b2f2d9', p: 1, borderRadius: 2 }}><b>Common Notes:</b></Typography>
          </div>
          <div className="">
           <div className="container">
    <div className="cards">
    
  {CommonUserNotesData?.map((NotesObject, NotesIndex) => {
       		NotesIndexMain=NotesIndex;
       		const NotesDate = NotesObject?.NotesDate
      ? dayjs(new Date(NotesObject.NotesDate.seconds * 1000))
      : dayjs();
      if(NotesObject.NoteType!=="Questions")
      {
      	return (
       				<div className="RotationAddedPaymentBody" key={NotesIndex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Notes No:</b>  <font color="blue"><b>{NotesIndex+1}  By:{NotesObject?.AddedBy?.displayName || "N/A"}({NotesObject?.AddedBy?.id===ActualUser.id? "You": NotesObject?.AddedBy?.UserType || "N/A"})</b></font></Typography>
                	</Box>
            	</Grid>
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
               

                <Grid item xs={6}>
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
                        <MenuItem value='Mentor'>Mentor/Pannelist</MenuItem>
                        <MenuItem value='Cross Sell'>Cross Sell</MenuItem>
                      </Select>
                      {errors.NotesObject?.NoteType?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.NoteType?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
					{NotesObject?.['NoteType']=="Cross Sell" && (
					<>
					<Grid item xs={6}>
              <div className="">
                <div className="InputLabel">Cross Sell Value</div>
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
               </Grid>
               <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`label-${plan}`}>Cross Sell Status </InputLabel>
                      <Select

                        required
                        value={NotesObject['CrossSellStatus'] || ''}
                        label='Type'
                        onChange={(event) => HandleCommonNotesSectionChange(event,'CrossSellStatus' ,NotesIndex)}
                      >
                        <MenuItem value='interested'>Interested</MenuItem>
                        <MenuItem value='not interested'>Not Interested</MenuItem>
                        <MenuItem value='maybe'>Maybe</MenuItem>
                      </Select>
                      {errors.NotesObject?.CrossSellStatus?.[NotesIndex]  && <span className="validationerror">{errors.NotesObject?.CrossSellStatus?.[NotesIndex]}</span>}
                    </FormControl>
                  </Grid>
					
					</>
					)}
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
				<Grid item xs={6}>
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
                  </Grid>

          </Grid>
        </div>
      )
      }
      else
      {
      	return (
       				<div className="RotationAddedPaymentBody" key={NotesIndex}>
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>{NotesObject?.AddedBy?.UserType === "Student" ? "Question" : "Answer"} :</b>  <font color="blue"><b>  By:{NotesObject?.AddedBy?.displayName || "N/A"}({NotesObject?.AddedBy?.id===ActualUser.id? "You": NotesObject?.AddedBy?.UserType || "N/A"})</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
            	</Grid>
            	{/*userData?.followback==="yes" && (
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeleteFollowup(NotesIndex)}
            >
              Delete Question {NotesIndex+1}
            </Button>
                </Box>
                </Grid>
                )*/}
                 <Grid item xs={6}>
                    <FormControl fullWidth>
                      <div className="InputLabel">Regarding</div>
                      <Select
						disabled={NotesObject?.id?true:false}
                        required
                        value={NotesObject['NoteRegarding'] || ''}
                        label='Type'
                        onChange={(event) => HandleCommonNotesSectionChange(event,'NoteRegarding' ,NotesIndex)}
                      >
                        <MenuItem value='Rotation'>Rotation</MenuItem>
                        <MenuItem value='Match'>Match</MenuItem>
                        <MenuItem value='Research'>Research</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                 <Grid item xs={6} >
                 <div className="InputLabel"></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>

                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Dated:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}>{NotesDate.format('MMM D, YYYY')}</Typography>
                </Box>
              </Grid>

				

                <Grid item xs={12}>
                <input type="hidden" value={NotesObject.NoteType} name="hiddenNotes" />
                <TextField
  					label="Question"
  					multiline
  					variant="outlined"
  					disabled={NotesObject?.id?true:false}
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

          </Grid>
        </div>
      )
      }
       		
      }
      )}
      
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
            
             
      </div>
  </div>
        </div>
    </div>
    </>
  );
};

export default CommonNotes;
