import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { CrowdSourcingService } from "../../crowd-sourcing/services/crowd-sourcing.service";
import * as firebase from "firebase";
import { HospitalFormData } from "../../models/hospital-form-data";
import { HospitalService } from "../../common/hospital.service";
import { User } from "../../models/user";
import { UserService } from "../../common/user.service";
import { Hospital } from "../../models/hospital";
import { AuthenticationService } from "../../common/authentication.service";
import { ToastrService } from "ngx-toastr";
import { ProgramService } from "../../common/program.service";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import { query } from "@angular/animations";
import { RankOrderServicesService } from "../../rank-order-list/services/rank-order-services.service";
import { ProfileService } from "../../profile/services/profile.service";

@Injectable({
  providedIn: "root",
})
export class AdminServicesService {
  verifyList: any = {};
  verifyListUpdated: boolean = true;
  paymentKeys = ["matchPayments", "researchPayments", "rotations"];
  enrollmentKeys = [
    "matchEnrollmentDate",
    "researchEnrollmentDate",
    "rotationEnrollmentDate",
  ];
  constructor(
    private firestore: AngularFirestore,
    private hospitalApi: HospitalService,
    private userApi: UserService,
    private crowdSourcingService: CrowdSourcingService,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private programApi: ProgramService,
    private rolApi: RankOrderServicesService,
    private profileService: ProfileService
  ) {}

  getUSDate(date) {
    if (!date) return date;

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  async getHospitalsForVerification(): Promise<any> {
    let hids = [];
    let uids = [];
    await this.firestore
      .collection<HospitalFormData>("HospitalProgramInfo", (ref) =>
        ref.where("Verified", "==", "No").where("Status", "==", "Completed")
      )
      .get()
      .toPromise()
      .then(async (docsRef) => {
        for (let i in docsRef.docs) {
          let doc = docsRef.docs[i];
          let data = doc.data();
          data.HPInfoId = doc.id;
          data.TimeStampDate = new Date(data.TimeStamp).toDateString();
          let documentid=data.documentid?data.documentid:data.id;
          this.verifyList[documentid] = data;
          hids.push(data.HId);
          uids.push(data.UId);
        }
        let users = this.getUsersByUIds(uids);
        let hospitals = this.getHospitalsByHIds(hids);
        await Promise.all([users, hospitals]).then((results) => {
          for (let i in this.verifyList) {
            this.verifyList[i].user =
              results[0][this.verifyList[i].UId] || null;
            this.verifyList[i].hospital =
              results[1][this.verifyList[i].HId] || null;
          }
        });
      });
    this.verifyListUpdated = false;
    return this.verifyList;
  }
  async getUsersByUIds(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection<User>(`Users`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        users[doc.id] = doc.data();
      }
    }
    return users;
  }
  async getExtraInfoUsersByUIds(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection<User>(`UsersExtraData`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        users[doc.id] = doc.data();
      }
    }
    return users;
  }

  async getUsersByEmails(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    let userIds = {};
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection<User>(`Users`, (ref) => ref.where("email", "in", spliced))
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        let docData = doc.data();
        users[docData.email] = docData;
        userIds[docData.email] = doc.id;
      }
    }
    return { users, userIds };
  }

  async getHospitalsByHIds(hids: any[]) {
    let spliced = [];
    let hospitals = {};
    let calls = [];
    const statesByStateName = this.getStatesByStateName();
    while (hids.length > 0) {
      if (hids.length > 10) spliced = hids.splice(0, 10);
      else spliced = hids.splice(0, hids.length);
      calls.push(
        this.firestore
          .collection<Hospital>(`Hospital`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        let hospitalData = doc.data();
        hospitals[doc.id] = hospitalData;
        if (
          hospitalData.State &&
          hospitalData.State.toLowerCase() &&
          statesByStateName[hospitalData.State.toLowerCase()]
        )
          hospitals[doc.id].states =
            statesByStateName[hospitalData.State.toLowerCase()];
      }
    }
    return hospitals;
  }
  async verifyRejectData(dataObject: any, adminEmail: any) {
    console.log("dataObject---->",dataObject)
    let Documentid=dataObject.documentid?dataObject.documentid:dataObject.id?dataObject.id:dataObject.HPInfoId;
    let docRef = await this.firestore
      .doc(`HospitalProgramInfo/${Documentid}`)
      .update({
        Verified: dataObject.Verified,
        VerifiedAdmin: adminEmail,
        VerifyComment:dataObject.VerifyComment?dataObject.VerifyComment:'',
      });
    this.verifyListUpdated = true;
    return dataObject;
  }
  async getVisaObject() {
    let visaObject = {};
    let visaList = await this.crowdSourcingService.getVisaList();
    for (let i in visaList) {
      let data = visaList[i];
      visaObject[data.VId] = data;
    }
    return visaObject;
  }
  async getAllUsers() {
    return await this.userApi.getAllUsers();
  }

  async getAllUsersWithMedicalSchool() {
    return await this.userApi.getAllUsersWithMedicalSchool();
  }
  async verifyRejectUsers(dataObject, uid) {
    return await this.userApi.verifyRejectUsers(dataObject, uid);
  }
  async changeRole(dataObject) {
    return await this.userApi.changeRole(dataObject);
  }
  async getSomeUsers(val) {
    return await this.userApi.getSomeUsers(val);
  }
  async getNAusers(): Promise<any> {
    return await this.userApi.getNAusers();
  }

  async getExtraUserInfo(user) {
    let extraDocRef = await this.firestore
      .doc(`UsersExtraData/${user.uid}`)
      .get()
      .toPromise();
    if (!extraDocRef.exists) {
      return { extraUsersData: false };
    } else {
      return {
        extraUsersData: true,
        ...extraDocRef.data(),
      };
    }
  }
  async updateMainProfile(userData) {
    let dataObject = {
      Step1Score: userData.Step1Score,
      Step2Score: userData.Step2Score,
      YOG: userData.YOG,
      Visas: userData.Visas,
      USCE: userData.USCE,
      Step1Result: userData.Step1Result,
      Step2Result: userData.Step2Result,
    };
    Object.keys(dataObject).forEach((key) => {
      if (dataObject[key] === undefined) {
        delete dataObject[key];
      }
    });
    await this.firestore
      .doc(`Users/${userData.uid}`)
      .set(dataObject, { merge: true });
  }

  async updateExtraProfile(userData) {
    let dataObject = { ...userData };
    delete dataObject.email;
    delete dataObject.emailVerified;
    delete dataObject.Role;
    delete dataObject.Locked;
    delete dataObject.extraUsersData;
    delete dataObject.displayName;
    await this.firestore
      .doc(`UsersExtraData/${userData.uid}`)
      .set(dataObject, { merge: true });
  }
  async updateUserPayments(userData, uid) {
    let dataObject = { ...userData };
    for (let enrollmentKey of this.enrollmentKeys) {
      if (dataObject[enrollmentKey]) {
        let date = dataObject[enrollmentKey];
        dataObject[enrollmentKey] = new Date(
          Date.UTC(date.year, date.month - 1, date.day)
        ).getTime();
      }
    }
    for (let paymentKey of this.paymentKeys) {
      if (dataObject[paymentKey] && dataObject[paymentKey].length > 0) {
        for (let payment of dataObject[paymentKey]) {
          if (payment.date) {
            let { date } = payment;
            payment.date = new Date(
              Date.UTC(date.year, date.month - 1, date.day)
            ).getTime();
          }
        }
      }
    }
    dataObject.updatedAt = Date.now();
    if (uid)
      await this.firestore
        .doc(`UsersPayments/${uid}`)
        .set(dataObject, { merge: true });
    else await this.firestore.collection("UsersPayments").add(dataObject);
  }

  async getVisaList() {
    return await this.crowdSourcingService.getVisaList();
  }

  async getProgramObject() {
    return await this.programApi.getProgramObject();
  }

  async getHospitalsByProgram(pid: any) {
    return await this.hospitalApi.getHospitalsByProgram(pid);
  }

  async addRolData(dataObject) {
    dataObject.TimeStamp = Date.now();
    dataObject.Verified = "Yes";
    await this.firestore.collection("OtherHospitalProgramInfo").add(dataObject);
  }

  async getUserProfile(user) {
    let docRef = await this.firestore
      .doc(`Users/${user.uid}`)
      .get()
      .toPromise();
    return docRef.data();
  }

  async getUserPayments(user) {
    let docRef = await this.firestore
      .doc(`UsersPayments/${user.uid}`)
      .get()
      .toPromise();
    let dataObject = {};
    if (docRef.exists) dataObject = docRef.data();
    else dataObject = {};
    for (let enrollmentKey of this.enrollmentKeys) {
      if (dataObject[enrollmentKey]) {
        let date = new Date(dataObject[enrollmentKey]);
        dataObject[enrollmentKey] = {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        };
      }
    }
    for (let paymentKey of this.paymentKeys) {
      if (dataObject[paymentKey] && dataObject[paymentKey].length > 0) {
        for (let payment of dataObject[paymentKey]) {
          if (payment.date) {
            let date = new Date(payment.date);
            payment.date = {
              day: date.getDate(),
              month: date.getMonth() + 1,
              year: date.getFullYear(),
            };
          }
        }
      }
    }
    return dataObject;
  }

  async getUserMatch(user) {
    let userMatch: any = {};
    let docRef = await this.firestore
      .doc(`UsersMatch/${user.uid}`)
      .get()
      .toPromise();
    if (docRef.exists) {
      userMatch = { ...docRef.data() };
      userMatch.hospital = (
        await this.firestore
          .doc(`Hospital/${docRef.data().HId}`)
          .get()
          .toPromise()
      ).data();
    }
    return userMatch;
  }

  async updateUserMatch(dataObject, user) {
    let data = {
      UId: user.uid,
      HId: dataObject.newHId,
      PId: dataObject.newPId,
      yearMatch: dataObject.newYearMatch,
    };
    await this.firestore
      .doc(`UsersMatch/${user.uid}`)
      .set(data, { merge: true });
  }

  async getSomeHospitals(hospital) {
    return await this.hospitalApi.getSomeHospitals(hospital);
  }

  async updateHospital(dataObject) {
    let batch = this.firestore.firestore.batch();
    let newPIds = dataObject.PIds || [];
    for (let pid of dataObject.NewPIds) {
      if (newPIds.indexOf(pid) == -1) {
        newPIds.push(pid);
        let docId = this.firestore.createId();
        let docRef = this.firestore
          .collection("HospitalProgram")
          .doc(docId).ref;
        batch.set(docRef, {
          HId: dataObject.HId,
          PId: pid,
          HPId: docId,
          AssignedNum: 0,
          Year: new Date(Date.now()).getFullYear().toString(),
        });
      }
    }
    let docRef = this.firestore.collection("Hospital").doc(dataObject.HId).ref;
    batch.update(docRef, {
      PIds: newPIds,
      HName: dataObject.HName,
      City: dataObject.City,
      State: dataObject.State,
    });
    await batch.commit();
    dataObject.PIds = newPIds;
  }

  async addNewHospital(dataObject) {
    let batch = this.firestore.firestore.batch();
    let hid = this.firestore.createId();
    for (let pid of dataObject.PIds) {
      let docId = this.firestore.createId();
      let docRef = this.firestore.collection("HospitalProgram").doc(docId).ref;
      batch.set(docRef, {
        HId: hid,
        PId: pid,
        HPId: docId,
        AssignedNum: 0,
        Year: new Date(Date.now()).getFullYear().toString(),
      });
    }
    let docRef = this.firestore.collection("Hospital").doc(hid).ref;
    batch.set(docRef, {
      HId: hid,
      PIds: dataObject.PIds,
      HName: dataObject.HName,
      City: dataObject.City,
      State: dataObject.State,
    });
    await batch.commit();
  }

  async addUserForMatch(dataObject) {
    let batch = this.firestore.firestore.batch();
    let userId = "virtualMatch_" + this.firestore.createId();
    let userDocRef = this.firestore.collection("Users").doc(userId).ref;
    batch.set(userDocRef, {
      uid: userId,
      displayName: dataObject.displayName,
      email: dataObject.email,
      Step1Score: dataObject.Step1Score,
      Step2Score: dataObject.Step2Score,
      YOG: dataObject.YOG,
      USCE: dataObject.USCE,
      Visas: dataObject.Visas,
      Locked: "1",
    });
    let userRoleDocRef = this.firestore
      .collection("UsersRoles")
      .doc(userId).ref;
    batch.set(userRoleDocRef, {
      uid: userId,
      email: dataObject.email,
      displayName: dataObject.displayName,
      Role: "Default",
    });
    let userMatchDocRef = this.firestore
      .collection("UsersMatch")
      .doc(userId).ref;
    batch.set(userMatchDocRef, {
      HId: dataObject.HId,
      PId: dataObject.PId,
      UId: userId,
      yearMatch: dataObject.yearMatch,
    });
    await batch.commit();
  }

  async checkIfUserPresent(email) {
    let docRef = await this.firestore
      .collection("UsersRoles", (ref) => ref.where("email", "==", email))
      .get()
      .toPromise();
    if (docRef.empty) return false;
    else return true;
  }

  async getAllInterviews() {
    //let refDate = new Date(Date.UTC(new Date().getFullYear(), 8, 15)).getTime();
    const now = new Date();

const currentYear = now.getFullYear();

// Sept 15 of current year (UTC)
const sept15CurrentYear = new Date(
  Date.UTC(currentYear, 8, 15)
);

// Decide year
const refYear = now < sept15CurrentYear
  ? currentYear - 1
  : currentYear;

// Final reference date (Sept 15 of correct year)
let refDate = new Date(
  Date.UTC(refYear, 8, 15)
).getTime();
    let collectionRef = await this.firestore
      .collection("Interviews", (ref) => ref.where("Date", ">=", refDate))
      .get()
      .toPromise();
    let interviews = [];
    let uids = {};
    let hids = {};
    for (let doc of collectionRef.docs) {
      let data = doc.data();
      let utcDate = new Date(data.Date);
      data.Date = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      ).toDateString();
      data.id = doc.id;
      uids[data.UId] = 1;
      hids[data.HId] = 1;
      interviews.push(data);
    }
    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getHospitalsByHIds(Object.keys(hids)),
      this.getExtraInfoUsersByUIds(Object.keys(uids)),
    ]);
    for (let interview of interviews) {
      interview.user = result[0][interview.UId] ? result[0][interview.UId] : {};
      interview.hospital = result[1][interview.HId]
        ? result[1][interview.HId]
        : {};
      interview.extraUser = result[2][interview.UId]
        ? result[2][interview.UId]
        : {};
    }
    return interviews;
  }

  async getAllInterviewsInfo() {
    let refDate = new Date(Date.UTC(new Date().getFullYear()-1, 8, 15)).getTime();
    let collectionRef = await this.firestore
      .collection("InterviewsInfo", (ref) =>
        ref.where("TimeStamp", ">=", refDate)
      )
      .get()
      .toPromise();
    let interviewsData = {};
    for (let doc of collectionRef.docs) {
      let data = doc.data();
      let key = data.HId + "." + data.PId + "." + data.UId;
      interviewsData[key] = data;
    }
    return interviewsData;
  }

  async getAllInterviewsData() {
    let refDate = new Date(Date.UTC(new Date().getFullYear()-1, 8, 15)).getTime();
    let collectionRef = await this.firestore
      .collection("Interviews", (ref) =>
        ref.where("Date", ">=", refDate).where("ProvidedInfo", "==", "Yes")
      )
      .get()
      .toPromise();
    let interviews = [];
    let uids = {};
    let hids = {};
    for (let doc of collectionRef.docs) {
      let data = doc.data();
      let utcDate = new Date(data.Date);
      data.Date = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      ).toDateString();
      data.id = doc.id;
      uids[data.UId] = 1;
      hids[data.HId] = 1;
      interviews.push(data);
    }
    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getHospitalsByHIds(Object.keys(hids)),
    ]);
    for (let interview of interviews) {
      interview.user = result[0][interview.UId] ? result[0][interview.UId] : {};
      interview.hospital = result[1][interview.HId]
        ? result[1][interview.HId]
        : {};
    }
    return interviews;
  }

  async replaceHospital(pid, fromHId, toHId, fromHospitalData, toHospitalData) {
    let batch = this.firestore.firestore.batch();
    let collections = [
      "HospitalProgram",
      "HospitalProgramInfo",
      "UserFav",
      "UserNote",
      "Interviews",
      "InterviewsInfo",
      "HospitalScores",
      "UsersMatch",
      "OtherHospitalProgramInfo",
    ];
    let calls = [];
    for (let collection of collections) {
      let call = this.firestore
        .collection(collection, (ref) => ref.where("HId", "==", fromHId))
        .get()
        .toPromise();
      calls.push(call);
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let doc of result.docs) {
        batch.update(doc.ref, {
          HId: toHId,
        });
      }
    }
    let mergedPIds = [
      ...new Set([...fromHospitalData.PIds, ...toHospitalData.PIds]),
    ];
    let fromHospitalDoc = this.firestore.doc(`Hospital/${fromHId}`).ref;
    batch.delete(fromHospitalDoc);
    let toHospitalDoc = this.firestore.doc(`Hospital/${toHId}`).ref;
    batch.update(toHospitalDoc, {
      PIds: mergedPIds,
    });
    let id = this.firestore.createId();
    let docRef = this.firestore.doc(`HospitalsReplacedRecords/${id}`).ref;
    batch.set(docRef, {
      fromHId: fromHId,
      toHId: toHId,
      PId: pid,
      ts: Date.now(),
    });
    await batch.commit();
  }

  async clearInterviewData(interview) {
    let batch = this.firestore.firestore.batch();
    let interviewDocRef = this.firestore.doc(
      `Interviews/${interview.InterviewId}`
    ).ref;
    batch.update(interviewDocRef, { ProvidedInfo: "No" });
    let dataDocRef = null;
    let docs = await this.firestore
      .collection("InterviewsInfo", (ref) =>
        ref
          .where("PId", "==", interview.PId)
          .where("HId", "==", interview.HId)
          .where("UId", "==", interview.UId)
          .limit(1)
      )
      .get()
      .toPromise();
    if (docs.empty) throw "Data not found";
    batch.delete(docs.docs[0].ref);
    await batch.commit();
  }
  async getRotationQueriesEnquirySearch(SelYear,SelEnqNo) {
    let docsRef;
    const selYear = Number(SelYear); // Convert to number
    const selEnqNo = Number(SelEnqNo);
    console.log("selYear--->",selYear)
    console.log("selEnqNo--->",selEnqNo)
      docsRef = await this.firestore
        .collection("Enquiries", (ref) => ref.where("inquiryYear", "==", selYear).where("inquiryID", "==", selEnqNo))
        .get()
        .toPromise();
    let data = [];
    let uids = {};
    let rids = {};

    for (let doc of docsRef.docs) {
      let docData = doc.data();
      docData.id = doc.id;
      let utcDate = new Date(docData.startDate);
      let timestamp = new Date(docData.timestamp);
      docData.startDate = this.getUSDate(
        new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        )
      );
      docData.timestamp = this.getUSDate(
        new Date(
          timestamp.getUTCFullYear(),
          timestamp.getUTCMonth(),
          timestamp.getUTCDate()
        )
      );
      uids[docData.uid] = 1;
      rids[docData.rotationId] = 1;
      data.push(docData);
    }

    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getRotationsByRIds(Object.keys(rids)),
    ]);
    for (let docData of data) {
      docData.user = result[0][docData.uid] ? result[0][docData.uid] : {};
      docData.rotation = result[1][docData.rotationId]
        ? result[1][docData.rotationId]
        : {};
    }
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return data;
  }
  async getRotationQueries(status = "") {
    let docsRef;
    if (status == "")
      docsRef = await this.firestore.collection("Enquiries").get().toPromise();
    else
      docsRef = await this.firestore
        .collection("Enquiries", (ref) => ref.where("status", "==", status))
        .get()
        .toPromise();
    let data = [];
    let uids = {};
    let rids = {};

    for (let doc of docsRef.docs) {
      let docData = doc.data();
      docData.id = doc.id;
      let utcDate = new Date(docData.startDate);
      let timestamp = new Date(docData.timestamp);
      docData.startDate = this.getUSDate(
        new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        )
      );
      docData.timestamp = this.getUSDate(
        new Date(
          timestamp.getUTCFullYear(),
          timestamp.getUTCMonth(),
          timestamp.getUTCDate()
        )
      );
      uids[docData.uid] = 1;
      rids[docData.rotationId] = 1;
      data.push(docData);
    }

    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getRotationsByRIds(Object.keys(rids)),
    ]);
    for (let docData of data) {
      docData.user = result[0][docData.uid] ? result[0][docData.uid] : {};
      docData.rotation = result[1][docData.rotationId]
        ? result[1][docData.rotationId]
        : {};
    }
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return data;
  }

  async getRecentRotationQueries(status = "", fromDateTIme, toDateTime) {
    let docsRef = await this.firestore
      .collection("Enquiries", (ref) =>
        ref
          .where("status", "==", status)
          .where("timestamp", ">=", fromDateTIme)
          .where("timestamp", "<=", toDateTime)
      )
      .get()
      .toPromise();
    let data = [];
    let uids = {};
    let rids = {};

    for (let doc of docsRef.docs) {
      let docData = doc.data();
      docData.id = doc.id;
      let utcDate = new Date(docData.startDate);
      let timestamp = new Date(docData.timestamp);
      docData.startDate = this.getUSDate(
        new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        )
      );
      docData.timestamp = this.getUSDate(
        new Date(
          timestamp.getUTCFullYear(),
          timestamp.getUTCMonth(),
          timestamp.getUTCDate()
        )
      );
      uids[docData.uid] = 1;
      rids[docData.rotationId] = 1;
      data.push(docData);
    }

    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getRotationsByRIds(Object.keys(rids)),
    ]);
    for (let docData of data) {
      docData.user = result[0][docData.uid] ? result[0][docData.uid] : {};
      docData.rotation = result[1][docData.rotationId]
        ? result[1][docData.rotationId]
        : {};
    }
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return data;
  }

  async getRecentRotationQueriesForAllStatus(fromDateTIme, toDateTime) {
    let docsRef = await this.firestore
      .collection("Enquiries", (ref) =>
        ref
          .where("timestamp", ">=", fromDateTIme)
          .where("timestamp", "<=", toDateTime)
      )
      .get()
      .toPromise();
    let data = [];
    let uids = {};
    let rids = {};

    for (let doc of docsRef.docs) {
      let docData = doc.data();
      docData.id = doc.id;
      let utcDate = new Date(docData.startDate);
      let timestamp = new Date(docData.timestamp);
      docData.startDate = this.getUSDate(
        new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        )
      );
      docData.timestamp = this.getUSDate(
        new Date(
          timestamp.getUTCFullYear(),
          timestamp.getUTCMonth(),
          timestamp.getUTCDate()
        )
      );
      uids[docData.uid] = 1;
      rids[docData.rotationId] = 1;
      data.push(docData);
    }

    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getRotationsByRIds(Object.keys(rids)),
    ]);
    for (let docData of data) {
      docData.user = result[0][docData.uid] ? result[0][docData.uid] : {};
      docData.rotation = result[1][docData.rotationId]
        ? result[1][docData.rotationId]
        : {};
    }
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return data;
  }
  async getRotationByWhere(FieldName,FieldCondition,FieldValue) {
    let docsRef;
    docsRef = await this.firestore
        .collection("Rotations", (ref) =>
          ref
            .where(FieldName, FieldCondition, FieldValue)
        )
        .get()
        .toPromise();
      return docsRef;
  }
  async getHousingQueries(status = "") {
    const dateTime = new Date("01/01/2024").getTime();
    let docsRef;
    if (status == "")
      docsRef = await this.firestore
        .collection("HousingEnquiries", (ref) =>
          ref.where("timestamp", ">=", dateTime).orderBy("timestamp", "desc")
        )
        .get()
        .toPromise();
    else
      docsRef = await this.firestore
        .collection("HousingEnquiries", (ref) =>
          ref
            .where("status", "==", status)
            .where("timestamp", ">=", dateTime)
            .orderBy("timestamp", "desc")
        )
        .get()
        .toPromise();
    let data = [];
    let uids = {};
    let rids = {};

    for (let doc of docsRef.docs) {
      let docData = doc.data();
      docData.id = doc.id;
      let utcDate = new Date(docData.startDate);
      let timestamp = new Date(docData.timestamp);
      docData.startDate = this.getUSDate(
        new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        )
      );
      docData.timestamp = this.getUSDate(
        new Date(
          timestamp.getUTCFullYear(),
          timestamp.getUTCMonth(),
          timestamp.getUTCDate()
        )
      );
      uids[docData.uid] = 1;
      rids[docData.housingId] = 1;
      data.push(docData);
    }

    let result = await Promise.all([
      this.getUsersByUIds(Object.keys(uids)),
      this.getHousingsByRIds(Object.keys(rids)),
    ]);
    for (let docData of data) {
      docData.user = result[0][docData.uid] ? result[0][docData.uid] : {};
      docData.housing = result[1][docData.housingId]
        ? result[1][docData.housingId]
        : {};
    }
    return data;
  }

  async getRotationsByRIds(rids: any[]) {
    let spliced = [];
    let rotations = {};
    let calls = [];
    while (rids.length > 0) {
      if (rids.length > 10) spliced = rids.splice(0, 10);
      else spliced = rids.splice(0, rids.length);
      calls.push(
        this.firestore
          .collection(`Rotations`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        rotations[doc.id] = doc.data();
      }
    }
    return rotations;
  }

  async getHousingsByRIds(rids: any[]) {
    let spliced = [];
    let rotations = {};
    let calls = [];
    while (rids.length > 0) {
      if (rids.length > 10) spliced = rids.splice(0, 10);
      else spliced = rids.splice(0, rids.length);
      calls.push(
        this.firestore
          .collection(`Housings`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        rotations[doc.id] = doc.data();
      }
    }
    return rotations;
  }

  async updateEnquiry(docId, newStatus, newQuery) {
    await this.firestore.doc(`Enquiries/${docId}`).update({
      status: newStatus,
      replyquery: newQuery,
    });
  }
  async updateEnquiryBatch(docIds, newStatus, newQuery) {
    let batch = this.firestore.firestore.batch();
    for (let docId of docIds) {
      const docRef = this.firestore.doc(`Enquiries/${docId}`).ref;
      batch.update(docRef, {
        status: newStatus,
        replyquery: newQuery,
      });
    }
    await batch.commit();
  }

  async updateHousingEnquiry(docId, newStatus, newQuery) {
    await this.firestore.doc(`HousingEnquiries/${docId}`).update({
      status: newStatus,
      query: newQuery,
    });
  }

  async getListOfDoctors() {
    let limitedRotations = {};
    let docsRef = await this.firestore
      .collection("RotationDoctors", (ref) =>
        ref
          .orderBy("representingEmail")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[docData.id] = { ...docData, ...{ rotationId: doc.id } };
    }
    return limitedRotations;
  }
  async getSomeRotations(val) {
    let limitedRotations = {};
    let docsRef = await this.firestore
      .collection("Rotations", (ref) =>
        ref
          .orderBy("title")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[docData.id] = { ...docData, ...{ rotationId: doc.id } };
    }
    docsRef = await this.firestore
      .collection("Rotations", (ref) =>
        ref
          .orderBy("city")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[docData.id] = { ...docData, ...{ rotationId: doc.id } };
    }
    docsRef = await this.firestore
      .collection("Rotations", (ref) =>
        ref
          .orderBy("state")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[docData.id] = { ...docData, ...{ rotationId: doc.id } };
    }

    docsRef = await this.firestore
      .collection("Rotations", (ref) =>
        ref
          .orderBy("location_code")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[docData.id] = { ...docData, ...{ rotationId: doc.id } };
    }
    return limitedRotations;
  }

  async getRotationEmail(rotation) {
    let docsRef = await this.firestore
      .doc(`RotationEmails/${rotation.rotationId}`)
      .get()
      .toPromise();
    if (docsRef.exists) return docsRef.data();
    return {};
  }

  async updateRotation(dataObject) {
    
    let batch = this.firestore.firestore.batch();
    let docEmailRef = this.firestore
      .collection("RotationEmails")
      .doc(dataObject.rotationId).ref;
    let docRef = this.firestore
      .collection("Rotations")
      .doc(dataObject.rotationId).ref;
    batch.update(docRef, {
      title: dataObject.title,
      specialty: dataObject.specialty,
      fee: dataObject.fee,
      type: dataObject.type,
      location_code: dataObject.location_code,
      state: dataObject.state,
      city: dataObject.city,
      duration: dataObject.duration,
      rotation_setting: dataObject.rotation_setting,
      affiliations: dataObject.affiliations,
      residency: dataObject.residency,
      rounds: dataObject.rounds,
      lor_type: dataObject.lor_type,
      description: dataObject.description,
      registration_fee: dataObject.registration_fee,
      visa_letter: dataObject.visa_letter,
      rank: dataObject.rank,
      lor_number: dataObject.lor_number || "",
      offers: dataObject.offers || "",
      combo_rotation: dataObject.combo_rotation || "",
      zipCode: dataObject.zipCode,
      documentation: dataObject.documentation,
      payment_policy: dataObject.payment_policy,
      refund_policy_link: dataObject.refund_policy_link,
      visa_letter_cost: dataObject.visa_letter_cost,
      hours: dataObject.hours,
      program_director: dataObject.program_director || "",
    });
    batch.set(
      docEmailRef,
      {
        admin_email: dataObject.admin_email,
        location_code: dataObject.location_code,
      },
      { merge: true }
    );
    await batch.commit();
  }

  async addNewRotation(dataObject,RotationList) {
    console.log("dataObject----->",RotationList)
    console.log("dataObject.doctorofrotation--->",dataObject.doctorofrotation)
    let DoctorObjectToSet={};
    if(dataObject.doctorofrotation.lenth)
    {
      DoctorObjectToSet={id:dataObject.doctorofrotation[0],representingEmail:RotationList[dataObject.doctorofrotation[0]].representingEmail};
    }
    let batch = this.firestore.firestore.batch();
    let newRotationId = this.firestore.createId();
    let docEmailRef = this.firestore
      .collection("RotationEmails")
      .doc(newRotationId).ref;
    let docRef = this.firestore.collection("Rotations").doc(newRotationId).ref;
    batch.set(docRef, {
      title: dataObject.title,
      specialty: dataObject.specialty,
      fee: dataObject.fee,
      type: dataObject.type,
      location_code: dataObject.location_code,
      state: dataObject.state,
      city: dataObject.city,
      duration: dataObject.duration,
      rotation_setting: dataObject.rotation_setting,
      affiliations: dataObject.affiliations,
      residency: dataObject.residency,
      rounds: dataObject.rounds,
      lor_type: dataObject.lor_type,
      description: dataObject.description,
      registration_fee: dataObject.registration_fee,
      visa_letter: dataObject.visa_letter,
      rank: dataObject.rank,
      lor_number: dataObject.lor_number || "",
      offers: dataObject.offers || "",
      combo_rotation: dataObject.combo_rotation || "",
      zipCode: dataObject.zipCode,
      documentation: dataObject.documentation,
      payment_policy: dataObject.payment_policy,
      refund_policy_link: dataObject.refund_policy_link,
      visa_letter_cost: dataObject.visa_letter_cost || "",
      hours: dataObject.hours,
      program_director: dataObject.program_director || "",
      DoctorAssigned:"no",
      PhysicianToBePaid: dataObject.payment_to_physicians || "",
      StudentToBeCharged: dataObject.fee || "",
      discount_month_from: dataObject.discount_month_from || "",
      discount_month_to: dataObject.discount_month_to || "",
      DoctorDetails: DoctorObjectToSet,
      id:newRotationId,
    });
    batch.set(docEmailRef, {
      admin_email: dataObject.admin_email,
      location_code: dataObject.location_code,
    });
    await batch.commit();
  }

  async getRolDataForVerification(): Promise<any> {
    let hids = [];
    let uids = [];
    await this.firestore
      .collection("OtherHospitalProgramInfo", (ref) =>
        ref.where("Verified", "==", "No")
      )
      .get()
      .toPromise()
      .then(async (docsRef) => {
        for (let i in docsRef.docs) {
          let doc = docsRef.docs[i];
          let data = doc.data();
          data.id = doc.id;
          data.TimeStamp = new Date(data.TimeStamp).toDateString();
          this.verifyList[data.id] = data;
          hids.push(data.HId);
          uids.push(data.UId);
        }
        let users = this.getUsersByUIds(uids);
        let hospitals = this.getHospitalsByHIds(hids);
        await Promise.all([users, hospitals]).then((results) => {
          for (let i in this.verifyList) {
            this.verifyList[i].user =
              results[0][this.verifyList[i].UId] || null;
            this.verifyList[i].hospital =
              results[1][this.verifyList[i].HId] || null;
          }
        });
      });
    this.verifyListUpdated = false;
    return this.verifyList;
  }
  async getLatestRolData(hid, pid) {
    return await this.rolApi.getExtraHospitalInfo(hid, pid);
  }
  async verifyRejectRolData(dataObject: any, adminEmail: any) {
    let docRef = await this.firestore
      .doc(`OtherHospitalProgramInfo/${dataObject.id}`)
      .update({
        Verified: dataObject.Verified,
        VerifiedAdmin: adminEmail,
        size: dataObject.size,
        additionalComments: dataObject.additionalComments,
        affiliation: dataObject.affiliation,
        electives: dataObject.electives,
        fellowships: dataObject.fellowships,
        matchRate: dataObject.matchRate,
      });
    return dataObject;
  }
  async deleteRotation(dataObject) {
    let batch = this.firestore.firestore.batch();
    let newRotationId = dataObject.rotationId;
    let docEmailRef = this.firestore
      .collection("RotationEmails")
      .doc(newRotationId).ref;
    let docRef = this.firestore.collection("Rotations").doc(newRotationId).ref;
    batch.delete(docEmailRef);
    batch.delete(docRef);
    await batch.commit();
  }

  async getUsersMatchByUIds(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    let hids = {};
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection<User>(`UsersMatch`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        let data = doc.data();
        users[doc.id] = data;
        hids[data.HId] = 1;
      }
    }
    let hospitals = await this.getHospitalsByHIds(Object.keys(hids));
    for (let uid in users) {
      users[uid].hospital = hospitals[users[uid].HId];
    }
    return users;
  }

  async getUsersExtraInfoByUIds(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection<User>(`UsersExtraData`, (ref) =>
            ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        users[doc.id] = doc.data();
      }
    }
    return users;
  }

  async getEnrollments() {
    let docsRef = await this.firestore
      .collection("UsersPayments")
      .get()
      .toPromise();
    let payments = {};
    let emails = {};
    for (let doc of docsRef.docs) {
      let data = doc.data();
      payments[doc.id] = data;
      emails[data.email] = doc.id;
    }
    let allEmails = Object.keys(emails);
    let { users: usersInfo, userIds } = await this.getUsersByEmails([
      ...allEmails,
    ]);
    let allUids = Object.values(userIds);
    let otherDocs = await Promise.all([
      this.getUsersExtraInfoByUIds([...allUids]),
      this.getUsersMatchByUIds([...allUids]),
    ]);
    let extrasInfo = otherDocs[0];
    let usersMatch = otherDocs[1];
    for (let email of allEmails) {
      let uid = userIds[email];
      let docId = emails[email];
      payments[docId] = {
        ...payments[docId],
        user: usersInfo[email],
        extraData: extrasInfo[uid],
        match: usersMatch[uid],
      };
    }
    return payments;
  }

  async getUserPaymentByEmail(userEmail) {
    let docsRef = await this.firestore
      .collection(`UsersPayments`, (ref) =>
        ref.where("email", "==", userEmail).limit(1)
      )
      .get()
      .toPromise();
    let dataObject = {};
    for (let docRef of docsRef.docs) {
      if (docRef.exists)
        dataObject = {
          ...docRef.data(),
          id: docRef.id,
        };
      else dataObject = {};
      for (let enrollmentKey of this.enrollmentKeys) {
        if (dataObject[enrollmentKey]) {
          let date = new Date(dataObject[enrollmentKey]);
          dataObject[enrollmentKey] = {
            day: date.getUTCDate(),
            month: date.getUTCMonth() + 1,
            year: date.getUTCFullYear(),
          };
        }
      }
      for (let paymentKey of this.paymentKeys) {
        if (dataObject[paymentKey] && dataObject[paymentKey].length > 0) {
          for (let payment of dataObject[paymentKey]) {
            if (payment.date) {
              let date = new Date(payment.date);
              payment.date = {
                day: date.getUTCDate(),
                month: date.getUTCMonth() + 1,
                year: date.getUTCFullYear(),
              };
            }
          }
        }
      }
    }
    return dataObject;
  }

  async getSomeUserPayments(val) {
    let limitedUsers = {};
    let docsRef = await this.firestore
      .collection<User>("UsersPayments", (ref) =>
        ref
          .orderBy("email")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      limitedUsers[doc.id] = doc.data();
    }
    return limitedUsers;
  }

  async getSomeUserPaymentsByDate(val?: number) {
    let limitedUsers = {};
    let results;
    if (val)
      results = await Promise.all([
        this.firestore
          .collection<User>("UsersPayments", (ref) =>
            ref.where("matchEnrollmentDate", ">=", val)
          )
          .get()
          .toPromise(),
        this.firestore
          .collection<User>("UsersPayments", (ref) =>
            ref.where("rotationEnrollmentDate", ">=", val)
          )
          .get()
          .toPromise(),
        this.firestore
          .collection<User>("UsersPayments", (ref) =>
            ref.where("researchEnrollmentDate", ">=", val)
          )
          .get()
          .toPromise(),
        this.firestore
          .collection<User>("UsersPayments", (ref) =>
            ref.where("createdAt", ">=", val)
          )
          .get()
          .toPromise(),
      ]);
    else
      results = await Promise.all([
        this.firestore.collection<User>("UsersPayments").get().toPromise(),
      ]);
    for (let docsRef of results) {
      for (let i in docsRef.docs) {
        let doc = docsRef.docs[i];
        limitedUsers[doc.id] = doc.data();
      }
    }
    return limitedUsers;
  }

  async addNewUserPaymentDoc(userEmail) {
    await this.firestore.collection("UsersPayments").add({
      email: userEmail,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async getReferralUser(code) {
    let referralDoc = await this.firestore
      .collection("ReferralCodes", (ref) => ref.where("code", "==", code))
      .get()
      .toPromise();
    if (referralDoc.empty) return {};
    let userId = referralDoc.docs[0].id;
    let userDoc = await this.firestore.doc(`Users/${userId}`).get().toPromise();
    let userDocData = userDoc.data();
    return {
      userId: {
        uid: userId,
        user: userDocData,
        referral: referralDoc.docs[0].data(),
      },
    };
  }

  async updatePoints(uid, newPoints) {
    await this.firestore.doc(`ReferralCodes/${uid}`).update({
      points: newPoints,
    });
  }

  async getAllReferralCodes() {
    let uids = {};
    let referralDocs = await this.firestore
      .collection("ReferralCodes")
      .get()
      .toPromise();
    let result = {};
    for (let doc of referralDocs.docs) {
      uids[doc.id] = 1;
      result[doc.id] = {
        referral: doc.data(),
      };
    }
    let userDocs = await this.getUsersByUIds(Object.keys(uids));
    for (let uid in uids) {
      result[uid] = {
        ...result[uid],
        user: userDocs[uid],
      };
    }
    return result;
  }

  async getPaymentsByEmails(uids: any[]) {
    let spliced = [];
    let users = {};
    let calls = [];
    while (uids.length > 0) {
      if (uids.length > 10) spliced = uids.splice(0, 10);
      else spliced = uids.splice(0, uids.length);
      calls.push(
        this.firestore
          .collection(`UsersPayments`, (ref) =>
            ref.where("email", "in", spliced).limit(1)
          )
          .get()
          .toPromise()
      );
    }
    let results = await Promise.all(calls);
    for (let result of results) {
      for (let i in result.docs) {
        let doc = result.docs[i];
        let docData = doc.data();
        users[docData.email] = docData;
      }
    }
    return users;
  }

  async getMeetingNotes() {
    let uids = {};
    let referralDocs = await this.firestore
      .collection("MeetingNotes")
      .get()
      .toPromise();
    let result = {};
    for (let doc of referralDocs.docs) {
      uids[doc.id] = 1;
      result[doc.id] = {
        notes: doc.data(),
      };
    }
    const uidsArr = Object.keys(uids);
    let userDocs = await this.getUsersByUIds(uidsArr);
    let extraDocs = await this.getUsersExtraInfoByUIds(uidsArr);
    for (let uid in uids) {
      result[uid] = {
        ...result[uid],
        user: userDocs[uid],
        extraData: extraDocs[uid],
      };
    }
    return result;
  }

  async getSomeHousings(val) {
    let limitedRotations = {};
    let docsRef = await this.firestore
      .collection("Housings", (ref) =>
        ref
          .orderBy("title")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[doc.id] = { ...docData, ...{ housingId: doc.id } };
    }
    docsRef = await this.firestore
      .collection("Housings", (ref) =>
        ref
          .orderBy("city")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[doc.id] = { ...docData, ...{ housingId: doc.id } };
    }
    docsRef = await this.firestore
      .collection("Housings", (ref) =>
        ref
          .orderBy("state")
          .startAt(val)
          .endAt(val + "\uf8ff")
      )
      .get()
      .toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let docData = doc.data();
      limitedRotations[doc.id] = { ...docData, ...{ housingId: doc.id } };
    }
    return limitedRotations;
  }

  async updateHousing(dataObject) {
    let batch = this.firestore.firestore.batch();
    let docRef = this.firestore
      .collection("Housings")
      .doc(dataObject.housingId).ref;
    batch.update(docRef, {
      ...dataObject,
    });
    await batch.commit();
  }

  async addNewHousing(dataObject) {
    let batch = this.firestore.firestore.batch();
    let newRotationId = this.firestore.createId();
    let docRef = this.firestore.collection("Housings").doc(newRotationId).ref;
    batch.set(docRef, {
      ...dataObject,
    });
    await batch.commit();
  }

  async deleteHousing(dataObject) {
    let batch = this.firestore.firestore.batch();
    let newRotationId = dataObject.housingId;
    let docRef = this.firestore.collection("Housings").doc(newRotationId).ref;
    batch.delete(docRef);
    await batch.commit();
  }

  async getReferralCode(uid) {
    return this.profileService.getReferralCode(uid);
  }

  getStatesByStateName() {
    const states = [
      { state: "Alabama", abbreviation: "Ala.", postalCode: "AL" },
      { state: "Alaska", abbreviation: "Alaska", postalCode: "AK" },
      { state: "American Samoa", abbreviation: undefined, postalCode: "AS" },
      { state: "Arizona", abbreviation: "Ariz.", postalCode: "AZ" },
      { state: "Arkansas", abbreviation: "Ark.", postalCode: "AR" },
      { state: "California", abbreviation: "Calif.", postalCode: "CA" },
      { state: "Colorado", abbreviation: "Colo.", postalCode: "CO" },
      { state: "Connecticut", abbreviation: "Conn.", postalCode: "CT" },
      { state: "Delaware", abbreviation: "Del.", postalCode: "DE" },
      { state: "Dist. of Columbia", abbreviation: "D.C.", postalCode: "DC" },
      { state: "Florida", abbreviation: "Fla.", postalCode: "FL" },
      { state: "Georgia", abbreviation: "Ga.", postalCode: "GA" },
      { state: "Guam", abbreviation: "Guam", postalCode: "GU" },
      { state: "Hawaii", abbreviation: "Hawaii", postalCode: "HI" },
      { state: "Idaho", abbreviation: "Idaho", postalCode: "ID" },
      { state: "Illinois", abbreviation: "Ill.", postalCode: "IL" },
      { state: "Indiana", abbreviation: "Ind.", postalCode: "IN" },
      { state: "Iowa", abbreviation: "Iowa", postalCode: "IA" },
      { state: "Kansas", abbreviation: "Kans.", postalCode: "KS" },
      { state: "Kentucky", abbreviation: "Ky.", postalCode: "KY" },
      { state: "Louisiana", abbreviation: "La.", postalCode: "LA" },
      { state: "Maine", abbreviation: "Maine", postalCode: "ME" },
      { state: "Maryland", abbreviation: "Md.", postalCode: "MD" },
      { state: "Marshall Islands", abbreviation: undefined, postalCode: "MH" },
      { state: "Massachusetts", abbreviation: "Mass.", postalCode: "MA" },
      { state: "Michigan", abbreviation: "Mich.", postalCode: "MI" },
      { state: "Micronesia", abbreviation: undefined, postalCode: "FM" },
      { state: "Minnesota", abbreviation: "Minn.", postalCode: "MN" },
      { state: "Mississippi", abbreviation: "Miss.", postalCode: "MS" },
      { state: "Missouri", abbreviation: "Mo.", postalCode: "MO" },
      { state: "Montana", abbreviation: "Mont.", postalCode: "MT" },
      { state: "Nebraska", abbreviation: "Nebr.", postalCode: "NE" },
      { state: "Nevada", abbreviation: "Nev.", postalCode: "NV" },
      { state: "New Hampshire", abbreviation: "N.H.", postalCode: "NH" },
      { state: "New Jersey", abbreviation: "N.J.", postalCode: "NJ" },
      { state: "New Mexico", abbreviation: "N.M.", postalCode: "NM" },
      { state: "New York", abbreviation: "N.Y.", postalCode: "NY" },
      { state: "North Carolina", abbreviation: "N.C.", postalCode: "NC" },
      { state: "North Dakota", abbreviation: "N.D.", postalCode: "ND" },
      { state: "Northern Marianas", abbreviation: undefined, postalCode: "MP" },
      { state: "Ohio", abbreviation: "Ohio", postalCode: "OH" },
      { state: "Oklahoma", abbreviation: "Okla.", postalCode: "OK" },
      { state: "Oregon", abbreviation: "Ore.", postalCode: "OR" },
      { state: "Palau", abbreviation: undefined, postalCode: "PW" },
      { state: "Pennsylvania", abbreviation: "Pa.", postalCode: "PA" },
      { state: "Puerto Rico", abbreviation: "P.R.", postalCode: "PR" },
      { state: "Rhode Island", abbreviation: "R.I.", postalCode: "RI" },
      { state: "South Carolina", abbreviation: "S.C.", postalCode: "SC" },
      { state: "South Dakota", abbreviation: "S.D.", postalCode: "SD" },
      { state: "Tennessee", abbreviation: "Tenn.", postalCode: "TN" },
      { state: "Texas", abbreviation: "Tex.", postalCode: "TX" },
      { state: "Utah", abbreviation: "Utah", postalCode: "UT" },
      { state: "Vermont", abbreviation: "Vt.", postalCode: "VT" },
      { state: "Virginia", abbreviation: "Va.", postalCode: "VA" },
      { state: "Virgin Islands", abbreviation: "V.I.", postalCode: "VI" },
      { state: "Washington", abbreviation: "Wash.", postalCode: "WA" },
      { state: "West Virginia", abbreviation: "W.Va.", postalCode: "WV" },
      { state: "Wisconsin", abbreviation: "Wis.", postalCode: "WI" },
      { state: "Wyoming", abbreviation: "Wyo.", postalCode: "WY" },
    ];
    let statesByStateName = {};
    states.map((state) => {
      statesByStateName[state.state.toLowerCase()] = state;
    });
    return statesByStateName;
  }

  async getUserNotes(uid) {
    return await this.profileService.getUserNotes(uid);
  }

  async updateUserNotes(uid, dataObject) {
    return await this.profileService.updateNotes(uid, dataObject);
  }

  async updateMedicalSchool(medicalSchool: string, uid: string) {
    await this.firestore.doc(`Users/${uid}`).update({
      medicalSchool,
    });
    return;
  }
}
