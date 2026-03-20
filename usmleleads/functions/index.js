const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const {exec} = require("child_process");
const cors = require("cors")({origin: true});
const ExcelJS = require("exceljs");
const otherProjectCredentials = require("./usmlesarthi-ServiceAccount.json");
admin.initializeApp();
const otherProjectApp = admin.initializeApp(
    {
      credential: admin.credential.cert(otherProjectCredentials),
    }, "otherProject");
const otherProjectFirestore = otherProjectApp.firestore();

exports.getDataFromOtherProject =
functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const {CollectionName}= req.body;
    try {
      const snapshot =
      await otherProjectFirestore.collection(CollectionName).get();
      const data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      res.status(200).send({"status": "success", "data": data});
    } catch (error) {
      console.error("Error accessing other project's Firestore:", error);
      res.status(500).send({"status": "success", "data": []});
    }
  });
});
exports.addUserToAuth = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {StudentEmail, password, StudentName}= req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email: StudentEmail, password, displayName: StudentName});
      res.status(201).send({"status": "success", "data": userRecord});
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        try {
          // Fetch the existing user's details using the email
          const existingUser = await admin.auth().getUserByEmail(StudentEmail);
          res.status(400).send({"status": "error",
            "data": error.message, "user": existingUser});
        } catch (fetchError) {
          // Handle error if there is an issue fetching the existing user
          res.status(400).send({"status": "error", "data": fetchError.message});
        }
      }
      res.status(400).send({"status": "error", "data": error.message});
    }
  });
});
exports.infoEnquiryMails = functions.firestore.document('Enquiries/{enquiryId}').onCreate( async(snapshot, context)=>{
    console.log("Sending Enquiry Info");
    try{
        const newValue = snapshot.data();
        const querycode = context.params.enquiryId.substring(0, 5);
        if (newValue.status==='Pending'){
            let result = [];
            let userDoc= {};
            let rotationDoc= {};
            if (!newValue.isNewUser){
                result = await Promise.all([admin.firestore().doc(`Users/${newValue.uid}`).get(),admin.firestore().doc(`Rotations/${newValue.rotationId}`).get()]);
                userDoc = result[0].data ();
                rotationDoc = result[1].data ();
            }
            else{
                result = await Promise.all([admin.firestore().doc(`Rotations/${newValue.rotationId}`).get()]);
                rotationDoc = result[0].data ();
            }

            const utcDate = new Date(newValue.startDate);
            const startDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()).toDateString();

            const username  = newValue.isNewUser ? newValue.displayName : userDoc && userDoc.displayName;
            const useremail = newValue.isNewUser ? newValue.email : userDoc && userDoc.email;
            let replyfromteam="";
            if(newValue.replyquery)
            {
                replyfromteam=`<tr>
                                            <td><label for="time">Additional Comments :-</label></td>
                                            <td>${newValue.newValue.replyquery}</td>
                                        </tr>`;
            }

            admin.firestore().collection('mail').add({
                to: useremail,
                cc: [],
                message: {
                subject: `USMLESarthi Clinical Rotations- Your inquiry #${newValue.inquiryYear}${newValue.inquiryID}`,
                html: `
                <html>
                    <head>

                    </head>

                    <body>
                        <div class="container-fluid">
                            <div class="row" style="border:1px solid black; padding:10px;">

                                <div class="form-group" style="font-weight:700">

                                    <label for="username">Hello ${username}
                                    <br><br>
                                    <label for="hospital">Thank you for your inquiry about the clinical rotations with USMLEsarthi for the following location</label>
                                    <label> Your inquiry details </label>
                                </div>

                                <div class="form-group" style="font-weight:700">

                                    <table class="table table-bordered" style="width:100%">

                                        <tr>
                                            <td><label for="Hospitalname">Location :-</label></td>
                                            <td>${rotationDoc.title} ${rotationDoc.city} ${rotationDoc.state}</td>
                                        </tr>
                                        <tr>
                                            <td><label for="Hospitalname">Location Code :-</label></td>
                                            <td>${rotationDoc.location_code}</td>
                                        </tr>
                                        <tr>
                                            <td><label for="City">Specialty :-</label></td>
                                            <td>${rotationDoc.specialty}</td>
                                        </tr>
                                        <tr>
                                            <td><label for="City">Duration :-</label></td>
                                            <td>${newValue.duration}</td>
                                        </tr>
                                        <tr>
                                            <td><label for="City">Start Date :-</label></td>
                                            <td>${startDate}</td>
                                        </tr>
                                        <tr>
                                            <td><label for="time">Additional Comments :-</label></td>
                                            <td>${newValue.query}</td>
                                        </tr>
                                        ${replyfromteam}

                                    </table>

                                </div>
                                <br>
                                <div class="form-group" style="font-weight:700">
                                    <label> We are now working with the physician team to confirm availability and will let you know in 2 business days or sooner. </label>
                                    <br>
                                    <label> Meanwhile, we have several useful blogs, videos and courses which can help you prepare for the USMLE journey</label>
                                    <br><br>
                                    <label>If you have any questions about this rotation, please feel free to contact us at Email: <a href="mailto:enroll@usmlesarthi.com">enroll@usmlesarthi.com</a></label>
                                    <br>
                                    <label>📱 WhatsApp Chat with us on <a href="https://wa.me/919625862824" target="_blank"><b>+91 962 586 2824</b></a> (10 AM TO 12 AM IST)</label>
                                    <br>
                                    <label>📞 Call us on <a href="tel:+16023997795"><b>+1 602 399 7795 (US)</b></a> (12 PM TO 12 AM IST)</label>
                                    <br>
                                    <label>Please login <a href="https://student.usmlesarthi.com/login" target="_blank"><b>Here</b></a> with mail ID that you have used to enquire about rotation  and check your enquiry status under Enquiries section.</label>
                                    <br>
                                    <label for="thanks">USMLEsarthi Clinical Rotation Team</label>

                                </div>
                            </div>
                        </div>
                    </body>
                </html>
                `
                }
            });
        }
        else {
            console.log("Enquiry was not ready to be sent");
        }
    }
    catch(err){
        console.log("Error while making enquiry mail", err);
    }
    return;
})
exports.addLeadFromOtherSource = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
  	res.set("Access-Control-Allow-Origin", "*"); // Replace * with your specific domain
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const {StudentEmail, password, StudentName, phonecountrycode, phone, nameofmedicalcollege, countryofmedicalcollege} = req.body;
    const DataToBeSaved={};
    const leadsRef = admin.firestore().collection("Usmle").doc("LeadTracker").collection("leads");
    const latestLeadQuery = await leadsRef
        .orderBy("uniqueid", "desc")
        .limit(1)
        .get();
    const existsLeadQuery = await leadsRef.where('email', StudentEmail).limit(1).get()
    let LastLeadId = 1;
    if (!existsLeadQuery.empty)
    {
    if (!latestLeadQuery.empty) {
      const latestDoc = latestLeadQuery.docs[0];
      const lastUniqueId = Number(latestDoc.data().uniqueid || 0);
      LastLeadId = lastUniqueId + 1;
    }
    const utcMinus5Time = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const firestoreTimestamp = admin.firestore.Timestamp.fromDate(utcMinus5Time);
    DataToBeSaved["email"]=StudentEmail;
    DataToBeSaved["firstname"]=StudentName;
    if(nameofmedicalcollege)
    {
    	DataToBeSaved["nameofmedicalcollege"]=nameofmedicalcollege;
    }
    if(countryofmedicalcollege)
    {
    	DataToBeSaved["countryofmedicalcollege"]=countryofmedicalcollege;
    }
    DataToBeSaved["lastname"]="";
    DataToBeSaved["password"]=password;
    DataToBeSaved["leadnotes"]="";
    DataToBeSaved["leadstatus"]="";
    DataToBeSaved["contactsource"]="rotation enquiry residency website";
    DataToBeSaved["phonecountrycode"]=phonecountrycode;
    DataToBeSaved["phone"]=phone;
    DataToBeSaved["uniqueid"]=LastLeadId;
    DataToBeSaved["updateTime"]=firestoreTimestamp;
    DataToBeSaved["createTime"]=firestoreTimestamp;
    const docRef = await leadsRef.add(DataToBeSaved);

    const returnData= {
      docId: docRef.id,
      uniqueid: LastLeadId,
      message: "Lead created successfully",
    };
    try {
      res.status(201).send({"status": "success", "data": returnData});
    } catch (error) {
      console.error("Error Adding Leads:", error);
      res.status(500).
          send({status: "error", message: "Failed to Add Lead"});
    }
}
else
{
	send({status: "error", message: "Lead Already Exists"});
}
  });
});
exports.exportFirestoreToExcel = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
  	res.set("Access-Control-Allow-Origin", "*"); // Replace * with your specific domain
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    const {CollectionName} = req.body;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(CollectionName);
      const leadsSnapshot = await admin.firestore()
          .collection("/Usmle/LeadTracker/leads")
          .get();
      const AllData = [];
      for (const leadDoc of leadsSnapshot.docs) {
        const leadData = leadDoc.data();
        const commaSeparatedValuesInt =
                leadData?.interestedin?.
                    map((item) => item.value).join(", ");

        const ExportData={
          "LastName": leadData.lastname || "",
          "FirstName": leadData.firstname || "",
          "Email": leadData.email || "",
          "CountryCode": leadData.phonecountrycode?
          leadData.phonecountrycode.phoneCode:"",
          "PhoneNumber": leadData.phone || "",
          "SarthiStudent": leadData.sarthistudent || "",
          "InqueryDate": leadData?.inquerydate ? new Date(leadData?.inquerydate?.seconds * 1000) : "",
          "LeadCreater": leadData.leadcreatedby?
          leadData.leadcreatedby.name:"",
          "LeadOwner": leadData.leadowner ? leadData?.leadowner?.name : "",
          "YearOfGraduation": new Date(leadData?.yog?.seconds * 1000).
              getFullYear() || "",
          "Step1Result":
            leadData.step1result === "score"?
                    `${leadData.step1result}(${leadData.step1score})`:
                    `${leadData.step1result || ""}`,
          "Step2Result":
            leadData.step2ckresult === "score"?
                    `${leadData.step2ckresult}(${leadData.step2ckscore})`:
                    `${leadData.step2ckresult || ""}`,
          "Step3Result":
            leadData.step3ckresult === "score"?
                `${leadData.step3ckresult}(${leadData.step3ckscore})`:
                `${leadData.step3ckresult || ""}`,
          "MatchApplicationSeason": leadData.matchapplicationsession ? `Match Season ` + leadData.matchapplicationsession + ` (Sept ` + (leadData.matchapplicationsession - 1) + `)` : "",
          "NameOfMedicalCollege": `${leadData.nameofmedicalcollege?
                    leadData.nameofmedicalcollege.value==="Other"?
                    leadData.nameofmedicalschoolother || "":
                    leadData.nameofmedicalcollege.value: ""} `,
          "VisaStatus": leadData.visastatus,
          "LeadNotes": leadData.leadnotes,
          "DateOfEntry": new Date(leadData.createTime.seconds * 1000) || "",
          "InterestedInService": commaSeparatedValuesInt,
          "rotationInterestedServiceType": "",
          "RotationPushed": "",
          "rotationServiceOwner": "",
          "rotationContactSource": "",
          "rotationCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "rotationDateOfEvent/Webinar/Workshop": "",
          "rotationBudgetOfService": "",
          rotationExpectedMonthAndYearOfEnrollement: "",
          rotationServiceStatus: "",
          rotationPlannedStartDate: "",
          rotationServiceNotes: "",
          rotationFollowUpDate1: "",
          rotationFollowUpMode1: "",
          rotationFollowUpPlanPushed1: "",
          rotationFollowUpStudentResponse1: "",
          rotationFollowUpNotes1: "",
          rotationFollowUpDate2: "",
          rotationFollowUpMode2: "",
          rotationFollowUpPlanPushed2: "",
          rotationFollowUpStudentResponse2: "",
          rotationFollowUpNotes2: "",
          rotationFollowUpDate3: "",
          rotationFollowUpMode3: "",
          rotationFollowUpPlanPushed3: "",
          rotationFollowUpStudentResponse3: "",
          rotationFollowUpNotes3: "",
          rotationFollowUpDate4: "",
          rotationFollowUpMode4: "",
          rotationFollowUpPlanPushed4: "",
          rotationFollowUpStudentResponse4: "",
          rotationFollowUpNotes4: "",
          rotationFollowUpDate5: "",
          rotationFollowUpMode5: "",
          rotationFollowUpPlanPushed5: "",
          rotationFollowUpStudentResponse5: "",
          rotationFollowUpNotes5: "",
          matchInterestedServiceType: "",
          matchPlanPushed: "",
          matchServiceOwner: "",
          matchContactSource: "",
          "matchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "matchDateOfEvent/Webinar/Workshop": "",
          matchBudgetOfService: "",
          matchExpectedMonthAndYearOfEnrollement: "",
          matchServiceStatus: "",
          matchPlannedStartDate: "",
          matchServiceNotes: "",
          matchFollowUpDate1: "",
          matchFollowUpMode1: "",
          matchFollowUpPlanPushed1: "",
          matchFollowUpStudentResponse1: "",
          matchFollowUpNotes1: "",
          matchFollowUpDate2: "",
          matchFollowUpMode2: "",
          matchFollowUpPlanPushed2: "",
          matchFollowUpStudentResponse2: "",
          matchFollowUpNotes2: "",
          matchFollowUpDate3: "",
          matchFollowUpMode3: "",
          matchFollowUpPlanPushed3: "",
          matchFollowUpStudentResponse3: "",
          matchFollowUpNotes3: "",
          matchFollowUpDate4: "",
          matchFollowUpMode4: "",
          matchFollowUpPlanPushed4: "",
          matchFollowUpStudentResponse4: "",
          matchFollowUpNotes4: "",
          matchFollowUpDate5: "",
          matchFollowUpMode5: "",
          matchFollowUpPlanPushed5: "",
          matchFollowUpStudentResponse5: "",
          matchFollowUpNotes5: "",
          researchInterestedServiceType: "",
          researchPlanPushed: "",
          researchServiceOwner: "",
          researchContactSource: "",
          "researchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/": "",
          "researchDateOfEvent/Webinar/Workshop": "",
          researchBudgetOfService: "",
          researchExpectedMonthAndYearOfEnrollement: "",
          researchServiceStatus: "",
          researchPlannedStartDate: "",
          researchServiceNotes: "",
          researchFollowUpDate1: "",
          researchFollowUpMode1: "",
          researchFollowUpPlanPushed1: "",
          researchFollowUpStudentResponse1: "",
          researchFollowUpNotes1: "",
          researchFollowUpDate2: "",
          researchFollowUpMode2: "",
          researchFollowUpPlanPushed2: "",
          researchFollowUpStudentResponse2: "",
          researchFollowUpNotes2: "",
          researchFollowUpDate3: "",
          researchFollowUpMode3: "",
          researchFollowUpPlanPushed3: "",
          researchFollowUpStudentResponse3: "",
          researchFollowUpNotes3: "",
          researchFollowUpDate4: "",
          researchFollowUpMode4: "",
          researchFollowUpPlanPushed4: "",
          researchFollowUpStudentResponse4: "",
          researchFollowUpNotes4: "",
          researchFollowUpDate5: "",
          researchFollowUpMode5: "",
          researchFollowUpPlanPushed5: "",
          researchFollowUpStudentResponse5: "",
          researchFollowUpNotes5: "",
        };
        const servicesSnapshot = await admin.firestore()
            .collection("/Usmle/LeadTracker/services")
            .where("leadid", "==", leadDoc.id)
            .get();
        for (const serviceDoc of servicesSnapshot.docs) {
        	const serviceData = serviceDoc.data();
        	const PlanedStartdate = serviceData?.plannedstartdate?.seconds? new Date(serviceData.plannedstartdate.seconds * 1000): null;
        	const NextFollowupDate = serviceData?.nextfollowupdate?.seconds? new Date(serviceData.nextfollowupdate.seconds * 1000): null;
          if (serviceData.servicetype==="rotation")
          {
            const commaSeparatedValues = serviceData?.rotationplanpushed?.map((item) => item.value).join(", ");
            ExportData["InterestedServiceType"]=serviceData.servicetype;
            ExportData["rotationInterestedServiceType"]=serviceData.servicetype;
            ExportData["RotationPushed"]=commaSeparatedValues;
            ExportData["rotationServiceOwner"]=serviceData?.serviceowner?.name;
            ExportData["rotationContactSource"]=serviceData?.contactsource;
            let ContactSourceDynamic="";
            if (serviceData?.budgetofservice)
            {
              ExportData["rotationBudgetOfService"]=serviceData?.budgetofservice?.[0]+"-"+serviceData?.budgetofservice?.[1];
            }
            if (serviceData?.exptdmnyenroll)
            {
              ExportData["rotationExpectedMonthAndYearOfEnrollement"]=serviceData?.exptdmnyenroll ? new Date(serviceData.exptdmnyenroll.seconds * 1000): "";
            }
            if (serviceData?.contactsource==="calendly booking")
            {
              ContactSourceDynamic=serviceData?.contactsourcesstatusofmeeting;
            }
            else if (serviceData?.contactsource==="event")
            {
        	  ContactSourceDynamic=serviceData?.contactsourceseventname;
              ExportData["rotationDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourceseventdate ? new Date(serviceData.contactsourceseventdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="via team member")
            {
              ContactSourceDynamic=serviceData?.contactsourceviateammembername?.label;
            }
            else if (serviceData?.contactsource==="webinar/workshop")
            {
              ContactSourceDynamic=serviceData?.contactsourcespecialtywebinarworkshopname;
              ExportData["rotationDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourcespecialtywebinarworkshopdate ? new Date(serviceData.contactsourcespecialtywebinarworkshopdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="rotation enquiry residency website")
            {
              if (serviceData?.contactsourcespecialty==="other")
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialtyother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialty;
              }
            }
            else if (serviceData?.contactsource==="marketing")
            {
              if (serviceData?.marketingchannels==="other")
              {
                ContactSourceDynamic=serviceData?.marketingchannelsother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.marketingchannels;
              }
            }
            else if (serviceData?.contactsource==="other")
            {
              ContactSourceDynamic=serviceData?.contactsourceother;
            }
            ExportData["rotationCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/"]=ContactSourceDynamic;
            ExportData["rotationServiceStatus"]=serviceData?.servicestatus;
            ExportData["rotationPlannedStartDate"]=PlanedStartdate;
            ExportData["rotationServiceNotes"]=serviceData?.servicenotes;
          }
          else if (serviceData.servicetype==="match")
          {
            ExportData["matchInterestedServiceType"]=serviceData?.servicetype;
            ExportData["matchPlanPushed"]=serviceData?.matchplanpushed;
            ExportData["matchServiceOwner"]=serviceData?.serviceowner?.name;
            ExportData["matchContactSource"]=serviceData?.contactsource;
            let ContactSourceDynamic="";
            if (serviceData?.budgetofservice)
            {
              ExportData["matchBudgetOfService"]=serviceData?.budgetofservice?.[0]+"-"+serviceData?.budgetofservice?.[1];
            }
            if (serviceData?.exptdmnyenroll)
            {
              ExportData["matchExpectedMonthAndYearOfEnrollement"]=serviceData?.exptdmnyenroll ? new Date(serviceData.exptdmnyenroll.seconds * 1000): "";
            }
            if (serviceData?.contactsource==="calendly booking")
            {
              ContactSourceDynamic=serviceData?.contactsourcesstatusofmeeting;
            }
            else if (serviceData?.contactsource==="event")
            {
              ContactSourceDynamic=serviceData?.contactsourceseventname;
              ExportData["matchDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourceseventdate ? new Date(serviceData.contactsourceseventdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="via team member")
            {
              ContactSourceDynamic=serviceData?.contactsourceviateammembername?.label;
            }
            else if (serviceData?.contactsource==="webinar/workshop")
            {
              ContactSourceDynamic=serviceData?.contactsourcespecialtywebinarworkshopname;
              ExportData["matchDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourcespecialtywebinarworkshopdate ? new Date(serviceData.contactsourcespecialtywebinarworkshopdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="rotation enquiry residency website")
            {
              if (serviceData?.contactsourcespecialty==="other")
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialtyother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialty;
              }
        	}
            else if (serviceData?.contactsource==="marketing")
            {
              if (serviceData?.marketingchannels==="other")
              {
                ContactSourceDynamic=serviceData?.marketingchannelsother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.marketingchannels;
              }
            }
            else if (serviceData?.contactsource==="other")
            {
              ContactSourceDynamic=serviceData?.contactsourceother;
            }
            ExportData["matchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/"]=ContactSourceDynamic;
            ExportData["matchServiceStatus"]=serviceData?.servicestatus;
            ExportData["matchPlannedStartDate"]=PlanedStartdate;
            ExportData["matchServiceNotes"]=serviceData?.servicenotes;
          }
          else if (serviceData.servicetype==="research")
          {
        	const commaSeparatedValues = serviceData?.researchplanpushed?.map((item) => item.value).join(", ");
            ExportData["researchInterestedServiceType"]=serviceData?.servicetype;
            ExportData["researchPlanPushed"]=commaSeparatedValues;
            ExportData["researchServiceOwner"]=serviceData?.serviceowner?.name;
            ExportData["researchContactSource"]=serviceData?.contactsource;
            let ContactSourceDynamic="";
            if (serviceData?.budgetofservice)
            {
              ExportData["researchBudgetOfService"]=serviceData?.budgetofservice?.[0]+"-"+serviceData?.budgetofservice?.[1];
            }
            if (serviceData?.exptdmnyenroll)
            {
              ExportData["researchExpectedMonthAndYearOfEnrollement"]=serviceData?.exptdmnyenroll ? new Date(serviceData.exptdmnyenroll.seconds * 1000): "";
            }
            if (serviceData?.contactsource==="calendly booking")
            {
              ContactSourceDynamic=serviceData?.contactsourcesstatusofmeeting;
            }
            else if (serviceData?.contactsource==="event")
            {
              ContactSourceDynamic=serviceData?.contactsourceseventname;
              ExportData["researchDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourceseventdate ? new Date(serviceData.contactsourceseventdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="via team member")
            {
              ContactSourceDynamic=serviceData?.contactsourceviateammembername?.label;
            }
            else if (serviceData?.contactsource==="webinar/workshop")
            {
              ContactSourceDynamic=serviceData?.contactsourcespecialtywebinarworkshopname;
              ExportData["researchDateOfEvent/Webinar/Workshop"]= serviceData?.contactsourcespecialtywebinarworkshopdate ? new Date(serviceData.contactsourcespecialtywebinarworkshopdate.seconds * 1000): "";
            }
            else if (serviceData?.contactsource==="rotation enquiry residency website")
            {
              if (serviceData?.contactsourcespecialty==="other")
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialtyother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.contactsourcespecialty;
              }
            }
            else if (serviceData?.contactsource==="marketing")
            {
              if (serviceData?.marketingchannels==="other")
              {
                ContactSourceDynamic=serviceData?.marketingchannelsother;
              }
              else
              {
                ContactSourceDynamic=serviceData?.marketingchannels;
              }
        	}
            else if (serviceData?.contactsource==="other")
            {
              ContactSourceDynamic=serviceData?.contactsourceother;
            }
            ExportData["researchCalendlyStatusofMeeting/EventName/NameOfTeamMember/WebinarOrWorkshopName/Specialty/MarketingChannel/"]=ContactSourceDynamic;
            ExportData["researchServiceStatus"]=serviceData?.servicestatus;
            ExportData["researchPlannedStartDate"]=PlanedStartdate;
            ExportData["researchServiceNotes"]=serviceData?.servicenotes;
          }
          ExportData["FollowupsRequired"]= serviceData?.followupsrequired;
          ExportData["NextFollowupDate"]=NextFollowupDate;
          const followupsSnapshot = await admin.firestore()
              .collection("/Usmle/LeadTracker/followups")
              .where("leadid", "==", leadDoc.id)
              .where("serviceid", "==", serviceDoc.id)
              .orderBy("followupdate", "desc")
              .limit(5)
              .get();
          let loopVar=1;
          followupsSnapshot.docs.forEach((followupDoc) => {
            const followupDATA=followupDoc.data();
            let commaSeparatedValuesF="";
            if (serviceData.servicetype=="rotation")
            {
            	commaSeparatedValuesF = followupDATA?.followupplanpushed?.map((item) => item.value).join(", ");
            }
            else
            {
            	commaSeparatedValuesF = followupDATA?.followupplanpushed;
            }
            const Followupdate = followupDATA?.followupdate?.seconds? new Date(followupDATA.followupdate.seconds * 1000): null;
            ExportData[serviceData.servicetype+"FollowUpDate"+loopVar]=Followupdate;
            ExportData[serviceData.servicetype+"FollowUpMode"+loopVar]=followupDATA?.mode;
            ExportData[serviceData.servicetype+"FollowUpPlanPushed"+loopVar]=commaSeparatedValuesF;
            ExportData[serviceData.servicetype+"FollowUpStudentResponse"+loopVar]=followupDATA?.studentsresponse;
            ExportData[serviceData.servicetype+"FollowUpNotes"+loopVar]=followupDATA.note;
            loopVar++;
          });
        }
        AllData.push(ExportData);
      }
      const headers = Object.keys(AllData[0] || {});
      worksheet.columns = headers.map((header) => ({header, key: header}));
      AllData.forEach((row) => worksheet.addRow(row));
      worksheet.columns.forEach((column) => {
        let maxLength = column.header.length; // Start with the header length
        column.eachCell({includeEmpty: true}, (cell) => {
          if (cell.value) {
            const cellLength = cell.value.toString().length;
            maxLength = Math.max(maxLength, cellLength);
          }
        });
        column.width = maxLength + 2; // Add padding for readability
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {argb: "FFFF00"}, // Yellow background
        };
        cell.font = {bold: true};
      });
      res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
          "Content-Disposition",
          `attachment; filename=${CollectionName}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error("Error exporting Firestore to Excel:", error);
      res.status(500).
          send({status: "error", message: "Failed to export data"});
    }
  });
});

/* exports.scheduledFirestoreBackup = functions.pubsub
    .schedule("every 24 hours")
    .onRun((context) => {
      // const projectId = "usmleleadtracker";
      const bucketName = "leadtrackerbackup"; // Replace with your Cloud Storage bucket
      const command = `gcloud firestore export gs://${bucketName}/backup-${Date.now()}`;
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error("Backup failed:", stderr);
        } else {
          console.log("Firestore backup successful:", stdout);
        }
      });
      return null;
    });*/
