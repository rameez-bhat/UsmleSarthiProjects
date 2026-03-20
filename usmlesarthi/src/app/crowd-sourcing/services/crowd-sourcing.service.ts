import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { HospitalFormData } from '../../models/hospital-form-data';
import { HospitalService } from '../../common/hospital.service';
import { HospitalProgram } from '../../models/hospital-program';
import { Visa } from '../../models/visa';


@Injectable({
  providedIn: 'root'
})
export class CrowdSourcingService {
  collectionRef      :  AngularFirestoreCollection<HospitalFormData[]>;
  docRef       : AngularFirestoreDocument <HospitalFormData>;
  hospitalFormData : any = [];
  hospitalData     : any;
  isUpdated        : boolean = true;
  constructor(private firestore: AngularFirestore, private hospitalApi: HospitalService) {
    this.collectionRef = this.firestore.collection("HospitalProgramInfo");
   }

  fieldsToReset : any = [
    'USCEReq',
    'USCENotCon',
    'Step3Accept',
    'Step2Req',
    'ECFMGReq',
    'Step2CSAccept',
    'InhouseFellow',
    'YOG',
    'j1VisaNew',
    'h1VisaNew',
    'f1VisaNew',
    'noVisaNew',
    'h4VisaNew',
    'website',
  ];

  async getLatestHospitalProgramInfoByHPId( hid : string, pid: string): Promise<HospitalFormData>{
    let data : any; 
    let docs =  await this.firestore.collection<HospitalFormData
    >("HospitalProgramInfo", ref => 
      ref.where("HId", "==", hid).where("PId", "==", pid)
        .where("Verified", "==", "Yes")
        .orderBy("TimeStamp", 'desc')
        .limit(1)
    ).get().toPromise();
    for( var i in docs.docs) {
      var doc = docs.docs[i];
      data = doc.data() as HospitalFormData;
    }
    console.log("data====>",data)
    return data;
  }
  async getLatestHospitalProgramInfoByHPIdList(hid: string, pid: string): Promise<HospitalFormData[]> {
    const data = [];
  
    try {
      const snapshot = await this.firestore.collection<HospitalFormData>(
        "HospitalProgramInfo",
        ref =>
          ref.where("HId", "==", hid)
             .where("PId", "==", pid)
             .orderBy("TimeStamp", "desc")
             .limit(3)
      ).get().toPromise();
  
      snapshot.forEach(doc => {
        const record = doc.data();
        data.push({ ...record, id: doc.id }); // include document ID
      });
  
      return data;
    } catch (error) {
      console.error("Error fetching latest HospitalProgramInfo:", error);
      return [];
    }
  }   

  postHospitalProgramData( hospitalData: HospitalFormData)
  {
    return this.firestore.collection('HospitalProgramInfo').add(hospitalData);
  }

  async updateHospitalProgramData( hospitalData: HospitalFormData,defaultStatus="Completed")
  {
    let hpinfoid   = hospitalData.HPInfoId;
    this.isUpdated = true;
    let data       = hospitalData;
    if(!data.DataOfYear)
    {
      data.DataOfYear=new Date().getFullYear();
    }
    data.TimeStamp = Date.now();
    data.Verified  = "No"
    data.Status    = defaultStatus;
    delete data.HPInfoId;
    delete data.hospital;
    await this.firestore.doc('HospitalProgramInfo/' + hpinfoid).update(data);
  }

  async getHospitalProgramByUId( uid: any): Promise<any>
  {
    const timeStampThisYear = new Date(new Date().getFullYear(), 0, 1).getTime()
    const timeStampThisYear1 = new Date(2025, 6, 28).getTime()
    this.hospitalFormData[uid] = {};
    let docsRef =await this.firestore.collection<HospitalFormData>("HospitalProgramInfo", ref => {
      return ref.where("UId", "==", uid).where("TimeStamp", ">=", timeStampThisYear1).orderBy("TimeStamp", 'desc') }).get().toPromise();
    let hids = [];
    for( var i in docsRef.docs) 
    {
        let doc       = docsRef.docs[i];
        let data      = doc.data();
        data.HPInfoId = doc.id;
        hids.push(data.HId);
        this.hospitalFormData[uid][data.HPInfoId] = (data as HospitalFormData);
    };
    await this.hospitalApi.getHospitalsByHIds(hids,this.hospitalFormData[uid]);
    this.isUpdated = false;
    return this.hospitalFormData[uid];
}

  async assignHospitals (selectvalues: any[], uid: any, pid: any): Promise<any> 
  {
    this.isUpdated = true; 
    for (let index = 0; index < selectvalues.length; index++) {
      const hid = selectvalues[index].value;
      if (hid=="No Preference")
          await this.assignHospitalRandom(uid, pid, 0);
      else
          await this.assignHospitalPreference(hid, uid, pid);
    }
  }
  async assignHospitalRandom(uid: any, pid: any, counter: number): Promise<any>
  {
    let docs = await this.firestore.collection("HospitalProgram", ref => {
      return ref
        .where("PId", "==", pid)
        .orderBy("AssignedNum")
        .startAt(counter)
        .limit(1);
    }).get().toPromise();
    for( var i in docs.docs) {
      let doc = docs.docs[i];
      let docData = doc.data();
      let condition = await this.IfAlreadyAssociated(doc.id, uid);
      if(!condition)
      {
        let data    = await this.getLatestHospitalProgramInfoByHPId(docData.HId, docData.PId);
        let dataCheck    = await this.getLatestHospitalProgramInfoByHPIdList(docData.HId, docData.PId);
        if( data== null)
          data= new HospitalFormData();
        data.HPId      = doc.id;
        data.HId       = docData.HId;
        data.PId       = pid;
        data.UId       = uid;
        data.AssignedOn = Date.now();
        data.Status    = "Not Completed";
        data.Verified  = "No";
        data.VerifiedAdmin = "";
        data.TimeStamp = Date.now();
        Object.keys(data).forEach((field) => {
          if (this.fieldsToReset.includes(field) || field.includes("Step"))
            data[field] = '';
        })
        if(dataCheck.length>=2)
        {
            let DocumentID=dataCheck[1].id;
            let DataUpdate=dataCheck[1];
            DataUpdate.UId       = uid;
            DataUpdate.Status    = "Not Completed";
            DataUpdate.Verified  = "No";
            DataUpdate.AssignedOn = Date.now();
            DataUpdate.VerifiedAdmin = "";
            DataUpdate.TimeStamp = Date.now();
            let resl=await this.firestore.doc(`HospitalProgramInfo/${DocumentID}`).update(DataUpdate);

        }
        else
        {
          await this.firestore.collection<HospitalFormData>("HospitalProgramInfo").add({...data});
          await this.updateAssignedNum(doc.id);
        }
        //await this.firestore.collection<HospitalFormData>("HospitalProgramInfo").add({...data});
        //await this.updateAssignedNum(doc.id);
        return;
      }
      else{
        this.assignHospitalRandom(uid, pid, counter + 1 );
        return ;
      }
    };
  }

  async assignHospitalPreference(hid: any, uid: any, pid: any): Promise<any>
  {
    let docRef  = await this.firestore.collection<HospitalProgram>("HospitalProgram", ref => ref.where("PId", "==", pid).where("HId", "==", hid)).get().toPromise();
    let hpid    = docRef.docs[0].id || '';
    let docData = docRef.docs[0].data();
    let condition = await this.IfAlreadyAssociated(hpid, uid);
    console.log("condition----->",condition)
    if( !condition)
    {
      let data    = await this.getLatestHospitalProgramInfoByHPId(docData.HId, docData.PId);
      console.log("dataCheck-data---->",data)
      let dataCheck    = await this.getLatestHospitalProgramInfoByHPIdList(docData.HId, docData.PId);
      console.log("dataCheck----->",dataCheck)
        if( data== null)
          data= new HospitalFormData();
        
        data.HPId      = hpid;
        data.HId       = hid;
        data.PId       = pid;
        data.UId       = uid;
        data.Status    = "Not Completed";
        data.Verified  = "No";
        data.AssignedOn = Date.now();
        data.AssignedYear = new Date().getFullYear();
        data.VerifiedAdmin = "";
        data.TimeStamp = Date.now();
        Object.keys(data).forEach((field) => {
          if (this.fieldsToReset.includes(field) || field.includes("Step"))
            data[field] = '';
        })
        if(dataCheck.length>=2)
        {
          let DocumentID=dataCheck[1].id;
          let DataUpdate=dataCheck[1];
          DataUpdate.UId       = uid;
          DataUpdate.Status    = "Not Completed";
          DataUpdate.Verified  = "No";
          DataUpdate.AssignedOn = Date.now();
          DataUpdate.AssignedYear = new Date().getFullYear();
          DataUpdate.VerifiedAdmin = "";
          DataUpdate.TimeStamp = Date.now();
          let resl=await this.firestore.doc(`HospitalProgramInfo/${DocumentID}`).update(DataUpdate);
        }
        else
        {
          await this.firestore.collection<HospitalFormData>("HospitalProgramInfo").add({...data});
          await this.updateAssignedNum(hpid);
        }
      
    }
    else
    {
      await this.assignHospitalRandom(uid, pid, 0);
    }
  }
  
  async updateAssignedNum(hpid: any): Promise<any>
  {
    let doc = await this.firestore.doc(`HospitalProgram/${hpid}`).get().toPromise(); 
    let data = doc.data() as HospitalProgram;
    data.AssignedNum += 1;
    await this.firestore.doc(`HospitalProgram/${hpid}`).update(data);
  }

  async IfAlreadyAssociated(hpid: any, uid: any): Promise<boolean>
  {
    let docs = await this.firestore.collection("HospitalProgramInfo", ref => {
      return ref
        .where("HPId", "==", hpid)
        .where("UId", "==", uid)
    }).get().toPromise();
    if (docs.empty)
    {
      return false;
    }
    else
    {
      return true;
    } 
  }
  
  async checkForIncomplete( uid: any): Promise<boolean>
  {
    let docs = await this.firestore.collection("HospitalProgramInfo", ref=> {
      return ref
        .where("UId",'==', uid)
        .where("Status", "==", "Not Completed")
    }).get().toPromise();
    if (docs.empty)
      return false;
    else
      return true;
  }
  async getVisaList(): Promise<Visa[]>
  {
    let visaList = [];
    let docsRef = await this.firestore.collection<Visa>("Visa").get().toPromise();
    for( var i in docsRef.docs)
    {
      let doc  = docsRef.docs[i];
      let data = doc.data();
      data.VId = doc.id;
      visaList.push(data as Visa);
    }
    return visaList;
  }
  async getVisabyHPInfoId(hpinfoid: any): Promise<any[]>
  {
    let userVisa = [];
    let docsRef = await this.firestore.collection("HospitalProgramInfoVisa", ref=> ref.where("HPInfoId", "==" , hpinfoid)).get().toPromise();
    for( var i in docsRef.docs)
    {
      let doc  = docsRef.docs[i];
      let data = doc.data().VId;
      userVisa.push(data);
    }
    return userVisa;
  }
  /*async convertAllAssignToNumbers()
  {
    let count =0;
    let docs = await this.firestore.collection('HospitalProgramInfo').get().toPromise();
    docs.forEach(async doc => {
      try{
      let data     = doc.data();
      if(typeof data.TimeStamp === 'string')
      {
        let timeStamp = new Date( data.TimeStamp);
        data.TimeStamp = timeStamp;
      }
      if(typeof data.Step1ScoreLastYearMax === 'string'){
        let step1Max = parseInt(data.Step1ScoreLastYearMax);
        data.Step1ScoreLastYearMax = step1Max;}
      if(typeof data.Step1ScoreLastYearMin === 'string'){
      let step1Min = parseInt(data.Step1ScoreLastYearMin);
      data.Step1ScoreLastYearMin = step1Min;}
      if(typeof data.Step2Max === 'string'){
      let step2Max = parseInt(data.Step2Max);
      data.Step2Max = step2Max;}
      if(typeof data.Step2Min === 'string'){
      let step2Min = parseInt(data.Step2Min);
      data.Step2Min = step2Min;}
      await this.firestore.doc(`HospitalProgramInfo/${doc.id}`).set(data);
        count++ ;
    }
      catch(err)
      {
        console.log(err, "error in ", doc.id);
      }
    });
    await console.log("done", count);
  }*/
  async removeNotCompletedHospitalsForUser( uid: any): Promise<any>
  {
    let docs = await this.firestore.collection("HospitalProgramInfo", ref=> {
      return ref
        .where("UId",'==', uid)
        .where("Status", "==", "Not Completed")
    }).get().toPromise();
    docs.docs.forEach(docRef => {
      docRef.ref.delete()
    })
  }
  async removeIncompleteHospitalsForUser( uid: any): Promise<any>
  {
    let docs = await this.firestore.collection("HospitalProgramInfo", ref=> {
      return ref
        .where("UId",'==', uid)
        .where("Status", "==", "Incomplete")
    }).get().toPromise();
    docs.docs.forEach(docRef => {
      docRef.ref.delete()
    })
  }
}

