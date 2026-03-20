import { Component, OnInit } from '@angular/core';

import { AdminServicesService } from '../services/admin-services.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../common/authentication.service';
import { isInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-roldata',
  templateUrl: './roldata.component.html',
  styleUrls: ['./roldata.component.scss']
})
export class ROLDataComponent implements OnInit {
  dataObject: any = {};
  programObject: any;
  specialities: any = {};
  loading: boolean = false;
  hospitals : any = [];
  constructor(private dbService: AdminServicesService, private toastr: ToastrService, public authService: AuthenticationService) { }

  async ngOnInit() {
    try{
      this.loading = true;
      this.resetDataObject();
      this.programObject = await this.dbService.getProgramObject();
      this.specialities = Object.values(this.programObject);
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching specialities, please try again");
    }
  }

  async loadHospitals(event) {
    try{
      let pid      = event.target.value;
      this.loading = true;
      this.hospitals = await this.dbService.getHospitalsByProgram(pid);
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching programs, please try again");
    }
  }

  async fillData(){
    try{
      if(this.validateInputs()){
        await this.dbService.addRolData(this.dataObject);
        this.resetDataObject();
        this.toastr.success("Data has been saved successfully");
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
    if(this.dataObject.HId==""){
      this.toastr.info("Please choose a hospital first");
      return false;
    }
    if(this.dataObject.size.toLowerCase()!="na" && isNaN(Number(this.dataObject.size))){
      this.toastr.info("Size of hospital can be either in numbers or NA");
      return false;
    }
    return true;
  }

  resetDataObject(){
    this.dataObject = {
      PId : "",
      HId : "",
      UId : this.authService.userData.uid,
    }
  }

}
