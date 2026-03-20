import { Component, OnInit } from '@angular/core';
import { Visa } from '../../models/visa';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-add-user-profiles',
  templateUrl: './add-user-profiles.component.html',
  styleUrls: ['./add-user-profiles.component.scss']
})
export class AddUserProfilesComponent implements OnInit {
  selectedUser: any = {};
  loading: boolean = false;
  matchYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  customVisa: any =  [{Type: "GC/US citizen/H4 EAD", VId:"1"},{Type:"Need H1", VId:"2"},{Type:"Need J1", VId:"3"}, {Type:"Other", VId:"4"}];
  visaList: Visa[];
  hospitals: any = [];
  programObject: any = {};
  specialities: any = [];

  constructor(private toastr: ToastrService, private dbService: AdminServicesService) { }

  async ngOnInit() {
    this.loading = true;
    this.resetUser();
    let results = await Promise.all([this.dbService.getProgramObject(), this.dbService.getVisaList()]);
    this.programObject = results[0];
    this.visaList      = results[1];
    this.specialities = Object.values(this.programObject);
    this.loading = false;
  }

  resetUser(){ 
    this.selectedUser = {
      email: "",
      displayName: "",
      YOG: 0,
      Step1Score: 0,
      Step2Score: 0,
      USCE: "",
      HId: "",
      PId: "",
      yearMatch: ""
    }
  }
  async updateProfile() {
    if (this.selectedUser.YOG < 1950){
        this.toastr.error("YOG format is not correct");
        return;
    }
    if(isNaN(+this.selectedUser.USCE)){
      this.toastr.error("USCE should contain only numbers");
      return;
    }
    try {
      if(await this.dbService.checkIfUserPresent(this.selectedUser.email)){
        this.toastr.error("This email has already been registered, please navigate to Assign Roles to change his/her profile");
        return;
      }
      this.selectedUser.Locked = '1';
      let finalVisas = [];
      for(let i in this.selectedUser.newVisas){
        let vid = this.selectedUser.newVisas[i];
        if (vid=="1"){
          finalVisas.push("1");
          finalVisas.push("6");
        }
        else if(vid=="4")
          finalVisas.push("7");
        else if(vid=="3" || vid=="2")
          finalVisas.push(vid);
      }
      this.selectedUser.Visas = finalVisas;
      await this.dbService.addUserForMatch(this.selectedUser);
      this.resetUser();
      this.toastr.success("Profile added successfully!");
    }
    catch(error){
      this.toastr.error("Error while updating this profile, please try again");
    }
  }
  convertVisa(userData){
    let customVisas= {};
    if("Visas" in userData){
      for(let i in userData.Visas){
        let vid=  userData.Visas[i];
        if (vid=="7")
          customVisas["4"] = 1;
        else if (vid=="1" || vid=="6")
          customVisas["1"] = 1;
        else if (vid=="2")
          customVisas["2"] = 1;
        else if (vid=="3")
          customVisas["3"] = 1;
      }
    }
    let newVisas = Object.keys(customVisas);
    userData.newVisas=  newVisas;
    return;
  }
  async loadHospitals(event) {
    try{
      let pid      = event.target.value;
      this.loading = true;
      this.hospitals = await this.dbService.getHospitalsByProgram(pid);
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching programs, please try again");
    }
  }

}
