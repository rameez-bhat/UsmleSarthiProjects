import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AngularFireFunctions } from '@angular/fire/functions';
import { HousingService } from './services/housing.service';
import { AuthenticationService } from '../common/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-housing',
  templateUrl: './housing.component.html',
  styleUrls: ['./housing.component.scss']
})
export class HousingComponent implements OnInit {
  landing: string;
  loading: boolean;
  isFiltersCollapsed: boolean=false;
  specialities = [];
  cities = []; 
  states = [];
  types  = [];
  selectedSpecialities = [];
  selectedTypes  = [];
  selectedCities = [];
  selectedStates = [];
  selectedHousing:any = null;
  selectedImage:string = "";
  rotationcode: string = null;
  currentImageIndex:number = 0;
  touchStartX = 0;
  sortFees  : boolean =  false;
  rotationsObject : any = {};
  hospitals: any =[];
  refinedHospitals : any= [];
  pageHospitals: any= [];
  selectedHospital : any;
  pageStart: number = 0;
  pageEnd: number   = 50;
  step: number      = 50;
  input : any= {
    query: '',
    date : this.calendar.getToday(),
    duration : '4 Weeks',
  };
  userEnquiries : any = [];
  currentStatus : any = "";
  userType:any = "";

  @ViewChild("instructions", {static: false}) instructionModal: TemplateRef<any>;
  @ViewChild("content", {static: false}) housingModal: TemplateRef<any>;


  constructor(public modalService: NgbModal, private dbService: HousingService, private toastr: ToastrService, private afn: AngularFireFunctions, public auth: AuthenticationService, public router: Router, public calendar: NgbCalendar, public route : ActivatedRoute) {
   }

  async ngOnInit() {
    try{
      this.loading = true;
      this.landing = "list";
      this.route.params.subscribe(params => {
      this.rotationcode = params['rotationcode'] || null;

  console.log("rotationcode===>",this.rotationcode);
});
      document.addEventListener("keydown",(e)=>{

if(e.key === "ArrowRight"){
this.nextImage();
}

if(e.key === "ArrowLeft"){
this.prevImage();
}

});
      let results = await Promise.all([this.dbService.getAllHospitals(this.rotationcode), this.dbService.getEnquiriesByUId (this.auth.userData)]);
      this.rotationsObject = results[0];
      this.hospitals = Object.values(this.rotationsObject);
      this.userEnquiries = results[1];
      this.refinedHospitals = Array.from(this.hospitals);
      this.refinedHospitals = this.refinedHospitals.sort((a, b) => parseInt(a.rank) - parseInt(b.rank));
      this.pageEnd = this.pageStart+this.step > this.refinedHospitals.length? this.refinedHospitals.length : this.pageStart+this.step;
      this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
      let specialities = {};
      let types ={};
      let cities = {};
      let states = {};
      for(let hospital of this.hospitals){
        specialities[hospital.specialty] = 1;
        cities[hospital.city] = 1;
        states[hospital.state] = 1;
        types[hospital.guests]   = 1;
      }
      this.specialities = Object.keys(specialities).sort();
      this.types = Object.keys(types).map(t => parseInt(t)).sort();
      this.cities  = Object.keys(cities).sort();
      this.states  = Object.keys(states).sort();
      this.loading = false;
      const selectedId = this.route.snapshot.queryParamMap.get('housing');
      const selecetdRotation = this.refinedHospitals.find(r => r.id === selectedId)
      //if (selecetdRotation)
      //this.open(this.housingModal, selecetdRotation);
      //this.openInstructions(this.instructionModal);
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
  }

  onNextPage(){
    if(this.pageEnd + 1<this.refinedHospitals.length)
    {
      this.pageStart = this.pageEnd;
      this.pageEnd   = this.pageStart+this.step > this.refinedHospitals.length? this.refinedHospitals.length : this.pageStart+this.step;
      this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
    }
  }
  openGallery(housing, template){

this.selectedHousing = housing;
this.currentImageIndex = 0;

this.modalService.open(template,{
size: "lg",
centered:true
});

}
  nextImage(){

if(!this.selectedHousing.images) return;

this.currentImageIndex++;

if(this.currentImageIndex >= this.selectedHousing.images.length){
this.currentImageIndex = 0;
}

}

prevImage(){

if(!this.selectedHousing.images) return;

this.currentImageIndex--;

if(this.currentImageIndex < 0){
this.currentImageIndex = this.selectedHousing.images.length - 1;
}

}

goToImage(i){
this.currentImageIndex = i;
}
touchStart(event){
this.touchStartX = event.changedTouches[0].screenX;
}

touchEnd(event){

let touchEndX = event.changedTouches[0].screenX;

if(touchEndX < this.touchStartX - 50){
this.nextImage();
}

if(touchEndX > this.touchStartX + 50){
this.prevImage();
}

}
toggleFullscreen(){

const elem = document.querySelector(".modal-dialog");

if(!document.fullscreenElement){
elem.requestFullscreen();
}else{
document.exitFullscreen();
}

}

  onPreviousPage(){
    if(this.pageStart >0)
    {
      this.pageEnd = this.pageStart ;
      this.pageStart = this.pageEnd - this.step > 0 ? this.pageEnd - this.step : 0;
      this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
    }
  }

  openInstructions(content) {
    this.modalService.open(content, { size: 'lg'});
  }
  open(content, hospital) {
    this.selectedHospital = hospital;
    this.modalService.open(content, {size: "lg"});
    let enquiry = this.userEnquiries.find((item)=>item.rotationId===hospital.id);
    if (enquiry){
      if (enquiry.status==="Pending")
        this.currentStatus = "pending";
      else if (enquiry.status==="Accepted")
        this.currentStatus = "enquired";
      if (enquiry.status==="Rejected")
        this.currentStatus = "rejected";
    }
    else
      this.currentStatus = "fresh";
    this.input = {
      query : '',
      date  : null,
      duration : '4 Weeks',
      email  : '',
      name   : '',
      isNewUser : false,
    };
    if(this.auth.isLoggedIn)
      this.userType = "logged";
    else
      this.userType = "guest";
    //window.scrollTo(0, 0);
    window.open('/housingavailability/' + hospital.id + '/detailsonly', '_blank');
    /*this.router.navigate([], {
      queryParams : {
        housing : hospital.id
      }
    })*/
  }
openAvailabilityModal(content: any, rotation: any, openinSameTab: any) {
    //this.router.navigate(['/rotationsavailability', rotation.location_code,'description']);
    console.log("openinSameTab---->",openinSameTab)
    console.log("rotation---->",rotation)
     console.log("rotation---->",'/housingavailability/' + (rotation.housingId || rotation.id) + '/description')
    if(openinSameTab)
    {
      window.open('/housingavailability/' + (rotation.housingId || rotation.id) + '/description','_self');
    }
    else
    {
      window.open('/housingavailability/' + (rotation.housingId || rotation.id) + '/description', '_blank');
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
  async openReviews(content, hospital) {
    try{
      this.selectedHospital = hospital;
      this.selectedHospital.reviews =  await this.dbService.getReviews(hospital.location_code);
      if (this.selectedHospital.reviews && this.selectedHospital.reviews.length == 0){
        this.toastr.info("We currently do not have testimonials for this rotation. Stay tuned for updates");
        return;
      }
      this.modalService.open(content, {size: "lg"});
      window.scrollTo(0, 0);
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while searching for testimonials, Please try again");
    }
  }

  applyFilters(){
    this.refinedHospitals = this.hospitals.filter(hospital => {
      let include= true;
      if(this.selectedTypes.length){
        include = include && (this.selectedTypes.indexOf(hospital.guests)!=-1)
      }
      if(this.selectedStates.length)
        include = include && (this.selectedStates.indexOf(hospital.state)!=-1)
      if(this.selectedCities.length)
        include = include && (this.selectedCities.indexOf(hospital.city)!=-1)
      return include;
    })
    if (this.sortFees){
      this.refinedHospitals.sort((a, b)=> a.rent - b.rent );
    }
    this.pageStart = 0;
    this.pageEnd   = this.pageStart+this.step > this.refinedHospitals.length? this.refinedHospitals.length : this.pageStart+this.step;
    this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
  }

  async doEnquire (housingId){
    try{
      if (!this.auth.isLoggedIn)
      {
        this.input.isNewUser= true;
      }
      if (!this.calendar.isValid(this.input.date) || this.calendar.getToday().after(this.input.date)){
        this.toastr.error("Date is invalid");
        return;
      }
      if (!this.validateInputs())
        return;
      await this.dbService.enquireHousing (this.auth.userData, housingId, this.input);
      this.userEnquiries = await this.dbService.getEnquiriesByUId (this.auth.userData);
      this.toastr.success("We have received your request. We will let you know within 2 business days, if there is availability");
      this.modalService.dismissAll ();
    }
    catch(err){
      this.toastr.error("Error while processing your enquiry, Please try again");
      console.log(err);
    }
  }

  validateInputs(){
    let input = this.input;
    if (input.isNewUser){
      if (input.email.trim()==="" || input.name.trim()==="")
        return false;
    }
    else{
      if (!this.auth.userData)
        return false;
    }
    if (input.duration.trim()==="" )
      return false;
    return true;
  }

}
