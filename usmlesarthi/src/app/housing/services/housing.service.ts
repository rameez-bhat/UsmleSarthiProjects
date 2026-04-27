import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  rotations: any = [];
  hospitalsFetched: boolean = false;

  constructor(private firestore: AngularFirestore) { }

  async getAllHospitals(rotationcode) {
    
    this.rotations = {};
    let docsRef;
    if(rotationcode!=null &&  rotationcode!="")
    {
        docsRef = await this.firestore
    .collection("Housings", ref =>
      ref.where(`LocationCodes.${rotationcode}`, '==', rotationcode)
    )
    .get()
    .toPromise();
    if(docsRef.empty)
    {
      docsRef = await this.firestore.collection("Housings").get().toPromise();
    }
    }
    else
    {
      docsRef = await this.firestore.collection("Housings").get().toPromise();
    }
    //let docsRef = await this.firestore.collection("Housings").get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      this.rotations[data.id] = data;
    }
    return this.rotations;
  }

  async getEnquiriesByUId(userData) {
    if (!userData)
      return [];
    let docsRef = await this.firestore.collection("HousingEnquiries", ref => ref.where("uid", "==", userData.uid)).get().toPromise();
    let data = [];
    for (let doc of docsRef.docs) {
      let docData = doc.data();
      let utcDate = new Date(docData.startDate);
      docData.startDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()).toDateString();
      data.push(docData);
    }
    return data;
  }

  async enquireHousing(userData, housingId, input: any = {}) {
    let enquiryDoc = null;
    if ((!userData && !input.isNewUser) || !housingId)
      throw "Parameters didn't match";
    /*if (!input.isNewUser)
    {
      let docRef = await this.firestore.collection("Enquiries", ref => ref.where("uid", "==", userData.uid).where("rotationId","==", rotationId)).get().toPromise();
      for (let doc of docRef.docs){
        let data = doc.data ();
        enquiryDoc = doc.id;
      }
    }*/
    let date = input.date;
    let dataObj = {};
    if (!input.isNewUser)
      dataObj = {
        housingId: housingId,
        uid: userData.uid,
        status: "Pending",
        query: input.query,
        duration: input.duration,
        startDate: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
        timestamp: new Date().getTime(),
        isNewUser: false
      };
    else
      dataObj = {
        housingId: housingId,
        email: input.email,
        displayName: input.name,
        status: "Pending",
        query: input.query,
        duration: input.duration,
        startDate: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
        timestamp: new Date().getTime(),
        isNewUser: true
      };
    if (enquiryDoc)
      await this.firestore.doc(`HousingEnquiries/${enquiryDoc}`).set(dataObj, { merge: true });
    else
      await this.firestore.collection("HousingEnquiries").add(dataObj);
  }

  async getReviews(locationCode) {
    if (!locationCode)
      return [];
    let docsRef = await this.firestore.collection("RotationReviews", ref => ref.where("location_code", "==", locationCode)).get().toPromise();
    let data = []
    for (let doc of docsRef.docs) {
      let docData = doc.data();
      data.push(docData);
    }
    console.log(data);
    return data;
  }

}
