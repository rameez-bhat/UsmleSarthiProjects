import { Component, OnInit } from '@angular/core';


import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ObservershipService } from './services/observership.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-observership',
  templateUrl: './observership.component.html',
  styleUrls: ['./observership.component.scss']
})
export class ObservershipComponent implements OnInit {
  landing: string;
  loading: boolean;
  isFiltersCollapsed: boolean=true;
  specialities = [];
  cities = []; 
  states = [];
  rotations = [];
  durations = [];
  selectedSpecialities = [];
  selectedRotations = [];
  selectedDurations = [];
  selectedCities = [];
  selectedStates = [];
  hospitals: any =[];
  refinedHospitals : any= [];
  pageHospitals: any= [];
  selectedHospital : any;
  pageStart: number = 0;
  pageEnd: number   = 50;
  step: number      = 50;


  constructor(private modalService: NgbModal, private dbService: ObservershipService, private toastr: ToastrService) {
   }

  async ngOnInit() {
    try{
      this.loading = true;
      this.landing = "list";
      this.hospitals = (await this.dbService.getAllHospitals());
      this.refinedHospitals = Array.from(this.hospitals);
      this.pageEnd = this.pageStart+this.step > this.refinedHospitals.length? this.refinedHospitals.length : this.pageStart+this.step;
      this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
      let specialities = {};
      let rotations = {};
      let durations = {};
      let cities = {};
      let states = {};
      for(let hospital of this.hospitals){
        specialities[hospital.Speciality] = 1;
        rotations[hospital.Rotation] = 1;
        durations[hospital.Duration] = 1;
        cities[hospital.City] = 1;
        states[hospital.State] = 1;
      }
      this.specialities = Object.keys(specialities).sort();
      this.durations = Object.keys(durations).sort();
      this.rotations = Object.keys(rotations).sort();
      this.cities  = Object.keys(cities).sort();
      this.states  = Object.keys(states).sort();
      this.loading = false;
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

  onPreviousPage(){
    if(this.pageStart >0)
    {
      this.pageEnd = this.pageStart ;
      this.pageStart = this.pageEnd - this.step > 0 ? this.pageEnd - this.step : 0;
      this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
    }
  }

  open(content, hospital) {
    this.selectedHospital = hospital;
    this.modalService.open(content, {size: "lg"});
  }

  applyFilters(){
    this.refinedHospitals = this.hospitals.filter(hospital => {
      let include= true;
      if(this.selectedSpecialities.length)
        include = include && (this.selectedSpecialities.indexOf(hospital.Speciality)!=-1)
      if(this.selectedDurations.length)
        include = include && (this.selectedDurations.indexOf(hospital.Duration)!=-1)
      if(this.selectedRotations.length)
        include = include && (this.selectedRotations.indexOf(hospital.Rotation)!=-1)
      if(this.selectedStates.length)
        include = include && (this.selectedStates.indexOf(hospital.State)!=-1)
      if(this.selectedCities.length)
        include = include && (this.selectedCities.indexOf(hospital.City)!=-1)
      return include;
    })
    this.pageStart = 0;
    this.pageEnd   = this.pageStart+this.step > this.refinedHospitals.length? this.refinedHospitals.length : this.pageStart+this.step;
    this.pageHospitals = this.refinedHospitals.slice(this.pageStart, this.pageEnd);
  }

}
