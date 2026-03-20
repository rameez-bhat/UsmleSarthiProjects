import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbCalendar, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ObservershipService } from "../observership/services/observership.service";
import { ToastrService } from "ngx-toastr";
import { debounceTime, first } from "rxjs/operators";

import * as firebase from "firebase";
import { AngularFireFunctions } from "@angular/fire/functions";
import { RotationsService } from "./services/rotations.service";
import { AuthenticationService } from "../common/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: "app-rotations",
  templateUrl: "./rotations.component.html",
  styleUrls: ["./rotations.component.scss"],
})
export class RotationsComponent implements OnInit {

  landing: string;
  loading: boolean;
  calendarOptions: any;
  isFiltersCollapsed: boolean = false;
  specialities = [];
  locationCodes = [];
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
  rotationSettings = [];
  visaLetters = ["Yes", "No"];
  lorTypes = [];
  selectedLocationCode = [];
  selectedTitle = [];
  selectedSpecialities = [];
  selectedTypes = [];
  selectedCities = [];
  selectedStates = [];
  selectedRotationSettings = [];
  selectedVisaLetters = [];
  selectedLorTypes = [];
  selectedOffers = false;
  selectedPD = false;
  selectedCombo = false;
  sortFees: boolean = false;
  rotationsObject: any = {};
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
    date: this.calendar.getToday(),
    duration: "4 Weeks",
    sarthi: "",
    phone: "",
  };
  userEnquiries: any = [];
  currentStatus: any = "";
  userType: any = "";
  phoneError: boolean = false;

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
      this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      defaultView: 'dayGridMonth',
      editable: true,
      selectable: true,
      events: this.getEvents(),
      dateClick: this.handleDateClick.bind(this)
    };

      this.route.paramMap.subscribe(params => {
        this.rotationCode = params.get('rotationcode');
        console.log('Rotation Code:', this.rotationCode);
      });
     
      console.log('Rotation Code:', this.rotationCode);
      this.loading = true;
      this.landing = "list";
      const kommunicateWidget = document.getElementById("kommunicate-widget-iframe");
    if (kommunicateWidget) {
      kommunicateWidget.style.display = "none";
    }
      let results = await Promise.all([
        this.dbService.getAllHospitals(),
        this.dbService.getEnquiriesByUId(this.auth.userData),
      ]);
      this.rotationsObject = results[0];
      this.hospitals = Object.values(this.rotationsObject);
      console.log("this.hospitals---->",this.hospitals)
      this.userEnquiries = results[1];
      this.refinedHospitals = Array.from(this.hospitals);
      this.refinedHospitals = this.refinedHospitals.sort(
        (a, b) => parseInt(a.rank) - parseInt(b.rank)
      );
      this.pageEnd =
        this.pageStart + this.step > this.refinedHospitals.length
          ? this.refinedHospitals.length
          : this.pageStart + this.step;
      this.pageHospitals = this.refinedHospitals.slice(
        this.pageStart,
        this.pageEnd
      );
      let specialities = {};
      let types = {};
      let cities = {};
      let states = {};
      let visaLetters = {};
      let rotationSettings = {};
      let lorTypes = {};
      let locationCodes = {};
      let title = {};
      for (let hospital of this.hospitals) {
        specialities[hospital.specialty] = 1;
        cities[hospital.city] = 1;
        states[hospital.state] = 1;
        types[hospital.type.trim()] = 1;
        locationCodes[hospital.location_code] = 1;
        title[hospital.title] = 1;
        visaLetters[hospital.visa_letter] = 1;
        rotationSettings[hospital.rotation_setting] = 1;
        lorTypes[hospital.lor_type] = 1;
      }
      this.locationCodes = Object.keys(locationCodes).sort();
      this.title = Object.keys(title).sort();
      this.specialities = Object.keys(specialities).sort();
      this.types = Object.keys(types).sort();
      this.cities = Object.keys(cities).sort();
      this.states = Object.keys(states).sort();
      this.rotationSettings = Object.keys(rotationSettings).sort();
      this.lorTypes = Object.keys(lorTypes).sort();
      this.loading = false;
      let  selectedId = this.route.snapshot.queryParamMap.get("rotation");
      const view = this.route.snapshot.queryParamMap.get("view");
      if(selectedId===null && this.rotationCode!=null)
      {
        selectedId=this.rotationCode;
      }
      console.log("view=========",view)
      console.log("selectedId=========",selectedId)
      const selectedRotation = this.refinedHospitals.find(
        (r) => r.location_code === selectedId
      );
      console.log("selectedId------------------------->",selectedId)
      console.log("selectedRotation------------------------->",selectedRotation)
      console.log("selectedRotation------------------------->",selectedRotation)
      if (selectedRotation) {
        if (view === "testimonials") {
          this.openReviews(this.reviewsModal, selectedRotation);
        } else {
          //this.open(this.rotationsModal, selectedRotation);
          this.openAvailabilityModal(this.rotationsModal, selectedRotation,true)
        }
      } 
      //else this.openInstructions(this.instructionModal);
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
  }
  getDiscountedFee(hospital: any): number {
  const baseFee = Number(
    (hospital.fee || hospital.StudentToBeCharged || '0').toString().replace('$', '')
  );

  if (
    hospital.hasDiscount === 'yes' &&
    hospital.discountValue &&
    this.isDiscountActive(hospital.discountTo, hospital)
  ) {
    if (hospital.discountType === 'percentage') {
      return Math.round(
        baseFee - (baseFee * hospital.discountValue) / 100
      );
    } else {
      // flat discount
      return Math.max(baseFee - hospital.discountValue, 0);
    }
  }

  return baseFee;
}
  formatTimestamp(ts){
    if (!ts || !ts.seconds) return "";

    const date = new Date(ts.seconds * 1000);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }
  isDiscountActive(discountTo: string | Date,hospital:any): boolean {
    
  if (!discountTo) return false;

  const today = new Date();
  const endDate = new Date(this.formatTimestamp(discountTo));

  // remove time for safe comparison (optional but recommended)
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);


  return endDate > today;
}
getRemainingTime(endDate: any): string {
  const now = new Date().getTime();
  const end = new Date(endDate.seconds * 1000).getTime();
  const diff = end - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}d ${hours}h left`;
}
  redirectToLogin(modal: any): void {
    modal.close(); // Close the modal
    const currentUrl = this.router.url;
    console.log("currentUrl----->",currentUrl)
    console.log("this.router----->",this.router)
    localStorage.setItem('redirectUrl', currentUrl);
    this.router.navigate(['/authenticate']); // Redirect to /authenticate
  }
  openAvailabilityModal(content: any, rotation: any, openinSameTab: any) {
    //this.router.navigate(['/rotationsavailability', rotation.location_code,'description']);
    console.log("openinSameTab---->",openinSameTab)
    if(openinSameTab)
    {
      window.open('/rotationsavailability/' + rotation.location_code + '/description','_self');
    }
    else
    {
      window.open('/rotationsavailability/' + rotation.location_code + '/description', '_blank');
    }
    
    /*this.selectedRotationForAvailability = rotation;
    this.availabilityData = []; // reset
    console.log("rotation----->",rotation)
    this.calendarEvents = [
      { title: 'Rotation 1', start: '2025-10-15' },
      { title: 'Rotation 2', start: '2025-10-20' }
    ];
    this.modalService.open(content, { size: 'lg' });*/
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

  handleDateClick(info: any) {
    alert('Date clicked: ' + info.dateStr);
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
      //this.router.navigate(['/rotationsavailability', hospital.location_code,'testimonal']);
      window.open('/rotationsavailability/' + hospital.location_code + '/testimonal', '_blank');
      /*this.selectedHospital = hospital;
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
      });*/
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
        include = include && this.selectedTypes.indexOf(hospital.type.trim()) != -1;
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
  openWhatsApp() {
    const phoneNumber ="919306193724"; // ✅ Replace with your WhatsApp number (country code + number)
    const message = encodeURIComponent(`Hello, I need assistance regarding Clinical Rotations`);
    
    // Opens WhatsApp (mobile or desktop)
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  }
  openGmail() {
    const email = "customerservice@usmlesarthi.com"; // ✅ Replace with your support email
    const subject = encodeURIComponent("Help Needed Regarding Rotation Booking");
    const body = encodeURIComponent(
      `Hello,\n\nI need assistance regarding Clinical Rotations\n\nThank you.`
    );

// Opens Gmail compose window in a new tab
const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
window.open(gmailUrl, "_blank");

  }

  getNumber(number) {
    this.input.phone = number;
  }

  async doEnquire(rotationId,LocationCode="") {
    try {
      if (!this.auth.isLoggedIn) {
        this.input.isNewUser = true;
      }
      if (
        !this.calendar.isValid(this.input.date) ||
        this.calendar.getToday().after(this.input.date)
      ) {
        this.toastr.error("Date is invalid");
        return;
      }
      if (this.phoneError) {
        this.toastr.error("Phone is invalid");
        return;
      }
      if (!this.validateInputs()) return;
      await this.dbService.enquireRotation(
        this.auth.userData,
        rotationId,
        LocationCode,
        this.input
      );
     this.userEnquiries = await this.dbService.getEnquiriesByUId(
        this.auth.userData
      );
      this.toastr.success(
        "We have received your request. We will let you know within 2 business days, if there is availability"
      );
      this.modalService.dismissAll();
      console.log("toaster ===Worked")
    } catch (err) {
      this.toastr.error(
        "Error while processing your enquiry, Please try again"
      );
      console.log(err);
    }
  }

  validateInputs() {
    let input = this.input;
    if (input.isNewUser) {
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
