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
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CRow,
} from '@coreui/react'
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'

import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
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
const [CurrentData, setCurrentData] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries,DatabaseName } = useLoading();
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
    const SettingsGot=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 100, "sid", "==", 1);
    if(SettingsGot.length)
    {
      console.log("SettingsGot[0]====>",SettingsGot[0])
      setCurrentData(SettingsGot[0])
    }
    //setAdminList()

  }
  const handleFormChange = async (event,name="") =>
  {

    let value;
    if(name==="columntoverify")
    {
      value = Array.from(event.target.selectedOptions, (option) => option.value);
    }
    else if(typeof event.target!="undefined")
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
    else
    {
  	  value=event.label;
    }
    console.log("event====>",event)
    console.log("value====>",value)
    console.log("name====>",name)
    if(name==="step1result" && value==="not taken")
    {
      setCurrentData((prevValues) => ({
    ...prevValues,
    step2ckresult: value,
    step3ckresult: value,
  }));
    }
    setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
  }
  const formValidate = async()=>
  {
    const errors = {};
     console.log("CurrentData====> ",CurrentData)
    if(!CurrentData.sheeturl)
    {
    	errors.sheeturl="Please Enter Google Sheet Url.";
    }
    else if(!isGoogleSheetUrl(CurrentData.sheeturl))
    {
        errors.sheeturl="Please Enter A Valid Google Sheet Url.";
    }
    if(!CurrentData.sheetname)
    {
    	errors.sheetname="Please Select Header Rows.";
    }
    if(!CurrentData.headerrows)
    {
    	errors.headerrows="Please Select Header Rows.";
    }
    if(!CurrentData.labelcolumn)
    {
    	errors.labelcolumn="Please Select Number Of Columns As Labels.";
    }


    return errors;
  }
  const isGoogleSheetUrl = (url) =>
  {
    const googleSheetRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return googleSheetRegex.test(url);
  };
  const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber,countrycode) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, countrycode);
      return parsedNumber && parsedNumber.isValid();

    } catch (e) {
      return false;
    }
  };
  const handleFormSubmit = async () =>
  {
    showLoading()

    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    console.log("CurrentData====> ",CurrentData)
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.sid=1;
      firestoreQueries.updateOrCreateByField(DatabaseName, "settings", "sid","==" ,1, CurrentData).then((result) => {
        console.log("result====>",result)
        const exampleToast = (
    <CToast title="CoreUI for React.js">
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">{result.status}</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>{result.message}</CToastBody>
    </CToast>
  )
        setActionResult(result)
        addToast(exampleToast)
        hideLoading()
      })
     }
     else
     {
       hideLoading()
     }
  }
  function numberToAlphabet(num)
  {
    let result = '';
    while (num > 0)
    {
      num--; // Adjust because alphabet index is 1-based
      result = String.fromCharCode((num % 26) + 65) + result; // 'A' is char code 65
      num = Math.floor(num / 26);
    }
    return result;
}

  return (
    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Lead</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={12}>
                <CFormLabel htmlFor="validationServer01">Google Sheet Url</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Google Sheet Url"
                    value={CurrentData?.sheeturl}
                    invalid={!!errors.sheeturl} // Set `invalid` if there's an error
                    valid={!errors.sheeturl && !!CurrentData?.sheeturl} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'sheeturl' )}
                />
                {errors.sheeturl && (
                      <CFormFeedback invalid>{errors.sheeturl}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Sheet Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Sheet Name"
                    value={CurrentData?.sheetname}
                    invalid={!!errors.sheetname} // Set `invalid` if there's an error
                    valid={!errors.sheetname && !!CurrentData?.sheetname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'sheetname' )}
                />
                {errors.sheetname && (
                      <CFormFeedback invalid>{errors.sheetname}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={6}>
                <CFormLabel >Column To Verify </CFormLabel>
                <CFormSelect  value={CurrentData?.columntoverify}
                    multiple
                    placeholder="Column To Verify"
                    invalid={!!errors.columntoverify} // Set `invalid` if there's an error
                    valid={!errors.columntoverify && !!CurrentData?.columntoverify} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'columntoverify' )}>
                    <option value=''>Select</option>
                    {Array.from({ length: 100 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {numberToAlphabet(i + 1)}
          </option>
        ))}
                  </CFormSelect>

                {errors.columntoverify && (
                      <CFormFeedback invalid>{errors.columntoverify}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={6}>
                <CFormLabel >Header Rows</CFormLabel>
                <CFormSelect  value={CurrentData?.headerrows}
                    placeholder="Header Rows"
                    invalid={!!errors.headerrows} // Set `invalid` if there's an error
                    valid={!errors.headerrows && !!CurrentData?.headerrows} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'headerrows' )}>
                    <option value=''>Select</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                  </CFormSelect>

                {errors.headerrows && (
                      <CFormFeedback invalid>{errors.headerrows}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={6}>
                <CFormLabel>Column As Label</CFormLabel>
                <CFormSelect  value={CurrentData?.labelcolumn}
                    placeholder="Header Rows"
                    invalid={!!errors.labelcolumn} // Set `invalid` if there's an error
                    valid={!errors.labelcolumn && !!CurrentData?.labelcolumn} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'labelcolumn' )}>
                    <option value=''>Select</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                  </CFormSelect>

                {errors.labelcolumn && (
                      <CFormFeedback invalid>{errors.labelcolumn}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Valid Till(Expiry)</CFormLabel>
                <DatePicker className="DatePicker"
        value={CurrentData?.expiry?dayjs(CurrentData?.expiry?.toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event,'expiry' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={4}
         picker="date"
          label="Valid Till(Expiry)"
  		variant="outlined"
      />

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>


                <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Add Settings
                  </CButton>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Validation
