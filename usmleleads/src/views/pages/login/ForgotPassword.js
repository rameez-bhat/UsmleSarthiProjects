import React, { useState } from "react";
import { Link,useNavigate } from 'react-router-dom'
import { CContainer,CCardGroup, CRow, CCol, CCard, CCardBody, CCardHeader, CForm, CFormLabel, CFormInput, CButton, CAlert } from "@coreui/react";
import { getAuth, sendPasswordResetEmail,fetchSignInMethodsForEmail,signInWithEmailAndPassword } from "firebase/auth";
import logo from '../../../assets/images/LogoSarthi.jpg'
import auth from "../../../apis/auth";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);



  const handleReset = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // ✅ Check if the email exists
      console.log("email--->",email)
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Checking email:", normalizedEmail);

      // ✅ Check if email exists
      try {
        let res=await signInWithEmailAndPassword(auth, normalizedEmail, "randomFakePassword");
        console.log("res--->",res)
      } catch (error) {
      console.log("error--->",error)
        if (error.code === "auth/wrong-password") {
          console.log("User exists.");
          // ✅ Email exists, proceed with password reset
        } 
        if (error.code === "auth/invalid-credential") {
          console.log("User exists.");
          // ✅ Email exists, proceed with password reset
        }
        else if (error.code === "auth/user-not-found") {
          throw new Error("This email is not registered. Please check again.");
        }
      }


      // ✅ If email exists, send reset email
      let ret=await sendPasswordResetEmail(auth, email);
      console.log("ret--->",ret)
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
    <CContainer >
      <CRow className="justify-content-center">
        <CCol md={8}>
         <CCardGroup>
          <CCard>
            <CCardHeader>
              <h4 className="text-center">Reset Password</h4>
            </CCardHeader>
            <CCardBody>
              {message && <CAlert color="success">{message}</CAlert>}
              {error && <CAlert color="danger">{error}</CAlert>}
              <CForm>
                <CFormLabel htmlFor="email">Enter your email</CFormLabel>
                <CFormInput
                  type="email"
                  id="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CButton color="primary" className="mt-3 w-100" onClick={handleReset} disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
          <CCard className="text-white bg-white py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    {/* Replace the placeholder text with the logo */}
                    <img src={logo} alt="Logo" className="img-fluid" />
                    <Link to="/login">
                      {<CButton color="primary" className="mt-3 w-100" active tabIndex={-1}>
                        Login!
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
  );
};

export default ForgotPassword;
