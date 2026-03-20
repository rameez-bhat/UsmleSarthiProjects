import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-interviews-report',
  templateUrl: './interviews-report.component.html',
  styleUrls: ['./interviews-report.component.scss']
})
export class InterviewsReportComponent implements OnInit {
  interviewsList :any=[];
  programObject : any = {};
  visaObject: any = {}
  loading : boolean = false;
  customVisa: any =  {"1":{Type: "GC/US citizen/H4 EAD", VId:"1"},"2" :{Type:"Need H1", VId:"2"},"3": {Type:"Need J1", VId:"3"}, "4": {Type:"Other", VId:"4"}};
  constructor(public adminService:  AdminServicesService, public toastr: ToastrService) { }

  ngOnInit() {
  }

  async fetchInterviews () {

    try { 
      this.loading = true;
      let result = await Promise.all([this.adminService.getProgramObject(), this.adminService.getAllInterviews(), this.adminService.getVisaObject()]);
      this.programObject  = result[0];
      this.interviewsList = result[1];
      this.visaObject = result[2];

      for (let interview of this.interviewsList)
      {
        if (interview && interview.user && interview.user.Visas)
          interview.user.Visas = this.convertVisa(interview.user);
      }
      console.log("interviewsList--->",this.interviewsList)
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching interviews, please try again");
    }
  }


  exportInterviewsToExcel(): void 
    {
      if(this.interviewsList.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = "InterviewsList.xlsx";
       /* table id is passed over here */   
       let element = document.getElementById('Interviews-List'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }
    convertVisa(userData){
      let customVisas= {};
      if("Visas" in userData){
        for(let i in userData.Visas){
          let vid=  userData.Visas[i];
          if (vid=="7")
            customVisas["4"] = 1;
          else if (vid=="1" || vid=="6")
            customVisas["1"] = 1;
          else if (vid=="2")
            customVisas["2"] = 1;
          else if (vid=="3")
            customVisas["3"] = 1;
        }
      }
      let newVisas = Object.keys(customVisas);
      return newVisas;
    }

}
