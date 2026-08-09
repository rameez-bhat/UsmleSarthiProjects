import { Component, OnInit, TemplateRef, ViewChild,AfterViewInit } from "@angular/core";
import { NgbCalendar, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ObservershipService } from "../observership/services/observership.service";
import { ToastrService } from "ngx-toastr";
import { debounceTime, first } from "rxjs/operators";

import * as firebase from "firebase";
import { AngularFireFunctions } from "@angular/fire/functions";
import { RotationsService } from "./services/rotationsavailability.service";
import { AuthenticationService } from "../common/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
//import { Calendar } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../src/environments/environment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryWithStates } from '../login/countriesWithStates';


@Component({
  selector: "app-rotations",
  templateUrl: "./rotationsavailability.component.html",
  styleUrls: ["./rotationsavailability.component.scss"],
})

export class RotationAvailabilityComponent implements OnInit {
  @ViewChild('calendar', { static: false }) calendarComponent: FullCalendarComponent;
  landing: string;
  tooltipVisible = false;
  tooltipContent = '';
  termsAccepted: boolean = false;
  paymentscreen: boolean =false;
  paymentSelectionType="";
  validRange = {
    start: new Date().toISOString().split('T')[0], // today
  };
  phoneError : boolean = false;
  phone : string = '';
  phoneNumber: string = '';
  countryPhoneOptions: any[] = [];
  countryOptions: any[] = [];
  selectedPhoneCountry: any;
  selectedCountry: any;



  enteredEmail="";
  ApplicationFee=0;
  payOtherAmount: boolean = false;
  ShowModelPopup: boolean = false;
  enterOtherAmount=0;
  RotationFee=0;
  tooltipX = 0;
  tooltipY = 0;
  Viewtype: string;
  loading: boolean;
  calendarOptions: any;
  isFiltersCollapsed: boolean = false;
  specialities = [];
  grouprequired='';
  grouprequiredof='';
  TotalInstallements=1;
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
  locationCodes = [];
  availabilitylist = [];
  getNearestDates= {};
  seatsAvailableNow=0;
  CustomeMessage = "";
  calendarPlugins = [dayGridPlugin, interactionPlugin];
  defaultView = 'dayGridMonth';
  editable = true;
  selectable = true;

  // map your pageHospitals or other data to events
  calendarEvents = [];
  selectedRotationForAvailability: any =  {};
  availabilityData: any = [];
  title = [];
  cities = [];
  states = [];
  types = [];
  PromotorDiscounts: any = {};
  PromotorDiscountsAmount = 0;
  UserLoggedIn=false;
  rotationSettings = [];
  visaLetters = ["Yes", "No"];
  lorTypes = [];
  selectedLocationCode = [];
  selectedTitle = [];
  selectedSpecialities = [];
  selectedTypes = [];
  selectedCities = [];
  selectedStates = [];
  submitEmailPopup = false;
  selectedRotationSettings = [];
  selectedVisaLetters = [];
  selectedLorTypes = [];
  selectedOffers = false;
  selectedPD = false;
  selectedCombo = false;
  sortFees: boolean = false;
  rotationsObject: any = {};
  NextAvailableMonthDate: any = {};
  CurrentMonthData: any = {};
  hospitals: any = [];
  rotationCode: string | null = null;
  refinedHospitals: any[] = [];
  pageHospitals: any = [];
  selectedHospital: any;
  pageStart: number = 0;
  pageEnd: number = 50;
  step: number = 50;
  input: any = {
    query: "",
    email: "",
    date: this.calendar.getToday(),
    duration: "4 Weeks",
    sarthi: "",
    phone: "",
  };
  userEnquiries: any = [];
  currentStatus: any = "";
  userType: any = "";
  private tooltipTimeout: any;

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
      this.loadCountries(); 
      this.rotationCode = this.route.snapshot.paramMap.get('rotationcode');
    this.Viewtype=this.route.snapshot.paramMap.get('viewtype');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-based, so +1 for human-readable month
    const currentYear = today.getFullYear();

      this.route.paramMap.subscribe(params => {
        this.rotationCode = params.get('rotationcode');
      });
     
      this.loading = true;
      this.landing = "list";
      const kommunicateWidget = document.getElementById("kommunicate-widget-iframe");
    if (kommunicateWidget) {
      kommunicateWidget.style.display = "none";
    }
     const res= await this.dbService.getSelectedRotation(this.rotationCode);
     this.selectedHospital = Object.values(res)[0];
     this.selectedHospital.reviews = await this.dbService.getReviews(
      this.rotationCode
    );
    this.ApplicationFee = Number(
      String(this.selectedHospital.registration_fee).replace(/[^0-9.]/g, "")
    );
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
    this.TotalInstallements = (this.selectedHospital && this.selectedHospital.TotalInstallements) || 1;
    this.getEventsForTheMonth(currentMonth,currentYear);
    if(this.auth.isLoggedIn)
    {
      this.UserLoggedIn=true;
      if (this.auth && this.auth.userData && this.auth.userData.ReferralObject && this.auth.userData.ReferralObject.ReferredBy) 
      {
        const referredByObj = this.auth.userData.ReferralObject.ReferredBy;
        const promotorUID = Object.keys(referredByObj)[0];
        const referralUser=await this.dbService.ReadUserFromUID(promotorUID,"Users");
        let  referralDiscounts;
       if (referralUser && referralUser.ReferralObject && referralUser.ReferralObject.Settings && referralUser.ReferralObject.Settings.RotationApplication) 
        {
          const referralDiscounts = referralUser.ReferralObject.Settings.RotationApplication;
          if (referralDiscounts.discountFeeType === "BothFee" || referralDiscounts.discountFeeType === "ApplicationFee") 
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
              this.PromotorDiscountsAmount = Number((Number(this.ApplicationFee) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
              this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
            }
          }
        }
        else
        {
          referralDiscounts = await this.dbService.ReadUserFromUID("RotationApplication","ReferralDiscounts");
          if(referralDiscounts &&  referralDiscounts.discountFeeType)
          {
            if(referralDiscounts.discountFeeType=="BothFee" || referralDiscounts.discountFeeType=="ApplicationFee")
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
                  this.PromotorDiscountsAmount = Number((Number(this.ApplicationFee) * Number(this.PromotorDiscounts.userDiscountValue) / 100).toFixed(2))
                  this.PromotorDiscounts.PromotorDiscountsAmount=this.PromotorDiscountsAmount;
                }
            }
          }
        }
      }
    }
    else
    {
      this.UserLoggedIn = false;
      this.ShowModelPopup = true;
    }
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
    this.setResponsiveView();
    window.addEventListener('resize', () => this.setResponsiveView());
    this.loading = false;
  }
    loadCountries() {

    this.countryOptions = CountryWithStates.map(country => ({
      value: country.value,
      label: country.label,
      flag: country.flag,
      phoneCode: country.phoneCode,
      "FieldName":"CountryOfMedicalSchool",
    }));
    this.countryPhoneOptions = CountryWithStates.map(country => ({
      value: country.value,
      label: "("+country.phoneCode+")"+country.value,
      flag: country.flag,
      phoneCode: country.phoneCode,
    }));
    this.selectedPhoneCountry = this.countryPhoneOptions.find(c => c.value === 'IN');
  }
updateFullPhoneNumber() {
  if (!this.phoneNumber || !this.selectedPhoneCountry) {
    return;
  }

  try {
    const cleaned = this.phoneNumber.replace(/[^\d+]/g, '');

    const parsed = parsePhoneNumberFromString(
      cleaned,
      this.selectedPhoneCountry.value // ISO like "IN"
    );

    if (parsed && parsed.isValid()) {
      this.phone = parsed.number; // ✅ always E.164
    } else {
      this.phone = '';
    }

  } catch (e) {
    this.phone = '';
  }
}
  validatePhoneNumber = (phoneNumber,Country) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, Country);
      return parsedNumber && parsedNumber.isValid();
    } catch (e) {
      return false;
    }
  }
  submitEmailPopupF() {
    //this.cleanupExpiredEnquiries();
  if (!this.enteredEmail || !this.enteredEmail.includes("@")) {
    this.toastr.error("Please enter a valid email");
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(this.enteredEmail)) {
    this.toastr.error("Please enter a valid email address");
    return;
  }
  // ✅ Country validation
  if (!this.selectedPhoneCountry || !this.selectedPhoneCountry.phoneCode) {
    this.toastr.error("Please select a country");
    return;
  }

  // ✅ Phone empty check
  if (!this.phoneNumber || this.phoneNumber.trim() === "") {
    this.toastr.error("Phone number is required");
    return;
  }

  // ✅ Build full phone
  this.updateFullPhoneNumber();

  // ✅ Phone format validation
  const isValidPhone = this.validatePhoneNumber(
    this.phoneNumber,
    this.selectedPhoneCountry.value
  );

  if (!isValidPhone) {
    this.toastr.error("Please enter a valid phone number");
    return;
  }
  console.log("this.input=====>",this.input)
   this.input.email=this.enteredEmail;
   if (this.calendar.isValid(this.BookingSelectedDateEnq) ) 
   {
      console.log("this.input=====>",this.input)
      this.submitEnquireform();
   }
   else
   {
      this.submitEnquireformFirst();
   }
  
  this.submitEmailPopup=true;
}
closeEmailPopup() {
    //this.cleanupExpiredEnquiries();
    this.submitEmailPopup=true;
  this.ShowModelPopup=false;
}
onPhoneCountryChange(selected: any) 
  {
      this.selectedPhoneCountry = selected;
      this.updateFullPhoneNumber();
    }
submitEnquireform()
{
  //this.cleanupExpiredEnquiries();
  if (this.hasAlreadyEnquiredToday(this.rotationCode)) {
    this.submitEmailPopup=true;
    return;
   }
  this.input.name="System";
  this.input.query="Looking for the rotation";
  this.input.duration="4 weeks";
  this.input.phone=this.phone;
  this.input.sarthi="yes";
  this.input.date=this.BookingSelectedDateEnq;
  this.doEnquire(this.selectedHospital.id,this.rotationCode);
  
}
submitEnquireformFirst()
{
  //this.cleanupExpiredEnquiries();
  if (this.hasAlreadyEnquiredToday(this.rotationCode)) {
    this.submitEmailPopup=true;
    return;
   }
  this.input.name="System";
  this.input.query="Looking for the rotation";
  this.input.duration="4 weeks";
  this.input.phone=this.phone;
  this.input.sarthi="yes";
  //this.input.date=this.BookingSelectedDateEnq;
  this.doEnquireWithoutDate(this.selectedHospital.id,this.rotationCode);
  
}
hasAlreadyEnquiredToday(rotationCode: string): boolean {
  const today = new Date().toDateString();
  const key = `enquiry_${rotationCode}_${today}`;
  return localStorage.getItem(key) !== null;
}
cleanupExpiredEnquiries(): void {
  const today = new Date().toDateString();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith('enquiry_')  && key.includes('_expiry')) {
      const expiry = localStorage.getItem(key);

     //if (expiry && new Date(expiry) < new Date()) 
      {
        const enquiryKey = key.replace('_expiry', '');
        localStorage.removeItem(enquiryKey);
        localStorage.removeItem(key);
      }
    }
  }
}
// Helper method to save enquiry record
saveEnquiryRecord(rotationCode: string): void {
  const today = new Date().toDateString();
  const key = `enquiry_${rotationCode}_${today}`;
  localStorage.setItem(key, 'true');
  
  // Optional: Set expiry to clear after 24 hours
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  localStorage.setItem(`${key}_expiry`, expiryDate.toISOString());
}
async doEnquireWithoutDate(rotationId,LocationCode="") {
    try {
      if (!this.auth.isLoggedIn) {
        this.input.isNewUser = true;
      }

      if (this.phoneError) {
        this.toastr.error("Phone is invalid");
        return;
      }
      if (!this.validateInputs()) 
        return;
      await this.dbService.enquireRotation(
        this.auth.userData,
        rotationId,
        LocationCode,
        this.input
      );
      this.saveEnquiryRecord(this.rotationCode);
     this.userEnquiries = await this.dbService.getEnquiriesByUId(
        this.auth.userData
      );
      /*this.toastr.success(
        "We have received your request. We will let you know within 2 business days, if there is availability"
      );*/
      this.modalService.dismissAll();
    } catch (err) {
      this.toastr.error(
        "Error while processing your enquiry, Please try again"
      );
      console.log(err);
    }
  }
  async doEnquire(rotationId,LocationCode="") {
    try {
      if (!this.auth.isLoggedIn) {
        this.input.isNewUser = true;
      }
      if (
        !this.calendar.isValid(this.BookingSelectedDateEnq) ||
        this.calendar.getToday().after(this.BookingSelectedDateEnq) 
      ) {
        this.toastr.error("Date is invalid");
        return;
      }
      if (this.phoneError) {
        this.toastr.error("Phone is invalid");
        return;
      }
      if (!this.validateInputs()) 
        return;
      await this.dbService.enquireRotation(
        this.auth.userData,
        rotationId,
        LocationCode,
        this.input
      );
      this.saveEnquiryRecord(this.rotationCode);
     this.userEnquiries = await this.dbService.getEnquiriesByUId(
        this.auth.userData
      );
      /*this.toastr.success(
        "We have received your request. We will let you know within 2 business days, if there is availability"
      );*/
      this.modalService.dismissAll();
    } catch (err) {
      this.toastr.error(
        "Error while processing your enquiry, Please try again"
      );
      console.log(err);
    }
  }
  setResponsiveView() {
    const isMobile = window.innerWidth < 768;
    this.defaultView = isMobile ? 'dayGridWeek' : 'dayGridMonth';
  }
  getStars(ratingStr: string) {
    // Extract number from string, e.g. "5 stars" -> 5
    const rating = parseInt(ratingStr, 10) || 0;
    return {
      filled: new Array(rating),
      empty: new Array(5 - rating),
    };
  }
  formatTimestamp(ts){
    if (!ts || !ts.seconds) return "";

    const date = new Date(ts.seconds * 1000);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }
  redirectToLogin(modal: any): void {
    //modal.close(); // Close the modal
    const currentUrl = this.router.url;
    localStorage.setItem('redirectUrl', currentUrl);
    this.router.navigate(['/authenticate']); // Redirect to /authenticate
  }
  openAvailabilityModal(content: any, rotation: any) {
    this.selectedRotationForAvailability = rotation;
    this.availabilityData = []; // reset
    this.calendarEvents = [
      { title: 'Rotation 1', start: '2025-10-15' },
      { title: 'Rotation 2', start: '2025-10-20' }
    ];
    this.modalService.open(content, { size: 'lg' });
  }
  onNextPage() {
    if (this.pageEnd + 1 < this.refinedHospitals.length) {
      this.pageStart = this.pageEnd;
      this.pageEnd =
        this.pageStart + this.step > this.refinedHospitals.length
          ? this.refinedHospitals.length
          : this.pageStart + this.step;
      this.pageHospitals = this.refinedHospitals.slice(
        this.pageStart,
        this.pageEnd
      );
    }
  }
  getEvents() {
    // map your rotations or other data into events
    return [
      { title: 'Event 1', start: '2025-10-15' },
      { title: 'Event 2', start: '2025-10-20' }
    ];
  }
  getAvailableDatesGetDate(config: any, month: any, year: any): any[] {
    const daysMap: any = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    let events: any[] = [];
    var GetBookings = 
    this.selectedHospital &&
    this.selectedHospital['Bookings'] &&
    this.selectedHospital['Bookings'][month + '-' + year]
    ? this.selectedHospital['Bookings'][month + '-' + year]
    : {};
    let getBookingsCount = Object.keys(GetBookings).length;
    // 🟢 Custom Dates
    let ActulaAvailability=config.seats_available-getBookingsCount;
    if (config.availability_dates == "custom") {
      events = (config.customDates || []).map((dateStr: string) => {
        const dayNum = Number(dateStr.split('-')[2]);  // extract day
        const [yearStr, monthStr, dayStr] = dateStr.split("-");
        const eventDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
        const todayDay = new Date().getDate(); 
        const todayMonth = new Date().getMonth()+1; 
        const todayYear = new Date().getFullYear();
        if((Number(dayStr) < todayDay && Number(year)==todayYear && Number(month)==todayMonth))
        {
          //return null;
        }
        else if(ActulaAvailability>0)
        {
          return `${year}-${month.toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
        }
      });
      return events;
    }
  
    // 🟢 Every Day
    if (config.availability_dates === "everyday") {
      const totalDays = new Date(year, month, 0).getDate();
      if(ActulaAvailability>0)
        {
      events = Array.from({ length: totalDays }, (_, i) => ( `${year}-${month.toString().padStart(2, "0")}-${(i + 1)
          .toString()
          .padStart(2, "0")}`
      ));
    }
      return events;

    }
  
    // 🟢 Specific Weekday
    const dayKey = config.availability_dates ? config.availability_dates.toLowerCase() : '';
    const targetDay = daysMap[dayKey];
    if (targetDay === undefined) return [];
  
    const totalDays = new Date(year, month, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      if (date.getDay() === targetDay && ActulaAvailability>0) {
        events.push( `${year}-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`);
      }
    }
    return events;
  }
  toYMD(ts)
  {
    if (!ts || !ts.seconds) return "";

  const d = new Date(ts.seconds * 1000);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
  }
  getAvailableDates(config: any, month: number, year: number): any[] {
    const daysMap: any = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
  
    let events: any[] = [];
    var GetBookings = 
    this.selectedHospital &&
    this.selectedHospital['Bookings'] &&
    this.selectedHospital['Bookings'][month + '-' + year]
    ? this.selectedHospital['Bookings'][month + '-' + year]
    : {};
    let getBookingsCount = Object.keys(GetBookings).length;
    // 🟢 Custom Dates
    if (config.availability_dates == "custom") {
      events = (config.customDates || []).map((dateStr: string) => {
        const dayNum = Number(dateStr.split('-')[2]);  // extract day
        return {
         // title: `Available (${config.seats_available-getBookingsCount})`,
          title: `Available`,
          start: `${year}-${month.toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`
        };
      });
      this.calendarEvents=events;
      return events;
    }
  
    // 🟢 Every Day
    if (config.availability_dates === "everyday") {
      const totalDays = new Date(year, month, 0).getDate();
      let ActulaAvailability=config.seats_available-getBookingsCount;
      if(ActulaAvailability>0)
      {
      events = Array.from({ length: totalDays }, (_, i) => ({
        //title: `Available (${config.seats_available-getBookingsCount})`,
        title: `Available`,
        start: `${year}-${month.toString().padStart(2, "0")}-${(i + 1)
          .toString()
          .padStart(2, "0")}`
      }));
      this.calendarEvents=events;
      }
      return events;
    }
  
    // 🟢 Specific Weekday
    const dayKey = config.availability_dates ? config.availability_dates.toLowerCase() : '';
    const targetDay = daysMap[dayKey];
    if (targetDay === undefined) return [];
  
    const totalDays = new Date(year, month, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      let ActulaAvailability=config.seats_available-getBookingsCount;
      if (date.getDay() === targetDay && ActulaAvailability>0) {
        events.push({
          //title: `Available (${config.seats_available-getBookingsCount})`,
          title: `Available `,
          start: `${year}-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`
        });
      }
    }
  
    this.calendarEvents=events;
    return events;
  }
  handleMonthClick(arg){
    
    const startDate: Date = arg.view.currentStart; // first visible date of the view
    const month = startDate.getMonth() + 1; // getMonth() is 0-based
    const year = startDate.getFullYear();
    this.getEventsForTheMonth(month,year);
  }
  getEventsForTheMonth(month,year){
    let BreakDone=false;
    if(this.selectedHospital['availabilityData'])
    {
    for (let i = 0; i < this.selectedHospital['availabilityData'].length; i++) 
      {
        const config = this.selectedHospital['availabilityData'][i];
        if(this.selectedHospital['availabilityData'][i]['repeatsequence']=="allmonths")
        {
          this.getAvailableDates(config,month,year);
          BreakDone=true;
        }
        else if(this.selectedHospital['availabilityData'][i]['repeatsequence']=="specified months")
        {
          for (let j = 0; j < config['repeatsequencecustomMonths'].length; j++) 
          {
            const monthyear=config['repeatsequencecustomMonths'][j];
            const [Gotyear, Gotmonth] = monthyear.split('-').map(Number);
            if(month==Gotmonth && Gotyear==year)
            {
              this.getAvailableDates(config,month,year);
              BreakDone=true;
              break;
            }
            
          }
          
        }
        if(BreakDone)
        {
          break;
        }
      }
    }
  }
  getNearestAvailableDates(selectedDate: string, availableDates: string[]) {
    if (availableDates.includes(selectedDate)) {
      return { exactmatch: "yes" };
    }
  
    const selectedTime = new Date(selectedDate).getTime();
  
    // Sort available dates chronologically
    const sorted = availableDates.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  
    let previous = null;
    let next = null;
  
    for (let i = 0; i < sorted.length; i++) {
      const current = new Date(sorted[i]).getTime();
  
      if (current < selectedTime) {
        previous = sorted[i];
      } else if (current > selectedTime) {
        next = sorted[i];
        break;
      }
    }
  
    const nearest: string[] = [];
    if (previous) nearest.push(previous);
    if (next) nearest.push(next);
  
    return {
      exactmatch: "no",
      nearestdates: nearest
    };
  }
  handleDateClick(arg,EventType="date") {
    this.availabilitylist=[];
    this.getNearestDates={};
    this.paymentscreen=false;
    this.grouprequired='';
    this.grouprequiredof='';
    this.needconfirmfromPhysician='';
    this.needconfirmfromPhysicianMessage='';
    this.seats_available=0;
    let selectedDate;
    let dateObj;
    let month;
    let year;
    this.discountAmount=0;
    this.ShowModelPopup=true;
    if(EventType=="event")
    {
      selectedDate = arg.event.start;
      const formattedDate = selectedDate.toLocaleDateString('en-CA'); 
      const dateObjEnq = new Date(selectedDate);

this.BookingSelectedDateEnq = {
  year: dateObjEnq.getFullYear(),
  month: dateObjEnq.getMonth() + 1,
  day: dateObjEnq.getDate()
};
      //const formattedDate = selectedDate.toISOString().split('T')[0];
      this.BookingSelectedDate=formattedDate;
      dateObj = new Date(formattedDate);
      month = String(dateObj.getMonth() + 1).padStart(2, '0');
      year = dateObj.getFullYear();
    }
    else
    {
      selectedDate = arg.dateStr;
      const dateObjEnq = new Date(selectedDate);

this.BookingSelectedDateEnq = {
  year: dateObjEnq.getFullYear(),
  month: dateObjEnq.getMonth() + 1,
  day: dateObjEnq.getDate()
};
      this.BookingSelectedDate=arg.dateStr;
      dateObj = new Date(arg.dateStr);
      month = String(dateObj.getMonth() + 1).padStart(2, '0');
      year = dateObj.getFullYear();
    }

    if(this.discountFrom<=selectedDate && this.discountTo>=selectedDate && this.hasDiscount=="yes")
      {
        this.discountAmount=Number(this.discountValue);
        if(this.discountType=="percentage")
        {
          this.discountAmount=Number(Math.round(( Number(this.RotationFee) *  Number(this.discountValue)) / 100))
        }
      }

    //alert('Date clicked: ' + arg.dateStr);
    
    var GetBookings = 
  this.selectedHospital &&
  this.selectedHospital['Bookings'] &&
  this.selectedHospital['Bookings'][month + '-' + year]
  ? this.selectedHospital['Bookings'][month + '-' + year]
  : {};
  let getBookingsCount = Object.keys(GetBookings).length;
 
  let BreakFound=false;
  if(this.selectedHospital['availabilityData'])
  {
  for (let i = 0; i < this.selectedHospital['availabilityData'].length; i++) 
  {
    const config = this.selectedHospital['availabilityData'][i];
    this.availabilitylist=[];
    if(this.selectedHospital['availabilityData'][i]['repeatsequence']=="allmonths")
    {
      this.availabilitylist=this.getAvailableDatesGetDate(config,month,year);
      BreakFound=true;
    }
    else if(this.selectedHospital['availabilityData'][i]['repeatsequence']=="specified months")
    {
      for (let j = 0; j < config['repeatsequencecustomMonths'].length; j++) 
      {
        const monthyear=config['repeatsequencecustomMonths'][j];
        const [Gotyear, Gotmonth] = monthyear.split('-').map(Number);
        if(month==Gotmonth && Gotyear==year)
        {
          this.availabilitylist=this.getAvailableDatesGetDate(config,month,year);
          BreakFound=true;
          break;
        }
      }
    }
    if(this.availabilitylist.length || BreakFound)
    {
      this.grouprequired=config['grouprequired'];
      this.grouprequiredof=config['grouprequiredof'];
      this.needconfirmfromPhysician=config['needconfirmfromPhysician'];
      this.needconfirmfromPhysicianMessage=config['needconfirmfromPhysicianMessage'];
      this.seats_available=config['seats_available'];
      break;
    }
  }
}
 
    let seats_available= this.seats_available;
    let seatsAvailableNow=Number(seats_available)-Number(getBookingsCount)
    const data={events:[{title:"Test 1"},{title:"Test 2"}]}
    this.CustomeMessage="";
    let points=1;
    if(this.grouprequired=="yes")
    {
      this.CustomeMessage+=`<div class="row removem"><div class="bulletpoint">${points}: </div><div class="label">Rotation Requires Group Of </div><div class="value"><strong>${this.grouprequiredof}</strong> Students To Get Started</div></div>`;
      points++;
    }
    //if(this.needconfirmfromPhysician=="yes")
    if(this.needconfirmfromPhysicianMessage.trim()!="")
    {
      this.CustomeMessage+=`<div class="row removem"><div class="bulletpoint">${points}: </div><div class="label">Rotation Need </div><div class="value"><strong>${this.needconfirmfromPhysicianMessage}</strong></div> </div>`;
    }
    this.getNearestDates=this.getNearestAvailableDates(selectedDate,this.availabilitylist);
    //`<div class="row removem"><div class="label">Seats Available:</div> <div class="value">${seatsAvailableNow}</div></div>${this.CustomeMessage}`
    this.tooltipContent = `
  <div style="padding: 8px; max-width: 220px;">
    <h6>Location Code: ${this.rotationCode}</h6>
    ${
      seatsAvailableNow
        ? `<div class="row removem"><div class="label">Seats Available:</div> <div class="value">Yes Available</div></div>${this.CustomeMessage}`
        : `<div>No Seat Available on this date</div>`
    }
  </div>
`;
    this.seatsAvailableNow=seatsAvailableNow;
      const target = document.getElementById('bookingdetails');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    const calendarContainer = document.querySelector('.calendar-wrapper');
    const containerRect = calendarContainer.getBoundingClientRect();
    const clickRect = arg.jsEvent.target.getBoundingClientRect();
    const tooltipWidth = 250; // your tooltip width in px (adjust as needed)

    // Position tooltip horizontally centered on the clicked cell
    let tooltipX = clickRect.left - containerRect.left + clickRect.width / 2 - tooltipWidth / 2;
    
    // Clamp tooltip inside container boundaries
    if (tooltipX < 0) tooltipX = 0; // don’t go beyond left edge
    if (tooltipX + tooltipWidth > containerRect.width) {
      tooltipX = containerRect.width - tooltipWidth; // don’t go beyond right edge
    }
    
    // Position tooltip slightly above the cell
    let tooltipY = clickRect.top - containerRect.top - 10;
    
    this.tooltipX = tooltipX;
    this.tooltipY = tooltipY;
    this.tooltipVisible = true;
    //setTimeout(() => (this.tooltipVisible = false), 2500); // hide after 2.5s
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    
    // ⏱️ Set new timeout
    this.tooltipTimeout = setTimeout(() => {
      this.tooltipVisible = false;
      this.tooltipTimeout = null; // cleanup reference
    }, 2500);
   /* if (eventsOnDate.length > 0) {
      this.tooltipContent = eventsOnDate.map(e => `${e.title}: ${e.description}`).join('\n');
    } else {
      this.tooltipContent = 'No events on this date';
    }*/
   if(this.UserLoggedIn)
      this.submitEnquireform();
  }
  isDiscountActive(discountTo: string | Date): boolean {
  if (!discountTo) return false;

  const today = new Date();
  const endDate = new Date(discountTo);

  // remove time for safe comparison (optional but recommended)
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return endDate > today;
}
  async proceedToPayStripe (){
    let  session={};
    this.loading = true;
    this.paymentSelectionType="stripe";
    let ActualfeeToPay=0;
    let FeetoShowToUser=0;
    let perc=((this.ApplicationFee*104/100)+0.30)
    perc=perc-this.PromotorDiscountsAmount;
    let totalFee=Math.round(perc*100);
    FeetoShowToUser=totalFee;
    ActualfeeToPay=totalFee;
     if(this.payOtherAmount)
    {
      ActualfeeToPay=this.enterOtherAmount;
      //totalFee=ActualfeeToPay;
      FeetoShowToUser=(ActualfeeToPay*96/100)-0.30;
      FeetoShowToUser=Math.round(FeetoShowToUser*100);
      ActualfeeToPay=Math.round(ActualfeeToPay*100);
      if(ActualfeeToPay<=0)
      {
         this.loading = false;
          this.toastr.error(
            "Please enter amount greater than Zero"
          );
          return;
      }

    }
    
    let AllowTesting="no";
    let promotionobject={"discountAmount":0,"discountText":""}
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
        /*if(this.auth.isLoggedIn && typeof this.auth.userData!="undefined" && (this.auth.userData as any).Role === "Admin")
        {
            AllowTesting="yes";
            stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_TESTING);
        }
        else
        {*/
            stripe= await loadStripe(environment.firebaseConfig.STRIPE_PUBLIC_KEY_LIVE);
       // }
        const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: ActualfeeToPay,
            totalPlanAmount: totalFee,
            feePaidtoShow:FeetoShowToUser,
            currency: 'usd',
            description: `USMLE Rotation, Application Fee, Location Code(${this.rotationCode}) Booking`,
            studentEmail: this.enteredEmail,
            studentUID: '',
            rotationCode: this.rotationCode,
            bookingStartDate:this.BookingSelectedDate,
            PaymentType:"Rotation",
            FeeType:"Application",
            PromotionData:promotionobject,
            ReferralObject:this.PromotorDiscounts,
            StudentObject: '',
            PromoCodeAllow: "yes",
            PassAllow:AllowTesting,
            TotalInstallements:1,
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
          const SavedSessionKeys = Object.keys(SavedSession);
          
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
            
          const response = await fetch('https://stripesession-5rztgyg64q-uc.a.run.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: ActualfeeToPay,
              totalPlanAmount: totalFee,
              feePaidtoShow:FeetoShowToUser,
              currency: 'usd',
              description: `USMLE Rotation, Application Fee, Location Code(${this.rotationCode}) Booking`,
              studentEmail: this.auth.userData.email,
              studentUID: this.auth.userData.uid,
              rotationCode: this.rotationCode,
              bookingStartDate:this.BookingSelectedDate,
              PaymentType:"Rotation",
              FeeType:"Application",
              StudentObject: '',
              PromotionData:promotionobject,
              ReferralObject:this.PromotorDiscounts,
              PromoCodeAllow: "yes",
              PassAllow:AllowTesting,
              TotalInstallements:1,
              InstallementNo:1,
              successUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error',
              cancelUrl: 'https://residencymatch.usmlesarthi.com/payment-success-error'
            })
          });
  
           session = await response.json();
          }
      }
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
  onPreviousPage() {
    if (this.pageStart > 0) {
      this.pageEnd = this.pageStart;
      this.pageStart =
        this.pageEnd - this.step > 0 ? this.pageEnd - this.step : 0;
      this.pageHospitals = this.refinedHospitals.slice(
        this.pageStart,
        this.pageEnd
      );
    }
  }

  openInstructions(content) {
    this.modalService.open(content, { size: "lg" });
  }
  open(content, hospital) {
    this.selectedHospital = hospital;
    this.modalService.open(content, { size: "lg" });
    let enquiry = this.userEnquiries.find(
      (item) => item.rotationId === hospital.id
    );
    if (enquiry) {
      if (enquiry.status === "Pending") this.currentStatus = "pending";
      else if (enquiry.status === "Accepted") this.currentStatus = "enquired";
      if (enquiry.status === "Rejected") this.currentStatus = "rejected";
    } else this.currentStatus = "fresh";
    this.input = {
      query: "",
      date: null,
      duration: "4 Weeks",
      email: "",
      name: "",
      isNewUser: false,
      sarthi: "",
    };
    if (this.auth.isLoggedIn) this.userType = "logged";
    else this.userType = "guest";
    window.scrollTo(0, 0);
    this.router.navigate([], {
      queryParams: {
        rotation: hospital.location_code,
      },
    });
  }

  async openReviews(content, hospital) {
    try {
      this.selectedHospital = hospital;
      this.selectedHospital.reviews = await this.dbService.getReviews(
        hospital.location_code
      );
      if (
        this.selectedHospital.reviews &&
        this.selectedHospital.reviews.length == 0
      ) {
        this.toastr.info(
          "We currently do not have testimonials for this rotation. Stay tuned for updates"
        );
        return;
      }
      this.modalService.open(content, { size: "lg" });
      window.scrollTo(0, 0);
      this.router.navigate([], {
        queryParams: {
          rotation: hospital.location_code,
          view: "testimonials",
        },
      });
    } catch (err) {
      console.log(err);
      this.toastr.error(
        "Error while searching for testimonials, Please try again"
      );
    }
  }

  applyFilters() {
    this.refinedHospitals = this.hospitals.filter((hospital) => {
      let include = true;
      if (this.selectedSpecialities.length)
        include =
          include &&
          this.selectedSpecialities.indexOf(hospital.specialty) != -1;
      if (this.selectedLocationCode.length)
        include =
          include &&
          this.selectedLocationCode.indexOf(hospital.location_code) != -1;
      if (this.selectedTitle.length)
        include =
          include &&
          this.selectedTitle.indexOf(hospital.title) != -1;
      if (this.selectedTypes.length)
        include = include && this.selectedTypes.indexOf(hospital.type) != -1;
      if (this.selectedStates.length)
        include = include && this.selectedStates.indexOf(hospital.state) != -1;
      if (this.selectedCities.length)
        include = include && this.selectedCities.indexOf(hospital.city) != -1;
      if (this.selectedRotationSettings.length)
        include =
          include &&
          this.selectedRotationSettings.indexOf(hospital.rotation_setting) !=
            -1;
      if (this.selectedLorTypes.length)
        include =
          include && this.selectedLorTypes.indexOf(hospital.lor_type) != -1;
      if (this.selectedOffers) include = include && hospital.offers;
      if (this.selectedPD) include = include && hospital.program_director;
      if (this.selectedCombo) include = include && hospital.combo_rotation;
      // if(this.selectedVisaLetters.length && this.selectedVisaLetters.length==1){
      //   this.selectedVisaLetters.forEach((v) => {
      //     let isProviding = hospital.visa_letter.toLowerCase().indexOf("not")===-1;
      //     if (v==="Yes")
      //       include = include && isProviding;
      //     else
      //       include = include && !isProviding;
      //   })
      // }
      return include;
    });
    for (let hospital of this.refinedHospitals) {
      let feeString = hospital.fee;
      let feeNum = 0;
      for (let f of feeString) {
        if (f >= "0" && f <= "9") {
          feeNum = feeNum * 10 + parseInt(f);
        }
      }
      hospital.feeNum = feeNum;
    }
    if (this.sortFees) {
      this.refinedHospitals.sort((a, b) => a.feeNum - b.feeNum);
    }
    this.pageStart = 0;
    this.pageEnd =
      this.pageStart + this.step > this.refinedHospitals.length
        ? this.refinedHospitals.length
        : this.pageStart + this.step;
    this.pageHospitals = this.refinedHospitals.slice(
      this.pageStart,
      this.pageEnd
    );
  }

  hasError(errEvent) {
    this.phoneError = !errEvent;
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
