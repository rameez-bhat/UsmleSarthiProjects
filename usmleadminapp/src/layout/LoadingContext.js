import React, { createContext, useState, useContext,useRef } from 'react';
import {handleUpdateOrCreateByConditions,getjointabledata,updateAllHospitalProgramInfoDocs,addOrUpdateDocIds,handleAdd,DeleteDocumentWhere,updateWhereFieldEquals,removePidFromHospital,DeleteDocumentWhereMultiple,deleteFieldFromDocumentWhere,fetchAllJoinData,SelectSuperComplexConditionsForView,deleteDuplicateNotes,deleteFieldFromDocument,getMaxStudentUniqueId,copyFieldToAnotherCollection,updateOrAddFieldInCollection,SelectWithComplexConditionsJoin,deletedocumentfromid,handleUpdateEx,SelectWithComplexConditions,SelectWithWhereAnd,restructureRotationDataResearch,restructureRotationDataMatch,getRecordsWithEnrollmentDateAfter,Timestamp,restructureRotationData2,SelectWithWhereOrAndFetchProfiles,copyCollection,restructureRotationData,SelectWithWhereOr,handleUpdateOrCreateByField, copyDocument,FetchUniqueData,fetchPaginatedDataWithJoin,fetchTotalRecordsCount,fetchAdminDataWithJoin,handleUpdate,FetchDataFromCollection,FetchUniqueDataFull,deleteUser} from 'src/firestore'
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
const ReferralserviceOptions = [
  "B2R Bronze Combo",
  "B2R Gold Combo",
  "B2R Platinum Combo",
  "Bronze",
  "Gold",
  "Platinum",
  "Platinum & Hackensack Combo",
  "Quick IV Prep",
  "Quick IV Prep Plus",
  "IV Prep Interactive",
  "IV Prep OnDemand",
  "Soap Success Plan",
  "Soap Success Plan Plus",
  "Turbo CV +",
  "Turbo Match",
  "Rotation Application",
  "Research",
];

const ReferraldiscountTypes = ["Value", "Percentage"];

const ReferralemptyServiceRow = {
  service: "",
  referralDiscountType: "",
  discountFeeType:"",
  referralDiscountValue: "",
  userDiscountType: "",
  userDiscountValue: "",
};

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
const sendWhatsappMessage = async (whatsappNumber,WhatsappMessage) => {
  const token = "EAAYITGW7caEBPfAcwzL2oHGuFpuImQxNrS7TXzR7ZCealtcE8QWo4Tc3R72Des7YT9LrrOi6gd2LpoaWkGMOrExvdbrE4gyN8i3kKSxBiLA5LMnB6DXEG08PhEIuZBBYqeXx4MZCHMjgZArfiiwRc5LbiMlDXaTdQCb0UrM8H1JFxcLZAPKJjrgZBBTqjAKqQ6ewZDZD";
  const phone_number_id = "793607547166897";
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: whatsappNumber,
    type: "text",
    text: { body: WhatsappMessage },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("✅ WhatsApp API response:", data);
    if(data?.error)
    {
    	return {status:"error",messageid:data?.error?.message}
    }
    return {status:"success",messageid:data.messages?.[0]?.id}
    console.log("✅ WhatsApp API response:", data);
  } catch (err) {
  	 return {status:"error",messageid:err}
    console.error("❌ Error sending message:", err);
  }
};
function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return value.split(',').map(v => v.trim());
  }

  return [];
};
const sendInstagramMessage = async (igUserId, messageText) => {
  // Page Access Token (NOT WhatsApp token!)
  const token = "EAAYITGW7caEBPhGKgWhke5onqpFa8Sz2dZCZCGXxIyzcZA2ddHGRyr6ZAg7sVfBxRoXLWw5moJM0uS7d6WdO5RicIqAvT0wjSGYHSvcQqqZCtsmMAOW13pfNx0JMDRX29EQtFO8m2tas1zqRCFyZB5W8syb2pzA3ZCtjfCzjwxXerf3B9Leq9rq5VdMzw6if5wm6n3yh86ZA1wZDZD";
  const instagramBusinessAccountId = "1604675023121962";
  // This is always the /me/messages endpoint for IG messaging
  //const url = `https://graph.instagram.com/v23.0/me/messages`;
  const url = `https://graph.facebook.com/v23.0/${instagramBusinessAccountId}/messages`;

  const payload = {
    recipient: { id: igUserId }, // Instagram PSID (from webhook sender.id)
    message: { text: messageText },
    messaging_type: "RESPONSE"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("✅ Instagram API response:", data);
    if(data?.error)
    {
    	return {status:"error",messageid:data?.error?.message}
    }
    return { status: "success", messageid: data.message_id };
  } catch (err) {
    console.error("❌ Error sending Instagram message:", err);
    return { status: "error", error: err };
  }
};
const TooltipsPopovers = (status,message,messageHead) => {
setVisible(!visible)
setmessageHead(messageHead)
setmessage(message)
setstatus(status)
console.log("-------->",visible)
return false;
}
  return (
    <LoadingContext.Provider value={{toArray,handleUpdateOrCreateByConditions,ReferralserviceOptions,ReferraldiscountTypes,ReferralemptyServiceRow,sendInstagramMessage,sendWhatsappMessage,getjointabledata,addOrUpdateDocIds,updateAllHospitalProgramInfoDocs,updateWhereFieldEquals,DeleteDocumentWhereMultiple,removePidFromHospital,DeleteDocumentWhere,handleAdd,deleteFieldFromDocumentWhere,fetchAllJoinData,SelectSuperComplexConditionsForView, deleteDuplicateNotes,deleteFieldFromDocument,getMaxStudentUniqueId,copyFieldToAnotherCollection,updateOrAddFieldInCollection,SelectWithComplexConditionsJoin,loading,DatabaseName, showLoading, hideLoading,deletedocumentfromid,handleUpdateEx,SelectWithComplexConditions,SelectWithWhereAnd,restructureRotationDataResearch,restructureRotationDataMatch,getRecordsWithEnrollmentDateAfter,Timestamp,restructureRotationData2,SelectWithWhereOrAndFetchProfiles,copyCollection,restructureRotationData,SelectWithWhereOr,handleUpdateOrCreateByField, copyDocument,FetchUniqueData,fetchPaginatedDataWithJoin,fetchTotalRecordsCount,fetchAdminDataWithJoin,handleUpdate,FetchDataFromCollection,FetchUniqueDataFull,deleteUser,API_KEY,ShowToast,TooltipsPopovers}}>
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
