import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProgramService } from '../common/program.service';
import { HospitalService } from '../common/hospital.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { InterviewInsightsService } from './services/interview-insights.service';
import { AuthenticationService } from '../common/authentication.service';

@Component({
  selector: 'app-interview-insights',
  templateUrl: './interview-insights.component.html',
  styleUrls: ['./interview-insights.component.scss']
})
export class InterviewInsightsComponent implements OnInit {
  userData: any;
  landing: string;
  speciality: string = '';
  numHos: number = 0;
  loading: boolean = false;

  programObject: any = {};
  programList: any[] = [];

  interviewsObject: any = {};
  interviewsList: any[] = [];
  interviewsInfo: any[] = [];

  hospitalsList: any[] = [];
  selectValues: any[] = [];

  selectedInterview: any = {};
  selectedInterviewData: any = {};

  today = new Date();

  // Admin user search
  usersList: any[] = [];
  selectedUserId: string = '';
  selectedUser: any = null;
  userSearch: string = '';
  userLoading: boolean = false;
  private userSearchTimer: any;

  // v2_2027 configuration
  readonly formVersion = 'v2_2027';
  readonly interviewSeason = '2027';

  interviewerRoles: any[] = [
    'PD',
    'APD',
    'Faculty',
    'Chief resident',
    'Resident',
    'Coordinator',
    'Other'
  ];

  questionCategories: any[] = [
    'General',
    'Behavioral',
    'Situational/Ethical',
    'Clinical',
    'Application-specific',
    'Other'
  ];

  applicationTopics: any[] = [
    'Meaningful experience',
    'Impactful experience',
    'USCE',
    'Research/scholarly work',
    'Gap/YOG',
    'Exam attempt',
    'Specialty choice',
    'Geographic connection',
    'Signal',
    'Visa',
    'Other',
    'None recalled'
  ];

  otherDayActivities: any[] = [
    'Tour',
    'Resident Q&A',
    'Panel',
    'Other'
  ];

  // 2027 specialties identified in the supplied programmer feedback as tiered.
  // We match by specialty name so this does not depend on unknown PIds.
  tieredSpecialtyNames: any[] = [
    'internal medicine',
    'anesthesiology',
    'child neurology',
    'dermatology',
    'diagnostic radiology',
    'vascular surgery-integrated',
    'vascular surgery – integrated',
    'vascular surgery - integrated'
  ];

  constructor(
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private programApi: ProgramService,
    private hospitalApi: HospitalService,
    public calendar: NgbCalendar,
    private dbService: InterviewInsightsService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.userData = await this.authService.userData;
    await this.takeMeToBasic();
  }

  get isAdmin(): boolean {
    return !!(
      this.userData &&
      (this.userData.Role === 'Admin' || this.userData.role === 'Admin')
    );
  }

  getTargetUserId(): string {
    if (this.isAdmin && this.selectedUserId) {
      return this.selectedUserId;
    }
    return this.userData ? this.userData.uid : '';
  }

  getTargetUserName(): string {
    if (this.isAdmin && this.selectedUser) {
      return this.selectedUser.displayName || this.selectedUser.email || this.selectedUser.uid;
    }
    return this.userData ? (this.userData.displayName || this.userData.email || '') : '';
  }

  onUserSearchChange(value: string) {
    this.userSearch = value;

    if (
      this.selectedUser &&
      value === this.getUserDisplayText(this.selectedUser)
    ) {
      return;
    }

    this.selectedUser = null;
    this.selectedUserId = '';
    clearTimeout(this.userSearchTimer);

    if (!value || value.trim().length < 2) {
      this.usersList = [];
      return;
    }

    this.userSearchTimer = setTimeout(async () => {
      try {
        this.userLoading = true;
        this.usersList = await this.authService.searchUsers(value.trim());
      } catch (err) {
        console.error(err);
        this.toastr.error('Error while searching users');
      } finally {
        this.userLoading = false;
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    }, 350);
  }

  getUserDisplayText(user: any): string {
    if (!user) {
      return '';
    }
    const name = user.displayName || user.Name || '';
    const email = user.email || '';
    return name && email ? `${name} (${email})` : (name || email || user.uid || '');
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.selectedUserId = user.uid;
    this.userSearch = this.getUserDisplayText(user);
    this.usersList = [];
  }

  async takeMeToBasic() {
    try {
      this.loading = true;
      this.speciality = '';
      this.numHos = 0;
      this.landing = 'basic';

      this.programObject = await this.programApi.getProgramObject();
      this.programList = Object.values(this.programObject);
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while fetching specialities, please try again');
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  async getSelects() {
    

    if (this.numHos <= 0 || this.numHos > 10) {
      this.toastr.info('Please input a valid number of interviews, between 1-10');
      return;
    }

    if (!this.speciality) {
      this.toastr.info('Please select a valid specialty');
      return;
    }

    await this.takeMeToSelection();
  }

  async takeMeToSelection() {
    try {
      this.loading = true;
      this.landing = 'selection';
      this.selectValues = [];

      for (let i = 0; i < this.numHos; i++) {
        this.selectValues.push({
          hid: '',
          date: this.calendar.getToday(),
          signal: ''
        });
      }

      this.hospitalsList = await this.hospitalApi.getDisplayHospitalsByProgram(this.speciality);

      if (!this.hospitalsList || this.hospitalsList.length === 0) {
        this.toastr.info('No hospitals are currently assigned to the selected specialty, please select another one');
        this.landing = 'basic';
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while fetching hospitals, please try again');
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  getSelectedSpecialtyName(): string {
    const program = this.programObject ? this.programObject[this.speciality] : null;
    return program ? String(program.PName || program.Name || '') : '';
  }

  getHospitalById(hid: any): any {
    return (this.hospitalsList || []).find((hospital: any) => String(hospital.HId) === String(hid));
  }

  getSignalMode(select?: any): string {
    // Prefer explicit program/hospital configuration when available.
    const hospital = select && select.hid ? this.getHospitalById(select.hid) : null;
    const program = this.programObject ? this.programObject[this.speciality] : null;

    const configuredMode =
      (hospital && (hospital.signal_mode || hospital.SignalMode)) ||
      (program && (program.signal_mode || program.SignalMode));

    if (configuredMode) {
      const mode = String(configuredMode).toLowerCase();
      if (mode === 'tiered' || mode === 'single' || mode === 'none') {
        return mode;
      }
    }

    const specialtyName = this.getSelectedSpecialtyName().trim().toLowerCase();
    const isTiered = this.tieredSpecialtyNames.some((name: string) => specialtyName === name);
    return isTiered ? 'tiered' : 'single';
  }

  getSignalOptions(select?: any): any[] {
    const mode = this.getSignalMode(select);

    if (mode === 'tiered') {
      return ['Gold', 'Silver', 'No signal'];
    }

    if (mode === 'single') {
      return ['Yes', 'No'];
    }

    return ['Not applicable'];
  }

  onHospitalChange(select: any) {
    const mode = this.getSignalMode(select);
    if (mode === 'none') {
      select.signal = 'Not applicable';
    } else if (this.getSignalOptions(select).indexOf(select.signal) === -1) {
      select.signal = '';
    }
  }

  async postSelections() {
    try {
      this.loading = true;

      const targetUid = this.getTargetUserId();
      if (!targetUid) {
        this.toastr.info('Please select a user');
        return;
      }

      const allHIds: any = {};

      for (const select of this.selectValues) {
        const hid = select.hid;

        if (!hid) {
          this.toastr.info('Please select a hospital');
          return;
        }

        if (hid in allHIds) {
          this.toastr.info('Please select a distinct hospital');
          return;
        }

        allHIds[hid] = 1;

        if (!this.calendar.isValid(select.date) || this.calendar.getToday().after(select.date)) {
          this.toastr.error('Date is invalid');
          return;
        }

        if (!select.signal) {
          this.toastr.info('Please select the signaling response');
          return;
        }
      }

      const allPosts: any[] = [];

      for (const select of this.selectValues) {
        allPosts.push(
          this.dbService.addInterview(
            targetUid,
            select.hid,
            select.date,
            this.speciality,
            select.signal
          )
        );
      }

      await Promise.all(allPosts);
      this.toastr.success('Interview(s) added successfully');
      await this.takeMeToList();
    } catch (err) {
      console.error(err);
      this.toastr.error('One or more interviews have not been added successfully, please try again');
    } finally {
      this.loading = false;
    }
  }

  async takeMeToList() {
    try {
      /*if (this.isAdmin && !this.selectedUserId) {
        this.toastr.info('Please select a user first');
        this.landing = 'basic';
        return;
      }*/

      this.loading = true;
      this.landing = 'list';

      const targetUid = this.getTargetUserId();
      this.interviewsObject = await this.dbService.getInterviewsByUId(targetUid);
      this.interviewsList = Object.values(this.interviewsObject || {});

      this.interviewsList.sort(
        (a: any, b: any) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
      );

      if (this.interviewsList.length === 0) {
        this.toastr.info('No interviews have been added yet');
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while fetching interviews, please try again');
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  async takeMeToInfo(interview: any, index: number) {
    try {
      if (!this.isAllowedToAccess(interview, index)) {
        return;
      }

      this.loading = true;
      this.landing = 'display';
      this.selectedInterview = this.interviewsList[index];

      const allInfo = await this.dbService.getInterviewsInfoByHIdPId(interview.HId, interview.PId);

      // Legacy records have no Status. New v2 records should be shown after approval.
      this.interviewsInfo = (allInfo || []).filter((item: any) => {
        if (!item.FormVersion || item.FormVersion === 'legacy_v1') {
          return true;
        }
        return item.Status === 'approved' || item.Verified === 'Yes';
      });

      this.interviewsInfo.sort((a: any, b: any) => {
        const aTime = Number(a.TimeStamp || 0);
        const bTime = Number(b.TimeStamp || 0);
        return bTime - aTime;
      });

      if (this.interviewsInfo.length === 0) {
        this.toastr.info('No approved student reports are available for this program yet');
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while getting details for the hospital, please try again');
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  isAllowedToAccess(interview: any, index: number): boolean {
    const today = new Date().getTime();
    const interviewDate = new Date(interview.Date).getTime();
    const todayPlus2Weeks = today + 14 * 24 * 60 * 60 * 1000;

    if (interviewDate > todayPlus2Weeks) {
      this.toastr.info('Insights open 14 calendar days before your interview.');
      return false;
    }

    // Preserve current workflow: after a previous interview occurs,
    // its feedback must be completed before later insights are opened.
    for (let i = 0; i < index; i++) {
      const previousInterview = this.interviewsList[i];
      const previousInterviewDate = new Date(previousInterview.Date).getTime();

      if (previousInterviewDate <= today && previousInterview.ProvidedInfo === 'No') {
        this.toastr.info('Please complete the pending interview feedback and then continue');
        return false;
      }
    }

    return true;
  }

  getInterviewAccessStatus(interview: any, index: number): string {
    const today = new Date().getTime();
    const interviewDate = new Date(interview.Date).getTime();
    const opensAt = interviewDate - 14 * 24 * 60 * 60 * 1000;

    if (today < opensAt) {
      return 'Opens ' + new Date(opensAt).toLocaleDateString();
    }

    if (interview.ProvidedInfo === 'Yes') {
      return 'Feedback submitted';
    }

    for (let i = 0; i < index; i++) {
      const previousInterview = this.interviewsList[i];
      const previousInterviewDate = new Date(previousInterview.Date).getTime();
      if (previousInterviewDate <= today && previousInterview.ProvidedInfo === 'No') {
        return 'Feedback due before next access';
      }
    }

    return 'Available';
  }

  async takeMeToForm(interviewId: any) {
    try {
      this.loading = true;
      this.landing = 'form';
      this.selectedInterview = this.interviewsObject[interviewId];

      if (!this.selectedInterview) {
        this.toastr.error('Interview could not be found');
        await this.takeMeToList();
        return;
      }

      const today = new Date().getTime();
      if (new Date(this.selectedInterview.Date).getTime() > today) {
        this.toastr.info('Tell us your experience on or after the day of your interview');
        await this.takeMeToList();
        return;
      }

      if (this.selectedInterview.ProvidedInfo !== 'No') {
        this.toastr.info('You cannot update existing interview information.');
        this.landing = 'list';
        return;
      }

      this.selectedInterviewData = this.createV2FormData();
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while preparing the information form, please try again');
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  createV2FormData(): any {
    return {
      UId: this.getTargetUserId(),
      PId: this.selectedInterview.PId,
      HId: this.selectedInterview.HId,
      InterviewId: this.selectedInterview.InterviewId || '',

      FormVersion: this.formVersion,
      InterviewSeason: this.interviewSeason,

      interview_format: '',
      interview_format_other: '',
      virtual_platform: '',
      virtual_platform_other: '',

      total_day_duration_minutes: '',
      total_day_duration_do_not_recall: false,

      individual_interview_count: '',
      individual_interview_count_do_not_recall: false,

      individual_interview_duration_minutes: '',
      individual_interview_duration_do_not_recall: false,
      individual_interview_duration_varied: false,

      interviewer_roles: [],
      interviewer_role_other: '',

      questions_asked: [],
      do_not_recall_questions: false,

      application_topics_discussed: [],
      application_topic_details: '',

      program_presentation: '',
      presentation_details: '',

      resident_social: '',

      other_day_activities: [],
      other_day_activity_other: '',

      distinctive_observations: '',
      preparation_advice: '',

      overall_experience_rating: '',
      resident_interaction_rating: '',

      Status: 'pending_review',
      Verified: 'No',
      TimeStamp: Date.now()
    };
  }

  toggleArrayValue(array: any[], value: any, event: any) {
    if (!array) {
      return;
    }

    if (event.target.checked) {
      if (array.indexOf(value) === -1) {
        array.push(value);
      }
    } else {
      const index = array.indexOf(value);
      if (index > -1) {
        array.splice(index, 1);
      }
    }
  }

  toggleApplicationTopic(topic: string, event: any) {
    const values = this.selectedInterviewData.application_topics_discussed;

    if (topic === 'None recalled' && event.target.checked) {
      this.selectedInterviewData.application_topics_discussed = ['None recalled'];
      return;
    }

    if (topic !== 'None recalled' && event.target.checked) {
      const noneIndex = values.indexOf('None recalled');
      if (noneIndex > -1) {
        values.splice(noneIndex, 1);
      }
    }

    this.toggleArrayValue(values, topic, event);
  }

  addQuestion() {
    if (!this.selectedInterviewData.questions_asked) {
      this.selectedInterviewData.questions_asked = [];
    }

    this.selectedInterviewData.do_not_recall_questions = false;
    this.selectedInterviewData.questions_asked.push({
      question_text: '',
      interviewer_role: '',
      category: ''
    });
  }

  removeQuestion(index: number) {
    this.selectedInterviewData.questions_asked.splice(index, 1);
  }

  onDoNotRecallQuestionsChange() {
    if (this.selectedInterviewData.do_not_recall_questions) {
      this.selectedInterviewData.questions_asked = [];
    }
  }

  hasUsefulText(value: any): boolean {
    if (!value) {
      return false;
    }

    const text = String(value).trim();
    if (!text) {
      return false;
    }

    const useful = text.replace(/[^a-zA-Z0-9]/g, '');
    if (useful.length < 5) {
      return false;
    }

    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const filler = ['na', 'none', 'nothing', 'nil', 'norecall', 'dontknow', 'idk'];
    return filler.indexOf(normalized) === -1;
  }

  hasSubstantiveContribution(): boolean {
    const data = this.selectedInterviewData || {};

    const hasQuestion = (data.questions_asked || []).some(
      (q: any) => this.hasUsefulText(q.question_text)
    );

    return !!(
      hasQuestion ||
      this.hasUsefulText(data.application_topic_details) ||
      this.hasUsefulText(data.distinctive_observations) ||
      this.hasUsefulText(data.preparation_advice)
    );
  }

  validateV2Form(): boolean {
    const data = this.selectedInterviewData;

    if (!data.interview_format) {
      this.toastr.info('Please select the interview format');
      return false;
    }

    if (data.interview_format === 'Live virtual' && !data.virtual_platform) {
      this.toastr.info('Please select the virtual interview platform');
      return false;
    }

    if (!data.interviewer_roles || data.interviewer_roles.length === 0) {
      this.toastr.info('Please select at least one interviewer role');
      return false;
    }

    if (!data.application_topics_discussed || data.application_topics_discussed.length === 0) {
      this.toastr.info('Please select the application topics discussed, or choose None recalled');
      return false;
    }

    if (!data.program_presentation) {
      this.toastr.info('Please select the program presentation response');
      return false;
    }

    if (!data.resident_social) {
      this.toastr.info('Please select the resident social response');
      return false;
    }

    if (!this.hasSubstantiveContribution()) {
      this.toastr.info(
        'Please provide at least one useful interview question, application-topic detail, distinctive observation, or preparation tip.'
      );
      return false;
    }

    return true;
  }

  cleanV2DataBeforeSubmit() {
    const data = this.selectedInterviewData;

    if (data.interview_format !== 'Live virtual') {
      data.virtual_platform = '';
      data.virtual_platform_other = '';
    }

    if (data.virtual_platform !== 'Other') {
      data.virtual_platform_other = '';
    }

    if (data.interview_format !== 'Other') {
      data.interview_format_other = '';
    }

    if (data.program_presentation === 'None' || data.program_presentation === 'Do not recall') {
      data.presentation_details = '';
    }

    if (data.interviewer_roles.indexOf('Other') === -1) {
      data.interviewer_role_other = '';
    }

    if (data.other_day_activities.indexOf('Other') === -1) {
      data.other_day_activity_other = '';
    }

    if (data.total_day_duration_do_not_recall) {
      data.total_day_duration_minutes = '';
    }

    if (data.individual_interview_count_do_not_recall) {
      data.individual_interview_count = '';
    }

    if (data.individual_interview_duration_do_not_recall || data.individual_interview_duration_varied) {
      data.individual_interview_duration_minutes = '';
    }

    data.FormVersion = this.formVersion;
    data.InterviewSeason = this.interviewSeason;
    data.Status = 'pending_review';
    data.Verified = 'No';
    data.TimeStamp = Date.now();
  }

  async submitData() {
    if (!this.validateV2Form()) {
      return;
    }

    try {
      this.loading = true;
      this.cleanV2DataBeforeSubmit();

      await this.dbService.addInterviewData(
        this.selectedInterviewData,
        this.selectedInterview
      );

      this.toastr.success('Interview feedback has been submitted successfully');
      await this.takeMeToList();
    } catch (err) {
      console.error(err);
      this.toastr.error('Error while adding your interview experience, please try again');
    } finally {
      this.loading = false;
    }
  }

  isV2Report(report: any): boolean {
    return report && report.FormVersion === this.formVersion;
  }

  getReportSeason(report: any): string {
    if (report && report.InterviewSeason) {
      return report.InterviewSeason;
    }
    return 'Historical';
  }

  getReportCount(): number {
    return this.interviewsInfo ? this.interviewsInfo.length : 0;
  }

  getReportSeasons(): string {
    const seasons: any[] = [];
    (this.interviewsInfo || []).forEach((report: any) => {
      const season = this.getReportSeason(report);
      if (seasons.indexOf(season) === -1) {
        seasons.push(season);
      }
    });
    return seasons.join(', ');
  }

  displayArray(values: any): string {
    return Array.isArray(values) && values.length ? values.join(', ') : 'Not reported';
  }
}
