import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { HospitalService } from '../../common/hospital.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewInsightsService {
  interviews: any;
  interviewUpdated: boolean;
  interviewsInfo : any = {};
  uid : any;
  constructor(private firestore: AngularFirestore, private hospitalApi: HospitalService, private toastr: ToastrService) {
    this.interviewUpdated = true;
   }

  async addInterview(uid, hid, date, pid, signal){
    let checkRef = await this.firestore.collection("Interviews", ref=> ref.where("UId", "==", uid).where("PId","==", pid).where("HId", '==', hid)).get().toPromise();
    if(!checkRef.empty)
    {
      this.toastr.info("You have already added the hosptial with the same specialty for the interview");
      return;
    }
    let docsRef = await this.firestore.collection("Interviews").add({
      UId: uid,
      HId: hid,
      PId: pid, 
      Date: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
      ProvidedInfo: "No",
      signal
    }).then( () =>{
      this.interviewUpdated = true;
    }).catch(err =>{
      console.log("Something's wrong");
      throw err;
    });
  }
  async getInterviewsByUId(uid){
    this.uid = uid;
    this.interviews = {};
    let docsRef = await this.firestore.collection("Interviews", ref => ref.where("UId", "==", uid)).get().toPromise();
    let hids = {};
    for(let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      let data = doc.data();
      data.InterviewId = doc.id;
      let utcDate = new Date(data.Date);
      data.Date= new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()).toDateString();
      this.interviews[data.InterviewId] = data;
      hids[data.HId] = 1;
    }
    console.log(this.interviews);
    this.interviews = await this.hospitalApi.getHospitalsByHIds(Object.keys(hids), this.interviews);
    this.interviewUpdated = false;
    return this.interviews;
  }
  async getInterviewsInfoByHIdPId(hid, pid){
    let key = hid+"."+pid;
    if (!(key in this.interviewsInfo)){
    let allInterviews= [];
    let docsRef = await this.firestore.collection("InterviewsInfo", ref => ref.where("HId", "==", hid).where("PId","==", pid)).get().toPromise();
    let hids = {};
    for(let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      let data = doc.data();
      data.IBId = doc.id;
      allInterviews.push(data);
    }
    this.interviewsInfo[key] = allInterviews;
    }
    return this.interviewsInfo[key];
  }
  async addInterviewData(interviewData, interview)
  {
    let batch = this.firestore.firestore.batch();
    let docId = this.firestore.createId();
    let interviewDataDoc = this.firestore.collection("InterviewsInfo").doc(docId).ref;
    let updateInterviewDoc = this.firestore.doc(`Interviews/${interview.InterviewId}`).ref;
    batch.set(interviewDataDoc, interviewData);
    batch.update(updateInterviewDoc, {ProvidedInfo: "Yes"});
    await batch.commit();
    this.interviewUpdated = true;
  }
  async deleteInterview(interview){
    await this.firestore.doc(`Interviews/${interview.InterviewId}`).delete();
    this.interviewUpdated = true;
}
async saveNewDateInterview(interview){
  let date=  interview.newDate;
  await this.firestore.doc(`Interviews/${interview.InterviewId}`).update({
    Date: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
  });
  this.interviewUpdated = true;
}
}
