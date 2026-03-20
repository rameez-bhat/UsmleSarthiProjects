import React, { useState, useEffect, useRef } from 'react';
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
  CNav,
  CNavItem,
  CTabContent,
  CTabPane,
  CNavLink,
  CInputGroupText,
  CRow,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react';
import { DatePicker } from "antd";
import { useNavigate } from 'react-router-dom';
import Select1 from 'react-select';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components';
import { countryData } from "../../apis/countryData";
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Timestamp } from 'firebase/firestore';
const currentYear = new Date().getFullYear();
const MatchSessionList = Array.from({ length: 7 }, (v, i) => currentYear + i);
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
let ActualLoggedInUser;
const allCountries = countryData.map(country => ({
  value: country.value,
  label: "(" + country.phoneCode + ")" + country.value,
  flag: country.flag,
  phoneCode: country.phoneCode,
}));

const countryOfMedicalCollege = countryData.map(country => ({
  value: country.value,
  label: country.label,
  flag: country.flag,
  phoneCode: country.phoneCode,
  "FieldName": "CountryOfMedicalSchool",
}));
let LastLeadId=1;
let AdminOptionsList = [];
let LeadCreatedBy = [];
//LeadCreatedBy.push({label:"Research Physician/Admin",value:"research physician/admin",name:"research physician/admin"})
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

const Validation = (Authuser) => {
ActualLoggedInUser = Authuser.ActualUser;
  const navigate = useNavigate();
  const [errors, seterrors] = useState(false);
  const [CurrentData, setCurrentData] = useState({uniqueid:LastLeadId});
  const [ActionResult, setActionResult] = useState({});
  const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
  const { showLoading, hideLoading, firestoreQueries, ShowToast, TooltipsPopovers,DatabaseName } = useLoading();

  const [toast, addToast] = useState(0);
  const toaster = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  console.log("errors--->",errors)
    if (CurrentData['countryofmedicalcollege']) {
      if (CurrentData['countryofmedicalcollege']?.label !== "Others") {
        const filtered = medicalSchoolOptions.filter(college => college.includes(", " + CurrentData['countryofmedicalcollege'].label));
        setMedicalSchoolOptionsList([
          ...filtered.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);
      }
    }
  }, [CurrentData,errors]);

  const fetchData = async () => {
   const conditionsArrayGet =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      const LeadsListlast =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArrayGet,"","","","uniqueid","desc",1,null);
      if(LeadsListlast?.data)
      {
        if(LeadsListlast?.data?.[0]?.uniqueid)
        {
          LastLeadId = LeadsListlast.data[0].uniqueid + 1;
          setCurrentData({uniqueid:LastLeadId});
        }
      }
      AdminOptionsList=[];
    const adminlist = await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "in", ["Customer Support","SuperAdmin"]);

    adminlist.map((item) => {
      AdminOptionsList.push({ label: item.name, value: item.uid, name: item.name });
      LeadCreatedBy.push({ label: item.name, value: item.uid, name: item.name });
      return null;
    });
  }

  const handleFormChange = async (event, name = "",level=null,sublevel=null) => {
    let value;
    if (event.target) {
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
    if (name === "step1result" && value === "not taken") {
      setCurrentData(prevValues => ({
        ...prevValues,
        step2ckresult: value,
        step3ckresult: value,
      }));
    }
   if (sublevel !== null) {
      setCurrentData(prevValues => ({
        ...prevValues,
        [level]: {
          ...prevValues[level],
          [sublevel]: {
            ...prevValues[level][sublevel],
            [name]: value,
          }
        }
      }));
    } else if (level !== null) {
      setCurrentData(prevValues => ({
        ...prevValues,
        [level]: {
          ...prevValues[level],
          [name]: value,
        }
      }));
    } else {
      setCurrentData(prevValues => ({
        ...prevValues,
        [name]: value,
      }));
    }
    if(name==="email" && validateEmail(value))
    {
       const CheckExists = await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "email", "==", value);
       console.log("CheckExists====>",CheckExists)
      if (CheckExists.length)
      {
        const uidl = CheckExists[0].id;
        const messageHead = `For Details Of User Please <a href='/admin/leads/updatelead/${uidl}'>Click Here</a>`;
        TooltipsPopovers("Error", messageHead, "Already Exists");
      }
    }
  }

  const formValidate = async () => {
    const errors = {};
    if (!CurrentData.firstname)
    {
      errors.firstname = "Please Enter First Name.";
    }
    if (!CurrentData.lastname)
    {
      errors.lastname = "Please Enter Last Name.";
    }
    if (CurrentData.phonecountrycode && !CurrentData.phone)
    {
      errors.phone = "Please Enter A Valid Phone.";
    }
    else if (!CurrentData.phonecountrycode && CurrentData.phone)
    {
      errors.phonecountrycode = "Please Select Country Code.";
    }
    else if (CurrentData.phonecountrycode && CurrentData.phone && !validatePhoneNumber(CurrentData.phone, CurrentData.phonecountrycode.value))
    {
      errors.phone = "Please Enter A Valid Phone.";
    }
    if (!CurrentData.email && CurrentData.phone)
    {
      CurrentData.email=CurrentData.phone+"@temp.phone";
      setCurrentData(prevValues => ({
        ...prevValues,
        'email': CurrentData.phone+"@temp.phone",
      }));
    }
    if (!CurrentData.email)
    {
      errors.email = "Please Enter Email.";
    }
    else if (CurrentData.email && !validateEmail(CurrentData.email))
    {
      errors.email = "Please Enter A Valid Email.";
    }


    return errors;
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phoneNumber, countrycode) => {
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }
    try {
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, countrycode);
      return parsedNumber && parsedNumber.isValid();
    } catch (e) {
      return false;
    }
  };



  const handleFormSubmit = async () => {
    showLoading();
    const validationErrors = await formValidate();
    seterrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      CurrentData.email=CurrentData.email.toLowerCase()
      const CheckExists = await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "email", "==", CurrentData.email);
      if (CheckExists.length)
      {
        const uidl = CheckExists[0].id;
        const messageHead = `For Details Of User Please <a href='/admin/leads/updatelead/${uidl}'>Click Here</a>`;
        TooltipsPopovers("Error", messageHead, "Already Exists");
      }
      else
      {
        CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
        CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
        CurrentData.createdby=ActualLoggedInUser;
        CurrentData.lastupdatedby=ActualLoggedInUser;
         const conditionsArrayGet =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
        const LeadsListlast =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArrayGet,"","","","uniqueid","desc",1,null);
        if(LeadsListlast?.data)
        {
          if(LeadsListlast?.data?.[0]?.uniqueid)
          {
            LastLeadId = Number(LeadsListlast.data[0].uniqueid) + 1;
            CurrentData.uniqueid=LastLeadId;
            setCurrentData({uniqueid:LastLeadId});
          }
        }
        //firestoreQueries.updateOrCreateByField("LeadTracker", "leads","email","==" ,CurrentData.email, CurrentData).then((result)
        firestoreQueries.updateOrCreateByField(DatabaseName, "leads",[{fieldName:'email',operator:'==',value:CurrentData.email}], CurrentData).then((result) =>
        {
          let uid=result.docId
          navigate(`/admin/leads/updatelead/${uid}`)
          console.log("Leads----->",result)
        TooltipsPopovers(result.status, result.message, result.status);
        hideLoading()
      })
      }
      hideLoading();
    } else {
      hideLoading();
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Lead</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
            <CForm className="row g-3 needs-validation">
              {/* Form fields here */}
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">First Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="First Name"
                  value={CurrentData?.firstname}
                  invalid={!!errors.firstname}
                  valid={!errors.firstname && !!CurrentData?.firstname}
                  required
                  onChange={(event) => handleFormChange(event, 'firstname')}
                />
                {errors.firstname && (
                  <CFormFeedback invalid>{errors.firstname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Last Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Last Name"
                  value={CurrentData?.lastname}
                  invalid={!!errors.lastname}
                  valid={!errors.firstname && !!CurrentData?.lastname}
                  required
                  onChange={(event) => handleFormChange(event, 'lastname')}
                />
                {errors.lastname && (
                  <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Email</CFormLabel>
                <CFormInput
                  type="text"
                  value={CurrentData?.email}
                  placeholder="Email"
                  invalid={!!errors.email}
                  valid={!errors.email && !!CurrentData?.email}
                  required
                  onChange={(event) => handleFormChange(event, 'email')}
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
                      onChange={(event) => handleFormChange(event, 'phonecountrycode')}
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
                      invalid={!!errors.phone}
                      valid={!errors.phone && CurrentData?.phone}
                      required
                      onChange={(event) => handleFormChange(event, 'phone')}
                    />
                    {errors.phone && (
                      <CFormFeedback invalid>{errors.phone}</CFormFeedback>
                    )}
                  </CCol>
                </CInputGroup>
              </CCol>
              <CCol md={6}>
                <CFormLabel >Sarthi Student</CFormLabel>
                <CFormSelect value={CurrentData?.sarthistudent}
                  placeholder="Sarthi Student"
                  invalid={!!errors.sarthistudent}
                  valid={!errors.sarthistudent && !CurrentData?.sarthistudent}
                  required
                  onChange={(event) => handleFormChange(event, 'sarthistudent')}>
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
                  defaultValue={CurrentData?.inquerydate ? dayjs(CurrentData?.inquerydate?.toDate().toISOString()) : null}
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
              <CCol md={6}>
                <CFormLabel >Interested In</CFormLabel>
                <Select1 value={CurrentData?.interestedin}
                  placeholder="Interested In"
                  invalid={!!errors.interestedin}
                  valid={!errors.interestedin && CurrentData?.interestedin}
                  required
                  isMulti
                  closeMenuOnSelect={false}
                  options={interestedin}
                  onChange={(event) => handleFormChange(event, 'interestedin')}>
                </Select1>
                {errors.interestedin && (
                  <CFormFeedback invalid>{errors.interestedin}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Lead Created By</CFormLabel>
                <Select1 value={CurrentData?.leadcreatedby}
                  placeholder="Lead Created By"
                  invalid={!!errors.leadcreatedby}
                  valid={!errors.leadcreatedby && CurrentData?.leadcreatedby}
                  required
                  closeMenuOnSelect={true}
                  options={LeadCreatedBy}
                  onChange={(event) => handleFormChange(event, 'leadcreatedby')}>
                </Select1>
                {errors.leadcreatedby && (
                  <CFormFeedback invalid>{errors.leadcreatedby}</CFormFeedback>
                )}
              </CCol>
               {CurrentData?.leadcreatedby?.value === 'research physician/admin' && (
                  <CCol md={6}>
                  <CFormLabel >Lead Created By Research Physician/Admin Details</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.leadcreatedbyphyciandetails}
                    placeholder="Lead Created By Research Physician/Admin Details"
                    invalid={!!errors.leadcreatedbyphyciandetails}
                    valid={!errors.leadcreatedbyphyciandetails && !!CurrentData?.leadcreatedbyphyciandetails}
                    required
                    onChange={(event) => handleFormChange(event, 'leadcreatedbyphyciandetails')}
                  />
                  {errors.leadcreatedbyphyciandetails && (
                    <CFormFeedback invalid>{errors.leadcreatedbyphyciandetails}</CFormFeedback>
                  )}
                </CCol>
               )}
              <CCol md={6}>
                <CFormLabel >Lead Owner</CFormLabel>
                <Select1 value={CurrentData?.leadowner}
                  placeholder="Lead Owner"
                  invalid={!!errors.leadowner}
                  valid={!errors.leadowner && CurrentData?.leadowner}
                  required
                  closeMenuOnSelect={true}
                  options={AdminOptionsList}
                  onChange={(event) => handleFormChange(event, 'leadowner')}>
                </Select1>
                {errors.leadowner && (
                  <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >YOG</CFormLabel>
                <DatePicker className="DatePicker"
                  defaultValue={CurrentData?.yog ? dayjs(CurrentData?.yog?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'yog')}
                  dateFormat="yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="year"
                  label="YOG"
                  variant="outlined"
                />
                {errors.yog && (
                  <CFormFeedback invalid>{errors.yog}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Step 1 Result</CFormLabel>
                <CFormSelect value={CurrentData?.step1result}
                  placeholder="Step 1 Result"
                  invalid={!!errors.step1result}
                  valid={!errors.step1result && !!CurrentData?.step1result}
                  required
                  onChange={(event) => handleFormChange(event, 'step1result')}>
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
                <CCol md={6}>
                  <CFormLabel >Step 1 Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step1score}
                    placeholder="Step 1 Score"
                    invalid={!!errors.step1score}
                    valid={!errors.step1score && !!CurrentData?.step1score}
                    required
                    onChange={(event) => handleFormChange(event, 'step1score')}
                  />
                  {errors.step1score && (
                    <CFormFeedback invalid>{errors.step1score}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Step 2 CK Result</CFormLabel>
                <CFormSelect value={CurrentData?.step2ckresult}
                  placeholder="Step 2 CK Result"
                  invalid={!!errors.step2ckresult}
                  valid={!errors.step2ckresult && !!CurrentData?.step2ckresult}
                  required
                  onChange={(event) => handleFormChange(event, 'step2ckresult')}>
                  <option value=''>=Select=</option>
                  <option value='score'>Score</option>
                  <option value='not taken'>Not Taken</option>
                </CFormSelect>
                {errors.step2ckresult && (
                  <CFormFeedback invalid>{errors.step2ckresult}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.step2ckresult === 'score' && (
                <CCol md={6}>
                  <CFormLabel >Step 2 CK Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step2ckscore}
                    placeholder="Step 2 CK Score"
                    invalid={!!errors.step2ckscore}
                    valid={!errors.step2ckscore && !!CurrentData?.step2ckscore}
                    required
                    onChange={(event) => handleFormChange(event, 'step2ckscore')}
                  />
                  {errors.step2ckscore && (
                    <CFormFeedback invalid>{errors.step2ckscore}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Step 3 CK Result</CFormLabel>
                <CFormSelect value={CurrentData?.step3ckresult}
                  placeholder="Step 3 CK Result"
                  invalid={!!errors.step3ckresult}
                  valid={!errors.step3ckresult && !!CurrentData?.step3ckresult}
                  required
                  onChange={(event) => handleFormChange(event, 'step3ckresult')}>
                  <option value=''>=Select=</option>
                  <option value='score'>Score</option>
                  <option value='not taken'>Not Taken</option>
                </CFormSelect>
                {errors.step3ckresult && (
                  <CFormFeedback invalid>{errors.step3ckresult}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.step3ckresult === 'score' && (
                <CCol md={6}>
                  <CFormLabel >Step 3 CK Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step3ckscore}
                    placeholder="Step 3 CK Score"
                    invalid={!!errors.step3ckscore}
                    valid={!errors.step3ckscore && !!CurrentData?.step3ckscore}
                    required
                    onChange={(event) => handleFormChange(event, 'step3ckscore')}
                  />
                  {errors.step3ckscore && (
                    <CFormFeedback invalid>{errors.step3ckscore}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Match Application Season</CFormLabel>
                <CFormSelect  value={CurrentData?.matchapplicationsession || ''}
                    placeholder="Match Application Season"
                    invalid={!!errors.step2ckresult} // Set `invalid` if there's an error
                    valid={!errors.matchapplicationsession && !!CurrentData?.matchapplicationsession} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'matchapplicationsession')}>
                    <option value=''>=Select=</option>
                    {MatchSessionList.map((item) => (
                    <option value={item}>{`Match Season `+item+` (Sept `+(item-1)+`)`}</option>
                    ))}
                    <option value='undecided/later'>Undecided/Later</option>
                  </CFormSelect>

                {errors.matchapplicationsession && (
                      <CFormFeedback invalid>{errors.matchapplicationsession}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Country Of Medical College</CFormLabel>
                <Select1
                  value={CurrentData?.countryofmedicalcollege}
                  onChange={(event) => handleFormChange(event, 'countryofmedicalcollege')}
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
              <CCol md={6}>
                <CFormLabel >Medical college name</CFormLabel>
                <Select1
                  value={CurrentData?.nameofmedicalcollege || ''}
                  onChange={(event) => handleFormChange(event, 'nameofmedicalcollege')}
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
                <CCol md={6}>
                  <CFormLabel >Other Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.nameofmedicalschoolother}
                    placeholder="Other Name"

                    invalid={!!errors.nameofmedicalschoolother}
                    valid={!errors.nameofmedicalschoolother && CurrentData?.nameofmedicalschoolother}
                    required
                    onChange={(event) => handleFormChange(event, 'nameofmedicalschoolother')}
                  />
                  {errors.nameofmedicalschoolother && (
                    <CFormFeedback invalid>{errors.nameofmedicalschoolother}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Visa Status</CFormLabel>
                <CFormSelect value={CurrentData?.visastatus}
                  placeholder="Visa Status"
                  invalid={!!errors.visastatus}
                  valid={!errors.visastatus && CurrentData?.visastatus}
                  required
                  onChange={(event) => handleFormChange(event, 'visastatus')}>
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
                  value={CurrentData?.leadnotes}
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
                <CFormSelect value={CurrentData?.contactsourcespecialty || ''}
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
                      {errors?.services?.[ServiceIndex]?.ourresponse && (
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
              <CCol md={12}>
                <CButton color="primary" type="button"
                  onClick={(event) => handleFormSubmit()}>
                  Add Lead Profile
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>


    </CRow>
  )
}

export default Validation;
