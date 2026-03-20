import React, { useState,useRef } from 'react';
import * as XLSX from 'xlsx';

//import CryptoJS from 'crypto-js';
import { useLoading } from '../../layout/LoadingContext';
import {
  TextField,
  Grid,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CToaster,
  CForm,
  CFormFeedback,
  CFormTextarea,
  CFormInput,
} from "@coreui/react";
import  '../../components/css/style.css';
let messageFull="";
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
function convertEmailToDocumentId(email) {
  return CryptoJS.MD5(email).toString(CryptoJS.enc.Hex); // MD5 hash of email
}
 let PId=0;
 const nowDate = new Date();
let HId=0;
let ProgramNameList="Internal Medicine"
const hospitalCache = new Map(); // HName → HId
    	const hpCache = new Set(); // "HId_PId"
       let HPId="";
let conditionsArray=[];
function ImportExcel() {
  const [excelData, setExcelData] = useState([]);
    const [errors, seterrors] = useState({});
    const [UserEmail, setUserEmail] = useState("");
    const [programlist, setprogramlist] = useState("");
    const textAreaRef = useRef(null)
  const { showLoading, hideLoading,DeleteDocumentWhere,deleteFieldFromDocument,removePidFromHospital,DeleteDocumentWhereMultiple,TooltipsPopovers,SelectWithComplexConditions,handleAdd,handleUpdateOrCreateByField, API_KEY,SelectWithWhereAnd,copyCollection,updateOrAddFieldInCollection,DatabaseName,getMaxStudentUniqueId,handleUpdate, FetchDataFromCollection,Timestamp } = useLoading();
	 const [toast, addToast] = useState(0);
  const toaster = useRef();
  const handleNotesChange = (e) => {
  setprogramlist(e.target.value)

  // Auto-resize logic
  const textarea = textAreaRef.current
  if (textarea) {
    textarea.style.height = 'auto' // Reset height
    textarea.style.height = textarea.scrollHeight + 'px' // Set to scrollHeight
  }
}
const getLatestTwoPerGroup = (records, groupKey = 'Frieda', dateKey = 'TimeStampD') => {
  const grouped = {};

  records.forEach((item) => {
    const key = item[groupKey];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
console.log("grouped--->",grouped)
  const result = {};

  Object.entries(grouped).forEach(([key, group]) => {
    const sorted = group.sort(
      (a, b) => new Date(b[dateKey]) - new Date(a[dateKey])
    );
    const latest = sorted.slice(0, 2);
    result[key] = latest.length === 1 ? latest : latest;
  });

  return result;};
const AssignProgram = async () =>
{
	/*let userDataSelectedUser = await FetchDataFromCollection("HospitalProgramInfo", 2000, "UId", "==", "MnmQEcyaqXNVVDZzvN0Pc5VMKV73", 0);
	if(userDataSelectedUser.length)
	{
		userDataSelectedUser.forEach(async (item, index) => {
        console.log(`Item ${index + 1}:`, item);
        await deleteFieldFromDocument("HospitalProgramInfo", item.documentid, "UId");
        await deleteFieldFromDocument("HospitalProgramInfo", item.documentid, "AssignedOn");
        await deleteFieldFromDocument("HospitalProgramInfo", item.documentid, "AssignedYear");
        // You can access item properties like item.name, item.value, etc.
    });
	}*/
	showLoading()
	let MessageToDisplay="";
	let CurrentYear = new Date().getFullYear();
	let errorfound=false;
	let ConfirmIfAnyProgramisAssigned=false;
	let AssignedProgramListName="";
	const error=[];
	if(UserEmail.trim()=="")
	{

		error.UserEmail="Please Enter Registered User Email.";
		errorfound=true;
	}
	if(programlist.trim()=="")
	{

		error.programlist="Please Enter List Of Frieda Id To Be Assigned.";
		errorfound=true;
	}
	if(errorfound)
	{
		seterrors(error);
    	TooltipsPopovers("error", "Please Fill All Required Fields", "Error");
    	hideLoading();
	}
	else
	{
		const userDataSelected = await FetchDataFromCollection("Users", 20, "email", "==", UserEmail.trim(), 0);
		/*if(userDataSelected.length)
		{
			let userid=userDataSelected[0].uid;
			const lines = programlist.split(/\r?\n/);


			const HospitalProgramInfo = await FetchDataFromCollection("HospitalProgramInfo", 10000, "Frieda", "in", lines, 0,"TimeStamp","desc");
			let FriedaLis={}
			const latestTwo = getLatestTwoPerGroup(HospitalProgramInfo, 'Frieda', 'TimeStamp');
			for (const [key, value] of Object.entries(latestTwo))
			{
    			let IdToUpdate = 0;
    			let DataToUpdate = {};
    			let ToBeAssigned = true;

    			console.log("Key (Frieda):", key);
    			console.log("Value (Array of records):", value);
    			let TotalRecordsEach=0;

    			for (let index = 0; index < value.length; index++)
    			{
    				TotalRecordsEach++;
        			const item = value[index];
        			console.log(`  Item ${index + 1}:`, item);


        			IdToUpdate = item.documentid || item.id;
        			DataToUpdate = item;
    			}

    			if (ToBeAssigned)
    			{
        			DataToUpdate.UId = userid;
        			DataToUpdate.Status = "Not Completed";
        			DataToUpdate.Verified = "No";
        			DataToUpdate.AssignedOn = Date.now(); // or new Date().toISOString()
        			DataToUpdate.AssignedYear = new Date().getFullYear();
        			DataToUpdate.VerifiedAdmin = "";
        			DataToUpdate.TimeStamp = Date.now();
					let result={};
					if(TotalRecordsEach<2)
					{
						let getidk=DataToUpdate.id?DataToUpdate.id:DataToUpdate.documentid;
						DataToUpdate.id = getidk+"_"+"2";
						DataToUpdate.documentid = getidk+"_"+"2";
						DataToUpdate.Status = "Completed";
        				DataToUpdate.Verified = "Yes";
						console.log("Add DataToUpdate======>",DataToUpdate)
						result = await handleAdd("HospitalProgramInfo", DataToUpdate);
					}
					else
					{
						//result = await handleUpdate("HospitalProgramInfo", IdToUpdate, DataToUpdate);
					}

        			console.log("result---->", result);
        			if(result.status=="success")
        			{
        				MessageToDisplay += `
  <div style="background-color:#d4edda; padding:10px; border-radius:5px; margin-bottom:10px;">
    <strong>Successfully Assigned:</strong>
    <span style="background-color:#155724; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      Frieda ID: ${key}
    </span>
  </div>
`;
        			}
    			}
    			else
    			{
    				MessageToDisplay += `
  <div style="background-color:#ffcccc; padding:10px; border-radius:5px; margin-bottom:10px;">
    <strong>Already Assigned:</strong>
    <span style="background-color:#e60000; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      Frieda ID: ${key}
    </span>
    <span style="background-color:#003366; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      User: ${userDataSelectedUser[0].displayName}
    </span>
  </div>
`;
    			}
    			if(typeof FriedaLis[key]=="undefined")
    			{
    			}
			}
			TooltipsPopovers("Message:", MessageToDisplay, "Report");
			console.log("latestTwo---->",latestTwo)
			hideLoading();
		}*/
		if(userDataSelected.length)
		{
			let userid=userDataSelected[0].uid;
			const lines = programlist.split(/\r?\n/);


			const HospitalProgramInfo = await FetchDataFromCollection("HospitalProgramInfo", 10000, "Frieda", "in", lines, 0,"TimeStamp","desc");
			let FriedaLis={}

			const latestTwo = getLatestTwoPerGroup(HospitalProgramInfo, 'Frieda', 'TimeStamp');
			for (const [key, value] of Object.entries(latestTwo))
			{
    			let IdToUpdate = 0;
    			let DataToUpdate = {};
    			let ToBeAssigned = true;
    			let userDataSelectedUser={};
    			let TotalRecordsEach=0;

    			for (let index = 0; index < value.length; index++)
    			{
    				TotalRecordsEach++;
        			const item = value[index];
        			console.log(`  Item ${index + 1}:`, item);

        			if (item?.AssignedYear && item?.AssignedYear == CurrentYear)
        			{
        				userDataSelectedUser = await FetchDataFromCollection("Users", 20, "uid", "==", item.UId, 0);
        				console.log("userDataSelectedUser====>",userDataSelectedUser)
            			ToBeAssigned = false;
            			MessageToDisplay += `
  <div style="background-color:#ffcccc; padding:10px; border-radius:5px; margin-bottom:10px;">
    <strong>Already Assigned:</strong>
    <span style="background-color:#e60000; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      Frieda ID: ${key}
    </span>
    <span style="background-color:#003366; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      User: ${userDataSelectedUser[0].displayName}
    </span>
  </div>
`;
    				}

        			IdToUpdate = item.documentid || item.id;
        			DataToUpdate = item;
    			}

    			if (ToBeAssigned)
    			{
        			DataToUpdate.UId = userid;
        			DataToUpdate.Status = "Not Completed";
        			DataToUpdate.Verified = "No";
        			DataToUpdate.AssignedOn = Date.now(); // or new Date().toISOString()
        			DataToUpdate.AssignedYear = new Date().getFullYear();
        			DataToUpdate.VerifiedAdmin = "";
        			DataToUpdate.TimeStamp = Date.now();
					let resultinner={};
					if(TotalRecordsEach<2)
					{
						let getidk=DataToUpdate.id?DataToUpdate.id:DataToUpdate.documentid;
						DataToUpdate.id = getidk+"_"+"2";
						DataToUpdate.documentid = getidk+"_"+"2";
						resultinner = await handleAdd("HospitalProgramInfo", DataToUpdate);
					}
					else
					{
						DataToUpdate.documentid=IdToUpdate;
						DataToUpdate.id=IdToUpdate;
						resultinner = await handleUpdate("HospitalProgramInfo", IdToUpdate, DataToUpdate);
					}
        			if(resultinner.status=="success")
        			{
        				MessageToDisplay += `
  <div style="background-color:#d4edda; padding:10px; border-radius:5px; margin-bottom:10px;">
    <strong>Successfully Assigned:</strong>
    <span style="background-color:#155724; color:white; padding:2px 6px; border-radius:3px; margin-left:5px;">
      Frieda ID: ${key}
    </span>
  </div>
`;
AssignedProgramListName=AssignedProgramListName+`<li>Frieda ID: ${key}</li>`;
ConfirmIfAnyProgramisAssigned=true;
        			}
    			}
    			if(typeof FriedaLis[key]=="undefined")
    			{
    			}
			}
			if(ConfirmIfAnyProgramisAssigned)
			{
				const DataToNotify={
    to: userDataSelected[0].email,
    message: {
      subject: "Your Programs Have Been Assigned – Contribution to Sarthi List",
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <p>Dear ${userDataSelected[0].displayName?.split(" ")[0] || 'Doctor'},</p>

          <p>Thank you for filling out your form for <strong>Contribution to the Sarthi Program List</strong>.
          We are glad to inform you that programs have now been assigned to you.</p>

          <p><strong>👉 To check your assigned programs:</strong><br/>
          Login to <a href="https://residencymatch.usmlesarthi.com/home" target="_blank">https://residencymatch.usmlesarthi.com/home</a>
          &gt; Click on <em>“Update List”</em></p>

          <p><strong>📅 Deadline:</strong> Please complete your assignment by <strong>September 19th, 2025</strong>.</p>

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
			}
			TooltipsPopovers("Message:", MessageToDisplay, "Report");
			console.log("latestTwo---->",latestTwo)
			hideLoading();
		}
		else
		{
			error.UserEmail="Please Enter Valid User Email.";
			seterrors(error);
    		TooltipsPopovers("error", "User Does Not Exists:"+UserEmail.trim(), "Error");
    		hideLoading();
		}
	}



};

  return (
  <>
   <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Assign Programs To Users</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 needs-validation">
            <CCol md={4}>
                <div>
                  <CFormInput
                    type="text"
                    id="specialityName"
                    label="User Email"
                    value={UserEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  {errors?.UserEmail  && <span className="validationerror">{errors?.UserEmail }</span>}
                </div>
              </CCol>
               <CCol md={4}>
                <CFormTextarea
                  id="notes"
                  label="Frieda Id List"
                  rows={4}
                  value={programlist}
                  onChange={handleNotesChange}
                  ref={textAreaRef}
                  placeholder="Enter Frieda Id's To Be Assigned..."
                />
                 {errors?.programlist  && <span className="validationerror">{errors?.programlist }</span>}
              </CCol>
               <CCol md={4}>
               <div>


    </div>
     </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="button"  onClick={() => AssignProgram()}>
                  Submit
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    </>
  );
}

export default ImportExcel;
