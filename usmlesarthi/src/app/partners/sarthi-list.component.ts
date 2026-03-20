import {
  Component,
  OnInit
} from '@angular/core';
import * as XLSX from 'xlsx'; 
import {
  SarthiListService
} from './services/sarthi-list.service';
import {
  ProgramService
} from '../common/program.service';
import {
  Program
} from '../models/program';
import {
  HospitalService
} from '../common/hospital.service';
import {
  HospitalFormData
} from '../models/hospital-form-data';
import {
  Visa
} from '../models/visa';
import { HttpClient } from '@angular/common/http';
import {
  ToastrService
} from 'ngx-toastr';
import { AuthenticationService } from '../common/authentication.service';

export const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

@Component({
  selector: 'app-sarthi-list',
  templateUrl: './sarthi-list.component.html',
  styleUrls: ['./sarthi-list.component.scss']
})
export class PartnersComponent implements OnInit {
  loading: boolean;
  landing: string;
  showTab: string;
  showAlert: boolean;
  userProfile: any = {
    uid: 8,
    Step1Score: 210,
    Step2Score: 210,
    USCE: 6,
    YOG: 1,
    Visas: [1],
  }
  visaObject: any = {};

  constructor(private dbservice: SarthiListService, private programApi: ProgramService, private hospitalApi: HospitalService, private toastr: ToastrService,  private http: HttpClient,private authService: AuthenticationService) {
    this.showTab = "Others";
    this.showAlert = false;
  }

  async ngOnInit() {
    try {
      this.userProfile = await this.authService.userData;
      console.log("this.userProfile--->",this.userProfile)
      if (this.userProfile.Locked === "0") {
        this.toastr.info("Please navigate to your profile(on top right) and complete the form");
        this.landing = "";
        this.loading = true;
      } else {
        console.log("===============>")
        await this.takeMeToSpeciality();
        this.visaObject = await this.dbservice.getVisaObject();
      }
    } catch (err) {
      this.loading = true;
      this.toastr.error("Error while fetching hospitals data, please try again");
    }

  }
  async takeMeToSpeciality() {

  }
  async claimDiscount() {
    const redirectUrl = "https://www.residencyprogramslist.com/";
    this.http.get(`https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/claimDiscount?email=${this.userProfile.email}`)
  .subscribe((res: any) => {
    if (res === true || res.success === true) {
      window.location.href = "https://www.residencyprogramslist.com/";
    } else {
      alert("Discount registration failed.");
    }
  }, err => {
    console.error("Error:", err);
    alert("Failed to reach discount API.");
  });
  }

 
}
