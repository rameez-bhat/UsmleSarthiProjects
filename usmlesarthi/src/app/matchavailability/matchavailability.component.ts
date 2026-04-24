import { Component, OnInit, TemplateRef, ViewChild,AfterViewInit,NgZone,ChangeDetectorRef } from "@angular/core";
import { NgbCalendar, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ObservershipService } from "../observership/services/observership.service";
import { ToastrService } from "ngx-toastr";
import { debounceTime, first } from "rxjs/operators";

import * as firebase from "firebase";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatchAvailabilityService } from "./services/matchavailability.service";
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
  templateUrl: "./matchavailability.component.html",
  styleUrls: ["./matchavailability.component.scss"],
})

export class MatchAvailabilityComponent implements OnInit {
  @ViewChild('calendar', { static: false }) calendarComponent: FullCalendarComponent;
  landing: string;
  matchId = "";
  SelectedMatchPlan: any={}
  Viewtype = "";
  tooltipVisible = false;
  tooltipContent = '';
  termsAccepted: boolean = false;
  payOtherAmount: boolean = false;
  loading: boolean = false;
  enteredEmail="";
  paymentscreen: boolean =false;
  UserLoggedIn: boolean =false;
  processingFeePercentage: number=4;
  paymentSelectionType="";
  enterOtherAmount=0;
  grouprequired='';
  grouprequiredof='';
  PromotorDiscounts: any ={}
  input: any ={};
  PromotorDiscountsAmount=0;
  TotalInstallements=1;
  TotalInstallementDropDown=[];
  TotalInstallementsSelected=1;
  needconfirmfromPhysician='';
  needconfirmfromPhysicianMessage='';
  BookingSelectedDate='';
  BookingSelectedDateEnq : any ={};
  hasDiscount='no';
  discountType='';
  discountValue='';
  discountFrom='';
  discountTo='';
  discountedAmount=0;
  discountAmount: any =0;
  amountAfterDiscount=0;
  seats_available=0;

  @ViewChild("instructions", { static: false })
  instructionModal: TemplateRef<any>;
  @ViewChild("content", { static: false }) rotationsModal: TemplateRef<any>;
  @ViewChild("reviews", { static: false }) reviewsModal: TemplateRef<any>;

  constructor(
    public modalService: NgbModal,
    private dbService: MatchAvailabilityService,
    private toastr: ToastrService,
    private afn: AngularFireFunctions,
    public auth: AuthenticationService,
    public router: Router,
    public route: ActivatedRoute,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      this.matchId = this.route.snapshot.paramMap.get('matchCode');
    console.log('Received rotation code:', environment);
    console.log('this.auth:', this.auth);
    this.Viewtype=this.route.snapshot.paramMap.get('viewtype');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-based, so +1 for human-readable month
    const currentYear = today.getFullYear();

      this.route.paramMap.subscribe(params => {
        this.matchId = params.get('matchCode');
      });
      this.loading = true;
      this.landing = "list";
      const kommunicateWidget = document.getElementById("kommunicate-widget-iframe");
    if (kommunicateWidget) {
      kommunicateWidget.style.display = "none";
    }
     const res= await this.dbService.getSelectedMatch(this.matchId);
     this.SelectedMatchPlan = Object.values(res)[0];
     console.log("this.SelectedMatchPlan----->",this.SelectedMatchPlan)
     if(this.SelectedMatchPlan.processingFeePercentage)
     {
      this.processingFeePercentage=Number(this.SelectedMatchPlan.processingFeePercentage);
     }
     let installements = this.SelectedMatchPlan.TotalInstallements;
    // ✅ Normalize → always array
    if (installements !== undefined && installements !== null) 
    {
      if (!Array.isArray(installements)) 
      {
        installements = [installements];
      }
    } 
    else 
    {
      installements = [];
    }
    // ✅ Ensure numbers (important)
    installements = installements.map((x: any) => Number(x));
    console.log("this.TotalInstallementDropDown---->",installements)
    this.TotalInstallements = installements;
    //this.TotalInstallements = (this.SelectedMatchPlan && this.SelectedMatchPlan.TotalInstallements) || 1;
    this.TotalInstallementDropDown = [];
    installements.forEach((i: number) => {
  if (i === 1) {
    this.TotalInstallementDropDown.push({
      value: i,
      text: `Pay Full Payment`
    });
  } else {
    this.TotalInstallementDropDown.push({
      value: i,
      text: `Pay In ${i} Installements`
    });
  }
});
console.log("this.TotalInstallementDropDown---->",this.TotalInstallementDropDown)
    /*for (let i = 1; i <= this.TotalInstallements; i++) {
      if(i==1)
      {
        this.TotalInstallementDropDown.push({value:i,text:`Pay Full Payment`})
      }
      else
      {
        this.TotalInstallementDropDown.push({value:i,text:`Pay In ${i} Installements`})
      }
      
    }*/
    await this.sleep(2000);
    console.log('this.auth:', this.auth.userData);
    if(this.auth.isLoggedIn)
    {
      this.UserLoggedIn=true;
      console.log('this.auth.userData:', this.auth.userData);
      if (this.auth && this.auth.userData && this.auth.userData.ReferralObject && this.auth.userData.ReferralObject.ReferredBy) 
      {
        const referredByObj = this.auth.userData.ReferralObject.ReferredBy;
        const promotorUID = Object.keys(referredByObj)[0];
        const referralUser=await this.dbService.ReadUserFromUID(promotorUID,"Users");
        let  referralDiscounts;
       if (referralUser && referralUser.ReferralObject && referralUser.ReferralObject.Settings && referralUser.ReferralObject.Settings[this.matchId]) 
        {
          const referralDiscounts = referralUser.ReferralObject.Settings[this.matchId];
          if (referralDiscounts.discountFeeType === "BothFee" || referralDiscounts.discountFeeType === "ServiceFee") 
          {
            this.PromotorDiscounts.userDiscountType = referralDiscounts.userDiscountType;
            this.PromotorDiscounts.userDiscountValue = referralDiscounts.userDiscountValue;
            this.PromotorDiscounts.referralDiscountType = referralDiscounts.referralDiscountType;
            this.PromotorDiscounts.referralDiscountValue = referralDiscounts.referralDiscountValue;
            this.PromotorDiscounts.email = referralUser.email;
            this.PromotorDiscounts.uid = referralUser.uid;
            // ✅ FIXED VALUE DISCOUNT
            if (this.PromotorDiscounts.userDiscountType === "Value") 
            {
              this.PromotorDiscountsAmount = Number(this.PromotorDiscounts.userDiscountValue) || 0;
              this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
            }
            // ✅ FIXED PERCENTAGE DISCOUNT (== → =)
            else if (this.PromotorDiscounts.userDiscountType === "Percentage") 
            {
              this.PromotorDiscountsAmount = Number((Number(this.SelectedMatchPlan.fee) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
              this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
            }
          }
        }
        else
        {
          referralDiscounts = await this.dbService.ReadUserFromUID(this.matchId,"ReferralDiscounts");
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
                // ✅ FIXED PERCENTAGE DISCOUNT (== → =)
                else if (this.PromotorDiscounts.userDiscountType === "Percentage") 
                {
                  this.PromotorDiscountsAmount = Number((Number(this.SelectedMatchPlan.fee) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
                  this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                }
            }
          }
        }
      }
    }
    console.log("this.PromotorDiscountsAmount=====>",this.PromotorDiscountsAmount)
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
     this.ngZone.run(() => {
      this.loading = false;
    });
    this.loading = false;
  }
  private sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
onInstallmentChange(value: any) {
  //this.TotalInstallementsSelected = value;

  if (value > 1) {
   // ✅ Check if object exists
    if (this.SelectedMatchPlan.processingFeePercentageWI) {

      // ✅ Get fee based on selected installment
      const fee = this.SelectedMatchPlan.processingFeePercentageWI[value];

      if (fee !== undefined && fee !== null) {
        this.processingFeePercentage = Number(fee);
      } else {
        // ❗ fallback if not set
        this.processingFeePercentage = 0;
      }
    }
  } else {
    if(this.SelectedMatchPlan.processingFeePercentage)
    {
      this.processingFeePercentage=Number(this.SelectedMatchPlan.processingFeePercentage);
    }
  }
  this.cdr.detectChanges();
}
  redirectToLogin(modal: any): void {
    //modal.close(); // Close the modal
    const currentUrl = this.router.url;
    console.log("currentUrl----->",currentUrl)
    console.log("this.router----->",this.router)
    localStorage.setItem('redirectUrl', currentUrl);
    this.router.navigate(['/authenticate']); // Redirect to /authenticate
  }
   getDiscountAmount(item) {
  if (item.hasDiscount !== "yes") return 0;

  const now = new Date();
  const from = new Date(item.discountFrom.seconds * 1000);
  const to = new Date(item.discountTo.seconds * 1000);

  if (now < from || now > to) return 0;

  const fee = Number(item.fee);
  const value = Number(item.discountValue) || 0;

  let discount =
    item.discountType === "percentage"
      ? (fee * value) / 100
      : value;

  // Round to 2 decimal places
  return Number(discount.toFixed(2));
}


startBuying(plan: any) {
  this.paymentscreen = true;
  this.paymentSelectionType = null;
  this.termsAccepted = false;

  // Scroll into view smoothly
  setTimeout(() => {
    const el = document.querySelector('.floating-payment-box');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

closePaymentBox() {
  this.paymentscreen = false;
}


  async proceedToPayStripe (){
    let  session={};
    this.loading = true;
    let TotalInstallementsSelected=this.TotalInstallements;
    if(this.TotalInstallementsSelected)
    {
      TotalInstallementsSelected=this.TotalInstallementsSelected;
    }
    this.paymentSelectionType="stripe";
    let ActualfeeToPay=0;
    let FeetoShowToUser=0;
    let perc=((this.SelectedMatchPlan.fee*(100+this.processingFeePercentage)/100)+0.30)
    perc=perc-this.PromotorDiscountsAmount-this.getDiscountAmount(this.SelectedMatchPlan);
    let totalFee=Math.round(perc*100);
    FeetoShowToUser=totalFee;
    ActualfeeToPay=totalFee;
     if(this.payOtherAmount)
    {
      ActualfeeToPay=this.enterOtherAmount;
      //totalFee=ActualfeeToPay;
      FeetoShowToUser=(ActualfeeToPay*(100-this.processingFeePercentage)/100)-0.30;
      FeetoShowToUser=Math.round(FeetoShowToUser*100);
      ActualfeeToPay=Math.round(ActualfeeToPay*100);
    }
    
    console.log("totalFee====>",totalFee)
    let AllowTesting="no";
    let promotionobject={"discountAmount":this.getDiscountAmount(this.SelectedMatchPlan),"discountText":""}
    let stripe;
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
        stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_LIVE);
        const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: ActualfeeToPay, // amount in cents (e.g., 100.00 USD)
            totalPlanAmount: totalFee,
            feePaidtoShow:FeetoShowToUser,
            currency: 'usd',
            description: `USMLE Match Fee, Plan(${this.matchId}) Booking`,
            studentEmail: this.enteredEmail,
            studentUID: '',
            rotationCode: this.matchId,
            bookingStartDate:'',
            PaymentType:"Match",
            FeeType:"MatchFee",
            PromotionData:promotionobject,
            ReferralObject:this.PromotorDiscounts,
            StudentObject: '',
            PromoCodeAllow: "yes",
            PassAllow:AllowTesting,
            TotalInstallements:TotalInstallementsSelected,
            InstallementNo:1,
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
            if(this.auth.userData.Role=="Admin")
            {
              AllowTesting="yes";
              stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_TESTING);
            }
            else
            {
              stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_LIVE);
            }
            
            console.log("this.ApplicationFee======>",this.SelectedMatchPlan.fee)
           console.log("totalFee======>",totalFee)
          const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: ActualfeeToPay, // amount in cents (e.g., 100.00 USD)
              totalPlanAmount: totalFee,
              feePaidtoShow:FeetoShowToUser,
              currency: 'usd',
              description: `USMLE Match Fee, Plan(${this.matchId}) Booking`,
              studentEmail: this.auth.userData.email,
              studentUID: this.auth.userData.uid,
              rotationCode: this.matchId,
              bookingStartDate:'',
              PaymentType:"Match",
              FeeType:"MatchFee",
              StudentObject: '',
              PromotionData:promotionobject,
              ReferralObject:this.PromotorDiscounts,
              PromoCodeAllow: "yes",
              PassAllow:AllowTesting,
              TotalInstallements:TotalInstallementsSelected,
              InstallementNo:1,
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
        let perc=((this.SelectedMatchPlan.fee*104/100)+0.30)
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
  openWhatsApp(plan) {
    const phoneNumber ="919306193724"; // ✅ Replace with your WhatsApp number (country code + number)
    const message = encodeURIComponent(`Hello, I need assistance regarding Match Plan:${plan.Name}`);
    
    // Opens WhatsApp (mobile or desktop)
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  }
  openGmail(plan) {
    const email = "customerservice@usmlesarthi.com"; // ✅ Replace with your support email
    const subject = encodeURIComponent("Help Needed Regarding Match Plan("+plan.Name+")");
    const body = encodeURIComponent(
      `Hello,\n\nI need assistance regarding Match Plan: ${plan.Name}.\n\nThank you.`
    );

// Opens Gmail compose window in a new tab
const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
window.open(gmailUrl, "_blank");
  }

  openInstructions(content) {
    this.modalService.open(content, { size: "lg" });
  }
  getNumber(number) {
    this.input.phone = number;
  }

  

  validateInputs() {
    let input = this.input;
    if (input.isNewUser) {
      console.log("input------>",input)
      if (
        input.email.trim() === "" ||
        input.name.trim() === "" ||
        input.phone.trim() === ""
      )
        return false;
    } else {
      if (!this.auth.userData) return false;
    }
    if (input.duration.trim() === "") return false;
    if (input.sarthi.trim() === "") return false;
    return true;
  }
}
