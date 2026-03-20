import {
  Component,
  OnInit
} from '@angular/core';
import {
  HospitalFormData
} from '../models/hospital-form-data';
import {
  CrowdSourcingService
} from './services/crowd-sourcing.service';
import {
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import {
  Program
} from '../models/program';
import {
  ProgramService
} from '../common/program.service';
import {
  Hospital
} from '../models/hospital';
import {
  HospitalService
} from '../common/hospital.service';
import {
  Visa
} from '../models/visa';
import {
  AuthenticationService
} from '../common/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { monthNames } from '../sarthi-list/sarthi-list.component';
@Component({
  selector: 'app-crowd-sourcing',
  templateUrl: './crowd-sourcing.component.html',
  styleUrls: ['./crowd-sourcing.component.scss'],
})
export class CrowdSourcingComponent implements OnInit {
  speciality: string;
  numHos: number;
  selectValues: any[] = [];
  landing: string;
  loading: boolean;
  hospitalsDataObj: any;
  hospitalFormData: HospitalFormData;
  yearDataArrayKeys: any;
  programList: Program[];
  programObject: any;
  hospitalsByProgram: Hospital[];
  user: any;
  uid: string = "8";
  hospitalsDataByUser: HospitalFormData[];
  visaList: Visa[];
  canNavigate: boolean = true;

  constructor(private dbService: CrowdSourcingService, private programApi: ProgramService, private hospitalApi: HospitalService, private toastr: ToastrService, private authService: AuthenticationService) {
    this.landing = "list";
  }
  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.userData;
    this.uid = this.user.uid ;
    await this.findLanding();
    this.loading = false;
  }

  async findLanding(): Promise < any > {
    await this.takeMeToList();
    return;
  }

  async takeMeToList() {
    try {
      this.landing = "list";
      this.loading = true;
      this.hospitalsDataObj = await this.dbService.getHospitalProgramByUId(this.uid);
      this.programList = await this.programApi.getProgramList();
      this.programObject = {};
      for (let i in this.programList) {
        this.programObject[this.programList[i].PId] = this.programList[i];
      }
      this.hospitalsDataByUser = Object.values(this.hospitalsDataObj) as HospitalFormData[];
      //this.hospitalsDataByUser = Object.values(this.hospitalsDataObj).filter((h) => !(h as HospitalFormData).HPInfoId.includes("Scrapped")) as HospitalFormData[];
      if (this.hospitalsDataByUser.length == 0) {
        this.toastr.error("You are currently not associated with any hospital, contact admin to assign you the hospitals.");
      }
      else{
        this.hospitalsDataByUser.forEach((hospitalData) => {
          if (hospitalData.TimeStamp){
            const timeStamp = new Date(hospitalData.TimeStamp);
            hospitalData.Date = monthNames[timeStamp.getMonth()] + " " + timeStamp.getFullYear();
          }
        })
      }
      this.loading = false;
    }
    catch(err)
    {
      console.log(err);
      this.toastr.error("Error while fetching your list, please try again");
    }

  }

  async takeMeToForm(hospitalData: any): Promise < any > {
    try{
    let hpinfoid = hospitalData.HPInfoId;
    this.landing = "submitData";
    this.loading = true;
    this.visaList = await this.dbService.getVisaList();
    this.hospitalFormData = hospitalData;
   let thisyearfull=new Date().getFullYear();
    if(!this.hospitalFormData.DataOfYear)
      {
        this.hospitalFormData.DataOfYear=new Date().getFullYear();
      }
      if(!this.hospitalFormData.yearlyData)
      {
        this.hospitalFormData.yearlyData={};
        this.hospitalFormData.yearlyData[thisyearfull]={};
      }
      else if(!this.hospitalFormData.yearlyData[thisyearfull])
      {
        this.hospitalFormData.yearlyData[thisyearfull]={}
      }
      this.yearDataArrayKeys=Object.keys(this.hospitalFormData.yearlyData)
    if (this.hospitalFormData.Status == "Not Completed")
      this.toastr.info("The Preset values are the latest verified values given by our server");
    this.loading = false;
    return false;
    }
    catch(err)
    {
      console.log(err);
      await this.takeMeToList();
      this.toastr.error("Error while fetching the hospital's info, please try again");
    }
  }

  async onSubmitForm() {
    try{
    this.loading = true;
    await this.dbService.updateHospitalProgramData(this.hospitalFormData);
    this.toastr.success("Records are updated successfully");
    await this.findLanding();
    this.loading = false;
    return false;
    }
    catch(err){
      this.toastr.error("Error while submitting your data, please try again");
    }
  }

  async onManualSubmitForm() {
    try{
      console.log("========>")
    this.loading = true;
    await this.dbService.updateHospitalProgramData(this.hospitalFormData,"Incomplete");
    this.toastr.success("Records are updated successfully");
    await this.findLanding();
    this.loading = false;
    return false;
    }
    catch(err){
      this.toastr.error("Error while submitting your data, please try again");
    }
  }

}
