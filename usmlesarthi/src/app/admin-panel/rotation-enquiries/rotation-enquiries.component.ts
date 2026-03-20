import { Component, OnInit } from '@angular/core';
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

  constructor(private dbService: AdminServicesService, private toastr: ToastrService) { }

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

  async generateReport(status: string){
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
  }

  exportRotationsToExcel(fileName): void 
    {
      if(this.lastEnquiries.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
       /* table id is passed over here */   
       let element = document.getElementById('Last-Queries-List'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
    }

}
