import React from 'react'

const Login = React.lazy(() => import('./views/pages/login/Login'))
const RegisterUser = React.lazy(() => import('./views/pages/register/Register'))
const ForgotPassword = React.lazy(() => import('./views/pages/login/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/login/ResetPassword'))


const ImportExcel = React.lazy(() => import('./views/admin/ImportExcel'))
const ImportProgramList = React.lazy(() => import('./views/admin/ImportProgramList'))
const ImportProgramListName = React.lazy(() => import('./views/admin/ImportProgramListName'))
const ImportResidencyExplorer = React.lazy(() => import('./views/admin/ImportResidencyExplorer'))
const AssigneProgram = React.lazy(() => import('./views/admin/AssigneProgram'))
const Leads = React.lazy(() => import('./views/admin/Leads'))
const UserDetails = React.lazy(() => import('./views/admin/UserDetails'))
const ProfileUpdate = React.lazy(() => import('./views/admin/ProfileUpdate'))
const UpdateUnknownPayment = React.lazy(() => import('./views/admin/UpdateUnknownPayment'))
const AddStudent = React.lazy(() => import('./views/admin/AddStudent'))
const DoctorsList = React.lazy(() => import('./views/admin/DoctorsList'))
const UserServices = React.lazy(() => import('./views/admin/UserServices'))
const CommonNotes = React.lazy(() => import('./views/admin/CommonNotes'))
const ListOfRoationStudents = React.lazy(() => import('./views/admin/ListOfRoationStudents'))
const AddDoctorPayment = React.lazy(() => import('./views/admin/AddDoctorPayment'))
const TrackDoctorPayments = React.lazy(() => import('./views/admin/TrackDoctorPayments'))
const TrackAllPayments = React.lazy(() => import('./views/admin/TrackAllPayments'))
const GuestStripePayments = React.lazy(() => import('./views/admin/GuestStripePayments'))
const AddUnknownPayments = React.lazy(() => import('./views/admin/AddUnknownPayments'))
const ListUnknownPayments = React.lazy(() => import('./views/admin/ListUnknownPayments'))
const ListOfAllRoationStudents = React.lazy(() => import('./views/admin/ListOfAllRoationStudents'))
const ListOfAllRoationStudentsReport = React.lazy(() => import('./views/admin/ListOfAllRoationStudentsReport'))
const UnVerifiedPrograms = React.lazy(() => import('./views/admin/UnVerifiedPrograms'))
const ListOfAllMatchStudents = React.lazy(() => import('./views/admin/ListOfAllMatchStudents'))
const ListOfAllMatchMentor = React.lazy(() => import('./views/admin/ListOfAllMatchMentor'))
const RotationQueries = React.lazy(() => import('./views/admin/RotationQueries'))
const AnsweredRotationQueries = React.lazy(() => import('./views/admin/AnsweredRotationQueries'))
const MatchQueries = React.lazy(() => import('./views/admin/MatchQueries'))
const AnsweredMatchQueries = React.lazy(() => import('./views/admin/AnsweredMatchQueries'))
const ResearchQueries = React.lazy(() => import('./views/admin/ResearchQueries'))
const AnsweredResearchQueries = React.lazy(() => import('./views/admin/AnsweredResearchQueries'))
const AnswerQuestions = React.lazy(() => import('./views/admin/AnswerQuestions'))
const UnRegisteredWhatsappList = React.lazy(() => import('./views/admin/UnRegisteredWhatsappList'))
const AddReferral = React.lazy(() => import('./views/admin/AddReferral'))
const ReferralList = React.lazy(() => import('./views/admin/ReferralList'))
const ReferralEdit = React.lazy(() => import('./views/admin/ReferralEdit'))
const StudentResources = React.lazy(() => import('./views/admin/StudentResources'))
const StudentPSCVReview = React.lazy(() => import('./views/admin/StudentsPSCVReview'))
const StudentMocks = React.lazy(() => import('./views/admin/StudentMocks'))
const StudentMatchPlans = React.lazy(() => import('./views/admin/StudentMatchPlans'))

const EnquiresFilter = React.lazy(() => import('./views/admin/EnquiresFilter'))
const UpdateUserPassword = React.lazy(() => import('./views/admin/UpdateUserPassword'))
const AddDoctor = React.lazy(() => import('./views/admin/AddDoctor'))
const DoctorDetails = React.lazy(() => import('./views/admin/DoctorDetails'))
const updateDoctor = React.lazy(() => import('./views/admin/updateDoctor'))
const CrossSellFilter = React.lazy(() => import('./views/admin/CrossSellFilter'))
const ListOfRotations = React.lazy(() => import('./views/admin/ListOfRotations'))
const EditRotations = React.lazy(() => import('./views/admin/EditRotations'))
const ListOfMatch = React.lazy(() => import('./views/admin/ListOfMatch'))
const EditMatch = React.lazy(() => import('./views/admin/EditMatch'))
const ListOfHousing = React.lazy(() => import('./views/admin/ListOfHousing'))
const EditHousing = React.lazy(() => import('./views/admin/EditHousing'))
const ListOfResearch = React.lazy(() => import('./views/admin/ListOfResearch'))
const EditResearch = React.lazy(() => import('./views/admin/EditResearch'))

const ListOfAllResearchStudents = React.lazy(() => import('./views/admin/ListOfAllResearchStudents'))
const ListOfAllServiceStudents = React.lazy(() => import('./views/admin/ListOfAllServiceStudents'))
const IssueTracker = React.lazy(() => import('./views/admin/IssueTracker'))
const IssueResolved = React.lazy(() => import('./views/admin/IssueResolved'))
const ListOfPanelist = React.lazy(() => import('./views/admin/ListOfPanelist'))
const EditPanelist = React.lazy(() => import('./views/admin/EditPanelist'))
const AddSingleList = React.lazy(() => import('./views/admin/AddSingleList'))
const JournalistsList = React.lazy(() => import('./views/admin/JournalistsList'))
const JournalistsDetails = React.lazy(() => import('./views/admin/JournalistDetails'))


const ProfileUpdateStudent = React.lazy(() => import('./views/users/ProfileUpdateStudent'))
const MatchServices = React.lazy(() => import('./views/users/MatchServices'))
const RotationServices = React.lazy(() => import('./views/users/RotationServices'))
const ResearchServices = React.lazy(() => import('./views/users/ResearchServices'))
const CommonNotesStudent = React.lazy(() => import('./views/users/CommonNotesStudent'))
const AskQuestions = React.lazy(() => import('./views/users/AskQuestions'))
const Enqueries = React.lazy(() => import('./views/users/Enqueries'))
const Referrals = React.lazy(() => import('./views/users/Referrals'))
const ReferralsAdmin = React.lazy(() => import('./views/admin/Referrals'))
const StudentResourceList = React.lazy(() => import('./views/users/StudentResourceList'))
const StudentResourceView = React.lazy(() => import('./views/users/StudentResourceView'))
const MockServices = React.lazy(() => import('./views/users/MockServices'))
const MatchPlans = React.lazy(() => import('./views/users/MatchPlans'))
const StudentPSCVReviewUser = React.lazy(() => import('./views/users/StudentsPSCVReview'))










const routes = {"public":[
  { path: '/login', name: 'Login', element: Login },
  { path: '/register', name: 'RegisterUser',exact: true, element: RegisterUser },
	{ path: '/forgot-password', name: 'ForgotPassword', element: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', element: ResetPassword },
],
"Admin":[
	{ path: '/admin/import', name: 'ImportExcel',exact: true, element: ImportExcel },
	{ path: '/admin/importprogramlist', name: 'ImportProgramList',exact: true, element: ImportProgramList },
	{ path: '/admin/importprogramlistname', name: 'ImportProgramListName',exact: true, element: ImportProgramListName },
	{ path: '/admin/importresidencyexplorer', name: 'ImportResidencyExplorer',exact: true, element: ImportResidencyExplorer },
	{ path: '/admin/assignprogram', name: 'AssigneProgram',exact: true, element: AssigneProgram },
	{ path: '/admin/pendingprograms', name: 'UnVerifiedPrograms',exact: true, element: UnVerifiedPrograms },
	{ path: '/admin/adminreferrals/', name: 'ReferralsAdmin',exact: true, element: ReferralsAdmin },
	
	
	{ path: '/admin/leads', name: 'Leads',exact: true, element: Leads },
	{ path: '/admin/userdetails/:id', name: 'UserDetails',exact: true, element: UserDetails },
	{ path: '/admin/updateprofile/:id', name: 'ProfileUpdate',exact: true, element: ProfileUpdate },
	{ path: '/admin/updateunknowpayment/:useridd', name: 'UpdateUnknownPayment',exact: true, element: UpdateUnknownPayment },
	{ path: '/admin/addstudent', name: 'AddStudent',exact: true, element: AddStudent },
    { path: '/admin/doctorlist', name: 'DoctorsList',exact: true, element: DoctorsList },
    { path: '/admin/adddoctorpayments/:did', name: 'AddDoctorPayment',exact: true, element: AddDoctorPayment },
    { path: '/admin/trackdoctorpayments/:did', name: 'TrackDoctorPayments',exact: true, element: TrackDoctorPayments },
    { path: '/admin/trackallpayments/', name: 'TrackAllPayments',exact: true, element: TrackAllPayments },
    { path: '/admin/gueststripepayments/:stripePayment?', name: 'GuestStripePayments',exact: true, element: GuestStripePayments },
    { path: '/admin/addunknownpayments/', name: 'AddUnknownPayments',exact: true, element: AddUnknownPayments },
    { path: '/admin/listunknownpayments/:PStartDate?/:PEndDate?', name: 'ListUnknownPayments',exact: true, element: ListUnknownPayments },
    //{ path: '/admin/listrotationstudents/:serializedObject?/:locationcodearray?', name: 'ListOfRoationStudents',exact: true, element: ListOfRoationStudents },
    { path: '/admin/listrotationstudents', name: 'ListOfRoationStudents', exact: true, element: ListOfRoationStudents },
    { path: '/admin/listofallrotationstudents/', name: 'ListOfAllRoationStudents',exact: true, element: ListOfAllRoationStudents },
     { path: '/admin/listofallrotationstudentsreport/', name: 'ListOfAllRoationStudentsReport',exact: true, element: ListOfAllRoationStudentsReport },
    { path: '/admin/listofallmatchstudents/', name: 'ListOfAllMatchStudents',exact: true, element: ListOfAllMatchStudents },
    { path: '/admin/listofallmatchmentor/', name: 'ListOfAllMatchMentor',exact: true, element: ListOfAllMatchMentor },
    { path: '/admin/listofallresearchstudents/', name: 'ListOfAllResearchStudents',exact: true, element: ListOfAllResearchStudents },
    { path: '/admin/listofallservicestudents/', name: 'ListOfAllServiceStudents',exact: true, element: ListOfAllServiceStudents },
    { path: '/admin/crosssellfilter/', name: 'CrossSellFilter',exact: true, element: CrossSellFilter },
    { path: '/admin/leads', name: 'Leads',exact: true, element: Leads },
    { path: '/admin/rotationqueries', name: 'RotationQueries',exact: true, element: RotationQueries },
    { path: '/admin/answeredrotationqueries', name: 'AnsweredRotationQueries',exact: true, element: AnsweredRotationQueries },
    { path: '/admin/matchqueries', name: 'MatchQueries',exact: true, element: MatchQueries },
    { path: '/admin/answeredmatchqueries', name: 'AnsweredMatchQueries',exact: true, element: AnsweredMatchQueries },
    { path: '/admin/researchqueries', name: 'ResearchQueries',exact: true, element: ResearchQueries },
    { path: '/admin/answeredresearchqueries', name: 'AnsweredResearchQueries',exact: true, element: AnsweredResearchQueries },
    { path: '/admin/reply/:id?', name: 'AnswerQuestions',exact: true, element: AnswerQuestions },
    { path: '/admin/enquirylist', name: 'EnquiresFilter',exact: true, element: EnquiresFilter },
    { path: '/admin/updateuserpassword', name: 'updateuserpassword',exact: true, element: UpdateUserPassword },
    { path: '/admin/adddoctor', name: 'adddoctor',exact: true, element: AddDoctor },
    { path: '/admin/doctordetails/:id', name: 'doctordetails',exact: true, element: DoctorDetails },
    { path: '/admin/doctorupdate/:id', name: 'doctorupdate',exact: true, element: updateDoctor },
    { path: '/admin/instagrammessage', name: 'Instagram Messages',exact: true, element: UnRegisteredWhatsappList },
    { path: '/admin/listofrotations', name: 'Rotation List',exact: true, element: ListOfRotations },
    { path: '/admin/editrotation/:location_code?', name: 'Edit Rotation',exact: true, element: EditRotations },
    { path: '/admin/listofmatch', name: 'Match List',exact: true, element: ListOfMatch },
    { path: '/admin/editmatch/:match_id?', name: 'Edit Match',exact: true, element: EditMatch },
    { path: '/admin/listofhousing', name: 'Housing List',exact: true, element: ListOfHousing },
    { path: '/admin/edithousing/:match_id?', name: 'Edit Housing',exact: true, element: EditHousing },
    { path: '/admin/listofresearch', name: 'Research List',exact: true, element: ListOfResearch },
    { path: '/admin/editresearch/:research_id?', name: 'Edit Research',exact: true, element: EditResearch },
    { path: '/admin/addreferral', name: 'Add Referral',exact: true, element: AddReferral },
    { path: '/admin/referrallist', name: 'Referral List',exact: true, element: ReferralList },
    { path: '/admin/referraledit/:serviceId?', name: 'Referral Edit',exact: true, element: ReferralEdit },
    { path: '/admin/studentpscvreview/:id', name: 'Student PSCV Review',exact: true, element: StudentPSCVReview },
    { path: '/admin/studentresources/:id?', name: 'Student Resources',exact: true, element: StudentResources },
    { path: '/admin/studentmocks/:id?', name: 'Student Mocks',exact: true, element: StudentMocks },
    { path: '/admin/studentmatchplans/:id?', name: 'Student Match Plans',exact: true, element: StudentMatchPlans },
    { path: '/admin/issuetracker/:id?', name: 'Issue Tracker',exact: true, element: IssueTracker },
    { path: '/admin/issueresolved/:id?', name: 'Issue Resolved',exact: true, element: IssueResolved },
    { path: '/admin/listofpanelist', name: 'Mentor List',exact: true, element: ListOfPanelist },
    { path: '/admin/editpanelist/:match_id?', name: 'Edit Panelist',exact: true, element: EditPanelist },
    { path: '/admin/addsinglelist', name: 'Add Programe',exact: true, element: AddSingleList },
    { path: '/admin/journalist', name: 'Journalist Details',exact: true, element: JournalistsList },
    { path: '/admin/journalist/:mentorId', name: 'Journalist Details',exact: true, element: JournalistsDetails },
],
"users":[
	{ path: '/users/register', name: 'RegisterUser',exact: true, element: RegisterUser },
],
"Default":[
	{ path: '/user/updateuserprofile', name: 'ProfileUpdateStudent',exact: true, element: ProfileUpdateStudent },
	{ path: '/user/matchservice', name: 'MatchServices',exact: true, element: MatchServices },
	{ path: '/user/rotationservice', name: 'RotationServices',exact: true, element: RotationServices },
	{ path: '/user/researchservice', name: 'ResearchServices',exact: true, element: ResearchServices },
	{ path: '/user/followups/', name: 'CommonNotesStudent',exact: true, element: CommonNotesStudent },
	{ path: '/user/askquestions/', name: 'AskQuestions',exact: true, element: AskQuestions },
	{ path: '/user/enqueries/', name: 'Enqueries',exact: true, element: Enqueries },
	{ path: '/user/referrals/', name: 'Referrals',exact: true, element: Referrals },

	{ path: '/admin/userdetails/:id', name: 'UserDetails',exact: true, element: UserDetails },
	{ path: '/admin/updateprofile/:id', name: 'ProfileUpdate',exact: true, element: ProfileUpdate },
	{ path: '/admin/updateunknowpayment/:useridd', name: 'UpdateUnknownPayment',exact: true, element: UpdateUnknownPayment },
	{ path: '/admin/addstudent', name: 'AddStudent',exact: true, element: AddStudent },
    { path: '/admin/doctorlist', name: 'DoctorsList',exact: true, element: DoctorsList },
    { path: '/admin/adddoctorpayments/:did', name: 'AddDoctorPayment',exact: true, element: AddDoctorPayment },
    { path: '/admin/trackdoctorpayments/:did', name: 'TrackDoctorPayments',exact: true, element: TrackDoctorPayments },
    { path: '/admin/trackallpayments/', name: 'TrackAllPayments',exact: true, element: TrackAllPayments },
    { path: '/admin/addunknownpayments/', name: 'AddUnknownPayments',exact: true, element: AddUnknownPayments },
    { path: '/admin/listunknownpayments/:PStartDate?/:PEndDate?', name: 'ListUnknownPayments',exact: true, element: ListUnknownPayments },
    { path: '/admin/listrotationstudents/:serializedObject/:locationcodearray', name: 'ListOfRoationStudents',exact: true, element: ListOfRoationStudents },
    { path: '/admin/listofallrotationstudents/', name: 'ListOfAllRoationStudents',exact: true, element: ListOfAllRoationStudents },
    { path: '/admin/listofallmatchstudents/', name: 'ListOfAllMatchStudents',exact: true, element: ListOfAllMatchStudents },
    { path: '/admin/listofallmatchmentor/', name: 'ListOfAllMatchMentor',exact: true, element: ListOfAllMatchMentor },
    { path: '/admin/listofallresearchstudents/', name: 'ListOfAllResearchStudents',exact: true, element: ListOfAllResearchStudents },
    { path: '/admin/listofallservicestudents/', name: 'ListOfAllServiceStudents',exact: true, element: ListOfAllServiceStudents },
    { path: '/user/studentresourceview/:index', name: 'StudentResourceView',exact: true, element: StudentResourceView },
    { path: '/user/studentresourcelist', name: 'StudentResourceList',exact: true, element: StudentResourceList },
    { path: '/user/mockservices/:id?', name: 'Student Mocks',exact: true, element: MockServices },
    { path: '/user/matchplans/:id?', name: 'Your Plan For Match',exact: true, element: MatchPlans },
    { path: '/user/studentpscvreview/:id?', name: 'Student PSCV Review',exact: true, element: StudentPSCVReviewUser },
],
"Student":[
	{ path: '/user/updateuserprofile', name: 'ProfileUpdateStudent',exact: true, element: ProfileUpdateStudent },
	{ path: '/user/matchservice', name: 'MatchServices',exact: true, element: MatchServices },
	{ path: '/user/rotationservice', name: 'RotationServices',exact: true, element: RotationServices },
	{ path: '/user/researchservice', name: 'ResearchServices',exact: true, element: ResearchServices },
	{ path: '/user/followups/', name: 'CommonNotesStudent',exact: true, element: CommonNotesStudent },
	{ path: '/user/askquestions/', name: 'AskQuestions',exact: true, element: AskQuestions },
	{ path: '/user/enqueries/', name: 'Enqueries',exact: true, element: Enqueries },
	{ path: '/user/referrals/', name: 'Referrals',exact: true, element: Referrals },


	{ path: '/admin/userdetails/:id', name: 'UserDetails',exact: true, element: UserDetails },
	{ path: '/admin/updateprofile/:id', name: 'ProfileUpdate',exact: true, element: ProfileUpdate },
	{ path: '/admin/updateunknowpayment/:useridd', name: 'UpdateUnknownPayment',exact: true, element: UpdateUnknownPayment },
	{ path: '/admin/addstudent', name: 'AddStudent',exact: true, element: AddStudent },
    { path: '/admin/doctorlist', name: 'DoctorsList',exact: true, element: DoctorsList },
    { path: '/admin/adddoctorpayments/:did', name: 'AddDoctorPayment',exact: true, element: AddDoctorPayment },
    { path: '/admin/trackdoctorpayments/:did', name: 'TrackDoctorPayments',exact: true, element: TrackDoctorPayments },
    { path: '/admin/trackallpayments/', name: 'TrackAllPayments',exact: true, element: TrackAllPayments },
    { path: '/admin/addunknownpayments/', name: 'AddUnknownPayments',exact: true, element: AddUnknownPayments },
    { path: '/admin/listunknownpayments/:PStartDate?/:PEndDate?', name: 'ListUnknownPayments',exact: true, element: ListUnknownPayments },
    { path: '/admin/listrotationstudents/:serializedObject/:locationcodearray', name: 'ListOfRoationStudents',exact: true, element: ListOfRoationStudents },
    { path: '/admin/listofallrotationstudents/', name: 'ListOfAllRoationStudents',exact: true, element: ListOfAllRoationStudents },
    { path: '/admin/listofallmatchstudents/', name: 'ListOfAllMatchStudents',exact: true, element: ListOfAllMatchStudents },
    { path: '/admin/listofallmatchmentor/', name: 'ListOfAllMatchMentor',exact: true, element: ListOfAllMatchMentor },
    { path: '/admin/listofallresearchstudents/', name: 'ListOfAllResearchStudents',exact: true, element: ListOfAllResearchStudents },
    { path: '/admin/listofallservicestudents/', name: 'ListOfAllServiceStudents',exact: true, element: ListOfAllServiceStudents },
    { path: '/admin/listofallservicestudents/', name: 'ListOfAllServiceStudents',exact: true, element: ListOfAllServiceStudents },
    { path: '/user/studentresourceview/:index', name: 'StudentResourceView',exact: true, element: StudentResourceView },
    { path: '/user/studentresourcelist', name: 'StudentResourceList',exact: true, element: StudentResourceList },
    { path: '/user/mockservices/:id?', name: 'Student Mocks',exact: true, element: MockServices },
    { path: '/user/matchplans/:id?', name: 'Your Plan For Match',exact: true, element: MatchPlans },
    { path: '/user/studentpscvreview/:id?', name: 'Student PSCV Review',exact: true, element: StudentPSCVReviewUser },
],
"Silver":[
	{ path: '/user/updateuserprofile', name: 'ProfileUpdateStudent',exact: true, element: ProfileUpdateStudent },
	{ path: '/user/matchservice', name: 'MatchServices',exact: true, element: MatchServices },
	{ path: '/user/rotationservice', name: 'RotationServices',exact: true, element: RotationServices },
	{ path: '/user/researchservice', name: 'ResearchServices',exact: true, element: ResearchServices },
	{ path: '/user/followups/', name: 'CommonNotesStudent',exact: true, element: CommonNotesStudent },
	{ path: '/user/askquestions/', name: 'AskQuestions',exact: true, element: AskQuestions },
	{ path: '/user/enqueries/', name: 'Enqueries',exact: true, element: Enqueries },
	{ path: '/user/referrals/', name: 'Referrals',exact: true, element: Referrals },


	{ path: '/admin/userdetails/:id', name: 'UserDetails',exact: true, element: UserDetails },
	{ path: '/admin/updateprofile/:id', name: 'ProfileUpdate',exact: true, element: ProfileUpdate },
	{ path: '/admin/updateunknowpayment/:useridd', name: 'UpdateUnknownPayment',exact: true, element: UpdateUnknownPayment },
	{ path: '/admin/addstudent', name: 'AddStudent',exact: true, element: AddStudent },
    { path: '/admin/doctorlist', name: 'DoctorsList',exact: true, element: DoctorsList },
    { path: '/admin/adddoctorpayments/:did', name: 'AddDoctorPayment',exact: true, element: AddDoctorPayment },
    { path: '/admin/trackdoctorpayments/:did', name: 'TrackDoctorPayments',exact: true, element: TrackDoctorPayments },
    { path: '/admin/trackallpayments/', name: 'TrackAllPayments',exact: true, element: TrackAllPayments },
    { path: '/admin/addunknownpayments/', name: 'AddUnknownPayments',exact: true, element: AddUnknownPayments },
    { path: '/admin/listunknownpayments/:PStartDate?/:PEndDate?', name: 'ListUnknownPayments',exact: true, element: ListUnknownPayments },
    { path: '/admin/listrotationstudents/:serializedObject/:locationcodearray', name: 'ListOfRoationStudents',exact: true, element: ListOfRoationStudents },
    { path: '/admin/listofallrotationstudents/', name: 'ListOfAllRoationStudents',exact: true, element: ListOfAllRoationStudents },
    { path: '/admin/listofallmatchmentor/', name: 'ListOfAllMatchMentor',exact: true, element: ListOfAllMatchMentor },
    { path: '/admin/listofallmatchstudents/', name: 'ListOfAllMatchStudents',exact: true, element: ListOfAllMatchStudents },
    { path: '/admin/listofallresearchstudents/', name: 'ListOfAllResearchStudents',exact: true, element: ListOfAllResearchStudents },
    { path: '/user/studentresourceview/:index', name: 'Student Resource View',exact: true, element: StudentResourceView },
    { path: '/user/studentresourcelist', name: 'Student Resource List',exact: true, element: StudentResourceList },
    { path: '/user/mockservices/:id?', name: 'Student Mocks',exact: true, element: MockServices },
    { path: '/user/matchplans/:id?', name: 'Your Plan For Match',exact: true, element: MatchPlans },
    { path: '/user/studentpscvreview/:id?', name: 'Student PSCV Review',exact: true, element: StudentPSCVReviewUser },

],
"Mentor":[
	{ path: '/user/updateuserprofile', name: 'ProfileUpdateStudent',exact: true, element: ProfileUpdateStudent },
	{ path: '/admin/userdetails/:id', name: 'UserDetails',exact: true, element: UserDetails },
	{ path: '/admin/updateprofile/:id', name: 'ProfileUpdate',exact: true, element: ProfileUpdate },
	{ path: '/admin/updateunknowpayment/:useridd', name: 'UpdateUnknownPayment',exact: true, element: UpdateUnknownPayment },
	{ path: '/admin/addstudent', name: 'AddStudent',exact: true, element: AddStudent },
    { path: '/admin/doctorlist', name: 'DoctorsList',exact: true, element: DoctorsList },
    { path: '/admin/adddoctorpayments/:did', name: 'AddDoctorPayment',exact: true, element: AddDoctorPayment },
    { path: '/admin/trackdoctorpayments/:did', name: 'TrackDoctorPayments',exact: true, element: TrackDoctorPayments },
    { path: '/admin/trackallpayments/', name: 'TrackAllPayments',exact: true, element: TrackAllPayments },
    { path: '/admin/addunknownpayments/', name: 'AddUnknownPayments',exact: true, element: AddUnknownPayments },
    { path: '/admin/listunknownpayments/:PStartDate?/:PEndDate?', name: 'ListUnknownPayments',exact: true, element: ListUnknownPayments },
    { path: '/admin/listrotationstudents/:serializedObject/:locationcodearray', name: 'ListOfRoationStudents',exact: true, element: ListOfRoationStudents },
    { path: '/admin/listofallrotationstudents/', name: 'ListOfAllRoationStudents',exact: true, element: ListOfAllRoationStudents },
    { path: '/admin/listofallmatchmentor/', name: 'ListOfAllMatchMentor',exact: true, element: ListOfAllMatchMentor },
    { path: '/admin/listofallmatchstudents/', name: 'ListOfAllMatchStudents',exact: true, element: ListOfAllMatchStudents },
    { path: '/admin/listofallresearchstudents/', name: 'ListOfAllResearchStudents',exact: true, element: ListOfAllResearchStudents },
    { path: '/admin/listofallservicestudents/', name: 'ListOfAllServiceStudents',exact: true, element: ListOfAllServiceStudents },
    { path: '/admin/reply/:id?', name: 'AnswerQuestions',exact: true, element: AnswerQuestions },
]
}
routes['chiefmentor']=routes['Admin'];
export default routes
