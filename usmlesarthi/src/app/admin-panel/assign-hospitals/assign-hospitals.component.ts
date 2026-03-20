import { Component, OnInit } from '@angular/core';
import { HospitalFormData } from '../../models/hospital-form-data';
import { Hospital } from '../../models/hospital';
import { Program } from '../../models/program';
import { CrowdSourcingService } from '../../crowd-sourcing/services/crowd-sourcing.service';
import { ProgramService } from '../../common/program.service';
import { HospitalService } from '../../common/hospital.service';
import { UserService } from '../../common/user.service';
import { AdminServicesService } from '../services/admin-services.service';
import { ToastrService } from 'ngx-toastr';
import { monthNames } from '../../sarthi-list/sarthi-list.component';

@Component({
  selector: 'app-assign-hospitals',
  templateUrl: './assign-hospitals.component.html',
  styleUrls: ['./assign-hospitals.component.scss']
})
export class AssignHospitalsComponent implements OnInit {
  speciality         : string;
  numHos             : number;
  selectValues       : any[] = [];
  landing            : string;
  loading            : boolean;
  hospitalsDataObj   : any;
  hospitalFormData   : HospitalFormData;
  programList        : any;
  programObject      : any;
  hospitalsByProgram : any;
  hospitalsByProgramDropDown : any;
  CurrentSelectPID: any;
  AlreadyAssignedHospital: any;
  users              : any;
  usersList          : any=[];
  user               : any;
  selectedUid        : string;
  hospitalsDataByUser: HospitalFormData [];
  showAlert          : boolean = false;
  message            : string;
  canNavigate        : boolean = true;
  constructor(private dbService: CrowdSourcingService, private programApi: ProgramService, private hospitalApi: HospitalService, private userApi: UserService, private adminService: AdminServicesService, private toastr: ToastrService) { }

  async ngOnInit() {
    this.loading = true;
    this.landing = 'users';
    this.user  = JSON.parse(localStorage.getItem('user'));
    this.loading = false;
  }
  async fetchSome(userVal)
  {
    try{
    if(userVal=="")
    {
      alert("Please enter a valid input");
      return;
    }
    this.loading = true;
    this.users   = await this.adminService.getSomeUsers(userVal);
    this.usersList = Object.values(this.users);
    this.loading = false;
  }
  catch(err)
  {
    this.toastr.error("Error while fetching users, please try again");
  }
  }
  async fetchAll(){
    try{
    this.loading = true;
    this.users   = await this.adminService.getAllUsers();
    this.usersList = Object.values(this.users);
    this.loading = false;
  }
  catch(err)
  {
    this.toastr.error("Error while fetching users, please try again");
  }
  }
  async selectUser(user){
    this.selectedUid = user.uid;
    await this.takeMeToBasic();
  }

  async takeMeToBasic()
  {
    try{
    this.loading  = true;
    this.landing  = "basic";
    this.programList = await this.programApi.getProgramList();
    this.loading  = false;
    }
  catch(err)
  {
    this.toastr.error("Error while fetching program list , please try again");
  }

  }
  async getSelects(): Promise<any>
  {
    try{
      if( this.speciality !== undefined && this.numHos > 0)
      {
        this.selectValues = [];
        for( var i= 0; i < this.numHos; i++)
        {
          this.selectValues.push({ value:"No Preference"});
        }
        this.landing           = "preferences";
        this.loading           = true;
        //this.closeAlert();
        this.CurrentSelectPID= this.speciality.toString();
        this.hospitalsByProgramDropDown = await this.hospitalApi.getHospitalsByProgramName(this.speciality);
        this.AlreadyAssignedHospital = await this.hospitalApi.getAlreadyAssignedHospotal(this.speciality);
        if (this.hospitalsByProgramDropDown.length==0)
        {
          this.toastr.info("No hospitals are currently assigned to the selected program, please select another one");
          this.landing = "basic";
        }
        this.loading           = false;
        this.takeMeToList()

      }
      else{
         this.toastr.info("Please fill all the fields");
      }
    }
    catch(err)
  {
    this.toastr.error("Error while fetching hospital list , please try again");
  }

  }

  async postPreferences(): Promise<any>
  {
    try{
    let distinctValues={};
    for( var i= 0; i < this.numHos; i++)
    {
        if (this.selectValues[i].value!="No Preference" && this.selectValues[i].value in distinctValues)
        {
            this.toastr.info("Please choose distinct hospitals.");
            return;
        }
        distinctValues[this.selectValues[i].value]= 1;
    }
    this.loading         = true;
    await this.dbService.assignHospitals(this.selectValues, this.selectedUid, this.speciality);
    this.loading         = false;
    this.selectValues  = [];
    //this.closeAlert();
    await this.takeMeToList();
  }
  catch(err)
  {
      console.log("err=========>",err)
    this.toastr.error("Error while assigning desired hospitals, please try again");
  }
  }

  async takeMeToList()
  {
    try{
    this.landing             = "list";
    this.loading             = true;
    this.hospitalsDataObj    = await this.dbService.getHospitalProgramByUId(this.selectedUid);
    this.programList         = await this.programApi.getProgramList();
    this.programObject = {};
      for (let i in this.programList) {
        this.programObject[this.programList[i].PId] = this.programList[i];
      }
      this.hospitalsDataByUser = Object.values(this.hospitalsDataObj) as HospitalFormData[];
    //this.hospitalsDataByUser = Object.values(this.hospitalsDataObj).filter((h) => !(h as HospitalFormData).HPInfoId.includes("Scrapped")) as HospitalFormData[];
    if(this.hospitalsDataByUser.length==0 && this.selectValues.length==0){
      this.toastr.info("User is currently not associated with any hospital");
      this.landing = "basic";
    } else{
      this.hospitalsDataByUser.forEach((hospitalData) => {
        if (hospitalData.TimeStamp){
          const timeStamp = new Date(hospitalData.TimeStamp);
          hospitalData.Date = monthNames[timeStamp.getMonth()] + " " + timeStamp.getFullYear();
        }
      })
    }
    this.loading         = false;
  }
  catch(err)
  {
    console.log(err)
    this.toastr.error("Error while fetching user's hospitls, please try again");
  }
  }

  async removeHospital(){
    try{
      this.dbService.removeNotCompletedHospitalsForUser(this.selectedUid);
      this.toastr.success("Removed");
      this.takeMeToList();
    }
    catch(err){
      this.toastr.error("Error performing action, please try again");
    }
  }
  async removeInCompleteHospital(){
    try{
      this.dbService.removeIncompleteHospitalsForUser(this.selectedUid);
      this.toastr.success("Removed");
      this.takeMeToList();
    }
    catch(err){
      this.toastr.error("Error performing action, please try again");
    }
  }


}
