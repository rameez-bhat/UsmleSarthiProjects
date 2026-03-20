import React, { createContext, useState, useContext,useRef } from 'react';
import firestoreQueries from 'src/firestore'
// Create the context
import {
 CToast,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CTooltip,
  CLink,
  CModalFooter,
  CButton
} from '@coreui/react'

const LoadingContext = createContext();
const allCountries=[];
const countryOfMedicalCollege=[];
const API_KEY = 'AIzaSyBAYjaOcvwnm2cZWxCGEjI0ysOOTHKS4AY';  // From Google Cloud Console
const DatabaseName="LeadTracker";
// Create a provider component


export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toast, addToast] = useState(0)
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);
  const [visible, setVisible] = useState(false)
  const [message, setmessage] = useState('')
  const [messageHead, setmessageHead] = useState('')
  const [status, setstatus] = useState('')
  const toaster = useRef()
const ShowToast = (status,message)=>
{
  const exampleToast = (
    <CToast title="Operation Result" className={status=='success'?'greenborder':'redborder'}>
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
          <rect width="100%" height="100%" fill={status=='success'?'#0bf632':'#ee0c09'}></rect>
        </svg>
        <strong className="me-auto">{status}</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )
  addToast(exampleToast)
}
const TooltipsPopovers = (status,message,messageHead,reload=false) => {
setVisible(!visible)
setmessageHead(messageHead)
setmessage(message)
setstatus(status)
 if (reload) {
    setTimeout(() => {
      window.location.reload();
    }, 1500); // optional delay to show tooltip before reload
  }
console.log("-------->",visible)
return false;
}
  return (
    <LoadingContext.Provider value={{ loading,DatabaseName, showLoading, hideLoading,firestoreQueries,API_KEY,ShowToast,TooltipsPopovers}}>
    <CToaster ref={toaster} push={toast} placement="top-end" />
    <CModal alignment="center" visible={visible}  onClose={() => setVisible(false)} className={status.toLowerCase()=='error'?'redbordermodel':'greenbordermodel'}>
        <CModalHeader>
          <CModalTitle>{status}</CModalTitle>
        </CModalHeader>
        <CModalBody>

          <h5>{messageHead}</h5>
          <p dangerouslySetInnerHTML={{ __html: message }}/>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Ok</CButton>
        </CModalFooter>
      </CModal>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the Loading context
export const useLoading = () => {
  return useContext(LoadingContext);
};
