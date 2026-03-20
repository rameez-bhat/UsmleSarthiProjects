import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RankOrderServicesService } from './services/rank-order-services.service';
import { AuthenticationService } from '../common/authentication.service';
import { Options } from 'ng5-slider';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-rank-order-list',
  templateUrl: './rank-order-list.component.html',
  styleUrls: ['./rank-order-list.component.scss']
})
export class RankOrderListComponent implements OnInit {
  landing = "factors";
  loading: boolean = false;
  dataObject: any = {};
  interviews: any = [];
  userData: any   = {};
  programObject: any = {};
  lockFactors: boolean = false;
  scores: Options = {
    floor: 0,
    ceil: 10,
    step: 1,
    showTicks: true,
    showTicksValues: true
  };
  weights: Options = {
    floor: 0,
    ceil: 100,
  };
  sumOfWeights =  0;
  selectedInterview: any= {};
  selectedScoreDoc:  any= {}; 
  selectedHospitalDoc : any= {};
  rankedInterviews:  any = {};
  constructor(private toastr: ToastrService, private router: Router, public modalService: NgbModal, private dbService: RankOrderServicesService, private authService: AuthenticationService) { }

  async ngOnInit() {
    try{
      this.loading = true;
      this.userData = await this.authService.userData;
      await this.makeDataObjectReady();
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching the factors, please try again");
    }
  }

  async makeDataObjectReady(){
    this.dataObject = {
      factors : [],
      userFactors: [],
    }
    await Promise.all([this.dbService.getUserFactors(this.userData.uid), this.dbService.getUserWeights(this.userData.uid)]).then(result =>{
      for(let i in result[0]){
        let factor = result[0][i];
        factor.Value = 0;
        factor.Reason = "";
        if(factor.AttrId in result[1]){
          factor.Value = result[1][factor.AttrId].Value;
          factor.Reason = result[1][factor.AttrId].Reason;
        }
        if(factor.Type=="1")
          this.dataObject.userFactors.push(factor);
        else
          this.dataObject.factors.push(factor);
      }
      if(Object.keys(result[1]).length>0){
        //this.lockFactors = true;
        this.takeMeToList (); 
      }
    });
    this.getNewSum();
    return;
  }

  open(content) {
    this.modalService.open(content, { size: 'lg'});
  }

  async addFactor(name){
    try{
      if (name.trim()===""){
        return this.toastr.info("Name of the factor cannot be empty");
      }
    let data = await this.dbService.createFactor(name, this.userData.uid);
    this.dataObject.userFactors.push({AttrName: name, Value: 0, Reason: "", Type:"1", UId:this.userData.uid, AttrId: data.AttrId});
    this.modalService.dismissAll();
    }
    catch(err){
      this.toastr.error("Error while adding this factor, please try again");
    }
    this.getNewSum();
  }

  async deleteFactor(factor){
    try{
      if( factor.Type=="1"){
        let result = await this.dbService.deleteFactor(factor);
        if (!result){
          this.toastr.error("You cannot delete this factor, the scores with this factor have been submitted already.");
          return;
        }
        let ind = this.dataObject.userFactors.indexOf(factor);  
        if (ind !=-1)
          this.dataObject.userFactors.splice(ind, 1);
      }
      else
        this.toastr.error("You cannot delete the mandatory factors");
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while deleting the factor, please try again");
    }
    this.getNewSum();
  }

  async saveFactorsWeights(){
    try{
      if (this.validateFactors()){
        this.loading = true;
        await this.dbService.setFactorsWeights(this.dataObject, this.userData.uid);
        //this.lockFactors = true;
        this.toastr.success("Your weights are successfully saved");
        await this.takeMeToList();
      }
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while saving your weights, please try again");
    }
  }
  async takeMeToList(){
    try{
      this.loading = true;
      this.landing = "list";
      let programObject = this.dbService.getProgramsObject();
      let interviewsObject = this.dbService.getInterviewsByUId(this.userData.uid);//For now it is giving me all the interviews
      let results = await Promise.all([interviewsObject, programObject]);
      this.interviews = Object.values(results[0]);
      this.programObject = results[1];
      this.loading = false;
    }
    catch(err){
      this.toastr.error("Error while fetching your interviews, please try again");
    }
  }
  getNewSum() {
    this.sumOfWeights =  (this.dataObject.userFactors.reduce((a, b) => a +(b["Value"] || 0), 0) + this.dataObject.factors.reduce((a, b) => a +(b["Value"] || 0), 0))
  }
  validateFactors(){
    this.getNewSum();
    if(this.sumOfWeights==100){
      for(let factor of this.dataObject.factors){
        if (factor.Value != 0 &&  factor.Reason.trim ()===""){
          this.toastr.info("Provide reasons for all the weighted factors");
          return false;
        }
      }
      for(let factor of this.dataObject.userFactors){
        if (factor.Value != 0 &&  factor.Reason.trim ()===""){
          this.toastr.info("Provide reasons for all the weighted factors");
          return false;
        }
      }
      return true;
    }
    else{
      this.toastr.info("The sum of weights should be 100");
      return false;
    }
  }

  chooseForm (interview){
    if (interview && (interview.isScoreSubmitted || interview.isExtraInfoSubmitted))
      this.takeMeToScore (interview);
    else
      this.takeMeToExtraInfo (interview);
  }

  async takeMeToScore(interview){
    try{
      this.loading = true;
      this.selectedInterview = interview;
      this.selectedScoreDoc = interview.isScoreSubmitted ? interview.scoreDoc : {
        HId: interview.HId,
        PId: interview.PId,
        UId: interview.UId,
        Scores: await this.getEmptyScores(interview.HId, interview.PId),
      };
      for (let factor of this.dataObject.userFactors){
        if (!(factor.AttrId in this.selectedScoreDoc.Scores ))
          this.selectedScoreDoc.Scores[factor.AttrId]={
            Score  : 0,
            Reason : ""
          }
      }
      this.landing = "score";
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching data, please try again");
      this.takeMeToList ();
    }
  }

  async takeMeToExtraInfo(interview){
    this.loading = true;
    this.selectedInterview = interview;
    this.selectedHospitalDoc = {
      HId: interview.HId,
      PId: interview.PId,
      UId: interview.UId,
    };
    this.landing = "extraInfo";
    this.loading = false;
  }

  async getExtraInfo (interview){
    try {
      this.loading = true;
      this.selectedInterview = interview;
      this.selectedInterview.extraInfo = await this.dbService.getExtraHospitalInfo (interview.HId, interview.PId);
      if (Object.keys(this.selectedInterview.extraInfo).length==0)
      {
        this.toastr.info("We currently do not have much information about the program, Stay tuned for updates");
        return this.takeMeToList ();

      }
      this.landing = "display";
      this.loading = false;
    }
    catch(err){
      this.toastr.error("Error while fetching data, please try again");
      this.takeMeToList ();
    }
  }

  async getEmptyScores(hid, pid){
    let emptyScores = {};
    let avScores    = await this.dbService.getAverageScores (hid, pid);
    for(let factor of this.dataObject.factors){
      emptyScores[factor.AttrId] = {
        Score: avScores[factor.AttrId] ? avScores[factor.AttrId] : 0,
        Reason: "",
      };
    }
    for(let factor of this.dataObject.userFactors){
      emptyScores[factor.AttrId] = {
        Score: 0,
        Reason: "",
      };
    }
    return emptyScores;
  }

  async fillExtraInfoData(){
    try{
      if(this.validateInputs()){
        await this.dbService.submitExtraHospitalInfo(this.selectedHospitalDoc);
        this.toastr.success("Data has been saved successfully");
        this.takeMeToScore (this.selectedInterview);
      }
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while saving the data, please try again");
    }
  }
  validateInputs(){
    if(this.selectedHospitalDoc.size.toLowerCase()!="na" && isNaN(Number(this.selectedHospitalDoc.size))){
      this.toastr.info("Size of hospital can be either in numbers or NA");
      return false;
    }
    return true;
  }

  async submitScore(){
    try{
      if(this.validateScores()){
        if (this.selectedInterview.isScoreSubmitted)
          await this.dbService.updateScore(this.selectedScoreDoc, this.selectedInterview.HId, this.selectedInterview.PId, this.selectedInterview.UId);
        else
          await this.dbService.submitScore(this.selectedScoreDoc);
        this.toastr.success("Your scores has been saved successfully");
        await this.takeMeToList();
      }
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while saving data, please try again");
    }
  }
  
  validateScores(){
    for(let id in this.selectedScoreDoc.Scores){
      let factor = this.selectedScoreDoc.Scores[id];
    }
    return true;
  }

  takeMeToRankOrder(){
    this.loading = true;
    this.landing = "rankorder";
    this.getRankedInterviews();
    if (this.rankedInterviews.length==0)
    {
      this.toastr.info("Please fill scores for atleast 1 of the programs first");
      this.takeMeToList();
      return;
    }
    this.loading = false;
  }

  takeMeToSummary(){
    this.loading = true;
    this.landing = "summary";
    this.getRankedInterviews();
    if (this.rankedInterviews.length==0)
    {
      this.toastr.info("Please fill scores for atleast 1 of the programs first");
      this.takeMeToList();
      return;
    }
    this.loading = false;
  }

  getRankedInterviews(){
    this.rankedInterviews = [];
    for(let interview of this.interviews){
      if (interview.isScoreSubmitted){
        interview.OverallScore = this.calculateOverallScore(interview);
        this.rankedInterviews.push(interview); 
      }
    }
    this.rankedInterviews.sort((a, b) => {
      return b.OverallScore - a.OverallScore;
    });
  }

  calculateOverallScore(interview){
    let overallScore = 0;
    for(let factor of this.dataObject.factors){
      if (factor.AttrId in interview.scoreDoc.Scores) 
        overallScore += ((factor.Value*interview.scoreDoc.Scores[factor.AttrId].Score)/100);
    }
    for(let factor of this.dataObject.userFactors){
      if (factor.AttrId in interview.scoreDoc.Scores) 
        overallScore += ((factor.Value*interview.scoreDoc.Scores[factor.AttrId].Score)/100);
    }
    //return overallScore;
    return Math.round((overallScore + Number.EPSILON) * 100) / 100;
  }

  exportRanksToExcel(): void 
    {
      if(this.rankedInterviews.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = "Rank Ordered List.xlsx";
       /* table id is passed over here */   
       let element = document.getElementById('rank-table'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }
    exportSummaryToExcel(): void 
    {
      if(this.rankedInterviews.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = "Summary.xlsx";
       /* table id is passed over here */   
       let element = document.getElementById('summary-table'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }

}
