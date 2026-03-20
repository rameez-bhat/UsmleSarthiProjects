import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CContainer, CCardGroup, CRow, CCol, CCard, CCardBody, CCardHeader, CForm, CFormLabel, CFormInput, CButton, CAlert } from "@coreui/react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import logo from '../../../assets/images/LogoSarthi.jpg'
import auth from "../../../apis/auth";
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract reset code from URL
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or expired reset link.");
    }
  }, [oobCode]);

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
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
                    <CFormLabel>New Password</CFormLabel>
                    <CFormInput
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <CFormLabel className="mt-3">Confirm New Password</CFormLabel>
                    <CFormInput
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <CButton color="primary" className="mt-3 w-100" onClick={handleResetPassword} disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-white py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <img src={logo} alt="Logo" className="img-fluid" />
                    <CButton color="primary" className="mt-3 w-100" onClick={() => navigate("/login")}>
                      Back to Login
                    </CButton>
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

export default ResetPassword;
