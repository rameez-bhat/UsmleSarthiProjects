
import {
  Typography,
  CircularProgress,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  Select,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,IconButton
} from '@mui/material';
import { CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
const DateFormatForAll="MM/DD/YYYY";
const followupindexLoop=0;
let NotesIndexMain=0;
const CrossSellList=[
{value:"match",label:"Match"},
{value:"rotation",label:"Rotation"},
{value:"research",label:"Research"}
]
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
const formatDate = (dateString) => dayjs(dateString).format('dddd, MMMM D, YYYY');

const CommonNotes = ({ ActualUser,NextFollowupChange,UserData,EnquiriesWithRotation,DeleteFollowup,SaveFollowups,AddFollowup,errors,AdminOptionsList,plan,HandleCommonNotesSectionChange }) => {
console.log("UserData1======>",UserData)
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

export default CommonNotes;
