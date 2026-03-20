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
import * as XLSX from 'xlsx'; 
import { ProfileService } from '../../profile/services/profile.service';

@Component({
  selector: 'app-assign-roles',
  templateUrl: './assign-roles.component.html',
  styleUrls: ['./assign-roles.component.scss']
})
export class AssignRolesComponent implements OnInit {
  loading: boolean;
  users: any;
  usersList: any = [];
  verifyUsers: any;
  verifyList: any = [];
  allRoles = [{label  : "Default", value : "Default"}, {label : "Student" ,value : "Silver"},{label : "Admin" ,value : "Admin"}, {label : "Mentor" ,value : "Mentor"}];
  currentYearK:any =new Date().getFullYear();
  matchYears:any = Array.from(
  { length: 8 },
  (_, i) => this.currentYearK + 2 - i
);
  //matchYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  landing: any;
  selectedUser: any = {};
  customVisa: any =  [{Type: "GC/US citizen/H4 EAD", VId:"1"},{Type:"Need H1", VId:"2"},{Type:"Need J1", VId:"3"}, {Type:"Other", VId:"4"}];
  visaList: Visa[];
  hospitals: any = [];
  selectedUserMatch :  any= {};
  selectedUserReferral : any = {};
  programObject: any = {};
  specialities: any = [];
  showMatch: boolean = false;
  userNotes: any = {};
  userNotesArr : any = {};
  userPayments : any = {};
  matchSelectedYear : string = "";
  matchSelectedMonth : string = "";
  matchPlans: string[];
  goals : string = "";
  needs : string = "";
  matchNotes : string = "";
  notesSelectedYear : string = "";
  meetingNotes : string = "";
  adminMeetingNotes : string = "";
  notesSelectedMonth : string = "";
  years : any = [ '2022', '2023', '2024', '2025', '2026'];
  plans : any = ['USCE', 'Exam', 'Research', 'Job', 'Others'];
  months : any = [
    {
      name : "January",
      value : "jan"
    },
    {
      name : "Feburary",
      value : "feb"
    },
    {
      name : "March",
      value : "mar"
    },
    {
      name : "April",
      value : "apr"
    },
    {
      name : "May",
      value : "may"
    },
    {
      name : "June",
      value : "jun"
    },
    {
      name : "July",
      value : "jul"
    },
    {
      name : "August",
      value : "aug"
    },
    {
      name : "September",
      value : "sept"
    },
    {
      name : "October",
      value : "oct"
    },
    {
      name : "November",
      value : "nov"
    },
    {
      name : "December",
      value : "dec"
    },
  ]

  constructor(private dbService: AdminServicesService, private toastr: ToastrService, private profileService : ProfileService) {
    this.loading = false;
  }

  async ngOnInit() {
    this.loading = true;
    this.landing = "list";
    this.loading = false;
  }
  async fetchNA() {
    try {
      this.verifyUsers = await this.dbService.getNAusers();
      for (let i in this.verifyUsers) {
        this.verifyUsers[i].newRole = "";
      }
      this.verifyList = Object.values(this.verifyUsers);
      if (this.verifyList.length == 0) {
        this.toastr.info("No new users have registered");
      }
    } catch (err) {
      this.toastr.error("Error while fetching users list, please try again");
    }
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

  makeAllYes() {
    for (let i in this.verifyUsers) {
      this.verifyUsers[i].newRole = "Silver";
    }
    this.verifyList = Object.values(this.verifyUsers);
  }
  makeAllNo() {
    for (let i in this.verifyUsers) {
      this.verifyUsers[i].newRole = "Default";
    }
    this.verifyList = Object.values(this.verifyUsers);
  }
  makeAllNA() {
    for (let i in this.verifyUsers) {
      this.verifyUsers[i].newRole = "";
    }
    this.verifyList = Object.values(this.verifyUsers);
  }

  async makeChanges() {
    try {
      let allRequests = [];
      for (let i in this.verifyList) {
        if (this.verifyList[i].newRole == "Default" || this.verifyList[i].newRole == "Silver") {
          allRequests.push(this.dbService.verifyRejectUsers(this.verifyList[i], this.verifyList[i].uid));
        }
      }
      Promise.all(allRequests).then(results => {
        for (let i in results) {
          delete this.verifyUsers[results[i].uid];
        }
        this.verifyList = Object.values(this.verifyUsers);
        this.toastr.success("Changes have been made.");
        window.scrollTo(0, 0);
      })
    } catch (err) {
      this.toastr.error("Error while making changes, please try again");
    }
  }
  async changeRole(userData) {
    if (userData.newRole == "" || userData.Role == userData.newRole) {
      this.toastr.info("Please select a different role than the current role for the user");
      return;
    }
    try {
      await this.dbService.changeRole(userData);
      this.toastr.success("Role has been changed");
      userData.Role = userData.newRole;
      userData.newRole = "";
      return true;
    } catch (err) {
      console.log(err);
      this.toastr.error("Error while changing role, please try again");
    }
  }
  async takeMeToUserProfile(user){
    try{
    this.loading = true;
    this.selectedUser = user;
    console.log("this.selectedUser---->",this.selectedUser)
    this.landing = "profile";
    let results = await Promise.all([this.dbService.getProgramObject(), this.dbService.getVisaList(), this.dbService.getUserProfile(this.selectedUser), this.dbService.getUserMatch(this.selectedUser), this.dbService.getExtraUserInfo(this.selectedUser)]);
    this.programObject = results[0];
    this.visaList      = results[1];
    this.selectedUser  = {...this.selectedUser, ...results[2]};
    this.selectedUserMatch = results[3];
    this.selectedUser = {...this.selectedUser, ...results[4]};
    this.specialities = Object.values(this.programObject);
    this.userPayments = await this.profileService.getUserPaymentByEmail(this.selectedUser.email);
    try{
      this.selectedUserReferral = await this.dbService.getReferralCode(this.selectedUser.uid);
    }
    catch(err){
      this.toastr.info("Referral Code is not yet generated by the user.");
    }
    this.convertVisa(this.selectedUser);
    this.loading = false;
    }catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching user's profile, please try again");
    }
  }
  async updateProfile() {
    if (! this.validateInputs()){
      return;
    }
    if(isNaN(+this.selectedUser.USCE)){
      this.toastr.error("USCE should contain only numbers");
      return;
    }
    try {
      this.loading = true;
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
      delete this.selectedUser.newVisas;
      this.selectedUser.Locked = '1';
      await this.dbService.updateMainProfile(this.selectedUser);
      await this.dbService.updateExtraProfile(this.selectedUser);
      this.selectedUser.extraUsersData = true;
      this.convertVisa(this.selectedUser);
      this.toastr.success("Profile updated successfully!");
      this.loading = false;
    }
    catch(error){
      console.log(error);
      this.toastr.error("Error while updating your profile");
    }
  }

  validateInputs(){
    if(this.selectedUser.YOG && (this.selectedUser.YOG=="" || this.selectedUser.YOG<1950)){
      this.toastr.error("Year of graduation is not in a right format");
      return false;
    }

    return true;
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
  
  async updateMatch(){
    try{
      await this.dbService.updateUserMatch(this.selectedUserMatch, this.selectedUser);
      this.toastr.success("Match Details are updated");
      await this.takeMeToUserProfile(this.selectedUser);
    }
    catch(err){
      this.toastr.error("Error while updating the match details, please try again");
      console.log(err.message);
    }
  }

  async takeMeToNotes() {
    try{
      this.loading=false;
      this.landing="notes";
      this.userNotes = await this.dbService.getUserNotes(this.selectedUser.uid);
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
    finally{
      this.loading=false;
    }
  }

  async takeMeToMatchPlan() {
    try{
      this.loading=false;
      this.landing="plan";
      console.log("this.selectedUser.uid===>",this.selectedUser.uid)
      this.userNotes = await this.dbService.getUserNotes(this.selectedUser.uid);
      console.log("this.userNotes===>",this.userNotes)
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
    finally{
      this.loading=false;
    }
  }


  createUserNotesArr () {
    this.userNotesArr  = [];
    for(const year of this.years)
      {
        if (this.userNotes[year])
          for(const {value, name} of this.months){
            if (this.userNotes[year][value])
              this.userNotesArr.push({
                year,
                month : name,
                ...this.userNotes[year][value]
              })
          }
      }
  }

  takeMeToAllNotes() {
    try{
      this.loading=false;
      this.landing="allnotes";
      this.createUserNotesArr();
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
    finally{
      this.loading=false;
    }
  }

  takeMeToAllPlan() {
    try{
      this.loading=false;
      this.landing="allplan";
      this.createUserNotesArr();
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
    finally{
      this.loading=false;
    }
  }

  ifKeyExists (object, key) {
    return Object.keys(object).indexOf(key) !== -1;
  }

  changeMeetingNotes() {
    let clear = true;
    if (this.notesSelectedMonth && this.notesSelectedYear) {
      if (this.ifKeyExists(this.userNotes, this.notesSelectedYear)){
        if (this.ifKeyExists(this.userNotes[this.notesSelectedYear], this.notesSelectedMonth)){
          clear = false;
          this.meetingNotes = this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].meetingNotes;
          this.adminMeetingNotes = this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].adminMeetingNotes;
        }
      }
    }
    if(clear){
      this.meetingNotes = "";
      this.adminMeetingNotes = "";
    }
  }

  changeMatchPlan() {
    let clear = true;
    if (this.matchSelectedMonth && this.matchSelectedYear) {
      if (this.ifKeyExists(this.userNotes, this.matchSelectedYear)){
        if (this.ifKeyExists(this.userNotes[this.matchSelectedYear], this.matchSelectedMonth)){
          clear = false;
          this.matchNotes = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchNotes;
          this.matchPlans = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchPlans;
          this.goals = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].goals;
          this.needs = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].needs;
        }
      }
    }
    if (clear){
      this.matchNotes = "";
      this.matchPlans = [];
      this.goals = "";
      this.needs = "";
    }
  }

  async updateNotes() {
    if (this.matchSelectedMonth && this.matchSelectedYear) {
      if (!this.ifKeyExists(this.userNotes, this.matchSelectedYear))
        this.userNotes[this.matchSelectedYear] = {};
      if (!this.ifKeyExists(this.userNotes[this.matchSelectedYear], this.matchSelectedMonth))
        this.userNotes[this.matchSelectedYear][this.matchSelectedMonth] = {}
      this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchNotes = this.matchNotes;
      this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchPlans = this.matchPlans;
      this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].goals = this.goals;
      this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].needs = this.needs;
    }
    if (this.notesSelectedMonth && this.notesSelectedYear) {
      if (!this.ifKeyExists(this.userNotes, this.notesSelectedYear))
        this.userNotes[this.notesSelectedYear] = {};
      if (!this.ifKeyExists(this.userNotes[this.notesSelectedYear], this.notesSelectedMonth))
        this.userNotes[this.notesSelectedYear][this.notesSelectedMonth] = {}
      this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].meetingNotes = this.meetingNotes;
      this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].adminMeetingNotes = this.adminMeetingNotes;

    }
    try{
      await this.dbService.updateUserNotes(this.selectedUser.uid, this.userNotes);
      this.toastr.success("Notes updated successfully!");
      if (this.landing==='plan')
        this.takeMeToMatchPlan();
      else
        this.takeMeToNotes();
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
  }

  async updateAdminNotes() {
    try{
      await this.dbService.updateUserNotes(this.selectedUser.uid, this.userNotes);
      this.toastr.success("Notes updated successfully!");
      this.takeMeToNotes();
    }
    catch(err){
      this.toastr.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
  }

  exportToExcel(key): void 
    {
      if(this.userNotesArr.length==0 && !this.userNotes.adminNotes){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = `${key}.xlsx`;
       /* table id is passed over here */   
       let element = document.getElementById(key); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
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

