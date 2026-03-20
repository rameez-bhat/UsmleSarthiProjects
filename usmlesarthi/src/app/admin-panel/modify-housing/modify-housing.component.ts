import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-modify-housing',
  templateUrl: './modify-housing.component.html',
  styleUrls: ['./modify-housing.component.scss']
})
export class ModifyHousingComponent implements OnInit {
  loading: boolean = false;
  landing: string  = "";
  rotationsList: any = [];
  selectedRotation: any = {};
  addNew: boolean = false;
  newRotation: any   = {};
  query: any = "";
  constructor(private toastr: ToastrService, private dbService: AdminServicesService) { }

  async ngOnInit() {
    this.loading = true;
    this.resetnewRotation();
    this.landing = "list";
    this.loading = false;
  }

  async fetchSome(rotation){
    if(rotation==""){
      this.toastr.info("Please write some prefix of housing's name, city or state in the input");
      return;
    }
    try{
      this.rotationsList = [];
      this.loading = true;
      this.landing = "list";
      this.rotationsList = Object.values(await this.dbService.getSomeHousings(rotation));
      this.query = rotation;
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching housings, please try again");
    }
  }

  async takeMeToList (){
    if (this.query){
      await this.fetchSome (this.query);
    }
    else{
      this.rotationsList = [];
      this.landing = 'list';
    }
  }

  async takeMeToRotation(rotation){
    try{
      this.loading = true;
      this.selectedRotation = { ...rotation};
      this.landing = 'rotation';
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while getting information about the housing, please try again");
    }
  }

  async updateRotation(){
    if( this.validateRotation(this.selectedRotation) ){
      try{
        await this.dbService.updateHousing(this.selectedRotation);
        this.toastr.success("The housing has been updated");
        await this.fetchSome(this.query);
      }
      catch(err){
        console.log(err.message);
        this.toastr.error("Error while saving the changes, please try again");
      }
    }
  }


  async addNewRotation(){
    if( this.validateRotation(this.newRotation) ){
      try{
        await this.dbService.addNewHousing(this.newRotation);
        this.toastr.success("New Housing has been added");
        this.resetnewRotation();
      }
      catch(err){
        console.log(err.message);
        this.toastr.error("Error while adding new housing, please try again");
      }
    }
  }

  validateRotation(dataObject){
    function camlize (string:string){
      string.replace("_", " ");
      return string[0].toUpperCase () + string.substr(1).toLowerCase ();
    }
    let toCheck = ["title", "city", "state", "zipCode", "rent", 
    "policy", "common",  "features", "size", "bathroom", 'minStay', 'utilities'];
    for (let key of toCheck){
        if (typeof dataObject === "string"){
        let data = dataObject[key] && dataObject[key].trim ();
        let label = camlize  (key);
        if (data==="" ){
          this.toastr.info (`Housing ${label} cannot be empty`);
          return false;
        }
      }
    }
    return true;
  }

  async deleteRotation (rotation){
    try{
      await this.dbService.deleteHousing (rotation);
      this.toastr.success ("Deleted");
      this.rotationsList = this.rotationsList.filter((item) => item.housingId!=rotation.housingId);
    }
    catch (err){
      console.log(err);
      this.toastr.error("Error while performing action, Please try again")
    }
  }

  resetnewRotation(){
    this.addNew = false;
    this.newRotation =  {
      title: "",
      state: "",
      city: "",
      zipCode : "",
      rent : "",
      bathroom : "",
      minStay : "",
      size : "",
      utilities : "",
      common: "",
      features : "",
      policy  : "",
    }
  }


}
