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
  CToastClose,
  CFormRange,
   CNav,
  CNavItem,
  CTabContent,
  CTabPane,
  CNavLink,
  CRow,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react'
import ReactSlider from 'react-slider';
import {useParams,useNavigate } from 'react-router-dom';
import { DatePicker} from "antd";
import Select1 from 'react-select';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { countryData } from "../../apis/countryData";
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { Timestamp } from 'firebase/firestore';
const currentYear = new Date().getFullYear();
let serviceNotesToConsider=true;
let ActualLoggedInUser;
let followupindexLoop=0;
let FollowupSequence=0;
let NotesFromServicesOld=""
const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
  let ServiceAdded=false;
const countryOfMedicalCollege = countryData.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag,
    phoneCode: country.phoneCode,
    "FieldName":"CountryOfMedicalSchool",
  }));

let RotationsListFull={};
let RotationOptions=[]
let ResearchPlacePushedOptions=[{value:'c2p',label:'C2P'},{value:'rar',label:'RAR'},{value:'irc',label:'IRC'}]
let AdminOptionsList=[];
const interestedin = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'research', label: 'Research' },
    { value: 'match plan', label: 'Match Plan' },
    { value: 'steps tutorship', label: 'Steps Tutorship' },
    { value: 'soap Preparation Plan', label: 'SOAP Preparation Plan' },
    { value: 'usmle guidance/mentorship', label: 'USMLE Guidance/Mentorship' },
    { value: 'interview preparation plan', label: 'Interview Preparation Plan' },
    { value: 'b2r', label: 'B2R' },
    { value: 'limited licensing options', label: 'Limited Licensing Options' },
    { value: 'eminence ai', label: 'Eminence AI' },
    { value: 'kalpan', label: 'Kalpan' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'other', label: 'Other' },
  ];

const Validation =  (Authuser) => {
ActualLoggedInUser = Authuser.ActualUser;
console.log("ActualLoggedInUser----->",ActualLoggedInUser)
const [errors, seterrors] = useState(false)
const { leadid } = useParams();
const { serviceid } = useParams();
const [CurrentData, setCurrentData] = useState({})
const [ServicesData, setServicesData] = useState([]);
const [FollowUps, setFollowUps] = useState([]);
const [followUpKeys, setFollowUpKeys] = useState([]);
const [followUpKeysChanged, setFollowUpKeysChanged] = useState([]);
const [ActionResult, setActionResult] = useState({});
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries,ShowToast, TooltipsPopovers,DatabaseName  } = useLoading();
const [activeKey, setActiveKey] = useState(null);
const [toast, addToast] = useState(0)
const toaster = useRef()




useEffect(() => {

fetchData();
  }, []);
  useEffect(() => {
 if(CurrentData?.['countryofmedicalcollege'])
	{
		if(CurrentData['countryofmedicalcollege']?.label)
		{
			if(CurrentData['countryofmedicalcollege'].label!=="Others")
			{
				const filtered = medicalSchoolOptions.filter(college => college.includes(", "+CurrentData['countryofmedicalcollege'].label));
    			setMedicalSchoolOptionsList([
          ...filtered.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);
			}
		}

    }
  }, [CurrentData]);
  /*useEffect(() => {
    // Update followUps only when ServicesData changes
    if(ServiceAdded)
    {
      const newFollowUps = {};
    ServicesData.forEach((serviceData, ServiceIndex) => {
      if (serviceData.joinData) {
        newFollowUps[ServiceIndex] = serviceData.joinData;
      }
    });
    setFollowUps(newFollowUps);
      ServiceAdded=false;
    }

  }, [ServicesData]);*/
  const fetchData = async () => {
    showLoading()
     //await firestoreQueries.copyCollection(DatabaseName, "leads", "leadsbk")
    // await firestoreQueries.copyLatestFieldsToOtherCollection(DatabaseName, "followups", "leads")
    ///await firestoreQueries.deleteDocumentsByConditions(DatabaseName, "followups", [[{name:"leadid",condition:'==',value:"9gF21zzZUgL2HVVwL3s9"}]])
    const RotationList=await firestoreQueries.FetchDataFromCollection(DatabaseName, "rotationslist", 1000);
    RotationOptions=[];
 RotationList.map((item) => {
    RotationOptions.push({label:item.location_code,value:item.location_code,locationid:item.id});
    return "h";
    })
    AdminOptionsList=[];
    const adminlist=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role",  "in", ["Customer Support","SuperAdmin"]);
    console.log("adminlist--->",adminlist)
    let conditionsArray=[[{name:'id',condition:'==',value:leadid}]];
    let JoinFullArray=[
  { collection: "services", leftField: "leadid", rightField: "leadid", conditions: [],sortBy:"",sortDir:"asc" },
  { collection: "followups", leftField: "leadid", rightField: "leadid", conditions: [],sortBy:"followupdate",sortDir:"asc" }
];
  console.log("conditionsArray===>",conditionsArray)
  console.log("JoinFullArray===>",JoinFullArray)
    let LeadsList =await firestoreQueries.SelectSuperComplexConditionsForViewbk(DatabaseName,"leads",conditionsArray,JoinFullArray,"createTime","desc",null,null);
  console.log("LeadsList===>",LeadsList)
    if(LeadsList.TotalRecords)
    {
      if(LeadsList.TotalRecords?.['finalresult'])
      {
          let TotalRecords=LeadsList.TotalRecords?.['finalresult']
      }
    }
    //const LeadData=await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "id", "==", leadid);
    conditionsArray=[[{name:'leadid',condition:'==',value:leadid}]]
    //const serviceswithJoin=await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services", conditionsArray, 'followups','id','serviceid');

    //const services=await firestoreQueries.FetchDataFromCollection(DatabaseName, "services", 100, "leadid", "==", leadid);
    //console.log("LeadData---->",LeadData)
    //console.log("services---->",services)
    //if(serviceswithJoin.status==="success")
    {
      //ServiceAdded=true;
      //setServicesData(serviceswithJoin.data)
    }
    if(LeadsList.status=="success")
    {
      //setCurrentData(LeadData[0]);

      ServiceAdded=true;
      setServicesData(LeadsList['data'][leadid]?.['services_Table'] || {})
      setFollowUps(LeadsList['data'][leadid]?.['followups_Table'] || {})
      setFollowUpKeys(Object.keys(LeadsList['data'][leadid]?.['followups_Table'] || {}));
      if (LeadsList?.data?.[leadid]?.services_Table)
      {
        delete LeadsList.data[leadid].services_Table;
      }
      if (LeadsList?.data?.[leadid]?.followups_Table)
      {
        delete LeadsList.data[leadid].followups_Table;
      }
      setCurrentData(LeadsList['data'][leadid]);
    }

    /*setMedicalSchoolOptionsList([
          ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);*/

    adminlist.map((item) => {
    AdminOptionsList.push({label:item.name,value:item.uid,name:item.name});
    return "h";
    })

    //setAdminList()
    hideLoading()

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
    if(!CurrentData.firstname)
    {
    	errors.firstname="Please Enter First Name.";
    }
    if(!CurrentData.lastname)
    {
    	errors.lastname="Please Enter Last Name.";
    }
    if(!CurrentData.email)
    {
    	errors.email="Please Enter Email.";
    }
    else if(CurrentData.email && !validateEmail(CurrentData.email))
    {
    	errors.email="Please Enter A Valid Email.";
    }
    if(CurrentData.phonecountrycode && !CurrentData.phone)
    {
    	errors.phone="Please Enter A Valid Phone.";
    }
    else if(!CurrentData.phonecountrycode && CurrentData.phone)
    {
    	errors.phonecountrycode="Please Select Country Code.";
    }
    else if(CurrentData.phonecountrycode && CurrentData.phone &&  !validatePhoneNumber(CurrentData.phone,CurrentData.phonecountrycode.value))
    {
    	errors.phone="Please Enter A Valid Phone.";
    }

    return errors;
  }
  const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber, countrycode) => {
    // Ensure phoneNumber is a string
    if (typeof phoneNumber !== 'string') {
        phoneNumber = String(phoneNumber);
    }

    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
        return false;
    }

    try {
        // Use the provided country code to parse the number
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
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
        if(CurrentData?.email)
        {
          CurrentData.email=CurrentData.email.toLowerCase()
        }
       //CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.lastupdatedby=ActualLoggedInUser;
       const conditionsArrayGet =
    		[
  				[
    				{ name: "email", condition: "==", value:CurrentData.email },
    				{ name: "id", condition: "!=", value: leadid }
  				]
  			];
  			console.log("conditionsArrayGet=====>",conditionsArrayGet)

      const LeadsListlast =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArrayGet,"","","","uniqueid","desc",1,null);
      console.log("LeadsListlast=====>",LeadsListlast)
      if(LeadsListlast.data.length)
      {

        const uidl = LeadsListlast.data[0].id;
        const messageHead = `For Details Of User Please <a href='/admin/leads/updatelead/${uidl}'>Click Here</a>`;
        hideLoading();
        TooltipsPopovers("Error", messageHead, "Already Exists");
      }
      else
      {
        firestoreQueries.updateOrCreateByField(DatabaseName, "leads",[{fieldName: "id",operator:"==" ,value:leadid}], CurrentData).then((result) => {
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
     }
     else
     {
       hideLoading()
     }
  }
  const handleFormServiceChange = async (event, name = "", level = null, sublevel = null) => {
    let value;

    // Determine value based on event type
    if (name === "whycontacted") {
        value = Array.from(event.target.selectedOptions, (option) => option.value);
    } else if (name === "budgetofservice") {
        value = event;
    } else if (event.target) {
        value = event.target.value;
    } else if (event.$d) {
        value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
        value = Timestamp.fromDate(new Date(value));
    } else if (event.label) {
        value = event;
    } else if (event?.[0]?.label) {
        value = event;
    } else {
        value = event.label;
    }

    console.log("name====>", name);
    console.log("value====>", value);
    console.log("event====>", event);

    setServicesData((prevValues) => {
        const updatedValues = { ...prevValues }; // Ensure it's an object

        if (sublevel !== null) {
            // Ensure `level` and `sublevel` exist as objects
            if (!updatedValues[level]) updatedValues[level] = {};
            if (!updatedValues[level][sublevel]) updatedValues[level][sublevel] = {};

            updatedValues[level][sublevel][name] = value;

            if (name === "servicetype") {
                updatedValues[level][sublevel]["servicename"] = value;
            }
        }
        else if (level !== null) {
            // Ensure `level` exists as an object
            if (!updatedValues[level]) updatedValues[level] = {};

            updatedValues[level][name] = value;

            if (name === "servicetype") {
                updatedValues[level]["servicename"] = value;
            }
        }
        else {
            updatedValues[name] = value;

            if (name === "servicetype") {
                updatedValues["servicename"] = value;
            }
        }

        return updatedValues;
    });
}
  const fetchFollowups = async () =>
  {

  }
  const handleFormFollowupChange = async (event, name = "",level=null,sublevel=null) => {
    let value;
    if(name==="whycontacted")
    {
      value = Array.from(event.target.selectedOptions, (option) => option.value);
    }
    else if (event.target) {
      value = event.target.value;
    } else if (event.$d) {
      value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
      value = Timestamp.fromDate(new Date(value));
    } else if (event.label) {
      value = event;
    } else if (event?.[0]?.['label']) {
      value = event;
    } else {
      value = event.label;
    }
    setFollowUpKeysChanged(prevValues => ({
  ...prevValues,
  [level]: level
}));
   setFollowUps(prevValues => {
        const updatedValues = { ...prevValues };

        if (sublevel !== null) {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            if (!updatedValues[level][sublevel]) {
                updatedValues[level][sublevel] = {};
            }
            updatedValues[level][sublevel][name] = value;
        } else if (level !== null) {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            updatedValues[level][name] = value;
        } else {
            updatedValues[name] = value;
        }
        return updatedValues;
    });

  }
 const AddServices = () => {
  ServiceAdded = true;

  setServicesData((prevServices) => {

    if (Object.keys(prevServices).length >= 3) {
      // Show error tooltip if the maximum limit is reached
      TooltipsPopovers("Error", "You Can Add A Maximum of 3 Services", "Maximum Limit Reached");
      return prevServices; // Return existing services without adding a new one
    } else {
      // Add a new service and show success tooltip
      TooltipsPopovers("Success", "Service Added Successfully", "Added");

      const newServiceIndex = Object.keys(prevServices).length + 1;

      return {
        ...prevServices,
        [newServiceIndex]: {
          servicename: `Service ${newServiceIndex}`,
          description: `Description ${newServiceIndex}`
        }
      };
    }
  });

  return false;
};
  const AddFollowup = (servicename) => {
followupindexLoop++;
console.log("FollowUps---->",FollowUps)

  setFollowUps(prevFollowUps => ({
    ...prevFollowUps,
    [servicename]: { name: '', description: '' }
  }));
  setFollowUpKeys(prevKeys => [...prevKeys, servicename]);
  };
  const validateService = async (service,servicenumber) =>
  {
    const errors = {};
    if(!service.servicetype)
    {
      errors.servicetype="Please Select Service Type.";
    }
  /*  if(!service.contactsource)
    {
      errors.contactsource="Please Select Contact Source.";
    }
    if(typeof service.followupsrequired==="undefined")
    {
      errors.followupsrequired="Please Select Follow Up Required."
    }
    else if(service.followupsrequired==="yes")
    {
      if(typeof service.nextfollowupdate==="undefined")
      {
          errors.nextfollowupdate="Please Select Next Follow Up Date."
      }
    }*/

    return errors;
  }
  const DeleteFollowup = async(Followupid,FollowupIndex) =>
  {
      if(typeof Followupid!=="undefined")
      {
         const DeletionCondition=[
                              [
                                { name: "id", condition: "==", value: Followupid }
                              ]
                            ];
        let RetResultFollowups= await firestoreQueries.deleteDocumentsByConditions(DatabaseName,"followups",DeletionCondition);
        if(RetResultFollowups['status']==="success")
        {
          TooltipsPopovers(RetResultFollowups['status'],RetResultFollowups['message'],"Status");
          fetchData();
        }
      }
      else
      {
       setFollowUps((prevFollowUps) => {
  // Create a shallow copy of the object
  const updatedFollowUps = { ...prevFollowUps };

  // Delete the property at FollowupIndex
  delete updatedFollowUps[FollowupIndex];
  setFollowUpKeys(prevKeys => prevKeys.filter(key => key !== FollowupIndex));
  // Return the updated object
  return updatedFollowUps;
});
    TooltipsPopovers("success","Deleted Successfully!","Status");
          fetchData();
      }

  }
  const UpdateService = async(servicenumber) =>
  {
    showLoading()
    const validationErrors = await validateService(ServicesData[servicenumber],servicenumber);
    seterrors((prevErrors) => ({
  ...prevErrors,
  services: {
    ...prevErrors.service,
    [servicenumber]: validationErrors
  }
}));
  if(Object.keys(validationErrors).length === 0)
  {
    let condition=[];
    ServicesData[servicenumber].lastupdatedby=ActualLoggedInUser;
    ServicesData[servicenumber].updateTime=firestoreQueries.Timestamp.fromDate(new Date());
    if(typeof ServicesData[servicenumber].id!=="undefined")
    {
      condition=[{fieldName:'id',operator:'==',value:ServicesData[servicenumber].id}];
    }
    else
    {
      ServicesData[servicenumber].createdby=ActualLoggedInUser;
      ServicesData[servicenumber].createTime=firestoreQueries.Timestamp.fromDate(new Date());
      condition=[{fieldName:'servicename',operator:'==',value:ServicesData[servicenumber].servicename},{fieldName:'leadid',operator:'==',value:leadid}]
    }
        const result = await firestoreQueries.updateOrCreateByField(DatabaseName, "services",condition, ServicesData[servicenumber])
        TooltipsPopovers(result.status, result.message, result.status);
        hideLoading()
  }
  else
  {
     TooltipsPopovers("error", "Please Fill All Required Fields", "Error");
    hideLoading()
  }
  }
 const extractSeasonYear = (str) => {
  if (!str || typeof str !== "string") return str;

  const match = str.match(/season\s+(\d{4})/i);
  if (match) return Number(match[1]);

  if (/^\d{4}$/.test(str.trim())) return str.trim();

  return str;
};

  const validateFollowups = async() =>
  {
    const errors = {};
    Object.entries(FollowUps).map(([ServiceIndex,followupdata],index) =>
    {

      if(typeof followupdata.followupdate==="undefined")
      {
        if(typeof errors.followupdata==="undefined")
        {
          errors.followupdata={};
        }
          if(typeof errors.followupdata[ServiceIndex]==="undefined")
          {
            errors.followupdata[ServiceIndex]={};
          }
          errors.followupdata[ServiceIndex].followupdate = "Please Select Follow-up Date."
      }
      if(typeof followupdata.mode==="undefined")
      {
        if(typeof errors.followupdata==="undefined")
        {
          errors.followupdata={};
        }
        if(typeof errors.followupdata[ServiceIndex]==="undefined")
        {
          errors.followupdata[ServiceIndex]={};
        }
        errors.followupdata[ServiceIndex].mode="Please Select Mode Of Follow-up."
      }

    })
    return errors;
  }
const SaveFollowups = async () => {
  showLoading();
  const validationErrors = await validateFollowups();



  if (Object.keys(validationErrors).length === 0) {

    let condition = [];
    const updatedFollowUps = { ...FollowUps }; // Avoid multiple re-renders

    for (const [ServiceIndex, followupdata] of Object.entries(followUpKeysChanged)) {
      const followupdataSend = { ...FollowUps[ServiceIndex], lastupdatedby: ActualLoggedInUser };
      followupdataSend.updateTime = firestoreQueries.Timestamp.fromDate(new Date());
      if (followupdataSend?.id) {
        condition = [{ fieldName: "id", operator: "==", value: followupdataSend.id }];

      } else {
        FollowupSequence++;
        condition = [
          { fieldName: "numbersequence", operator: "==", value: FollowupSequence },
          { fieldName: "leadid", operator: "==", value: leadid },
        ];
        //condition=[];
        followupdataSend.createTime = firestoreQueries.Timestamp.fromDate(new Date());
        followupdataSend.createdby=ActualLoggedInUser
        followupdataSend.numbersequence = FollowupSequence;
        followupdataSend.leadid = leadid;
      }

      updatedFollowUps[ServiceIndex] = followupdataSend;

      if (Object.keys(followUpKeysChanged).indexOf(ServiceIndex) === 0) {
        const CurrentDataLeads = { updateTime: firestoreQueries.Timestamp.fromDate(new Date()) };
        await firestoreQueries.updateOrCreateByField(DatabaseName, "leads", [{ fieldName: "id", operator: "==", value: leadid }], CurrentDataLeads);
      }
      await firestoreQueries.updateOrCreateByField(DatabaseName, "followups", condition, followupdataSend);
    }

   //setFollowUps(updatedFollowUps); // State update once at the end
    TooltipsPopovers("success", "Updated Successfully!", "Success",true);
    hideLoading();
  } else {
  seterrors(prevErrors =>
    JSON.stringify(prevErrors) !== JSON.stringify(validationErrors) ? validationErrors : prevErrors
  );
    TooltipsPopovers("error", "Please Fill All Required Fields", "Error");
    hideLoading();
  }
};

NotesFromServicesOld = Object.values(ServicesData)
  .map(service => service.servicenotes || "")
  .join("\n");
  console.log("NotesFromServicesOld===>",NotesFromServicesOld)
  console.log("CurrentData?.leadnotes===>",CurrentData?.leadnotes)
  const leadNotesStr = String(CurrentData?.leadnotes || "");
  if (leadNotesStr.includes(NotesFromServicesOld)) {
    NotesFromServicesOld='';
}
if(serviceNotesToConsider)
{
  CurrentData.leadnotes=CurrentData.leadnotes+"\n"+NotesFromServicesOld;
  serviceNotesToConsider=false;
}
return (

    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Lead</strong> <small>Update <strong className="LeadIdShow">L{CurrentData?.uniqueid}</strong></small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={4}>
                <CFormLabel htmlFor="validationServer01">First Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="First Name"
                    value={CurrentData?.firstname || ''}
                    invalid={!!errors.firstname} // Set `invalid` if there's an error
                    valid={!errors.firstname && !!CurrentData?.firstname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'firstname' )}
                />
                {errors.firstname && (
                      <CFormFeedback invalid>{errors.firstname}</CFormFeedback>
                  )}
              </CCol>
                <CCol md={4}>
                <CFormLabel >Last Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Last Name"
                    value={CurrentData?.lastname || ''}
                    invalid={!!errors.lastname} // Set `invalid` if there's an error
                    valid={!errors.firstname && !!CurrentData?.lastname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'lastname' )}
                />
                {errors.lastname && (
                      <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Email</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.email || ''}
                    placeholder="Email"
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
              <CInputGroup className="mb-3">
                <CCol md={2.2}>
                  <CFormLabel >Country Code</CFormLabel>
                  <Select1
        value={CurrentData?.phonecountrycode || ''}
        onChange={(event) => handleFormChange(event,'phonecountrycode')}
        options={allCountries}
        placeholder="Country Code"
         invalid={!!errors.phonecountrycode}
          valid={!errors.phonecountrycode && !!CurrentData?.phonecountrycode}
        isSearchable
        formatOptionLabel={CountryOption}
      />
                   {errors.phonecountrycode && (
                      <CFormFeedback invalid>{errors.phonecountrycode}</CFormFeedback>
                  )}
                </CCol>
                 <CCol md={0.1}>
                <CFormLabel>-</CFormLabel>
                <CInputGroupText>-</CInputGroupText>
                 </CCol>
                <CCol md={1.7}>
                <CFormLabel >Phone Without Country Code</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.phone || ''}
                    placeholder="Phone Without Country Code"
                    invalid={!!errors.phone} // Set `invalid` if there's an error
                    valid={!errors.phone && !!CurrentData?.phone} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'phone' )}
                />
                {errors.phone && (
                      <CFormFeedback invalid>{errors.phone}</CFormFeedback>
                  )}
              </CCol>

                </CInputGroup>
                </CCol>
                 <CCol md={4}>
                <CFormLabel >Sarthi Student</CFormLabel>
                <CFormSelect  value={CurrentData?.sarthistudent || ''}
                    placeholder="Sarthi Student"
                    invalid={!!errors.sarthistudent} // Set `invalid` if there's an error
                    valid={!errors.sarthistudent && !!CurrentData?.sarthistudent} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'sarthistudent' )}>
                    <option value='no'>No</option>
                    <option value='yes'>Yes</option>
                    <option value='do not know'>Do Not Know</option>
                  </CFormSelect>

                {errors.sarthistudent && (
                      <CFormFeedback invalid>{errors.sarthistudent}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Inquery Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={CurrentData?.inquerydate ? dayjs(CurrentData?.inquerydate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'inquerydate')}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Inquery Date"
                  variant="outlined"
                />
                {errors.inquerydate && (
                  <CFormFeedback invalid>{errors.inquerydate}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Interested In</CFormLabel>
                <Select1  value={CurrentData?.interestedin || ''}
                    placeholder="Interested In"
                    invalid={!!errors.interestedin} // Set `invalid` if there's an error
                    valid={!errors.interestedin && CurrentData?.interestedin} // Set `valid` if no error and value exists
                    required
                    isMulti
                    closeMenuOnSelect={false}
                    options={interestedin}
                    onChange={(event) => handleFormChange(event,'interestedin' )}>
                  </Select1>

                {errors.interestedin && (
                      <CFormFeedback invalid>{errors.interestedin}</CFormFeedback>
                  )}
              </CCol>
              {(CurrentData?.interestedin ?? []).some(item => item.value === 'other') && (
                  <CCol md={4}>
                <CFormLabel >Interested In Other Define</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.interestedinother || ''}
                    placeholder="Interested In Other Define"
                    invalid={!!errors.interestedinother} // Set `invalid` if there's an error
                    valid={!errors.interestedinother && !!CurrentData?.interestedinother} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'interestedinother' )}
                />
                {errors.interestedinother && (
                      <CFormFeedback invalid>{errors.interestedinother}</CFormFeedback>
                  )}
              </CCol>
              )}
              <CCol md={4}>
                <CFormLabel >Lead Created By</CFormLabel>
                <Select1  value={CurrentData?.leadcreatedby || ''}
                    placeholder="Lead Created By"
                    invalid={!!errors.leadcreatedby} // Set `invalid` if there's an error
                    valid={!errors.leadcreatedby && CurrentData?.leadcreatedby} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={true}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event,'leadcreatedby' )}>
                  </Select1>

                {errors.leadcreatedby && (
                      <CFormFeedback invalid>{errors.leadcreatedby}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>Lead Owner</CFormLabel>
                <Select1  value={CurrentData?.leadowner || ''}
                    placeholder="Lead Owner"
                    invalid={!!errors.leadowner} // Set `invalid` if there's an error
                    valid={!errors.leadowner && CurrentData?.leadowner} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={true}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event,'leadowner' )}>
                  </Select1>

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>

              <CCol md={4}>
                <CFormLabel >YOG</CFormLabel>
                <DatePicker className="DatePicker"
        value={CurrentData?.yog?dayjs(CurrentData?.yog?.toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event,'yog' )}
        dateFormat="yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="year"
          label="YOG"
  		variant="outlined"
      />

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Step 1 Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step1result || ''}
                    placeholder="Step 1 Result"
                    invalid={!!errors.step1result} // Set `invalid` if there's an error
                    valid={!errors.step1result && !!CurrentData?.step1result} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step1result')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='pass'>Pass</option>
                    <option value='fail'>Fail</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step1result && (
                      <CFormFeedback invalid>{errors.step1result}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step1result === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 1 Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step1score || ''}
                    placeholder="Step 1 Score"
                    invalid={!!errors.step1score} // Set `invalid` if there's an error
                    valid={!errors.step1score && !!CurrentData?.step1score} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step1score' )}
                />
                {errors.step1score && (
                      <CFormFeedback invalid>{errors.step1score}</CFormFeedback>
                  )}
              </CCol>
               )}
                <CCol md={4}>
                <CFormLabel >Step 2 CK Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step2ckresult || ''}
                    placeholder="Step 2 CK Result"
                    invalid={!!errors.step2ckresult} // Set `invalid` if there's an error
                    valid={!errors.step2ckresult && !!CurrentData?.step2ckresult} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step2ckresult')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step2ckresult && (
                      <CFormFeedback invalid>{errors.step2ckresult}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step2ckresult === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 2 CK Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step2ckscore || ''}
                    placeholder="Step 2 CK Score"
                    invalid={!!errors.step2ckscore} // Set `invalid` if there's an error
                    valid={!errors.step2ckscore && !!CurrentData?.step2ckscore} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step2ckscore' )}
                />
                {errors.step2ckscore && (
                      <CFormFeedback invalid>{errors.step2ckscore}</CFormFeedback>
                  )}
              </CCol>
               )}
               <CCol md={4}>
                <CFormLabel >Step 3 CK Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step3ckresult || ''}
                    placeholder="Step 3 CK Result"
                    invalid={!!errors.step3ckresult} // Set `invalid` if there's an error
                    valid={!errors.step3ckresult && !!CurrentData?.step3ckresult} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step3ckresult')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step3ckresult && (
                      <CFormFeedback invalid>{errors.step3ckresult}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step3ckresult === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 3 CK Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step3ckscore  || ''}
                    placeholder="Step 3 CK Score"
                    invalid={!!errors.step3ckscore} // Set `invalid` if there's an error
                    valid={!errors.step3ckscore && !!CurrentData?.step3ckscore} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step3ckscore' )}
                />
                {errors.step3ckscore && (
                      <CFormFeedback invalid>{errors.step3ckscore}</CFormFeedback>
                  )}
              </CCol>
               )}
                <CCol md={6}>
                <CFormLabel >Match Application Season{extractSeasonYear(CurrentData?.matchapplicationsession) || ''}</CFormLabel>
                <CFormSelect
                value={extractSeasonYear(CurrentData?.matchapplicationsession) || ''}
                    placeholder="Match Application Season"
                    invalid={!!errors.step2ckresult} // Set `invalid` if there's an error
                    valid={!errors.matchapplicationsession && !!CurrentData?.matchapplicationsession} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'matchapplicationsession')}>
                    <option key='' value=''>=Select=</option>
                    {!MatchSessionList.includes(extractSeasonYear(CurrentData?.matchapplicationsession)) && CurrentData?.matchapplicationsession && CurrentData?.matchapplicationsession!=="undecided/later" && (
                    <option key={CurrentData.matchapplicationsession} value={CurrentData.matchapplicationsession}>{`Match Season ` + CurrentData.matchapplicationsession + ` (Sept ` + (CurrentData.matchapplicationsession - 1) + `)`}</option>
    )}
                    {MatchSessionList.map((item) => (
                    <option key={item} value={item}>{`Match Season `+item+` (Sept `+(item-1)+`)`}</option>
                    ))}
                    <option value='undecided/later'>Undecided/Later</option>
                  </CFormSelect>

                {errors.matchapplicationsession && (
                      <CFormFeedback invalid>{errors.matchapplicationsession}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                  <CFormLabel >Country Of Medical College</CFormLabel>
                  <Select1
        value={CurrentData?.countryofmedicalcollege  || ''}
        onChange={(event) => handleFormChange(event,'countryofmedicalcollege')}
        options={countryOfMedicalCollege}
        placeholder="Country Code"
         invalid={!!errors.countryofmedicalcollege}
          valid={!errors.countryofmedicalcollege && CurrentData?.countryofmedicalcollege}
        isSearchable
        formatOptionLabel={CountryOption}
      />
                   {errors.countryofmedicalcollege && (
                      <CFormFeedback invalid>{errors.countryofmedicalcollege}</CFormFeedback>
                  )}
                </CCol>
                <CCol md={4}>
                  <CFormLabel >Medical college name</CFormLabel>
                  <Select1
        value={CurrentData?.nameofmedicalcollege || ''}
        onChange={(event) => handleFormChange(event,'nameofmedicalcollege')}
        variant="outlined"
         invalid={!!errors.nameofmedicalcollege}
        valid={!errors.nameofmedicalcollege && CurrentData?.nameofmedicalcollege}
        options={medicalSchoolOptionsList}
        placeholder="Name of Medical School"
        label="Name of Medical School"
        title="Name of Medical School"
        isSearchable
      />
                   {errors.nameofmedicalcollege && (
                      <CFormFeedback invalid>{errors.nameofmedicalcollege}</CFormFeedback>
                  )}
                </CCol>
                {CurrentData?.['nameofmedicalcollege']?.['value'] === 'Others' && (
                  <CCol md={4}>
                <CFormLabel >Other Name</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.nameofmedicalschoolother  || ''}
                    placeholder="Other Name"
                    invalid={!!errors.nameofmedicalschoolother} // Set `invalid` if there's an error
                    valid={!errors.nameofmedicalschoolother && CurrentData?.nameofmedicalschoolother} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'nameofmedicalschoolother' )}
                />
                {errors.nameofmedicalschoolother && (
                      <CFormFeedback invalid>{errors.nameofmedicalschoolother}</CFormFeedback>
                  )}
              </CCol>
                )}
                <CCol md={4}>
                <CFormLabel >Visa Status</CFormLabel>
                <CFormSelect  value={CurrentData?.visastatus || ''}
                    placeholder="Visa Status"
                    invalid={!!errors.visastatus} // Set `invalid` if there's an error
                    valid={!errors.visastatus && !!CurrentData?.visastatus} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'visastatus')}>
                    <option value=''>=Select=</option>
                    <option value='dont know'>Don’t Know</option>
                    <option value='required'>Required</option>
                    <option value='not required'>Not Required</option>
                  </CFormSelect>

                {errors.visastatus && (
                      <CFormFeedback invalid>{errors.visastatus}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Lead Notes</CFormLabel>
                <CFormTextarea
                  type="text"
                  placeholder="Lead Notes"
                  rows="4"
                  value={CurrentData?.leadnotes }
                  invalid={!!errors.leadnotes}
                  valid={!errors.leadnotes && !!CurrentData?.leadnotes}
                  required
                  onChange={(event) => handleFormChange(event, 'leadnotes')}
                >
                </CFormTextarea>
                {errors.leadnotes && (
                  <CFormFeedback invalid>{errors.leadnotes}</CFormFeedback>
                )}
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
              <CCol md={6}>
                <CFormLabel >Contact Source</CFormLabel>
                <CFormSelect value={CurrentData?.contactsource || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.contactsource}
                        valid={!errors?.contactsource && !!CurrentData?.contactsource}
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
              {(CurrentData?.contactsource  === "calendly booking") && (
                  <>
                       <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } (Status of Meeting)</CFormLabel>
                <CFormSelect value={CurrentData?.contactsourcesstatusofmeeting || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.contactsourcesstatusofmeeting}
                        valid={!errors?.contactsourcesstatusofmeeting && !!CurrentData?.contactsourcesstatusofmeeting}
                        required
                        onChange={(event) => handleFormChange(event, 'contactsourcesstatusofmeeting')}>
                 <option value='attended'>Attended</option>
                    <option value='no show'>No Show</option>
                </CFormSelect>
                 {errors?.contactsourcesstatusofmeeting && (
                  <CFormFeedback invalid>{errors?.contactsourcesstatusofmeeting}</CFormFeedback>
                )}
              </CCol>
                  </>
              )}
              {(CurrentData?.contactsource  === "event") && (
               <>
                 <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Name</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.contactsourceseventname || '' || ''}
                    placeholder={`${CurrentData?.contactsource } Name`}
                    invalid={!!errors?.contactsourceseventname} // Set `invalid` if there's an error
                    valid={!errors?.contactsourceseventname && !!CurrentData?.contactsourceseventname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event, 'contactsourceseventname')}
                />
                {errors?.contactsourceseventname && (
                  <CFormFeedback invalid>{errors?.contactsourceseventname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={CurrentData?.contactsourceseventdate ? dayjs(CurrentData?.contactsourceseventdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'contactsourceseventdate')}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label={`${CurrentData?.contactsource } Date`}
                  variant="outlined"
                />
                {errors?.contactsourceseventdate && (
                  <CFormFeedback invalid>{errors?.contactsourceseventdate}</CFormFeedback>
                )}
              </CCol>
               </>
               )}
              {(CurrentData?.contactsource  === "via team member") && (
               <>

               <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Name</CFormLabel>
                <Select1  value={CurrentData?.contactsourceviateammembername || ''}
                    placeholder="Name Team Member"
                    invalid={!!errors.contactsourceviateammembername} // Set `invalid` if there's an error
                    valid={!errors.contactsourceviateammembername && CurrentData?.contactsourceviateammembername} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={true}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event, 'contactsourceviateammembername')}>
                  </Select1>

                {errors.contactsourceviateammembername && (
                      <CFormFeedback invalid>{errors.contactsourceviateammembername}</CFormFeedback>
                  )}
              </CCol>

               </>
               )}
              {(CurrentData?.contactsource  === "webinar/workshop") && (
               <>
                 <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Name</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.contactsourcespecialtywebinarworkshopname || '' }
                    placeholder={`${CurrentData?.contactsource } Name`}
                    invalid={!!errors?.contactsourcespecialtywebinarworkshopname} // Set `invalid` if there's an error
                    valid={!errors?.contactsourcespecialtywebinarworkshopname && !!CurrentData?.contactsourcespecialtywebinarworkshopname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event, 'contactsourcespecialtywebinarworkshopname')}
                />
                {errors?.contactsourcespecialtywebinarworkshopname && (
                  <CFormFeedback invalid>{errors?.contactsourcespecialtywebinarworkshopname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={CurrentData?.contactsourcespecialtywebinarworkshopdate ? dayjs(CurrentData?.contactsourcespecialtywebinarworkshopdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'contactsourcespecialtywebinarworkshopdate')}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label={`${CurrentData?.contactsource } Date`}
                  variant="outlined"
                />
                {errors?.contactsourcespecialtywebinarworkshopdate && (
                  <CFormFeedback invalid>{errors?.contactsourcespecialtywebinarworkshopdate}</CFormFeedback>
                )}
              </CCol>
               </>
               )}
              {(CurrentData?.contactsource  === "rotation enquiry residency website") && (
               <>
                <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Specialty</CFormLabel>
                <CFormSelect value={CurrentData?.contactsourcespecialty?.toLowerCase() || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.contactsourcespecialty}
                        valid={!errors?.contactsourcespecialty && !!CurrentData?.contactsourcespecialty}
                        required
                        onChange={(event) => handleFormChange(event, 'contactsourcespecialty')}>
                <option value=''>=Select=</option>
                 <option value='internal medicine'>Internal Medicine</option>
                    <option value='family medicine'>Family Medicine</option>
                    <option value='pediatrics'>pediatrics</option>
                    <option value='psychiatry'>psychiatry</option>
                    <option value='pathology'>pathology</option>
                    <option value='general surgery'>General Surgery</option>
                    <option value='obgyn'>obgyn</option>
                    <option value='internal medicine/pediatrics'>Internal Medicine/Pediatrics</option>
                    <option value='other'>Other</option>
                </CFormSelect>
                 {errors?.contactsourcespecialty && (
                  <CFormFeedback invalid>{errors?.contactsourcespecialty}</CFormFeedback>
                )}
              </CCol>
               <CCol md={6}>
                      <CFormLabel >Our Response</CFormLabel>
                      <CFormSelect value={CurrentData?.ourresponse || ''}
                        placeholder="Our Response"
                        invalid={!!errors?.ourresponse}
                        valid={!errors?.ourresponse && !!CurrentData?.ourresponse}
                        required
                        onChange={(event) => handleFormChange(event, 'ourresponse')}>
                        <option value=''>=Select=</option>
                        <option value='accepted'>Accepted</option>
                        <option value='Rejected'>Rejected</option>
                      </CFormSelect>
                      {errors?.ourresponse && (
                  <CFormFeedback invalid>{errors?.ourresponse}</CFormFeedback>
                )}
                    </CCol>
                {(CurrentData?.contactsourcespecialty  === "other") && (
                  <>
                     <CCol md={4}>
                <CFormLabel >{CurrentData?.contactsource } Specialty({CurrentData?.contactsourcespecialty }) Define</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.contactsourcespecialtyother || ''}
                    placeholder="Other"
                    invalid={!!errors?.contactsourcespecialtyother} // Set `invalid` if there's an error
                    valid={!errors?.contactsourcespecialtyother && !!CurrentData?.contactsourcespecialtyother} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event, 'contactsourcespecialtyother')}
                />
                {errors?.contactsourcespecialtyother && (
                  <CFormFeedback invalid>{errors?.contactsourcespecialtyother}</CFormFeedback>
                )}
              </CCol>
                  </>
                )}
               </>
               )}
               {(CurrentData?.contactsource  === "marketing") && (
               <>
                <CCol md={6}>
                <CFormLabel >{CurrentData?.contactsource } Channels</CFormLabel>
                <CFormSelect value={CurrentData?.marketingchannels || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.marketingchannels}
                        valid={!errors?.marketingchannels && !!CurrentData?.marketingchannels}
                        required
                        onChange={(event) => handleFormChange(event, 'marketingchannels')}>
                 <option value='facebook'>Facebook</option>
                    <option value='instagram'>Instagram</option>
                    <option value='youtube'>Youtube</option>
                    <option value='telegram Group'>Telegram Group</option>
                    <option value='twitter'>Twitter</option>
                    <option value='linkedIn'>linkedIn</option>
                    <option value='other'>Other</option>
                </CFormSelect>
                 {errors?.marketingchannels && (
                  <CFormFeedback invalid>{errors?.marketingchannels}</CFormFeedback>
                )}
              </CCol>
                {(CurrentData?.marketingchannels  === "other") && (
                  <>
                     <CCol md={4}>
                <CFormLabel >{CurrentData?.contactsource } Channel({CurrentData?.marketingchannels }) Define</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.marketingchannelsother || ''}
                    placeholder="Other"
                    invalid={!!errors?.marketingchannelsother} // Set `invalid` if there's an error
                    valid={!errors?.marketingchannelsother && !!CurrentData?.marketingchannelsother} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event, 'marketingchannelsother')}
                />
                {errors?.marketingchannelsother && (
                  <CFormFeedback invalid>{errors?.marketingchannelsother}</CFormFeedback>
                )}
              </CCol>
                  </>
                )}
               </>
               )}
              {(CurrentData?.contactsource  === "webinar/workshop/event/" || CurrentData?.contactsource  === "other") && (
                <CCol md={6}>
                  <CFormLabel >Contact Source({CurrentData?.contactsource }) Define</CFormLabel>
                  <CFormTextarea
                    type="text"
                    rows="4"
                    value={CurrentData?.contactsourceother || ''}
                        placeholder="Contact Source Other Details"
                        invalid={!!errors?.contactsourceother}
                        valid={!errors?.contactsourceother && !!CurrentData?.contactsourceother}
                    required
                    onChange={(event) => handleFormChange(event, 'contactsourceother')}
                  />
                  {errors?.contactsourceother && (
                    <CFormFeedback invalid>{errors?.contactsourceother}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                      <CFormLabel >Student’s Response</CFormLabel>
                      <CFormSelect value={CurrentData?.studentsresponse || ''}
                        placeholder="Student’s Response"
                        invalid={!!errors?.studentsresponse}
                        valid={!errors?.studentsresponse && !!CurrentData?.studentsresponse}
                        required
                        onChange={(event) => handleFormChange(event, 'studentsresponse')}>
                        <option value=''>=Select=</option>
                        <option value='expensive'>Expensive</option>
                        <option value='competitor has cheap service'>Competitor Has Cheap Service</option>
                        <option value='step 2 or step 3 exam'>Step 2 or Step 3 Exam</option>
                        <option value='prefer rotations/research'>Prefer Rotations/Research</option>
                        <option value='will join later'>Will Join Later</option>
                        <option value='rotation not available'>Rotation Not Available</option>
                        <option value='research not available'>Research Not Available</option>
                        <option value='not replying'>Not Replying</option>
                        <option value='not interested (no reason provided)'>Not Interested (No Reason Provided)</option>
                        <option value='not applying'>Not Applying</option>
                        <option value='have interviews'>Have Interviews</option>
                        <option value='currently busy'>Currently Busy</option>
                        <option value='financial issues'>financial issues</option>
                        <option value='will let you know/discussing with family'>Will Let You Know/Discussing With Family</option>
                        <option value='have another mentor or reviewer'>Have Another Mentor Or Reviewer</option>
                        <option value='visa issues'>Visa Issues</option>
                        <option value='seeking discount'>Seeking Discount</option>
                        <option value='plan not available'>Plan Not Available</option>
                        <option value='need time to think'>Need Time To Think</option>
                        <option value='about to enroll'>about to enroll</option>
                        <option value='family emergency'>Family Emergency</option>
                        <option value='need visa letter only'>Need Visa Letter Only</option>
                        <option value='will do on my own'>Will Do On My Own</option>
                        <option value='blocked'>Blocked</option>
                        <option value='dropped plan'>Dropped Plan</option>
                        <option value='newly enquired'>Newly Enquired</option>
                        <option value='others'>Others</option>
                      </CFormSelect>
                      {errors.CurrentData?.studentsresponse && (
                    <CFormFeedback invalid>{errors?.studentsresponse}</CFormFeedback>
                  )}
                    </CCol>
                    {CurrentData?.studentsresponse==="others" && (
                    <CCol md={6}>
                  <CFormLabel >Others Specify</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.studentresponseothers || ''}
                    placeholder="Others Specify"
                    invalid={!!errors?.studentresponseothers}
                    valid={!errors?.studentresponseothers && !!CurrentData?.studentresponseothers}
                    required
                    onChange={(event) => handleFormChange(event, 'studentresponseothers')}
                  />
                   {errors?.studentresponseothers && (
                    <CFormFeedback invalid>{errors?.studentresponseothers}</CFormFeedback>
                  )}
                </CCol>
                    )}
               <CCol md={6}>
                      <CFormLabel >Follow-ups Required</CFormLabel>
                      <CFormSelect value={CurrentData?.followupsrequired || ''}
                        placeholder="Follow-ups Required"
                        invalid={!!errors?.followupsrequired}
                        valid={!errors?.followupsrequired && !!CurrentData?.followupsrequired}
                        required
                        onChange={(event) => handleFormChange(event, 'followupsrequired')}>
                        <option value=''>=Select=</option>
                        <option value='yes'>Yes</option>
                        <option value='no'>No</option>
                        <option value='dnd'>Do Not Disturb</option>
                      </CFormSelect>
                      {errors?.followupsrequired && (
                  <CFormFeedback invalid>{errors?.followupsrequired}</CFormFeedback>
                )}
                    </CCol>
                    <CCol md={6}>
                <CFormLabel >Next Follow-up Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={CurrentData?.nextfollowupdate ? dayjs(CurrentData?.nextfollowupdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'nextfollowupdate')}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Next Follow-up Date"
                  variant="outlined"
                />
                {errors?.nextfollowupdate && (
                  <CFormFeedback invalid>{errors?.nextfollowupdate}</CFormFeedback>
                )}
              </CCol>
                <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Update Lead Profile
                  </CButton>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
<CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Followup Section</strong>
          </CCardHeader>
          <CCardBody>
           {Object.entries(FollowUps)?.length >0 && (
              //let followupindex,followupdata

              followUpKeys.map((key,indexF) => {
              let followupindex=key;
              let followupdata=FollowUps[followupindex];
              if(followupdata?.numbersequence && FollowupSequence<followupdata?.numbersequence)
              {
                FollowupSequence=followupdata?.numbersequence;
              }
              return (
              <CCol xs={12} key="followupbody">
        <CCard className="row mb-4">
          <CCardHeader>
            <strong>Follow Up</strong> <small>{indexF+1} <strong>{followupdata?.mode=="webinar"?" (Webinar)":""}</strong></small> <CCol xs={6} className="FloatRight"><CButton color="danger" type="button" onClick={(event) => DeleteFollowup(followupdata?.id,indexF+1)}> Delete FollowUp </CButton>  </CCol>
          </CCardHeader>
          <CCardBody className="">
          <div className="row g-3 needs-validation"  >
            <CCol md={6}>
                <CFormLabel >Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={followupdata?.followupdate ? dayjs(followupdata?.followupdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormFollowupChange(event, 'followupdate',followupindex)}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Date"
                  variant="outlined"
                />
               {errors.followupdata?.[followupindex]?.followupdate && (
                    <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.followupdate}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                      <CFormLabel >Mode</CFormLabel>
                      <CFormSelect value={followupdata?.mode || ''}
                        placeholder="Mode"
                        invalid={!!errors.followupdata?.[followupindex]?.mode}
                        valid={!errors.followupdata?.[followupindex]?.mode && !!followupdata?.mode}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'mode',followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='call'>Call</option>
                        <option value='whatsapp'>WhatsApp</option>
                        <option value='email'>Email</option>
                        <option value='webinar'>Webinar</option>
                      </CFormSelect>
                     {errors.followupdata?.[followupindex]?.mode && (
                    <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.mode}</CFormFeedback>
                  )}
                    </CCol>
                      {ServicesData?.servicetype==="match" && (
                      <>
                      <CCol md={6}>
                      <CFormLabel >Match Plan Pushed</CFormLabel>
                      <CFormSelect value={followupdata?.followupplanpushed || ''}
                        placeholder="Match Plan Pushed"
                        invalid={!!errors.followupdata?.[followupindex]?.followupplanpushed}
                        valid={!errors.followupdata?.[followupindex]?.followupplanpushed && !!followupdata?.followupplanpushed}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'followupplanpushed',followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='b2r'>B2R</option>
                        <option value='platinum'>Platinum</option>
                        <option value='gold'>Gold</option>
                        <option value='bronze'>Bronze</option>
                        <option value='turbo match'>Turbo Match</option>
                        <option value='eras cv+'>ERAS CV+</option>
                        <option value='comprehensive eras cv+'>Comprehensive ERAS CV+</option>
                        <option value='interview preparation'>Interview Preparation</option>
                        <option value='mock interviews'>Mock Interviews</option>
                        <option value='other'>Other</option>
                      </CFormSelect>
                      {errors.followupdata?.[followupindex]?.followupplanpushed && (
                    <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.followupplanpushed}</CFormFeedback>
                  )}
                    </CCol>
                    {followupdata?.followupplanpushed==="interview preparation" && (
                        <CCol md={6}>
                  <CFormLabel>Which Interview Preparation Plan</CFormLabel>
                  <CFormInput
                    type="text"
                    value={followupdata?.followupplanpushedwhichinterview || ''}
                    placeholder="Which Interview Preparation Plan"
                    invalid={!!errors.followupdata?.[followupindex]?.followupplanpushedwhichinterview}
                    valid={!errors.followupdata?.[followupindex]?.followupplanpushedwhichinterview && !!followupdata?.followupplanpushedwhichinterview}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'followupplanpushedwhichinterview',followupindex)}
                  />
                   {errors.followupdata?.[followupindex]?.followupplanpushedwhichinterview && (
                  <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.followupplanpushedwhichinterview}</CFormFeedback>
                )}
                </CCol>
                    )}
                    {followupdata?.followupplanpushed==="mock interviews" && (
                        <CCol md={6}>
                  <CFormLabel>Which and How many Mock Interviews</CFormLabel>
                  <CFormInput
                    type="text"
                    value={followupdata?.followupplanpushedwhichinterview || ''}
                    placeholder="Which and How many Mock Interviews"
                    invalid={!!errors.followupdata?.[followupindex]?.followupplanpushedwhichinterviewhowmany}
                    valid={!errors.followupdata?.[followupindex]?.followupplanpushedwhichinterviewhowmany && !!followupdata?.followupplanpushedwhichinterviewhowmany}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'followupplanpushedwhichinterviewhowmany',followupindex)}
                  />
                   {errors.followupdata?.[followupindex]?.followupplanpushedwhichinterviewhowmany && (
                  <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.followupplanpushedwhichinterviewhowmany}</CFormFeedback>
                )}
                </CCol>
                    )}
                    {followupdata?.followupplanpushed==="other" && (
                        <CCol md={6}>
                  <CFormLabel>Match Plan Pushed Other Define</CFormLabel>
                  <CFormInput
                    type="text"
                    value={followupdata?.followupplanpushedother || ''}
                    placeholder="Match Plan Pushed Other Define"
                    invalid={!!errors.followupdata?.[followupindex]?.followupplanpushedother}
                    valid={!errors.followupdata?.[followupindex]?.followupplanpushedother && !!followupdata?.followupplanpushedother}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'followupplanpushedother',followupindex)}
                  />
                   {errors.followupdata?.[followupindex]?.followupplanpushedother && (
                  <CFormFeedback invalid>{errors.followupdata?.[followupindex]?.followupplanpushedother}</CFormFeedback>
                )}
                </CCol>
                    )}




</>

                      )}
                      {/*ServicesData?.[`${ServiceIndex}`]?.servicetype==="rotation" && (
                     <CCol md={6}>
                <CFormLabel >Rotation Pushed</CFormLabel>
                <Select1
                  value={followupdata?.followupplanpushed || ''}
                  onChange={(event) => handleFormFollowupChange(event, 'followupplanpushed',`${ServiceIndex}`,followupindex)}
                  variant="outlined"
                  invalid={!!errors.services?.[ServiceIndex]?.[followupindex]?.followupplanpushed}
                  valid={!errors.services?.[ServiceIndex]?.[followupindex]?.followupplanpushed && !!followupdata?.followupplanpushed}
                  options={RotationOptions}
                  placeholder="Rotation Pushed"
                  label="Rotation Pushed"
                  title="Rotation Pushed"
                  isSearchable
                  isMulti
                />
                 {errors.services?.[ServiceIndex]?.[followupindex]?.followupplanpushed && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.followupplanpushed}</CFormFeedback>
                  )}
              </CCol>
              )*/}
              {/*ServicesData?.[`${ServiceIndex}`]?.servicetype==="research" && (
                     <CCol md={6}>
                      <CFormLabel >Research Pushed</CFormLabel>
                      <CFormSelect value={followupdata?.followupplanpushed || ''}
                        placeholder="Response"
                        invalid={!!errors.services?.ServiceIndex?.followupindex?.followupplanpushed}
                        valid={!errors.services?.ServiceIndex?.followupindex?.followupplanpushed && !!followupdata?.followupplanpushed}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'followupplanpushed',`${ServiceIndex}`,followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='c2p'>C2P</option>
                        <option value='rar'>RAR</option>
                        <option value='irc'>IRC</option>
                      </CFormSelect>
                       {errors.services?.ServiceIndex?.followupindex?.followupplanpushed && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.followupplanpushed}</CFormFeedback>
                  )}
                    </CCol>
              )*/}


                    <CCol md={6}>
                  <CFormLabel >Notes</CFormLabel>
                  <CFormTextarea
                    type="text"
                    row="7"
                    value={followupdata?.note}
                    placeholder="General Notes"
                    invalid={!!errors.followupdata?.followupindex?.note}
                    valid={!errors.followupdata?.followupindex?.note && !!followupdata?.note}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'note',followupindex)}
                  />
                  {errors.followupdata?.followupindex?.note && (
                    <CFormFeedback invalid>{errors.followupdata?.followupindex?.note}</CFormFeedback>
                  )}
                </CCol>

                {followupdata?.Question1 && (
                <CCol md={6}>
               <div class="card text-bg-light mb-3" >
  <div class="card-header">Question</div>
  <div class="card-body">
    <h5 class="card-title">{followupdata?.Question1}</h5>
    <p class="card-text">{followupdata?.Answer1}</p>
  </div>
</div>
  </CCol>
  )}
  {followupdata?.Question2 && (
                <CCol md={6}>

                <div class="card text-bg-info mb-3" >
  <div class="card-header">Question</div>
  <div class="card-body">
    <h5 class="card-title">{followupdata?.Question2}</h5>
    <p class="card-text">{followupdata?.Answer2}</p>
  </div>
</div>
  </CCol>
  )}
  {followupdata?.Question3 && (
                 <CCol md={6}>

                <div class="card text-bg-warning mb-3" >
  <div class="card-header">Question</div>
  <div class="card-body">
    <h5 class="card-title">{followupdata?.Question3}</h5>
    <p class="card-text">{followupdata?.Answer3}</p>
  </div>
</div>
  </CCol>
  )}
  {followupdata?.Question4 && (
                <CCol md={6}>

                <div class="card text-bg-success mb-3">
  <div class="card-header">Question</div>
  <div class="card-body">
    <h5 class="card-title">{followupdata?.Question4}</h5>
    <p class="card-text">{followupdata?.Answer4}</p>
  </div>
</div>
  </CCol>
  )}





                    </div>
          </CCardBody>
            </CCard>
            </CCol>
            )
            }
            )
            )}
            <CForm className="row g-3 needs-validation">

              <CCol xs={6}>
                <CButton color="secondary" type="button"
                  onClick={(event) => AddFollowup(followupindexLoop)}>
                  Add Followup
                </CButton>
              </CCol>
              <CCol xs={6}>
                <CButton color="warning" type="button"
                  onClick={(event) => SaveFollowups(followupindexLoop)}>
                  Update Followup
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
       {/* Services section starts here */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Services</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" role="tablist">

              {Object.entries(ServicesData).map(([ServiceIndex,serviceData],index) => {
                if (activeKey === null && index === 0) {
      setActiveKey(ServiceIndex);
    }
                return (<CNavItem key={ServiceIndex}>
                  <CNavLink
                    active={typeof serviceid!=="undefined"? serviceid===serviceData.id:activeKey === ServiceIndex}
                    onClick={() => setActiveKey(ServiceIndex)}
                  >
                    {serviceData.servicename}
                  </CNavLink>
                </CNavItem>
              )}
              )}
            </CNav>

            <CTabContent>
            <p> </p>
            <p> </p>

                {Object.entries(ServicesData).map(([ServiceIndex,serviceData]) => (
                  <CTabPane key={ServiceIndex} kk={activeKey} className="row" role="tabpanel" aria-labelledby="home-tab" visible={typeof serviceid!=="undefined"? serviceid===serviceData.id:activeKey === ServiceIndex}>
                    <CForm className="row g-3 needs-validation">

              <CCol md={6}>
                    <CFormLabel >Interested Service Type</CFormLabel>
                    <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.servicetype || ''}
                      placeholder="Service Type"
                      invalid={!!errors?.services?.[ServiceIndex]?.servicetype}
                      valid={!errors?.services?.[ServiceIndex]?.servicetype && !!ServicesData?.[`${ServiceIndex}`]?.servicetype}
                      required
                      onChange={(event) => handleFormServiceChange(event, 'servicetype',`${ServiceIndex}`)}>
                      <option value=''>=Select=</option>
                      <option value='rotation'>Rotation</option>
                      <option value='match'>Match</option>
                      <option value='research'>Research</option>
                    </CFormSelect>
                    {errors?.services?.[ServiceIndex]?.servicetype && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.servicetype}</CFormFeedback>
                )}
                  </CCol>
                   {ServicesData?.[`${ServiceIndex}`]?.servicetype==="match" && (
                     <CCol md={6}>
                      <CFormLabel >Match Plan Pushed</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.matchplanpushed || ''}
                        placeholder="Match Plan Pushed"
                        invalid={!!errors?.services?.[ServiceIndex]?.matchplanpushed }
                        valid={!errors?.services?.[ServiceIndex]?.matchplanpushed  && !!ServicesData?.[`${ServiceIndex}`]?.matchplanpushed }
                        required
                        onChange={(event) => handleFormServiceChange(event, 'matchplanpushed',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='b2r'>B2R</option>
                        <option value='platinum'>Platinum</option>
                        <option value='gold'>Gold</option>
                        <option value='bronze'>Bronze</option>
                        <option value='turbo match'>Turbo Match</option>
                        <option value='eras cv+'>ERAS CV+</option>
                        <option value='comprehensive eras cv+'>Comprehensive ERAS CV+</option>
                        <option value='interview preparation'>Interview Preparation</option>
                        <option value='mock interviews'>Mock Interviews</option>
                        <option value='other'>Other</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.matchplanpushed && (
                    <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.matchplanpushed }</CFormFeedback>
                  )}
                    </CCol>
                   )}
                    {ServicesData?.[`${ServiceIndex}`]?.servicetype==="rotation" && (
                     <CCol md={6}>
                <CFormLabel >Rotation Pushed</CFormLabel>
                <Select1
                  value={ServicesData?.[`${ServiceIndex}`]?.rotationplanpushed  || ''}
                  onChange={(event) => handleFormServiceChange(event, 'rotationplanpushed',`${ServiceIndex}`)}
                  variant="outlined"
                  invalid={!!errors?.services?.[ServiceIndex]?.rotationplanpushed }
                  valid={!errors?.services?.[ServiceIndex]?.rotationplanpushed && !!ServicesData?.[`${ServiceIndex}`]?.rotationplanpushed}
                  options={RotationOptions}
                  placeholder="Rotation Pushed"
                  label="Rotation Pushed"
                  title="Rotation Pushed"
                  isSearchable
                  isMulti
                />
                 {errors?.services?.[ServiceIndex]?.rotationplanpushed && (
                    <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.rotationplanpushed}</CFormFeedback>
                  )}
              </CCol>
              )}
              {ServicesData?.[`${ServiceIndex}`]?.servicetype==="research" && (
                     <CCol md={6}>researchplanpushed
                      <CFormLabel >Research Pushed</CFormLabel>
                       <Select1
                  value={ServicesData?.[`${ServiceIndex}`]?.researchplanpushed  || ''}
                  onChange={(event) => handleFormServiceChange(event, 'researchplanpushed',`${ServiceIndex}`)}
                  variant="outlined"
                  invalid={!!errors?.services?.[ServiceIndex]?.researchplanpushed }
                  valid={!errors?.services?.[ServiceIndex]?.researchplanpushed && !!ServicesData?.[`${ServiceIndex}`]?.researchplanpushed}
                  options={ResearchPlacePushedOptions}
                  placeholder="Research Pushed"
                  label="Research Pushed"
                  title="Research Pushed"
                  isSearchable
                  isMulti
                />

                       {errors?.services?.[ServiceIndex]?.researchplanpushed && (
                    <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.researchplanpushed}</CFormFeedback>
                  )}
                    </CCol>
              )}
                   {/* <CCol md={6}>
                <CFormLabel >Service Owner</CFormLabel>
                <Select1  value={ServicesData?.[`${ServiceIndex}`]?.serviceowner  || ''}
                    placeholder="Service Owner"
                    invalid={!!errors?.services?.[ServiceIndex]?.serviceowner} // Set `invalid` if there's an error
                    valid={!errors?.services?.[ServiceIndex]?.serviceowner && ServicesData?.[`${ServiceIndex}`]?.serviceowner} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={true}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormServiceChange(event,'serviceowner',`${ServiceIndex}` )}>
                  </Select1>

                {errors?.services?.[ServiceIndex]?.serviceowner && (
                      <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.serviceowner}</CFormFeedback>
                  )}
              </CCol>*/}

               <CCol md={6}>
                <div className="horizontal-sliderCont">
                <CFormLabel >Budget of Service Price:{ServicesData?.[`${ServiceIndex}`]?.budgetofservice?.[0] || 0} - {ServicesData?.[`${ServiceIndex}`]?.budgetofservice?.[1] || 0} </CFormLabel>
                <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        value={ServicesData?.[`${ServiceIndex}`]?.budgetofservice || [0,0]}
        min={0}
        max={10000}
        step={1}
        minDistance={5}
        onChange={(event) => handleFormServiceChange(event, 'budgetofservice',`${ServiceIndex}`)}
      />
      </div>
                {errors?.[`${ServiceIndex}`]?.exptdmnyenroll && (
                  <CFormFeedback invalid>{errors?.[`${ServiceIndex}`]?.exptdmnyenroll}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Expected Month and Year to enroll</CFormLabel>
                <DatePicker className="DatePicker"
                  value={ServicesData?.[`${ServiceIndex}`]?.exptdmnyenroll ? dayjs(ServicesData?.[`${ServiceIndex}`]?.exptdmnyenroll?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormServiceChange(event, 'exptdmnyenroll',`${ServiceIndex}`)}
                  dateFormat="mm-yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="month"
                  label="Expected Month and Year to enroll"
                  variant="outlined"
                />
                {errors?.[`${ServiceIndex}`]?.exptdmnyenroll && (
                  <CFormFeedback invalid>{errors?.[`${ServiceIndex}`]?.exptdmnyenroll}</CFormFeedback>
                )}
              </CCol>
                    {/* <CCol md={6}>
                <CFormLabel >Status</CFormLabel>
                <CFormSelect
                value={ServicesData?.[`${ServiceIndex}`]?.servicestatus || ''}
                  placeholder="Status"
                  invalid={!!errors?.services?.[ServiceIndex]?.servicestatus}
                  valid={!errors?.services?.[ServiceIndex]?.servicestatus && !!ServicesData?.[`${ServiceIndex}`]?.servicestatus}
                  required
                  onChange={(event) => handleFormServiceChange(event, 'servicestatus',`${ServiceIndex}`)}>
                  <option value=''>=Select=</option>
                  <option value='enrolled'>Enrolled</option>
                  <option value='hot'>Hot</option>
                  <option value='active'>Active</option>
                  <option value='not responding'>Not Responding</option>
                  <option value='Dead'>Dead</option>
                  <option value='do not disturb'>Do Not Disturb</option>
                </CFormSelect>
                {errors?.services?.[ServiceIndex]?.servicestatus && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.servicestatus}</CFormFeedback>
                )}
              </CCol>*/}


              <CCol md={6}>
                <CFormLabel >Planned Start Date</CFormLabel>
                <DatePicker className="DatePicker"
                  value={ServicesData?.[`${ServiceIndex}`]?.plannedstartdate ? dayjs(ServicesData?.[`${ServiceIndex}`]?.plannedstartdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormServiceChange(event, 'plannedstartdate',`${ServiceIndex}`)}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Planned Start Date"
                  variant="outlined"
                />
                {errors?.services?.[ServiceIndex]?.plannedstartdate && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.plannedstartdate}</CFormFeedback>
                )}
              </CCol>

                    {/*<CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Service Notes</CFormLabel>
                <CFormTextarea
                  type="text"
                  placeholder="Service Notes"
                  rows="4"
                  value={ServicesData?.[`${ServiceIndex}`]?.servicenotes }
                  invalid={!!errors?.services?.[ServiceIndex]?.servicenotes}
                  valid={!errors?.services?.[ServiceIndex]?.servicenotes && !!ServicesData?.[`${ServiceIndex}`]?.servicenotes }
                  required
                  onChange={(event) =>  handleFormServiceChange(event, 'servicenotes',`${ServiceIndex}`)}
                >
                </CFormTextarea>
                {errors?.services?.[ServiceIndex]?.servicenotes && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.servicenotes}</CFormFeedback>
                )}
              </CCol>*/}
                {ServicesData?.[`${ServiceIndex}`]?.contactsource==="Via Calendly/WhatsApp/Call/Via team member/Contact us page/Enroll email" && (
                  <>
                    <CCol md={6}>
                  <CFormLabel >Speciality</CFormLabel>
                  <CFormInput
                    type="text"
                    value={ServicesData?.[`${ServiceIndex}`]?.speciality || ''}
                    placeholder="Speciality"
                    invalid={!!errors?.services?.[ServiceIndex]?.speciality}
                    valid={!errors?.services?.[ServiceIndex]?.speciality && !!ServicesData?.[`${ServiceIndex}`]?.speciality}
                    required
                    onChange={(event) => handleFormServiceChange(event, 'speciality',`${ServiceIndex}`)}
                  />
                   {errors?.services?.[ServiceIndex]?.speciality && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.speciality}</CFormFeedback>
                )}
                </CCol>
                 <CCol md={6}>
                      <CFormLabel >Why contacted</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.whycontacted || ''}
                        placeholder="Why contacted"
                        invalid={!!errors?.services?.[ServiceIndex]?.whycontacted}
                        valid={!errors?.services?.[ServiceIndex]?.whycontacted && !!ServicesData?.[`${ServiceIndex}`]?.whycontacted}
                        required
                        multiple
                        onChange={(event) => handleFormServiceChange(event, 'whycontacted',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='rotation availability'>Rotation Availability</option>
                        <option value='rotation process'>Rotation Process</option>
                        <option value='rotation date change'>Rotation Date Change</option>
                        <option value='Rotation Cancellation'>Rotation Cancellation</option>
                        <option value='rotation documents'>Rotation Documents</option>
                        <option value='rotation refunds'>Rotation Refunds</option>
                        <option value='housing refunds'>Housing Refunds</option>
                        <option value='visa question'>Visa Question</option>
                        <option value='visa letter'>Visa Letter</option>
                        <option value='lor'>LoR</option>
                        <option value='Research'>Research</option>
                        <option value='match'>Match</option>
                        <option value='usmle guidance'>USMLE Guidance</option>
                        <option value='step preparation'>STEP Preparation</option>
                        <option value='housing'>Housing</option>
                        <option value='Physician Connect'>Physician Connect</option>
                        <option value='landlord connect'>Landlord Connect</option>
                        <option value='payment links'>Payment Links</option>
                      </CFormSelect>
                       {errors?.services?.[ServiceIndex]?.whycontacted && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.whycontacted}</CFormFeedback>
                )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel >Status</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.status || ''}
                        placeholder="Status"
                        invalid={!!errors?.services?.[ServiceIndex]?.status}
                        valid={!errors?.services?.[ServiceIndex]?.status && !!ServicesData?.[`${ServiceIndex}`]?.status}
                        required
                        onChange={(event) => handleFormServiceChange(event, 'status',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='attended'>Attended</option>
                        <option value='no-show'>No-show</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.status && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.status}</CFormFeedback>
                )}
                    </CCol>
                  </>
                  )}
                  {ServicesData?.[`${ServiceIndex}`]?.contactsource==="Via Webinar, dump leads etc" && (
                  <>
                    <CCol md={6}>
                  <CFormLabel>Speciality</CFormLabel>
                  <CFormInput
                    type="text"
                    value={ServicesData?.[`${ServiceIndex}`]?.speciality || ''}
                    placeholder="Speciality"
                    invalid={!!errors?.services?.[ServiceIndex]?.speciality}
                    valid={!errors?.services?.[ServiceIndex]?.speciality && !!ServicesData?.[`${ServiceIndex}`]?.speciality}
                    required
                    onChange={(event) => handleFormServiceChange(event, 'speciality',`${ServiceIndex}`)}
                  />
                   {errors?.services?.[ServiceIndex]?.speciality && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.speciality}</CFormFeedback>
                )}
                </CCol>
                 <CCol md={6}>
                      <CFormLabel >Follow Up For</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.followupfor || ''}
                        placeholder="Follow Up For"
                        invalid={!!errors?.services?.[ServiceIndex]?.followupfor}
                        valid={!errors?.services?.[ServiceIndex]?.followupfor && !!ServicesData?.[`${ServiceIndex}`]?.followupfor}
                        required
                        multiple
                        onChange={(event) => handleFormServiceChange(event, 'followupfor',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='steps preparation'>STEPs Preparation</option>
                        <option value='rotations'>Rotations</option>
                        <option value='research'>Research</option>
                        <option value='match'>Match</option>
                        <option value='interview preparations'>Interview Preparations</option>
                        <option value='fellowship preparation'>Fellowship Preparation</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.followupfor && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.followupfor}</CFormFeedback>
                )}
                    </CCol>
                  </>
                  )}


            <CCol xs={12}>
            <CCard className="mb-4">
          <CCardHeader>
          <strong>Save</strong> <small>Action</small>
          </CCardHeader>
          <CCardBody  className="row">

           <CCol xs={6}>
        <CButton color="success" type="button"
                  onClick={(event) => UpdateService(`${ServiceIndex}`)}>
                  Update Service
                </CButton>
              </CCol>
              </CCardBody>
          </CCard>
            </CCol>
                    </CForm>
                  </CTabPane>
                )
                )}


            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Operation</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 needs-validation">

              <CCol md={6}>
                <CButton color="primary" type="button"
                  onClick={(event) => AddServices()}>
                  Add Services
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
