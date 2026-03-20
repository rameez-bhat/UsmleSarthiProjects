import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-housing-enquiries',
  templateUrl: './housing-enquiries.component.html',
  styleUrls: ['./housing-enquiries.component.scss']
})
export class HousingEnquiriesComponent implements OnInit {
  loading : boolean = true;
  enquiries : any = [];
  filter : any = "Pending";

  constructor(private dbService: AdminServicesService, private toastr: ToastrService) { }

  async ngOnInit() {
    await this.updateList ();
  }

  async updateList (){
    try {
      this.loading = true;
      if (this.filter==="Pending")
        this.enquiries = await this.dbService.getHousingQueries (this.filter);
      else
        this.enquiries = await this.dbService.getHousingQueries ();
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

  async updateState (index) {
    try{
      await this.dbService.updateHousingEnquiry (this.enquiries[index].id, this.enquiries[index].status, this.enquiries[index].query);
      this.toastr.success("Query updated");
      this.updateList ();
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while updating queries");
    }

  }

}
