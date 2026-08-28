import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef
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
import { collegesByCountry } from './colleges_by_country';
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
export class SarthiListComponent implements OnInit {
  loading: boolean;
  landing: string;
  selectedPId: string;
  selectedHospitalData: any;
  ListUserHasUnverified: any;
  ListUserHasverified: any;
  collegesByCountry: any = collegesByCountry;
  message: string;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  showAlert: boolean;
  programList: Program[];
  visaObject: any = {};
  programObject: any = {};
  hospitalsByProgram: any = {};
  hospitalsDataByProgram: any = {};
  CheckForFavourits: any = false;
  bestMatches: any = {};
  possibleMatches: any = {};
  difficultMatches: any = {};
  yearDataArrayKeys: any = {};
  shownList: any = [];
  favorites: any = {};
  favoritesObject: any = {};
  notes: any = {};
  selectedHid: any;
  notesObject: any = {};
  updateDashboard: boolean = true;
  private dashboardProcessed: Record<string, boolean> = {};
  private hospitalDataRequests: Record<string, Promise<any>> = {};
  others: any = {};
  allLandings = ["Specialities", "Dashboard", "Favorites", "My Notes"];
  allTabs = ["Best", "Possible", "Difficult", "Others"];
  totalNo = [0, 0, 0, 0];
  allPanes = ["Program Information", "Score Information","Applicant characteristics","Medical school information", "Additional Information", "Interview Profiles", "Matched Profiles"];
  customVisa: any = { "1": { Type: "GC/US citizen/H4 EAD", VId: "1" }, "2": { Type: "Need H1", VId: "2" }, "3": { Type: "Need J1", VId: "3" }, "4": { Type: "Other", VId: "4" } };
  showPane = "Program Information";
  showTab: string;
  userProfile: any = {
    uid: 8,
    Step1Score: 210,
    Step2Score: 210,
    USCE: 6,
    YOG: 1,
    Visas: [1],
  }
  naVals = ["-99", -99, "-999", -999, "NA", "na", "N/A"];
  newNote: String = "";
  search: String = "";
  isNotesCollapsed: boolean = true;
  shownStates : any[];
  shownCities : any[];
  shownMedicalSchools: any[];
  shownVisas  = ["J1", "H1", "H4 EAD", "No Visa Sponsorship", "F1 (OPT 1st year)"];
  shownNrmp = ["Yes", "No"];
  shownEcfmg = ["Yes", "No", "Required for IMGs"];
  shownYog = [
    "Within 2 year",
    "Within 3 year",
    "Within 4 year",
    "Within 5 year",
    "Within 6 year",
    "YOG not a constrain",
  ];
  shownStep1 = [
    "Pass",
    "Fail",
  ];
  shownStep = [
    "200 and below",
    "210 and below",
    "220 and below",
    "230 and below",
    "240 and below",
    "250 and below",
  ];
  shownPercentage = [
    "30 and above",
    "50 and above",
    "80 and above",
  ]
   shownSignalInvitedDropDown = [
    "Less Than 50%",
    "More Than 50%",
  ]
  selectedCities : any[] = [];
  selectedStates : any[] = [];
  selectedMedicalSchools : any[] = [];
  selectedVisas : any[] = [];
  selectedNrmp : any;
  selectedEcfmg : any;
  selectedYog : any;
  selectedStep1 : any;
  selectedStep2 : any;
  selectedUsImg  : any;
  selectedSignalInvited  : any;
  selectedNonUsImg : any;
  selectedDataNotAvailable : any;
//collegesByCountry: any = collegesByCountry;

shownCountries: string[] = Object.keys(collegesByCountry)
  .sort((a, b) => a.localeCompare(b));

selectedCountries: string[] = [];
  constructor(private dbservice: SarthiListService, private programApi: ProgramService, private hospitalApi: HospitalService, private toastr: ToastrService, private authService: AuthenticationService, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    this.showTab = "Others";
    this.programList = [];
    this.showAlert = false;
  }
private favoritesPromise: Promise<any> | null = null;
  async ngOnInit() {
    try {

      this.userProfile = await this.authService.userData;
      if (this.userProfile.Locked === "0" && 0) {
        this.toastr.info("Please navigate to your profile(on top right) and complete the form");
        this.landing = "";
        this.loading = true;
      } else {
        console.log("===============>")
        await this.takeMeToSpeciality();
        this.visaObject = await this.dbservice.getVisaObject();
        this.userProfile.Step1Score = parseInt(this.userProfile.Step1Score);
        this.userProfile.Step2Score = parseInt(this.userProfile.Step2Score);
        this.userProfile.USCE = parseInt(this.userProfile.USCE);
      }
    } catch (err) {
      this.loading = true;
      this.toastr.error("Error while fetching hospitals data, please try again");
    }

  }
exportProgramsToExcel() {

  const exportData: any[] = [];

  Object.values(
    this.hospitalsDataByProgram[this.selectedPId] || {}
  ).forEach((program: any) => {

    const hospital =
      this.hospitalsByProgram &&
      this.hospitalsByProgram[this.selectedPId] &&
      this.hospitalsByProgram[this.selectedPId][program.HId]
        ? this.hospitalsByProgram[this.selectedPId][program.HId]
        : {};

    const row: any = {

      // Basic
      HospitalName: hospital.HName || '',
      City: hospital.City || '',
      State: hospital.State || '',
      FriedaID: program.Frieda || '',

      // Information from Frieda
      TeachingSite: program.teachingSiteNew || '',
      NRMP: program.Nrmp || '',
      NRMPPrelim: program.NrmpPrelim || '',
      NRMPCategorical: program.NrmpCategorical || '',
      NRMPPrimaryCare: program.NrmpPriCase || '',
      NRMPAdvance: program.NrmpAdvance || '',

      USIMGPercentage: program.usImgPercentage || '',
      DOPercentage: program.doPercentageNew || '',
      CaribbeanIMGPercentage: program.imgpercentageCarribean || '',

      IMGComments: Array.isArray(program.imgpercentageCommentsMerged)
        ? program.imgpercentageCommentsMerged.join(' | ')
        : (program.imgpercentageComments || ''),

      FirstYearSpots: program.FirstYearSpots || '',
      FirstYearSpotsPrelim: program.FirstYearSpotsPrelim || '',

      // Score Information
      PreferredStep1: program.Step1Req || '',
      Step1Minimum: program.Step1ScoreLastYearMin || '',
      Step1PassRequired: program.Step1AcceptN || '',
      Step1AttemptsCondition: program.Step1Accept || '',

      PreferredStep2: program.Step2Req || '',
      Step2Minimum: program.Step2Min || '',
      Step2PassRequired: program.Step2AcceptN || '',
      Step2AttemptsCondition: program.Step2Accept || '',

      Step3Requirement: program.Step3Accept || '',

      USMLEComments: Array.isArray(program.USMLEExamCommentsMerged)
        ? program.USMLEExamCommentsMerged.join(' | ')
        : (program.USMLEExamComments || ''),

      // Additional Information
      ApplicationDeadline: program.AppDeadline || '',
      LORRequired: program.LORNum || '',
      HomeCountryLOR: program.LORReq || '',
      SpanishRequired: program.SpanishReq || '',
      USCERequiredMonths: program.USCEReq || '',
      USCENotConsidered: program.USCENotCon || '',
      USCERequired: program.USCEReqOrPref || '',
      ECFMGRequired: program.ECFMGReq || '',
      ResearchOpportunities: program.ResearchOpp || '',
      ProgramPreference: program.ProgramPref || '',

      ProgramDirector: program.programDirectorNew || '',
      ContactPerson: program.personToContactNew || '',
      Address: program.address || '',
      Website: program.website || '',
      ResidencyExplorerLink: program.reLink || '',
      FriedaLink: program.friedaLink || ''
    };

    // Applicant Characteristics
    if (program.yearlyData) {

      Object.keys(program.yearlyData).forEach((year: any) => {

        const y = program.yearlyData[year] || {};

        row[year + '_ApplicantCount'] =
          y.TotalApplicantsForTheYear || '';

        row[year + '_InterviewInvites'] =
          y.TotalAplicantsInvitedForTheYear || '';

        row[year + '_GoldInterviewed'] =
          y.GoldSentInterviewed || '';

        row[year + '_SilverInterviewed'] =
          y.SilverInterviewed || '';

        row[year + '_DidNotSignalInterviewed'] =
          y.DidnotInterviewed || '';

        row[year + '_AlignedInterviewed'] =
          y.AlignedInterviewed || '';

        row[year + '_NotAlignedInterviewed'] =
          y.NotalignedInterviewed || '';

        row[year + '_NoPreferenceInterviewed'] =
          y.NopreferenceInterviewed || '';
      });
    }

    exportData.push(row);
  });

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Programs');

  let fileName = 'Programs';

  if (
    this.programObject &&
    this.programObject[this.selectedPId] &&
    this.programObject[this.selectedPId].ProgramName
  ) {
    fileName = this.programObject[this.selectedPId].ProgramName;
  }

  XLSX.writeFile(wb, fileName + '.xlsx');
}
  async takeMeToSpeciality() {
    try {
      this.loading = true;
      this.landing = "Specialities";
      const hideProgramIds = [8];
      if (this.programList.length == 0) {
        this.programList = await this.programApi.getProgramList();
        this.programObject = {};
        for (let i in this.programList) {
          this.programObject[this.programList[i].PId] = this.programList[i];
        }
        if (this.userProfile.Role !== "Admin")
          this.programList = this.programList.filter(program => !hideProgramIds.includes(parseInt(program.PId)));
      }
      this.loading = false;
    } catch (err) {
      this.loading = true;
      this.toastr.error("Error while fetching data, please try again");
    }
  }
get isResidencyExplorerProgram(): boolean {
  const pid = this.ConvertNumber(this.selectedPId);
  return [1, 2, 3, 4, 5, 7].includes(pid);
}
getCleanValueYOG(value: any, value2: any = null): string {

  const extractYears = (val: any): string | null => {
    if (val == null) return null;

    const str = String(val).trim();

    if (!str) return null;

    // Already a number: 5, "5", 10, "10"
    if (/^\d+$/.test(str)) {
      return str;
    }

    // No cap on number of years → 0
    if (/no\s+cap\s+on\s+the\s+number\s+of\s+years/i.test(str)) {
      return '0';
    }

    // Example:
    // Graduation from medical school must have occurred
    // within the past 5 year(s).
    const match = str.match(
      /within\s+the\s+past\s+(\d+)\s+year(?:\(s\)|s)?/i
    );

    if (match) {
      return match[1];
    }

    return null;
  };

  // value2 gets priority
  const result2 = extractYears(value2);

  if (result2 !== null) {
    return result2;
  }

  // Otherwise use value
  const result1 = extractYears(value);
if(Number(result1)==0)
{
  return "YOG not a constrain";
}
  if (result1 !== null) {
    return result1;
  }

  return 'N/A';
}
getCleanValue(value: any, value2: any = null): string {

  const invalidValues = [
    '',
    '--',
    'na',
    '99',
    '999',
    'n/a',
    'not available',
    'data not available',
    'data unavailable',
    'not applicable',
    'nil',
    'none',
    '-',
  ];

  const clean = (val: any): string | null => {
    if (val == null) return null;

    const str = String(val).trim();

    return invalidValues.includes(str.toLowerCase())
      ? null
      : str;
  };

  // Priority: value2
  const cleanedValue2 = clean(value2);

  if (cleanedValue2 !== null) {
    return cleanedValue2;
  }

  // Fallback: value
  const cleanedValue = clean(value);

  if (cleanedValue !== null) {
    return cleanedValue;
  }

  return 'N/A';
}
private getFavoritesCached(): Promise<any> {
  if (this.favorites && Object.keys(this.favorites).length) {
    return Promise.resolve(this.favorites);
  }

  if (!this.favoritesPromise) {
    this.favoritesPromise = this.dbservice
      .getFavoritesByUId(
        String(this.userProfile.uid)
      )
      .catch(error => {
        this.favoritesPromise = null;
        throw error;
      });
  }

  return this.favoritesPromise;
}

private getHospitalDataCached(programId: string): Promise<any> {
  const cached = this.hospitalsDataByProgram[programId];

  if (cached && Object.keys(cached).length) {
    return Promise.resolve(cached);
  }

  if (this.hospitalDataRequests[programId]) {
    return this.hospitalDataRequests[programId];
  }

  this.hospitalDataRequests[programId] = this.dbservice
    .getHospitalsDataByPId(programId)
    .then(data => {
      this.hospitalsDataByProgram[programId] = data || {};
      return this.hospitalsDataByProgram[programId];
    })
    .finally(() => {
      delete this.hospitalDataRequests[programId];
    });

  return this.hospitalDataRequests[programId];
}
private processDashboardOptimized(): void {
  const programId = this.selectedPId;

  if (
    this.dashboardProcessed[programId] &&
    !this.updateDashboard
  ) {
    return;
  }

  const best: any[] = [];
  const possible: any[] = [];
  const difficult: any[] = [];
  const others: any[] = [];

  const medicalSchools = new Set<string>();

  const programData =
    this.hospitalsDataByProgram[programId] || {};

  for (const hospitalData of Object.values(programData) as any[]) {
    if (hospitalData.TimeStamp) {
      const date = new Date(hospitalData.TimeStamp);

      hospitalData.Date = [
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        date.getFullYear()
      ].join('/');
    }

    for (
      const school of hospitalData.medicalSchoolMatches || []
    ) {
      if (!school || !school.name) {
        continue;
      }

      const schoolName = String(school.name)
        .replace(/\s+/g, ' ')
        .trim();

      if (
        schoolName.toLowerCase() !==
        'more than 1 school has this rank*'
      ) {
        medicalSchools.add(schoolName);
      }
    }

    const key =
      `${hospitalData.HId}_${hospitalData.PId}`;

    hospitalData.favorite =
      this.favoritesObject[key];

    switch (this.bifurcateHospital(hospitalData)) {
      case 'Best':
        best.push(hospitalData);
        break;

      case 'Possible':
        possible.push(hospitalData);
        break;

      case 'Difficult':
        difficult.push(hospitalData);
        break;

      default:
        others.push(hospitalData);
    }
  }

  // Sort only once.
  this.shownMedicalSchools =
    Array.from(medicalSchools).sort((a, b) =>
      a.localeCompare(
        b,
        undefined,
        { sensitivity: 'base' }
      )
    );

  this.bestMatches[programId] = best;
  this.possibleMatches[programId] = possible;
  this.difficultMatches[programId] = difficult;
  this.others[programId] = others;

  this.totalNo = [
    best.length,
    possible.length,
    difficult.length,
    others.length
  ];

  this.dashboardProcessed[programId] = true;
  this.updateDashboard = false;
}
async takeMeToDashboard(event: any): Promise<void> {
  const programId = String(event);

  // Prevent repeated clicks while loading.
  if (this.loading && this.selectedPId === programId) {
    return;
  }

  this.selectedPId = programId;
  this.loading = true;
  this.landing = 'Dashboard';
  console.time(`dashboard-${programId}`);

  try {

    this.ListUserHasverified = [
      { id: 1, name: 'Test User' }
    ];

    this.ListUserHasUnverified = [];

    const [
      hospitals,
      hospitalsData,
      favorites
    ] = await Promise.all([
      this.measureRequest(
        'Hospitals',
        this.hospitalApi.getHospitalsObjectByProgramRameez(programId)
      ),
      this.measureRequest(
        'Hospital program data',
        this.getHospitalDataCached(programId)
      ),
      this.measureRequest(
        'Favorites',
        this.getFavoritesCached()
      )
    ]);

    this.hospitalsByProgram[programId] =
      hospitals || {};

    this.hospitalsDataByProgram[programId] =
      hospitalsData || {};

    this.favorites = favorites || {};

    const recordCount = Object.keys(
      this.hospitalsDataByProgram[programId]
    ).length;

    console.log('Hospital data records:', recordCount);

    if (recordCount === 0) {
      this.toastr.info(
        "Selected speciality doesn't have any hospital data."
      );

      this.selectedPId = undefined;
      this.landing = 'Specialities';

      return;
    }

    this.processFavorites();

    // The program data was freshly assigned, so rebuild its dashboard lists.
    this.dashboardProcessed[programId] = false;
    this.processDashboardOptimized();

    this.showTab = this.showTab || 'Others';
    this.shownList = [
      ...(this.showTab === 'Best'
        ? this.bestMatches[programId]
        : this.showTab === 'Possible'
          ? this.possibleMatches[programId]
          : this.showTab === 'Difficult'
            ? this.difficultMatches[programId]
            : this.others[programId])
    ];

    this.sortDataOnFilter('State', this.shownList);
    this.createFilters();

    console.log('Shown list records:', this.shownList.length);
  } catch (error) {
    console.error(
      'Dashboard loading failed:',
      error
    );

    this.landing = 'Specialities';

    this.toastr.error(
      'Error while loading the dashboard. Please try again.'
    );
  } finally {
    console.timeEnd(`dashboard-${programId}`);

    // Older AngularFire promises may finish outside Angular change detection.
    this.ngZone.run(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}

private async measureRequest<T>(name: string, request: Promise<T>): Promise<T> {
  const startedAt = performance.now();

  try {
    return await request;
  } finally {
    console.log(`${name}: ${(performance.now() - startedAt).toFixed(0)} ms`);
  }
}
ConvertNumber(num){
  if(typeof num=="undefined")
  {
    num=0;
  }
  return Number(num);
}
private processFavorites() {
  this.favoritesObject = {};
  for (let i in this.favorites) {
    let data = this.favorites[i];
    let key = data.Frieda + '_' + data.PId;
    const hospitalByHId = this.hospitalsByProgram[this.selectedPId][data.HId];
    const hospitalByKey = this.hospitalsByProgram[this.selectedPId][key];
    const programInfo = this.hospitalsDataByProgram[this.selectedPId][key];
    if (hospitalByHId) this.favorites[i]['hospital'] = hospitalByHId;
    if (hospitalByKey) this.favorites[i]['hospital'] = hospitalByKey;
    if (programInfo) this.favorites[i]['ProgramInfo'] = programInfo;
    if (!hospitalByHId || !programInfo) {
      delete this.favorites[i];
      continue;
    }
    this.favoritesObject[key] = data;
  }
}

private processDashboard() {
  

  this.bestMatches[this.selectedPId] = [];
  this.possibleMatches[this.selectedPId] = [];
  this.difficultMatches[this.selectedPId] = [];
  this.others[this.selectedPId] = [];
  const medicalSchoolsObj=[];
  for (let hpinfoid in this.hospitalsDataByProgram[this.selectedPId]) {
    let hospitalData = this.hospitalsDataByProgram[this.selectedPId][hpinfoid];
    if (hospitalData.TimeStamp) {
      const timeStamp = new Date(hospitalData.TimeStamp);
      hospitalData.Date = `${String(timeStamp.getDate()).padStart(2,'0')}/${String(timeStamp.getMonth()+1).padStart(2,'0')}/${timeStamp.getFullYear()}`;
    }
    if (hospitalData.medicalSchoolMatches && hospitalData.medicalSchoolMatches.length) {
      hospitalData.medicalSchoolMatches.forEach((school) => {
            if (!school || !school.name) return;
            const schoolName = school.name.replace(/\s+/g, " ").trim();
            if (schoolName.toLowerCase() ==="more than 1 school has this rank*") 
            {
              return;
            }
            medicalSchoolsObj[schoolName] = 1;
          });
    }
    //this.shownMedicalSchools =Object.keys(medicalSchoolsObj);
    this.shownMedicalSchools = Object.keys(medicalSchoolsObj).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: "base",}));
    let key = hospitalData.HId + '_' + hospitalData.PId;
    hospitalData.favorite = key in this.favoritesObject
      ? this.favoritesObject[key]
      : undefined;

    const category = this.bifurcateHospital(hospitalData);
    switch (category) {
      case "Best":      this.bestMatches[this.selectedPId].push(hospitalData); break;
      case "Possible":  this.possibleMatches[this.selectedPId].push(hospitalData); break;
      case "Difficult": this.difficultMatches[this.selectedPId].push(hospitalData); break;
      case "Others":    this.others[this.selectedPId].push(hospitalData); break;
    }
  }

  this.updateDashboard = false;
  this.totalNo[0] = this.bestMatches[this.selectedPId].length;
  this.totalNo[1] = this.possibleMatches[this.selectedPId].length;
  this.totalNo[2] = this.difficultMatches[this.selectedPId].length;
  this.totalNo[3] = this.others[this.selectedPId].length;
}

  sortDataOnFilterRameez(filterName, data) {
    data.sort((a, b) => this.hospitalsByProgram[this.selectedPId][a.HId][filterName] > this.hospitalsByProgram[this.selectedPId][b.HId][filterName] ? 1 : -1);
  }
  sortDataOnFilter(filterName: string, data: any[]) {

  
    data.sort((a, b) => {
      const hospA = this.hospitalsByProgram[this.selectedPId][a.HId];
      const hospB = this.hospitalsByProgram[this.selectedPId][b.HId];
  
      const valA = hospA && hospA[filterName] ? hospA[filterName] : "";
      const valB = hospB && hospB[filterName] ? hospB[filterName] : "";


      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });
  }

  bifurcateHospital(hospitalData: HospitalFormData) {
    return "Others";

    let USCECondition = this.checkForUsceCondition(hospitalData);
    let YOGCondition = this.checkForYogCondition(hospitalData);
    let visaCondition = this.checkForVisaCondition(hospitalData);

    let step1Condition = this.checkForStep1Condition(hospitalData, "best");
    let step2Condition = this.checkForStep2Condition(hospitalData, "best");
    if (visaCondition && ((step1Condition && step2Condition) || ((step1Condition || step2Condition) && (USCECondition || YOGCondition))))
      return "Best";

    step1Condition = this.checkForStep1Condition(hospitalData, "possible");
    step2Condition = this.checkForStep2Condition(hospitalData, "possible");
    if (visaCondition && ((step1Condition && step2Condition) || ((step1Condition || step2Condition) && (USCECondition || YOGCondition))))
      return "Possible";

    step1Condition = this.checkForStep1Condition(hospitalData, "difficult");
    step2Condition = this.checkForStep2Condition(hospitalData, "difficult");
    if (visaCondition && ((step1Condition && step2Condition) || ((step1Condition || step2Condition) && (USCECondition || YOGCondition))))
      return "Difficult";

    return "Others";
  }
  checkForVisaCondition(hospitalData: HospitalFormData) {
    if ("Visas" in hospitalData) {
      if (this.userProfile.Visas.indexOf("1") != -1 || this.userProfile.Visas.indexOf("6") != -1 || this.userProfile.Visas.indexOf("5") != -1)
        return true;
      else if (hospitalData.Visas.indexOf("7") != -1 || hospitalData.Visas.length == 0)
        return false;
      else if (hospitalData.Visas.indexOf("2") != -1 && (this.userProfile.Visas.indexOf("2") != -1 || this.userProfile.Visas.indexOf("3") != -1))
        return true;
      else if (hospitalData.Visas.indexOf("3") != -1 && this.userProfile.Visas.indexOf("3") != -1)
        return true;
    }
    return false;
  }
  checkForUsceCondition(hospitalData: HospitalFormData) {
    let usce = this.userProfile.USCE.toString();
    usce = usce.match(/(\d+)/)[0];
    if (hospitalData.USCEReq == "" || hospitalData.USCEReq == "-99")
      return false;
    else if (usce && parseInt(usce) >= parseInt(hospitalData.USCEReq))
      return true;
    return false;
  }
  convertYOG() {
    if (parseInt(this.userProfile.YOG) >= 2000)
      return Math.abs(new Date().getFullYear() - this.userProfile.YOG);
    return parseInt(this.userProfile.YOG);
  }
  checkForYogCondition(hospitalData: HospitalFormData) {
    let YOG = hospitalData.YOG;
    if (!YOG || YOG == "" || YOG == "Data not available")
      return false;
    else if (YOG == "YOG not a constrain")
      return true;
    else {
      let YOGNum = parseInt(YOG.split(" ")[1]);
      let todayYear = new Date(Date.now()).getFullYear();
      let userYear = this.convertYOG();
      if (YOGNum && userYear && (todayYear + YOG) >= userYear && (todayYear - YOG) <= userYear)
        return true;
    }
    return false;
  }
  checkForStep1Condition(hospitalData: HospitalFormData, type: string) {
    if (hospitalData.Step1ScoreLastYearMin <= 0)
      return false;
    switch (type) {
      case "best":
        if (hospitalData.Step1ScoreLastYearMin <= this.getStep1Score())
          return true;
        break;
      case "possible":
        if (hospitalData.Step1ScoreLastYearMin <= this.getStep1Score() + 10)
          return true;
        break;
      case "difficult":
        if (hospitalData.Step1ScoreLastYearMin <= this.getStep1Score() + 20)
          return true;
        break;
    }
    return false;
  }
  checkForStep2Condition(hospitalData: HospitalFormData, type: string) {
    if (hospitalData.Step2Min <= 0)
      return false;
    switch (type) {
      case "best":
        if (hospitalData.Step2Min <= this.userProfile.Step2Score)
          return true;
        break;
      case "possible":
        if (hospitalData.Step2Min <= this.userProfile.Step2Score + 10)
          return true;
        break;
      case "difficult":
        if (hospitalData.Step2Min <= this.userProfile.Step2Score + 20)
          return true;
        break;
    }
    return false;
  }
  changeTab(tab: any) {
    if (this.allTabs.indexOf(tab) != -1) {
      this.showTab = tab;
      this.setShownListToInitial();
    }
    return false;
  }

  async takeMeTo(landing: string) {
    switch (landing) {
      case "Specialities":
        this.CheckForFavourits=false;
        await this.takeMeToSpeciality();
        break;
      case "Dashboard":
        this.CheckForFavourits=false;
        if (this.selectedPId === undefined || this.selectedPId == "")
          this.toastr.info("Choose a speciality first");
        else
          {
            await this.takeMeToDashboard(this.selectedPId);
          }
         
        break;
      case "Favorites":
        this. CheckForFavourits=true;
        await this.takeMeToFavorites();
        break;
      case "My Notes":
        this.CheckForFavourits=false;
        await this.takeMeToNotes();
        break;
    }
  }

  async takeMeToFavorites() {
    try {
      this.loading = true;
      if(!Object.keys(this.favorites).length)
      {
        this.favorites = await this.dbservice.getFavoritesByUId(this.userProfile.uid.toString());
      }
      console.log("this.favorites===>",this.favorites)
      if (Object.keys(this.favorites).length == 0)
        this.toastr.info("You do not have any favorites yet.");
      else {
        this.landing = "Favorites";
      }
      this.loading = false;
    } catch (err) {
      console.log("Error while fetching your favorites, please try again===>",err)
      await this.takeMeToSpeciality();
      this.toastr.error("Error while fetching your favorites, please try again");
    }
    return [];
  }

  async takeMeToNotes() {
    try {
      this.loading = true;
      this.notes = await this.dbservice.getNotesByUId(this.userProfile.uid.toString());
      if (this.notes.length == 0)
        this.toastr.info("You do not have any notes yet.");
      else {
        this.landing = "My Notes";
        for (let i in this.notes) {
          let note = this.notes[i];
          if (note.PId in this.hospitalsByProgram)
            note.hospital = this.hospitalsByProgram[note.PId][note.HId];
        }
      }
      this.loading = false;
    } catch (err) {
      await this.takeMeToSpeciality();
      this.toastr.error("Error while fetching your notes, please try again");
    }
  }

  async updateNote(index, type) {
    try {
      if (type == "general") {
        let unid = this.notes[index].UNId;
        let newNote = this.notes[index].Notes;

        if (newNote == "") {
          await this.dbservice.deleteNoteById(unid);
          await this.takeMeToNotes();
        } else {
          await this.dbservice.updateNoteById(unid, newNote);
        }
        this.toastr.success("Success! Notes updated.");
        return;
      } else {
        let notes = this.selectedHospitalData.myNotes;
        let unid = notes.UNId;
        let newNote = notes.Notes;
        if (newNote == "") {
          await this.dbservice.deleteNoteById(unid);
          delete this.selectedHospitalData.myNotes;
        } else {
          await this.dbservice.updateNoteById(unid, newNote);
        }
        this.toastr.success("Success! Notes updated.");
        return;
      }
    } catch (err) {
      this.toastr.error("Error while updating notes, please try again");
    }
  }

  async addNote() {
    let docRef;
    try {
      if (this.newNote != "" && !(this.selectedHospitalData.myNotes)) {
        docRef = await this.dbservice.addNotesByUId(this.userProfile.uid.toString(), this.selectedHospitalData.HId, this.selectedHospitalData.PId, this.newNote);
        this.selectedHospitalData.myNotes = {
          UNId: docRef.id,
          Notes: this.newNote,
          PId: this.selectedHospitalData.PId,
          HId: this.selectedHospitalData.HId
        }
        this.toastr.success("Success! Notes updated.");
      }
    } catch (err) {
      this.toastr.error("Error while updating notes, please try again");
    }
  }
  async addToFavorite(pid: any, hid: any, dataObject: any,Friedaid: any) {
    try {
      let uid = this.userProfile.uid.toString();
      let doc = await this.dbservice.addFavoriteByUId(uid, hid, pid,Friedaid);
      console.log("doc---->",doc)
      if (doc != null) {
        dataObject.favorite = {
          UId: uid,
          PId: pid,
          HId: hid,
          UFId: doc.id,
        }
        let idgot=Friedaid+"_"+pid;
        this.favorites[idgot]={
          UId: uid,
          PId: pid,
          HId: hid,
          UFId: doc.id,
        }
      }
      this.toastr.success("Added to favorites");
    } catch (err) {
      this.toastr.error("Error while adding to Favorites, please try again");
    }

  }
  async deleteFromFavorite(ufid: any, dataObject: any) {
    try {
      await this.dbservice.deleteFavoriteById(ufid);
      let idgot=dataObject.Frieda+"_"+this.selectedPId;
      if(typeof this.favorites[idgot]!="undefined")
        {
          delete this.favorites[idgot];
        }
      /*if (dataObject !== undefined)
        delete dataObject.favorite;*/
      this.toastr.success("Removed from favorites");
    } catch (err) {
      this.toastr.error("Error while removing from Favorites, please try again");
    }
  }
  async deleteFromFavoritesPage(ufid: any,Friedaid: any,Progid: any) {
    try {
      console.log("ufid----->",ufid)
      await this.dbservice.deleteFavoriteById(ufid);
      console.log("this.favorites----->",this.favorites)
      let idgot=Friedaid+"_"+Progid;
      if(typeof this.favorites[idgot]!="undefined")
      {
        delete this.favorites[idgot];
      }
      /*for (let i in this.favorites) {
        if (this.favorites[i].UFId == ufid) {
          this.favorites.splice(i, 1);
          break;
        }
      }*/
      this.updateDashboard = true;
      this.toastr.success("Removed from favorites");
    }
    catch (err) {
      this.toastr.error("Error while removing from Favorites, please try again");
    }
  }


  async takeMeToDisplayInfo(event,pid: any) {
    const stringsForDataNotAvailable = ["na", "data not available", "-99", "-999", "999"];
    const numbersForDataNotAvailable = [-99, -999,99]
    const dataNotAvailable = "Data not available";
    try {
      this.loading = true;
      this.landing = "Display";
      let hpinfoid = event.target.value;
      let hid="";
      if(typeof this.selectedPId=="undefined")
      {
        this.selectedPId=pid;
      }
      if(typeof this.favorites[hpinfoid]!="undefined")
      {
        hid = this.favorites[hpinfoid].HId;
      }
      else
      {
        hid = this.hospitalsDataByProgram[this.selectedPId][hpinfoid].HId;
      }
      
      let hidpidcom=hid+"_"+this.selectedPId
      this.selectedHid =hid;
      console.log("this.selectedPId===>",this.selectedPId)
      
      /*if(typeof this.hospitalsDataByProgram[this.selectedPId][hpinfoid]!="undefined")
      {
        this.selectedHospitalData=this.hospitalsDataByProgram[this.selectedPId][hpinfoid];
      }
      else if(typeof this.hospitalsDataByProgram[this.selectedPId][hid]!="undefined")
      {
        this.selectedHospitalData=this.hospitalsDataByProgram[this.selectedPId][hid];
      }
      else if(typeof this.favorites[hpinfoid])
      {
        this.selectedHospitalData=  this.favorites[hpinfoid]['ProgramInfo'];
      }*/
      if (this.hospitalsDataByProgram && this.hospitalsDataByProgram[this.selectedPId] && this.hospitalsDataByProgram[this.selectedPId][hpinfoid]) {
          this.selectedHospitalData = this.hospitalsDataByProgram[this.selectedPId][hpinfoid];
          this.selectedHospitalData['hospital']=this.hospitalsByProgram[this.selectedPId][hid]
        } 
        else if (this.hospitalsDataByProgram && this.hospitalsDataByProgram[this.selectedPId] && this.hospitalsDataByProgram[this.selectedPId][hid]) {
          this.selectedHospitalData = this.hospitalsDataByProgram[this.selectedPId][hid];
          this.selectedHospitalData['hospital']=this.hospitalsByProgram[this.selectedPId][hid]
        } 
        else if (this.favorites && this.favorites[hpinfoid]) {
          this.selectedHospitalData = this.favorites[hpinfoid]['ProgramInfo'];
          this.selectedHospitalData['hospital']=this.favorites[hpinfoid]['hospital']
        }
      else
      {
        this.selectedHospitalData = await this.dbservice.getLatestHospital(this.userProfile.uid, this.selectedPId, hid, true);
      }
      console.log("selectedHospitalData=1===>",this.selectedHospitalData)
      //this.selectedHospitalData['hospital']=this.hospitalsByProgram[this.selectedPId][hid]
      
     // this.selectedHospitalData = await this.dbservice.getLatestHospital(this.userProfile.uid, this.selectedPId, hid, true);
      Object.keys(this.selectedHospitalData).forEach((column)=>{
        const value = this.selectedHospitalData[column]
        if (typeof value === "string"){
          if (stringsForDataNotAvailable.includes(value.toLowerCase())){
            if(column!="Frieda" && column!="HId")
            this.selectedHospitalData[column] = dataNotAvailable
          }
        }
        else if (typeof value === "number"){
          if (numbersForDataNotAvailable.includes(value)){
            this.selectedHospitalData[column] = dataNotAvailable
          }
        }
      })
      if (this.selectedHospitalData.HPInfoId != hpinfoid) {
        this.toastr.info("To access the latest info of this hospital, please contribute to the hospitals and complete the tasks if given", "Latest Info Available");
      }
      await this.makeDataReadyToDisplay(this.selectedHospitalData.HPInfoId);
      //this.selectedHospitalData.hospital = this.hospitalsByProgram[this.selectedPId][this.selectedHospitalData.HId];
      if(!this.selectedHospitalData.DataOfYear)
        {
          this.selectedHospitalData.DataOfYear=new Date().getFullYear();
        }
        let thisyearfull=new Date().getFullYear();
    if(!this.selectedHospitalData.DataOfYear)
      {
        this.selectedHospitalData.DataOfYear=new Date().getFullYear();
      }
      if(!this.selectedHospitalData.yearlyData)
      {
        this.selectedHospitalData.yearlyData={};
        this.selectedHospitalData.yearlyData[thisyearfull]={};
      }
      else if(!this.selectedHospitalData.yearlyData[thisyearfull])
      {
        this.selectedHospitalData.yearlyData[thisyearfull]={}
      }
      this.yearDataArrayKeys=Object.keys(this.selectedHospitalData.yearlyData)
      this.loading = false;
    } catch (err) {
      console.log(err);
      await this.takeMeToDashboard(this.selectedPId);
      this.toastr.error("Error while fetching hospitals details, please try again");
    }
  }

  async makeDataReadyToDisplay(hpinfoid: any) {
    try {
      const timeStamp = new Date(this.selectedHospitalData.TimeStamp);
      this.selectedHospitalData.Date = monthNames[timeStamp.getMonth()] + " " + timeStamp.getFullYear();
      this.selectedHospitalData.VisaNames = [];
      this.newNote = "";
      if ("Visas" in this.selectedHospitalData) {
        for (let id of this.selectedHospitalData.Visas) {
          if (id in this.visaObject)
            this.selectedHospitalData.VisaNames.push(this.visaObject[id].Type);
        }
      }
      let index = undefined;
      this.notes = await this.dbservice.getNotesByUId(this.userProfile.uid.toString());
      for (let ind in this.notes) {
        let note = this.notes[ind];
        if (note.PId == this.selectedHospitalData.PId && note.HId == this.selectedHospitalData.HId) {
          index = ind;
          break;
        }
      }
      if (index != undefined)
        this.selectedHospitalData.myNotes = this.notes[index];
      let comments = this.dbservice.getAllCommentsByHPInfoId(hpinfoid, this.selectedHospitalData);
      let profiles = this.dbservice.getInterviewProfiles(this.selectedHospitalData);
      let matches = this.dbservice.getMatchedProfiles(this.selectedHospitalData);
      await Promise.all([comments, profiles, matches]);
      for (let i in this.selectedHospitalData) {
        if (typeof (this.selectedHospitalData[i]) === "string" && (this.selectedHospitalData[i].toLowerCase() == "na" || this.selectedHospitalData[i].toLowerCase() == "n/a"))
          this.selectedHospitalData[i] = "";
      }
    } catch (err) {
      await this.takeMeToDashboard(this.selectedPId);
      console.log(err);
      this.toastr.error("Error while fetching hospitals details, please try again");
    }
  }

  async takeMeFromFavNotToDisplay(pid: any, hid: any, hospital: any,frieda: any) {
    try {
      this.loading = true;
      this.landing = "Display";
      console.log("=============Loading==========")
      if(typeof hospital.ProgramInfo!="undefined")
      {
        this.selectedHospitalData=hospital.ProgramInfo;
      }
      else
      {
        this.selectedHospitalData = await this.dbservice.getHospitalsDataByPIdHId(hid, pid);
      }
      
      console.log("=============Loading==========",this.selectedHospitalData)
      await this.makeDataReadyToDisplay(this.selectedHospitalData.HPInfoId);
      this.selectedHospitalData.hospital = hospital;
      if(!this.selectedHospitalData.DataOfYear)
        {
          this.selectedHospitalData.DataOfYear=new Date().getFullYear();
        }
      this.loading = false;
    } catch (err) {
      await this.takeMeToSpeciality();
      this.toastr.error("Error while fetching hospitals details, please try again");
    }
  }

  createFilters(){
    let statesObj = [];
    let citiesObj = [];
    this.shownList.forEach(hospital => {
    const hospitalData = this.hospitalsByProgram[this.selectedPId][hospital.HId];
    if (!hospitalData) return;

    hospitalData.State && (statesObj[hospitalData.State.trim()] = 1);
    hospitalData.City && (citiesObj[hospitalData.City.trim()] = 1);

});
    this.shownStates = Object.keys(statesObj);
    this.shownCities = Object.keys(citiesObj);

  }

  setShownListToInitial() {
    const source = this.showTab === "Best" ? this.bestMatches[this.selectedPId] : this.showTab === "Possible" ? this.possibleMatches[this.selectedPId] : this.showTab === "Difficult" ? this.difficultMatches[this.selectedPId] : this.others[this.selectedPId];
    this.shownList = [...(source || [])];
    this.sortDataOnFilter("State", this.shownList);
    this.createFilters();
  }
  checkValue (val, toCheck) {
    let  toCheckNoValue = this.selectedDataNotAvailable;
    
    if(typeof toCheckNoValue=="undefined")
    {
      toCheckNoValue=false;
    }
 
    if (toCheckNoValue){
      return !val || val=== 'Data not available' || val === toCheck;
    }
    return val === toCheck;
  }
  yogCondition = (field, toCheck) => {
    const toCheckNoValue = this.selectedDataNotAvailable;
    if (toCheckNoValue && (!field || field=== 'Data not available')){
      return true;
    }
    if (toCheck === "YOG not a constrain" && (field=="YOG not a constrain" || field=="No cap on the number of years"))
      {
        return true;
      }
      else if(toCheck === "YOG not a constrain")
      {
        return false;
      }
    if (field === "YOG not a constrain")
    {
      return true;
    }
      
   
      //return field === toCheck;
      let val = 0;
    /*let parts = [];
    if (field){
      parts = field.split(" ");
    }
    let val = 0;
    if (parts.length > 1){
      val = parseInt(parts[1]);
    }*/
      var numbersVal=null;
    if(typeof field!="undefined")
    {
      numbersVal = field.match(/\d+/g);
    }
      
      if(numbersVal!=null && numbersVal.length)
      {
        val=Number(numbersVal[0]);
      }
    const toCheckValue = parseInt(toCheck.split(' ')[1]);
    return val >= toCheckValue;
  };
  stepCondition = (field, toCheck) => {
    const parts = toCheck.split(" ");
    const score = parseInt(parts[0]);
    const fieldScore = parseInt(field);
    if (!field || fieldScore < 0 || Number.isNaN(fieldScore)) 
      return this.selectedDataNotAvailable;
    return fieldScore <= score;
  }

stepConditionStep1 = (field, toCheck) => {
  if (field === null || field === undefined || field === "") {
    return this.selectedDataNotAvailable;
  }

  const fieldValue =
    typeof field === "number" ? field.toString() : String(field);

  const checkValue =
    typeof toCheck === "number" ? toCheck.toString() : String(toCheck);

  return fieldValue.trim().toLowerCase() === checkValue.trim().toLowerCase();
};
sortTable(column: string) {

  if (this.sortColumn === column) {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.shownList.sort((a: any, b: any) => {

    let valueA: any = '';
    let valueB: any = '';

    const hospitalA =
      a &&
      a.hospital
        ? a.hospital
        : (
            this.hospitalsByProgram &&
            this.hospitalsByProgram[this.selectedPId] &&
            this.hospitalsByProgram[this.selectedPId][a.HId]
              ? this.hospitalsByProgram[this.selectedPId][a.HId]
              : {}
          );

    const hospitalB =
      b &&
      b.hospital
        ? b.hospital
        : (
            this.hospitalsByProgram &&
            this.hospitalsByProgram[this.selectedPId] &&
            this.hospitalsByProgram[this.selectedPId][b.HId]
              ? this.hospitalsByProgram[this.selectedPId][b.HId]
              : {}
          );

    switch (column) {

      case 'hospital':
        valueA = hospitalA.HName || '';
        valueB = hospitalB.HName || '';
        break;

      case 'city':
        valueA = hospitalA.City || '';
        valueB = hospitalB.City || '';
        break;

      case 'state':
        valueA = hospitalA.State || '';
        valueB = hospitalB.State || '';
        break;

      case 'frieda':
        valueA = Number(a.Frieda);
        valueB = Number(b.Frieda);
        break;
      case 'signalssent':
        if(Number(this.selectedPId)==1)
        {
          valueA = Number(a.GoldSentInterviewed);
          valueB = Number(b.GoldSentInterviewed);
        }
        else
        {
          valueA = Number(a.SignalsSent);
          valueB = Number(b.SignalsSent);
        }
        break;

      case 'img':
        valueA =
          this.ConvertNumber(a.studentType_usimg)+this.ConvertNumber(a.studentType_nonusimg);

        valueB = this.ConvertNumber(b.studentType_usimg)+this.ConvertNumber(b.studentType_nonusimg);;
        break;

      case 'nonimg':
        valueA = this.ConvertNumber(a.studentType_nonusimg);

        valueB = this.ConvertNumber(b.studentType_nonusimg);
        break;

      case 'date':
        valueA = a.TimeStamp
          ? new Date(a.TimeStamp).getTime()
          : 0;

        valueB = b.TimeStamp
          ? new Date(b.TimeStamp).getTime()
          : 0;
        break;
    }

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
    }

    if (typeof valueB === 'string') {
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) {
      return this.sortDirection === 'asc' ? -1 : 1;
    }

    if (valueA > valueB) {
      return this.sortDirection === 'asc' ? 1 : -1;
    }

    return 0;
  });
}
SignalInvited = (field, toCheck) => {
  // Handle null/undefined/empty
  if (field === undefined || field === null || field === "") {
    return this.selectedDataNotAvailable;
  }

  // Convert to string
  field = String(field).trim();

  // Treat 99 as NA
  if (field === "99") {
    return this.selectedDataNotAvailable;
  }

  // Extract first number from field
  let fieldPercentage;

  if (!isNaN(field)) {
    fieldPercentage = Number(field);
  } else {
    const match = field.match(/\d+/);
    if (!match) {
      return this.selectedDataNotAvailable;
    }
    fieldPercentage = Number(match[0]);
  }

  // Extract percentage from condition
  const match = toCheck.match(/\d+/);
  if (!match) {
    return false;
  }

  const percentage = Number(match[0]);

  // Compare
  if (toCheck.toLowerCase().includes("less")) {
    return fieldPercentage < percentage;
  }

  if (toCheck.toLowerCase().includes("more")) {
    return fieldPercentage >= percentage;
  }

  return false;
};
percentageCondition = (field, toCheck) => {
    const parts = toCheck.split(" ");
    const percentage = parseInt(parts[0]);
    field=String(field)
    var numbersVal=null;
    let fieldPercentage=0
    if(field==99)
    {
      field="NA";
    }
    if(field=="99")
      {
        field="NA";
      }
    if(typeof field!="undefined")
    {
      if(isNaN(field))
      {
        numbersVal = field.match(/\d+/g);
      }
      else
      {
        numbersVal=Number(field);
      }
      
    }
      if(numbersVal!=null && numbersVal.length)
      {
        fieldPercentage=Number(numbersVal[0]);
      }
      if(numbersVal==null)
      {
        fieldPercentage=0;
      }
      else if(!isNaN(numbersVal))
      {
        fieldPercentage=numbersVal;
      }
    //const fieldPercentage = parseInt(field);
    if (!field || fieldPercentage < 0 || Number.isNaN(fieldPercentage)) 
      return this.selectedDataNotAvailable;
    return fieldPercentage >= percentage;
  }
  checkVisaFilter = (programData) => {
    let returnvalue=true;
    if(this.selectedVisas.includes(this.shownVisas[0]) && (!this.checkValue(programData.j1VisaNew, "Yes"))) 
    {
      returnvalue=false;
    }
    if(this.selectedVisas.includes(this.shownVisas[1]) && (!this.checkValue(programData.h1VisaNew, "Yes"))) 
    {
      returnvalue=false;
    }
    if(this.selectedVisas.includes(this.shownVisas[2]) && (!this.checkValue(programData.h4VisaNew, "Yes"))) 
    {
      returnvalue=false;
    }
    if(this.selectedVisas.includes(this.shownVisas[3]) && (!this.checkValue(programData.noVisaNew, "Yes"))) 
    {
      returnvalue=false;
    }
    if(this.selectedVisas.includes(this.shownVisas[4]) && (!this.checkValue(programData.f1VisaNew, "Yes"))) 
    {
      returnvalue=false;
    }
    return returnvalue;
  }
  filterSearch() {
    try
    {

    let text = this.search.trim().toLowerCase();
    this.setShownListToInitial();
    
    if (text)
      this.shownList = this.shownList.filter((item) => this.hospitalsByProgram[this.selectedPId][item.HId].HName.toLowerCase().includes(text));
    if (this.selectedCities.length)
    {
      this.shownList = this.shownList.filter(item => {
    const hospital = this.hospitalsByProgram[this.selectedPId][item.HId];
    console.log("this.selectedPId===>",this.selectedPId)
    return !hospital || !hospital.City || this.selectedCities.includes(hospital.City);
});
      //this.shownList = this.shownList.filter((item) => this.selectedCities.includes(this.hospitalsByProgram[this.selectedPId][item.HId]?.City));
    }
    if (this.selectedStates.length)
    {
        this.shownList = this.shownList.filter(item => {
    const hospital = this.hospitalsByProgram[this.selectedPId][item.HId];

    return !hospital || !hospital.State || this.selectedStates.includes(hospital.State);
});
      //this.shownList = this.shownList.filter((item) => this.selectedStates.includes(this.hospitalsByProgram[this.selectedPId][item.HId]?.State));
    }
    if (this.selectedCountries.length) {

  const countryCollegeSet = new Set<string>();

  this.selectedCountries.forEach(country => {

    const colleges =
      this.collegesByCountry[country] || [];

    colleges.forEach(college => {
      countryCollegeSet.add(
        String(college)
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase()
      );
    });

  });

  this.shownList = this.shownList.filter(item => {

    if (
      !item ||
      !item.medicalSchoolMatches ||
      !item.medicalSchoolMatches.length
    ) {
      return false;
    }

    return item.medicalSchoolMatches.some(school => {

      if (!school || !school.name) {
        return false;
      }

      const schoolName = String(school.name)
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      return countryCollegeSet.has(schoolName);
    });

  });
}
    if (this.selectedMedicalSchools.length) {

  this.shownList = this.shownList.filter(item => {


    if (
      !item ||
      !item.medicalSchoolMatches ||
      !item.medicalSchoolMatches.length
    ) {
      return false;
    }

    return item.medicalSchoolMatches.some(school =>
      this.selectedMedicalSchools.includes(school.name)
    );

  });

}
      
    
    if (this.selectedVisas.length){
      
      this.shownList = this.shownList.filter((item) => this.checkVisaFilter(item))
    }
    if (this.selectedNrmp){
      this.shownList = this.shownList.filter((item) => this.checkValue((item.Nrmp || "").trim(), this.selectedNrmp))
    }
    if (this.selectedEcfmg){
      this.shownList = this.shownList.filter((item) => this.checkValue((item.ECFMGReq || "").trim(), this.selectedEcfmg))
    }
    
    if (this.selectedYog){
      this.shownList = this.shownList.filter((item) => this.yogCondition(item.YOG, this.selectedYog))
    }

    if (this.selectedStep1){
      this.shownList = this.shownList.filter((item) => this.stepConditionStep1(item.Step1ScoreLastYearMin, this.selectedStep1))
    }
    
    if (this.selectedStep1){
      this.shownList = this.shownList.filter((item) => this.stepConditionStep1(item.Step1ScoreLastYearMin, this.selectedStep1))
    }
    if (this.selectedStep2){
      this.shownList = this.shownList.filter((item) => this.stepCondition(item.Step2ckNonIMGInvited10th, this.selectedStep2))
    }
    if (this.selectedSignalInvited){
      if(Number(this.selectedPId)==1)
      {
        this.shownList = this.shownList.filter((item) => this.SignalInvited(item.GoldSentInterviewed, this.selectedSignalInvited))
      }
      else
      {
        this.shownList = this.shownList.filter((item) => this.SignalInvited(item.SignalsSent, this.selectedSignalInvited))
      }
    }
    if (this.selectedUsImg){
      
      this.shownList = this.shownList.filter((item) => this.percentageCondition(item.imgpercentage, this.selectedUsImg))
    }
    if (this.selectedNonUsImg){
      this.shownList = this.shownList.filter((item) => this.percentageCondition(item.nonUsImgPercentage, this.selectedNonUsImg))
    }
    }
    catch(err)
    {
      console.log("error--->",err)
    }
  }

  getStep1Score(){
    if (this.userProfile.Step1Result === "Score")
      return this.userProfile.Step1Score;

    const avgScores = {
      1 : { noVisa : 225, visa : 238},
      2	: { noVisa :211, visa :	219},
      4	: { noVisa :225, visa :	239},
      7	: { noVisa :219, visa :	232},
      3	: { noVisa :220, visa :	229},
      5	: { noVisa :216, visa :	219},
      10 : { noVisa :236, visa :	238},
      12 : { noVisa :226, visa :	236},
      15 : { noVisa :220, visa :	230}
    };

    const needVisa = this.userProfile.Visas.indexOf("1") == -1 && this.userProfile.Visas.indexOf("6") == -1;
    if (needVisa)
      return avgScores[this.selectedPId] ? avgScores[this.selectedPId].visa : 0;
    return avgScores[this.selectedPId] ? avgScores[this.selectedPId].noVisa : 0;

  }

  exportToExcel(key): void 
  {
    if (key === "sarthi-list"){
      if (this.shownList.length === 0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
    }
    else{
      if(this.favorites.length==0 && !this.favorites.adminNotes){
        this.toastr.info("You cannot export an empty table");
        return;
      }
    }
    let fileName = `${key}.xlsx`;
    /* table id is passed over here */   
    let element = document.getElementById(key); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, fileName);
    
  }
}
