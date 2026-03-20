import React, { useState,useEffect,useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CButton,
  CTableHead,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToaster,
  CFormLabel,
  CFormSelect,
  CForm,
  CFormFeedback,
  CFormInput,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from "axios";
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import dayjs from 'dayjs';
import { CIcon } from '@coreui/icons-react';
import { cilDelete } from '@coreui/icons';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
let ActualLoggedInUser;
let LastDocumentConst=null;
const DatabaseName="LeadTracker";

let LeadToDeleteG={};
const Alerts = (Authuser) => {
ActualLoggedInUser = Authuser.ActualUser;
console.log("ActualLoggedInUser----->",ActualLoggedInUser)
const [modal, setModal] = useState(false);
const [LeadToDelete, setLeadToDelete] = useState(null);
const [LoadData, setLoadData] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [errors, seterrors] = useState(false)

const [totalDocs, setTotalDocs] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const [docsPerPage] = useState(100);
const [startPoints, setStartPoints] = useState([]);
const [loading, setLoading] = useState(false);
const [LastDoc, setLastDoc] = useState(null);

const [toast, addToast] = useState(0)
  const toaster = useRef()
const { showLoading, hideLoading,firestoreQueries,TooltipsPopovers } = useLoading();

useEffect(() => {
console.log("useEffect---->")
//firestoreQueries.copyCollection(DatabaseName,"leadsBk","leads");
//firestoreQueries.copyCollectionWithFieldAddition(DatabaseName,"leads","leadsBk");
firestoreQueries.getTotalDocs(DatabaseName,"users").then((total) => {
setTotalDocs(total);
})
fetchData();

  }, []);
const handlePageChange = async (page) =>
{
    setCurrentPage(page);
    fetchData();
}
const handleFormSubmit = async () =>
{
  const errors = {};
  console.log("CurrentData----->",CurrentData)
  if(typeof CurrentData.filtertype=="undefined")
  {
    errors.filtertype="Please Select Filter Type.";
  }
  if(typeof CurrentData.condition=="undefined")
  {
    errors.condition="Please Select Condition.";
  }
  if(typeof CurrentData.value=="undefined")
  {
    errors.value="Please Enter Value.";
  }
  if (Object.keys(errors).length === 0)
  {
    LastDocumentConst=null;
    fetchData("filter");
  }
  else
  {
    seterrors(errors);
  }

}
const toggleModal = (leadToBeDelete) => {

setLeadToDelete(leadToBeDelete)
setModal(!modal);

}
const DeleteAbort = ()=>{
setModal(!modal);
}
const DeleteLead = async (leadid) =>
{
  try
  {
      console.log("LeadToDelete---->",LeadToDelete.id)
      let DeletionCondition=[
                              [
                                { name: "id", condition: "==", value: LeadToDelete.id }
                              ]
                            ];
      let RetResultLeads= await firestoreQueries.deleteDocumentsByConditions(DatabaseName,"users",DeletionCondition);
      console.log("RetResult---->",RetResultLeads);//HDFvbhgyyDbSrTb7rqoQ4xZgXQg2   NjKXDctR18RF67l63aJy   8kuQxwnRG9rlB6S4EkMs
      if(RetResultLeads['status']==="success")
      {
         TooltipsPopovers(RetResultLeads['status'],RetResultLeads['message'],"Status");
         LastDocumentConst=null;
        fetchData();
      }

  }
  catch (error)
  {
      console.error("Error deleting lead:", error);
  }
  setModal(!modal);
};
const handleFormChange = async (event,name) =>
{
  let value;
    if(typeof event.target!="undefined")
    {
  	  value=event.target.value;
    }
    else if(typeof event.$d!="undefined")
    {
  	  value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  	  value = Timestamp.fromDate(new Date(value))
    }
    else if(typeof event.label!="undefined")
    {
  	  value=event;
    }
    else if(typeof event?.[0]?.['label']!="undefined")
    {
  	  value=event;
    }
    else
    {
  	  value=event.label;
    }

    setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
}
const handleExport = async (type) => {
showLoading();
    DownloadReport();
    /*let endpoint ="https://us-central1-usmleleadtracker.cloudfunctions.net/exportFirestoreToExcel";
    //endpoint = "http://127.0.0.1:5001/usmleleadtracker/us-central1/exportFirestoreToExcel";
    try {
    showLoading();
      const response = await axios.post(
      endpoint,
      { CollectionName: "leads" },
      { responseType: "blob",headers: {
          "Content-Type": "application/json",
        } }
    );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Database.xlsx`); // CSV or Excel based on type
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      hideLoading();
    } catch (error) {
      console.error('Error exporting data:', error);
       hideLoading();
    }*/
  };
  const getContactSource = (serviceData) => {
  let ContactSourceDynamic = "";
  switch (serviceData?.contactsource) {
    case "calendly booking":
      ContactSourceDynamic = serviceData?.contactsourcesstatusofmeeting || "";
      break;
    case "event":
      ContactSourceDynamic = serviceData?.contactsourceseventname || "";
      break;
    case "via team member":
      ContactSourceDynamic = serviceData?.contactsourceviateammembername?.label || "";
      break;
    case "webinar/workshop":
      ContactSourceDynamic = serviceData?.contactsourcespecialtywebinarworkshopname || "";
      break;
    case "rotation enquiry residency website":
      ContactSourceDynamic = serviceData?.contactsourcespecialty === "other" ? serviceData?.contactsourcespecialtyother : serviceData?.contactsourcespecialty;
      break;
    case "marketing":
      ContactSourceDynamic = serviceData?.marketingchannels === "other" ? serviceData?.marketingchannelsother : serviceData?.marketingchannels;
      break;
    default:
      ContactSourceDynamic = serviceData?.contactsourceother || "";
  }
  return ContactSourceDynamic;
};

const DownloadReport = async (type) =>
{
  try
  {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');
    let conditionsArray =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
  		const AllData=[];
  		const LeadsList1 = await firestoreQueries.SelectWithComplexConditions(
  DatabaseName,
  "leads",
  conditionsArray,
  "",
  "",
  "",
  "createTime",
  "desc",
  10000, // Page size
  null // Start with no lastDoc initially
);

let allLeads = [...LeadsList1.data]; // Store initial batch
let lastDoc = LeadsList1.lastDoc; // Get the last document for pagination

// Loop to fetch all documents iteratively
while (lastDoc !== null) {
  console.log("Fetching next page...");

  // Fetch next batch using lastDoc as startAfter
  const nextBatch = await firestoreQueries.SelectWithComplexConditions(
    DatabaseName,
    "leads",
    conditionsArray,
    "",
    "",
    "",
    "createTime",
    "desc",
    10000, // Page size
    lastDoc
  );



  // Add next batch to allLeads
  allLeads = [...allLeads, ...nextBatch.data];

  // Update lastDoc for the next loop iteration
  lastDoc = nextBatch.lastDoc;

  // Break if no more data
  if (nextBatch.data.length === 0 || !lastDoc) {
    console.log("✅ No more documents to fetch.");
    break;
  }
}

const FollowUpList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"followups",conditionsArray,"","","","followupdate","desc",10000);
let allFollowups = [...FollowUpList.data];
let lastDocFollowup = FollowUpList.lastDoc;
while (lastDocFollowup !== null)
{
  const nextBatch = await firestoreQueries.SelectWithComplexConditions(DatabaseName,"followups",conditionsArray,"","","","followupdate","desc",10000,lastDocFollowup);
  allFollowups = [...allFollowups, ...nextBatch.data];
  lastDocFollowup = nextBatch.lastDoc;
  if (nextBatch.data.length === 0 || !lastDocFollowup)
  {
    console.log("✅ No more Followup documents to fetch.");
    break;
  }
}
const groupedFollowUps = allFollowups.reduce((acc, followup) => {
  const leadId = followup.leadid;

  if (!acc[leadId]) {
    acc[leadId] = [];
  }

  // Push follow-up only if less than 5 per lead
  if (acc[leadId].length < 5) {
    acc[leadId].push(followup);
  }

  return acc;
}, {});
const ServiceList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services",conditionsArray,"","","",null,null,10000);
let allServices = [...ServiceList.data];
let lastDocService = ServiceList.lastDoc;
while (lastDocService !== null)
{
  const nextBatch = await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services",conditionsArray,"","","",null,null,10000,lastDocService);
  allServices = [...allServices, ...nextBatch.data];
  lastDocService = nextBatch.lastDoc;
  if (nextBatch.data.length === 0 || !lastDocService)
  {
    console.log("✅ No more Followup documents to fetch.");
    break;
  }
}
const groupedServices = allServices.reduce((acc, serrives) => {
  const leadId = serrives.leadid;

  if (!acc[leadId]) {
    acc[leadId] = [];
  }

  // Push follow-up only if less than 5 per lead
  if (acc[leadId].length < 5) {
    acc[leadId].push(serrives);
  }

  return acc;
}, {});


      await Promise.all(
  allLeads.map(async (leadData) => {
    const commaSeparatedValuesInt = leadData?.interestedin?.map((item) => item.value).join(", ");
    let NextFollowupDate = leadData?.nextfollowupdate ? new Date(leadData.nextfollowupdate.seconds * 1000) : "";
    let ContactSource=leadData?.contactsource;
    if(ContactSource==="other")
    {
      ContactSource=leadData?.contactsourceother;
    }
    // Basic Lead Data
    const ExportData = {
      "LastName": leadData.lastname || "",
      "FirstName": leadData.firstname || "",
      "Email": leadData.email || "",
      "CountryCode": leadData.phonecountrycode ? leadData.phonecountrycode.phoneCode : "",
      "PhoneNumber": leadData.phone || "",
      "SarthiStudent": leadData.sarthistudent || "",
      "InqueryDate": leadData?.inquerydate ? new Date(leadData?.inquerydate?.seconds * 1000) : "",
      "LeadCreater": leadData.leadcreatedby ? leadData.leadcreatedby.name : "",
      "LeadOwner": leadData.leadowner ? leadData?.leadowner?.name : "",
      "LeadStatus": leadData.leadstatus ? leadData?.leadstatus : "",
      "ContactSource": ContactSource,
      "YearOfGraduation": new Date(leadData?.yog?.seconds * 1000).
              getFullYear() || "",
          "Step1Result":
            leadData.step1result === "score"?
                    `${leadData.step1result}(${leadData.step1score})`:
                    `${leadData.step1result || ""}`,
          "Step2Result":
            leadData.step2ckresult === "score"?
                    `${leadData.step2ckresult}(${leadData.step2ckscore})`:
                    `${leadData.step2ckresult || ""}`,
          "Step3Result":
            leadData.step3ckresult === "score"?
                `${leadData.step3ckresult}(${leadData.step3ckscore})`:
                `${leadData.step3ckresult || ""}`,
          "MatchApplicationSeason": leadData.matchapplicationsession ? `Match Season ` + leadData.matchapplicationsession + ` (Sept ` + (leadData.matchapplicationsession - 1) + `)` : "",
          "NameOfMedicalCollege": `${leadData.nameofmedicalcollege?
                    leadData.nameofmedicalcollege.value==="Other"?
                    leadData.nameofmedicalschoolother || "":
                    leadData.nameofmedicalcollege.value: ""} `,
          "VisaStatus": leadData.visastatus,
          "LeadNotes": leadData.leadnotes,
          "DateOfEntry": new Date(leadData.createTime.seconds * 1000) || "",
          "InterestedInService": commaSeparatedValuesInt,
          "InterestedServiceType": "",
          "rotationInterestedServiceType": "",
          "RotationPushed": "",
          "rotationServiceOwner": "",
          "rotationContactSource": "",
          "rotationCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "rotationDateOfEvent/Webinar/Workshop": "",
          "rotationBudgetOfService": "",
          rotationExpectedMonthAndYearOfEnrollement: "",
          rotationServiceStatus: "",
          rotationPlannedStartDate: "",
          rotationServiceNotes: "",
          matchInterestedServiceType: "",
          matchPlanPushed: "",
          matchServiceOwner: "",
          matchContactSource: "",
          "matchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "matchDateOfEvent/Webinar/Workshop": "",
          matchBudgetOfService: "",
          matchExpectedMonthAndYearOfEnrollement: "",
          matchServiceStatus: "",
          matchPlannedStartDate: "",
          researchInterestedServiceType: "",
          researchPlanPushed: "",
          researchServiceOwner: "",
          researchContactSource: "",
          "researchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "researchDateOfEvent/Webinar/Workshop": "",
          researchBudgetOfService: "",
          researchExpectedMonthAndYearOfEnrollement: "",
          researchServiceStatus: "",
          researchPlannedStartDate: "",
          researchServiceNotes: "",
          FollowUpDate1: "",
          FollowUpMode1: "",
          FollowUpPlanPushed1: "",
          FollowUpStudentResponse1: "",
          FollowUpNotes1: "",
          FollowUpDate2: "",
          FollowUpMode2: "",
          FollowUpPlanPushed2: "",
          FollowUpStudentResponse2: "",
          FollowUpNotes2: "",
          FollowUpDate3: "",
          FollowUpMode3: "",
          FollowUpPlanPushed3: "",
          FollowUpStudentResponse3: "",
          FollowUpNotes3: "",
          FollowUpDate4: "",
          FollowUpMode4: "",
          FollowUpPlanPushed4: "",
          FollowUpStudentResponse4: "",
          FollowUpNotes4: "",
          FollowUpDate5: "",
          FollowUpMode5: "",
          FollowUpPlanPushed5: "",
          FollowUpStudentResponse5: "",
          FollowUpNotes5: "",
      FollowupsRequired: leadData?.followupsrequired,
      NextFollowupDate: NextFollowupDate,
    };

    // Handling Services
    const leadServices = groupedServices[leadData.id] || [];
    leadServices.forEach((serviceData) => {
      const serviceType = serviceData?.servicetype;
      const commaSeparatedValues = serviceData?.rotationplanpushed?.map((item) => item.value).join(", ");
      const ContactSourceDynamic = getContactSource(serviceData);

      if (serviceType) {
        ExportData[`${serviceType}InterestedServiceType`] = serviceData.servicetype || "";
        ExportData[`${serviceType}PlanPushed`] = commaSeparatedValues || "";
        ExportData[`${serviceType}ServiceOwner`] = serviceData?.serviceowner?.name || "";
        ExportData[`${serviceType}ContactSource`] = serviceData?.contactsource || "";
        ExportData[`${serviceType}CalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/`] = ContactSourceDynamic;
        ExportData[`${serviceType}ServiceStatus`] = serviceData?.servicestatus || "";
        ExportData[`${serviceType}PlannedStartDate`] = serviceData?.planedstartdate ? new Date(serviceData.planedstartdate.seconds * 1000) : "";
        ExportData[`${serviceType}ServiceNotes`] = serviceData?.servicenotes || "";
      }
    });

    // Handling Follow-Ups
    const leadFollowUps = groupedFollowUps[leadData.id] || [];
    leadFollowUps.forEach((followupDATA, index) => {
      const loopVar = index + 1;
      const Followupdate = followupDATA?.followupdate?.seconds ? new Date(followupDATA.followupdate.seconds * 1000) : null;
      const commaSeparatedValuesF = Array.isArray(followupDATA?.followupplanpushed)
        ? followupDATA?.followupplanpushed?.map((item) => item.value).join(", ")
        : followupDATA?.followupplanpushed || "";

      ExportData[`FollowUpDate${loopVar}`] = Followupdate;
      ExportData[`FollowUpMode${loopVar}`] = followupDATA?.mode || "";
      ExportData[`FollowUpPlanPushed${loopVar}`] = commaSeparatedValuesF;
      ExportData[`FollowUpStudentResponse${loopVar}`] = followupDATA?.studentsresponse || "";
      ExportData[`FollowUpNotes${loopVar}`] = followupDATA.note || "";
    });
    AllData.push(ExportData);
  })
);

      const headers = Object.keys(AllData[0] || {});
      worksheet.columns = headers.map((header) => ({header, key: header}));
      AllData.forEach((row) => worksheet.addRow(row));
      worksheet.columns.forEach((column) => {
        let maxLength = column.header.length; // Start with the header length
        column.eachCell({includeEmpty: true}, (cell) => {
          if (cell.value) {
            const cellLength = cell.value.toString().length;
            maxLength = Math.max(maxLength, cellLength);
          }
        });
        column.width = maxLength + 2; // Add padding for readability
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {argb: "FFFF00"}, // Yellow background
        };
        cell.font = {bold: true};
      });

      // Generate Excel file and prompt download
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'LeadsData.xlsx');
      hideLoading();
    }
    catch (error)
    {
      console.error('Error exporting data:', error);
      hideLoading();
      alert('Failed to export data.');
    }
};
 const getVisiblePages = () => {
    const visiblePages = 5; // Number of visible page buttons
    const halfVisible = Math.floor(visiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
const fetchData = async (condit="default") => {
showLoading();
  let LeadsList;
  console.log("======fetchData========")
  //await firestoreQueries.copyCollection(DatabaseName,"leads","leadsBk")
    //await firestoreQueries.copyCollectionWithFieldAdditionCheck(DatabaseName,"services","leads")
  let conditionsArray;
  if(condit==="default")
  {
    if(ActualLoggedInUser.role==="Customer Support")
    {
        conditionsArray =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"users",conditionsArray,"","","","name","desc",docsPerPage,LastDocumentConst);
    }
    else
    {
     // LeadsList=await firestoreQueries.fetchData(DatabaseName, "leads",10000,null,null,null,"createTime","desc" );
       conditionsArray =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
  			console.log("conditionsArray===>",conditionsArray)
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"users",conditionsArray,"","","","name","desc",docsPerPage,LastDocumentConst);
    }

  }
  else
  {
      conditionsArray =
    		[
  				[
    				{ name: CurrentData.filtertype, condition: CurrentData.condition, value: CurrentData.value },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      if(CurrentData.filtertype==="email")
      {
        conditionsArray =
    		[
  				[
    				{ name: CurrentData.filtertype, condition: CurrentData.condition, value: CurrentData?.value?.toLowerCase() || '' },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      }
      else if(CurrentData.filtertype==="uniqueid")
      {
        conditionsArray =
    		[
  				[
    				{ name: CurrentData.filtertype, condition: CurrentData.condition, value: typeof CurrentData?.value === "string" ? Number(CurrentData.value.replace(/l/gi, "")) : ''},
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      }
      console.log("conditionsArray===>",conditionsArray)

      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"users",conditionsArray,"","","","name","desc",docsPerPage,LastDocumentConst);
  }


    /*setMedicalSchoolOptionsList([
          ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);*/
        if(LeadsList.status=="success")
        {
           setLoadData(LeadsList.data);
           setLastDoc(LeadsList.lastDoc)
           LastDocumentConst=LeadsList.lastDoc;
        }

hideLoading();
  }

    const totalPages = Math.ceil(totalDocs / docsPerPage);
  return (
<CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Filters</strong> <small></small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
            <CForm className="row g-3 needs-validation">
           <CCol md={4}>
                <CFormLabel >Filter Type</CFormLabel>
                <CFormSelect
                    placeholder="Filter Type"
                    onChange={(event) => handleFormChange(event,'filtertype' )}>
                    <option value=''>=Select=</option>
                    <option value='email'>Email</option>
                    <option value='name'>First Name</option>
                    <option value='role'>Last Name</option>
                    <option value='id'>id</option>

                  </CFormSelect>
                  {errors.filtertype && (
                      <CFormFeedback invalid>{errors.filtertype}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Condition</CFormLabel>
                <CFormSelect
                    placeholder="Condition"
                    value={CurrentData?.condition}
                    onChange={(event) => handleFormChange(event,'condition' )}>
                    <option value=''>=Select=</option>
                    <option value='=='>Equal To</option>
                    <option value='!='>Not Equal To</option>
                    <option value='contains'>Contains</option>
                  </CFormSelect>
                    {errors.condition && (
                      <CFormFeedback invalid>{errors.condition}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Value</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Value"
                    value={CurrentData?.value}
                    required
                    onChange={(event) => handleFormChange(event,'value' )}
                />
                {errors.value && (
                      <CFormFeedback invalid>{errors.value}</CFormFeedback>
                  )}
              </CCol>
              <p className="text-body-secondary small">
            </p>
              <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Filter
                  </CButton>
                </CCol>
                <p className="text-body-secondary small">
            </p>
            </CForm>
          </CCardBody>

          </CCard>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Leads</strong> <small></small>
          </CCardHeader>
          <CCardBody>


            <CTable color="success" striped>
                <CTableHead>
                  <CTableRow>
                   <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {LoadData.map((item) => (
                  <CTableRow key={`${item.id}`}>
  <CTableDataCell>{item?.id}</CTableDataCell>
                    <CTableHeaderCell scope="row">
  <a href={`/admin/updateuser/${item.id}`}>
    {item.name}
  </a>
</CTableHeaderCell>
                    <CTableDataCell>{item?.role}</CTableDataCell>
                    <CTableDataCell> <a href={`/admin/updateuser/${item.id}`}>{item?.email}</a></CTableDataCell>
                    <CTableDataCell><CButton onClick={(event) => toggleModal(item)}>
  <CIcon icon={cilDelete} className="text-danger" title="Delete Lead" size="xl" />
</CButton></CTableDataCell>
                  </CTableRow>
                ))}
                </CTableBody>
              </CTable>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {loading && <p>Loading...</p>}
        {!loading && (
          <>
          <CButton
                color="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </CButton>
              {getVisiblePages().map((page) => (
                <CButton
                  key={page}
                  color={currentPage === page ? 'primary' : 'secondary'}
                  onClick={() => handlePageChange(page)}
                  style={{ margin: '0 5px' }}
                >
                  {page}
                </CButton>
              ))}
              <CButton
                color="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </CButton>
              </>
              )}
      </div>
              <CModal visible={modal} >
        <CModalHeader>
          <CModalTitle>Delete Lead</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this user({LeadToDelete?.email || ''})? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={DeleteAbort}>Cancel</CButton>
          <CButton color="danger" onClick={DeleteLead}>Delete</CButton>
        </CModalFooter>
      </CModal>
            </CCardBody>
        </CCard>
        </CCol>
        </CRow>
  )
}

export default Alerts
