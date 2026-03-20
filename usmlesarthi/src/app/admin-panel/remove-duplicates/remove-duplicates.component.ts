import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HospitalService } from '../../common/hospital.service';
import { AuthenticationService } from '../../common/authentication.service';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-remove-duplicates',
  templateUrl: './remove-duplicates.component.html',
  styleUrls: ['./remove-duplicates.component.scss']
})
export class RemoveDuplicatesComponent implements OnInit {
  dataObject: any = {};
  programObject: any;
  specialities: any = {};
  loading: boolean = false;
  hospitals : any = [];
  hospitalsObject: any = {};
  
  constructor(private dbService: AdminServicesService, private toastr: ToastrService, public authService: AuthenticationService, public hospitalApi: HospitalService) { }

  async ngOnInit() {
    try{
      this.loading = true;
      this.resetDataObject();
      this.programObject = await this.dbService.getProgramObject();
      this.specialities = Object.values(this.programObject);
      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching specialities, please try again");
    }
  }

  async loadHospitals(event) {
    try{
      let pid      = event.target.value;
      this.loading = true;
      this.hospitalsObject = await this.hospitalApi.getHospitalsObjectByProgram(pid);
      this.hospitals = Object.values(this.hospitalsObject);
      this.hospitals.sort( function (a, b) {
        var x = a.HName.toLowerCase();
        var y = b.HName.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
      });

      this.loading = false;
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while fetching programs, please try again");
    }
  }

  async fillData(){
    try{
      if(this.validateInputs()){
        await this.dbService.replaceHospital(this.dataObject.PId, this.dataObject.fromHId, this.dataObject.toHId, this.hospitalsObject[this.dataObject.fromHId], this.hospitalsObject[this.dataObject.toHId]);
        this.resetDataObject();
        this.toastr.success("Data has been changed successfully");
      }
    }
    catch(err){
      console.log(err);
      this.toastr.error("Error while saving the data, please try again");
    }
  }
  validateInputs(){
    if(this.dataObject.PId==""){
      this.toastr.info("Please select a speciality");
      return false;
    }
    if(this.dataObject.fromHId===""){
      this.toastr.info("Please choose a duplicate hospital first");
      return false;
    }
    if(this.dataObject.toHId===""){
      this.toastr.info("Please choose an original hospital first");
      return false;
    }
    if(this.dataObject.fromHId===this.dataObject.toHId)
    {
      this.toastr.info("Please choose separate hospitals in both the dropdowns");
      return false;
    }
    return true;
  }

  resetDataObject(){
    this.dataObject = {
      PId : "",
      fromHId : "",
      toHId: ""
    }
  }

}
