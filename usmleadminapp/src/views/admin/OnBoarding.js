import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
const dateFormat="MM/DD/YYYY";
const OnBoardingHtml = ({ MatchValues, HandleOnBoardingChange, errors}) => (





  <Grid container spacing={2}>
   <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>On Boarding Email Sent</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['OnBoardingEmailSent'] ?? 'no'}
                    label="Orientation Meet With Pawan"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'OnBoardingEmailSent',true)}
                  >
                    <MenuItem value='yes'>Yes</MenuItem>
                    <MenuItem value='no'>No</MenuItem>
                  </Select>
                  {errors.OrientationMeetWithPawan && <span class="validationerror">{errors.OrientationMeetWithPawan}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div id="plan-label">Kind of Student</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['Onboard_kindofstudent']?.['Value'] ?? ''}
                    label="Kind of Student"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'Onboard_kindofstudent',true)}
                  >
                    <MenuItem value='needy'>Needy</MenuItem>
                    <MenuItem value='self-sufficient'>Self-sufficient</MenuItem>
                    <MenuItem value='normal'>Normal</MenuItem>
                  </Select>
                  {errors.Onboard_kindofstudent && <span class="validationerror">{errors.Onboard_kindofstudent}</span>}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
              <div >Notes Regarding Kind Of Student</div>
                  <TextField
        
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['Onboard_kindofstudentnotes']}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'Onboard_kindofstudentnotes',false)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Onboard_kindofstudentnotes  && <span class="validationerror">{errors.Onboard_kindofstudentnotes }</span>}
                </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                   <div>Email & WhatsApp Instructions</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['EmailWhatsAppInstructions']?.['Value'] ?? ''}
                    label="Email & WhatsApp Instructions"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'EmailWhatsAppInstructions',true)}
                  >
                    <MenuItem value='Sent'>Sent</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.EmailWhatsAppInstructions && <span class="validationerror">{errors.EmailWhatsAppInstructions}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['EmailWhatsAppInstructions']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Email & WhatsApp Instructions Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['EmailWhatsAppInstructions']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'EmailWhatsAppInstructions',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.EmailWhatsAppInstructionsCustom  && <span class="validationerror">{errors.EmailWhatsAppInstructionsCustom }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>Google Classroom Invitation</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['GoogleClassroomInvitation']?.['Value'] ?? ''}
                    label="Google Classroom Invitation"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'GoogleClassroomInvitation',true)}
                  >
                    <MenuItem value='Sent'>Sent</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.GoogleClassroomInvitation && <span class="validationerror">{errors.GoogleClassroomInvitation}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['GoogleClassroomInvitation']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Google Classroom Invitation Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['GoogleClassroomInvitation']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'GoogleClassroomInvitation',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.GoogleClassroomInvitationCustom  && <span class="validationerror">{errors.GoogleClassroomInvitationCustom }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>Residency Match Website Access</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] ?? ''}
                    label="Residency Match Website Access"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'ResidencyMatchWebsiteAccess',true)}
                  >
                    <MenuItem value='Activated'>Activated</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.ResidencyMatchWebsiteAccess && <span class="validationerror">{errors.ResidencyMatchWebsiteAccess}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Residency Match Website Access Custom</div>
                  <TextField
                    label="Residency Match Website Access Custom"
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Relation']?.['Other']}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'ResidencyMatchWebsiteAccess',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.GoogleClassroomInvitationCustom  && <span class="validationerror">{errors.GoogleClassroomInvitationCustom }</span>}
                </Grid>
              )}
              {MatchValues['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Value'] === 'Activated' && (
               <Grid item xs={6}>
                <FormControl fullWidth>
                   <div>Profile Status</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['ResidencyMatchWebsiteAccess']?.['Relation']?.['ProfileStatus'] ?? ''}
                    label="Profile Status"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'ResidencyMatchWebsiteAccess',true,"ProfileStatus")}
                  >
                    <MenuItem value='Profile Filled'>Profile Filled</MenuItem>
                    <MenuItem value='Profile Not Filled'>Profile Not Filled</MenuItem>
                  </Select>
                  {errors.ResidencyMatchWebsiteAccessProfileStatus && <span class="validationerror">{errors.ResidencyMatchWebsiteAccessProfileStatus}</span>}
                </FormControl>
              </Grid>
              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>Matchflix Access</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['MatchflixAccess']?.['Value'] ?? ''}
                    label="Matchflix Access"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'MatchflixAccess',true)}
                  >
                    <MenuItem value='Activated'>Activated</MenuItem>
                    <MenuItem value='Account Not Created'>Account Not Created</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.MatchflixAccess && <span class="validationerror">{errors.MatchflixAccess}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['MatchflixAccess']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Matchflix Access Custom</div>
                  <TextField
                    label="Matchflix Access Custom"
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['MatchflixAccess']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'MatchflixAccess',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.MatchflixAccessCustom  && <span class="validationerror">{errors.MatchflixAccessCustom }</span>}
                </Grid>
              )}
               <Grid item xs={6}>
                <FormControl fullWidth>
                   <div>Contract</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['Contract']?.['Value'] ?? ''}
                    label="Contract"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'Contract',true)}
                  >
                    <MenuItem value='Sent & Signed'>Sent & Signed</MenuItem>
                    <MenuItem value='Sent but not Signed'>Sent but not Signed</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.Contract && <span class="validationerror">{errors.Contract}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['Contract']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                 <div>Contract Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['Contract']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'Contract',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ContractCustom  && <span class="validationerror">{errors.ContractCustom }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>Closed Telegram Group</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['ClosedTelegramGroup']?.['Value'] ?? ''}
                    label="Closed Telegram Group"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'ClosedTelegramGroup',true)}
                  >
                    <MenuItem value='Joined'>Joined</MenuItem>
                    <MenuItem value='Link Sent but not Joined'>Link Sent but not Joined</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.ClosedTelegramGroup && <span class="validationerror">{errors.ClosedTelegramGroup}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['ClosedTelegramGroup']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Closed Telegram Group Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['ClosedTelegramGroup']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'ClosedTelegramGroup',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.ClosedTelegramGroupCustom  && <span class="validationerror">{errors.ClosedTelegramGroupCustom }</span>}
                </Grid>
              )}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <div>Plan Specific Telegram Group</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Value'] ?? ''}
                    label="Plan Specific Telegram Group"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'PlanSpecificTelegramGroup',true)}
                  >
                    <MenuItem value='Joined'>Joined</MenuItem>
                    <MenuItem value='Link Sent but not Joined'>Link Sent but not Joined</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.PlanSpecificTelegramGroup && <span class="validationerror">{errors.PlanSpecificTelegramGroup}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Plan Specific Telegram Group Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['PlanSpecificTelegramGroup']?.['Relation']?.['Other'] ?? ''}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'PlanSpecificTelegramGroup',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.PlanSpecificTelegramGroupCustom  && <span class="validationerror">{errors.PlanSpecificTelegramGroupCustom }</span>}
                </Grid>
              )}
               <Grid item xs={6}>
                <FormControl fullWidth>
                <div>Orientation Meet With Admin Team</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] ?? ''}
                    label="Orientation Meet With Admin Team"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithAdminTeam',true)}
                  >
                    <MenuItem value='Completed'>Completed</MenuItem>
                    <MenuItem value='Scheduled'>Scheduled</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.OrientationMeetWithAdminTeam && <span class="validationerror">{errors.OrientationMeetWithAdminTeam}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Orientation Meet With Admin Team Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Other']}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithAdminTeam',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.OrientationMeetWithAdminTeamCustom  && <span class="validationerror">{errors.OrientationMeetWithAdminTeamCustom }</span>}
                </Grid>
              )}
              {(MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Completed' || MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Value'] === 'Scheduled') && (
                <Grid item xs={6} >
                {console.log("=======>",MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation'])}
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Orientation Meet with Admin Team Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date']? typeof MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date']==="string"?dayjs(MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date'].toLocaleString()):dayjs(new Date(MatchValues['OnBoarding']?.['OrientationMeetWithAdminTeam']?.['Relation']?.['Date']?.seconds*1000)).format(dateFormat):null}
        onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithAdminTeam',true,"Date")}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
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
                  <div>Orientation Meet With Pawan</div>
                  <Select
                    value={MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] ?? ''}
                    label="Orientation Meet With Pawan"
                    required
                    onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithPawan',true)}
                  >
                    <MenuItem value='Completed'>Completed</MenuItem>
                    <MenuItem value='Scheduled'>Scheduled</MenuItem>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                  {errors.OrientationMeetWithPawan && <span class="validationerror">{errors.OrientationMeetWithPawan}</span>}
                </FormControl>
              </Grid>
              {MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Other' && (
                <Grid item xs={6}>
                <div>Orientation Meet With Pawan Custom</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Other']}
                    required
                   	onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithPawan',true,"Other")}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.OrientationMeetWithPawanCustom  && <span class="validationerror">{errors.OrientationMeetWithPawanCustom }</span>}
                </Grid>
              )}
              {(MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Completed' || MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Value'] === 'Scheduled') && (
                <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Orientation Meet With Pawan Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
       defaultValue={
      MatchValues?.['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Date']
        ? dayjs(MatchValues['OnBoarding']?.['OrientationMeetWithPawan']?.['Relation']?.['Date'])
        : null
    }
        onChange={(event) => HandleOnBoardingChange(event,'OrientationMeetWithPawan',true,"Date")}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Orientation Meet With Pawan Date"
  		variant="outlined"
  		zIndexPopup="1400"
  		dropdownClassName="custom-datepicker-dropdown"

      /></Typography>
                </Box>
                {errors.OrientationMeetWithPawanDate && <span class="validationerror">{errors.OrientationMeetWithPawanDate}</span>}
              </Grid>
              )}
              </Grid>
);

export default OnBoardingHtml;
