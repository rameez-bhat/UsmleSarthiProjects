import {
  Injectable
} from '@angular/core';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  HospitalFormData
} from '../../models/hospital-form-data';
import {
  ProgramService
} from '../../common/program.service';
import {
  HospitalService
} from '../../common/hospital.service';
import {
  Visa
} from '../../models/visa';
import {
  UserService
} from '../../common/user.service';

@Injectable({
  providedIn: 'root'
})
export class SarthiListService {
  hospitalsDataByPId = {};
  hospitalsDataByHPId = {};
  favorites:any = {};
  favoritesUpdated = true;
  notes = [];
  notesUpdated = true;
  giveLatest: any;
  comments: any = {"FirstYearSpotsComments": {}, "USCEComments": {}, "USMLEExamComments":{}, "imgpercentageComments":{}, "notes":{}, "websummary":{}};
  interviews:any =  {};
  matches : any = {};
  constructor(private firestore: AngularFirestore, private hospitalApi: HospitalService, private usersApi: UserService) {}

  async getHospitalsDataByPIdbk(pid: any): Promise < any > {
    let feridaList=[];
    try
    {
      if (!Object.keys(this.hospitalsDataByPId[pid] || {}).length){
        this.hospitalsDataByPId[pid] = {};
        let hospitalsDataByHPId = {};
        let docsRef = await this.firestore.collection < HospitalFormData > ("HospitalProgramInfo", ref => ref.where("Verified", "==", "Yes").where("PId", "==", pid).orderBy("TimeStamp", "desc")).get().toPromise();
        for (let i in docsRef.docs) {
          let doc = docsRef.docs[i];
         
          let data = < HospitalFormData > doc.data();
          data.HPInfoId = doc.id;
          let key = (data.HId + '_' + data.PId).toString();
          if (key in hospitalsDataByHPId)
            hospitalsDataByHPId[key].push(data);
          else
            hospitalsDataByHPId[key] = [data];
        }
        this.hospitalsDataByHPId = {...this.hospitalsDataByHPId, ...hospitalsDataByHPId};
        for (let key in hospitalsDataByHPId) {
          let data = hospitalsDataByHPId[key][0];
          const friedaId = data.Frieda;
          if (friedaId == -149){
            console.log("data-Continued---->")
            continue;
          }
          if (feridaList.includes(String(friedaId)) && friedaId!="") {
            continue;
          }
          feridaList.push(String(friedaId));
          this.hospitalsDataByPId[pid][data.HPInfoId] = data;
        }
      }
    }
    catch (err) 
    {
        console.log("err------>",err)
    }
    return this.hospitalsDataByPId[pid];
  }
  async getHospitalsDataByPId(pid: any): Promise<any> {
    try {
      if (!this.hospitalsDataByPId[pid] || !Object.keys(this.hospitalsDataByPId[pid]).length) {
        this.hospitalsDataByPId[pid] = {};
        let hospitalsDataByHPId = {};
        const feridaSet = new Set<string>();
        let docsRef;
        if ([1, 2, 3, 4, 5, 7].includes(Number(pid))) {
        docsRef = await this.firestore.collection<HospitalFormData>("HospitalProgramInfo", ref =>
          ref.where("Verified", "==", "Yes")
             .where("PId", "==", pid)
             .where("DisplayProgram", "==", 1)
             .orderBy("TimeStamp", "desc")
        ).get().toPromise();
      }
      else
      {
        docsRef = await this.firestore.collection<HospitalFormData>("HospitalProgramInfo", ref =>
          ref.where("Verified", "==", "Yes")
             .where("PId", "==", pid)
             //.where("DisplayProgram", "==", 1)
             .orderBy("TimeStamp", "desc")
        ).get().toPromise();
      }
        for (let doc of docsRef.docs) 
        {
          let data = doc.data() as HospitalFormData;
          data.HPInfoId = doc.id;
          const friedaId = String(data.Frieda);
          let key = (friedaId + '_' + data.PId).toString();
          
          if (key in hospitalsDataByHPId)
            this.hospitalsDataByHPId[key].push(data);
          else
          this.hospitalsDataByHPId[key] = [data];

          if (data.Frieda == -149 || !data.Frieda)
          {
            continue;
          }
             
  
          if (feridaSet.has(friedaId)) 
          {
            continue;
          }
            
          feridaSet.add(friedaId);
          //this.hospitalsDataByPId[pid][data.HPInfoId] = data;
          //if(this.hospitalsDataByPId[pid][key])
          this.hospitalsDataByPId[pid][key] = data;
        }
      }
    } catch (err) {
      console.log("err------>", err);
    }
    return this.hospitalsDataByPId[pid];
  }

  async getHospitalsDataByPIdHId(hid: any, pid: any): Promise < any > {
    let key = (hid + '_' + pid).toString();
    let docsRef = await this.firestore.collection('HospitalProgramInfo', ref => ref.where('HId', '==', hid).where("PId", "==", pid).where("Verified", "==", "Yes").orderBy("TimeStamp", "desc")).get().toPromise();
    for (let i in docsRef.docs) {
      let doc = docsRef.docs[i];
      let data = < HospitalFormData > doc.data();
      const friedaId = String(data.Frieda);
      let key = (friedaId + '_' + data.PId).toString();
      data.HPInfoId = doc.id;
      if (key in this.hospitalsDataByHPId)
        this.hospitalsDataByHPId[key].push(data);
      else
        this.hospitalsDataByHPId[key] = [data];
    }
    return this.hospitalsDataByHPId[key][0];
  }

  async getAllCommentsByHPInfoId(hpinfoid: string, dataObject: HospitalFormData) {
    let commentsTypes = ["FirstYearSpotsComments", "USCEComments", "USMLEExamComments", "imgpercentageComments", "notes", "websummary"];
    let key = (dataObject.HId + '.' + dataObject.PId).toString();
    for (let comment of commentsTypes) {
          this.comments[comment][key] = [];
          if( key in this.hospitalsDataByHPId){
          for (let data of this.hospitalsDataByHPId[key]) {
            let prefix = '';
            try {
              let dates =  new Date(data.TimeStamp).toDateString().split(' ');
              prefix += dates[1] + ', ' + dates[3]
            }
            catch(err){

            }
            let dataString = `${prefix}: `;
            if (data[comment] && data[comment] != "" && data[comment].trim().toLowerCase() != "na" && data[comment].trim().toLowerCase() != "n/a")
              this.comments[comment][key].push(dataString + data[comment]);
          }
        }
        const mergedKey = `${comment}Merged`
        dataObject[mergedKey] = this.comments[comment][key];
      }
      return;
    }

    async getFavoritesByUId(uid: any): Promise < any[] > {
      try
      {
      if (Object.keys(this.favorites).length==0 || this.favoritesUpdated) {
        let remainingHospitalsPrograms = {
          hids: [],
          Frieda: [],
        };
        this.favorites = {};
        let docsRef = await this.firestore.collection("UserFav", ref => ref.where("UId", "==", uid)).get().toPromise();
        for (let i in docsRef.docs) {
          let doc = docsRef.docs[i];
          let data = doc.data();
          const friedaId = String(data.Frieda);
          if(typeof data.Frieda!="undefined")
          {
            let key = (friedaId + '_' + data.PId).toString();
            if (!(data.PId in this.hospitalsDataByPId) || !(data.HId in this.hospitalsDataByPId[data.PId])) {
              remainingHospitalsPrograms.hids.push(data.HId);
              remainingHospitalsPrograms.Frieda.push(data.Frieda);
            } else
              data.hospital = this.hospitalsDataByPId[data.PId][key];
            data.UFId = doc.id;
            if(typeof this.favorites[key]=="undefined")
            {
              this.favorites[key]=data;
            }
            
          }
         
        }
        this.favoritesUpdated = false;
        this.favorites = await this.hospitalApi.getProgramByFriedaID(remainingHospitalsPrograms.Frieda, this.favorites);
        this.favorites = await this.hospitalApi.getHospitalsByHIdsRameez(remainingHospitalsPrograms.hids, this.favorites);
      }
    }
    catch(err)
    {
      console.log("error---->",err)
    }
      return this.favorites;
    }
    async addFavoriteByUId(uid: any, hid: any, pid: any,Friedaid:any): Promise < any > {
      let docsRef = await this.firestore.collection("UserFav", ref => ref.where("UId", "==", uid).where("Frieda", "==", Friedaid).where("PId", "==", pid)).get().toPromise();
      console.log("docsRef--->",docsRef.empty)
      if (docsRef.empty) {
        let data = {
          UId: uid,
          HId: hid,
          PId: pid,
          Frieda:Friedaid,
        }
        let docRef = await this.firestore.collection("UserFav").add(data);
        this.favoritesUpdated = true;
        return docRef;
      }
      return null;
    }
    async deleteFavoriteById(ufid: any) {
      await this.firestore.doc(`UserFav/${ufid}`).delete();
      this.favoritesUpdated = true;
    }

    async getNotesByUId(uid: any): Promise < any[] > {
      let remainingHospitals = [];
      this.notes = [];
      let docsRef = await this.firestore.collection("UserNote", ref => ref.where("UId", "==", uid)).get().toPromise();
      for (let i in docsRef.docs) {
        let doc = docsRef.docs[i];
        let data = doc.data();
        if (!(data.PId in this.hospitalsDataByPId))
          remainingHospitals.push(data.HId);
        data.UNId = doc.id;
        this.notes.push(data);
      }
      this.notesUpdated = false;
      this.notes = await this.hospitalApi.getHospitalsByHIds(remainingHospitals, this.notes);
      return this.notes;
    }
    async addNotesByUId(uid: any, hid: any, pid: any, content: any): Promise < any > {
      let docsRef = await this.firestore.collection("UserNote", ref => ref.where("UId", "==", uid).where("HId", "==", hid).where("PId", "==", pid)).get().toPromise();
      if (docsRef.empty) {
        let data = {
          UId: uid,
          HId: hid,
          PId: pid,
          Notes: content,
          Cat: "",
        }
        let docRef = await this.firestore.collection("UserNote").add(data);
        this.notesUpdated = true;
        return docRef;
      }
      return null;
    }
    async updateNoteById(unid: any, content: any): Promise < any > {
      await this.firestore.doc(`UserNote/${unid}`).update({
        Notes: content
      });
      this.notesUpdated = true;
      return;
    }
    async deleteNoteById(unid: any) {
      await this.firestore.doc(`UserNote/${unid}`).delete();
      this.notesUpdated = true;
      return;
    }

    async getVisaObject(): Promise < any > {
      let visaObject = {};
      let docsRef = await this.firestore.collection < Visa > ("Visa").get().toPromise();
      for (var i in docsRef.docs) {
        let doc = docsRef.docs[i];
        visaObject[doc.id] = doc.data();
      }
      return visaObject;
    }
    async getLatestHospital(uid, pid, hid, isAdmin) {
      const updatedDate = new Date(new Date().getFullYear(), 0, 1).getTime()
      let key = (hid + '_' + pid).toString();
      this.giveLatest = true;
      console.log("this.hospitalsDataByHPId--->",this.hospitalsDataByHPId)
      console.log("key--->",key)
      if (key in this.hospitalsDataByHPId){
        let data = this.hospitalsDataByHPId[key][0];
        console.log("data--->",data)
        if (data.TimeStamp < updatedDate || this.hospitalsDataByHPId[key].length==1)
        {
          return data;
        }
        else{
            let docsRef = await this.firestore.collection("HospitalProgramInfo", ref => ref.where("UId", "==", uid).where("PId", "==", pid).where("TimeStamp", ">=", updatedDate)).get().toPromise();
            if (docsRef.docs.length > 0 ){
              for(let doc of docsRef.docs){
                let otherData = doc.data();
                if(otherData.Status=="Not Completed" || otherData.Verified=="Rejected"){
                  this.giveLatest = false;
                  break;
                }
              }
            }
          if(this.giveLatest==false && !isAdmin){
            for(let pastData of this.hospitalsDataByHPId[key]){
              if (pastData.TimeStamp < updatedDate)
                return  pastData;
            }
          }
          return data;
        }
      }
      else{

        throw "Error: No data";
      }
    }
    async GetStudentHasUnverified(uid, pid) 
    {
      const updatedDate = new Date(new Date().getFullYear(), 0, 1).getTime()
      let dataSel=[];
      let docsRef = await this.firestore.collection("HospitalProgramInfo", ref => ref.where("UId", "==", uid).where("Verified", "==", "No").where("TimeStamp", ">=", updatedDate)).get().toPromise();
      if (docsRef.docs.length > 0 )
      {
        for(let doc of docsRef.docs)
        {
          let otherData = doc.data();
          dataSel.push(otherData)
        }
      }
      return dataSel;
    }
    async GetStudentHasVerified(uid, pid) 
    {
      const updatedDate = new Date(new Date().getFullYear(), 0, 1).getTime()
      let dataSel=[];
      let docsRef = await this.firestore.collection("HospitalProgramInfo", ref => ref.where("UId", "==", uid).where("AssignedOn", ">=", updatedDate).where("Verified", "==", "Yes")).get().toPromise();
      if (docsRef.docs.length > 0 )
      {
        for(let doc of docsRef.docs)
        {
          let otherData = doc.data();
          dataSel.push(otherData)
        }
      }
      return dataSel;
    }
    
    async getInterviewProfiles(dataObject) {
      let hid = dataObject.HId;
      let pid = dataObject.PId;
      let key = (hid + '.' + pid).toString();
      this.interviews[key] = [];
      let docsRef = await this.firestore.collection("Interviews", ref => ref.where("HId", "==", hid).where("PId", "==", pid).orderBy("Date", "desc")).get().toPromise();
      let uids = {};
      for (let doc of docsRef.docs) {
        let data = doc.data();
        uids[data.UId] = 1;
        this.interviews[key].push([data.UId, new Date(data.Date).toDateString()]);
      }
      let userProfiles = await this.usersApi.getUserProfiles(Object.keys(uids));
      for (let interview of this.interviews[key]) {
        interview[0] = userProfiles[interview[0]];
      }
      dataObject.interviews = this.interviews[key];
      return;
    }

    async getMatchedProfiles(dataObject){
      let hid = dataObject.HId;
      let pid = dataObject.PId;
      let key = (hid + '.' + pid).toString();
      this.matches[key] = [];
      let docsRef = await this.firestore.collection("UsersMatch", ref => ref.where("HId", "==", hid).where("PId", "==", pid).orderBy("yearMatch", "desc")).get().toPromise();
      let uids = {};
      for (let doc of docsRef.docs) {
        let data = doc.data();
        uids[data.UId] = 1;
        this.matches[key].push([data.UId, data]);
      }
      let userProfiles = await this.usersApi.getUserProfiles(Object.keys(uids));
      for (let interview of this.matches[key]) {
        interview[0] = userProfiles[interview[0]];
      }
      dataObject.matches = this.matches[key];
      return;
    }

  }