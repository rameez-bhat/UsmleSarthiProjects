import {
  Component,
  OnInit,NgZone,ChangeDetectorRef
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
  constructor(private dbService: AdminServicesService, private toastr: ToastrService, private interviewsApi: InterviewInsightsService, private programApi: ProgramService,private ngZone: NgZone,private cdr: ChangeDetectorRef) {
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
      console.log("this.users=====>",this.users)
      this.usersList = Object.values(this.users);
      for (let i in this.usersList) {
        this.usersList[i].newRole = "";
      }
      this.loading = false;
    } catch (err) {
      this.toastr.error("Error while fetching users list, please try again");
    }
    this.ngZone.run(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
  parseInterviewDate(value: any): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Support Firestore Timestamp
  if (typeof value.toDate === 'function') {
    const date = value.toDate();
    return isNaN(date.getTime()) ? null : date;
  }

  let dateString = String(value).trim();

  // Fix malformed 5-digit year, e.g. 32026 -> 2026
  dateString = dateString.replace(
    /\b\d(?=\d{4}$)/,
    ''
  );

  const date = new Date(dateString);

  return isNaN(date.getTime()) ? null : date;
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
  /*async seeInterviews(uid){
    try{
      this.loading = true;
      this.landing = "list";
      this.interviews = await this.interviewsApi.getInterviewsByUId(uid);
      this.programObject= await this.programApi.getProgramObject();
      this.interviewsList = Object.values(this.interviews);
      console.log("this.interviewsList====>",this.interviewsList)
      this.interviewsList.sort((a, b)=> new Date(a.Date).getTime() - new Date(b.Date).getTime());
      console.log("this.interviewsList1====>",this.interviewsList)
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

  }*/
 async seeInterviews(uid: any) {
  try {
    this.loading = true;
    this.landing = "list";

    this.interviews = await this.interviewsApi.getInterviewsByUId(uid);
    this.programObject = await this.programApi.getProgramObject();

    this.interviewsList = Object.values(this.interviews || {});

    this.interviewsList = this.interviewsList.map((interview: any) => {
      const date = this.parseInterviewDate(interview.Date);

      return {
        ...interview,
        newDate: date
          ? {
              day: date.getDate(),
              month: date.getMonth() + 1,
              year: date.getFullYear()
            }
          : null
      };
    });

    this.interviewsList.sort((a: any, b: any) => {
      const dateA = this.parseInterviewDate(a.Date);
      const dateB = this.parseInterviewDate(b.Date);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateA.getTime() - dateB.getTime();
    });

    console.log("Sorted Interviews:", this.interviewsList);

    if (this.interviewsList.length === 0) {
      this.toastr.info(
        "This user currently has not added any interviews yet"
      );
      this.landing = "users";
    }

  } catch (err) {
    console.error(err);

    this.toastr.error(
      "Error while fetching user's interviews, please try again"
    );

  } finally {
    this.loading = false;
  }
  this.ngZone.run(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
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
