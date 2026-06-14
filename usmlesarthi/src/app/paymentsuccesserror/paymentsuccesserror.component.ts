import { Component, OnInit, TemplateRef, ViewChild,AfterViewInit } from "@angular/core";
import { NgbCalendar, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ObservershipService } from "../observership/services/observership.service";
import { ToastrService } from "ngx-toastr";
import { debounceTime, first } from "rxjs/operators";

import * as firebase from "firebase";
import { AngularFireFunctions } from "@angular/fire/functions";
import { RotationsService } from "./services/paymentsuccesserror.service";
import { AuthenticationService } from "../common/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
//import { Calendar } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';


@Component({
  selector: "app-rotations",
  templateUrl: "./paymentsuccesserror.component.html",
  styleUrls: ["./paymentsuccesserror.component.scss"],
})
export class PaymentSuccessErrorComponent implements OnInit {
  @ViewChild('calendar', { static: false }) calendarComponent: FullCalendarComponent;
  totalPlanAmount=0;
  feePaidtoShow=0;
  sessionId="";
  studentUID="";
  studentEmail="";
  rotationCode="";
  currentUrl="";
  AdminLink="no";
  payOtherAmount: boolean = false;
  enterOtherAmount=0;
  PromotorDiscountFromParam= {};
  PromotorDiscounts : any= {};
  PromotorDiscountsAmount = 0;
  paymentscreen=false;
  paymentSelectionType="";
  selectedHospital: any;
  PromotionDataDiscountText="";
  PromotionDataDiscountAmount=0;
  RotationFee=0;
  loading=false;
  enteredEmail="";
  BookingSelectedDate="";
  ApplicationFee=0;
  termsAccepted=false;
  AuthUser;
  UserLoggedIn=false;
  rotationFeeCollectedBy="";
  PaymentSuccessFailur="";
  AllowTesting="";
  Amount="";
  hasDiscount='no';
  discountType='';
  discountValue: any ='';
  discountFrom='';
  discountTo='';
  discountAmount: any =0;
  discountedAmount=0;
  TotalInstallements=1;
  TotalInstallementsPaid=1;
  TotalInstallementsSelected=1;
  TotalInstallementDropDown=[];
  SendFullArrayToFunction:any={}
  InstallementNo=1;
  PaymentType="Rotation"; // Rotation or Match Or Research
  FeeType="Application";//Rotation Or Application Or ETC

  @ViewChild("instructions", { static: false })
  instructionModal: TemplateRef<any>;
  @ViewChild("content", { static: false }) rotationsModal: TemplateRef<any>;
  @ViewChild("reviews", { static: false }) reviewsModal: TemplateRef<any>;

  constructor(
    public modalService: NgbModal,
    private dbService: RotationsService,
    private toastr: ToastrService,
    private afn: AngularFireFunctions,
    public auth: AuthenticationService,
    public router: Router,
    public calendar: NgbCalendar,
    public route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      this.route.queryParams.subscribe(params => {
        console.log("params---->",params)
        this.sessionId = params['session_id'];
        this.studentUID = params['studentUID'];
        this.studentEmail = params['studentEmail'];
        this.rotationCode = params['rotationCode'];
        this.BookingSelectedDate = params['bookingStartDate'];
        this.totalPlanAmount = Number(params['TotalPlanFee']);
        this.feePaidtoShow = Number(params['TotalFeeToShow']);
        //this.TotalInstallements = params['TotalInstallements'];
        this.TotalInstallementsPaid = Number(params['TotalInstallements']);
        this.InstallementNo = Number(params['InstallementNo']);
        this.PaymentType = params['PaymentType'];
        this.FeeType = params['FeeType'];
        this.PromotionDataDiscountAmount = params['PromotionDataDiscountAmount'];
        this.PromotionDataDiscountText = params['PromotionDataDiscountText'];
        this.PaymentSuccessFailur=params['paymentStatus'];
        this.AllowTesting=params['AllowTesting'];
        this.Amount=params['amount'];
        if(params['AdminLink'])
        this.AdminLink=params['AdminLink'];
        if(params['PromotorReferralDiscountAmount'])
        {
          this.PromotorDiscountFromParam["PromotorReferralDiscountAmount"]=params['PromotorReferralDiscountAmount'];
        }
        if(params['Promotoremail'])
        {
          this.PromotorDiscountFromParam["Promotoremail"]=params['Promotoremail'];
        }
        if(params['Promotoruid'])
        {
          this.PromotorDiscountFromParam["Promotoruid"]=params['Promotoruid'];
        }
        if(params['PromotorDiscountsAmount'])
        {
          this.PromotorDiscountFromParam["PromotorDiscountsAmount"]=params['PromotorDiscountsAmount'];
        }
        this.SendFullArrayToFunction['sessionId']=this.sessionId;
        this.SendFullArrayToFunction['studentUID']=this.studentUID;
        this.SendFullArrayToFunction['studentEmail']=this.studentEmail;
        this.SendFullArrayToFunction['rotationCode']=this.rotationCode;
        this.SendFullArrayToFunction['BookingSelectedDate']=this.BookingSelectedDate;
        this.SendFullArrayToFunction['totalPlanAmount']=this.totalPlanAmount;
        this.SendFullArrayToFunction['feePaidtoShow']=this.feePaidtoShow;
        this.SendFullArrayToFunction['TotalInstallementsPaid']=this.TotalInstallementsPaid;
        this.SendFullArrayToFunction['InstallementNo']=this.InstallementNo;
        this.SendFullArrayToFunction['PaymentType']=this.PaymentType;
        this.SendFullArrayToFunction['FeeType']=this.FeeType;
        this.SendFullArrayToFunction['PromotionDataDiscountAmount']=this.PromotionDataDiscountAmount;
        this.SendFullArrayToFunction['PromotionDataDiscountText']=this.PromotionDataDiscountText;
        this.SendFullArrayToFunction['PaymentSuccessFailur']=this.PaymentSuccessFailur;
        this.SendFullArrayToFunction['AllowTesting']=this.AllowTesting;
        this.SendFullArrayToFunction['Amount']=this.Amount;
        this.SendFullArrayToFunction['AdminLink']=this.AdminLink;
        this.SendFullArrayToFunction['PromotorDiscountFromParam']=this.PromotorDiscountFromParam;
        
        
        
      });
      this.currentUrl = this.router.url;
      if(this.PaymentType=="Rotation")
      {
          const res= await this.dbService.getSelectedRotation(this.rotationCode);
          this.selectedHospital = Object.values(res)[0];
          if (this.selectedHospital && this.selectedHospital.rotationFeeCollectedBy !== undefined) {
            this.rotationFeeCollectedBy = this.selectedHospital.rotationFeeCollectedBy;
          }
          this.hasDiscount = this.selectedHospital && this.selectedHospital.hasDiscount ? this.selectedHospital.hasDiscount : "no";
          this.discountType = this.selectedHospital && this.selectedHospital.discountType ? this.selectedHospital.discountType : '';
          this.discountValue = this.selectedHospital && this.selectedHospital.discountValue? this.selectedHospital.discountValue : '';
          this.discountFrom = this.selectedHospital && this.selectedHospital.discountFrom? this.formatTimestamp(this.selectedHospital.discountFrom) : '';
          this.discountTo = this.selectedHospital && this.selectedHospital.discountTo? this.formatTimestamp(this.selectedHospital.discountTo) : '';
      
          /*this.RotationFee = Number(
            String(
              this.selectedHospital.StudentToBeCharged
               ? this.selectedHospital.StudentToBeCharged
                : this.selectedHospital.fee
            ).replace(/[^0-9.]/g, "")
          );*/
          this.RotationFee = Number(
          String(
            this.selectedHospital.fee
              ? this.selectedHospital.fee
              : this.selectedHospital.StudentToBeCharged
          ).replace(/[^0-9.]/g, "")
          );
          if(this.discountFrom<=this.BookingSelectedDate && this.discountTo>=this.BookingSelectedDate && this.hasDiscount=="yes")
          {
            console.log("Yes Discount To Be Applied===>")
            this.discountAmount=Number(this.discountValue);
            if(this.discountType=="percentage")
            {
              this.discountAmount=Number(Math.round(((this.RotationFee * this.discountValue) / 100)))
            }
          }
          this.TotalInstallements = (this.selectedHospital && this.selectedHospital.TotalInstallements) || 1;
          for (let i = 1; i <= this.TotalInstallements; i++) 
          {
            if(i==1)
            {
              this.TotalInstallementDropDown.push({value:i,text:`Pay Full Payment`})
            }
            else
            {
              this.TotalInstallementDropDown.push({value:i,text:`Pay In ${i} Installements`})
            }
          }
          this.AuthUser=this.auth;
          const finalprice=this.RotationFee-this.discountAmount;
          const interval = setInterval(async () => {
          if (this.auth.dataRead === true) 
          {
            console.log('✅ userData is now ready:', this.auth.userData);
            if(this.auth.isLoggedIn)
            {
              this.UserLoggedIn=true;
              if (this.auth && this.auth.userData && this.auth.userData.ReferralObject && this.auth.userData.ReferralObject.ReferredBy) 
              {
                const referredByObj = this.auth.userData.ReferralObject.ReferredBy;
                const promotorUID = Object.keys(referredByObj)[0];
                const referralUser=await this.dbService.ReadUserFromUID(promotorUID,"Users");
                let  referralDiscounts;
                console.log("referralUser---->",referralUser)
                if (referralUser && referralUser.ReferralObject && referralUser.ReferralObject.Settings && referralUser.ReferralObject.Settings.RotationApplication) 
                {
                  const referralDiscounts = referralUser.ReferralObject.Settings.RotationApplication;
                  if (referralDiscounts.discountFeeType === "BothFee" || referralDiscounts.discountFeeType === "ServiceFee") 
                  {
                    this.PromotorDiscounts.userDiscountType = referralDiscounts.userDiscountType;
                    this.PromotorDiscounts.userDiscountValue = referralDiscounts.userDiscountValue;
                    this.PromotorDiscounts.referralDiscountType = referralDiscounts.referralDiscountType;
                    this.PromotorDiscounts.referralDiscountValue = referralDiscounts.referralDiscountValue;
                    this.PromotorDiscounts.email = referralUser.email;
                    this.PromotorDiscounts.uid = referralUser.uid;
                    if (this.PromotorDiscounts.userDiscountType === "Value") 
                    {
                      this.PromotorDiscountsAmount = Number(this.PromotorDiscounts.userDiscountValue) || 0;
                      this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                    }
                    else if (this.PromotorDiscounts.userDiscountType === "Percentage") 
                    {
                      this.PromotorDiscountsAmount = Number((Number(finalprice) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
                      this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                    }
                    console.log("this.PromotorDiscountsAmount---->",this.PromotorDiscountsAmount)
                  }
                }
                else
                {
                  referralDiscounts = await this.dbService.ReadUserFromUID("RotationApplication","ReferralDiscounts");
                  console.log("referralDiscounts---->",referralDiscounts)
                  if(referralDiscounts &&  referralDiscounts.discountFeeType)
                  {
                    if(referralDiscounts.discountFeeType=="BothFee" || referralDiscounts.discountFeeType=="ServiceFee")
                    {
                      this.PromotorDiscounts.userDiscountType=referralDiscounts.userDiscountType;
                      this.PromotorDiscounts.userDiscountValue=referralDiscounts.userDiscountValue;
                      this.PromotorDiscounts.referralDiscountType = referralDiscounts.referralDiscountType;
                      this.PromotorDiscounts.referralDiscountValue = referralDiscounts.referralDiscountValue;
                      this.PromotorDiscounts.email=referralUser.email;
                      this.PromotorDiscounts.uid=referralUser.uid;
                      if (this.PromotorDiscounts.userDiscountType === "Value") 
                      {
                        this.PromotorDiscountsAmount = Number(this.PromotorDiscounts.userDiscountValue) || 0;
                        this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                      }
                      else if (this.PromotorDiscounts.userDiscountType === "Percentage") 
                      {
                        this.PromotorDiscountsAmount = Number((Number(finalprice) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
                        this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                      }
                    }
                  }
                }
              }
            }
            clearInterval(interval);
          } 
          else 
          {
            console.log('⏳ Waiting for userData...');
          }
          }, 1000); 
          console.log("this.PromotorDiscountsAmount--->",this.PromotorDiscountsAmount)
          console.log("this.rotationFeeCollectedBy---->",this.rotationFeeCollectedBy)
          const SessionStorate= await this.dbService.getLocalStorageSession(this.sessionId);
          //const SessionStorate = Object.values(resS)[0];
          console.log("SessionStorate---->",SessionStorate)
          if (this.AdminLink=="yes")  
          {

          }
          else if (Object.keys(SessionStorate).length)  
          {
            console.log("⚠️ Rotation already saved for this session. Skipping...");
            const WhereConditions = [
            { columnName: "email", condition: "==", value: this.studentEmail },
            { columnName: "location_code", condition: "==", value: this.rotationCode}
            ];
            this.dbService.deleteFromTableWithWhere("Enquiries",WhereConditions)
            return;
          }
          else
          {
            let result=await this.verifyPayment(this.sessionId,this.AllowTesting);
            if(this.studentUID.trim()!="" && result['data'] && result['data']['payment_status'] && result['data']['payment_status']=="paid")
            {
              //const res= await this.dbService.updateAddRotation(this.studentUID,this.studentEmail, this.rotationCode,this.BookingSelectedDate,this.Amount,this.sessionId,this.PaymentType,this.FeeType,this.TotalInstallementsPaid,this.InstallementNo,this.PromotionDataDiscountAmount,this.PromotionDataDiscountText,this.PromotorDiscountFromParam);
            }
            else if(this.studentEmail.trim()!="" && result['data'] && result['data']['payment_status'] && result['data']['payment_status']=="paid")
            {
              //const res= await this.dbService.updateGuestPayment(this.studentUID,this.studentEmail, this.rotationCode,this.BookingSelectedDate,this.Amount,this.sessionId,this.PaymentType,this.FeeType,this.TotalInstallementsPaid,this.InstallementNo,this.PromotionDataDiscountAmount,this.PromotionDataDiscountText);
            }
            const WhereConditions = [
              { columnName: "email", condition: "==", value: this.studentEmail },
              { columnName: "location_code", condition: "==", value: this.rotationCode}
              ];
            this.dbService.deleteFromTableWithWhere("Enquiries",WhereConditions)
          }
          this.SendEmail();
          await this.dbService.saveLocalStorageSession(this.sessionId)
        }
        else if(this.PaymentType=="Match")
        {
          const SessionStorate= await this.dbService.getLocalStorageSession(this.sessionId);
          if (Object.keys(SessionStorate).length)  
          {
              console.log("⚠️ Rotation already saved for this session. Skipping...");
              return;
          }
          else
          {
             const interval = setInterval(async () => {
          if (this.auth.dataRead === true) 
          {
            console.log('✅ userData is now ready:', this.auth.userData);
            if(this.auth.isLoggedIn)
            {
              this.UserLoggedIn=true;
              if (this.auth && this.auth.userData && this.auth.userData.ReferralObject && this.auth.userData.ReferralObject.ReferredBy) 
              {
              }
            }
            let result=await this.verifyPayment(this.sessionId,this.AllowTesting);
            if(this.studentUID.trim()!="" && result['data'] && result['data']['payment_status'] && result['data']['payment_status']=="paid")
            {
              //const res= await this.dbService.updateAddMatch(this.SendFullArrayToFunction);
            }
            else if(this.studentEmail.trim()!="" && result['data'] && result['data']['payment_status'] && result['data']['payment_status']=="paid")
            {
              //const res= await this.dbService.updateGuestPayment(this.studentUID,this.studentEmail, this.rotationCode,this.BookingSelectedDate,this.Amount,this.sessionId,this.PaymentType,this.FeeType,this.TotalInstallementsPaid,this.InstallementNo,this.PromotionDataDiscountAmount,this.PromotionDataDiscountText);
            }
            clearInterval(interval);
          }
          }, 1000); 
            
          }
         
          this.SendEmail();
          await this.dbService.saveLocalStorageSession(this.sessionId)
        }
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
  }
  formatTimestamp(ts){
    if (!ts || !ts.seconds) return "";

    const date = new Date(ts.seconds * 1000);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }
  async SendEmail(){
    let AmtPaid = (parseFloat(this.Amount) || 0) / 100;
    if(this.TotalInstallementsPaid>1)
    {
      //AmtPaid=Math.ceil(AmtPaid / this.TotalInstallements)
    }
    
    const date = new Date(this.BookingSelectedDate);
    this.BookingSelectedDate
    const usFormattedDate = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    let CustomeText="";
    if(this.FeeType=="Application")
    {
      CustomeText=`<p>has been successfully completed. Our team will share your rotation contract within the next 24–48 hours.</p>`
    
    if(this.rotationFeeCollectedBy=="usmle")
    {
      CustomeText +=`<p>Please note that to <b>reserve your slot and be officially connected with the physician,</b> the <b>full rotation fee</b> must be paid.</p>
      <p>You can complete your payment for Rotation <b>${this.rotationCode}</b> here:</p>

      <div style="text-align:center;margin-top:15px;">
        <a href="https://residencymatch.usmlesarthi.com/${this.currentUrl}" class="btn btn-primary">Pay Rotation Fee</a>
      </div>

      <p style="margin-top:20px;">
        If you prefer not to pay the full amount now, you may do so <b>45 days prior to your start date</b>. However, please note that availability may change, so it is important to recheck at that time.
      </p>

      <p>
        If you need a visa or acceptance letter, please complete the form below:
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf2LAAkyopF-QUhln6El5nhDr3atrTizfoOFUSMBrRcGiFRhQ/viewform" target="_blank">Click Here</a>
      </p>
    `;
    }
    else if(this.rotationFeeCollectedBy!="usmle")
    {
        CustomeText +=`<p style="margin-top:20px;">
      Once the contract is signed, our team will connect you with the physician via email .
    </p>
    <p>
        If you need a visa or acceptance letter, please complete the form below:
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf2LAAkyopF-QUhln6El5nhDr3atrTizfoOFUSMBrRcGiFRhQ/viewform" target="_blank">Click Here</a>
      </p>
    <p style="margin-top:20px;">If you have any questions or require assistance, please contact us</p>`;
    }
  }
  else if(this.FeeType=='Rotation' && this.TotalInstallementsPaid==1 && this.InstallementNo==1)
  {
    CustomeText=`<p style="margin-top:20px;">has been successfully completed. Our team will connect you with the Physician within the <b>next 24–48 hours.</b></p>
    <p style="margin-top:20px;">If you have any questions or require assistance, please contact us</p>
    `;
  }
  else if(this.FeeType=='Rotation' && this.TotalInstallementsPaid>1 && this.InstallementNo!=this.TotalInstallementsPaid)
  {
    CustomeText=`<p style="margin-top:20px;">has been successfully completed.</p>
    <p style="margin-top:20px;">
      Please note that in order to <b>be connected with the physician and reserve your spot,</b> the <b>entire rotation fee</b> must be paid in full.
    </p>
   <p style="margin-top:20px;">
      If you prefer not to pay the full amount now, you may do so <b>45 days prior to your start date.</b> However, please note that <b>availability may change,</b> so it is important to <b>recheck the availability</b> at that time.
    </p>
  <p style="margin-top:20px;">If you have any questions or need assistance, please feel free to reach out to us at</p>

    `;
  }
  else if(this.FeeType=='MatchFee' && this.TotalInstallementsPaid>1 && this.InstallementNo!=this.TotalInstallementsPaid)
  {
    
  }
  let SerInfo=`<li><b>Location Code:</b> ${this.rotationCode}</li>
        <li><b>Amount Paid:</b> $${AmtPaid}</li>
        <li><b>Rotation Selected Date:</b> ${usFormattedDate}</li>`;
  if(this.FeeType=='MatchFee' || this.FeeType=='ResearchFee')
  {
    if((this.FeeType=='MatchFee' || this.FeeType=='ResearchFee') && this.TotalInstallementsPaid>1 && this.InstallementNo!=this.TotalInstallementsPaid)
        {
          SerInfo=`<li><b>Plan Code:</b> ${this.rotationCode}</li>
        <li><b>You Agreed To Pay Full Amount Of :$${AmtPaid} In ${this.TotalInstallementsPaid} Installements</b> </li>
        <li><b>You Paid Your Installement No : ${this.InstallementNo} of : $${(AmtPaid /this.TotalInstallementsPaid).toFixed(2) }</b> </li>
        `;
        }
        else
        {
SerInfo=`<li><b>Plan Code:</b> ${this.rotationCode}</li>
        <li><b>Amount Paid:</b> $${AmtPaid}</li>
        `;
        }    
  }
  else if(this.FeeType=='MatchFee')
  {

  }
  let feDiff=Number(AmtPaid)-(Number(this.feePaidtoShow)/100);
  if(feDiff)
  {
    SerInfo= SerInfo+`<li><b>Processing Charges:</b> $${feDiff}</li>
    <li><b>Net Amount Paid:</b> $${Number(this.feePaidtoShow)/100}</li>`;
  }
    const DataToNotify={
      to: this.studentEmail,
      message: {
        subject: "Payment Confirmation ",
        html: `
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USMLE Sarthi Payment Confirmation</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f7f9fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #004aad;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header img {
      width: 120px;
      margin-bottom: 8px;
    }
    .content {
      padding: 20px 25px;
      color: #333333;
      font-size: 14px;
      line-height: 1.6;
    }
    .content ul {
      list-style-type: none;
      padding: 0;
      margin: 10px 0;
    }
    .content ul li {
      padding: 5px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      margin: 6px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
    }
    .btn-primary {
      background-color: #004aad;
      color: #fff !important;
    }
    .btn-outline-danger {
      border: 1px solid #e63946;
      color: #e63946 !important;
    }
    .btn-outline-success {
      border: 1px solid #1fa12e;
      color: #1fa12e !important;
    }
    .support-buttons {
      text-align: center;
      margin-top: 15px;
    }
    .support-buttons a img {
      vertical-align: middle;
      margin-right: 6px;
      height: 16px;
    }
    .footer {
      background-color: #f1f5f9;
      color: #555555;
      text-align: center;
      padding: 16px;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
    }
    @media (max-width: 600px) {
      .container { margin: 10px; }
      .btn { font-size: 13px; padding: 8px 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.usmlesarthi.com/uploads/5/3/3/4/53346297/final-logo-without-bg.png" alt="USMLE Sarthi">
      <h2 style="margin:0;">Payment Confirmation</h2>
    </div>

    <div class="content">
      <p>Dear ${this.studentEmail || 'Student'},</p>
      <p>Thank you for your payment. Your transaction details are as follows:</p>
      <ul>
        <li><b>Service:</b> ${this.PaymentType}</li>
        ${SerInfo}
        
      </ul>

      ${CustomeText}

      <div class="support-buttons">
        <a href="mailto:enroll@usmlesarthi.com" class="btn btn-outline-danger">
          <img src="https://cdn-icons-png.flaticon.com/512/281/281769.png" alt="Gmail"> Email Support
        </a>
        <a href="https://wa.me/+919306193724" class="btn btn-outline-success">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp"> WhatsApp Support
        </a>
      </div>

      <p style="margin-top:20px;">Thanks & Regards,<br><b>USMLE Sarthi Team</b></p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} USMLE Sarthi | 
      <a href="https://www.usmlesarthi.com" style="color:#004aad;">www.usmlesarthi.com</a>
    </div>
  </div>
</body>
</html>


        `,
      },
    }
    await this.dbService.SendEmail(DataToNotify)
  }
  async proceedToPayStripe (){
      let  session={};
      this.loading = true;
      let ActualfeeToPay=0;
      let FeetoShowToUser=0;
      this.paymentSelectionType="stripe"
      let perc=(((this.RotationFee)*104/100)-this.discountAmount+0.30)
      perc=perc-this.PromotorDiscountsAmount;
      let totalFee=Math.round(perc*100);
      FeetoShowToUser=totalFee;
      ActualfeeToPay=totalFee;
     if(this.payOtherAmount)
      {
      ActualfeeToPay=this.enterOtherAmount;
      FeetoShowToUser=(ActualfeeToPay*96/100)-0.30;
      FeetoShowToUser=Math.round(FeetoShowToUser*100);
      ActualfeeToPay=Math.round(ActualfeeToPay*100);
    }
      let AllowTesting="no";
      let stripe;

      let promotionobject={"discountAmount":this.discountAmount,"discountText":this.discountFrom? "Discount given from="+this.discountFrom+" To"+this.discountTo+" Discount="+this.discountValue+"("+this.discountType+")":""}
      console.log("TotalInstallementsSelected--->",this.TotalInstallementsSelected)
      try {
        //
        if(!this.auth.isLoggedIn)
        {
          if (this.enteredEmail.trim()=="") {
            this.loading = false;
            this.toastr.error(
              "Please enter a valid email."
            );
            return;
          }
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(this.enteredEmail)) 
          {
            this.toastr.error("Please enter a valid email address.");
            return;
          }
          if(this.auth.isLoggedIn && (this.auth.userData as any).Role === "Admin")
          {
              AllowTesting="yes";
              stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_TESTING);
          }
          else
          {
              stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_LIVE);
          }
          const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: ActualfeeToPay,
              totalPlanAmount: totalFee,
              feePaidtoShow:FeetoShowToUser,
              currency: 'usd',
              description: `USMLE Rotation Fee, Location Code(${this.rotationCode}) Booking`,
              studentEmail: this.enteredEmail,
              studentUID: '',
              PaymentType:"Rotation",
              PromotionData:promotionobject,
              FeeType:"Rotation",
              rotationCode: this.rotationCode,
              bookingStartDate:this.BookingSelectedDate,
              ReferralObject:this.PromotorDiscounts,
              StudentObject: '',
              PromoCodeAllow: "yes",
              TotalInstallements:this.TotalInstallementsSelected,
              InstallementNo:1,
              PassAllow:AllowTesting,
              successUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error',
              cancelUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error'
            })
          });
  
           session = await response.json();
        }
        else
        {
         
  
            const timestamp20minOld = firebase.firestore.Timestamp.fromDate(
              new Date(Date.now() - 20 * 60 * 1000)
            );
            const SavedSession= await this.dbService.getSavedStripeSession(this.auth.userData.email,timestamp20minOld);
            console.log("SavedSession--->",SavedSession)
            const SavedSessionKeys = Object.keys(SavedSession);
            console.log("SavedSessionKeys---->",SavedSessionKeys)
            
            if(SavedSessionKeys.length)
            {
              session={'id':SavedSession[SavedSessionKeys[0]]['sessionid'],'url':SavedSession[SavedSessionKeys[0]]['sessionurl']};
            }
            else
            {
              
              
              /*if(this.auth.userData.Role=="Admin")
              {
                AllowTesting="yes";
                stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_TESTING);
              }
              else*/
              {
                stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_LIVE);
              }
              
              console.log("this.ApplicationFee======>",this.ApplicationFee)
             console.log("totalFee======>",totalFee)
            const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: ActualfeeToPay,
                totalPlanAmount: totalFee,
                feePaidtoShow:FeetoShowToUser,
                currency: 'usd',
                description: `USMLE Rotation Fee, Location Code(${this.rotationCode}) Booking`,
                studentEmail: this.auth.userData.email,
                studentUID: this.auth.userData.uid,
                rotationCode: this.rotationCode,
                PaymentType:"Rotation",
                FeeType:"Rotation",
                PromotionData:promotionobject,
                bookingStartDate:this.BookingSelectedDate,
                ReferralObject:this.PromotorDiscounts,
                StudentObject: '',
                PromoCodeAllow: "yes",
                TotalInstallements:this.TotalInstallementsSelected,
                InstallementNo:1,
                PassAllow:AllowTesting,
                successUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error',
                cancelUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error'
              })
            });
    
             session = await response.json();
            }
        }
        console.log("session======>",session)
            window.location.href = (session as any).url;
    
            if ((session as any).error) {
              alert((session as any).error.message);
            }
      } catch (error) {
        console.error('❌ Stripe Checkout Error:', error);
      }
      this.loading = false;
    }
    choosePaymentType() {
      this.paymentscreen=true;
    }
    async pay(method: string) {
      if (!this.termsAccepted) {
        this.toastr.error(
          "Please agree to the terms and conditions before proceeding."
        );
        return;
      }
      console.log("this.auth.userData---->",this.auth.userData)
      switch (method) {
        case 'transferwise':
         this.paymentSelectionType="transferwise"
          break;
    
        case 'stripe':
          this.paymentSelectionType="stripe"
          let perc=((this.ApplicationFee*104/100)+0.30)
          let totalFee=perc;
          break;
    
        case 'zelle':
          this.paymentSelectionType="zelle"
          break;
    
        case 'wire':
          this.paymentSelectionType="wire"
          break;
    
        default:
          alert("Unknown payment method.");
      }
    }
    openWhatsApp() {
      const phoneNumber ="919306193724"; // ✅ Replace with your WhatsApp number (country code + number)
      const message = encodeURIComponent(`Hello, I need assistance regarding Rotation Location Code:${this.rotationCode}, Start Date:${this.BookingSelectedDate}`);
      
      // Opens WhatsApp (mobile or desktop)
      const url = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(url, '_blank');
    }
    openGmail() {
      const email = "customerservice@usmlesarthi.com"; // ✅ Replace with your support email
      const subject = encodeURIComponent("Help Needed Regarding Rotation Booking");
      const body = encodeURIComponent(
        `Hello,\n\nI need assistance regarding Rotation Location Code: ${this.rotationCode}, Start Date: ${this.BookingSelectedDate}.\n\nThank you.`
      );
  
  // Opens Gmail compose window in a new tab
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  window.open(gmailUrl, "_blank");
  
    }
  async verifyPayment(sessionId: string | null,AllowTesting: string | null) {
    if (!sessionId) return;
    let DataReturn={};
    try {
      const response = await fetch(`https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/verifyPayment?sessionId=${sessionId}&AllowTesting=${AllowTesting}`);
      const data = await response.json();
      DataReturn={"status":"success","data":data};

      console.log('Payment Verified:', data);
    } catch (err) {
      DataReturn={"status":"error","data":err};
      console.error('❌ Verification failed:', err);
    }
    return DataReturn;
  }

}
