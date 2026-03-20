import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ProgramService } from '../common/program.service';
import { HospitalService } from '../common/hospital.service';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { range } from 'rxjs';
import { InterviewInsightsService } from './services/interview-insights.service';
import { ThrowStmt } from '@angular/compiler';
import { AuthenticationService } from '../common/authentication.service';

@Component({
  selector: 'app-interview-insights',
  templateUrl: './interview-insights.component.html',
  styleUrls: ['./interview-insights.component.scss']
})
export class InterviewInsightsComponent implements OnInit {
  userData   : any;
  landing    : string;
  speciality : string;
  numHos     : number;
  loading    : boolean;
  programObject : any = {};
  programList   : any[] = [];
  interviewsObject: any= {};
  interviewsList: any[] = [];
  hospitalsByProgram: any = {};
  hospitalsList : any[]=[];
  selectValues : any[];
  selectedInterview : any = {};
  selectedInterviewData: any= {};
  interviewsInfo : any[] = [];
  today = new Date();

  constructor(private authService: AuthenticationService, private toastr: ToastrService, private router: Router, private programApi: ProgramService, private hospitalApi: HospitalService, public calendar: NgbCalendar, private dbService: InterviewInsightsService) {
   }

  async ngOnInit() {
    this.userData = await this.authService.userData;
    await this.takeMeToBasic();
  }
  
  async takeMeToBasic(){
    try{
    this.loading = true;
    this.speciality = "";
    this.numHos = 0;
    this.landing = "basic";
    this.programObject = await this.programApi.getProgramObject();
    this.programList = Object.values(this.programObject);
    this.loading = false;
    }
    catch(err){
        this.toastr.error("Error while fetching specialities, please try again");
    }
  }

  async getSelects(){
    if (this.numHos<=0 || this.numHos>10)
      this.toastr.info("Please input a valid number of interviews, between 1-10");
    else if(this.speciality=="")
      this.toastr.info("Please select a valid program");      
    else{
      await this.takeMeToSelection();
    } 
  }
  async takeMeToSelection(){
    try{
    this.loading = true;
    this.landing = "selection";
    this.selectValues = [];
    for( var i= 0; i < this.numHos; i++)
    {
      this.selectValues.push({ hid:"", date: this.calendar.getToday(), signal: "" });
    }
    this.hospitalsList = await this.hospitalApi.getHospitalsByProgram(this.speciality);
    if (this.hospitalsList.length==0)
    {
      this.toastr.info("No hospitals are currently assigned to the selected program, please select another one");
      this.landing = "basic";
    }
    this.loading = false;
    }
    catch(err){
      this.toastr.error("Error while fetching hospitals, please try again");
    }
  }
  async postSelections(){
    try{
    this.loading = true;
    let allHIds = {};
    for(let i in this.selectValues)
    {
      let hid = this.selectValues[i].hid;
      if (hid=="")
      {
        this.toastr.info("Please select a hospital");
        this.loading = false;
        return;
      }
      else if(hid in allHIds)
      {
        this.toastr.info("Please select a distinct hospital");
        this.loading = false;
        return;
      }
      allHIds[hid] = 1;
    }
    let allPosts = [];
    for(let i in this.selectValues)
    {
      let hid = this.selectValues[i].hid;
      let date = this.selectValues[i].date;
      let signal = this.selectValues[i].signal;
      if (!this.calendar.isValid(date) || this.calendar.getToday().after(date)){
        this.toastr.error("Date is invalid");
        this.loading = false;
        return;
      }
      allPosts.push(this.dbService.addInterview(this.userData.uid, hid, date, this.speciality, signal));
    }
    await Promise.all(allPosts)
    this.loading = false;
  }
    catch(err){
      this.toastr.error("One or more of your interviews have not been added successfully, please try again");
    }
    await this.takeMeToList();
  }
  async takeMeToList(){
    try{
    this.loading = true;
    this.landing = 'list';
    this.interviewsObject = await this.dbService.getInterviewsByUId(this.userData.uid);
    this.interviewsList = Object.values(this.interviewsObject);
    this.interviewsList.sort((a, b)=> new Date(a.Date).getTime() - new Date(b.Date).getTime());
    if (this.interviewsList.length==0)
      this.toastr.info("You have not added any interviews yet");
    this.loading = false;
    }
    catch(err){
      this.toastr.error("Error while fetching your interviews, please try again");
    }
  }
  async takeMeToInfo(interview, index){
    try{
    if(this.isAllowedToAccess(interview, index)){
      this.loading = true;
      this.landing = 'display';
      this.selectedInterview = this.interviewsList[index];
      this.interviewsInfo = await this.dbService.getInterviewsInfoByHIdPId(interview.HId, interview.PId);
      if(this.interviewsInfo.length==0)
        this.toastr.info("We do not have any information regarding this hospital, stay tuned for the updates");
      this.loading = false;
    }
    }
    catch(err){
      this.toastr.error("Error while getting details for the hospital, please try again");
    }
  }
  isAllowedToAccess(interview, index)
  {
    let today = new Date().getTime();
    let interviewDate = new Date(interview.Date).getTime();
    let todayPlus2Weeks = today + 14 * 24 * 60 * 60 * 1000;
    if(interviewDate > todayPlus2Weeks)
    {
      this.toastr.info("You can only access this info before 14 days of your interview.");
      return false;
    }
    let countFuture = 0;
    for(let i=0; i<index; i++){
      let iInterview=  this.interviewsList[i];
      let iInterviewDate = new Date(iInterview.Date).getTime();
      if( iInterviewDate <= today && iInterview.ProvidedInfo == "No")
      {
        this.toastr.info("Please complete the pending information and then continue");
        return false;
      }
      if( iInterviewDate > today && iInterviewDate  < todayPlus2Weeks){
        countFuture++;
      }
    }
    if( true || interviewDate < today || countFuture<3)//Always allow if the logic has run till here
      return true;
    this.toastr.info("You can only access upto 3 pending interviews info");
    return false;
  }
  async takeMeToForm(interviewId)
  {
    try{
    this.loading = true;
    this.landing = "form";
    this.selectedInterview = this.interviewsObject[interviewId];
    let today = new Date().getTime();
    if( new Date(this.selectedInterview.Date).getTime() > today){
      this.toastr.info("Tell us your experience on or after the day of your interview");
      await this.takeMeToList();
      return;
    }
    if(this.selectedInterview.ProvidedInfo=="No"){
      this.selectedInterviewData = {
        UId: this.userData.uid,
        PId: this.selectedInterview.PId,
        HId: this.selectedInterview.HId,
        InterviewType: "",
        interviewPlatform: "",
        otherPlatform: '',
        NumInterviews: "",
        Duration: "",
        InterviewerDesignations: "",
        QuestionsToOther: "",
        PreInterview: "",
        PDPpt: "",
        PDPptDur: "",
        PDDiscussion: "",
        UniquePoints: "",
        FriendlyEnv: "",
        ResidentstSatisfac: "",
        SenJunHierarchy: "",
        IMGFriendly: "",
        OverallExp: "",
        ProgramHighRating: "",
        QuestionsInPD: "",
        Verified: "Yes",
        TimeStamp: Date.now(),
      }
    }
    else{
      this.toastr.info("You cannot update the exsiting interview info.");
      this.landing = "list";
    }
    this.loading = false;
  }
  catch(err){
    this.toastr.error("Error while preparing the information form, please try again");
  }
  }
  async submitData()
  {
    try{
      this.loading = true;
    await this.dbService.addInterviewData(this.selectedInterviewData, this.selectedInterview);
    this.toastr.success("Data has been added successfully");
    this.loading = false;
    }
    catch(err){
      this.toastr.error("Error while adding your interview experience, please try again");
    }
    await this.takeMeToList();
    
  }
}
