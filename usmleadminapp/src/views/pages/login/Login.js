import React, { useState } from "react";
import { Link,useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useLoading } from '../../../layout/LoadingContext';
// Import the logo image
import logo from '../../../assets/images/LogoSarthi.jpg'
import { signInWithEmailAndPassword,signOut,browserLocalPersistence,setPersistence } from "firebase/auth";
import auth from "../../../apis/auth";
const Login = () => {
 const { showLoading, hideLoading, API_KEY,DatabaseName,FetchDataFromCollection } = useLoading();
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [validated, setValidated] = useState(false)
const [credentials, setcredentials] = useState({})
  const [errors, seterrors] = useState({});
  const [errorsE, seterrorsE] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
  showLoading()
    const form = event.currentTarget
    seterrorsE(false);
    const validationErrors = validateForm();
 	seterrors(validationErrors);
    if (form.checkValidity() === false) {
      event.preventDefault()
      	event.stopPropagation()
      	hideLoading()
    }
    else if (Object.keys(validationErrors).length > 0)
    {
    	  event.preventDefault()
        event.stopPropagation()
        hideLoading()
    }
    else
    {
    	onFinish(credentials)
    	event.preventDefault()
      event.stopPropagation()
    }
    setValidated(true)
  }
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validateForm = () => {
  	const errors={};
	if(typeof credentials.email==="undefined" || credentials.email.trim()==="")
	{
		seterrorsE(true);
		errors.email="Please Enter Your Registered Email Address.";
	}
	else if(!validateEmail(credentials.email))
	{
		seterrorsE(true);
		errors.email="Please Enter Valid Email Address.";
	}
	if(typeof credentials.password==="undefined" || credentials.password.trim()==="")
	{
		errors.password="Please Enter Your Password.";
	}
	return errors;
  };
 const handleDynamicChange= (event, name)=>{
let value=event.target.value;
	setcredentials((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
}
  const onFinish = async (values) => {
    setIsLoggingIn(true);

    try {
       //await setPersistence(auth, browserLocalPersistence);
      let user=await signInWithEmailAndPassword(auth, values?.email, values?.password);
      let  SelectedUser=await FetchDataFromCollection("UsersRoles", 20, "__name__", "==", user['user']['uid'], 0);
            if(SelectedUser.length===0)
      		{
      	 		await signOut(auth);
      	 		//message.success("User Not Found");
      	 		errors.LoginError="Incorrect email Or password.";
      	 		seterrors(errors);
      		}
      		else if(SelectedUser.length)
      		{
      			if(SelectedUser?.[0]?.['Role']==="Admin" )
      			{
      				//await signOut(auth);
      	 			//message.success("This Is Admin Dashboard");
      	 			//errors.LoginError="This Is Admin Dashboard! You can't login here. Please contact administrator.";
      	 			///seterrors(errors);
      	 
      	 			navigate('/admin/leads');
      			}
      			else
      			{
      			 	//message.success("Logged in");
      			 	navigate('/admin/leads');
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
      seterrors({LoginError:errorMessage || "Something went wrong"});
      console.log(err);
      hideLoading()
    } finally {
      setIsLoggingIn(false);
    }
  };


  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">

          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm
      className="row g-3 needs-validation"
      noValidate
      validated={validated}
      onSubmit={handleSubmit}
    >
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                   {errors.LoginError &&  <CAlert color="warning">{errors.LoginError}</CAlert>}

                    <CCol md={12} className="position-relative">

        <CInputGroup className="has-validation">
          <CInputGroupText id="inputGroupPrepend"><CIcon icon={cilUser} /></CInputGroupText>
          <CFormInput
            type="email"
            id="validationTooltipEmail"
            defaultValue=""
            placeholder="Email"
            onChange={(event) => handleDynamicChange(event, "email")}
            aria-describedby="inputGroupPrepend"
            required
            invalid={errorsE}
          />
          <CFormFeedback tooltip invalid>
            {errors.email ? errors.email : "Please enter a valid email."}
          </CFormFeedback>
        </CInputGroup>
      </CCol>
      <CCol md={12} className="position-relative">
        <CInputGroup className="has-validation">
          <CInputGroupText id="inputGroupPrependPassword"><CIcon icon={cilLockLocked} /></CInputGroupText>
          <CFormInput
            type="password"
            id="validationTooltipPassword"
            defaultValue=""
            placeholder="Password"
            onChange={(event) => handleDynamicChange(event, "password")}
            aria-describedby="inputGroupPrependPassword"
            required
          />
          <CFormFeedback tooltip invalid>
             {errors.password ? errors.password : "Please enter a valid password."}
          </CFormFeedback>
        </CInputGroup>
      </CCol>
      <p></p>

                    <CRow>
                      <CCol xs={12} className="position-relative">
        <CButton color="primary" type="submit">
          Login
        </CButton>
        <p></p>
       <p className="welcomeRegister"> <Link to="/forgot-password">Forgot Password?</Link> </p>
      </CCol>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p className="welcomeRegister">Do Not Have An Account  <Link to="/register">Register</Link> </p>
                      {/*<CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>*/}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-white py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    {/* Replace the placeholder text with the logo */}
                    <img src={logo} alt="Logo" className="img-fluid" />
                    <Link to="/register">
                      {<CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
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

export default Login

