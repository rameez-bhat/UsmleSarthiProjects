import { Injectable } from '@angular/core';
import { CrowdSourcingService } from '../../crowd-sourcing/services/crowd-sourcing.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  
  paymentKeys = ['matchPayments', 'researchPayments', 'rotations'];
  enrollmentKeys = ['matchEnrollmentDate', 'researchEnrollmentDate'];

  constructor(private crowdService: CrowdSourcingService, private firestore: AngularFirestore) { }

  async getVisaList(){
    return await this.crowdService.getVisaList();
  }

  async getReferralCode(userId) {
    let docRef = await this.firestore.doc(`ReferralCodes/${userId}`).get().toPromise();
    if (docRef.exists){
      return docRef.data();
    }
    else{
      let createReferralCode = firebase.functions().httpsCallable("createReferralCode");
      let response = (await createReferralCode()).data;
      let { data } = response;
      if (!(data && data.code))
        throw "Internal Error";
      return data;
    }

  }

  async updateMainProfile(userData){
    let dataObject = {
      Step1Score : userData.Step1Score,
      Step2Score : userData.Step2Score,
      YOG        : userData.YOG,
      Visas      : userData.Visas, 
      USCE       : userData.USCE,
      Step1Result : userData.Step1Result,
      Step2Result : userData.Step2Result,
      Locked     : "1"
    }
    Object.keys(dataObject).forEach(key => {
      if (dataObject[key] === undefined) {
        delete dataObject[key];
      }
    });
    await this.firestore.doc(`Users/${userData.uid}`).set(dataObject, {merge: true});
  }

  async updateExtraProfile(userData){
    let dataObject = {...userData};
    delete dataObject.email;
    delete dataObject.emailVerified;
    delete dataObject.Role;
    delete dataObject.Locked;
    delete dataObject.extraUsersData;
    delete dataObject.displayName;
    await this.firestore.doc(`UsersExtraData/${userData.uid}`).set(dataObject, {merge: true});
  }

  async getUserPaymentByEmail(userEmail) {
    let docsRef = await this.firestore.collection(`UsersPayments`, ref => ref.where("email", "==", userEmail).limit(1)).get().toPromise();
    let dataObject = {};
    for(let docRef of docsRef.docs){
      if(docRef.exists)
        dataObject = {
          ...docRef.data(),
          id : docRef.id
        };
      else
        dataObject = {};
      for (let enrollmentKey of this.enrollmentKeys){
        if (dataObject[enrollmentKey]){
          let date = new Date(dataObject[enrollmentKey]);
          dataObject[enrollmentKey] = date.toDateString();
        }
      }
      for (let paymentKey of this.paymentKeys){
        if (dataObject[paymentKey] && dataObject[paymentKey].length> 0){
          for(let payment of dataObject[paymentKey]){
            if (payment.date){
              let date = new Date(payment.date);
              payment.date = date.toDateString();
            }
          }
        }
      }
  }
  return dataObject;
  }

  async getUserNotes(userId) {
    let docRef = await this.firestore.doc(`MeetingNotes/${userId}`).get().toPromise();
    if (docRef.exists)
      return docRef.data();
    return {};
  }

  async updateNotes(userId, userNotes) {
    await this.firestore.doc(`MeetingNotes/${userId}`).set(userNotes, {merge : true});
  }
}
