import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-rotation-enquiries',
  templateUrl: './rotation-enquiries.component.html',
  styleUrls: ['./rotation-enquiries.component.scss']
})
export class RotationEnquiriesComponent implements OnInit {
  loading : boolean = true;
  enquiries : any = [];
  filter : any = "Pending";
  selected : any = {};
  message : any = "";
  selectEnquiryNo : any = "";
  filteredEnquiries : any = [];
  locations : any = [];
  selectedLocation: any = '';
  lastEnquiries : any = [];
  reportDateFrom : any;
  reportDateTo: any;

  constructor(private dbService: AdminServicesService, private toastr: ToastrService,private ngZone: NgZone,
      private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    await this.updateList ();
  }

  async updateList (){
    console.log("------>Search")
    try {
      this.loading = true;
      if (this.filter==="Pending")
        this.enquiries = await this.dbService.getRotationQueries (this.filter);
      else
        this.enquiries = await this.dbService.getRotationQueries ();
      this.filteredEnquiries = this.enquiries;
      let locationsCodes = {};
      for (let enquire of this.enquiries)
        locationsCodes[enquire.rotation.location_code] = 1;
      this.locations = Object.keys(locationsCodes);
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching queries. Please try again")
    }
    this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
  async SearchByEnquiryNo (SelYear,SelEnqNo){
    try {
      this.loading = true;

      this.enquiries = await this.dbService.getRotationQueriesEnquirySearch (SelYear,SelEnqNo);
      this.filteredEnquiries = this.enquiries;
      let locationsCodes = {};
      for (let enquire of this.enquiries)
        locationsCodes[enquire.rotation.location_code] = 1;
      this.locations = Object.keys(locationsCodes);
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching queries. Please try again")
    }
  }

  async changeFilter (){
    if (this.filter==="Pending")
      this.filter = "All";
    else
      this.filter = "Pending";
    this.updateList ();
  }

  applyLocationFilter (TypeE){
    this.selected = {};
    if(TypeE=="LocationCodeSearch")
    {
      if (!this.selectedLocation)
        this.filteredEnquiries = this.enquiries;
      else
        this.filteredEnquiries = this.enquiries.filter(en => en.rotation.location_code===this.selectedLocation);
    }
    else if(TypeE=="EnquiryNoSearch")
    {
      if(this.selectEnquiryNo.trim()=="")
      {
        this.toastr.error("Please Enter Enquiry No");
      }
      else
      {
        let enquiryNo = this.selectEnquiryNo.toString(); 
        let YearSel = enquiryNo.substring(0, 4); 
        let EnqNo = enquiryNo.substring(4);
        let res=  this.SearchByEnquiryNo(YearSel,EnqNo);
      }
      
    }
   
  }

  async updateState (index, status) {
    try{
      await this.dbService.updateEnquiry (this.filteredEnquiries[index].id, this.filteredEnquiries[index].status, this.filteredEnquiries[index].query);
      this.toastr.success("Query updated");
      this.updateList ();
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while updating queries");
    }

  }

  toggleSelect (index) {
    if (!!this.selected[index])
      delete this.selected[index];
    else
      this.selected[index] = 1;
  }

  actionOnAll (type)   {
    if (type === "select")
    {
      for(let index in this.filteredEnquiries)
        this.selected[index] = 1; 
    }
    else
      this.selected = {};
  }

  async updateSelected (newStatus) {
    this.loading = true;
    const docIds = [];
    for(let index of Object.keys(this.selected))
      docIds.push(this.filteredEnquiries[index].id);
    await this.dbService.updateEnquiryBatch(docIds, newStatus, this.message);
    this.selected = {};
    this.message  = "";
    this.selectedLocation = "";
    this.updateList();
    this.loading = false;
  }

  totalSelected () {
    return Object.keys(this.selected).length;
  }

async generateReport(status: string) {

  if (this.loading) {
    return;
  }

  if (!this.reportDateFrom || !this.reportDateTo) {
    this.toastr.error("Please select From and To dates");
    return;
  }

  try {
    this.loading = true;

    const from = this.reportDateFrom;
    const to = this.reportDateTo;

    const fromTimestamp = Date.UTC(
      from.year,
      from.month - 1,
      from.day
    );

    // Exclusive upper bound: midnight after selected To date.
    const toTimestamp = Date.UTC(
      to.year,
      to.month - 1,
      to.day + 1
    );

    if (fromTimestamp >= toTimestamp) {
      this.toastr.error("Invalid date range");
      return;
    }

    console.time("Report fetch");

    this.lastEnquiries =
      await this.dbService.getRotationEnquiriesReport(
        status,
        fromTimestamp,
        toTimestamp - 1
      );

    console.timeEnd("Report fetch");

    if (!this.lastEnquiries.length) {
      this.toastr.info("No enquiries found");
      return;
    }

    const fileName =
      `Rotation_Enquiries_${from.year}-${from.month}-${from.day}` +
      `_to_${to.year}-${to.month}-${to.day}_${status}.xlsx`;

    this.exportRotationsToExcel(fileName);

  } catch (error) {
    console.error("Report generation failed:", error);

    this.toastr.error(
      "Error generating report. Please try again."
    );

  } finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}

  /*async generateReport(status: string){
    try{
      this.loading = true;
      const daysFrom = new Date(Date.UTC(this.reportDateFrom.year, this.reportDateFrom.month - 1, this.reportDateFrom.day));
      const daysTo = new Date(Date.UTC(this.reportDateTo.year, this.reportDateTo.month - 1, this.reportDateTo.day));
      if (status==="all"){
        this.lastEnquiries = await this.dbService.getRecentRotationQueriesForAllStatus(daysFrom.getTime(), daysTo.getTime())
        setTimeout(() => this.exportRotationsToExcel(`${daysFrom.toDateString()}-${daysTo.toDateString()}-${status}.xlsx`), 1000);
      }
      else{
        this.lastEnquiries = await this.dbService.getRecentRotationQueries(status, daysFrom.getTime(), daysTo.getTime());
        setTimeout(() => this.exportRotationsToExcel(`${daysFrom.toDateString()}-${daysTo.toDateString()}-${status}.xlsx`), 1000);
      }
      this.loading =false;
    }
    catch(err){
      this.loading =false;
      console.log(err.message);
      this.toastr.error("Error while fetching payments, please try again");
    }
  }*/
  async getRecentRotationQueries(
  status: string,
  fromDateTime: number,
  toDateTime: number
) {
  return this.dbService.getRotationEnquiriesReport(
    status,
    fromDateTime,
    toDateTime
  );
}

async getRecentRotationQueriesForAllStatus(
  fromDateTime: number,
  toDateTime: number
) {
  return this.dbService.getRotationEnquiriesReport(
    "all",
    fromDateTime,
    toDateTime
  );
}

  

exportRotationsToExcel(fileName: string): void {
  try {
    if (!this.lastEnquiries || this.lastEnquiries.length === 0) {
      this.toastr.info("You cannot export an empty table");
      return;
    }

    const exportData = this.lastEnquiries.map(
      (enquiry: any, index: number) => ({
        "S.No": index + 1,

        "Enquiry No":
          String(enquiry.inquiryYear || "") +
          String(enquiry.inquiryID || ""),

        "Date": enquiry.timestamp || "",

        "Status": enquiry.status || "",

        "User Name":
          enquiry.user && enquiry.user.displayName
            ? enquiry.user.displayName
            : "",

        "User Email":
          enquiry.user && enquiry.user.email
            ? enquiry.user.email
            : "",

        "Rotation":
          enquiry.rotation && enquiry.rotation.title
            ? enquiry.rotation.title
            : "",

        "Location Code":
          enquiry.rotation && enquiry.rotation.location_code
            ? enquiry.rotation.location_code
            : "",

        "Start Date": enquiry.startDate || "",

        "Query": enquiry.query || "",

        "Reply": enquiry.replyquery || ""
      })
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    ws["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 35 },
      { wch: 18 },
      { wch: 15 },
      { wch: 60 },
      { wch: 60 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Rotation Enquiries"
    );

    XLSX.writeFile(wb, fileName);

    this.toastr.success("Report exported successfully");

  } catch (error) {
    console.error("Excel export error:", error);
    this.toastr.error("Failed to export Excel report");
  }
}



}
