import React, { useState,useEffect,useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CToast,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CRow,
} from '@coreui/react'
import { DatePicker} from "antd";
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
const DatabaseName="LeadTracker";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
let numDdos=0;
const interestedin = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'research', label: 'Research' },
    { value: 'match', label: 'Match' },
    { value: 'steps preparation', label: 'STEPs preparation' },
    { value: 'usmle guidance', label: 'USMLE guidance' },
    { value: 'interview preparations', label: 'Interview Preparations' },
  ];

const Validation =  () => {
const [errors, seterrors] = useState(false)
const [CurrentData, setCurrentData] = useState([])
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries, DatabaseName} = useLoading();
const [toast, addToast] = useState(0)
  const toaster = useRef()

console.log("1111useEffect---->")



useEffect(() => {
console.log("useEffect---->")
fetchData();
console.log("useEffect---->")

  }, []);
  useEffect(() => {

  }, [CurrentData]);
  const fetchData = async () => {
    const DDOLIST=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, "role", "==", "DDO","zone","asc");
    console.log("DDOLIST----->",DDOLIST)
    if(DDOLIST.length)
    {
      setCurrentData(DDOLIST);
    }

  }


  return (
     <CCol xs={12}>
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
                    <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">DDO CODE</CTableHeaderCell>
                    <CTableHeaderCell scope="col">DDO NAME</CTableHeaderCell>
                    <CTableHeaderCell scope="col">ZONE</CTableHeaderCell>
                    <CTableHeaderCell scope="col">DDO EMAIL</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {CurrentData.map((item) => {
                  numDdos++;
                   return (<CTableRow>
                    <CTableDataCell>{numDdos}</CTableDataCell>
                    <CTableHeaderCell scope="row">
  <a href={`/ddo/adddata/${item.id}`} target="_blank">
    {item.ddocode}
  </a>
</CTableHeaderCell>
                    <CTableDataCell>{item?.name}</CTableDataCell>
                    <CTableDataCell>{item?.zone}</CTableDataCell>
                    <CTableDataCell>{item?.email}</CTableDataCell>
                  </CTableRow>)
                })}
                </CTableBody>
              </CTable>
            </CCardBody>
        </CCard>
     </CCol>
  )
}

export default Validation
