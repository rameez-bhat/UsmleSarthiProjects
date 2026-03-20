import React, { useState } from 'react'
import Select from 'react-select';
import { Link,useNavigate } from 'react-router-dom'
import axios from 'axios';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CCardGroup,
  CRow,
  CAlert,
} from '@coreui/react'
import {
  TextField,
  Grid,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import CIcon from '@coreui/icons-react'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import logo from '../../../assets/images/LogoSarthi.jpg'
import { useLoading } from '../../../layout/LoadingContext';
import { signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,browserLocalPersistence,setPersistence } from "firebase/auth";
import auth from "../../../apis/auth";
import  '../../../components/css/style.css';
import { cilLockLocked, cilUser,cilAddressBook,cilPhone } from '@coreui/icons'
import { countryData } from "../../../apis/countryData";
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const SameAsPhoneList=[{value:"",label:"Select Value"},{value:"no",label:"No"},{value:"yes",label:"Yes"}];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
let ToolTipMessage="";
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoggingIn, setIsLoggingIn] = useState(false);
const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('')
  const { showLoading, hideLoading,FetchDataFromCollection, API_KEY,getMaxStudentUniqueId,DatabaseName,handleUpdate,Timestamp,TooltipsPopovers } = useLoading();
  const handleInputChange = (e) => {
  let name,value;
  if(typeof e.target==="undefined")
  {
  	name="countrycode";
  	value=e;
  }
  else
  {
  	name=e.target.name;
  	value=e.target.value
  }
    setFormData({ ...formData, [name]: value })
  }
    const onFinish = async (values) => {
    setIsLoggingIn(true);

    try {
       //await setPersistence(auth, browserLocalPersistence);
      let user=await signInWithEmailAndPassword(auth, values?.email, values?.password);
      let  SelectedUser=await FetchDataFromCollection("UsersRoles", 20, "__name__", "==", user['user']['uid'], 0);
      console.log("SelectedUserSelectedUserSelectedUser--->",SelectedUser)
            if(SelectedUser.length===0)
      		{
      	 		await signOut(auth);
      	 		//message.success("User Not Found");
      	 		errors.LoginError="Incorrect email Or password.";
      	 		setErrors(errors);
      		}
      		else if(SelectedUser.length)
      		{
      			if(SelectedUser?.[0]?.['Role']==="Admin" )
      			{
      				//await signOut(auth);
      	 			//message.success("This Is Admin Dashboard");
      	 			//errors.LoginError="This Is Admin Dashboard! You can't login here. Please contact administrator.";
      	 			///seterrors(errors);
					 window.location.reload();
      	 			navigate('/user/updateuserprofile');
      			}
      			else
      			{
      				 window.location.reload();
      			 	//message.success("Logged in");
      			 	navigate('/user/updateuserprofile');
      			}
      		}
      hideLoading()


    } catch (err) {
    	 let errorMessage;
    switch (err.code) {
      case "auth/user-not-found":
        errorMessage = "No user found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password. Please try again.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format.";
        break;
      case "auth/invalid-credential":
        errorMessage = "Incorrect Email Or Password";
        break;
      default:
        errorMessage = err.message || "Something went wrong. Please try again.";
    }
      setErrors({LoginError:errorMessage || "Something went wrong"});
      console.log(err);
      hideLoading()
    } finally {
      setIsLoggingIn(false);
    }
  };
const validatePhoneNumber = (phoneNumber,countrycode) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];
    if(typeof phoneNumber==="undefined")
    {
    	phoneNumber="";
    }
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
  const validateForm = () => {
  	showLoading();
    let isValid = true
    const errors = {}

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Full Name is required'
      isValid = false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address'
      isValid = false
    }
    console.log("formData?.countrycode---->",formData?.countrycode)
	if(!formData?.countrycode?.value?.trim())
    {
    	errors.countrycode="Select Country Code.";
    	isValid = false
    }
    if(!validatePhoneNumber(formData?.phone,formData?.countrycode?.value))
    {
    	errors.phone="Please Enter A Valid Phone Number (Without Country Code).";
    	isValid = false
    }
    // Password validation
    if (!formData.password.trim()) {
      errors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
      isValid = false
    }
    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm your password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      isValid = false
    }


    setErrors(errors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')

    if (validateForm())
    {
    	try
    	{
      		const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      		console.log("userCredential---->",userCredential)
      		let password=formData.password;
      		let MaxStudentUniqueId=await getMaxStudentUniqueId("Users","StudentUniqueId");
      		console.log("MaxStudentUniqueId--->",MaxStudentUniqueId)
      		MaxStudentUniqueId=Number(MaxStudentUniqueId);
      		MaxStudentUniqueId=MaxStudentUniqueId+1;
      		let userid=userCredential.user.uid;
      		let dataTobesend={};
      		let StudentEmailNormal=formData.email.toLowerCase();
      		let StudentNameNormal=formData.username.toLowerCase();
      		dataTobesend['uid']=userid;
      		dataTobesend['email']=StudentEmailNormal;
      		dataTobesend['displayName']=StudentNameNormal;
      		dataTobesend['createdAt']=Timestamp.fromDate(new Date());
    		dataTobesend['updatedAt']=Timestamp.fromDate(new Date());
      		dataTobesend['PhoneCountry']={};
      		dataTobesend['PhoneCountry']=formData.countrycode;
      		dataTobesend['phoneNumber']=formData.phone;
      		dataTobesend['SameAsWhatsAppNumber']="yes";
      		dataTobesend['WhatsappCountry']={};
      		dataTobesend['source']="register";
      		dataTobesend['StudentUniqueId']=MaxStudentUniqueId;
      		dataTobesend['WhatsappCountry']=formData.countrycode;
      		dataTobesend['WhatsappNumber']=formData.phone;
      		dataTobesend['emailVerified']=false;
			try
    		{
			const responseSend = await axios.post('https://addleadfromothersource-jwpx2jwsca-uc.a.run.app', { StudentEmail:StudentEmailNormal, password, StudentName:StudentNameNormal, phonecountrycode:formData.countrycode, phone:formData.phone });
			}
      		catch (err)
      		{
      			console.log("err===========>",err)
      		}
      		handleUpdate("Users",userid,dataTobesend).then((result1) => {
      			console.log("result1----->",result1)
     			let dataTobesendR={};
     			dataTobesendR['Role']="Default";
     			dataTobesendR['email']=StudentEmailNormal;
      			dataTobesendR['displayName']=StudentNameNormal;
      			dataTobesendR['uid']=userid;
      			dataTobesendR['source']="register";
      			dataTobesendR['StudentUniqueId']=MaxStudentUniqueId;
      			dataTobesendR['createdAt']=Timestamp.fromDate(new Date());
    			dataTobesendR['updatedAt']=Timestamp.fromDate(new Date());
     			handleUpdate("UsersRoles",userid,dataTobesendR).then((result) => {

     			onFinish({email:formData.email, password:formData.password})
				});
     	});
      	}
      	catch (err)
      	{
      		console.log("err===========>",err)
      		switch (err.code)
      		{
      			case "auth/email-already-in-use":
      				ToolTipMessage="This email is already in use. Try logging in.";
          			break;
          		case "auth/invalid-email":
          			ToolTipMessage="The email address is invalid.";
          			break;
        		case "auth/weak-password":
          			ToolTipMessage="Password should be at least 6 characters.";
          			break;
        		default:
          			ToolTipMessage="An unexpected error occurred. Please try again.";
          	}
          	hideLoading()
          	TooltipsPopovers("error",ToolTipMessage,"")
          }


      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone:'',
        countrycode:{}

      })
      setErrors({})
    }
    else
    {
    	hideLoading();
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={12} >
          <CCardGroup>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Register</h1>
                  <p className="welcomeRegister">Get Register With USMLESarthi</p>

                  {successMessage && <CAlert color="success">{successMessage}</CAlert>}
                  {Object.keys(errors).map((key) => (
                    <CAlert key={key} color="danger">
                      {errors[key]}
                    </CAlert>
                  ))}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="username"
                      placeholder="Full Name"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      name="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </CInputGroup>
					<Grid item xs={2}>
                <Select
        value={formData.countrycode}
        onChange={handleInputChange}
        options={allCountries}
        placeholder="Country Code"
        name="countrycode"
        isSearchable
        formatOptionLabel={CountryOption}
        className="SelectClass"
      />
      	{errors.selectedCountry  && <span class="validationerror">{errors.selectedCountry }</span>}
              	</Grid>
              	<CInputGroup className="mb-3">
                    <CInputGroupText> <CIcon icon={cilPhone} /></CInputGroupText>
                    <CFormInput
                      name="phone"
                      type="phone"
                      placeholder="Phone Without Country Code"
                      autoComplete="email"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      name="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Create Account
                    </CButton>
                  </div>

            	 <p></p>
            	  <p></p>
            	   <p></p>
                </CForm>
                <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p className="welcomeRegister">Already Have An Account <Link to="/login">Login </Link></p>
              </CCardBody>
            </CCard>
            <CCard className="text-white bg-white py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    {/* Replace the placeholder text with the logo */}
                    <img src={logo} alt="Logo" className="img-fluid" />
                    <Link to="/login">
                      {<CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Login Now!
                      </CButton>}
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
