import { Component, OnInit } from '@angular/core';
import { AdminServicesService } from './services/admin-services.service';
import { ProgramService } from '../common/program.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../common/authentication.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  message: string;
  showAlert: boolean = false;
  adminLandings = ["Verify Data", "Assign Hospitals", "Assign Roles", "Modify Interviews", "Fill ROL Data", "Add/Modify Hospitals", "Add User Profiles", "See Interviews", "Interviews Data", "Rotation Enquiries", "Add/Modify Rotations", "Verify ROL Data", "Enrollments", "Modify Payments", "Referral Points", "Meeting Notes", "Users ROL", "Modify Housings", "Remove Duplicates", "Housing Enquiries", "Clean Medical Schools"];
  adminLinks  = ["verifyData", "assignHospitals", "assignRoles", "modifyInterviews", "rolData", "addHospitals", "addUserProfile", "seeInterviews", "interviewsData", "enquiries", "addRotations", "verifyRolData", "enrollments", "payments", "referrals", "meetnotes", "usersRol", "addHousings", "removeDuplicates", "housingEnquiries", "cleanMedicalSchools"];
  mentorLandings = [ "See Profiles", "Rotation Enquiries","Modify Housings",   "Add/Modify Rotations", "Meeting Notes", "Housing Enquiries"];
  mentorLinks  = [ "seeProfiles", "enquiries", "addHousings", "addRotations", "meetnotes", "housingEnquiries"];
  allLandings = [];
  routeLinks = [];
  userProfile: any;

  constructor(private dbService : AdminServicesService,  private programApi: ProgramService, private toastr: ToastrService, private authService: AuthenticationService) {
   }

  async ngOnInit() {
    this.userProfile = await this.authService.userData;
    if (this.userProfile.Role==="Mentor"){
      this.allLandings = this.mentorLandings;
      this.routeLinks = this.mentorLinks;
    }
    else{
      this.allLandings = this.adminLandings;
      this.routeLinks = this.adminLinks;
    }

    
    this.toastr.info("Choose a service from below");
  }
}
