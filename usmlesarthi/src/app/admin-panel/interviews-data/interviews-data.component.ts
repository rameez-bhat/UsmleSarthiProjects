import { Component, OnInit, NgZone, ChangeDetectorRef } from "@angular/core";
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
  interviewDateFrom: string = "";
interviewDateTo: string = "";
deletingInterviewId: string = "";
  customVisa: any = {
    "1": { Type: "GC/US citizen/H4 EAD", VId: "1" },
    "2": { Type: "Need H1", VId: "2" },
    "3": { Type: "Need J1", VId: "3" },
    "4": { Type: "Other", VId: "4" },
  };
  constructor(
    public adminService: AdminServicesService,
    public toastr: ToastrService,private ngZone: NgZone,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}
async deleteInterview(interview: any): Promise<void> {
  if (!interview || !interview.id) {
    this.toastr.error("Invalid interview selected");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this interview?\n\n" +
    "Hospital: " + (interview.hospital ? interview.hospital.HName : "") +
    "\nEmail: " + (interview.user ? interview.user.email : "") +
    "\nInterview Date: " + interview.Date +
    "\n\nThis action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  this.deletingInterviewId = interview.id;

  try {
    await this.adminService.deleteInterview(interview);

    this.ngZone.run(() => {
      // Remove from original list
      this.interviewsList = this.interviewsList.filter(
        item => item.id !== interview.id
      );

      // Reapply existing email and date filters
      this.filterInterviews();

      this.deletingInterviewId = "";
      this.cdr.detectChanges();
    });

    this.toastr.success("Interview deleted successfully");

  } catch (error) {
    console.error("Error deleting interview:", error);

    this.toastr.error(
      error && error.message
        ? error.message
        : "Unable to delete interview"
    );

    this.deletingInterviewId = "";
  }
}
  async fetchInterviews() {
    try {
      this.loading = true;
      let result = await Promise.all([
        this.adminService.getProgramObject(),
        this.adminService.getAllInterviewsData(),
        this.adminService.getVisaObject(),
        this.adminService.getAllInterviewsInfo(),
      ]);
      console.log("here you are ")
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
      console.log("this.interviewsList=====>",this.interviewsList)
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
    this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  /*async filterInterviews() {
    this.filteredInterviewsList = this.interviewsList.filter((interview) => {
      let include = true;
      if (this.selectedEmails.length)
        include =
          include && this.selectedEmails.indexOf(interview.user.email) != -1;
      return include;
    });
  }*/
filterInterviews(): void {
  const fromDate = this.interviewDateFrom
    ? Date.parse(this.interviewDateFrom + "T00:00:00Z")
    : null;

  const toDateExclusive = this.interviewDateTo
    ? Date.parse(this.interviewDateTo + "T00:00:00Z") + 86400000
    : null;

  if (
    fromDate !== null &&
    toDateExclusive !== null &&
    fromDate >= toDateExclusive
  ) {
    this.toastr.warning("From Date cannot be after To Date");
    return;
  }

  this.filteredInterviewsList = this.interviewsList.filter(
    (interview) => {

      // Email filter
      if (
        this.selectedEmails.length &&
        this.selectedEmails.indexOf(
          interview.user ? interview.user.email : ""
        ) === -1
      ) {
        return false;
      }

      // Interview date filter
      if (fromDate !== null || toDateExclusive !== null) {
        const interviewTimestamp =
          interview.InterviewDateTimestamp;

        if (interviewTimestamp == null) {
          return false;
        }

        const interviewDate = Number(interviewTimestamp);

        if (!isFinite(interviewDate)) {
          return false;
        }

        if (
          fromDate !== null &&
          interviewDate < fromDate
        ) {
          return false;
        }

        if (
          toDateExclusive !== null &&
          interviewDate >= toDateExclusive
        ) {
          return false;
        }
      }

      return true;
    }
  );
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
