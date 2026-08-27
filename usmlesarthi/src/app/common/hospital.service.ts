import {
  Injectable
} from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore
} from '@angular/fire/firestore';
import {
  Hospital
} from '../models/hospital';
import * as firebase from 'firebase';
import { HospitalFormData } from '../models/hospital-form-data';
import {
  HospitalProgram
} from '../models/hospital-program';
@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  collectionRef: AngularFirestoreCollection < Hospital[] > ;
  hospitalsList: Hospital[];
  hospitalsByProgram: any = {};
  hospitals: any = [];
private hospitalsCache: Record<string, Record<string, Hospital>> = {};

private hospitalsRequests:
  Record<string, Promise<Record<string, Hospital>>> = {};
  constructor(private firestore: AngularFirestore) {
    this.collectionRef = this.firestore.collection('Hospital');
  }

  async getHospitalsByProgramRameez(id: any): Promise<{ hospitalsByProgram: Record<string, Hospital>; hospitals: Record<string, Hospital> }> {
    const hospitals = await this.getHospitalsObjectByProgramRameez(id);
    return { hospitalsByProgram: hospitals, hospitals };
  }
  async getHospitalsByProgram(id: any): Promise < Hospital[] > {
    let feridaList=[];
    let programId = id.toString();
    console.log("programId====>",programId)
    if (!Object.keys(this.hospitalsByProgram[programId] || {}).length){
      this.hospitalsByProgram[programId] = [];
      let hids = [];
      let hid_hpid = {};

      let hospitaldocs = await this.firestore.collection < Hospital > ("Hospital", ref => {
        return ref
          .where("PIds", "array-contains", programId).orderBy("HName", "asc");
      }).get().toPromise();
      let doc, hid, data;
      for (var i in hospitaldocs.docs) {
        doc = hospitaldocs.docs[i];
        data = doc.data();
        const friedaId = data.HName ;
        data.HId = doc.HId?doc.HId:doc.id;
        if (feridaList.includes(String(friedaId)) && friedaId!="") {
          //continue;
        }
        feridaList.push(String(friedaId));
        this.hospitalsByProgram[programId].push(data as Hospital);
      }
    }
    return this.hospitalsByProgram[programId];
  }
  async getHospitalsByProgramName(id: any): Promise < Hospital[] > {
    let feridaList=[];
    let programId = id.toString();
    if (!Object.keys(this.hospitalsByProgram[programId] || {}).length){
      this.hospitalsByProgram[programId] = [];
      let hids = [];
      let hid_hpid = {};

      let hospitaldocs = await this.firestore.collection < Hospital > ("Hospital", ref => {
        return ref
          .where("PIds", "array-contains", programId).orderBy("HName", "asc");
      }).get().toPromise();
      let doc, hid, data;
      for (var i in hospitaldocs.docs) {
        doc = hospitaldocs.docs[i];
        data = doc.data();
        const friedaId = data.HName ;
        data.HId = doc.HId?doc.HId:doc.id;
        if (feridaList.includes(String(friedaId)) && friedaId!="") {
          continue;
        }
        feridaList.push(String(friedaId));
        this.hospitalsByProgram[programId].push(data as Hospital);
      }
    }
    return this.hospitalsByProgram[programId];
  }
async getAlreadyAssignedHospotal(id: any): Promise <any>
{
  
  let programId = id.toString();
  console.log("programId----->",programId)
  let DataToSend={}
   await this.firestore
        .collection<HospitalFormData>("HospitalProgramInfo", (ref) =>
          ref.where("Verified", "==", "No").where("Status", "==", "Not Completed").where("PId", "==", programId)
        )
        .get()
        .toPromise()
        .then(async (docsRef) => {
          for (let i in docsRef.docs) {
            let doc = docsRef.docs[i];
            let data = doc.data();
            data.HPInfoId = doc.id;
            data.TimeStampDate = new Date(data.TimeStamp).toDateString();
            DataToSend[data.HId+"_"+data.PId] = data;
          }
        });
        return DataToSend;
}
  /*async getHospitalByHPId(hids: any, dataObject: any) {
    let doc = await this.firestore.doc(`HospitalProgram/${hpid}`).get().toPromise();
    let hid = doc.data().HId;
    let hospital = await this.firestore.doc(`Hospital/${hid}`).get().toPromise();
    return hospital.data() as Hospital;
    let docRefs = await this.firestore.collection < Hospital > (`Hospital`, ref => ref.where(firebase.firestore.FieldPath.documentId(), "in", hids)).get().toPromise();
    for (var i in docRefs.docs) {
      let doc = docRefs.docs[i];
      let data = doc.data();
      data.HId = doc.id;
      hospitals[doc.id] = data;
    }


    return hospitals;
  }*/

  async getHospitalsObjectByProgram(pid: any): Promise <any>
  {
    let hospitalsList = await this.getHospitalsByProgram(pid);
    let hospitals = {};
    try
    {
      for(let i in hospitalsList)
        {
          let hospital = hospitalsList[i];
          hospitals[hospital.HId] = hospital;
        }
        return hospitals;
    }
    catch(err)
    {
      return [];
    }
    
  }
  getHospitalsObjectByProgramRameez(
  pid: string | number
): Promise<Record<string, Hospital>> {
  const programId = String(pid);

  // Return already-loaded data immediately.
  if (this.hospitalsCache[programId]) {
    return Promise.resolve(this.hospitalsCache[programId]);
  }

  // Prevent duplicate simultaneous Firestore requests.
  if (this.hospitalsRequests[programId]) {
    return this.hospitalsRequests[programId];
  }

  this.hospitalsRequests[programId] =
    this.loadHospitalsForProgram(programId);

  return this.hospitalsRequests[programId];
}
private async loadHospitalsForProgram(
  programId: string
): Promise<Record<string, Hospital>> {
  try {
    const startedAt = performance.now();

    const snapshot = await this.firestore
      .collection<Hospital>('Hospital', ref =>
        ref.where(
          'PIds',
          'array-contains',
          programId
        )
      )
      .get()
      .toPromise();

    console.log(
      'Firestore hospital query:',
      `${(performance.now() - startedAt).toFixed(0)} ms`
    );

    const documents = snapshot.docs
      .map(doc => {
        const data = doc.data() as Hospital;

        return {
          ...data,
          HId: (data as any).HId || doc.id
        };
      })
      .sort((a: any, b: any) =>
        String(a.HName || '').localeCompare(
          String(b.HName || '')
        )
      );

    const hospitals: Record<string, Hospital> = {};

    for (const hospital of documents) {
      hospitals[(hospital as any).HId] = hospital;
    }

    this.hospitalsCache[programId] = hospitals;
    this.hospitalsByProgram[programId] = hospitals;

    return hospitals;
  } finally {
    delete this.hospitalsRequests[programId];
  }
}
  async getProgramByFriedaID(hidsObj: any[], dataObject): Promise <any>
  {
    try
    {
    let hids      = [...hidsObj];
    let spliced   = [];
    let hospitals = {};
    let calls     = [];
    while( hids.length> 0)
    {
      if (hids.length > 30)
        spliced = hids.splice(0, 30);
      else  
        spliced = hids.splice(0, hids.length);
      calls.push(this.firestore.collection < Hospital > (`HospitalProgramInfo`, ref => ref.where('Frieda', "in", spliced).where("Verified", "==", "Yes").orderBy("TimeStamp", "desc")).get().toPromise());
    }
    let results = await Promise.all(calls);
    for(let result of results){
      for( let i in result.docs)
        {
          let doc = result.docs[i];
          let dataS=doc.data()
          const friedaId = String(dataS.Frieda);
          let key = (friedaId + '_' + dataS.PId).toString();
          hospitals[doc.id] = doc.data();
          if(typeof dataObject[key]['ProgramInfo']=="undefined")
          {
            dataObject[key]['ProgramInfo']=dataS
          }
          
        }
    }
  }
  catch(err)
  {
    console.log("Error=>",err)
  }
   /* for( let i in dataObject)
    {
      let object = dataObject[i];
      if( object.HId in hospitals)
        object.hospital = hospitals[object.HId];
    }*/
    return dataObject;
  }
  async getHospitalsByHIdsRameez(hidsObj: any[], dataObject): Promise <any>
  {
    try
    {
    let hids      = [...hidsObj];
    let spliced   = [];
    let hospitals = {};
    let calls     = [];
    while( hids.length> 0)
    {
      if (hids.length > 30)
        spliced = hids.splice(0, 30);
      else  
        spliced = hids.splice(0, hids.length);
      calls.push(this.firestore.collection < Hospital > (`Hospital`, ref => ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)).get().toPromise());
    }
    let results = await Promise.all(calls);
    for(let result of results){
      for( let i in result.docs)
        {
          let doc = result.docs[i];
          hospitals[doc.id] = doc.data();
        }
    }
    
    /*for( let i in dataObject)
    {
      let object = dataObject[i];
      if( object.HId in hospitals)
        object.hospital = hospitals[object.HId];
    }*/
    Object.keys(dataObject).forEach(key => {
      let object = dataObject[key];
      
      if (hospitals.hasOwnProperty(object.HId)) {
        object.hospital = hospitals[object.HId];
      }
    });
  }
  catch(err)
  {
    console.log("error=====>",err)
  }
    return dataObject;
  }
  async getHospitalsByHIds(hidsObj: any[], dataObject): Promise <any>
  {
    let hids      = [...hidsObj];
    let spliced   = [];
    let hospitals = {};
    let calls     = [];
    while( hids.length> 0)
    {
      if (hids.length > 10)
        spliced = hids.splice(0, 10);
      else  
        spliced = hids.splice(0, hids.length);
      calls.push(this.firestore.collection < Hospital > (`Hospital`, ref => ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)).get().toPromise());
    }
    let results = await Promise.all(calls);
    for(let result of results){
      for( let i in result.docs)
        {
          let doc = result.docs[i];
          hospitals[doc.id] = doc.data();
        }
    }
    for( let i in dataObject)
    {
      let object = dataObject[i];
      if( object.HId in hospitals)
        object.hospital = hospitals[object.HId];
    }
    return dataObject;
  }
  async getSomeHospitals(val)
  {
    let limitedHospitals =  {};
    let docsRef = await this.firestore.collection("Hospital", ref=> ref.orderBy("HName").startAt(val).endAt(val+'\uf8ff')).get().toPromise();
    for( let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      limitedHospitals[doc.id]= {...doc.data(), ...{HId: doc.id}};
    }
    docsRef = await this.firestore.collection("Hospital", ref=> ref.orderBy("City").startAt(val).endAt(val+'\uf8ff')).get().toPromise();
    for( let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      limitedHospitals[doc.id]= {...doc.data(), ...{HId: doc.id}};
    }
    docsRef = await this.firestore.collection("Hospital", ref=> ref.orderBy("State").startAt(val).endAt(val+'\uf8ff')).get().toPromise();
    for( let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      limitedHospitals[doc.id]= {...doc.data(), ...{HId: doc.id}};
    }
    return limitedHospitals;
  }
}