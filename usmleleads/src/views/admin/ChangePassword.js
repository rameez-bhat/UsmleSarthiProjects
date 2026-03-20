import React, { useState,useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CToaster,
  CModalTitle,
  CPopover,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CToast,
  CToastHeader,
  CToastBody,
  CFormFeedback,
  CAlert,
  CTooltip,
  CFormFloating,
} from '@coreui/react'
import { useLoading } from '../../layout/LoadingContext';
import { signOut,reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

const Modals = ({ActualUser,AuthUser}) => {
const { showLoading, hideLoading,allCountries,CountryOption,firestoreQueries,countryOfMedicalCollege,medicalSchoolOptions } = useLoading();
console.log("ActualUser---->",ActualUser)
console.log("AuthUser---->",AuthUser)
const [errors, seterrors] = useState(false)
const [CurrentData, setCurrentData] = useState({})
const [OperationResult, setOperationResult] = useState({})
const [toast, addToast] = useState(0)
const toaster = useRef()
const exampleToast = (
    <CToast title={OperationResult.status}>
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
        <strong className="me-auto">{OperationResult.status}</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>{OperationResult.message}</CToastBody>
    </CToast>
  )
const handleFormSubmit = async () =>
{
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
     
     const credential = EmailAuthProvider.credential(AuthUser.email, CurrentData.currentpassword);
console.log("credential---->",credential)
    reauthenticateWithCredential(AuthUser, credential).then(() => {
      // After successful re-authentication, update the password
      updatePassword(AuthUser, CurrentData.newpassword).then((result) => {
        console.log("Password updated successfully!",result);
        seterrors({status:"success",submissionmessage:"Password updated successfully!"});
        //setActionResult(result)
        addToast(exampleToast)
        hideLoading()
      }).catch((error) => {
      
        switch (error.code) {
          case 'auth/weak-password':
          	seterrors({status:"Error",submissionmessage:error.message+"(New Password)"});
            break;
          case 'auth/requires-recent-login':
            seterrors({status:"Error",submissionmessage:error.message+"(New Password)"});
            break;
          case 'auth/invalid-password':
          	seterrors({status:"Error",submissionmessage:error.message+"(New Password)"});
            break;
          default:
          	seterrors({status:"Error",submissionmessage:error.message+"(New Password)"});
        }
        hideLoading()
        console.log("Re-authentication failed: ", error.message);
      });
    }).catch((error) => {
    	switch (error.code) {
          case 'auth/wrong-password':
          	seterrors({status:"Error",submissionmessage:"The current password is incorrect."});
            break;
          case 'auth/user-mismatch':
          	seterrors({status:"Error",submissionmessage:"The email provided does not match the signed-in user."});
            break;
          case 'auth/user-not-found':
          	seterrors({status:"Error",submissionmessage:"No user found with this email."});
            break;
          case 'auth/too-many-requests':
          	seterrors({status:"Error",submissionmessage:"Too many failed login attempts. Please try again later."});
            break;
          case 'auth/invalid-credential':
          	seterrors({status:"Error",submissionmessage:"The provided Current credentials are invalid."});
            break;
          default:
          	seterrors({status:"Error",submissionmessage:"Re-authentication failed. Please try again."});
        }
        hideLoading()
      console.log("Re-authentication failed: ", error.message);
    });
     
     
     
     
     
     
     
     
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
     }
     else
     {
       hideLoading()
     }
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
    if(!CurrentData.currentpassword ||  typeof CurrentData.currentpassword==="undefined")
    {
    	errors.currentpassword="Please Enter Current Password.";
    }
    else if(typeof CurrentData.currentpassword!=="undefined" && CurrentData.currentpassword.trim()==="")
    {
    	errors.currentpassword="Please Enter Current Password.";
    }
    if(!CurrentData.newpassword || typeof CurrentData.newpassword==="undefined" )
    {
    	errors.newpassword="Please Enter New Password.";
    }
    else if(typeof CurrentData.newpassword!=="undefined" && CurrentData.newpassword.trim()==="")
    {
    	errors.currentpassword="Please Enter New Password.";
    }
   

    return errors;
  }
  return (
  <>
      <CRow>
	<CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <small>Change Password</small> For User:<strong>{ActualUser.name}</strong> 
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
           {errors.status === "Error" && (
  <CAlert color="danger">
    <strong>{errors.submissionmessage.replaceAll("Firebase:","")}</strong>
  </CAlert>
)}

{errors.status === "success" && (
  <CAlert color="success">
    <strong>{errors.submissionmessage}</strong>
  </CAlert>
)}
            </p>
              <CForm className="row width375">
              <CCol md={12}>
              <CFormFloating className="mb-3">
                <CFormInput type="text"  placeholder="Current Password" onChange={(event) => handleFormChange(event,'currentpassword' )} />
                <CFormLabel htmlFor="floatingInput">Current Password</CFormLabel>
                {errors.currentpassword && (
                      <CFormFeedback invalid>{errors.currentpassword}</CFormFeedback>
                  )}
              </CFormFloating>
                
              </CCol>
               <CCol md={12}>
              <CFormFloating className="mb-3">
                <CFormInput type="text"  placeholder="New Password" onChange={(event) => handleFormChange(event,'newpassword' )} />
                <CFormLabel htmlFor="floatingInput">New Password</CFormLabel>
                {errors.newpassword && (
                      <CFormFeedback invalid>{errors.newpassword}</CFormFeedback>
                  )}
              </CFormFloating>
                
              </CCol>
              <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Change 
                  </CButton>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
      </>
    )

}
export default Modals