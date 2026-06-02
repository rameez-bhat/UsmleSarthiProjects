import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RotationsService {
  rotations: any = [];
  hospitalsFetched: boolean = false;

  constructor(private firestore: AngularFirestore) { }
  async updateGuestPayment(uid,emailid,rotationcode,rotationstartDate,amt,sessionId,PaymentType,FeeType,TotalInstallements,InstallementNo,PromotionDataDiscountAmount,PromotionDataDiscountText) {
    //let docsRefRo = await this.firestore.collection("GuestUserPayments", ref => ref.where("email", "==", rotationcode)).get().toPromise();
    let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let DataToBeSaved ={email:emailid,rotationcode:rotationcode,rotationstartDate:rotationstartDate,amount:amt,paymentdate:formattedDate,"serviceType":PaymentType};
    //let docsRefRo = await this.firestore.collection("GuestUserPayments").doc(emailid).get().toPromise();
    //let paymentsRef = await this.firestore.collection("GuestUserPayments").doc(emailid).collection("Payments").get().toPromise();
    console.log("DataToBeSaved====>",DataToBeSaved)
    this.firestore.collection("GuestUserPaymentsList").doc(emailid).set(DataToBeSaved, { merge: true })
      this.firestore.collection("GuestUserPayments").doc(emailid).collection("Payments").doc(rotationcode+"___"+rotationstartDate+"___"+formattedDate).set(DataToBeSaved)
  .then(function() {
    
    console.log("✅ Message saved successfully!");
  })
  .catch(function(error) {
    console.error("❌ Error saving message: ", error);
  });
    await this.firestore
  .collection("StripeSessions")
  .doc(sessionId)
  .delete()
  .then(() => {
    console.log("✅ Document successfully deleted!");
  })
  .catch((error) => {
    console.error("❌ Error deleting document: ", error);
  });
    

  }
  async deleteFromTableWithWhere(TableName: string, WhereConditions: any[]) {
  try {

    // Build composite query
    const queryFn = (ref: firebase.firestore.CollectionReference) => {
      let query: firebase.firestore.Query = ref;

      WhereConditions.forEach(cond => {
        query = query.where(cond.columnName, cond.condition, cond.value);
      });

      return query;
    };

    // Run the query
    const querySnapshot = await this.firestore.collection(TableName, queryFn).get().toPromise();

    const batch = this.firestore.firestore.batch();

    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true, deleted: querySnapshot.size };

  } catch (error) {
    console.error("Error deleting documents:", error);
    return { success: false, error };
  }
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
async UpdateDocumentByUID(uid: string,TableName: string,updateData: any): Promise<boolean> {
  try {
    const docRef = this.firestore.doc(`${TableName}/${uid}`).ref;

    await docRef.set(updateData, { merge: true });

    console.log(`Document updated successfully in ${TableName} for UID:`, uid);
    return true;

  } catch (error) {
    console.error('Error updating document:', error);
    return false;
  }
}
  async getSelectedRotation(locationCode) {
    this.rotations = {};
    let docsRef = await this.firestore.collection("Rotations", ref => ref.where("location_code", "==", locationCode)).get().toPromise();
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
  async getLocalStorageSession(locationCode) {
    let GetSessionList = {};
    let docsRef = await this.firestore.collection("LocalStorageSession", ref => ref.where("saved_session", "==", locationCode)).get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      GetSessionList[data.id] = data;
    }
    return GetSessionList;
  }
  async saveLocalStorageSession(locationCode) {
    const dateP = new Date();
    await this.firestore
    .collection("LocalStorageSession")
    .doc(locationCode)
    .set(
      { saved_session: locationCode,created_at:dateP },
      { merge: true }
    );
  }
  formatDateToMonthYear(dateStr)
  {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length >= 2) 
    {
      return parts[1] + '-' + parts[0];
    }
    return '';
  }
  async updateAddMatch(functionParams) {
    this.rotations = {};
    let PaymentTypeSet="Match";
    let timestampP :any ="";
    let PromotionDataDiscountText:any="";
    /*this.SendFullArrayToFunction['sessionId']=this.sessionId;
        this.SendFullArrayToFunction['studentUID']=this.studentUID;
        this.SendFullArrayToFunction['studentEmail']=this.studentEmail;
        this.SendFullArrayToFunction['rotationCode']=this.rotationCode;
        this.SendFullArrayToFunction['BookingSelectedDate']=this.BookingSelectedDate;
        this.SendFullArrayToFunction['totalPlanAmount']=this.totalPlanAmount;
        this.SendFullArrayToFunction['feePaidtoShow']=this.feePaidtoShow;
        this.SendFullArrayToFunction['TotalInstallementsPaid']=this.TotalInstallementsPaid;
        this.SendFullArrayToFunction['InstallementNo']=this.InstallementNo;
        this.SendFullArrayToFunction['PaymentType']=this.PaymentType;
        this.SendFullArrayToFunction['FeeType']=this.FeeType;
        this.SendFullArrayToFunction['PromotionDataDiscountAmount']=this.PromotionDataDiscountAmount;
        this.SendFullArrayToFunction['PromotionDataDiscountText']=this.PromotionDataDiscountText;
        this.SendFullArrayToFunction['PaymentSuccessFailur']=this.PaymentSuccessFailur;
        this.SendFullArrayToFunction['AllowTesting']=this.AllowTesting;
        this.SendFullArrayToFunction['Amount']=this.Amount;
        this.SendFullArrayToFunction['AdminLink']=this.AdminLink;
        this.SendFullArrayToFunction['PromotorDiscountFromParam']=this.PromotorDiscountFromParam;*/
    let docsRef = await this.firestore.collection("UserServices", ref => ref.where("uid", "==", functionParams['studentUID'])).get().toPromise();
    if (!docsRef.empty) 
    {
      for (let doc of docsRef.docs)
      {
        let Alreadydata = doc.data();
        const dateP = new Date();
      timestampP = dateP;
      if(!Alreadydata.Match)
      {
        Alreadydata['Match']={};
      }
      Alreadydata['Match']['EnrollmentDate']=timestampP;
      Alreadydata['Match']['PaymentPlan']="Full Payment Received";
      if(!Alreadydata['Match']['Plan'])
      {
        Alreadydata['Match']['Plan']={};
      }
      Alreadydata['Match']['Plan']['Name']=functionParams['rotationCode'];
      if(!Alreadydata['Match']['Plan']['Relation'])
      {
        Alreadydata['Match']['Plan']['Relation']={};
      }
      Alreadydata['Match']['Plan']['Name']=functionParams['rotationCode'];
      Alreadydata['Match']['Plan']['Name']=functionParams['rotationCode'];
      Alreadydata['Match']['EnrollmentDate']=timestampP;
    
      const MatchPayment = {Payment0:{
        
          Amount:Number(
            (((functionParams['Amount'] / 100) / functionParams['TotalInstallementsPaid']).toFixed(2))),
          ModeOfPayment: "Stripe" ,
          PaymentDate: timestampP,
          Discount:{Amount:"",Code:"",Notes:"",Value:"No"},
      }};
      if(functionParams['TotalInstallementsPaid']>1)
      {
        Alreadydata['Match']['PaymentPlan']="On Installments";
      }
      //MatchPayment['Payment0']['Discount']={Amount:,Code:,Notes:,Value:"Yes"}
      Alreadydata['Match']['Payments']=MatchPayment;
       await this.firestore
  .collection("UserServices")
  .doc(functionParams['studentUID'])
  .set(
    Alreadydata,
    { merge: true }
  );
      }
    }
     else
    {
      const dateP = new Date();
      timestampP = dateP;
      const DataArray={
        EnrollmentDate:timestampP,
        PaymentPlan:"Full Payment Received",
        Plan:{Name:functionParams['rotationCode'],Relation:{}}

      };
      const MatchPayment = {Payment0:{
        
          Amount: functionParams['Amount']/100,
          ModeOfPayment: "Stripe" ,
          PaymentDate: timestampP,
          Discount:{Amount:"",Code:"",Notes:"",Value:"No"},
      }};
      if(functionParams['TotalInstallementsPaid']>1)
      {
        DataArray['PaymentPlan']="On Installments";
      }
      //MatchPayment['Payment0']['Discount']={Amount:,Code:,Notes:,Value:"Yes"}
      DataArray['Payments']=MatchPayment;
       await this.firestore
  .collection("UserServices")
  .doc(functionParams['studentUID'])
  .set(
    { Match: DataArray,uid:functionParams['studentUID'] },
    { merge: true }
  );
    }
     if(functionParams['PromotorDiscountFromParam'].PromotorDiscountsAmount)
      {
        PromotionDataDiscountText=PromotionDataDiscountText+" ReferalDiscount="+functionParams['PromotorDiscountFromParam'].PromotorDiscountsAmount; 
        if(functionParams['PromotorDiscountFromParam'].PromotorReferralDiscountAmount)
        {
          const MyDiscount=functionParams['PromotorDiscountFromParam'].PromotorReferralDiscountAmount;
          const RdateObj = new Date(timestampP); 
          const Rdd = String(RdateObj.getDate()).padStart(2, '0');
          const Rmm = String(RdateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const Ryyyy = RdateObj.getFullYear();

          const RformattedDate = `${Rdd}-${Rmm}-${Ryyyy}`;
          let  PaymentTypeSetKey = PaymentTypeSet.replace(/\s+/g, '');
          PaymentTypeSetKey = PaymentTypeSetKey+"_"+RformattedDate
          const PromotorObjectToUpdate={ReferralObject:{MyReferrals:{[functionParams['studentUID']]:{Payments:{[functionParams['rotationCode']]:{[PaymentTypeSetKey]:{PaymentType:PaymentTypeSet,MyDiscount:MyDiscount,AmountPaidByUser:functionParams['Amount']/100,matchCode:functionParams['rotationCode'],PaymentTypeSet:PaymentTypeSet,PaymentDate:timestampP}}}}}}};
          await this.UpdateDocumentByUID(functionParams['PromotorDiscountFromParam'].Promotoruid,"Users",PromotorObjectToUpdate);
        }
      }
      await this.firestore
  .collection("StripeSessions")
  .doc(functionParams['sessionId'])
  .delete()
  .then(() => {
    console.log("✅ Document successfully deleted!");
  })
  }
  async updateAddRotation(uid,emailid,rotationcode,rotationstartDate,amt,sessionId,PaymentType,FeeType,TotalInstallements,InstallementNo,PromotionDataDiscountAmount,PromotionDataDiscountText,PromotorDiscountFromParam) {
    this.rotations = {};
    const MainPaymentID=rotationcode+rotationstartDate;
    let RotationData: any ={}
    let docsRefRo = await this.firestore.collection("Rotations", ref => ref.where("location_code", "==", rotationcode)).get().toPromise();
    let bookingData={};
    let bookingPath="";
    let RotationIdToUpdate="";
    for (let doc of docsRefRo.docs){
      let data = doc.data();
      RotationData=data;
      RotationData['DOCUMENTID']=doc.id;
      let monthstring=this.formatDateToMonthYear(rotationstartDate)
      bookingPath = `Bookings.${monthstring}.${uid}`;

  // Data for that specific user-month
  bookingData = {
    uid: uid,
    email: emailid,
    locationCode: rotationcode,
    startDate: rotationstartDate,
    amount: amt
  };
  RotationIdToUpdate=doc.id;
  // ✅ Use dot notation to merge instead of replace
  /*await this.firestore
    .collection("Rotations")
    .doc(doc.id)
    .update({
      [bookingPath]: bookingData
    });

  console.log("Merged successfully for:", bookingPath);*/
    }
    let docsRef = await this.firestore.collection("UserServices", ref => ref.where("uid", "==", uid)).get().toPromise();
    if (!docsRef.empty) 
    {
      for (let doc of docsRef.docs){
      let data = doc.data();
      const DataArray=await this.convertRotationsObjectToArray(data);
      if (typeof DataArray.RotationData === "undefined") {
        DataArray["RotationData"] = { Rotations: [] };
      }
      // 🔹 Prepare timestamps
      const indexRotation = DataArray["RotationData"]['Rotations'].findIndex(
        rotation => rotation.PaymentSessionId === MainPaymentID || rotation.LocationCode.value === rotationcode
      );
      const dateS = new Date(rotationstartDate);
      /*const timestampS = {
        seconds: Math.floor(dateS.getTime() / 1000),
        nanoseconds: 0
      };*/
      const timestampS= dateS;

      const dateP = new Date();
      /*const timestampP = {
        seconds: Math.floor(dateP.getTime() / 1000),
        nanoseconds: 0
      };*/
      const timestampP = dateP;

      let PaymentTypeSet="";
      if(FeeType=="Rotation")
      {
        if(TotalInstallements>1)
        {
          PaymentTypeSet="rotation fee installment";
        }
        else
        {
          PaymentTypeSet="rotation full payment";
          await this.firestore
    .collection("Rotations")
    .doc(RotationIdToUpdate)
    .update({
      [bookingPath]: bookingData
    });
        }
      }
      else
      {
        PaymentTypeSet="application fee";
      }
       amt=amt/TotalInstallements;
      //rotation full payment
      // 🔹 Prepare payment details
      
      if(PromotorDiscountFromParam.PromotorDiscountsAmount)
      {
        PromotionDataDiscountText=PromotionDataDiscountText+" ReferalDiscount="+PromotorDiscountFromParam.PromotorDiscountsAmount; 
        if(PromotorDiscountFromParam.PromotorReferralDiscountAmount)
        {
          const MyDiscount=PromotorDiscountFromParam.PromotorReferralDiscountAmount;
          const RdateObj = new Date(timestampP); 
          const Rdd = String(RdateObj.getDate()).padStart(2, '0');
          const Rmm = String(RdateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const Ryyyy = RdateObj.getFullYear();

          const RformattedDate = `${Rdd}-${Rmm}-${Ryyyy}`;
          let  PaymentTypeSetKey = PaymentTypeSet.replace(/\s+/g, '');
          PaymentTypeSetKey = PaymentTypeSetKey+"_"+RformattedDate
          const PromotorObjectToUpdate={ReferralObject:{MyReferrals:{[uid]:{Payments:{[rotationcode]:{[PaymentTypeSetKey]:{PaymentType:PaymentTypeSet,MyDiscount:MyDiscount,AmountPaidByUser:amt/100,rotationcode:rotationcode,PaymentTypeSet:PaymentTypeSet,PaymentDate:timestampP}}}}}}};
          await this.UpdateDocumentByUID(PromotorDiscountFromParam.Promotoruid,"Users",PromotorObjectToUpdate);
        }
      }

      const RotationPayment = [
        {
          Amount: amt/100,
          FeeType: PaymentTypeSet,
          ModeOfPayment: { value: "Stripe", label: "Stripe" },
          PaymentDate: timestampP,
          PaymentActualAddedDate: timestampP,
          CouponCode:PromotionDataDiscountText
        }
      ];

      // 🔹 Push new rotation
      if(indexRotation!== -1)
      {
        DataArray["RotationData"]["Rotations"][indexRotation]['RotationPayment'].push(RotationPayment[0])
      }
      else
      {
        DataArray["RotationData"]["Rotations"].push({
          LocationCode: {
            value: rotationcode,
            label: rotationcode,
            FieldName: "LocationCodes"
          },
          StartDate: timestampS,
          EnrollmentDate: timestampP,
          PaymentSessionId:MainPaymentID,
          DurationOfRotation: RotationData.duration,
          RotationPayment: RotationPayment
        });
      }
      

      // 🔹 Convert array → map (Firestore needs key-value)
      const updatedData = await this.convertRotationsArrayToMap(DataArray.RotationData);

      // 🔹 Update Firestore document
      await this.firestore
        .collection("UserServices")
        .doc(doc.id)
        .update({
          RotationData: updatedData
        });
      }
    }
    else
    {
      const DataArray={RotationData:{Rotations: []}};
      //DataArray["RotationData"] = { Rotations: [] };
      const dateS = new Date(rotationstartDate);
      const timestampS= dateS;
      const dateP = new Date();
      const timestampP = dateP;

      let PaymentTypeSet="";
      
       if(FeeType=="Rotation")
      {
        if(TotalInstallements>1)
        {
          PaymentTypeSet="rotation fee installment";
        }
        else
        {
          PaymentTypeSet="rotation full payment";
        }
      }
      else
      {
        PaymentTypeSet="application fee";
      }
       if(PromotorDiscountFromParam.PromotorDiscountsAmount)
      {
        PromotionDataDiscountText=PromotionDataDiscountText+" ReferalDiscount="+PromotorDiscountFromParam.PromotorDiscountsAmount; 
        if(PromotorDiscountFromParam.PromotorReferralDiscountAmount)
        {
          const MyDiscount=PromotorDiscountFromParam.PromotorReferralDiscountAmount;
          const RdateObj = new Date(timestampP); 
          const Rdd = String(RdateObj.getDate()).padStart(2, '0');
          const Rmm = String(RdateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const Ryyyy = RdateObj.getFullYear();

          const RformattedDate = `${Rdd}-${Rmm}-${Ryyyy}`;
          let  PaymentTypeSetKey = PaymentTypeSet.replace(/\s+/g, '');
          PaymentTypeSetKey = PaymentTypeSetKey+"_"+RformattedDate
          const PromotorObjectToUpdate={ReferralObject:{MyReferrals:{[uid]:{Payments:{[rotationcode]:{[PaymentTypeSetKey]:{PaymentType:PaymentTypeSet,MyDiscount:MyDiscount,AmountPaidByUser:amt/100,rotationcode:rotationcode,PaymentTypeSet:PaymentTypeSet,PaymentDate:timestampP}}}}}}};
          await this.UpdateDocumentByUID(PromotorDiscountFromParam.Promotoruid,"Users",PromotorObjectToUpdate);
        }
      }
      const RotationPayment = [
        {
          Amount: amt/100,
          FeeType: PaymentTypeSet,
          ModeOfPayment: { value: "Stripe", label: "Stripe" },
          PaymentDate: timestampP,
          PaymentActualAddedDate: timestampP,
          CouponCode:PromotionDataDiscountText
        }
      ];
      // 🔹 Push new rotation
      DataArray["RotationData"]["Rotations"].push({
        LocationCode: {
          value: rotationcode,
          label: rotationcode,
          FieldName: "LocationCodes"
        },
        StartDate: timestampS,
        EnrollmentDate: timestampP,
        PaymentSessionId:MainPaymentID,
        DurationOfRotation: RotationData.duration,
        RotationPayment: RotationPayment
      });

      // 🔹 Convert array → map (Firestore needs key-value)
      const updatedData = await this.convertRotationsArrayToMap(DataArray.RotationData);
      await this.firestore
  .collection("UserServices")
  .doc(uid)
  .set(
    { RotationData: updatedData,uid:uid },
    { merge: true }
  );
    }
    await this.firestore
  .collection("StripeSessions")
  .doc(sessionId)
  .delete()
  .then(() => {
    console.log("✅ Document successfully deleted!");
  })
  .catch((error) => {
    console.error("❌ Error deleting document: ", error);
  });
    return this.rotations;
  }
  async SendEmail(MailObject)
  {
    await this.firestore
  .collection("mail")
  .add(MailObject);
  }
  async convertRotationsArrayToMap(rotationData) {
    if (rotationData.Rotations && Array.isArray(rotationData.Rotations)) {
      const rotationsMap = rotationData.Rotations.reduce((acc: any, rotationkk: any, index: number) => {
        const key = `Rotation${index}`;
        const updatedRotation = { ...rotationkk };

        if (Array.isArray(rotationkk.RotationPayment)) {
          updatedRotation.RotationPayment = rotationkk.RotationPayment.reduce((paymentAcc: any, payment: any, paymentIndex: number) => {
            const paymentKey = `Payment${paymentIndex}`;
            paymentAcc[paymentKey] = payment;
            return paymentAcc;
          }, {});
        }

        acc[key] = updatedRotation;
        return acc;
      }, {});

      return {
        ...rotationData,
        Rotations: rotationsMap
      };
    }

    return rotationData;
  };

  async convertRotationsObjectToArray(rotationData) {
    if (
      rotationData &&
      rotationData.RotationData &&
      rotationData.RotationData.Rotations &&
      typeof rotationData.RotationData.Rotations === 'object'
    ) {
      const rotationsArray = Object.entries(rotationData.RotationData.Rotations)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, rotation]: any) => {

          if (rotation.RotationPayment && typeof rotation.RotationPayment === 'object') {
            rotation.RotationPayment = Object.entries(rotation.RotationPayment)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([_, payment]) => payment);

            
          }

          return {
            ...rotation,
            rotationKey: key
          };
        });

      return {
        ...rotationData,
        RotationData: {
          ...rotationData.RotationData,
          Rotations: rotationsArray
        }
      };
    }

    // Return as-is if structure invalid
    return rotationData;
  }

  async getSavedStripeSession(useremail,timestamp) {
    /*const sessiondata = {};
    let docsRef = await this.firestore.collection("StripeSessions", ref => ref.where("customer_email", "==", useremail).where("createdAt", ">=", timestamp)).get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      sessiondata[data.id] = data;
    }
    return sessiondata;*/

    const sessiondata = {};
    let docsRef = await this.firestore.collection("StripeSessions", ref => ref.where("customer_email", "==", useremail).where("createdAt", ">=", timestamp)).get().toPromise();
    for (let doc of docsRef.docs){
      let data = doc.data();
      data.id = doc.id;
      //sessiondata[data.id] = data;
      await doc.ref.delete();
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
   console.log("InqueryId====>",InqueryId)
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
        duration: input.duration,
        inquiryYear: currentYear,
        inquiryID: InqueryId,
        startDate: new Date(Date.UTC(date.year, date.month - 1, date.day)).getTime(),
        timestamp: new Date().getTime(),
        phone : input.phone,
        isNewUser: true
      };
    if (enquiryDoc)
      await this.firestore.doc(`Enquiries/${enquiryDoc}`).set(dataObj, { merge: true });
    else
      await this.firestore.collection("Enquiries").add(dataObj);
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
