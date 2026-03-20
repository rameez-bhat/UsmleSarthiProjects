import { Typography } from '@mui/material';
import {Grid,Box,Button,FormControl,InputLabel,Select,MenuItem,TextField} from '@mui/material';
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
let lastRotationIndex=-1;
let lastPaymentIndex = 0;

const Research = ({ researchValues,setresearchValues,AddResearch,DeleteResearch,handleResearchChange,DeletePayment,PaymentOptionsList,AddRotationPayment,handleUpdateResearch,errors,RotationReview }) => {
console.log("====================")
const dateFormat="MM/DD/YYYY";
  return (
    <>
    <div class="mainDiv">
        <div class="RotationAdded">
        	<div class="TitleDiv">
                <Typography  sx={{ flexGrow: 1, backgroundColor: '#1976d2', p: 1, borderRadius: 2 }}><b>Research Details:</b>  </Typography>
            </div>
{researchValues['Research']?.map((research, index) => {
                lastRotationIndex=index
                console.log("index---->",index)
                lastPaymentIndex = 0;
                const publicationOptions = research?.['CourseName'] === "C2P Course"
  ? [
      { key: "Manuscript", value: "Manuscript" },
      { key: "Abstract", value: "Abstract" },
      { key: "Triple Play 1M2A", value: "Triple Play 1M2A" },
      { key: "Triple Play 2M1A", value: "Triple Play 2M1A" },
      { key: "Triple Play 3M", value: "Triple Play 3M" },
      { key: "Triple Play 3A", value: "Triple Play 3A" },
      { key: "Other", value: "Other" },
    ]
  : [
      { key: "Course A (none)", value: "Course A (none)" },
      { key: "Course B (article)", value: "Course B (article)" },
      { key: "Course C (Letter to Editor)", value: "Course C (Letter to Editor)" },
      { key: "Combo 2 (article+LTE)", value: "Combo 2 (article+LTE)" },
      { key: "Combo 2B (2 articles)", value: "Combo 2B (2 articles)" },
      { key: "Combo 3 (2 articles+LTE)", value: "Combo 3 (2 articles+LTE)" },
      { key: "Combo 3B (3 articles)", value: "Combo 3B (3 articles)" },
      { key: "Combo 5B (5 articles)", value: "Combo 5B (5 articles)" },
      { key: "Other", value: "Other" },
    ];
                return (
            <div class="RotationInner">
                <Grid container spacing={2} sx={{ p: 1 }} >
                <Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Research No:</b>  <font color="blue"><b>{index+1}</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeleteResearch(index,0,"Match")}
            >
              Delete
            </Button>
                </Box>
                </Grid>
                	<Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Enrollment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={research['EnrollmentDate']?dayjs(research['EnrollmentDate'].toDate().toISOString()):null}
        onChange={(event) => handleResearchChange(event,'EnrollmentDate','',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        showYearDropdown  // Enable year dropdown
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Enrollment Date"
  		variant="outlined"
  		name={`EnrollmentDate`}
      /></Typography>
                </Box>
                {errors.EnrollmentDate?.[index] && <span class="validationerror">{errors.EnrollmentDate?.[index]}</span>}
              </Grid>
               <Grid item xs={6} >
                  <FormControl fullWidth>
                    <InputLabel >Course Name</InputLabel>
                    <Select

                      value={research['CourseName'] || ''}
                      label='Course Name'
                      required
                      onChange={(event) => handleResearchChange(event,'CourseName','',index )}
                      //renderValue={(selected) => selected.join(', ')}
                    >
                       <MenuItem key="IRC Course" value="IRC Course">
                        IRC Course
                        </MenuItem>
                         <MenuItem key="C2P Course" value="C2P Course">
                           C2P Course
                        </MenuItem>
                         <MenuItem key="RAR Course" value="RAR Course">
                           RAR Course
                        </MenuItem>
                        <MenuItem key="CIBNP" value="CIBNP">
                           CIBNP
                        </MenuItem>
                    </Select>
                    {errors.CourseName?.[index] && <span class="validationerror">{errors.CourseName?.[index]}</span>}
                  </FormControl>
                </Grid>
                {(research?.['CourseName']==="C2P Course" || research?.['CourseName']==="RAR Course")  && (
                <>
                <Grid item xs={6} check={research?.['CourseName']}>
              <TextField
                label="Research Topic"
                variant="outlined"
                checkink={research?.['CourseName']}
                fullWidth
                value={research['Topic'] || ''} // Provide default value
                required
                onChange={(event) => handleResearchChange(event, 'Topic','',index)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.Topic?.[index] && <span className="validationerror">{errors.Topic?.[index]}</span>}
            </Grid>
            <Grid item xs={6}>
    <FormControl fullWidth>
      <InputLabel>Publication Type</InputLabel>
      <Select
        value={research['PublicationType'] || ''}
        label="Publication Type"
        required
        onChange={(event) => handleResearchChange(event, 'PublicationType', '', index)}
      >
      	 <MenuItem key="" value="">
            =Select=
          </MenuItem>
        {publicationOptions.map(option => (
          <MenuItem key={option.key} value={option.value}>
            {option.value}
          </MenuItem>
        ))}
      </Select>
      {errors.PublicationType?.[index] && (
        <span className="validationerror">{errors.PublicationType[index]}</span>
      )}
    </FormControl>
  </Grid>
                </>
                )}
            	<Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Start Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={research['StartDate']?dayjs(research['StartDate'].toDate().toISOString()):null}
        onChange={(event) => handleResearchChange(event,'StartDate','',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        showYearDropdown  // Enable year dropdown
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Start Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.StartDate?.[index] && <span class="validationerror">{errors.StartDate?.[index]}</span>}
              </Grid>

                <Grid item xs={6} >
                  <FormControl fullWidth>
                    <InputLabel >Research Status</InputLabel>
                    <Select

                      value={research['ResearchStatus'] || ''}
                      label='Research Status'
                      required
                      onChange={(event) => handleResearchChange(event,'ResearchStatus','',index )}
                      //renderValue={(selected) => selected.join(', ')}
                    >

                       <MenuItem key="Completed" value="Completed">
                        Completed
                        </MenuItem>
                         <MenuItem key="Published" value="Published">
                           Published
                        </MenuItem>
                        <MenuItem key="Under Peer Review" value="Under Peer Review">
                           Under Peer Review
                        </MenuItem>
                        <MenuItem key="Not Completed" value="Not Completed">
                           Not Completed
                        </MenuItem>
                        <MenuItem key="Presented" value="Presented">
                           Presented
                        </MenuItem>
                    </Select>
                    {errors.ResearchStatus?.[index] && <span class="validationerror">{errors.ResearchStatus?.[index]}</span>}
                  </FormControl>
                </Grid>
        		{(research['ResearchStatus'] === 'Completed' || research['ResearchStatus'] === 'Published') && (
       <Grid item xs={6}>
       <div class="InputLabel">Research Review</div>
                <Select1
        value={research['ResearchReview']}
        onChange={(event) => handleResearchChange(event,'ResearchReview','',index )}
        variant="outlined"
        placeholder="Research Review"
        label="Research Review"
        options={RotationReview}
        isSearchable
      	/>
      	 {errors.ResearchReview?.[index]  && <span class="validationerror">{errors.ResearchReview?.[index] }</span>}
       </Grid>
       )}
       <Grid item xs={6}>
              <TextField
                label="General Notes"
                variant="outlined"
                multiline
                rows={4}
                name="DiscountNote"
                fullWidth
                value={research['ResearchNotesGeneral'] || ''} // Provide default value
                required
                onChange={(event) => handleResearchChange(event,'ResearchNotesGeneral','',index )}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
            	 </Grid>
       <Grid item xs={6} >
       <div class="InputLabel"></div>
                  <FormControl fullWidth>

                    <InputLabel >Payment transferred to Physician</InputLabel>
                    <Select

                      value={research['PhysicianPaid'] || ''}
                      label='Payment transferred to Physician'
                      required
                      onChange={(event) => handleResearchChange(event,'PhysicianPaid','',index )}
                      //renderValue={(selected) => selected.join(', ')}
                    >

                       <MenuItem key="Yes" value="Yes">
                        Yes
                        </MenuItem>
                         <MenuItem key="No" value="No">
                           No
                        </MenuItem>

                    </Select>
                    {errors.PhysicianPaid?.[index] && <span class="validationerror">{errors.PhysicianPaid?.[index]}</span>}
                  </FormControl>
                </Grid>
        		<div class="RotationAddedPayment MatchPayment" >
       			<div class="TitleDiv">
                  <Typography  sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}><b>Payment Details:</b>  </Typography>
                </div>
       		{research?.['Payments']?.map((MpaymentObject, MPaymentindex) => {
       		return (
       				<div class="RotationAddedPaymentBody">
                	<Grid container spacing={2} sx={{ p: 1 }}>


                	<Grid item xs={6}>
                      <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  		<Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}><b>Payment No:</b>  <font color="blue"><b>{MPaymentindex+1}</b></font></Typography>
                	</Box>
            	</Grid>
            	<Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => DeletePayment(MPaymentindex,index,"Research")}
            >
              Delete Payment {MPaymentindex+1}
            </Button>
                </Box>
                </Grid>
                <Grid item xs={6}>

     <FormControl fullWidth>
     <InputLabel >Fee Type</InputLabel>
     <Select

                    name="FeeType"
                    value={MpaymentObject['FeeType']}
                    label="Fees Type"
                    required
                    onChange={(event) => handleResearchChange(event,'FeeType','',index,MPaymentindex)}
                  >
                      <MenuItem key="--select--" value="">
                        -Select-
                      </MenuItem>
                      <MenuItem key="application fee" value="application fee">
                        Application Fee
                      </MenuItem>
                      <MenuItem key="fee installment" value="fee installment">
                        Fee Installment
                      </MenuItem>
                       <MenuItem key="full installment" value="full payment">
                        Full Payment
                      </MenuItem>
                      <MenuItem key="b2r payment" value="b2r payment">
                        B2R Payment
                      </MenuItem>
                      <MenuItem key="hackensack combo" value="hackensack combo">
                        Hackensack Combo
                      </MenuItem>
                      </Select>
                      {errors.FeeType?.[index]?.[MPaymentindex]  && <span class="validationerror">{errors.FeeType?.[index]?.[MPaymentindex] }</span>}
                    </FormControl>

       </Grid>
                <Grid item xs={6} >
                    <FormControl fullWidth>
                      <InputLabel >Mode Of Payment</InputLabel>
                      <Select
                        required
                        value={MpaymentObject['ModeOfPayment'] || ''}
                        label='Mode Of Payment'
                        onChange={(event) => handleResearchChange(event,'ModeOfPayment','' ,index,MPaymentindex)}
                      >
                        {Object.entries(PaymentOptionsList).map(([subKey, subValue]) => (
                          <MenuItem key={subValue.label} value={subValue.label}>
                            {subValue.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ModeOfPayment?.[index]?.[MPaymentindex]  && <span class="validationerror">{errors.ModeOfPayment?.[index]?.[MPaymentindex]}</span>}
                    </FormControl>
                  </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Payment Amount"
                    variant="outlined"
                    fullWidth
                    value={MpaymentObject['Amount']}
                    required
                    onChange={(event) => handleResearchChange(event,'Amount',"",index,MPaymentindex)}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.Amount?.[index]?.[MPaymentindex]  && <span class="validationerror">{errors.Amount?.[index]?.[MPaymentindex] }</span>}
                </Grid>
                <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MpaymentObject.PaymentDate?dayjs(MpaymentObject.PaymentDate.toDate().toISOString()):null}
        //defaultValue={MpaymentObject?.PaymentDate ? typeof MpaymentObject.PaymentDate==="string"? dayjs(MpaymentObject.PaymentDate.toDate().toLocaleString()):dayjs(new Date(MpaymentObject?.PaymentDate?.seconds*1000)).format(dateFormat) : null}
        //defaultkkkValue={MpaymentObject?.PaymentDate ? typeof MpaymentObject.PaymentDate==="string"? MpaymentObject.PaymentDate.toDate().toLocaleString():MpaymentObject?.PaymentDate?.seconds : null}
        onChange={(event) => handleResearchChange(event,'PaymentDate','',index,MPaymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Payment Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[MPaymentindex] && <span class="validationerror">{errors.PaymentDate?.[index]?.[MPaymentindex]}</span>}
              </Grid>
              <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Payment Added On:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
  defaultValue={
    MpaymentObject['PaymentActualAddedDate']
      ? dayjs(MpaymentObject['PaymentActualAddedDate'].toDate().toISOString())
      : dayjs() // Default to today
  }
  onChange={(event) => handleResearchChange(event, 'PaymentActualAddedDate','', index, MPaymentindex)}
  dateFormat="dd/mm/yyyy"
  scrollableYearDropdown
  disabled
  yearDropdownItemNumber={50}
  picker="date"
  label="Payment Added On"
  variant="outlined"
/></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[MPaymentindex] && <span className="validationerror">{errors.PaymentDate?.[index]?.[MPaymentindex]}</span>}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel >Discount</InputLabel>
                  <Select
                    labelId="Discount-Value"
                    id="Discount-Value"
                    defaultValue={MpaymentObject['Discount']?.['Value']}
                    label="Discount"
                    onChange={(event) => handleResearchChange(event,'Discount','Value',index,MPaymentindex )}
                  >
                      <MenuItem key="Yes" value="Yes">Yes</MenuItem>
                      <MenuItem key="No" value="No">No</MenuItem>
                  </Select>
                  {errors.DiscountValue?.[index]?.[MPaymentindex] && <span class="validationerror">{errors.DiscountValue?.[index]?.[MPaymentindex]}</span>}
                </FormControl>
              </Grid>
             {MpaymentObject.Discount?.Value === 'Yes' && (
        <div className="VisaLetter">
          <Grid container spacing={2} sx={{ p: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Discount Code"
                variant="outlined"
                name="MatchDiscountCode"
                fullWidth
                value={MpaymentObject['Discount']?.['Code']}
                required
                onChange={(event) => handleResearchChange(event, 'Discount','Code',index,MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.DiscountCode?.[index]?.[MPaymentindex] && <span className="validationerror">{errors.DiscountCode?.[index]?.[MPaymentindex]}</span>}
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Discount Amount"
                variant="outlined"
                name="DiscountAmount"
                fullWidth
               value={MpaymentObject['Discount']?.['Amount']}
                required
                onChange={(event) => handleResearchChange(event, 'Discount','Amount',index,MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.DiscountAmount?.[index]?.[MPaymentindex] && <span className="validationerror">{errors.DiscountAmount?.[index]?.[MPaymentindex]}</span>}
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Notes"
                variant="outlined"
                name="DiscountNote"
                fullWidth
                value={MpaymentObject.Discount?.Notes || ''} // Provide default value
                required
                onChange={(event) => handleResearchChange(event, 'Discount','Notes',index,MPaymentindex)}
                sx={{ my: 0, "margin-bottom": "4px" }}
              />
              {errors.DiscountNotes?.[index]?.[MPaymentindex] && <span className="validationerror">{errors.DiscountNotes?.[index]?.[MPaymentindex]}</span>}
            </Grid>
          </Grid>
        </div>
      )}
       <Grid item xs={6}>
                <div className="InputLabel">Need Notify</div>
     <FormControl fullWidth>
     <Select

                    id="PaymentNotify"
                    name="FeeType"
                    value={MpaymentObject['PaymentNotify'] || 'no'}
                    label="Need Notify"
                    required
                    onChange={(event) => handleResearchChange(event,'PaymentNotify','',index,MPaymentindex)}
                    
                  >
                       <MenuItem value="no">
                        No
                      </MenuItem>
                      <MenuItem value="yes">
                        Yes
                      </MenuItem>
                      </Select>
                      {errors.PaymentNotify?.[index]  && <span className="validationerror">{errors.PaymentNotify?.[index] }</span>}
                    </FormControl>

       </Grid>
        {MpaymentObject?.['PaymentNotify'] === 'yes' && (
        <Grid item xs={6} >
                <div className="InputLabel" ></div>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 ,border:1}}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,  p: 1, borderRadius: 1 }}>Notify On Date:</Typography>
                  <Typography variant="body1" sx={{  p: 1, borderRadius: 1 }}><DatePicker
        defaultValue={MpaymentObject['NotifyDate']?dayjs(MpaymentObject['NotifyDate'].toDate().toISOString()):null}
        onChange={(event) => handleResearchChange(event,'NotifyDate','',index,MPaymentindex )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="Notify On Date"
  		variant="outlined"
      /></Typography>
                </Box>
                {errors.PaymentDate?.[index]?.[Paymentindex] && <span className="validationerror">{errors.PaymentDate?.[index]?.[Paymentindex]}</span>}
              </Grid>
        )}
            	 </Grid>
            	 </div>
            )})}
            <div class="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="primary"
              onClick={() => AddRotationPayment(lastPaymentIndex+1,index,"Research")}
            >
              Add Payment {lastPaymentIndex}-{lastRotationIndex}
            </Button>
                </Box>
                </Grid>
            </div>
            </div>



                </Grid>
            </div>

                )})}
        <div class="AddPaymentButton">
           <Grid item xs={6} >
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Button
              variant="contained"
              color="warning"
              onClick={() => AddResearch(lastRotationIndex+1)}
            >
              Add Research
            </Button>
                </Box>
                </Grid>
            </div>
     </div>
     <Grid class="submitbutton" item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdateResearch}
            >
              Update
            </Button>
          </Grid>


     </div>

    </>
  );
};

export default Research;
