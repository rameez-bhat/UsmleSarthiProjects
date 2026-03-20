import { Component, OnInit } from '@angular/core'

import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-meeting-notes',
  templateUrl: './meeting-notes.component.html',
  styleUrls: ['./meeting-notes.component.scss']
})
export class MeetingNotesComponent implements OnInit {
  paymentsData : any = [];
  loading : boolean = false;
  allLandings : any = ['Meeting', 'Match Plan'];
  landing: any = "";
  constructor(public adminService:  AdminServicesService, public toastr: ToastrService) { }

  ngOnInit() {
    this.landing="Meeting";
  }

  takeMeTo(newLanding){
    this.landing=newLanding;
  }

  async fetchPaymentsData () {
    try { 
      this.loading = true;
      let result = await Promise.all([this.adminService.getMeetingNotes()]);
      const notes : any[] = Object.values(result[0]);
      for(var user of notes){
        const meetingNotes = [];
        if (user['notes']){
          user['adminNotes'] = user['notes']['adminNotes'] || '';
          delete user['notes']['adminNotes']
        }
        for(const year in user['notes'])
        {
          for(const month in user['notes'][year])
            meetingNotes.push({
              year,
              month,
              ...user['notes'][year][month]
            })
        }
        user.meetingNotes = meetingNotes;
      }
      this.paymentsData = notes;
      console.log(this.paymentsData)
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


