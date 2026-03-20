import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AdminServicesService } from "../services/admin-services.service";
import * as XLSX from "xlsx";

@Component({
  selector: "app-interviews-data",
  templateUrl: "./interviews-data.component.html",
  styleUrls: ["./interviews-data.component.scss"],
})
export class InterviewsDataComponent implements OnInit {
  interviewsList: any = [];
  filteredInterviewsList: any = [];
  interviewsData: any = {};
  programObject: any = {};
  visaObject: any = {};
  loading: boolean = false;
  emails: any = [];
  selectedEmails = [];
  customVisa: any = {
    "1": { Type: "GC/US citizen/H4 EAD", VId: "1" },
    "2": { Type: "Need H1", VId: "2" },
    "3": { Type: "Need J1", VId: "3" },
    "4": { Type: "Other", VId: "4" },
  };
  constructor(
    public adminService: AdminServicesService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {}

  async fetchInterviews() {
    try {
      this.loading = true;
      let result = await Promise.all([
        this.adminService.getProgramObject(),
        this.adminService.getAllInterviewsData(),
        this.adminService.getVisaObject(),
        this.adminService.getAllInterviewsInfo(),
      ]);
      this.programObject = result[0];
      this.interviewsList = result[1];
      this.visaObject = result[2];
      this.interviewsData = result[3];
      for (let interview of this.interviewsList) {
        let key = interview.HId + "." + interview.PId + "." + interview.UId;
        interview.data = this.interviewsData[key]
          ? this.interviewsData[key]
          : {};
      }
      this.filteredInterviewsList = [...this.interviewsList];
      this.emails = [
        ...new Set(
          this.interviewsList.map((interview) => interview.user.email)
        ),
      ];
      this.loading = false;
    } catch (err) {
      console.log(err);
      this.toastr.error("Error while fetching interviews, please try again");
    }
  }

  async filterInterviews() {
    this.filteredInterviewsList = this.interviewsList.filter((interview) => {
      let include = true;
      if (this.selectedEmails.length)
        include =
          include && this.selectedEmails.indexOf(interview.user.email) != -1;
      return include;
    });
  }

  exportInterviewsToExcel(): void {
    if (this.interviewsList.length == 0) {
      this.toastr.info("You cannot export an empty table");
      return;
    }
    let fileName = "InterviewsList.xlsx";
    /* table id is passed over here */
    let element = document.getElementById("Interviews-List");
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, fileName);
  }
}
