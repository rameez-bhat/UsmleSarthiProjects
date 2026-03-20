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
import * as XLSX from 'xlsx'; 
import { RankOrderServicesService } from '../../rank-order-list/services/rank-order-services.service';

@Component({
  selector: 'app-users-rol',
  templateUrl: './users-rol.component.html',
  styleUrls: ['./users-rol.component.scss']
})
export class UsersRolComponent implements OnInit {
  loading: boolean;
  users: any;
  usersList: any = [];
  landing: any;
  selectedUser: any = {};
  programObject: any = {};
  interviews : any = [];
  rankedInterviews : any = [];
  dataObject : any = {};

  constructor(private dbService: AdminServicesService, private toastr: ToastrService, private interviewService : RankOrderServicesService) {
    this.loading = false;
  }

  async ngOnInit() {
    this.loading = true;
    this.landing = "list";
    this.loading = false;
  }

  async makeDataObjectReady(){
    this.dataObject = {
      factors : [],
      userFactors: [],
    }
    await Promise.all([this.interviewService.getUserFactors(this.selectedUser.uid), this.interviewService.getUserWeights(this.selectedUser.uid)]).then(result =>{
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
    });
    return;
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

  async takeMeToUserProfile(user, type='rol'){
    try{
      this.loading = true;
      this.selectedUser = user;
      let programObject = this.dbService.getProgramObject();
      let interviewsObject = this.interviewService.getInterviewsByUId(user.uid);//For now it is giving me all the interviews
      let results = await Promise.all([interviewsObject, programObject]);
      this.interviews = Object.values(results[0]);
      this.programObject = results[1];
      await this.makeDataObjectReady();
      if (type==="summary")
      this.takeMeToSummary();
      else
      this.takeMeToRankOrder();
      this.loading = false;
    }catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching user's profile, please try again");
    }
  }

  takeMeToRankOrder(){
    this.loading = true;
    this.landing = "rankorder";
    this.getRankedInterviews();
    if (this.rankedInterviews.length==0)
    {
      this.toastr.info("No ranked interviews for the user");
      this.landing = 'list';
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
      this.landing = 'list';
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
      let fileName = `ROL ${this.selectedUser.displayName}.xlsx`;
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