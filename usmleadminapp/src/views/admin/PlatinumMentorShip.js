import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import Select1 from 'react-select';

const PlatinumMentorShip = ({ ListOfPanelists,MatchPlanListObject, MatchValues, HandlePlatinumChange, HandlePlatinumMeetingsChange, errors, plan, DeleteMeetings, AddMeetings }) => {
  let lastRotationIndex = 0;
/*const panelistOptions = Object.entries(ListOfPanelists).map(([email, objec]) => ({
  value: objec.email,
  label: objec.displayName+"("+objec.email+")"

}));*/
const mappedPanelists = Object.entries(ListOfPanelists).map(([email, objec]) => ({
  value: objec.email,
  label: objec.displayName + " (" + objec.email + ")"
}));

const panelistOptionsOriginal = mappedPanelists;

const panelistOptions = [
  { value: "", label: "No Mentor" },
  ...mappedPanelists,
  { value: "changed", label: "Mentor Changed" }
];
  const renderMeetings = () => {
    const meetings = MatchValues?.Platinum?.Meetings || {};
	return Object.entries(meetings).map(([meetingKey, MeetingsObj], Paymentindex) => 
	{
    	lastRotationIndex = Paymentindex;
      return (
        <div key={Paymentindex} className="PlatinumAddedMeetings">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                  <b>Meeting No:</b> <font color="blue"><b>{Paymentindex + 1}</b></font>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                <Button variant="contained" color="primary" onClick={() => DeleteMeetings(Paymentindex)}>
                  Delete Meeting {Paymentindex + 1}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="meeting-label">Meeting With Mentor</InputLabel>
                <Select
                  value={MeetingsObj.MeetingWithPhysicianMentor?.['Value']}
                  label="Meeting With Physician Mentor"
                  required
                  onChange={(event) => HandlePlatinumMeetingsChange(event, 'MeetingWithPhysicianMentor', true, '',Paymentindex)}
                >
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Notes">Notes</MenuItem>
                </Select>
                {errors.MeetingWithPhysicianMentor && <span className="validationerror">{errors.MeetingWithPhysicianMentor}</span>}
              </FormControl>
            </Grid>
            <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Meeting Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={
  MeetingsObj?.MeetingWithPhysicianMentor?.Relation?.MeetingDate
    ? (
        typeof MeetingsObj.MeetingWithPhysicianMentor.Relation.MeetingDate === "string"
          ? dayjs(MeetingsObj.MeetingWithPhysicianMentor.Relation.MeetingDate)
          : dayjs(
              MeetingsObj.MeetingWithPhysicianMentor.Relation.MeetingDate.toDate()
            )
      )
    : null
}
        onChange={(event) => HandlePlatinumMeetingsChange(event,'MeetingWithPhysicianMentor',true,"MeetingDate",Paymentindex)}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Meeting Date"
  		variant="outlined"
  		zIndexPopup="1400"
  		dropdownClassName="custom-datepicker-dropdown"

      /></Typography>
                </Box>
                {errors.OrientationMeetWithAdminTeamDate && <span class="validationerror">{errors.OrientationMeetWithAdminTeamDate}</span>}
              </Grid>
               <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="meeting-label">Need Notify</InputLabel>
                <Select
                  value={MeetingsObj.MeetingNotify || 'no'}
                  label="Need Notify"
                  required
                  onChange={(event) => HandlePlatinumMeetingsChange(event, 'MeetingNotify', false, '',Paymentindex)}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
                {errors.MeetingNotify && <span className="validationerror">{errors.MeetingNotify}</span>}
              </FormControl>
            </Grid>
            {MeetingsObj.MeetingNotify === 'yes' && (
            <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Next Notify Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
    
defaultValue={
  MeetingsObj?.MeetingNextNotifyDate
    ? (
        typeof MeetingsObj.MeetingNextNotifyDate?.toDate === "function"
          ? dayjs(MeetingsObj.MeetingNextNotifyDate.toDate())
          : dayjs(MeetingsObj.MeetingNextNotifyDate)
      )
    : null
}
        onChange={(event) => HandlePlatinumMeetingsChange(event,'MeetingNextNotifyDate',false,"",Paymentindex)}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Next Notify Date"
  		variant="outlined"
  		zIndexPopup="1400"
  		dropdownClassName="custom-datepicker-dropdown"

      /></Typography>
                </Box>
                {errors.OrientationMeetWithAdminTeamDate && <span class="validationerror">{errors.OrientationMeetWithAdminTeamDate}</span>}
              </Grid>
            )}
             <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="meeting-label">Meeting Duration</InputLabel>
                <Select
                  value={MeetingsObj.MeetingWithPhysicianMentorDuration?.['Value']}
                  label="Meeting With Mentor"
                  required
                  onChange={(event) => HandlePlatinumMeetingsChange(event, 'MeetingWithPhysicianMentorDuration', true, '',Paymentindex)}
                >
                  <MenuItem value="30">30 Minutes Approx</MenuItem>
                  <MenuItem value="60">60 Minutes Approx</MenuItem>
                </Select>
                {errors.MeetingWithPhysicianMentorDuration && <span className="validationerror">{errors.MeetingWithPhysicianMentorDuration}</span>}
              </FormControl>
            </Grid>
            {MeetingsObj.MeetingWithPhysicianMentor?.['Value'] === 'Completed' && (
            <>
              <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Completion Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MeetingsObj?.MeetingWithPhysicianMentor?.['Relation']?.['CompletionDate']?dayjs(MeetingsObj?.MeetingWithPhysicianMentor?.['Relation']?.['CompletionDate']):null}
        onChange={(event) => HandlePlatinumMeetingsChange(event,'MeetingWithPhysicianMentor',true,"CompletionDate",Paymentindex)}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Completion Date"
  		variant="outlined"
  		zIndexPopup="1400"
  		dropdownClassName="custom-datepicker-dropdown"

      /></Typography>
                </Box>
                {errors.OrientationMeetWithAdminTeamDate && <span class="validationerror">{errors.OrientationMeetWithAdminTeamDate}</span>}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Counted For Finance"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  value={MeetingsObj?.MeetingWithPhysicianMentor?.Relation?.CountedForFinance ?? ''}
                  required
                  onChange={(event) =>HandlePlatinumMeetingsChange(event,'MeetingWithPhysicianMentor',true,'CountedForFinance',Paymentindex)}
                  sx={{ my: 0, mb: '4px'}}
                  />
                {errors.MeetingWithPhysicianMentorCountedForFinance && <span className="validationerror">{errors.MeetingWithPhysicianMentorCountedForFinance}</span>}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Topic Discussed"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  value={MeetingsObj?.MeetingWithPhysicianMentor?.['Relation']?.['TopicDiscussed']}
                  required
                  onChange={(event) => HandlePlatinumMeetingsChange(event,'MeetingWithPhysicianMentor',true,"TopicDiscussed",Paymentindex)}
                  sx={{ my: 0, mb: '4px'}}
                  />
                {errors.MeetingWithPhysicianMentorTopicDiscussed && <span className="validationerror">{errors.MeetingWithPhysicianMentorTopicDiscussed}</span>}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Completion Notes"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  value={MeetingsObj?.MeetingWithPhysicianMentor?.['Relation']?.['CompletionNotes']}
                  required
                  onChange={(event) => HandlePlatinumMeetingsChange(event,'MeetingWithPhysicianMentor',true,"CompletionNotes",Paymentindex)}
                  sx={{ my: 0, mb: '4px'}}
                  />
                {errors.MeetingWithPhysicianMentorCompletionNotes && <span className="validationerror">{errors.MeetingWithPhysicianMentorCompletionNotes}</span>}
              </Grid>
            </>
            )}
          </Grid>
        </div>
      );
    });
  };

  return (
    <>
      {(MatchPlanListObject?.[plan]?.MentorRequired === 'mentors') && (
        <div className="RotationAddedPayment MatchPayment">
          <div className="TitleDiv">
            <Typography sx={{ flexGrow: 1, backgroundColor: '#b2f2d9', p: 1, borderRadius: 2 }}><b>Platinum Details:</b></Typography>
          </div>
          <div className="PlatinumAddedPaymentBody">
            <Grid container spacing={2}>
             { /*<Grid item xs={6}>
                <TextField
                  label="Assigned Mentor"
                  variant="outlined"
                  fullWidth
                  value={MatchValues['Platinum']?.['AssignedMentor']}
                  required
                  onChange={(event) => HandlePlatinumChange(event, 'AssignedMentor')}
                  sx={{ my: 0, 'margin-bottom': '4px' }}
                />
                {errors.EmailWhatsAppInstructionsCustom && <span className="validationerror">{errors.EmailWhatsAppInstructionsCustom}</span>}
              </Grid>*/}
               <Grid item xs={6}>
              <FormControl fullWidth>
                <Select1
                styles={{
    control: (base) => ({
      ...base,
      backgroundColor: 'none', // Example inline background
      borderColor: '#ccc',
      boxShadow: 'none',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999 // To avoid dropdown clipping
    })
  }}
           
                value={MatchValues['Platinum']?.['AssignedMentor']}

        options={panelistOptions}
        placeholder="Assigned Mentor"
        onChange={(event) => HandlePlatinumChange(event, 'AssignedMentor')}
        isSearchable
        //isMulti
      />
      	 {errors.EmailWhatsAppInstructionsCustom && <span className="validationerror">{errors.EmailWhatsAppInstructionsCustom}</span>}
                 </FormControl>
               </Grid>
               {MatchValues['Platinum']?.['AssignedMentor']?.value==="changed" &&(
               <>
               <Grid item xs={6}>
              <FormControl fullWidth>
                <Select1
                styles={{
    control: (base) => ({
      ...base,
      backgroundColor: 'none', // Example inline background
      borderColor: '#ccc',
      boxShadow: 'none',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999 // To avoid dropdown clipping
    })
  }}
           
                value={MatchValues['Platinum']?.['ChangedFromAssignedMentor']}

        options={panelistOptionsOriginal}
        placeholder="Changed From Mentor"
        onChange={(event) => HandlePlatinumChange(event, 'ChangedFromAssignedMentor')}
        isSearchable
        //isMulti
      />
      	 {errors.EmailWhatsAppInstructionsCustom && <span className="validationerror">{errors.EmailWhatsAppInstructionsCustom}</span>}
                 </FormControl>
               </Grid>
               <Grid item xs={6}>
              <FormControl fullWidth>
                <Select1
                styles={{
    control: (base) => ({
      ...base,
      backgroundColor: 'none', // Example inline background
      borderColor: '#ccc',
      boxShadow: 'none',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999 // To avoid dropdown clipping
    })
  }}
           
                value={MatchValues['Platinum']?.['ChangedToAssignedMentor']}

        options={panelistOptionsOriginal}
        placeholder="Changed To Mentor"
        onChange={(event) => HandlePlatinumChange(event, 'ChangedToAssignedMentor')}
        isSearchable
        //isMulti
      />
      	 {errors.EmailWhatsAppInstructionsCustom && <span className="validationerror">{errors.EmailWhatsAppInstructionsCustom}</span>}
                 </FormControl>
               </Grid>
               <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1, border: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, p: 1, borderRadius: 1 }}>Date Of Mentor Changed:</Typography>
                  <Typography variant="body1" sx={{ p: 1, borderRadius: 1 }}>
                    <DatePicker
                      defaultValue={MatchValues['Platinum']?.['DateOfMentorChanged'] ? dayjs(MatchValues['Platinum']?.['DateOfMentorChanged']) : null}
                      onChange={(event) => HandlePlatinumChange(event, 'DateOfMentorChanged')}
                      dateFormat="dd/mm/yyyy"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={50}
                      picker="date"
                      label="Date Of Mentor Changed"
                      variant="outlined"
                    />
                  </Typography>
                </Box>
                {errors.EnrollmentDate && <span className="validationerror">{errors.EnrollmentDate}</span>}
              </Grid>
               </>
               )}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1, border: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, p: 1, borderRadius: 1 }}>Date Of Mentor Assigned:</Typography>
                  <Typography variant="body1" sx={{ p: 1, borderRadius: 1 }}>
                    <DatePicker
                      defaultValue={MatchValues['Platinum']?.['DateOfMentorAssigned'] ? dayjs(MatchValues['Platinum']?.['DateOfMentorAssigned']) : null}
                      onChange={(event) => HandlePlatinumChange(event, 'DateOfMentorAssigned')}
                      dateFormat="dd/mm/yyyy"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={50}
                      picker="date"
                      label="Date Of Mentor Assigned"
                      variant="outlined"
                    />
                  </Typography>
                </Box>
                {errors.EnrollmentDate && <span className="validationerror">{errors.EnrollmentDate}</span>}
              </Grid>
              <Grid item xs={6}>
                <TextField
                    label="Match Plan Document"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={2}
                    value={MatchValues['Platinum']?.['MatchPlanDocument']}
                    required
                    onChange={(event) => HandlePlatinumChange(event, 'MatchPlanDocument',false)}
                    sx={{ my: 0, mb: '4px'}}
                    />
                {errors.MatchPlanDocument && <span className="validationerror">{errors.MatchPlanDocument}</span>}
              </Grid>
              <div className="RotationAddedPayment PlatinumMeetings">
                <div className="TitleDiv">
                  <Typography sx={{ flexGrow: 1, backgroundColor: '#b2f2d9', p: 1, borderRadius: 2 }}><b>Meetings Details:</b></Typography>
                </div>
                {renderMeetings()}
                <div className="AddPaymentButton">
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                      <Button variant="contained" color="warning" onClick={() => AddMeetings(lastRotationIndex + 1)}>
                        Add Meeting
                      </Button>
                    </Box>
                  </Grid>
                </div>
              </div>
            </Grid>
          </div>
        </div>
      )}
    </>
  );
};

export default PlatinumMentorShip;