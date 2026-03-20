import { Injectable } from '@angular/core';
import { ProgramService } from '../../common/program.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { HospitalService } from '../../common/hospital.service';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class RankOrderServicesService {
  interviewUpdated = true;
  uid              = "";
  interviews       = {};


  constructor(private hospitalApi: HospitalService, private programApi: ProgramService, private firestore: AngularFirestore) { }

  async getInterviewsByUId(uid){
    if (this.interviewUpdated || this.uid != uid || true){
      this.uid = uid;
      this.interviews = {};
      let results = await Promise.all([this.firestore.collection("Interviews", ref => ref.where("UId", "==", uid).where("ProvidedInfo", "==", "Yes")).get().toPromise(), 
      this.firestore.collection("HospitalScores", ref => ref.where("UId", "==", uid)).get().toPromise(), this.firestore.collection("OtherHospitalProgramInfo", ref => ref.where("UId", "==", uid)).get().toPromise()]);
      let docsRef = results[0];
      let scoresDocRef = results[1];
      let extraInfoDocsRef =  results[2];
      let hid_pid_scores= {};
      let hid_pid_extraInfo = {};
      for(let doc of scoresDocRef.docs){
        let data = doc.data();
        let key = data.HId+"."+data.PId;
        hid_pid_scores[key] = data;
      }
      for(let doc of extraInfoDocsRef.docs){
        let data = doc.data();
        let key = data.HId+"."+data.PId;
        hid_pid_extraInfo[key] = data;
      }
      let hids = {};
      for(let i in docsRef.docs)
      {
        let doc = docsRef.docs[i];
        let data = doc.data();
        data.InterviewId = doc.id;
        data.Date= new Date(data.Date);
        data.isScoreSubmitted=false;
        data.isExtraInfoSubmitted = false;
        let key = data.HId+"."+data.PId;
        if(hid_pid_scores[key]){
          data.scoreDoc = hid_pid_scores[key];
          data.isScoreSubmitted = true;
        }
        if(hid_pid_extraInfo[key])
          data.isExtraInfoSubmitted = true;
        this.interviews[data.InterviewId] = data;
        hids[data.HId] = 1;
      }
      this.interviews = await this.hospitalApi.getHospitalsByHIds(Object.keys(hids), this.interviews);
      this.interviewUpdated = false;
    }
    return this.interviews;
  }
  async getProgramsObject(){
    return await this.programApi.getProgramObject();
  }
  async getUserFactors(uid: any){
    let factors = {};
    let docsRef = await this.firestore.collection("Factors", ref=>ref.where("UId", "in", [uid, ""])).get().toPromise();
    for(let doc of docsRef.docs){
      factors[doc.id] = doc.data();
    }
    return factors;
  }

  async getUserWeights(uid: any){
    let weights = {};
    let docsRef = await this.firestore.collection("FactorsWeights", ref=>ref.where(firestore.FieldPath.documentId(), "==", uid)).get().toPromise();
    if (!(docsRef.empty)){
      let doc = docsRef.docs[0].data();
      weights = doc["Weights"];
    }
    return weights;
  }

  async createFactor(name: string, uid:string){
    let id = this.firestore.createId();
    let data   = {
      AttrId: id,
      UId   : uid,
      Type  : "1",
      AttrName : name,
    }
    await this.firestore.doc(`Factors/${id}`).set(data, {merge: true});
    return data;
  }

  async deleteFactor(factor){
    let doc = await this.firestore.doc(`FactorsWeights/${factor.UId}`).get().toPromise();
    if (doc.exists){
      let docData = doc.data();
      if (factor.AttrId in docData.Weights)
        return false;
    }
    await this.firestore.doc(`Factors/${factor.AttrId}`).delete();
    return true;
  }

  async setFactorsWeights(dataObject, uid){
    let data = {};
    for(let factor of dataObject.factors){
      data[factor.AttrId] = {
        Value: factor.Value,
        Reason: factor.Reason};
    }
    for(let factor of dataObject.userFactors){
      data[factor.AttrId] = {
        Value: factor.Value,
        Reason: factor.Reason};
    }
    let docData= {Weights: data}
    await this.firestore.doc(`FactorsWeights/${uid}`).set(docData, {merge: true});
  }

  async getAverageScores (hid, pid){
    let docRef = await this.firestore.collection("HospitalScores", ref=>ref.where("HId", "==", hid)).get().toPromise();
    if (docRef.docs.length){
      let avScores = {};
      for (let doc of docRef.docs){
        let docData = doc.data ();
        let scores  = docData.Scores;
        for (let factorId of ["1", "2", "3", "4", "5", "6", "7", "8", "10", "11", "12", "13", "14", "15", "16", "17"]){
          if (avScores[factorId])
            avScores[factorId] = Math.floor((avScores[factorId] + scores[factorId].Score)/2);
          else
            avScores[factorId] = scores[factorId].Score;
        }
      }
      return avScores;
    }
    return {};
  }

  async getExtraHospitalInfo (hid, pid){
    let docsRef = await this.firestore.collection("OtherHospitalProgramInfo", ref=>ref.where("PId", "==", pid).where("HId", "==", hid).where("Verified", "==", "Yes")
    .orderBy("TimeStamp", 'desc')).get().toPromise();
    let data:any    =  null;
    for (let doc of docsRef.docs){
      let docData = doc.data();
      if (data===null){
        data = docData;
        data.comments = [];
      }
      if (docData.additionalComments!==""){
        let comment = "( user #" + docData.UId + " ): " + docData.additionalComments;
        data.comments.push(comment);
      }
    }
    return data || {};
  }

  async submitScore(dataObject){
    await this.firestore.collection("HospitalScores").add(dataObject);
    this.interviewUpdated = true;
  }

  async updateScore (dataObject, hid, pid, uid){
    let batch = this.firestore.firestore.batch();
    let docsRef = await this.firestore.collection("HospitalScores", ref => ref.where("UId", "==", uid).where("HId", "==", hid).where("PId", "==", pid)).get().toPromise();
    for (let doc of docsRef.docs){
      batch.set(doc.ref, dataObject, {merge: true});
    }
    await batch.commit();
  }
  async submitExtraHospitalInfo(dataObject){
    dataObject.TimeStamp = Date.now();
    dataObject.Verified  = "No";
    await this.firestore.collection("OtherHospitalProgramInfo").add(dataObject);
  }

}
