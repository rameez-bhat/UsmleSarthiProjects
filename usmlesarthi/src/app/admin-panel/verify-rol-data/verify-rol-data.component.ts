import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../common/authentication.service';
import { ProgramService } from '../../common/program.service';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-verify-rol-data',
  templateUrl: './verify-rol-data.component.html',
  styleUrls: ['./verify-rol-data.component.scss']
})
export class VerifyRolDataComponent implements OnInit {
  userProfile: any;
  //allLandings: string[] = ["List"];
  landing: string;
  loading: boolean = false;
  visaObject: any;
  verifyList: any;
  verifyObject: any;
  programObject: any;
  selectedHospitalData: any;
  selectedHospitalLatestData: any;
  constructor(private dbService : AdminServicesService,  private programApi: ProgramService, private toastr: ToastrService, public authService:  AuthenticationService) {
    this.landing='List';
   }

  async ngOnInit() {
    this.userProfile = this.authService.userData;
    await this.takeMeToVerifyList();
  }
  async takeMeToVerifyList(){
    try{
    this.loading = true;
    let programObject = this.programApi.getProgramObject();
    let hospitalsList = this.dbService.getRolDataForVerification();
    await Promise.all([programObject, hospitalsList]).then(results => {
      this.programObject  = results[0];
      this.verifyObject    = results[1];
    });
    this.verifyList = Object.values(this.verifyObject);
    this.loading = false; 
  }
  catch(err)
  {
    this.toastr.error("Error while fetching hospitals list, please try again");
  }
  }
  remove(value)
  {
    this.verifyList.splice(value, 1);
  }
  makeAllYes()
  {
    for(let i in this.verifyList)
    {
      this.verifyList[i].Verified = "Yes";
    }
  }
  makeAllReject()
  {
    for(let i in this.verifyList)
    {
      this.verifyList[i].Verified = "Rejected";
    }
  }
  
  makeAllNA()
  {
    for(let i in this.verifyList)
    {
      this.verifyList[i].Verified="No";
    }
  }
  async makeChanges()
  {
    try{
    let allRequests= [];
    let hpinfoIds  = {};
    for(let i in this.verifyList)
    {
      if (this.verifyList[i].Verified =="Yes" ||  this.verifyList[i].Verified =="Rejected")
        allRequests.push(this.dbService.verifyRejectRolData(this.verifyList[i], this.userProfile.email));
    }
    await Promise.all(allRequests).then(results =>
      {
        for(let i in results)
        {
          delete this.verifyObject[results[i].id];
        }
        this.verifyList = Object.values(this.verifyObject);
        this.toastr.success("Changes have been made.");
        window.scrollTo(0, 0); 
      })
    }
    catch(err){
      this.toastr.error("Error while making changes, please try again");
    }
  }
  async takeMeToHospitalData(dataObject)
  {
    try{
    this.loading = true;
    this.landing = "Hospital";
    this.selectedHospitalData = dataObject;
    this.selectedHospitalLatestData = await this.dbService.getLatestRolData(dataObject.HId, dataObject.PId);
    this.loading = false;
    }
    catch(err)
    {
      this.toastr.error("Error while fetching hospital's data, please try again");
    }
  }
  async takeActionOnHospital(status)
  {
    try{
      this.selectedHospitalData.Verified = status;
      await this.dbService.verifyRejectRolData(this.selectedHospitalData, this.userProfile.email);
      this.landing="List";
      delete this.verifyObject[this.selectedHospitalData.id];
      this.verifyList = Object.values(this.verifyObject);
      this.toastr.success("Changes have been made");
  }
    catch(err){
      this.toastr.error("Error occured while trying changes, please try again");
    }
  }

}

