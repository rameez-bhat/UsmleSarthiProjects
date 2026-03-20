import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-enrollment-mentor',
  templateUrl: './enrollment-mentor.component.html',
  styleUrls: ['./enrollment-mentor.component.scss']
})
export class EnrollmentMentorComponent implements OnInit {
  paymentsData : any = [];
  programObject : any = {};
  loading : boolean = false;
  allLandings : any = ['Enrollment', 'Mentor', 'Research', 'Rotations'];
  landing: any = "";
  customVisa: any =  {"1":{Type: "GC/US citizen/H4 EAD", VId:"1"},"2" :{Type:"Need H1", VId:"2"},"3": {Type:"Need J1", VId:"3"}, "4": {Type:"Other", VId:"4"}};
  constructor(public adminService:  AdminServicesService, public toastr: ToastrService) { }

  ngOnInit() {
    this.landing="Match";
  }

  takeMeTo(newLanding){
    this.landing=newLanding;
  }

  async fetchPaymentsData () {

    try { 
      this.loading = true;
      let result = await Promise.all([this.adminService.getProgramObject(), this.adminService.getEnrollments()]);
      this.programObject  = result[0];
      this.paymentsData = Object.values(result[1]);
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching payments, please try again");
    }
  }

  exportInterviewsToExcel(): void 
    {
      if(this.paymentsData.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = `${this.landing}Data.xlsx`;
       /* table id is passed over here */   
       let element = document.getElementById(`${this.landing}-List`); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }
  
  convertDateNumberToDateString(date):string
  {
    if (date){
      let utcDate = new Date(date);
      return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()).toDateString();
    }

    return ''
  }

}

