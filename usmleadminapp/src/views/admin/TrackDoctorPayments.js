import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
//const admin = require('firebase-admin');
import {
  Grid,
  Box,
	Typography,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles'; 
import  '../../components/css/style.css'; 



const UserDetails = () => {
  	const { did } = useParams();
  	const { showLoading, hideLoading, API_KEY,DatabaseName,Timestamp, FetchDataFromCollection } = useLoading();
	const [CurrentViewData, setCurrentViewData] = useState({});
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [userData,setuserData] = useState(null);
	 const [userDetailsMap, setUserDetailsMap] = useState({});
	
  useEffect(() => {

    fetchUserData();
  }, [did]);
   useEffect(() => {
	setCurrentViewData(CurrentViewData)
	 
  }, [CurrentViewData]);
   const GetUserDetails = async (ListId) => 
   {
   		const UsersData = await FetchDataFromCollection("Users", 10, "__name__", "in", ListId, null);
   		console.log("UsersData---->",UsersData);
   		return UsersData;
   }
  const fetchUserData = async () => {
    try {

      console.log("Fetching user data for ID:", did);
      const doctorSelected = await FetchDataFromCollection("RotationDoctors", 10, "__name__", "==", did, null);
      //const Payments = await FetchDataFromCollection("RotationDoctors", 10, "DoctorInfo.Payments.PaymentDate", ">=", timestamp, did);
      //console.log("timestamp--->",timestamp)
    console.log("doctorSelected--->",doctorSelected)
      if(doctorSelected.length>0)
      {
      	if(Object.keys(doctorSelected[0]?.DoctorInfo?.Payments)?.length>0)
      	{
      		setAllPaymentData(doctorSelected[0]?.DoctorInfo?.Payments);
      		console.log("AllPaymentData--->",AllPaymentData)
      		const userDetailsMap = {};

      // Using for...of loop to await each GetUserDetails call for each key
      for (const key of Object.keys(doctorSelected[0]?.DoctorInfo?.Payments)) {
        const TotalUserList = Object.keys(doctorSelected[0]?.DoctorInfo?.Payments[key]['List']);
        userDetailsMap[key] = await GetUserDetails(TotalUserList);
      }

      setUserDetailsMap(userDetailsMap);
      	}
      }
      
      console.log("AllPaymentData--->",AllPaymentData)
      // Ensure that we have data before setting it
      if (doctorSelected && doctorSelected.length > 0) {
        setuserData(doctorSelected[0]);
        console.log("Fetched doctor data:", doctorSelected[0]);
      } else {
        console.log("No data found for the provided ID.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };





const showLoader = () => {
   let elements =document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('hidden'); // Example manipulation
    }
  };

const hideLoader = () => {
     let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden'); // Example manipulation
    }
  };
  return (
    <CenteredBox>

      <CenteredBoxInfo>
      <div style={{
                  width: '45%',
                  margin: '0 auto',
				fontSize: '22px',
				fontWeight: 'bolder'
                }}>Add Doctors Payments For Roations</div>
     	 	<Grid container spacing={2} sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Name:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Representing Email:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingEmail}</Typography>
                </Box>
              </Grid>
               <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Admin adminName:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.representingName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', p: 0, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ flexGrow: 1, backgroundColor: '#b2ebf2', p: 1, borderRadius: 1 }}>Contact:</Typography>
                  <Typography variant="body1" sx={{ backgroundColor: '#b2f2d9', p: 1, borderRadius: 1 }}>{userData?.DoctorInfo?.contact}</Typography>
                </Box>
              </Grid>
            </Grid>  
  
 

          <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Mode Of Payment</TableCell>
            <TableCell>Payment Date</TableCell>
            <TableCell>Total Users</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(AllPaymentData).length > 0 ? (
            Object.keys(AllPaymentData).map((key, index) => {
              const value = AllPaymentData[key]['PaymentDetails'];
              const TotalUserList = Object.keys(AllPaymentData[key]['List']);

              // Check if UserDetails for the key has been fetched
              const UserDetailsReceived = userDetailsMap[key] || [];

              return (
                <TableRow key={index}>
                  <TableCell>${value.Amount}</TableCell>
                  <TableCell>{value.ModeOfPayment.label}</TableCell>
                  <TableCell>{dayjs(value.PaymentDate.toDate()).format('ddd, DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {UserDetailsReceived.length > 0 ? (
                          UserDetailsReceived.map((user, indexU) => (
                            <TableRow key={indexU}>
                              <TableCell> <a
        href={`/userdetails/${user.uid}`}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: '2px 20px',
          backgroundColor: '#af4cab',
          marginBottom: '3px',
          marginRight: '3px',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block',
          fontWeight: 'bold',
        }}
      >
        {user.email}
      </a></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell>No users found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

        
      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
