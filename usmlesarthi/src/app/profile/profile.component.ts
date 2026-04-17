import {
  Component,
  OnInit
} from '@angular/core';
import {
  AuthenticationService
} from '../common/authentication.service';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Visa
} from '../models/visa';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx'; 
import { UserService } from '../common/user.service';
import { ProfileService } from './services/profile.service';
interface ScoreSelection {
  Name?: string;
  Value?: any;
}

interface StepScore {
  Selected: ScoreSelection;
}

interface ScoreData {
  Step1Score: StepScore;
  Step2Score: StepScore;
  Step3Score: StepScore;
  Step1Attempts?: string;
  Step2Attempts?: string;
  Step3Attempts?: string;
}

interface SelectedUser {
  GraduationDate?: any;
  GraduationExtendedMoreThan6Months?: string;

  CountryOfMedicalSchool?: any;
  NameOfMedicalSchool?: any;
  NameOfMedicalSchoolOthers?: string;

  ProfileRepeating?: string;

  VisaRequirementOthers?: string;

  ScoreData: ScoreData;

  ECFMGCertificate?: string;
  ECFMGCertificateDate?: any;

  focusSpeciality?: string;
  HomeCountryResidencyOption?: string;
  homeCompletionYear?: number;
  HomeCountrySpecility?: string;

  DoYouHaveMasters?: string;
  mastersDegreeName?: string;

  redflag?: string;

  HDUGAU?: any[];
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  visaList: Visa[];
  matchPlans: string[];
  loading: boolean = false;
  landing: string;
  selectedUser: any = {};
  selectedVisaValues: string[] = [];
  Step1ScoreKeys: any[] = [];
  Step2ScoreKeys: any[] = [];
  workExperiences: any[] = [];
  researchData: any[] = [];
  usceData: any[] = [];
  medicalSchoolOptionsList: any[] = [];
  Step1ScoreDropDown : any = {'Score':'Score','Pass':'Pass','Fail':'Fail','Not taken':'Not taken'};
 Step2ScoreDropDown: any = {'Score':'Score','Not taken':'Not taken'}
  matchSelectedYear : string = "";
  matchSelectedMonth : string = "";
  notesSelectedYear : string = "";
  notesSelectedMonth : string = "";
  meetingNotes : string = "";
  matchNotes : string = "";
  userData: any = {};
  userReferral: any = {};
  userPayments: any = {};
  userNotes: any = {};
  userNotesArr : any = {};
  request: any = "";
  customVisa: any =  [{Type: "GC/US citizen/H4 EAD", VId:"1"},{Type:"Need H1", VId:"2"},{Type:"Need J1", VId:"3"}, {Type:"Other", VId:"4"}];
  isRequestCollapsed : boolean = true;
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

  constructor(private authService: AuthenticationService, private dbService: ProfileService, private toast: ToastrService, ) {}

  async ngOnInit() {
    this.loading = true;
    try{
      this.visaList = await this.dbService.getVisaList();
      this.userData = await this.authService.userData;
      this.userPayments = await this.dbService.getUserPaymentByEmail(this.userData.email);
      this.userReferral = await this.dbService.getReferralCode(this.userData.uid);
      //this.selectedUser=this.userData;
      this.setSelectedUser(this.userData);
      this.workExperiences = this.getWorkExperiences();
      this.researchData = this.getResearch();
      this.usceData = this.getUsceData();
      console.log("this.selectedUser--->",this.selectedUser)
      this.convertVisa(this.userData);
      this.landing = "profile";
      this.loading = false;
    }
    catch(err)
    {
      this.loading = false;
      this.toast.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
  }
  setSelectedUser(data: any) {
  this.selectedUser = {
    ...this.getEmptyUser(),
    ...data,
    ScoreData: {
      ...this.getEmptyUser().ScoreData,
      ...(data && data.ScoreData ? data.ScoreData : {})
    }
  };
}
prepareVisa() 
 {
  if (!this.selectedUser || !this.selectedUser.VisaRequirement) 
  {
    this.selectedVisaValues = [];
    return;
  }

  this.selectedVisaValues = this.selectedUser.VisaRequirement.map(v => v.value);
}
initScoreData() {
    const s = this.selectedUser;

    if (!s.ScoreData) s.ScoreData = {};

    ['Step1Score', 'Step2Score', 'Step3Score'].forEach(step => {

  if (
    this.selectedUser &&
    this.selectedUser.ScoreData &&
    this.selectedUser.ScoreData[step] &&
    this.selectedUser.ScoreData[step].Selected
  ) {
    let s = this.selectedUser.ScoreData[step].Selected;

    if (s.Name) {
      if (typeof s.Name === 'object') {
        s.Name = s.Name.key || s.Name.value;
      }

      s.Name = s.Name.trim();
    }
  }

});
  }
  initScoreKeys() {
  if (!this.Step1ScoreKeys || this.Step1ScoreKeys.length === 0) {
    this.Step1ScoreKeys = Object.entries(this.Step1ScoreDropDown)
      .map(function(entry) {
        return { key: entry[0], value: entry[1] };
      });
  }

  if (!this.Step2ScoreKeys || this.Step2ScoreKeys.length === 0) {
    this.Step2ScoreKeys = Object.entries(this.Step2ScoreDropDown)
      .map(function(entry) {
        return { key: entry[0], value: entry[1] };
      });
  }
}
fixScoreData() {

  if (!this.selectedUser || !this.selectedUser.ScoreData) return;

  var steps = ['Step1Score', 'Step2Score', 'Step3Score'];

  for (var i = 0; i < steps.length; i++) {

    var stepKey = steps[i];

    if (
      this.selectedUser.ScoreData[stepKey] &&
      this.selectedUser.ScoreData[stepKey].Selected
    ) {

      var selected = this.selectedUser.ScoreData[stepKey].Selected;

      if (selected.Name) {

        // ✅ Convert object → string
        if (typeof selected.Name === 'object') {
          selected.Name = selected.Name.key || selected.Name.value;
        }

        // ✅ Convert to string safely
        selected.Name = String(selected.Name);

        // ✅ Trim spaces
        selected.Name = selected.Name.trim();

        // ✅ Normalize case EXACTLY like dropdown
        if (selected.Name.toLowerCase() === 'score') selected.Name = 'Score';
        else if (selected.Name.toLowerCase() === 'pass') selected.Name = 'Pass';
        else if (selected.Name.toLowerCase() === 'fail') selected.Name = 'Fail';
        else if (selected.Name.toLowerCase() === 'not taken') selected.Name = 'Not taken';

      } else {
        selected.Name = null;
      }
    }
  }
}
getHDUGAUValues() {
  if (!this.selectedUser || !this.selectedUser.HDUGAU) {
    return [];
  }
  return this.selectedUser.HDUGAU.map(function(x) {
    return x.label;
  });
}
getEmptyUser(): SelectedUser {
  return {
    GraduationDate: null,
    GraduationExtendedMoreThan6Months: '',

    CountryOfMedicalSchool: null,
    NameOfMedicalSchool: null,
    NameOfMedicalSchoolOthers: '',

    ProfileRepeating: '',

    VisaRequirementOthers: '',

    ScoreData: {
      Step1Score: { Selected: {} },
      Step2Score: { Selected: {} },
      Step3Score: { Selected: {} },
      Step1Attempts: '',
      Step2Attempts: '',
      Step3Attempts: ''
    },

    ECFMGCertificate: '',
    ECFMGCertificateDate: null,

    focusSpeciality: '',
    HomeCountryResidencyOption: '',

    homeCompletionYear: null,
    HomeCountrySpecility: '',

    DoYouHaveMasters: '',
    mastersDegreeName: '',

    redflag: '',

    HDUGAU: []
  };
}
setHDUGAUValues(values: string[]) {
  if (!this.selectedUser) {
    this.selectedUser = {};
  }

  this.selectedUser.HDUGAU = (values || []).map(function(v) {
    return { label: v };
  });
}
formatDate(val: any) {
  if (!val) return '';

  if (val.seconds) {
    return new Date(val.seconds * 1000).toLocaleDateString();
  }

  return val;
}
getWorkExperiences() {
  if (!this.selectedUser || !this.selectedUser.WorkExperienceData) return [];

  return Object.keys(this.selectedUser.WorkExperienceData).map(key => {
    return {
      key,
      ...this.selectedUser.WorkExperienceData[key]
    };
  });
}
getResearch() {
  if (!this.selectedUser || !this.selectedUser.ResearchData) return [];

  return Object.keys(this.selectedUser.ResearchData).map(key => {
    return {
      key,
      ...this.selectedUser.ResearchData[key]
    };
  });
}
getUsceData() {
  if (!this.selectedUser || !this.selectedUser.USCEDATA) return [];

  return Object.keys(this.selectedUser.USCEDATA).map(key => {
    return {
      key,
      ...this.selectedUser.USCEDATA[key]
    };
  });
}
numberToString(value)
{
  return Number(value);
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
  async updateProfile() {
    if (this.userData.Locked && this.userData.Locked=="0" && ! this.validateInputs()){
      return;
    }
    if( this.userData.Locked && this.userData.Locked=="0" && isNaN(+this.userData.USCE)){
      this.toast.error("USCE should contain only numbers");
      return;
    }
    try {
      this.loading = true;
      let finalVisas = [];
      for(let i in this.userData.newVisas){
        let vid = this.userData.newVisas[i];
        if (vid=="1"){
          finalVisas.push("1");
          finalVisas.push("6");
        }
        else if(vid=="4")
          finalVisas.push("7");
        else if(vid=="3" || vid=="2")
          finalVisas.push(vid);
      }
      this.userData.Visas = finalVisas;
      delete this.userData.newVisas;
      if(this.userData.Locked=="0"){
        this.userData.Locked = '1';
        await this.dbService.updateMainProfile(this.userData);
      }
      await this.dbService.updateExtraProfile(this.userData);
      this.userData.extraUsersData = true;
      this.convertVisa(this.userData);
      this.toast.success("Profile updated successfully!");
      this.loading = false;
    }
    catch(error){
      this.toast.error("Error while updating your profile")
    }
  }

  validateInputs(){
    if(this.userData.YOG && (this.userData.YOG=="" || this.userData.YOG<1950)){
      this.toast.error("Year of graduation is not in a right format");
      return false;
    }

    return true;
  }
  public captureScreen()  
  {  
    window.scrollTo(0,  0);
    var data = document.getElementById('contentToConvert');  
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      var imgWidth = 150;   
      var pageHeight = 600;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  
  
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf.jsPDF('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 5;  
      pdf.addImage(contentDataURL, 'PNG', position, position, imgWidth, imgHeight)  
      pdf.save('MYPdf.pdf'); // Generated PDF   
    });
  } 
  async takeMeToNotes() {
    try{
      this.loading=false;
      this.landing="notes";
      this.userNotes = await this.dbService.getUserNotes(this.userData.uid);
    }
    catch(err){
      this.toast.error("Some problem while connecting, try again", "Error");
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
      this.userNotes = await this.dbService.getUserNotes(this.userData.uid);
    }
    catch(err){
      this.toast.error("Some problem while connecting, try again", "Error");
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

  takeMeToAllPlan() {
    try{
      this.loading=false;
      this.landing="allplan";
      this.createUserNotesArr();
    }
    catch(err){
      this.toast.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
    finally{
      this.loading=false;
    }
  }

  takeMeToAllNotes() {
    try{
      this.loading=false;
      this.landing="allnotes";
      this.createUserNotesArr();
    }
    catch(err){
      this.toast.error("Some problem while connecting, try again", "Error");
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
    if (this.notesSelectedMonth && this.notesSelectedYear) {
      if (this.ifKeyExists(this.userNotes, this.notesSelectedYear)){
        if (this.ifKeyExists(this.userNotes[this.notesSelectedYear], this.notesSelectedMonth))
          this.meetingNotes = this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].meetingNotes;
      }
    }
  }
  changeMatchPlan() {
    if (this.matchSelectedMonth && this.matchSelectedYear) {
      if (this.ifKeyExists(this.userNotes, this.matchSelectedYear)){
        if (this.ifKeyExists(this.userNotes[this.matchSelectedYear], this.matchSelectedMonth)){
          this.matchNotes = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchNotes;
          this.matchPlans = this.userNotes[this.matchSelectedYear][this.matchSelectedMonth].matchPlans;
        }
      }
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
    }
    if (this.notesSelectedMonth && this.notesSelectedYear) {
      if (!this.ifKeyExists(this.userNotes, this.notesSelectedYear))
        this.userNotes[this.notesSelectedYear] = {};
      if (!this.ifKeyExists(this.userNotes[this.notesSelectedYear], this.notesSelectedMonth))
        this.userNotes[this.notesSelectedYear][this.notesSelectedMonth] = {}
      this.userNotes[this.notesSelectedYear][this.notesSelectedMonth].meetingNotes = this.meetingNotes;
    }
    try{
      await this.dbService.updateNotes(this.userData.uid, this.userNotes);
      this.toast.success("Notes updated successfully!");
      if (this.landing==='plan')
        this.takeMeToMatchPlan();
      else
        this.takeMeToNotes();
    }
    catch(err){
      this.toast.error("Some problem while connecting, try again", "Error");
      console.log(err);
    }
  }

  /*async makeRequest(){
    if(this.request=="")
    {
      this.toast.error("Please describe the expected modifications");
      return;
    }
    else{
      await this.userApi.requestProfileChange(this.request, this.userData.uid);
      this.toast.success("Request submitted successfully. We will update the profil")
    }
  }*/

  exportToExcel(key): void 
    {
      if(this.userNotesArr.length==0){
        this.toast.info("You cannot export an empty table");
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

}
