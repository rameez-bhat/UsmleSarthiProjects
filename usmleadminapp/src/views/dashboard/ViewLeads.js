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
import { useLoading } from '../../layout/LoadingContext';
const DatabaseName="LeadTracker";
const Alerts = () => {
const [LoadData, setLoadData] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [errors, seterrors] = useState(false)
const [toast, addToast] = useState(0)
  const toaster = useRef()
const { showLoading, hideLoading,allCountries,CountryOption,firestoreQueries,countryOfMedicalCollege,medicalSchoolOptions } = useLoading();

useEffect(() => {
console.log("useEffect---->")
fetchData();
console.log("useEffect---->")

  }, []);
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
    fetchData("filter");
  }
  else
  {
    seterrors(errors);
  }

}
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
const fetchData = async (condit="default") => {

  let LeadsList;
  let conditionsArray;
  if(condit==="default")
  {
    LeadsList=await firestoreQueries.fetchData(DatabaseName, "leads",10000 );
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
      LeadsList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArray);
  }

console.log("LeadsList===>",LeadsList)

    /*setMedicalSchoolOptionsList([
          ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);*/
        if(LeadsList.status=="success")
        {
           setLoadData(LeadsList.data)
        }


console.log("LeadsList===>",LeadsList)
  }
  return (

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
                    <option value='firstname'>First Name</option>
                    <option value='lastname'>Last Name</option>
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
            <p className="text-body-secondary small">
            </p>
            <CTable color="success" striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">First Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Last Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {LoadData.map((item) => (
                  <CTableRow>
                    <CTableHeaderCell scope="row">
  <a href={`/leads/updatelead/${item.id}`}>
    {item.firstname}
  </a>
</CTableHeaderCell>
                    <CTableDataCell>{item.lastname}</CTableDataCell>
                    <CTableDataCell>{item?.phonecountrycode?.phoneCode}{item?.phone}</CTableDataCell>
                    <CTableDataCell>{item?.email}</CTableDataCell>
                  </CTableRow>
                ))}
                </CTableBody>
              </CTable>
            </CCardBody>
        </CCard>
        </CCol>
  )
}

export default Alerts
