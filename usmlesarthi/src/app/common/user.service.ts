import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  allUsers : any;
  usersUpdated: boolean;
  NAusers: any;
  naUpdated: boolean;
  customVisa: any =  [{Type: "GC/US citizen/H4 EAD", VId:"1"},{Type:"Need H1", VId:"2"},{Type:"Need J1", VId:"3"}, {Type:"Other", VId:"4"}];
  

  constructor(private firestore: AngularFirestore) {
    this.usersUpdated = true;
    this.naUpdated = true;
   }

  async getUsersByUIds(uids, dataObject)
  {
    let spliced   = [];
    let users = {};
    let calls = [];
    while( uids.length> 0)
    {
      if (uids.length > 10)
        spliced = uids.splice(0, 10);
      else  
        spliced = uids.splice(0, uids.length);
      calls.push(this.firestore.collection < User > (`Users`, ref => ref.where("uid", "in", spliced)).get().toPromise());
    }
    let results = await Promise.all(calls);
    for(let result of results){
    for( let i in result.docs)
      {
        let doc = result.docs[i];
        users[doc.id] = doc.data();
      }
    }
    for( let i in dataObject)
    {
      let object = dataObject[i];
      if( object.UId in users)
        object.user = users[object.UId];
    }
    return dataObject;
  }

  async getAllUsers()
  {
    this.allUsers = {};
    this.NAusers = {};
    let docsRef = await this.firestore.collection<User>("UsersRoles").get().toPromise();
    for( let i in docsRef.docs)
      {
        let doc = docsRef.docs[i];
        this.allUsers[doc.id] = doc.data();
        let data = doc.data();
        if (data.Role=="NA")
          this.NAusers[doc.id] = data;
      }
    this.usersUpdated = false;
    this.naUpdated = false;
    return this.allUsers;
  }
  async getSomeUsers(val)
  {
    let limitedUsers =  {};
    let docsRef = await this.firestore.collection<User>("UsersRoles", ref=> ref.orderBy("displayName").startAt(val).endAt(val+'\uf8ff')).get().toPromise();
    for( let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      limitedUsers[doc.id]= doc.data();
    }
    docsRef = await this.firestore.collection<User>("UsersRoles", ref=> ref.orderBy("email").startAt(val).endAt(val+'\uf8ff')).get().toPromise();
    for( let i in docsRef.docs)
    {
      let doc = docsRef.docs[i];
      limitedUsers[doc.id]= doc.data();
    }
    return limitedUsers;
  }
  async getNAusers()
  {
    this.NAusers = {}
    let docsRef = await this.firestore.collection<User>("UsersRoles", ref=> ref.where("Role", "==", "NA")).get().toPromise();
    for( let i in docsRef.docs)
      {
        let doc = docsRef.docs[i];
        this.NAusers[doc.id] = doc.data();
      }
    this.naUpdated = false;
    return this.NAusers;
  }
  async verifyRejectUsers(dataObject, uid)
  {
    let docsRef = await this.firestore.doc(`UsersRoles/${uid}`).update({
      Role: dataObject.newRole,
    })
    this.naUpdated = true;
    this.usersUpdated = true;
    return dataObject;
  }
  async changeRole(dataObject)
  {
    let docRef = await this.firestore.doc(`UsersRoles/${dataObject.uid}`).update({
      Role:dataObject.newRole,
    })
    this.usersUpdated = true;
    if(dataObject.newRole=="NA")
      this.naUpdated = true;
    return dataObject;
  }
  async getUserProfiles(userids){
    let uids      = [...userids];
    let spliced   = [];
    let users = {};
    let calls = [];
    while( uids.length> 0)
    {
      if (uids.length > 10)
        spliced = uids.splice(0, 10);
      else  
        spliced = uids.splice(0, uids.length);
      calls.push(this.firestore.collection (`Users`, ref => ref.where(firebase.firestore.FieldPath.documentId(), "in", spliced)).get().toPromise());
    }
    let results = await Promise.all(calls);
    for(let result of results){
      for( let doc of result.docs)
        {
          let data = doc.data();
          users[doc.id] = {
            Step1Score: data.Step1Score,
            Step2Score: data.Step2Score,
            USCE: data.USCE,
            YOG: data.YOG,
            Visas: this.convertVisa(data),
          };
        }
    }
    return users;
  }
  convertVisa(userData){
    let customVisas= {};
    if("Visas" in userData){
      for(let i in userData.Visas){
        let vid=  userData.Visas[i];
        if (vid=="7")
          customVisas["4"] = 1;
        else if (vid=="1" || vid=="6")
          customVisas["1"] = 1;
        else if (vid=="2")
          customVisas["2"] = 1;
        else if (vid=="3")
          customVisas["3"] = 1;
      }
    }
    let newVisas = Object.keys(customVisas);
    return newVisas;
  }
  async getAllUsersWithMedicalSchool()
  {
    this.allUsers = {};
    let users = this.firestore.collection<User>("Users").get().toPromise();
    let usersExtraData  =this.firestore.collection<User>("UsersExtraData").get().toPromise();
    await Promise.all([users, usersExtraData]).then(results => results.forEach((docsRef, ind) => {
    for( let i in docsRef.docs)
      {
        let doc = docsRef.docs[i];
        let data = doc.data();
        if (ind===0){
          this.allUsers[doc.id] = {
            uid: doc.id,
            email : data.email,
            displayName : data.displayName,
            medicalSchool  :data.medicalSchool,
          };
        }
        else{
          this.allUsers[doc.id] = {
            ...this.allUsers[doc.id],
            School  :data.School, 
            schoolCountry : data.schoolCountry,
          };
        }
      }
    }));
    return this.allUsers;
  }
}
