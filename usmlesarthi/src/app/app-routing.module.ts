import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AppComponent } from './app.component';
import { CrowdSourcingComponent } from './crowd-sourcing/crowd-sourcing.component';
import { InterviewInsightsComponent } from './interview-insights/interview-insights.component';
import { SarthiListComponent } from './sarthi-list/sarthi-list.component';
import { PartnersComponent } from './partners/sarthi-list.component';
import { RankOrderListComponent } from './rank-order-list/rank-order-list.component';
import { AuthGuard } from './common/auth-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';  
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AuthGuardAdmin } from './common/auth-guard-admin.service';
import { VerifyDataComponent } from './admin-panel/verify-data/verify-data.component';
import { AssignHospitalsComponent } from './admin-panel/assign-hospitals/assign-hospitals.component';
import { AssignRolesComponent } from './admin-panel/assign-roles/assign-roles.component';
import { HomeComponent } from './home/home.component';
import { ModifyInterviewsComponent } from './admin-panel/modify-interviews/modify-interviews.component';
import { AuthGaurdFeatureService } from './common/auth-gaurd-feature.service';
import { ObservershipComponent } from './observership/observership.component';
import { ROLDataComponent } from './admin-panel/roldata/roldata.component';
import { AddHospitalsComponent } from './admin-panel/add-hospitals/add-hospitals.component';
import { AddUserProfilesComponent } from './admin-panel/add-user-profiles/add-user-profiles.component';
import { AuthGuardProfileLock } from './common/auth-gaurd-profile-lock.service';
import { RotationsComponent } from './rotations/rotations.component';
import { InterviewsReportComponent } from './admin-panel/interviews-report/interviews-report.component';
import { InterviewsDataComponent } from './admin-panel/interviews-data/interviews-data.component';
import { RemoveDuplicatesComponent } from './admin-panel/remove-duplicates/remove-duplicates.component';
import { RotationEnquiriesComponent } from './admin-panel/rotation-enquiries/rotation-enquiries.component';
import { AddRotationsComponent } from './admin-panel/add-rotations/add-rotations.component';
import { VerifyRolDataComponent } from './admin-panel/verify-rol-data/verify-rol-data.component';
import { FaqsComponent } from './faqs/faqs.component';
import { EnrollmentMentorComponent } from './admin-panel/enrollment-mentor/enrollment-mentor.component';
import { ModifyPaymentsComponent } from './admin-panel/modify-payments/modify-payments.component';
import { AuthGuardProfile } from './common/auth-guard-profile.service';
import { ReferralPointsComponent } from './admin-panel/referral-points/referral-points.component';
import { MeetingNotesComponent } from './admin-panel/meeting-notes/meeting-notes.component';
import { SeeProfilesComponent } from './admin-panel/see-profiles/see-profiles.component';
import { UsersRolComponent } from './admin-panel/users-rol/users-rol.component';
import { HousingComponent } from './housing/housing.component';
import { ModifyHousingComponent } from './admin-panel/modify-housing/modify-housing.component';
import { HousingEnquiriesComponent } from './admin-panel/housing-enquiries/housing-enquiries.component';
import { CleanMedicalSchoolComponent } from './admin-panel/clean-medical-school/clean-medical-school.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { RotationAvailabilityComponent } from './rotationsavailability/rotationsavailability.component';
import { PaymentSuccessErrorComponent } from './paymentsuccesserror/paymentsuccesserror.component';
import { MatchComponent } from './match/match.component';
import { ResearchComponent } from './research/research.component';
import { MatchAvailabilityComponent } from './matchavailability/matchavailability.component';
import { ResearchAvailabilityComponent } from './researchavailability/researchavailability.component';
import { HousingAvailabilityComponent } from './housingavailability/housingavailability.component';

const appRoutes: Routes = [
  { path: 'crowdsourcing', component: CrowdSourcingComponent, canActivate: [AuthGuardProfileLock]},
  { path: 'interviews', component: InterviewInsightsComponent, canActivate: [AuthGuardProfileLock]},
  { path: 'sarthilist', component: SarthiListComponent, canActivate: [AuthGuardProfileLock]},
  { path: 'partnerslist', component: PartnersComponent, canActivate: [AuthGuardProfileLock]},
  { path: "rol", component: RankOrderListComponent, canActivate: [AuthGuardProfileLock] },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuardProfile] },
  { path: 'faqs', component: FaqsComponent, canActivate: [AuthGuardProfileLock]},  
  { path: "housing/:rotationcode", component: HousingComponent},
  { path: "housing", component: HousingComponent },
  { path: "home", component: HomeComponent },
  { path: "admin", component: AdminPanelComponent, canActivate: [AuthGuardAdmin], children:[
    {path: "verifyData", component:VerifyDataComponent},
    {path: "assignHospitals", component: AssignHospitalsComponent},
    {path: "assignRoles", component: AssignRolesComponent},
    {path: "modifyInterviews", component: ModifyInterviewsComponent},
    {path: "rolData", component: ROLDataComponent},
    {path: "addHospitals", component: AddHospitalsComponent},
    {path: "addUserProfile", component: AddUserProfilesComponent},
    {path: "seeInterviews", component: InterviewsReportComponent},
    {path: "interviewsData", component: InterviewsDataComponent},
    {path: "enquiries", component: RotationEnquiriesComponent},
    {path: "removeDuplicates", component: RemoveDuplicatesComponent},
    {path: "addRotations", component: AddRotationsComponent},
    {path: 'verifyRolData', component: VerifyRolDataComponent},
    {path: 'enrollments', component: EnrollmentMentorComponent},
    {path: 'payments', component: ModifyPaymentsComponent},
    {path: 'referrals', component: ReferralPointsComponent},
    {path: 'meetnotes', component: MeetingNotesComponent},
    {path: 'seeProfiles', component: SeeProfilesComponent},
    {path: 'usersRol', component: UsersRolComponent},
    {path: 'addHousings', component: ModifyHousingComponent},
    {path: 'housingEnquiries', component: HousingEnquiriesComponent},
    {path: 'cleanMedicalSchools', component: CleanMedicalSchoolComponent},
  ] },
  { path: 'usce', component: ObservershipComponent, canActivate: [AuthGuard]},
  { path: "authenticate", component: LoginComponent},
  { path: "privacy-policy", component: PrivacyPolicyComponent },
  { path: "rotations", component: RotationsComponent},
  { path: "rotations/:rotationcode", component: RotationsComponent },
  { path: "match", component: MatchComponent},
  { path: "research", component: ResearchComponent},
  { path: "rotationsavailability/:rotationcode/:viewtype", component: RotationAvailabilityComponent },
  { path: "matchavailability/:matchCode/:viewtype", component: MatchAvailabilityComponent },
  { path: "researchavailability/:matchCode/:viewtype", component: ResearchAvailabilityComponent },
  { path: "housingavailability/:housingcode/:viewtype", component: HousingAvailabilityComponent },
  { path: "payment-success-error", component: PaymentSuccessErrorComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];



@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
export const routingComponents=[ HousingAvailabilityComponent,ResearchAvailabilityComponent,MatchAvailabilityComponent,ResearchComponent, MatchComponent,PaymentSuccessErrorComponent, CrowdSourcingComponent, InterviewInsightsComponent,PartnersComponent, SarthiListComponent, RankOrderListComponent, ProfileComponent, LoginComponent, NavBarComponent, AdminPanelComponent, HomeComponent, ModifyInterviewsComponent, VerifyDataComponent, AssignHospitalsComponent, AssignRolesComponent, ObservershipComponent, ROLDataComponent, AddHospitalsComponent, AddUserProfilesComponent,RotationsComponent,RotationAvailabilityComponent, InterviewsReportComponent, InterviewsDataComponent, RemoveDuplicatesComponent, RotationEnquiriesComponent, AddRotationsComponent, VerifyRolDataComponent, FaqsComponent, EnrollmentMentorComponent, ModifyPaymentsComponent, ReferralPointsComponent, MeetingNotesComponent, SeeProfilesComponent, UsersRolComponent, HousingComponent, ModifyHousingComponent, HousingEnquiriesComponent, CleanMedicalSchoolComponent];