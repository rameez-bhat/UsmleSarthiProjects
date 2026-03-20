import {
  Component,
  OnInit
} from '@angular/core';
import {
  AdminServicesService
} from '../services/admin-services.service';
import {
  ToastrService
} from 'ngx-toastr';
import { Visa } from '../../models/visa';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-see-profiles',
  templateUrl: './see-profiles.component.html',
  styleUrls: ['./see-profiles.component.scss']
})
export class SeeProfilesComponent implements OnInit {
  loading: boolean;
  users: any;
  usersList: any = [];
  verifyUsers: any;
  verifyList: any = [];
  allRoles = ["Default", "Silver", "Admin", "Mentor"];
  matchYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  landing: any;
  selectedUser: any = {};
  customVisa: any =  [{Type: "GC/US citizen/H4 EAD", VId:"1"},{Type:"Need H1", VId:"2"},{Type:"Need J1", VId:"3"}, {Type:"Other", VId:"4"}];
  visaList: Visa[];
  hospitals: any = [];
  selectedUserMatch :  any= {};
  programObject: any = {};
  specialities: any = [];
  showMatch: boolean = false;

  constructor(private dbService: AdminServicesService, private toastr: ToastrService) {
    this.loading = false;
  }

  async ngOnInit() {
    this.loading = true;
    this.landing = "list";
    this.loading = false;
  }
  async fetchSome(userVal) {
    if(userVal==""){
      this.toastr.info("Please write some prefix of user's email or name in the input");
      return;
    }
    try {
      this.loading = true;
      this.users = await this.dbService.getSomeUsers(userVal);
      this.usersList = Object.values(this.users);
      for (let i in this.usersList) {
        this.usersList[i].newRole = "";
      }
      this.loading = false;
    } catch (err) {
      console.log(err);
      this.toastr.error("Error while fetching users list, please try again");
    }
  }
  async fetchAll() {
    try {
      this.loading = true;
      this.users = await this.dbService.getAllUsers();
      this.usersList = Object.values(this.users);
      for (let i in this.usersList) {
        this.usersList[i].newRole = "";
      }
      this.loading = false;
    } catch (err) {
      this.toastr.error("Error while fetching users list, please try again");
    }
  }

  async takeMeToUserProfile(user){
    try{
    this.loading = true;
    this.selectedUser = user;
    this.landing = "profile";
    let results = await Promise.all([this.dbService.getProgramObject(), this.dbService.getVisaList(), this.dbService.getUserProfile(this.selectedUser), this.dbService.getUserMatch(this.selectedUser), this.dbService.getExtraUserInfo(this.selectedUser)]);
    this.programObject = results[0];
    this.visaList      = results[1];
    this.selectedUser  = {...this.selectedUser, ...results[2]};
    this.selectedUserMatch = results[3];
    this.selectedUser = {...this.selectedUser, ...results[4]};
    this.specialities = Object.values(this.programObject);
    this.convertVisa(this.selectedUser);
    this.loading = false;
    }catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching user's profile, please try again");
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

  async captureScreen()  
  {  
    window.scrollTo(0,  0);
    this.showMatch = false;
    var data = document.getElementById('contentToConvert');  
    await html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      var imgWidth = 160;   
      var pageHeight = 600;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  
  
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf.jsPDF('p', 'mm', 'a3'); // A4 size page of PDF  
      var position = 5;  
      pdf.addImage(contentDataURL, 'PNG', 8, position, imgWidth, imgHeight)  
      pdf.save('MYPdf.pdf'); // Generated PDF 
    });
  }

}

