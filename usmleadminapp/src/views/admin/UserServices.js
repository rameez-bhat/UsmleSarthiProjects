import React from 'react';
import { Typography } from '@mui/material';

import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const FormateString="MM-DD-YYYY";
const formatDate = (dateString) => dayjs(dateString).format('dddd, MMMM D, YYYY');
const UserServices = ({ MatchValues, HandlePlatinumChange, HandlePlatinumMeetingsChange,MatchPlanListObject, UserServicesTaken,errors,rotationValues, plan, DeleteMeetings, AddMeetings }) => {
console.log("UserServicesTaken====>",UserServicesTaken)
const renderMeetings = () => {
    return UserServicesTaken?.['Match']?.['Payments'].map((paymentObject, Paymentindex) => {
      return (
      <>
      <div className="PlatinumAddedPaymentBody" >
      <p><strong>Mode Of Payment:</strong> {paymentObject?.ModeOfPayment}</p>
      <p><strong>Amount:</strong> ${paymentObject?.Amount}</p>
      <p><strong>Date Of Payment:</strong> {formatUTC(paymentObject?.PaymentDate)}</p>
      </div>
      </>
      );
    });
  };
  const formatUTC = (value, format = FormateString) => {
  if (!value) return null;

  if (typeof value === "string") {
    return dayjs.utc(value).format(format);
  }

  if (value?.seconds) {
    return dayjs.utc(value.seconds * 1000).format(format);
  }

  if (value?.toDate) {
    return dayjs.utc(value.toDate()).format(format);
  }

  return null;
};
  const renderPayments = (paymentObject) =>{
  return paymentObject?.['RotationPayment'].map((RotationPay, Paymentindex) => {
  return (
      <div className="LoopPayment" key={Paymentindex}>
      <p><strong>Mode Of Payment :</strong> {RotationPay?.ModeOfPayment?.value}</p>
      <p><strong>Amount :</strong> ${RotationPay?.Amount}</p>
      <p><strong>Fee Type :</strong> {RotationPay?.FeeType}</p>
      </div>)

  })
  }
   const renderPaymentsResearch = (paymentObject) =>{
   if(typeof paymentObject?.['Payments']!=="undefined")
   {

  return paymentObject?.['Payments'].map((researchPay, Paymentindex) => {
  return (
      <div className="LoopPayment" key={Paymentindex}>
      <p><strong>Fee Type :</strong> {researchPay?.FeeType}</p>
      <p><strong>Mode Of Payment :</strong> {researchPay?.ModeOfPayment}</p>
      <p><strong>Payment Date :</strong> {formatUTC(researchPay?.PaymentDate)}</p>
      <p><strong>Amount:</strong> ${researchPay?.Amount}</p>
      {/*<p><strong>Note :</strong> {researchPay?.RotationPaymentNotes}</p>*/}
      </div>)

  })
   }
  }
const renderMeetingsRotations = () => {
 return UserServicesTaken?.['RotationData']?.['Rotations'].map((paymentObject, Paymentindex) => {
         return (
      <>
      <div className="PlatinumAddedPaymentBody" >
      <p><strong>Enrollment Date:</strong> {formatUTC(paymentObject?.EnrollmentDate)}</p>
      <p><strong>Location Code:</strong> {paymentObject?.LocationCode?.label}</p>
      <p><strong>Start Date:</strong> {formatUTC(paymentObject?.StartDate)}</p>
      <p><strong>Status:</strong> {paymentObject?.RotationStatus?.label}</p>
      {renderPayments(paymentObject)}

      </div>
      </>
      );
    });
}
const renderResearch = () => {
 return UserServicesTaken?.['Research']?.map((research, index) => {
        //formatDate(research?.StartDate)
         return (
      <>
      <div className="PlatinumAddedPaymentBody" >
      <p><strong>Enrollment Date:</strong> {formatUTC(research?.EnrollmentDate, 'DD-MM-YYYY')}</p>
      <p><strong>Course Name:</strong> {research?.CourseName}</p>
      <p><strong>Start Date:</strong> {formatUTC(research?.StartDate)}</p>
      <p><strong>Publication Type:</strong> {research?.PublicationType}</p>
      <p><strong>Research Status:</strong> {research?.ResearchStatus}</p>
      <p><strong>Topic:</strong> {research?.Topic}</p>
      {renderPaymentsResearch(research)}

      </div>
      </>
      );
    });
}
  return (
    <>
    <div className="RotationAddedPayment MatchPayment UserServices">
          <div className="TitleDiv">
            <Typography sx={{ flexGrow: 1, backgroundColor: '#b2f2d9', p: 1, borderRadius: 2 }}><b>Rotation Services:</b></Typography>
          </div>
          <div className="PlatinumAddedPaymentBody">
           <div className="container">
    <h1 className="title">Product Summary</h1>
    <div className="cards">
      <div className="card">
        <h2>Match</h2>
        {typeof UserServicesTaken?.['Match']?.['EnrollmentDate']==="undefined" && (
        	<p><strong>No Data Found</strong></p>
        )}
        { UserServicesTaken?.['Match']?.['EnrollmentDate']&& (
        <>
        <p><strong>Enrollment Date:</strong> {formatUTC(UserServicesTaken?.['Match']?.['EnrollmentDate'])}</p>
        <p><strong>Plan:</strong>{UserServicesTaken?.['Match']?.['Plan']?.['Name']}</p>
        { (UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'Platinum' || UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'Platinum&HackensackCombo' || UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'B2RPlatinumCombo') && (
        	<>
        		<p>
  <strong>Mentor:</strong>
  {
    typeof UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['AssignedMentor'] === "object"
      ? UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['AssignedMentor']?.label
      : UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['AssignedMentor']
  }
</p>
        		<p><strong>Mentor Assigned On:</strong> {formatUTC(
UserServicesTaken?.['Match']?.[
UserServicesTaken?.['Match']?.['Plan']?.['Name']
]?.['DateOfMentorAssigned']
)}</p>
        		{ typeof UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['MentorChanged']!=="undefined" && (
        	<>
        		<p><strong>New Mentor:</strong>{UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['MentorChanged']?.['Relation']?.['PreviousMentorName']}</p>
        		<p><strong>Reason Of Change:</strong>{UserServicesTaken?.['Match']?.[UserServicesTaken?.['Match']?.['Plan']?.['Name']]?.['MentorChanged']?.['Relation']?.['Reason']}</p>
        	</>
        )}
        	</>
        )}
        { (UserServicesTaken?.['Match']?.['Plan']?.['Name'] === 'Custom' ) && (
        	<>
        		<p><strong>Custom Plan:</strong>{UserServicesTaken?.['Match']?.['Plan']?.['Relation']['Value']}</p>
        	</>

        )}
        {renderMeetings()}
        </>
       )}

      </div>
      <div className="card">
        <h2>Rotation</h2>
        {typeof UserServicesTaken?.['RotationData']?.['Rotations']==="undefined" && (
        <p><strong>No Data Found</strong></p>
        )}
        {UserServicesTaken?.['RotationData']?.['Rotations'] && (
        <>
        {renderMeetingsRotations()}
        </>
        )}
      </div>
       <div className="card">
        <h2>Research</h2>
        {typeof UserServicesTaken?.['Research']==="undefined" && (
        <p><strong>No Data Found</strong></p>
        )}
        {UserServicesTaken?.['Research'] && (
        <>
        {renderResearch()}
        </>
        )}
      </div>
    </div>
  </div>
        </div>
    </div>
    </>
  );
};

export default UserServices;
