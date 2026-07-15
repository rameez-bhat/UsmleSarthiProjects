import React, { useEffect, useState, useContext } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Grid,
  Typography,
  Button,
  Paper,
  Box
} from '@mui/material';

import { useLoading } from "../../layout/LoadingContext";
import { CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import '../../components/css/style.css';

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s ease',
};

const buttonHoverStyle = {
  backgroundColor: '#0056b3',
};

// Human-readable mapping for dropdown values that were stored raw
const RECEIVED_IN_LABELS = {
  googleClassroom: 'Google Class Room',
  ViaEmail: 'Via Email',
};
const YES_NO_LABELS = {
  yes: 'Yes',
  no: 'No',
};

// Formats a Firestore Timestamp (or Date / string) into DD/MM/YYYY
const formatDate = (value) => {
  if (!value) return '';
  try {
    if (typeof value?.toDate === 'function') {
      return dayjs(value.toDate()).format('DD/MM/YYYY');
    }
    return dayjs(value).format('DD/MM/YYYY');
  } catch (e) {
    return '';
  }
};

// Extract a readable label from senttojournalist which is stored as {value, label}
const journalistLabel = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj.label || obj.value || '';
};

// Small helper: renders a label + value row (read-only)
const InfoRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: 1,
        minHeight: 48,
        backgroundColor: '#fafafa',
      }}
    >
      <Typography
        variant="subtitle1"
        color="textSecondary"
        sx={{
          flexBasis: '45%',
          p: 1,
          borderRight: '1px solid #ccc',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1, p: 1, wordBreak: 'break-word' }}>
        <Typography variant="body1">
          {value && value !== '' ? value : <span style={{ color: '#999' }}>—</span>}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

// Renders a full-width notes row
const NotesRow = ({ value }) => (
  <Grid item xs={12}>
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: 1,
        p: 1.5,
        backgroundColor: '#fafafa',
      }}
    >
      <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 500, mb: 0.5 }}>
        Notes
      </Typography>
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-wrap' }}
      >
        {value && value !== '' ? value : <span style={{ color: '#999' }}>—</span>}
      </Typography>
    </Box>
  </Grid>
);

// A section wrapper – shows title bar + "No data filled" if the section has no data
const ReviewSection = ({ title, bgColor, data, children }) => {
  const hasData =
    data &&
    Object.values(data).some(
      (v) => v !== undefined && v !== null && v !== '' && !(typeof v === 'object' && Object.keys(v).length === 0)
    );

  return (
    <div className="RotationAddedPayment MatchPayment">
      <div className="TitleDiv">
        <Typography sx={{ flexGrow: 1, backgroundColor: bgColor, p: 1, borderRadius: 2 }}>
          <b>{title}</b>
        </Typography>
      </div>
      <div className="VisaLetter">
        {hasData ? (
          <Grid container spacing={1} sx={{ p: 1 }} alignItems="center">
            {children}
          </Grid>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ color: '#999', fontStyle: 'italic' }}>
              No data filled
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

const StudentsPSCVReviewUser = (ActualAuthUser) => {
const ActualUser=ActualAuthUser.ActualUser;
  const navigate = useNavigate();
  let { id } = useParams(); // student uid
  if(typeof id==="undefined")
	{
		id=ActualUser.id;
	}
  const { showLoading, hideLoading, FetchDataFromCollection } = useLoading();


  const [StudentData, setStudentData] = useState({});

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUserData = async () => {
    try {
      showLoading();
      const userDataSelected = await FetchDataFromCollection(
        'Users',
        20,
        'uid',
        '==',
        id,
        0
      );
      if (userDataSelected && userDataSelected.length > 0) {
        setStudentData(userDataSelected[0]);
      }
    } catch (err) {
      console.error('Failed to load user data', err);
    } finally {
      hideLoading();
    }
  };

  const jr = StudentData?.journalistreview || {};
  const first = jr.firstjournalistreview || {};
  const second = jr.secondjournalistreview || {};
  const eras = jr.erasjournalistreview || {};
  const physician = jr.physicianjournalistreview || {};

  return (
    <CenteredBox>
      <CenteredBoxInfo>
        <button
          onClick={handleBack}
          style={buttonStyle}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = buttonStyle.backgroundColor)
          }
        >
          Go Back
        </button>

        {/* User header */}
        <div className="RotationAddedPayment MatchPayment">
          <div className="TitleDiv">
            <Typography
              sx={{
                flexGrow: 1,
                backgroundColor: '#b2ebf2',
                p: 1,
                borderRadius: 2,
              }}
            >
              <b>
                {StudentData.displayName || ''}
                {StudentData.email ? ` (${StudentData.email})` : ''}
              </b>
            </Typography>
          </div>
        </div>

        {/* Section 1 – PS Journalist First Review */}
        <ReviewSection
          title="PS Journalist First Review:"
          bgColor="#b2ebf2"
          data={first}
        >
          <InfoRow
            label="Received in"
            value={RECEIVED_IN_LABELS[first.receivedingoogleclassroomcorrect] || first.receivedingoogleclassroomcorrect}
          />
          <InfoRow
            label="Sent To Journalist Date"
            value={formatDate(first.senttojournalistdate)}
          />
          <InfoRow
            label="Journalist"
            value={journalistLabel(first.senttojournalist)}
          />
          <InfoRow
            label="Received From Journalist Date"
            value={formatDate(first.receivedfromjournalistdate)}
          />
          <NotesRow value={first.notes} />
        </ReviewSection>

        {/* Section 2 – PS Second Journalist Review */}
        <ReviewSection
          title="PS Second Journalist Review:"
          bgColor="#de7cc9"
          data={second}
        >
          <InfoRow
            label="PS Review"
            value={RECEIVED_IN_LABELS[second.psreview] || second.psreview}
          />
          <InfoRow
            label="Sent To Journalist Date"
            value={formatDate(second.senttojournalistdate)}
          />
          <InfoRow
            label="Journalist"
            value={journalistLabel(second.senttojournalist)}
          />
          <InfoRow
            label="Received From Journalist Date"
            value={formatDate(second.receivedfromjournalistdate)}
          />
          <NotesRow value={second.notes} />
        </ReviewSection>

        {/* Section 3 – ERAS CV Review Journalist */}
        <ReviewSection
          title="ERAS CV Review Journalist:"
          bgColor="#a4d8db"
          data={eras}
        >
          <InfoRow
            label="CV Review"
            value={RECEIVED_IN_LABELS[eras.cvreview] || eras.cvreview}
          />
          <InfoRow
            label="One and Done PS"
            value={YES_NO_LABELS[eras.oneanddoneps] || eras.oneanddoneps}
          />
          <InfoRow
            label="Sent To Journalist Date"
            value={formatDate(eras.senttojournalistdate)}
          />
          <InfoRow
            label="Journalist"
            value={journalistLabel(eras.senttojournalist)}
          />
          <InfoRow
            label="Received From Journalist Date"
            value={formatDate(eras.receivedfromjournalistdate)}
          />
          <InfoRow
            label="One and Done ERAS"
            value={YES_NO_LABELS[eras.oneanddoneeras] || eras.oneanddoneeras}
          />
          <NotesRow value={eras.notes} />
        </ReviewSection>

        {/* Section 4 – Mentor Review */}
        <ReviewSection
          title="Mentor Review:"
          bgColor="#a4c2db"
          data={physician}
        >
          <InfoRow
            label="Physician Review"
            value={YES_NO_LABELS[physician.physicianreview] || physician.physicianreview}
          />
          <InfoRow
            label="Sent To Mentor Date"
            value={formatDate(physician.senttojournalistdate)}
          />
          <InfoRow
            label="Mentor"
            value={journalistLabel(physician.senttojournalist)}
          />
          <InfoRow
            label="Received From Mentor Date"
            value={formatDate(physician.receivedfromjournalistdate)}
          />
          <NotesRow value={physician.notes} />
        </ReviewSection>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};

export default StudentsPSCVReviewUser;
