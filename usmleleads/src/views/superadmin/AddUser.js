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
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'

import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
const Validation =  () => {
const [errors, seterrors] = useState(false)
const [CurrentData, setCurrentData] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers } = useLoading();
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
      //setCurrentData(SettingsGot[0])
    }
    //setAdminList()

  }
  const handleFormChange = async (event,name="") =>
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
    else
    {
  	  value=event.label;
    }
    console.log("event====>",event)
    console.log("value====>",value)
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
    if(!CurrentData.email)
    {
    	errors.email="Please Enter Student Email.";
    }
    else if(CurrentData.email && !validateEmail(CurrentData.email))
    {
    	errors.email="Please Enter A Valid Student Email.";
    }
    if(!CurrentData.password)
    {
    	errors.password="Please Enter Password.";
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
  const FetchRotations = async () =>
  {
    showLoading();
    try
    {
      const response = await axios.post('https://getdatafromotherproject-jwpx2jwsca-uc.a.run.app', { CollectionName: 'Rotations'});
      //console.log("response--------->",response)
      if(response.data.status=="success")
      {
         //console.log("response.data--------->",response.data.data)
         for (const item of response.data.data)
         {
            console.log("item---->",item)
            let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "rotationslist",  item.id, item);
            //await firestoreQueries.deleteDocumentById(DatabaseName, "users",item.id)
         }
      }
      hideLoading();
    }
    catch (error)
    {
    }
  }
  const handleFormSubmit = async () =>
  {
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.sid=1;
        const lowerCaseEmail = CurrentData.email.toLowerCase();
        const lowerCaseName = CurrentData.name.toLowerCase();
         let dataTobesend = {
            name: lowerCaseEmail,
            email: lowerCaseName,
            role: "Customer Support",
          };
        try {
            // Post request to create a new user

            const response = await axios.post('https://addusertoauth-jwpx2jwsca-uc.a.run.app', { StudentEmail: lowerCaseEmail, password:CurrentData.password, StudentName: lowerCaseName });
            console.log("response---->",response)
            console.log("response---->",dataTobesend)
            let uid = response.data.data.uid; // Get the generated uid
            dataTobesend['uid'] = uid;
            let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
             console.log("CreateRes---->",CreateRes)
              TooltipsPopovers(CreateRes.status, "Successfully Created Admin.", CreateRes.status);
            setCurrentData({});
            hideLoading()
          } catch (error) {
          console.log("error---->",error)
            let uid = error.response?.data?.user?.uid;

            dataTobesend['uid'] = uid;
            if (uid) {
             let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
            }
            //setCurrentData({});
 TooltipsPopovers(error.response?.data?.status, error.response?.data?.data, error.response?.data?.status);
        setActionResult({status:"error",message:"User Already Exists."})
         hideLoading()
          }

     }
     else
     {
       hideLoading()
     }
  }

  return (
    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>User</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Email Address</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Email Address"
                    value={CurrentData?.email || ''}
                    invalid={!!errors.email} // Set `invalid` if there's an error
                    valid={!errors.email && !!CurrentData?.email} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'email' )}
                />
                {errors.email && (
                      <CFormFeedback invalid>{errors.email}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Name"
                    value={CurrentData?.name || ''}
                    invalid={!!errors.name} // Set `invalid` if there's an error
                    valid={!errors.name && !!CurrentData?.name} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'name' )}
                />
                {errors.name && (
                      <CFormFeedback invalid>{errors.name}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Password</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Password"
                    value={CurrentData?.password || ''}
                    invalid={!!errors.password} // Set `invalid` if there's an error
                    valid={!errors.email && !!CurrentData?.password} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'password' )}
                />
                {errors.password && (
                      <CFormFeedback invalid>{errors.password}</CFormFeedback>
                  )}
              </CCol>





                <CCol xs={12} className="row">
                <p></p>
                <CCol xs={6}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Add User
                  </CButton>
                  </CCol>
                  <CCol xs={6}>
                  <CButton color="secondary" type="button"
                   onClick={(event) => FetchRotations()}
                   >

                    Fetch Rotations
                  </CButton>
                  </CCol>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Validation
