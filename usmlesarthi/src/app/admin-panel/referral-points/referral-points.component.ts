import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-referral-points',
  templateUrl: './referral-points.component.html',
  styleUrls: ['./referral-points.component.scss']
})
export class ReferralPointsComponent implements OnInit {
  loading: boolean = false;
  landing: string  = "";
  usersList: any = [];
  seeAll: boolean = false;
  constructor(private toastr: ToastrService, private dbService: AdminServicesService) { }

  async ngOnInit() {
    this.loading = true;
    this.landing = "list";
    this.loading = false;
  }

  async fetchSome(code){
    if(code==""){
      this.toastr.info("Please write the referral code in the input");
      return;
    }
    try{
      this.usersList = [];
      this.loading = true;
      this.usersList = Object.values(
        await this.dbService.getReferralUser(code),
      );
      this.seeAll  = false;
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching users, please try again");
    }
  }

  async fetchAll(){
    try{
      this.usersList = [];
      this.loading = true;
      this.usersList = Object.values(
        await this.dbService.getAllReferralCodes(),
      );
      this.seeAll = true;
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching users, please try again");
    }
  }

  async updateReferralPoints(user){
    try{
      await this.dbService.updatePoints(user.uid, user.referral.points);
      this.toastr.success("Points updated");
    }
    catch(err){
      console.log(err);
      this.toastr.error("Could not update the points");
      this.fetchSome(user.referral.code);
    }
  }

  exportToExcel(): void 
    {
      if(this.usersList.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = `ReferralData.xlsx`;
       /* table id is passed over here */   
       let element = document.getElementById(`Referral-List`); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }
}
