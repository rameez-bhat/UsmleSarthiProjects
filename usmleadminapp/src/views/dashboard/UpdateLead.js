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
import {useParams,useNavigate } from 'react-router-dom';
import { DatePicker} from "antd";
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
const DatabaseName="LeadTracker";
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
const { leadid } = useParams();
const [CurrentData, setCurrentData] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,allCountries,CountryOption,firestoreQueries,countryOfMedicalCollege,medicalSchoolOptions } = useLoading();
const [toast, addToast] = useState(0)
  const toaster = useRef()

console.log("1111useEffect---->")



useEffect(() => {
console.log("useEffect---->")
fetchData();
console.log("useEffect---->")

  }, []);
  useEffect(() => {
  console.log("CurrentData--->",CurrentData)
 if(CurrentData['countryofmedicalcollege'])
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
  const fetchData = async () => {
    const adminlist=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "==", "Customer Support");
    const LeadData=await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "id", "==", leadid);
    console.log("LeadData---->",LeadData)
    setCurrentData(LeadData[0]);
    /*setMedicalSchoolOptionsList([
          ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);*/
    adminlist.map((item) => {
    AdminOptionsList.push({label:item.name,value:item.uid,name:item.name});
    return "h";
    })
    console.log("adminlist---->",adminlist)
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
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
      firestoreQueries.updateOrCreateByField("LeadTracker", "leads", "id","==" ,leadid, CurrentData).then((result) => {
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

  return (
    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Lead</strong> <small>Update</small>
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
                    value={CurrentData?.firstname}
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
                    value={CurrentData?.lastname}
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
                    value={CurrentData?.email}
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
        value={CurrentData?.phonecountrycode}
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
                    value={CurrentData?.phone}
                    placeholder="Phone Without Country Code"
                    invalid={!!errors.phone} // Set `invalid` if there's an error
                    valid={!errors.phone && CurrentData?.phone} // Set `valid` if no error and value exists
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
                <CFormSelect  value={CurrentData?.sarthistudent}
                    placeholder="Sarthi Student"
                    invalid={!!errors.sarthistudent} // Set `invalid` if there's an error
                    valid={!errors.sarthistudent && !!CurrentData?.sarthistudent} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'sarthistudent' )}>
                    <option value='yes'>Yes</option>
                    <option value='no'>No</option>
                    <option value='do not know'>Do Not Know</option>
                  </CFormSelect>

                {errors.sarthistudent && (
                      <CFormFeedback invalid>{errors.sarthistudent}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={4}>
                <CFormLabel >Source</CFormLabel>
                <CFormSelect  value={CurrentData?.source}
                    placeholder="Source"
                    invalid={!!errors.source} // Set `invalid` if there's an error
                    valid={!errors.source && CurrentData?.source} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'source' )}>
                    <option value='rotation inquery'>Rotation Inquiry</option>
                    <option value='qhatsapp'>WhatsApp</option>
                    <option value='calendly'>Calendly</option>
                    <option value='webinar'>Webinar</option>
                    <option value='contact us page'>Contact Us Page</option>
                    <option value='enroll email'>Enroll Email</option>
                    <option value='call'>Call</option>
                    <option value='via team member'>Via team member</option>
                  </CFormSelect>

                {errors.source && (
                      <CFormFeedback invalid>{errors.source}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Interested In</CFormLabel>
                <Select1  value={CurrentData?.interestedin}
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
              <CCol md={4}>
                <CFormLabel >Status</CFormLabel>
                <CFormSelect  value={CurrentData?.status}
                    placeholder="Status"
                    invalid={!!errors.status} // Set `invalid` if there's an error
                    valid={!errors.status && CurrentData?.status} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'status')}>
                    <option value='enrolled'>Enrolled</option>
                    <option value='hot'>Hot</option>
                    <option value='active'>Active</option>
                    <option value='not responding'>Not Responding</option>
                    <option value='Dead'>Dead</option>
                    <option value='do not disturb'>Do Not Disturb</option>
                  </CFormSelect>

                {errors.source && (
                      <CFormFeedback invalid>{errors.source}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Lead Created By</CFormLabel>
                <Select1  value={CurrentData?.leadcreatedby}
                    placeholder="Lead Created By"
                    invalid={!!errors.leadcreatedby} // Set `invalid` if there's an error
                    valid={!errors.leadcreatedby && CurrentData?.leadcreatedby} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={false}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event,'leadcreatedby' )}>
                  </Select1>

                {errors.leadcreatedby && (
                      <CFormFeedback invalid>{errors.leadcreatedby}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Lead Owner</CFormLabel>
                <Select1  value={CurrentData?.leadowner}
                    placeholder="Lead Owner"
                    invalid={!!errors.leadowner} // Set `invalid` if there's an error
                    valid={!errors.leadowner && CurrentData?.leadowner} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={false}
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
        defaultValue={CurrentData?.yog?dayjs(CurrentData?.yog?.toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event,'yog',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="YOG"
  		variant="outlined"
      />

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Step 1 Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step1result}
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
                    value={CurrentData?.step1score}
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
                <CFormSelect  value={CurrentData?.step2ckresult}
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
                    value={CurrentData?.step2ckscore}
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
                <CFormSelect  value={CurrentData?.step3ckresult}
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
                    value={CurrentData?.step3ckscore}
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
              <CCol md={4}>
                  <CFormLabel >Country Of Medical College</CFormLabel>
                  <Select1
        value={CurrentData?.countryofmedicalcollege}
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
                    value={CurrentData?.nameofmedicalschoolother}
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
                <CFormSelect  value={CurrentData?.visastatus}
                    placeholder="Visa Status"
                    invalid={!!errors.visastatus} // Set `invalid` if there's an error
                    valid={!errors.visastatus && CurrentData?.visastatus} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'visastatus')}>
                    <option value='required'>Required</option>
                    <option value='not required'>Not Required</option>
                  </CFormSelect>

                {errors.visastatus && (
                      <CFormFeedback invalid>{errors.visastatus}</CFormFeedback>
                  )}
              </CCol>
                <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Add Lead
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
