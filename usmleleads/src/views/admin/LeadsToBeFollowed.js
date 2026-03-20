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
  CToaster,
  CFormLabel,
  CFormSelect,
  CForm,
  CFormFeedback,
  CFormInput,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import moment from "moment";
import dayjs from "dayjs";
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import { DatePicker} from "antd";
const { RangePicker } = DatePicker;
const DatabaseName="LeadTracker";
const defaultStartDate = dayjs().subtract(1, "days");
const defaultEndDate = dayjs().add(2, 'days');
let ActualLoggedInUser;
let FiltersApplied=false;
const dateFormat="MM/DD/YYYY";
const Alerts = (Authuser) => {
ActualLoggedInUser = Authuser.ActualUser;
const [LoadData, setLoadData] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [SelectedFilters, setSelectedFilters] = useState({'daterange':[defaultStartDate, defaultEndDate],'servicetype':'all'})
const [errors, seterrors] = useState(false)
const [toast, addToast] = useState(0)
const [dates, setDates] = useState([defaultStartDate, defaultEndDate]);
const toaster = useRef()
const { showLoading, hideLoading,firestoreQueries } = useLoading();

useEffect(() => {

fetchData();


  }, []);
const handleFilterSubmit = async () =>
{
  showLoading()
  FiltersApplied=true;
  fetchData();
}
const handleFilterClear = async () =>
{
 window.location.reload();
}

const handleFilterChange = async (event,name) =>
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
  	  value=event;
    }
    setSelectedFilters((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
}
const fetchData = async (condit="default") => {

  let LeadsList;
  let conditionsArray;
  let JoinFullArray=[
  { collection: "services", leftField: "leadid", rightField: "leadid", conditions: [],sortBy:"",sortDir:"asc" },
  { collection: "followups", leftField: "leadid", rightField: "leadid", conditions: [],sortBy:"followupdate",sortDir:"asc" }
];
  const DateTimestampStart=firestoreQueries.Timestamp.fromDate(SelectedFilters['daterange'][0]?.toDate());
  const DateTimestampEnd=firestoreQueries.Timestamp.fromDate(SelectedFilters['daterange'][1]?.toDate());
  if(SelectedFilters?.['servicetype']==="all")
  {
    conditionsArray =
    		[[
    				{ name: "nextfollowupdate", condition: ">=", value: DateTimestampStart },
    				{ name: "nextfollowupdate", condition: "<=", value: DateTimestampEnd },
    				{ name: "leadstatus", condition: "!=", value: 'enrolled' },
    				{ name: "followupsrequired", condition: "==", value: 'yes' }
    			]
			];
  }
  else
  {
    conditionsArray =
    		[[
    				{ name: "nextfollowupdate", condition: ">=", value: DateTimestampStart },
    				{ name: "nextfollowupdate", condition: "<=", value: DateTimestampEnd },
    				{ name: "leadstatus", condition: "!=", value: 'enrolled' },
    			]
			];
		JoinFullArray[0].conditions.push({name:'servicetype',condition:"==",value:SelectedFilters?.['servicetype']});
  }
  if(ActualLoggedInUser.role==="Customer Support")
  {
    conditionsArray[0].push({ name: "leadowner.value", condition: "==", value:ActualLoggedInUser.id })
  }
  if(ActualLoggedInUser.role==="Customer Support")
  {
   // conditionsArray[0].push({ name: "leadowner.value", condition: "==", value:ActualLoggedInUser.id })
  }
  console.log("ActualLoggedInUser===>",ActualLoggedInUser)
  console.log("conditionsArray===>",conditionsArray)
   LeadsList =await firestoreQueries.SelectSuperComplexConditionsForView(DatabaseName,"leads",conditionsArray,JoinFullArray,"createTime","desc",5000,null);
//let serviceList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services",conditionsArray,"leads","leadid","id");
//console.log("serviceList===>",serviceList)
hideLoading()
       /* if(serviceList.status=="success")
        {
           setLoadData(serviceList.data)
        }*/
        if(LeadsList.data)
        {
          //setTotalDocs(LeadsList.data.length);
        }
        let dataArray = Object.values(LeadsList['data']);
        setLoadData(dataArray)
  }
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
                <CFormLabel >Date Range</CFormLabel>
                <RangePicker
        //onChange={onDateChange}
        onChange={(event) => handleFilterChange(event,'daterange' )}
        value={SelectedFilters?.['daterange']}
        format="YYYY-MM-DD" // Customize date format
        style={{ width: "100%" }}
      />
              {errors.filtertype && (
                      <CFormFeedback invalid>{errors.filtertype}</CFormFeedback>
                  )}
              </CCol>
           <CCol md={4}>
                <CFormLabel >Service Type</CFormLabel>
                <CFormSelect
                    placeholder="Service Type"
                    value={SelectedFilters?.['servicetype']}
                    onChange={(event) => handleFilterChange(event,'servicetype' )}>
                    <option value=''>=Select=</option>
                    <option value='all'>All</option>
                      <option value='rotation'>Rotation</option>
                      <option value='match'>Match</option>
                      <option value='research'>Research</option>
                  </CFormSelect>
                  {errors.filtertype && (
                      <CFormFeedback invalid>{errors.filtertype}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={2}>
              <CFormLabel >Filter</CFormLabel>
              <div>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFilterSubmit()}
                   >

                    Filter
                  </CButton>
                </div>
                </CCol>
                {FiltersApplied && (

                <CCol md={2}>
              <CFormLabel >Clear Filter</CFormLabel>
              <div>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFilterClear()}
                   >

                    Clear
                  </CButton>
                </div>
                </CCol>
                )}

              <p className="text-body-secondary small">
            </p>
            </CForm>
          </CCardBody>

          </CCard>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Leads To Be Followed Between </strong> <small>{SelectedFilters.daterange?.[0]
      ? dayjs(SelectedFilters.daterange[0]).format("DD-MM-YYYY")
      : "Start Date"}{" "}
    and{" "}
    {SelectedFilters.daterange?.[1]
      ? dayjs(SelectedFilters.daterange[1]).format("DD-MM-YYYY")
      : "End Date"}</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
            <CTable color="success" striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Lead ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">First Name<small> (Service Only)</small></CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last Name <small> (Full Lead)</small></CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>

                    <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Follow up Date</CTableHeaderCell>

                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {LoadData.map((item) => {
                  let serviceid=item?.services_Table?.[0]?.id??'';
                  return (
                  <CTableRow>
                    <CTableHeaderCell scope="row">
  <a href={`/admin/leads/updatelead/${item?.id}/${serviceid}`}>
    S{item?.uniqueid}
  </a>
</CTableHeaderCell>
                    <CTableHeaderCell scope="row">
  <a href={`/admin/leads/updatelead/${item?.id}/${serviceid}`}>
    {item?.firstname}
  </a>
</CTableHeaderCell>
                    <CTableDataCell>
                     <a href={`/admin/leads/updatelead/${item?.id}/${serviceid}`}>
    {item?.lastname}
  </a>
                    </CTableDataCell>
                    <CTableDataCell>{item?.email}</CTableDataCell>
                    <CTableDataCell>{item?.phonecountrycode?.phoneCode}{item?.phone}</CTableDataCell>
                    <CTableDataCell>{item.nextfollowupdate?dayjs(new Date(item.nextfollowupdate.seconds * 1000)).format(dateFormat):null}</CTableDataCell>

                  </CTableRow>
                )})}
                </CTableBody>
              </CTable>
            </CCardBody>
        </CCard>
        </CCol>
        </CRow>
  )
}

export default Alerts
