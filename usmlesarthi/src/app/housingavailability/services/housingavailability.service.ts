import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  rotations: any = [];
  hospitalsFetched: boolean = false;

  constructor(private firestore: AngularFirestore) { }
  async getSelectedHousing(locationCode) {
    this.rotations = {};
    let docsRef = await this.firestore.collection("Housings", ref => ref.where("housingId", "==", locationCode)).get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      data.fee = typeof (data.fee) === "number" || (typeof (data.fee) === "string" && !data.fee.includes("$")) ? "$" + data.fee : data.fee;
      data.registration_fee = typeof (data.registration_fee) === "number" || (typeof (data.registration_fee) === "string" && !data.registration_fee.includes("$")) ? "$" + data.registration_fee : data.registration_fee;
      data.visa_letter = data.visa_letter || '';
      data.type = data.type || '';
      this.rotations[data.id] = data;
    }
    return this.rotations;
  }
  async enquireHousing(userData, housingId, input: any = {}) {
    let enquiryDoc = null;
    console.log("userData---->",!userData)
    console.log("housingId---->",housingId)
    console.log("input---->",input)
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
  async getSavedStripeSession(useremail,timestamp) {
    const sessiondata = {};
    let docsRef = await this.firestore.collection("StripeSessions", ref => ref.where("customer_email", "==", useremail).where("createdAt", ">=", timestamp)).get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      sessiondata[data.id] = data;
    }
    return sessiondata;
  }
  async getAllHospitals() {
    if (!this.hospitalsFetched) {
      this.rotations = {};
      let docsRef = await this.firestore.collection("Rotations", ref=>ref.orderBy("rank", "asc")).get().toPromise();
      for (let doc of docsRef.docs){
        let data = doc.data();
        data.id = doc.id;
        data.fee = typeof (data.fee) === "number" || (typeof (data.fee) === "string" && !data.fee.includes("$")) ? "$" + data.fee : data.fee;
        data.registration_fee = typeof (data.registration_fee) === "number" || (typeof (data.registration_fee) === "string" && !data.registration_fee.includes("$")) ? "$" + data.registration_fee : data.registration_fee;
        data.visa_letter = data.visa_letter || '';
        data.type = data.type || '';
        this.rotations[data.id] = data;
      }
      this.hospitalsFetched = true;
    }
    return this.rotations;
  }

  async getEnquiriesByUId(userData) {
    if (!userData)
      return [];
    let docsRef = await this.firestore.collection("Enquiries", ref => ref.where("uid", "==", userData.uid)).get().toPromise();
    let data = [];
    for (let doc of docsRef.docs) {
      let docData = doc.data();
      let utcDate = new Date(docData.startDate);
      docData.startDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()).toDateString();
      data.push(docData);
    }
    return data;
  }
  async  generateInquiryId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
 async ReadUserFromUID(uid: string,TableName: string): Promise<any | null> {
  try {
    const docRef = this.firestore.doc(`${TableName}/${uid}`).ref;
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn('User not found for UID:', uid);
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Error reading user by UID:', error);
    return null;
  }
}
async getMaxInquiryId(){

  //let docsRef = await this.firestore.collection("Enquiries", ref=>ref.where("inquiryID", "==", 2025+"%").orderBy("inquiryID", "desc")).get().toPromise();
  let currentYear = new Date().getFullYear();
  let startInquiryID = currentYear * 10 + 1;
  let docsRef = await this.firestore.collection("Enquiries", ref =>
    ref.where("inquiryYear", "==", currentYear)  // Start at 20251
       .orderBy("inquiryID", "desc")  // Get max inquiryID
       .limit(1)  // Optimize query
  ).get().toPromise();
  console.log("docsRef====>",docsRef)
  if (!docsRef.empty) {
      return docsRef.docs[0].data().inquiryID; // Return the max inquiryId
  }
  return 0;
}
  async enquireRotation(userData, rotationId,rotationLocationCode="", input: any = {}) {
    let enquiryDoc = null;
    if ((!userData && !input.isNewUser) || !rotationId)
      throw "Parameters didn't match";
    /*if (!input.isNewUser)
    {
      let docRef = await this.firestore.collection("Enquiries", ref => ref.where("uid", "==", userData.uid).where("rotationId","==", rotationId)).get().toPromise();
      for (let doc of docRef.docs){
        let data = doc.data ();
        enquiryDoc = doc.id;
      }
    }*/
  let currentYear = new Date().getFullYear();
   let InqueryId=await this.getMaxInquiryId();
   InqueryId=InqueryId+1;
    let date = input.date;
    let dataObj = {};
    if (!input.isNewUser)
      dataObj = {
        rotationId: rotationId,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        location_code: rotationLocationCode,
        status: "Pending",
        query: input.query,
        duration: input.duration,
        sarthi : input.sarthi,
        startDate: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
        timestamp: new Date().getTime(),
        inquiryYear: currentYear,
        inquiryID: InqueryId,
        isNewUser: false
      };
    else
      dataObj = {
        rotationId: rotationId,
        email: input.email,
        displayName: input.name,
        status: "Pending",
        query: input.query,
        location_code: rotationLocationCode,
        duration: input.duration,
        inquiryYear: currentYear,
        inquiryID: InqueryId,
        startDate: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
        timestamp: new Date().getTime(),
        phone : input.phone,
        isNewUser: true
      };
      let res;
    if (enquiryDoc)
     res= await this.firestore.doc(`Enquiries/${enquiryDoc}`).set(dataObj, { merge: true });
    else
     res= await this.firestore.collection("Enquiries").add(dataObj);
  console.log("resres===>",res)
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
    return data;
  }

}
