import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { countryData } from "../../apis/countryData";
import { DatePicker } from "antd";
import { TextField, Grid, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import { CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import '../../components/css/style.css';

const { RangePicker } = DatePicker;
const dateFormat = "MM/DD/YYYY";

const UserDetails = (ActualAuthUser) => {
  const ActualUser = ActualAuthUser.ActualUser;
  const navigate = useNavigate();
  const { showLoading, hideLoading, FetchDataFromCollection, SelectWithComplexConditionsJoin } = useLoading();

  let { id } = useParams();
  if (typeof id === "undefined") {
    id = ActualUser.id;
  }

  const [CommonUserNotesData, setCommonUserNotesData] = useState([]);
  const [EnquiriesWithRotation, setEnquiriesWithRotation] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Fetch user data and Enquiries
  const fetchUserData = async () => {
    showLoading();

    const conditionsArrayEnquiry = [
      [{ name: "email", condition: "==", value: ActualUser.email }],
      [{ name: "uid", condition: "==", value: ActualUser?.uid }]
    ];
    const EnquiriesList = await SelectWithComplexConditionsJoin("Enquiries", conditionsArrayEnquiry, "timestamp", "desc", null, "UsersRoles", "email", "email");

    if (EnquiriesList.status === "success" && EnquiriesList.data.length) {
      await fetchRotationDetailsForEnquiries(EnquiriesList.data);
    }

    hideLoading();
  };

  // ✅ Fetch rotation details for each enquiry
  const fetchRotationDetailsForEnquiries = async (enquiries) => {
    const enrichedEnquiries = await Promise.all(
      enquiries.map(async (NotesObject) => {
        if (NotesObject?.rotationId) {
          const rotationDetails = await getRotationDetails(NotesObject.rotationId);
          return { ...NotesObject, rotationDetails };
        }
        return NotesObject;
      })
    );
    setEnquiriesWithRotation(enrichedEnquiries);
  };

  // ✅ Get rotation details from Rotations collection
  const getRotationDetails = async (rotationid) => {
    const rotationData = await FetchDataFromCollection("Rotations", 1, "__name__", "==", rotationid, 0);
    return rotationData?.length ? rotationData[0] : null;
  };

  // ✅ Convert timestamp to human-readable format
  const convertToServerDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000 || timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    }).format(date);
  };
   const convertToServerDateDay = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000 || timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  };
  const convertToLinks = (text) => {
  if (!text) return '';

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Replace URLs with <a> tags
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

  return (
    <CenteredBox>
      <CenteredBoxInfo>
        <div className="RotationAddedPayment">
          <div className="TitleDiv">
            <Typography sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 2 }}>
              <b>Enquiry Section:</b>
            </Typography>
          </div>

          <div className="VisaLetter">
            <Grid container spacing={1} sx={{ p: 1 }}>
              {EnquiriesWithRotation?.map((NotesObject, NotesIndex) => (
                <div className="RotationAddedPaymentBody EnquiryBody" key={NotesIndex}>
                  <Grid container spacing={2} sx={{ p: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b> No:</b> <font color="blue"><b>{NotesIndex + 1}:</b></font>
                      </Typography>
                    </Grid>
					<Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b>Enquired No:</b> {NotesObject?.inquiryYear}{NotesObject?.inquiryID}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b>Enquired On:</b> {convertToServerDate(NotesObject?.timestamp)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b>Location Code:</b> {NotesObject?.rotationDetails?.location_code || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b>Rotation Start Date:</b> {convertToServerDateDay(NotesObject?.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1,backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>
                        <b>Rotation Status:</b> {NotesObject?.status}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
  <Typography
    variant="subtitle1"
    color="textSecondary"
    sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
    dangerouslySetInnerHTML={{ __html: "<b>Question:</b>"+convertToLinks(NotesObject?.query) }}
  />
</Grid>
<Grid item xs={6}>
  <Typography
    variant="subtitle1"
    color="textSecondary"
    sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}
    dangerouslySetInnerHTML={{ __html: "<b>Answer:</b>"+convertToLinks(NotesObject?.replyquery) }}
  />
</Grid>
                  </Grid>
                </div>
              ))}
            </Grid>
          </div>
        </div>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};

export default UserDetails;
