import React, { useEffect, useState,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker} from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { set } from 'date-fns';
//const admin = require('firebase-admin');
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl,TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';

 const dateFormat = "MM/DD/YYYY";
let EmailList=[];
const UserDetails = () => {
  	const { did,stripePayment } = useParams();
  	console.log("stripePayment=====>",stripePayment)
	const [OperationMessage, setOperationMessage] = useState('');
	const { showLoading, hideLoading, API_KEY,DatabaseName,SelectWithComplexConditions,Timestamp,FetchDataFromCollection } = useLoading();
	const [AllPaymentData, setAllPaymentData] = useState([]);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({ id: 'RotationFeeDate', name: '' });
	const [FiltersType, setFiltersType] = useState(filters.id);
const [startDate, setStartDate] = useState(
  dayjs().subtract(10, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  	const [startDateView, setStartDateView] = useState(dayjs().subtract(10, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0));
  	const [endDateView, setEndDateView] = useState( dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0));
  	const [conditionType, setconditionType] = useState('');
  	const [filterField, setFilterField] = useState(filters.id);
  	const [idOptions, setIdOptions] = useState([]);
  	const [sortConfig, setSortConfig] = useState({ key: 'AdminInTouch', direction: 'ascending' });
 const getRelevantPayment = (payments) => {
    const priorityOrder = [
      "rotation full payment",
      "rotation balance payment",
      "rotation fee installment",
      "application fee",
    ];

    for (const type of priorityOrder) {
      const payment = payments.find((p) => p?.FeeType === type);
      if (payment) return payment;
    }
    return payments[0]; // Fallback to the first payment if no match
  };


  // Request sort function

  useEffect(() => {
    //return () => {
    fetchUserData();
 // };

  }, []);
  useEffect(() => {
  }, [did]);

  const fetchUserData = async (Cond="RotationFeeDate") => {
    try
    {

    	EmailList=[];
    	let result;
    	showLoading();

    	const DateTimestampStart=Timestamp.fromDate(startDate.toDate());
    	const DateTimestampEnd=Timestamp.fromDate(endDate.toDate());
    	const date = new Date(DateTimestampStart.seconds * 1000);

// Format the date as a readable string
const readableDate = date.toLocaleString();


    	let conditionsArray;


    	conditionsArray=[[]]
    	if(typeof stripePayment!="undefined")
    	{
    	  let lableset=["GuestUserPayments",stripePayment,"Payments"];
    	  result =await SelectWithComplexConditions(lableset,conditionsArray,"");
    	}
    	else
    	{
    	  result =await SelectWithComplexConditions("GuestUserPaymentsList",conditionsArray,"","paymentdate","desc");
    	}
		
		console.log("result====>",result)
		hideLoader()
   		if(result.status==="success")
   		{
   			setAllPaymentData(result.data)

   		}
    }
    catch (error)
    {
      console.error("Error fetching user data:", error);
    }
    hideLoading()
  };
const handleCancel = () => {
    setOpen(false);
  };
  const handleDeletePayment = async (row) => {
  try {
    showLoading();

    if (stripePayment) {
      await DatabaseName
        .collection("GuestUserPayments")
        .doc(row.email)
        .collection("Payments")
        .doc(
          `${row.rotationcode}___${row.rotationstartDate}___${row.paymentdate}`
        )
        .delete();
    } else {
      await DatabaseName
        .collection("GuestUserPaymentsList")
        .doc(row.email)
        .delete();
    }

    setAllPaymentData((prev) =>
      prev.filter((item) => item !== row)
    );

    setOperationMessage("Payment deleted successfully");
    setOpen(true);

  } catch (error) {
    console.error(error);
    setOperationMessage("Error deleting payment");
    setOpen(true);
  }

  hideLoading();
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
                }}>Payments Received From Stripe</div>

 	 <TableContainer component={Paper}>
      <Table>
        <TableHead>



            <TableRow>
            <TableCell>Email</TableCell>
            <TableCell >Location Code</TableCell>
            <TableCell>Payment Date</TableCell>
            <TableCell>Rotation Start Date</TableCell>
            <TableCell>Action</TableCell>
{stripePayment && (
<TableCell>Amount Paid</TableCell>
)}

          </TableRow>


        </TableHead>
        <TableBody>
          {AllPaymentData.length > 0 ? (
            AllPaymentData.map((rotation, index) => {
              return (
                <TableRow key={index}>

                  <TableCell>
                    <a
                      href={`/admin/gueststripepayments/${rotation.email}`}
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
                      {rotation.email}
                    </a>
                  </TableCell>
                  <TableCell>{rotation.rotationcode || 'NA'}</TableCell>
                  <TableCell>{rotation.paymentdate || 'N/A'}</TableCell>
                  <TableCell>{rotation.rotationstartDate || 'N/A'}</TableCell>
                  <TableCell>
  <Button
    variant="contained"
    color="error"
    size="small"
    onClick={() => {
      if (
        window.confirm(
          `Delete payment for ${rotation.email}?`
        )
      ) {
        handleDeletePayment(rotation);
      }
    }}
  >
    Delete
  </Button>
</TableCell>
                  {stripePayment && (
<TableCell>${rotation.amount/100 || 'N/A'}</TableCell>
)}

                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p></p>

    </TableContainer>
        <Dialog
        open={open}
        onClose={handleCancel}

      >
        <DialogTitle>Operation Status</DialogTitle>
        <DialogContent>
          <DialogContentText>

           {OperationMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Ok
          </Button>

        </DialogActions>
      </Dialog>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};


export default UserDetails;
