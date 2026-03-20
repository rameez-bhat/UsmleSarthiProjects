import { Component, OnInit } from '@angular/core';
import { AdminServicesService } from '../services/admin-services.service';
import { ProgramService } from '../../common/program.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-data',
  templateUrl: './verify-data.component.html',
  styleUrls: ['./verify-data.component.scss']
})
export class VerifyDataComponent implements OnInit {
  userProfile: any;
  //allLandings: string[] = ["List"];
  landing: string;
  loading: boolean = false;
  visaObject: any;
  verifyList: any;
  verifyObject: any;
  programObject: any;
  uniqueStates: any;
  yearDataArrayKeys: any = {};
  programList: any;
  selectedPIds: any;
  selectedStateList: any;
  selectedHospitalData: any;
  allPanes = ["Information from Frieda", "Score Information","Applicant characteristics", "Additional Information"];
  showPane = "Information from Frieda";
  constructor(private dbService : AdminServicesService,  private programApi: ProgramService, private toastr: ToastrService) {
    this.landing='List';
   }

  async ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem('user'));
    await this.takeMeToVerifyList();
  }
  async takeMeToVerifyList(){
    try{
    this.loading = true;
    let programObject = this.programApi.getProgramObject();
    let hospitalsList = this.dbService.getHospitalsForVerification();
    console.log("hospitalsList----->",hospitalsList)
    await Promise.all([programObject, hospitalsList]).then(results => {
      this.programObject  = results[0];
      this.verifyObject    = results[1];
    })
    this.verifyList = Object.values(this.verifyObject);
    this.programList  = Object.values(this.programObject)
   /* this.uniqueStates = Object.values(
      this.verifyList.reduce((acc, h) => {
        if (!acc[h.hospital.HId]) {
          acc[h.hospital.HId] = {
            HId: h.hospital.HId,
            State: h.hospital.State
          };
        }
        return acc;
      }, {})
    );*/
    //this.uniqueStates = [...new Set(this.verifyList.map(h => h.hospital.State))];
    this.uniqueStates = [
      ...new Set(
        this.verifyList.map(h => (h.hospital.State || '').toLowerCase().trim())
      )
    ] as string[]; // <-- tell TS it's string[]
        
    this.uniqueStates = this.uniqueStates
      .filter(s => s)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    this.loading = false; 
  }
  catch(err)
  {
    this.toastr.error("Error while fetching hospitals list, please try again");
  }
  }

  filterVerifyList(){
    if (typeof this.selectedPIds=="undefined" || !this.selectedPIds.length){
      this.verifyList = Object.values(this.verifyObject)
    }
    else if(typeof this.selectedStateList!="undefined" && this.selectedStateList.length)
      {
        this.verifyList = Object.values(this.verifyObject)
        this.verifyList = this.verifyList.filter(v =>
          this.selectedStateList.some(
            s => s.toLowerCase() === v.hospital.State.toLowerCase()
          ) &&
          this.selectedPIds.some(
            p => p.toLowerCase() === v.PId.toLowerCase()
          )
        );
      }
    else{
      this.verifyList = Object.values(this.verifyObject)
      this.verifyList = this.verifyList.filter(v => this.selectedPIds.includes(v.PId))
      this.uniqueStates = [...new Set(this.verifyList.map(h => h.hospital.State))];
    }
    console.log(this.selectedPIds, this.verifyList)
  }
  filterVerifyListState(){
    if (!this.selectedStateList.length){
      this.verifyList = Object.values(this.verifyObject)
    }
    else if(typeof this.selectedPIds!="undefined" && this.selectedPIds.length)
    {
      this.verifyList = Object.values(this.verifyObject)
      this.verifyList = this.verifyList.filter(v =>
        this.selectedStateList.some(
          s => s.toLowerCase() === v.hospital.State.toLowerCase()
        ) &&
        this.selectedPIds.some(
          p => p.toLowerCase() === v.PId.toLowerCase()
        )
      );
    }
    else
    {
      this.verifyList = Object.values(this.verifyObject)
      this.verifyList = this.verifyList.filter(v =>
        this.selectedStateList.some(s => s.toLowerCase() === v.hospital.State.toLowerCase())
      );
    }
    console.log(this.selectedStateList, this.verifyList)
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
  adjustHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // reset height to recalculate
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  async rejectSelectedData()
  {
      this.selectedHospitalData['Verified']="Rejected";
      this.dbService.verifyRejectData(this.selectedHospitalData, this.userProfile.email)
      this.toastr.success("Changes have been made.");
      window.scrollTo(0, 0); 
  }
  async verifySelectedData()
  {
      this.selectedHospitalData['Verified']="Yes";
      this.dbService.verifyRejectData(this.selectedHospitalData, this.userProfile.email)
      this.toastr.success("Changes have been made.");
      window.scrollTo(0, 0); 
  }
  async makeChanges()
  {
    try{
    let allRequests= [];
    let hpinfoIds  = {};
    console.log("this.verifyList====>",this.verifyList)
    for(let i in this.verifyList)
    {
      if (this.verifyList[i].Verified =="Yes" ||  this.verifyList[i].Verified =="Rejected")
        allRequests.push(this.dbService.verifyRejectData(this.verifyList[i], this.userProfile.email));
    }
    await Promise.all(allRequests).then(results =>
      {
        for(let i in results)
        {
          delete this.verifyObject[results[i].HPInfoId];
        }
        this.verifyList = Object.values(this.verifyObject);
        this.filterVerifyList()
        this.toastr.success("Changes have been made.");
        window.scrollTo(0, 0); 
      })
    }
    catch(err){
      console.log("err========>",err)
      this.toastr.error("Error while making changes, please try again");
    }
  }
  async takeMeToHospitalData(dataObject)
  {
    try{
    this.loading = true;
    this.landing = "Hospital";
    this.visaObject = await this.dbService.getVisaObject();
    this.selectedHospitalData = dataObject;
    if(!this.selectedHospitalData.DataOfYear)
        {
          this.selectedHospitalData.DataOfYear=new Date().getFullYear();
        }
        let thisyearfull=new Date().getFullYear();
    if(!this.selectedHospitalData.DataOfYear)
      {
        this.selectedHospitalData.DataOfYear=new Date().getFullYear();
      }
      if(!this.selectedHospitalData.yearlyData)
      {
        this.selectedHospitalData.yearlyData={};
        this.selectedHospitalData.yearlyData[thisyearfull]={};
      }
      else if(!this.selectedHospitalData.yearlyData[thisyearfull])
      {
        this.selectedHospitalData.yearlyData[thisyearfull]={}
      }
      this.yearDataArrayKeys=Object.keys(this.selectedHospitalData.yearlyData)
    this.loading = false;
    }
    catch(err)
    {
      this.toastr.error("Error while fetching hospital's data, please try again");
    }
  }
  async takeActionOnHospital()
  {
    try{
      await this.dbService.verifyRejectData(this.selectedHospitalData, this.userProfile.email);
      this.landing="List";
      delete this.verifyObject[this.selectedHospitalData.HPInfoId];
      this.verifyList = Object.values(this.verifyObject);
      this.filterVerifyList()
      this.toastr.success("Changes have been made");
  }
    catch(err){
      this.toastr.error("Error occured while trying changes, please try again");
    }
  }

}
