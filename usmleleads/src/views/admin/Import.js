import React, { useState, useRef,useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CToaster,
  CForm,
  CFormFeedback,
  CFormInput,
} from "@coreui/react";
import { useLoading } from "../../layout/LoadingContext";
import { countryData } from "../../apis/countryData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
let LastLeadId=1;
let RotationOptions=[]

  const interestedin = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'research', label: 'Research' },
    { value: 'match', label: 'Match' },
    { value: 'steps preparation', label: 'STEPs preparation' },
    { value: 'usmle guidance', label: 'USMLE guidance' },
    { value: 'interview preparations', label: 'Interview Preparations' },
    { value: 'b2r', label: 'B2R' },
    { value: 'limited licensing', label: 'Limited Licensing' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'other', label: 'Other' },
  ];
let AdminOptionsList=[];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
const countryOfMedicalCollege = countryData.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag,
    phoneCode: country.phoneCode,
    "FieldName":"CountryOfMedicalSchool",
  }));
let ActualLoggedInUser;
const ServiceTypesAllowed = ["rotation", "match", "research"];
const AllowedResults=["pass","fail","not taken"];
const requiredColumns = [
  "First Name",
  "Last Name",
  "Phone Without Country Code",
  "Email Address",
  "Service",
  "Webinar Name",
  "Webinar Date",
  "YOG",
  "Step 1",
  "Step 2",
  "Step 3",
  "Specialty",
  "Name of Medical School",
  "Which Match Season are you planning for?",
  "Country of Medical School",
];
const serviceNamesAllowed = ['match','rotation','research'];
let messageFull="";
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const convertExcelDate = (excelDate) => {
  const excelBaseDate = new Date(1899, 11, 30);
  return new Date(excelBaseDate.getTime() + (excelDate) * 86400000);
};
/*const convertExcelDateString = (excelDateString) => {
  // Parse the Excel date string
  console.log("DateFormat===>",typeof excelDateString)
   console.log("DateFormat===>", excelDateString)
  const excelBaseDate = new Date(1899, 11, 30);
  if(typeof excelDateString==="string")
  {
    const [month, day, year] = excelDateString.split("/").map(Number);
    console.log("month====>",month)
    console.log("day====>",day)
    console.log("year====>",year)
    const inputDate = new Date(year, month - 1, day+1); // Months are 0-indexed in JS

    // Calculate the difference in days from the Excel base date
    const diffInMs = inputDate.getTime() - excelBaseDate.getTime(); // Difference in milliseconds
    const excelSerialDate = Math.floor(diffInMs / 86400000); // Convert to days

    // Return the same result as the given logic
    return new Date(excelBaseDate.getTime() + excelSerialDate * 86400000);
  }
  else if(typeof excelDateString==="number")
  {
    return new Date(excelBaseDate.getTime() + (excelDateString) * 86400000);
  }
  else
  {
    throw new Error("Input must be either a string (MM/DD/YYYY) or a number.");
  }

};*/
const convertExcelDateString = (excelDateString) => {
  console.log("Input Type:", typeof excelDateString);
  console.log("Input Value:", excelDateString);

  const excelBaseDate = new Date(Date.UTC(1899, 11, 30)); // Excel's base date

  if (typeof excelDateString === "string") {
    const [month,day, year] = excelDateString.split("/").map(Number);
    console.log("Month:", month, "Day:", day, "Year:", year);

    // Convert MM/DD/YYYY to Date (UTC)
    return new Date(Date.UTC(year, month - 1, day));
  }

  else if (typeof excelDateString === "number") {
    return new Date(Date.UTC(1899, 11, 30) + excelDateString * 86400000);
  }

  else {
    throw new Error("Input must be either a string (MM/DD/YYYY) or a number.");
  }
};
const downloadExcelTemplate = () => {
  // Define the data structure for the template
  const templateData = [
    ["Contact Source","Service", "Webinar Name", "Webinar Date", "First Name", "Last Name", "Email Address","Country Code", "Phone Without Country Code","Is Sarthi Student?","Date of Enquiry","Interested In","Lead Owner", "Which Match Season are you planning for?", "YOG", "Step 1", "Step 2", "Step 3", "Specialty", "Name of Medical School", "Country of Medical School","Lead Notes","Lead Status","Planned Start Date","Rotation Pushed","Followup Rotation Pushed","Next Follow-up Date", "Question1", "Answer1", "Question2", "Answer2", "Question3", "Answer3", "Question4", "Answer4"], // Headers
    ["webinar/workshop","Match", "Financial planning for 2026 Match", "05/25/2024", "WImport1", "Test1", "wit1@gmail.com","+91", "9090909090","yes","05/25/2024","rotation","shitanshu@usmlesarthi.com","Match Season 2026 (Sept 2025)", "2024", "Pass", "Not Taken", "Not Taken", "Internal Medicine", "Navodaya Medical College (Raichur, India)", "India","This is Lead Note","enrolled","05/25/2024","L1IMMIT","L1IMMIT","05/25/2024", "Question1", "Answer1", "What are you here for", "i am here for rotation", "Question3", "Answer3", "Question4", "Answer4"], // Sample Row
  ];

  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Apply styling to the header row
  const headerCellStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "FFFF00" }, // Yellow background
    },
    font: {
      bold: true, // Make text bold for emphasis
    },
  };

  // Get all header cells (row 1)
  Object.keys(worksheet)
    .filter((cell) => cell[0] !== "!" && cell.replace(/[^\d]/g, "") === "1") // Ignore metadata keys and filter row 1
    .forEach((cell) => {
      if (!worksheet[cell].s) worksheet[cell].s = {}; // Initialize style if not set
      worksheet[cell].s = { ...headerCellStyle }; // Apply header style
    });

  // Auto-adjust column widths
  const columnWidths = templateData[0].map((_, i) => ({
    wch: Math.max(
      ...templateData.map((row) => (row[i] ? row[i].toString().length : 0))
    ) + 2, // Add padding
  }));
  worksheet["!cols"] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // Generate Excel file and trigger download
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true, // Ensure styles are written
  });

  // Use FileSaver to save the file
  const fileName = "Template.xlsx";
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    fileName
  );
};

const containsAnySubstring = (string, substrings) => {
  return substrings.some(substring => string.includes(substring));
};
const findCountryByName = async (countryNameToSearch) => {
  const foundCountry = await Promise.resolve(
    countryOfMedicalCollege.find(
      country => country.label.toLowerCase() === countryNameToSearch.toLowerCase()
    )
  );

  return foundCountry || null;
};
const extractYearOrLowercase = (input) => {
  if (/^Match Season \d{4} \(Sept \d{4}\)$/.test(input)) {
    // Extract the year if the input matches "Match XXXX (Sept XXXX)"
    
    const match = input.match(/Match Season (\d{4})/);
    console.log("match----->",match)
    return match ? Number(match[1]) : null;
  } else {
    // Return the input in lowercase for non-matching cases like "Undecided/Later"
    return input.toLowerCase();
  }
};
const convertToFirestoreTimestamp = (row,firestoreQueries) => {
  const dateString = `01/01/${row?.['YOG']}`; // Construct the date string
  const dateObject = new Date(dateString); // Convert to a Date object

  // Check if the date is valid
  if (isNaN(dateObject.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return firestoreQueries.Timestamp.fromDate(dateObject); // Convert to Firestore Timestamp
};
const processRow = async (row, firestoreQueries, DatabaseName,hideLoading,TooltipsPopovers) => {

try
{
  console.log("row--->",row)
  if(row["Service"]==="" || typeof row["Service"]==="undefined")
  {
     //return null;
     hideLoading();
    TooltipsPopovers("error", "Email="+row?.["Email Address"]+" Service Not Found", "Status");
    throw error;
  }
  let countryofmedicalcollege=row?.["Country of Medical School"]?row?.["Country of Medical School"]:'';
  let CountryOfMedicalColl=await findCountryByName(countryofmedicalcollege);
  const leadData = {
    firstname: row?.["First Name"],
    lastname: row?.["Last Name"],
    phone: row?.["Phone Without Country Code"],
    email: row?.["Email Address"],
    leadnotes: row["Lead Notes"],
    nameofmedicalcollege:{label: 'Others', value: 'Others'},
    nameofmedicalschoolother:row?.["Name of Medical School"],
    matchapplicationsession:extractYearOrLowercase(row?.["Which Match Season are you planning for?"]),
    countryofmedicalcollege:CountryOfMedicalColl,
    contactsource: row["Contact Source"].toLowerCase(),
    contactsourcespecialtywebinarworkshopname: row["Webinar Name"],
    createTime: firestoreQueries.Timestamp.fromDate(new Date()),
    updateTime: firestoreQueries.Timestamp.fromDate(new Date()),
    createdby:ActualLoggedInUser,
    lastupdatedby:ActualLoggedInUser,
  };
console.log("leadData==========>",leadData)
    if(row?.["Country Code"])
    {
      const resultC = allCountries.find(country => country.phoneCode === row?.["Country Code"]);
      if(typeof resultC!="undefined")
      {
        leadData.phonecountrycode=resultC;
      }

    }
    if(row['Contact Source'].trim()!=="")
    {
      row['Contact Source'] = row['Contact Source'].toLowerCase();
      if(row?.['Specialty'])
      {
        leadData.contactsourcespecialty=row?.['Specialty']?.toLowerCase();
      }

      row['Contact Source'] = row['Contact Source'].toLowerCase();

    }
    if(row["Contact Source"].toLowerCase()==="event")
    {
      leadData.contactsourceseventname=row["Webinar Name"];
      if (row["Webinar Date"] && String(row["Webinar Date"]).trim() !== "")
      {
        leadData.contactsourceseventdate=firestoreQueries.Timestamp.fromDate(
        convertExcelDateString(row["Webinar Date"]));
      }
    }
    if (row["Webinar Date"] && String(row["Webinar Date"]).trim() !== "")
    {
      leadData.contactsourcespecialtywebinarworkshopdate=firestoreQueries.Timestamp.fromDate(
      convertExcelDateString(row["Webinar Date"]));
    }
    if (row?.["Next Follow-up Date"] && String(row?.["Next Follow-up Date"]).trim() !== "")
    {
      leadData.nextfollowupdate=firestoreQueries.Timestamp.fromDate(convertExcelDateString(row["Next Follow-up Date"]));
      leadData.followupsrequired="yes";
    }
    if(row["Lead Status"].trim()!="")
    {
       row["Lead Status"]=row["Lead Status"].toLowerCase();
       leadData.leadstatus=row["Lead Status"];
    }
    
    if(row?.["YOG"])
    {
      leadData.yog=convertToFirestoreTimestamp(row,firestoreQueries);
    }
    if(row?.["YOG"])
    {
      leadData.yog=convertToFirestoreTimestamp(row,firestoreQueries);
    }
    if(leadData?.email)
    {
      leadData.email=leadData?.email.toLowerCase();
    }
    if (row["Date of Enquiry"] && String(row["Date of Enquiry"]).trim() !== "")
    {
       row["Date of Enquiry"]=firestoreQueries.Timestamp.fromDate(convertExcelDateString(row["Date of Enquiry"]));;
       leadData.inquerydate=row["Date of Enquiry"];
    }
    if(row?.["Is Sarthi Student?"]?.trim()!="" && typeof row["Is Sarthi Student?"]!=="undefined")
    {
       row["Is Sarthi Student?"]=row["Is Sarthi Student?"].toLowerCase();
       leadData.sarthistudent=row["Is Sarthi Student?"];
    }
    if(row?.["Lead Owner"].trim()!="" && typeof row["Lead Owner"]!=="undefined")
    {
       const result = AdminOptionsList.find(item => item.label === row["Lead Owner"]);
       if(typeof result!="undefined")
       {
          leadData.leadowner=result;
       }
    }RotationOptions
    if(row["Interested In"].trim()!="" && typeof row["Interested In"]!=="undefined")
    {
      row["Interested In"] = row["Interested In"].toLowerCase();
      const selectedValues = row["Interested In"].split(',');
      const mapped = interestedin.filter(item => selectedValues.includes(item.value));
       if(mapped.length)
       {
          leadData.interestedin=mapped;
       }
    }

    let step1result=row?.['Step 1'];
    let step2ckresult=row?.['Step 2'];
    let step3ckresult=row?.['Step 3'];

    if(step1result)
    {
       if(isNaN(step1result))
      {
        step1result=step1result.toLowerCase();
        if (containsAnySubstring(step1result, AllowedResults))
        {
          leadData.step1result=step1result;
        }
      }
      else
      {
        leadData.step1result="score";
        leadData.step1score=step1result;
      }
    }
    if(step2ckresult)
    {
      if(isNaN(step2ckresult))
      {
        step2ckresult=step2ckresult.toLowerCase();
        if (containsAnySubstring(step2ckresult, AllowedResults))
        {
          leadData.step2ckresult=step2ckresult;
        }
      }
      else
      {
        leadData.step2ckresult="score";
        leadData.step2ckscore=step2ckresult;
      }
    }
    if(step3ckresult)
    {
      if(isNaN(step3ckresult))
      {
        step3ckresult=step3ckresult.toLowerCase();
        if (containsAnySubstring(step3ckresult, AllowedResults))
        {
          leadData.step3ckresult=step3ckresult;
        }
      }
      else
      {
        leadData.step3ckresult="score";
        leadData.step3ckscore=step3ckresult;
      }
    }
  const leadDataServices = {
    servicename: row["Service"].toLowerCase(),
    servicetype: row["Service"].toLowerCase(),
  };



    
    if(row["Rotation Pushed"].trim()!="")
    {
      const selectedValues = row["Rotation Pushed"].split(',');
      const mapped = RotationOptions.filter(item => selectedValues.includes(item.value));
       if(mapped.length)
       {
          leadDataServices.rotationplanpushed=mapped;
       }
    }
    if (row["Planned Start Date"] && String(row["Planned Start Date"]).trim() !== "")
    {
       leadDataServices.plannedstartdate=firestoreQueries.Timestamp.fromDate(convertExcelDateString(row["Planned Start Date"]));
       console.log("leadData.plannedstartdate---->",leadDataServices.plannedstartdate)
    }
    
    let followupdate = firestoreQueries.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
    if (row["Webinar Date"] && String(row["Webinar Date"]).trim() !== "")
    {
      followupdate=firestoreQueries.Timestamp.fromDate(convertExcelDateString(row["Webinar Date"]));
    }

  const leadDataFollowup = {
    numbersequence:0,
    note:row['Contact Source'],
    mode:row['Contact Source'],
    followupdate:followupdate,
  }
  if(row?.["Followup Rotation Pushed"] && row?.["Followup Rotation Pushed"]?.trim()!=="")
  {
    const selectedValuesF = row["Followup Rotation Pushed"].split(',');
      const mappedF = RotationOptions.filter(item => selectedValuesF.includes(item.value));
       if(mappedF.length)
       {
          leadDataFollowup.followupplanpushed=mappedF;
       }
  }
  if(row['Contact Source']==="webinar/workshop")
  {
    leadDataFollowup.note="Webinar";
    leadDataFollowup.mode="Webinar";
  }
  else if(row['Contact Source']==="webinar")
  {
    leadDataFollowup.note="Webinar";
    leadDataFollowup.mode="Webinar";
  }
  leadDataFollowup.createTime = firestoreQueries.Timestamp.fromDate(new Date());
  leadDataFollowup.createdby=ActualLoggedInUser
  if(row['Question1'] && row['Answer1'])
    {
      leadDataFollowup.Question1=row['Question1'];
      leadDataFollowup.Answer1=row['Answer1'];
    }
    if(row['Question2'] && row['Answer2'])
    {
      leadDataFollowup.Question2=row['Question2'];
      leadDataFollowup.Answer2=row['Answer2'];
    }
    if(row['Question3'] && row['Answer3'])
    {
      leadDataFollowup.Question3=row['Question3'];
      leadDataFollowup.Answer3=row['Answer3'];
    }
    if(row['Question4'] && row['Answer4'])
    {
      leadDataFollowup.Question4=row['Question4'];
      leadDataFollowup.Answer4=row['Answer4'];
    }
  if (!validateEmail(leadData.email.trim())) {
     messageFull = messageFull +`Invalid email: ${leadData.email} </br>`;
    return null;
  }
  else if (!serviceNamesAllowed.includes(leadDataServices.servicename))
  {
      messageFull = messageFull +`Invalid Service Name: ${leadDataServices.servicename} </br>`;
      return null;
  }

  const existingLeads = await firestoreQueries.FetchDataFromCollection(
    DatabaseName,
    "leads",
    100,
    "email",
    "==",
    leadData.email
  );
  let conditionS;
  console.log("existingLeads====>",existingLeads)
 if (existingLeads.length) {
    const ExistingLeadsData=existingLeads[0];
    const uidl = existingLeads[0].id;
    let Shouldupdate=false;
    if(!ExistingLeadsData.yog && leadData.yog)
    {
      Shouldupdate=true;
      ExistingLeadsData.yog=leadData.yog;
    }
    if(!ExistingLeadsData.leadowner && leadData.leadowner)
    {
      Shouldupdate=true;
      ExistingLeadsData.leadowner=leadData.leadowner;
    }
    if(!ExistingLeadsData.servicestatus && leadData.servicestatus)
    {
      Shouldupdate=true;
      ExistingLeadsData.servicestatus=leadData.servicestatus;
    }
    if(!ExistingLeadsData.phonecountrycode && leadData.phonecountrycode)
    {
      Shouldupdate=true;
      ExistingLeadsData.phonecountrycode=leadData.phonecountrycode;
    }

    if(!ExistingLeadsData.sarthistudent && leadData.sarthistudent)
    {
      Shouldupdate=true;
      ExistingLeadsData.sarthistudent=leadData.sarthistudent;
    }


    if(!ExistingLeadsData.step1result)
    {
      let step1result=row['Step 1'];

      if(step1result)
      {
        if(isNaN(step1result))
        {
          step1result=step1result.toLowerCase();
          if (containsAnySubstring(step1result, AllowedResults))
          {
            ExistingLeadsData.step1result=step1result;
            Shouldupdate=true;
          }
        }
        else
        {
          ExistingLeadsData.step1result="score";
          ExistingLeadsData.step1score=step1result;
          Shouldupdate=true;
        }
      }
    }
    if(!existingLeads[0].step2ckresult)
    {
      let step2ckresult=row['Step 2'];
      if(step2ckresult)
      {
        if(isNaN(step2ckresult))
        {
          step2ckresult=step2ckresult.toLowerCase();
          if (containsAnySubstring(step2ckresult, ['not taken']))
          {
            ExistingLeadsData.step2ckresult=step2ckresult;
            Shouldupdate=true;
          }
        }
        else
        {
          ExistingLeadsData.step2ckresult="score";
          ExistingLeadsData.step2ckscore=step2ckresult;
          Shouldupdate=true;
        }
      }
    }

    if(!existingLeads[0].step3ckresult)
    {
      let step3ckresult=row['Step 3'];
      if(step3ckresult)
      {
        if(isNaN(step3ckresult))
        {
          step3ckresult=step3ckresult.toLowerCase();
          if (containsAnySubstring(step3ckresult, ['not taken']))
          {
            ExistingLeadsData.step3ckresult=step3ckresult;
            Shouldupdate=true;
          }
        }
        else
        {
          ExistingLeadsData.step3ckresult="score";
          ExistingLeadsData.step3ckscore=step3ckresult;
          Shouldupdate=true;
        }
      }
    }
    if(!ExistingLeadsData.nameofmedicalcollege)
    {
      ExistingLeadsData.nameofmedicalcollege=leadData.nameofmedicalcollege;
      ExistingLeadsData.nameofmedicalschoolother=leadData.nameofmedicalschoolother;
      ExistingLeadsData.countryofmedicalcollege=leadData.countryofmedicalcollege;
      Shouldupdate=true;
    }
    if(!ExistingLeadsData.leadnotes)
    {
      ExistingLeadsData.leadnotes=leadData.leadnotes;
      Shouldupdate=true;
    }
    if(!ExistingLeadsData.interestedin && leadData.interestedin)
    {
      ExistingLeadsData.interestedin = leadData.interestedin;
      Shouldupdate=true;
    }
    if(leadData?.nextfollowupdate)
    {
        Shouldupdate=true;
        ExistingLeadsData.nextfollowupdate=leadData.nextfollowupdate;
        ExistingLeadsData.followupsrequired="yes";
    }
   // ExistingLeadsData.matchapplicationsession=leadData.matchapplicationsession;
    //Shouldupdate=true;
    if(!ExistingLeadsData.matchapplicationsession)
    {
      ExistingLeadsData.matchapplicationsession=leadData.matchapplicationsession;
      Shouldupdate=true;
    }
    if(!ExistingLeadsData.matchapplicationsession)
    {
      ExistingLeadsData.matchapplicationsession=leadData.matchapplicationsession;
      Shouldupdate=true;
    }
    if(Shouldupdate)
    {
         const RR=await firestoreQueries.updateOrCreateByField(
      DatabaseName,
      "leads",
      [{fieldName:'email',operator:'==',value:ExistingLeadsData.email}],
      ExistingLeadsData
    );
    }
    const conditionsArray = [
      [
        { name: "leadid", condition: "==", value: uidl },
        { name: "servicename", condition: "==", value: leadDataServices.servicename },
      ],
    ];

    const services = await firestoreQueries.SelectWithComplexConditions(
      DatabaseName,
      "services",
      conditionsArray
    );
    if (services['data'].length)
    {
      const serviceId = services['data'][0].id;
      const ExistingServiceData=services['data'][0];
      console.log("ExistingServiceData---->",ExistingServiceData)
      let ShouldupdateService=false;
      if(!ExistingServiceData.plannedstartdate && leadDataServices.plannedstartdate)
      {
        ShouldupdateService=true;
        ExistingServiceData.plannedstartdate=leadDataServices.plannedstartdate;
      }
      if(ShouldupdateService)
      {
        console.log("ExistingServiceData=====>",ExistingServiceData)
        const RR=await firestoreQueries.updateOrCreateByField(
          DatabaseName,
          "services",
          [{fieldName:'id',operator:'==',value:serviceId}],
          ExistingServiceData
        );
         console.log("RR=====>",RR)
      }


      const followupsConditions = [
        [
          { name: "leadid", condition: "==", value: uidl },
          //{ name: "serviceid", condition: "==", value: serviceId },
          { name: "followupdate", condition: "==", value: leadDataFollowup.followupdate }
        ],
      ];
      console.log("followupsConditions--->",followupsConditions)
      const followups = await firestoreQueries.SelectWithComplexConditions(
        DatabaseName,
        "followups",
        followupsConditions
      );

      if (!followups['data'].length)
      {
        leadDataFollowup.numbersequence=followups['data'].length
        leadDataFollowup.leadid = uidl;
        leadDataFollowup.serviceid = serviceId;
          conditionS = [
          { fieldName: 'followupdate', operator: '==', value: leadDataFollowup.followupdate },
          { fieldName: 'leadid', operator: '==', value: uidl },
          //{ fieldName: 'serviceid', operator: '==', value: serviceId }
        ];
        await firestoreQueries.updateOrCreateByField(DatabaseName,"followups",conditionS,leadDataFollowup);
         messageFull = messageFull +" </br> Follow up created for Lead="+leadData['email']+` <a href='/admin/leads/updatelead/${uidl}'>Click Here</a></br>`;
      }
      else
      {
        messageFull = messageFull +" </br> Follow-up exists for Lead="+leadData['email']+` <a href='/admin/leads/updatelead/${uidl}'>Click Here</a></br>`;
      }
    }
    else
    {
      leadDataServices.leadid=uidl;
      conditionS=[{fieldName:'servicename',operator:'==',value:leadDataServices.servicename},{fieldName:'leadid',operator:'==',value:uidl}]
      let ServiceRes=await firestoreQueries.updateOrCreateByField(DatabaseName,"services",conditionS,leadDataServices);
      const serviceid = ServiceRes.docId;
      leadDataFollowup.leadid = uidl;
      leadDataFollowup.serviceid = serviceid;
       conditionS = [
          { fieldName: 'followupdate', operator: '==', value: leadDataFollowup.followupdate },
          { fieldName: 'leadid', operator: '==', value: uidl },
          { fieldName: 'serviceid', operator: '==', value: serviceid }
        ];
      const followupCreate=await firestoreQueries.updateOrCreateByField(DatabaseName,"followups",conditionS,leadDataFollowup);
      console.log("followupCreate---->",followupCreate)
       console.log("leadDataFollowup--->",leadDataFollowup)
       console.log("ServiceRes--->",ServiceRes)
       console.log("leadDataServices--->",leadDataServices)
      if(followupCreate.status==="success")
      {
        messageFull = messageFull +" </br> Service created for Lead="+leadData['email']+` <a href='/admin/leads/updatelead/${uidl}'>Click Here</a></br>`;
      }
      else
      {
        messageFull = messageFull +" </br> Service Not created for Lead="+leadData['email']+` Due To Error=>${followupCreate.message}</br>`;
      }

    }
  }
  else
  {
    //leadData.uniqueid=LastLeadId;
    //LastLeadId++;
     const conditionsArrayGet =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
    const LeadsListlast =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArrayGet,"","","","uniqueid","desc",1,null);
      if(LeadsListlast?.data)
      {
        if(LeadsListlast?.data?.[0]?.uniqueid)
        {
          LastLeadId = Number(LeadsListlast.data[0].uniqueid) + 1;
          leadData.uniqueid=LastLeadId;
        }
      }
    const result = await firestoreQueries.updateOrCreateByField(
      DatabaseName,
      "leads",
      [{fieldName:'email',operator:'==',value:leadData.email}],
      leadData
    );

    const leadid = result.docId;
    leadDataServices.leadid = leadid;
    console.log("leadDataServices--->",leadDataServices)
     conditionS=[{fieldName:'servicename',operator:'==',value:leadDataServices.servicename},{fieldName:'leadid',operator:'==',value:leadid}]
    const serviceCreate=await firestoreQueries.updateOrCreateByField(
      DatabaseName,
      "services",
      conditionS,
      leadDataServices
    );
    const serviceid = serviceCreate.docId;
    leadDataFollowup.leadid = leadid;
    //leadDataFollowup.serviceid = serviceid;
       conditionS = [
          { fieldName: 'numbersequence', operator: '==', value: leadDataFollowup.numbersequence },
          { fieldName: 'leadid', operator: '==', value: leadid },
          //{ fieldName: 'serviceid', operator: '==', value: serviceid }
        ];
    const followupCreate=await firestoreQueries.updateOrCreateByField(
      DatabaseName,
      "followups",
      conditionS,
      leadDataFollowup
    );
     console.log("leadDataFollowup--->",leadDataFollowup)
    console.log("conditionS--->",conditionS)
  console.log("followupCreate--->",followupCreate)
    if(followupCreate.status==="success")
      {
         messageFull =  messageFull +" </br> Lead created for Email="+leadData['email']+` <a href='/admin/leads/updatelead/${leadid}'>Click Here</a></br>`;
      }
      else
      {
        messageFull = messageFull +" </br> Lead created for Email="+leadData['email']+` Due To Error=>${followupCreate.message}</br>`;
      }
  }
  }
  catch(error)
  {
      hideLoading();
      TooltipsPopovers("error", "Email="+row?.["Email Address"]+" "+error.message, "Status");
      throw error;
  }

};

const Alerts =  (Authuser) => {
  ActualLoggedInUser = Authuser.ActualUser;
  const { TooltipsPopovers, firestoreQueries, DatabaseName, showLoading, hideLoading } = useLoading();
  const [errors, setErrors] = useState({});
  const [toast, addToast] = useState(0);
  const toaster = useRef();
  //firestoreQueries.deleteUser( DatabaseName,"leads","alirezamggi@gmail.com")
 /*const existingLeads = await firestoreQueries.FetchDataFromCollection(
    DatabaseName,
    "leads",
    100,
    "email",
    "==",
    "alirezamggi@gmail.com"
  );

  console.log("existingLeads---->",existingLeads)*/
  useEffect(() => {

LoadData();
  }, []);
  const LoadData = async () => {
  const adminlist=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "==", "Customer Support");
  const conditionsArrayGet =
    		[
  				[
    				//{ name: "leadcreatedby.value", condition: "==", value:ActualLoggedInUser.id },
    				//{ name: "RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate", condition: ">=", value: DateTimestampStart }
  				]
  			];
      const LeadsListlast =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"leads",conditionsArrayGet,"","","","uniqueid","desc",1,null);
      if(LeadsListlast?.data)
      {
        if(LeadsListlast?.data?.[0]?.uniqueid)
        {
          LastLeadId = LeadsListlast.data[0].uniqueid + 1;
        }
      }
  AdminOptionsList=[];
   adminlist.map((item) => {
    AdminOptionsList.push({label:item.name,value:item.uid,name:item.name});
    return "h";
    })
    const RotationList=await firestoreQueries.FetchDataFromCollection(DatabaseName, "rotationslist", 1000);
    RotationOptions=[];
 RotationList.map((item) => {
    RotationOptions.push({label:item.location_code,value:item.location_code,locationid:item.id});
    return "h";
    })
  }
  const handleFileChange = async (e) => {
    const fileInput = e.target; // Reference to the file input element
   const file = fileInput.files[0];

    if (!file) {
      setErrors({ file: "No file selected" });
       hideLoading();
      return;
    }

    const fileType = file.name.split(".").pop().toLowerCase();
    if (fileType !== "xlsx" && fileType !== "xls") {
      setErrors({ file: "Please upload a valid Excel file (.xlsx or .xls)." });
       hideLoading();
      return;
    }
  showLoading();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      //const jsonData = XLSX.utils.sheet_to_json(sheet);
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      });
      const headers = jsonData[0].map((header) =>
        typeof header === "string" ? header.trim() : header
      ); // Clean up header names
      const dataRows = jsonData.slice(1); // Get the rest of the rows


      // Convert to objects (optional)
      const processedData = dataRows.map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || ""; // Assign blank string if value is missing
        });
        return rowData;
      });
      if (jsonData.length === 0) {
        setErrors({ file: "The file is empty or has an invalid structure." });
        fileInput.value = "";
         hideLoading();
        return;
      }

     // const headers = Object.keys(jsonData[0]);
      console.log("headers---->",headers)
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        setErrors({
          file: `Missing required columns: ${missingColumns.join(", ")}`,
        });
        fileInput.value = "";
         hideLoading();
        return;
      }

      //TooltipsPopovers("success", "File validated successfully!", "Success");

      setErrors({});

      for (const row of processedData) {
        await processRow(row, firestoreQueries, DatabaseName,hideLoading,TooltipsPopovers);
      }

      hideLoading();
      TooltipsPopovers("success", messageFull, "Status");
      fileInput.value = "";
    };

    reader.readAsBinaryString(file);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Validate Excel</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 needs-validation">
              <CCol md={4}>
                <div>
                  <CFormInput
                    type="file"
                    size="lg"
                    id="formFileLg"
                    label="Import Leads Excel"
                    onChange={handleFileChange}
                  />
                  {errors.file && (
                    <CFormFeedback invalid>{errors.file}</CFormFeedback>
                  )}
                </div>
              </CCol>
               <CCol md={4}>
               <div>

              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={downloadExcelTemplate}>
              Download Template <br></br>
      <FontAwesomeIcon className="TopMargin"  icon={faFileExcel} color="#107C41" size="2x" />
    </button>
    </div>
     </CCol>
              {/*<CCol xs={12}>
                <CButton color="primary" type="button">
                  Submit
                </CButton>
              </CCol>*/}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Alerts;
