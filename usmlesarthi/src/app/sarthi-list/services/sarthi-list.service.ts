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
  private hospitalsDataRequests: Record<string, Promise<any>> = {};
  favorites:any = {};
  private favoritesRequest: Promise<any> | null = null;
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
    const programId = String(pid);
    const cached = this.hospitalsDataByPId[programId];

    if (cached && Object.keys(cached).length) {
      return cached;
    }

    if (this.hospitalsDataRequests[programId]) {
      return this.hospitalsDataRequests[programId];
    }

    this.hospitalsDataRequests[programId] =
      this.loadHospitalsDataByPId(programId);

    try {
      return await this.hospitalsDataRequests[programId];
    } finally {
      delete this.hospitalsDataRequests[programId];
    }
  }

  private async loadHospitalsDataByPId(programId: string): Promise<any> {
    const startedAt = performance.now();
    const shouldFilterDisplayed = [1, 2, 3, 4, 5, 7]
      .includes(Number(programId));

    const docsRef = await this.firestore
      .collection<HospitalFormData>('HospitalProgramInfo', ref => {
        let query: any = ref
          .where('Verified', '==', 'Yes')
          .where('PId', '==', programId);

        if (shouldFilterDisplayed) {
          query = query.where('DisplayProgram', '==', 1);
        }

        return query.orderBy('TimeStamp', 'desc');
      })
      .get()
      .toPromise();

    const latestByProgram: Record<string, HospitalFormData> = {};
    const historyByProgram: Record<string, HospitalFormData[]> = {};

    for (const doc of docsRef.docs) {
      const data = doc.data() as HospitalFormData;
      data.HPInfoId = doc.id;

      if (!data.Frieda || data.Frieda == -149) {
        continue;
      }

      const key = `${String(data.Frieda)}_${data.PId}`;

      if (!historyByProgram[key]) {
        historyByProgram[key] = [];
      }

      historyByProgram[key].push(data);

      // Query is newest first, so the first record is the latest.
      if (!latestByProgram[key]) {
        latestByProgram[key] = data;
      }
    }

    this.hospitalsDataByHPId = {
      ...this.hospitalsDataByHPId,
      ...historyByProgram
    };

    this.hospitalsDataByPId[programId] = latestByProgram;

    console.log(
      `HospitalProgramInfo Firestore query (${programId}):`,
      `${(performance.now() - startedAt).toFixed(0)} ms`,
      `documents=${docsRef.size}`,
      `latest=${Object.keys(latestByProgram).length}`
    );

    return latestByProgram;
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

    async getFavoritesByUId(uid: any, enrich: boolean = true): Promise<any> {
      if (this.favoritesUpdated || !Object.keys(this.favorites).length) {
        if (!this.favoritesRequest) {
          this.favoritesRequest = this.loadFavoriteDocuments(uid);
        }

        try {
          await this.favoritesRequest;
        } finally {
          this.favoritesRequest = null;
        }
      }

      // Dashboard only needs IDs and must not wait for these extra queries.
      if (!enrich) {
        return this.favorites;
      }

      const hids = new Set<any>();
      const friedaIds = new Set<any>();

      for (const key of Object.keys(this.favorites)) {
        const favorite = this.favorites[key];
        const programData = this.hospitalsDataByPId[favorite.PId];
        const programKey = `${String(favorite.Frieda)}_${favorite.PId}`;

        if (programData && programData[programKey]) {
          favorite.ProgramInfo = programData[programKey];
        } else {
          friedaIds.add(favorite.Frieda);
        }

        if (!favorite.hospital) {
          hids.add(favorite.HId);
        }
      }

      if (friedaIds.size) {
        this.favorites = await this.hospitalApi.getProgramByFriedaID(
          Array.from(friedaIds),
          this.favorites
        );
      }

      if (hids.size) {
        this.favorites = await this.hospitalApi.getHospitalsByHIdsRameez(
          Array.from(hids),
          this.favorites
        );
      }

      return this.favorites;
    }

    private async loadFavoriteDocuments(uid: any): Promise<void> {
      const docsRef = await this.firestore
        .collection('UserFav', ref => ref.where('UId', '==', uid))
        .get()
        .toPromise();

      const favorites: any = {};

      for (const doc of docsRef.docs) {
        const data: any = doc.data();

        if (typeof data.Frieda === 'undefined') {
          continue;
        }

        const key = `${String(data.Frieda)}_${data.PId}`;

        if (!favorites[key]) {
          favorites[key] = {
            ...data,
            UFId: doc.id
          };
        }
      }

      this.favorites = favorites;
      this.favoritesUpdated = false;
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
        this.favoritesRequest = null;
        return docRef;
      }
      return null;
    }
    async deleteFavoriteById(ufid: any) {
      await this.firestore.doc(`UserFav/${ufid}`).delete();
      this.favoritesUpdated = true;
      this.favoritesRequest = null;
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