import { Component, OnInit } from '@angular/core';
import { AdminServicesService } from '../services/admin-services.service';
import { ToastrService } from 'ngx-toastr';
import { medicalSchoolOptions } from '../../login/MedicalSchoolOptions';

@Component({
  selector: 'app-clean-medical-school',
  templateUrl: './clean-medical-school.component.html',
  styleUrls: ['./clean-medical-school.component.scss']
})
export class CleanMedicalSchoolComponent implements OnInit {
  loading: boolean;
  users: any;
  checkList: any = [];
  medicalSchoolOptionsObject: any = {};
  medicalSchoolOptions: string[] = medicalSchoolOptions || [];

  constructor(private dbService: AdminServicesService, private toastr: ToastrService) {
    this.loading = false;
  }

  async ngOnInit() {
    medicalSchoolOptions.forEach(school => this.medicalSchoolOptionsObject[school] = school)
  }

  async fetchAll() {
    try {
      this.loading = true;
      this.users = await this.dbService.getAllUsersWithMedicalSchool();
      this.checkList=  [];
      let done = 0;
      Object.values(this.users).forEach((user : any)=> {
        if (user.email && user.email.startsWith("virtual_user")){
          return;
        }
        if (!user.School || (user.medicalSchool && this.medicalSchoolOptionsObject[user.medicalSchool])){
          if (user.medicalSchool && this.medicalSchoolOptionsObject[user.medicalSchool]){
            done += 1;
          }
          return;
        }
        
        this.checkList.push(user);
      })
      this.loading = false;
    } catch (err) {
      this.toastr.error("Error while fetching users list, please try again");
    }
  }


  async saveSchool(user){
    try{
      if (!user.selectedMedicalSchool){
        this.toastr.error("Select a Medical School");
        return;
      }
      if (user.selectedMedicalSchool === "Other" && !user.otherMedicalSchool){
        this.toastr.error("Provide the name of the school");
        return;
      }
      const medicalSchoolName = user.selectedMedicalSchool === "Other" ? user.otherMedicalSchool : user.selectedMedicalSchool;
      await this.dbService.updateMedicalSchool(medicalSchoolName, user.uid);
      this.toastr.success("Success!")
    }catch (err) {
      console.log(err)
      this.toastr.error("Error while saving, please try again");
    }
  }

}
