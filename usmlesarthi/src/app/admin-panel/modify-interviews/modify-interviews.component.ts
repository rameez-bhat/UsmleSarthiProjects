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
import { InterviewInsightsService } from '../../interview-insights/services/interview-insights.service';
import { ProgramService } from '../../common/program.service';

@Component({
  selector: 'app-modify-interviews',
  templateUrl: './modify-interviews.component.html',
  styleUrls: ['./modify-interviews.component.scss']
})
export class ModifyInterviewsComponent implements OnInit {
  loading: boolean;
  users: any;
  usersList: any = [];
  interviews: any = {};
  interviewsList: any = []; 
  landing: string;
  programObject: any = {};
  constructor(private dbService: AdminServicesService, private toastr: ToastrService, private interviewsApi: InterviewInsightsService, private programApi: ProgramService) {
    this.loading = false;
    this.landing = "users";
  }

  async ngOnInit() {
    this.loading = true;
    this.loading = false;
  }
  async fetchSome(userVal) {
    try {
      this.loading = true;
      this.users = await this.dbService.getSomeUsers(userVal);
      this.usersList = Object.values(this.users);
      for (let i in this.usersList) {
        this.usersList[i].newRole = "";
      }
      this.loading = false;
    } catch (err) {
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
  async seeInterviews(uid){
    try{
      this.loading = true;
      this.landing = "list";
      this.interviews = await this.interviewsApi.getInterviewsByUId(uid);
      this.programObject= await this.programApi.getProgramObject();
      this.interviewsList = Object.values(this.interviews);
      this.interviewsList.sort((a, b)=> new Date(a.Date).getTime() - new Date(b.Date).getTime());
      for(let i in this.interviewsList){
        let date = new Date(this.interviewsList[i].Date);
        this.interviewsList[i].newDate = { day: date.getDate(), month: date.getMonth()+1, year: date.getFullYear()};
      }
      if (this.interviewsList.length==0){
        this.toastr.info("This user currently has not added any interviews yet");
        this.landing="users";
      }
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching user's interviews, please try again");
    }

  }
  async saveNewDate(interview){
    try{
      await this.interviewsApi.saveNewDateInterview(interview);
      this.toastr.success("Changes have been made successfully");
      }
      catch(err){
        console.log(err);
        this.toastr.error("Error while changing date for the interview, please try again")
      }
  }
  async deleteInterview(interview){
    if (interview.ProvidedInfo=="Yes")
      this.toastr.info("You cannot delete this interview as the user has already filled info for this");
    else{
      try{
      await this.interviewsApi.deleteInterview(interview);
      delete this.interviews[interview.InterviewId];
      this.interviewsList = Object.values(this.interviews);
      this.toastr.success("The interview has been deleted successfully");
      }
      catch(err){
        this.toastr.error("Error while deleting the interview, please try again")
      }
    }
  }

  async clearInterview(interview){
    if (interview.ProvidedInfo==="No")
      this.toastr.info("User has not entered info yet, you cannot clear the data.");
    else{
      try {
        await this.dbService.clearInterviewData(interview);
        await this.seeInterviews(interview.UId)
        this.toastr.success("The interview's data has been cleared successfully");
      }
      catch(err){
        this.toastr.error("Error while clearing the data of the interview, please try again");
      }
    }
  }
}
