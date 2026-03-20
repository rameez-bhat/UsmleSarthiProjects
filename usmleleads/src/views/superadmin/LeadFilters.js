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
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import dayjs from 'dayjs';
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
import { CIcon } from '@coreui/icons-react';
import { cilDelete } from '@coreui/icons';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
let ActualLoggedInUser;
let TotalRecords=0;
const PAGE_SIZE = 100;
let paginatedData=[];
let dataArray=[];
let LastDocumentConst=null;

let JoinFullArray=[
  { collection: "services", leftField: "leadid", rightField: "leadid", conditions: [] },
  { collection: "followups", leftField: "serviceid", rightField: "serviceid", conditions: [] }
];
let ConditionCheck="";
const DatabaseName="LeadTracker";
const dateFormat="MM/DD/YYYY";
let AdminOptionsList=[];
const currentYear = new Date().getFullYear();
const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
let LeadCreatedBy=[];
let conditionsArray=[];
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
firestoreQueries.getTotalDocs(DatabaseName,"leads").then((total) => {
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
  conditionsArray =
    		[
  				[
  				]
  			];
  JoinFullArray=[
  { collection: "followups", leftField: "leadid", rightField: "leadid", conditions: [] },
  { collection: "services", leftField: "leadid", rightField: "leadid", conditions: [] }
];
  const errors = {};
  if(Object.keys(CurrentData).length)
  {
    if(CurrentData.leadowner)
    {

  			conditionsArray[0].push({name:'leadowner.label',condition:"==",value:CurrentData.leadowner.label})
    }
    if(CurrentData.followupdate)
    {
      //JoinFullArray[0].conditions.push({name:'nextfollowupdate',condition:">=",value:firestoreQueries.Timestamp.fromDate(CurrentData.followupdate.from?.toDate())})
      //JoinFullArray[0].conditions.push({name:'nextfollowupdate',condition:"<=",value:firestoreQueries.Timestamp.fromDate(CurrentData.followupdate.to?.toDate())})
      conditionsArray[0].push({name:'nextfollowupdate',condition:">=",value:firestoreQueries.Timestamp.fromDate(CurrentData.followupdate.from?.toDate())})
      conditionsArray[0].push({name:'nextfollowupdate',condition:"<=",value:firestoreQueries.Timestamp.fromDate(CurrentData.followupdate.to?.toDate())})
    }
    if(CurrentData.createTime)
    {
      conditionsArray[0].push({name:'createTime',condition:">=",value:firestoreQueries.Timestamp.fromDate(CurrentData.createTime.from?.toDate())})
      conditionsArray[0].push({name:'createTime',condition:"<=",value:firestoreQueries.Timestamp.fromDate(CurrentData.createTime.to?.toDate())})
    }
    if(CurrentData.updateTime)
    {
      JoinFullArray[1].conditions.push({name:'updateTime',condition:">=",value:firestoreQueries.Timestamp.fromDate(CurrentData.updateTime.from?.toDate())})
      JoinFullArray[1].conditions.push({name:'updateTime',condition:"<=",value:firestoreQueries.Timestamp.fromDate(CurrentData.updateTime.to?.toDate())})
    }
    if(CurrentData.leadstatus)
    {
      //JoinFullArray[0].conditions.push({name:'servicestatus',condition:"==",value:CurrentData.servicestatus});
      conditionsArray[0].push({name:'leadstatus',condition:"==",value:CurrentData.leadstatus})
    }
    if(CurrentData.servicetype)
    {
      JoinFullArray[1].conditions.push({name:'servicetype',condition:"==",value:CurrentData.servicetype});
    }
    if(CurrentData.contactsource)
    {
      //JoinFullArray[0].conditions.push({name:'contactsource',condition:"==",value:CurrentData.contactsource});
      conditionsArray[0].push({name:'contactsource',condition:"==",value:CurrentData.contactsource})
    }
    if(CurrentData.matchapplicationsession)
    {
      //JoinFullArray[0].conditions.push({name:'contactsource',condition:"==",value:CurrentData.contactsource});
      conditionsArray[0].push({name:'matchapplicationsession',condition:"==",value:CurrentData.matchapplicationsession})
    }
    console.log("conditionsArray--->",conditionsArray)
    fetchData("filters");
  }
  else
  {
    errors.message="Select One Or More Filters";
    seterrors(errors);
  }
  console.log("JoinFullArray----->",JoinFullArray)
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
    //fetchData("filter");
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
      let RetResultLeads= await firestoreQueries.deleteDocumentsByConditions(DatabaseName,"leads",DeletionCondition);
      console.log("RetResult---->",RetResultLeads);//HDFvbhgyyDbSrTb7rqoQ4xZgXQg2   NjKXDctR18RF67l63aJy   8kuQxwnRG9rlB6S4EkMs
      if(RetResultLeads['status']==="success")
      {
        DeletionCondition=[
                              [
                                { name: "leadid", condition: "==", value: LeadToDelete.id }
                              ]
                            ];
        let RetResultServices= await firestoreQueries.deleteDocumentsByConditions(DatabaseName,"services",DeletionCondition);
        if(RetResultServices['status']==="success")
        {
            DeletionCondition=[
                              [
                                { name: "leadid", condition: "==", value: LeadToDelete.id }
                              ]
                            ];
          let RetResultFollowups= await firestoreQueries.deleteDocumentsByConditions(DatabaseName,"followups",DeletionCondition);
          TooltipsPopovers(RetResultFollowups['status'],RetResultFollowups['message'],"Status");
          fetchData();

        }
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
  	  value = firestoreQueries.Timestamp.fromDate(new Date(value))
    }
    else if(typeof event.label!="undefined")
    {
  	  value=event;
    }
    else if(typeof event?.[0]?.['label']!="undefined")
    {
  	  value=event;
    }
    else if(typeof event[0]!="undefined")
  	{
  		value={};
  		value['from']= firestoreQueries.Timestamp.fromDate(new Date(event[0].toLocaleString('en-GB', { timeZone: 'GMT' })));
			value['to']= firestoreQueries.Timestamp.fromDate(new Date(event[1].toLocaleString('en-GB', { timeZone: 'GMT' })));
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
const filterPagination = (Page) => {
setCurrentPage(Page);
const startIndex = Page * PAGE_SIZE;
  paginatedData = dataArray.slice(startIndex, startIndex + PAGE_SIZE);
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
  ///await firestoreQueries.copyCollection(DatabaseName,"leads","leadsBk")
    AdminOptionsList=[];
    LeadCreatedBy=[];
    const adminlist = await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "in", ["Customer Support","SuperAdmin"]);
    adminlist.map((item) => {
      AdminOptionsList.push({ label: item.name, value: item.uid, name: item.name });
      LeadCreatedBy.push({ label: item.name, value: item.uid, name: item.name });
      return null;
    });
    ConditionCheck=condit;
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
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArray,"","","","createTime","desc",docsPerPage,LastDocumentConst);
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
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArray,"","","","createTime","desc",docsPerPage,LastDocumentConst);
    }

  }
  else if(condit==="filters")
  {

    LastDocumentConst=null;
    TotalRecords=0;
   //LeadsList =await firestoreQueries.SelectWithComplexConditionsFF(DatabaseName,"leads",conditionsArray,JoinFullArray,"createTime","desc",null,LastDocumentConst);
    LeadsList =await firestoreQueries.SelectSuperComplexConditionsForView(DatabaseName,"leads",conditionsArray,JoinFullArray,"createTime","desc",2000,null);
    console.log("LeadsList----->",LeadsList)
    if(LeadsList.TotalRecords)
    {
      if(LeadsList.TotalRecords?.['finalresult'])
      {
          TotalRecords=LeadsList.TotalRecords?.['finalresult']
      }
    }
    if(LeadsList.data)
    {
      setTotalDocs(LeadsList.data.length);
    }
    dataArray = Object.values(LeadsList['data']);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    paginatedData = dataArray.slice(startIndex, startIndex + PAGE_SIZE);
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

  			console.log("conditionsArray----->",conditionsArray)
  			console.log("LastDoc----->",LastDoc)
  			console.log("docsPerPage----->",docsPerPage)
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArray,"","","","createTime","desc",docsPerPage,LastDocumentConst);
  }

console.log("LeadsList===>",LeadsList)

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
console.log("LeadsList===>",LeadsList)
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
            {errors?.message && (
                  <CFormFeedback invalid>{errors?.message}</CFormFeedback>
                )}
            </p>
            <CForm className="row g-3 needs-validation">
            <CCol md={4}>
                <CFormLabel >Filter By Lead Owner</CFormLabel>
                <Select1 value={CurrentData?.leadowner}
                  placeholder="Lead Owner"
                  invalid={!!errors.leadowner}
                  valid={!errors.leadowner && CurrentData?.leadowner}
                  required
                  closeMenuOnSelect={true}
                  options={AdminOptionsList}
                  onChange={(event) => handleFormChange(event, 'leadowner')}>
                </Select1>
                {errors.leadowner && (
                  <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
           <CFormLabel >Lead Created From Date/To Date</CFormLabel>
                <RangePicker
	value={CurrentData['createTime']?.['from']?[dayjs(new Date(CurrentData['createTime']['from'].seconds * 1000)),dayjs(new Date(CurrentData['createTime']['to'].seconds * 1000))]:null}
   onChange={(event) => handleFormChange(event,'createTime')}
	format={dateFormat} // Customize date format as needed
	scrollableYearDropdown  // Make year dropdown scrollable
	 yearDropdownItemNumber={50}

	 picker="date"
	variant="outlined"
  />
              </CCol>
               <CCol md={4}>
                <CFormLabel >Lead Status</CFormLabel>
                <CFormSelect
                value={CurrentData?.leadstatus}
                  placeholder="Status"
                  invalid={!!errors?.leadstatus}
                  valid={!errors?.leadstatus}
                  required
                  onChange={(event) => handleFormChange(event, 'leadstatus')}>
                  <option value=''>=Select=</option>
                  <option value='enrolled'>Enrolled</option>
                  <option value='hot'>Hot</option>
                  <option value='active'>Active</option>
                  <option value='not responding'>Not Responding</option>
                  <option value='Dead'>Dead</option>
                  <option value='do not disturb'>Do Not Disturb</option>
                </CFormSelect>
                {errors?.servicestatus && (
                  <CFormFeedback invalid>{errors?.servicestatus}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                    <CFormLabel >Service Type</CFormLabel>
                    <CFormSelect value={CurrentData?.servicetype}
                      placeholder="Service Type"
                      invalid={!!errors?.servicetype}
                      valid={!errors?.servicetype}
                      required
                      onChange={(event) => handleFormChange(event, 'servicetype')}>
                      <option value=''>=Select=</option>
                      <option value='rotation'>Rotation</option>
                      <option value='match'>Match</option>
                      <option value='research'>Research</option>
                    </CFormSelect>
                    {errors?.servicetype && (
                  <CFormFeedback invalid>{errors?.servicetype}</CFormFeedback>
                )}
                  </CCol>
                  <CCol md={4}>
                <CFormLabel >Contact Source</CFormLabel>
                <CFormSelect value={CurrentData?.contactsource || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.contactsource}
                        valid={!errors?.contactsource}
                        required
                        onChange={(event) => handleFormChange(event, 'contactsource')}>
                    <option value=''>==Select==</option>
                    <option value='calendly booking'>Calendly Booking</option>
                    <option value='event'>Event</option>
                    <option value='whatsapp'>WhatsApp</option>
                    <option value='enroll email'>Enroll Email</option>
                    <option value='marketing'>Marketing</option>
                    <option value='rotation enquiry residency website'>Rotation Enquiry Residency Website</option>
                    <option value='webinar/workshop'>Webinar/Workshop</option>
                    <option value='contact us page'>Contact Us Page</option>
                    <option value='call'>Call</option>
                    <option value='via team member'>Via team member</option>
                    <option value='customer care whatsapp'>Customer Care Whatsapp</option>
                    <option value='other'>Other</option>

                </CFormSelect>
                 {errors?.contactsource && (
                  <CFormFeedback invalid>{errors?.contactsource}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Match Application Season</CFormLabel>
                <CFormSelect  value={CurrentData?.matchapplicationsession || ''}
                    placeholder="Match Application Season"
                    invalid={!!errors.step2ckresult} // Set `invalid` if there's an error
                    valid={!errors.matchapplicationsession && !!CurrentData?.matchapplicationsession} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'matchapplicationsession')}>
                    <option value=''>=Select=</option>
                    {MatchSessionList.map((item) => (
                    <option value={item}>{`Match Season `+item+` (Sept `+(item-1)+`)`}</option>
                    ))}
                    <option value='undecided/later'>Undecided/Later</option>
                  </CFormSelect>

                {errors.matchapplicationsession && (
                      <CFormFeedback invalid>{errors.matchapplicationsession}</CFormFeedback>
                  )}
              </CCol>
           <CCol md={4}>
           <CFormLabel >Followup From Date/To Date</CFormLabel>
                <RangePicker
	value={CurrentData['followupdate']?.['from']?[dayjs(new Date(CurrentData['followupdate']['from'].seconds * 1000)),dayjs(new Date(CurrentData['followupdate']['to'].seconds * 1000))]:null}
   onChange={(event) => handleFormChange(event,'followupdate')}
	format={dateFormat} // Customize date format as needed
	scrollableYearDropdown  // Make year dropdown scrollable
	 yearDropdownItemNumber={50}

	 picker="date"
	variant="outlined"
  />
              </CCol>
              <CCol md={4}>
           <CFormLabel >Updated From Date/To Date</CFormLabel>
                <RangePicker
	value={CurrentData['updateTime']?.['from']?[dayjs(new Date(CurrentData['updateTime']['from'].seconds * 1000)),dayjs(new Date(CurrentData['updateTime']['to'].seconds * 1000))]:null}
   onChange={(event) => handleFormChange(event,'updateTime')}
	format={dateFormat} // Customize date format as needed
	scrollableYearDropdown  // Make year dropdown scrollable
	 yearDropdownItemNumber={50}

	 picker="date"
	variant="outlined"
  />
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
            <strong>Leads</strong> <small></small>    <div className="ResultTotal"><strong>Total Results Found:</strong><label>{TotalRecords>0 && (TotalRecords)}</label></div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">

            </p>

            <CTable color="success" striped>
                <CTableHead>
                {ConditionCheck === "filters" ? (
                  <CTableRow>
                    <CTableHeaderCell scope="col">Lead Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Contact Source</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Lead Owner</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created On</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Next Followup</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Lead Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                ):(
                <CTableRow>
                    <CTableHeaderCell scope="col">Lead Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Lead Owner</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Created On</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                )}
                </CTableHead>
                <CTableBody>
                {ConditionCheck === "filters" ? (
    paginatedData.map((item) => (
    <>
      <CTableRow key={item.id}>
        <CTableHeaderCell scope="row">L{item.uniqueid}</CTableHeaderCell>
        <CTableHeaderCell scope="row">
          <a href={`/admin/leads/updatelead/${item.id}`}>{item.firstname}</a>
        </CTableHeaderCell>
        <CTableDataCell>{item.lastname}</CTableDataCell>
        <CTableDataCell>{item.contactsource}</CTableDataCell>
         <CTableDataCell>
          {item?.leadowner?.label}
        </CTableDataCell>
        <CTableDataCell>
          <a href={`/admin/leads/updatelead/${item.id}`}>{item?.email}</a>
        </CTableDataCell>
        <CTableDataCell>
          {item?.createTime
            ? dayjs(item.createTime.toDate()).format(dateFormat+" HH:mm:ss")
            : null}
        </CTableDataCell>
        <CTableDataCell>
          {item?.nextfollowupdate
            ? dayjs(item.nextfollowupdate.toDate()).format(dateFormat+" HH:mm:ss")
            : null}
        </CTableDataCell>
        <CTableDataCell>
          {item?.leadstatus}
        </CTableDataCell>
        <CTableDataCell>
          <CButton onClick={() => toggleModal(item)}>
            <CIcon
              icon={cilDelete}
              className="text-danger"
              title="Delete Lead"
              size="xl"
            />
          </CButton>
        </CTableDataCell>
        </CTableRow>
        {/* Display Services Table if Available */}
        {item.services_Table && Object.values(item.services_Table).length > 0 && (
        <CTableRow>
         <CTableDataCell colSpan={10}>
          <CTable  align="middle" bordered responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell scope="col">Service Type</CTableHeaderCell>
                <CTableHeaderCell scope="col">Created By</CTableHeaderCell>
                <CTableHeaderCell scope="col">Created On</CTableHeaderCell>
                <CTableHeaderCell scope="col">Updated By</CTableHeaderCell>
                <CTableHeaderCell scope="col">Updated on</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {Object.values(item.services_Table).map((serviceItem) => (
                <CTableRow key={serviceItem.id}>
                  <CTableDataCell>{serviceItem?.servicetype}</CTableDataCell>
                  <CTableDataCell>{serviceItem?.createdby?.name}({serviceItem?.createdby?.email})</CTableDataCell>
                  <CTableDataCell>
          {serviceItem?.createTime
            ? dayjs(serviceItem.createTime.toDate()).format(dateFormat+" HH:mm:ss")
            : null}
        </CTableDataCell>
                  <CTableDataCell>{serviceItem?.lastupdatedby?.name}({serviceItem?.lastupdatedby?.email})</CTableDataCell>
                  <CTableDataCell>
                    {serviceItem?.updateTime
                      ? dayjs(serviceItem.updateTime.toDate()).format(dateFormat+" HH:mm:ss")
                      : null}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
           </CTableDataCell>
          </CTableRow>
        )}
</>
    ))
  ) : (
    LoadData.map((item) => (
      <CTableRow key={item.id}>
        <CTableHeaderCell scope="row">L{item.uniqueid}</CTableHeaderCell>
        <CTableHeaderCell scope="row">
          <a href={`/admin/leads/updatelead/${item.id}`}>{item.firstname}</a>
        </CTableHeaderCell>
        <CTableDataCell>{item.lastname}</CTableDataCell>
        <CTableDataCell>
          {item?.leadowner?.label}
        </CTableDataCell>
        <CTableDataCell>
          <a href={`/admin/leads/updatelead/${item.id}`}>{item?.email}</a>
        </CTableDataCell>
        <CTableDataCell>
          {item?.createTime
            ? dayjs(item.createTime.toDate()).format(dateFormat)
            : null}
        </CTableDataCell>
        <CTableDataCell>
          <CButton onClick={() => toggleModal(item)}>
            <CIcon
              icon={cilDelete}
              className="text-danger"
              title="Delete Lead"
              size="xl"
            />
          </CButton>
        </CTableDataCell>
      </CTableRow>
    ))
  )}

                </CTableBody>
              </CTable>
 <div style={{ marginTop: '20px', textAlign: 'center' }}>
  {loading && <p>Loading...</p>}
  {!loading && (
    ConditionCheck === "filters" ? (
      <div>
        <CButton onClick={() => filterPagination(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </CButton>
        <span> Page {currentPage} of {Math.ceil(dataArray.length / PAGE_SIZE)} </span>
        <CButton onClick={() => filterPagination(currentPage + 1)} disabled={currentPage * PAGE_SIZE >= dataArray.length}>
          Next
        </CButton>
      </div>
    ) : (
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
    )
  )}
</div>
              <CModal visible={modal} >
        <CModalHeader>
          <CModalTitle>Delete Lead</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this lead({LeadToDelete?.email || ''})? This action cannot be undone.
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
