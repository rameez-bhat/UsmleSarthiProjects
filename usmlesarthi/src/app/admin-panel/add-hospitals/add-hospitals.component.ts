import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-add-hospitals',
  templateUrl: './add-hospitals.component.html',
  styleUrls: ['./add-hospitals.component.scss']
})
export class AddHospitalsComponent implements OnInit {
  loading: boolean = false;
  landing: string  = "";
  hospitalsList: any = [];
  programObject: any = [];
  programList: any   = [];
  selectedHospital: any = {};
  addNew: boolean = false;
  newHospital: any   = {};
  constructor(private toastr: ToastrService, private dbService: AdminServicesService) { }

  async ngOnInit() {
    this.loading = true;
    this.programObject  = await this.dbService.getProgramObject();
    this.resetNewHospital();
    this.programList = Object.values(this.programObject);
    this.landing = "list";
    this.loading = false;
  }

  async fetchSome(hospital){
    if(hospital==""){
      this.toastr.info("Please write some prefix of hospital's name in the input");
      return;
    }
    try{
      this.hospitalsList = [];
      this.loading = true;
      this.hospitalsList = Object.values(await this.dbService.getSomeHospitals(hospital));
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching hospitals, please try again");
    }
  }

  async takeMeToHospital(hospital){
    try{
      this.loading = true;
      this.selectedHospital = hospital;
      this.selectedHospital.NonPIds = [];
      this.selectedHospital.NewPIds = [];
      for(let pid in this.programObject){
        if (!this.selectedHospital.PIds || this.selectedHospital.PIds.indexOf(pid)==-1)
          this.selectedHospital.NonPIds.push(pid);
      }
      this.landing = 'hospital';
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while getting information about the hospital, please try again");
    }
  }

  async updateHospital(){
    try{
      await this.dbService.updateHospital(this.selectedHospital);
      this.toastr.success("The hospital has been updated with the new tagged specialities");
      await this.takeMeToHospital(this.selectedHospital);
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while saving the changes, please try again");
    }
  }


  async addNewHospital(){
    if( this.validateNewHospital() ){
      try{
        await this.dbService.addNewHospital(this.newHospital);
        this.toastr.success("New Hospital has been added");
        this.resetNewHospital();
      }
      catch(err){
        console.log(err.message);
        this.toastr.error("Error while adding new hospital, please try again");
      }
    }
  }

  validateNewHospital(){
    this.newHospital.HName = this.newHospital.HName.trim();
    if(this.newHospital.HName=="")
    {
      this.toastr.info("Hospital Name cannot be empty");
      return false;
    }
    this.newHospital.City = this.newHospital.City.trim();
    if(this.newHospital.City=="")
    {
      this.toastr.info("Hospital City cannot be empty");
      return false;
    }
    this.newHospital.State = this.newHospital.State.trim();
    if(this.newHospital.State=="")
    {
      this.toastr.info("Hospital State cannot be empty");
      return false;
    }
    if(this.newHospital.PIds.length==0)
    {
      this.toastr.info("Please tag atleast one speciality");
      return false;
    }
    return true;
  }

  resetNewHospital(){
    this.addNew = false;
    this.newHospital =  {
      HName: "",
      City: "",
      State: "",
      PIds: [],
    }
  }


}
