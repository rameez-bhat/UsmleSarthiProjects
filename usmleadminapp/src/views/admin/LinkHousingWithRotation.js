import React, { useState,useRef,useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';

//import CryptoJS from 'crypto-js';
import { useLoading } from '../../layout/LoadingContext';
import {
  TextField,
  Grid,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
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
let messageFull="";
import {
collection,
getDocs,
setDoc,
doc,
query,
updateDoc,
addDoc,
where
} from "firebase/firestore";

import { db } from "../../firebase";
import {  CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
function convertEmailToDocumentId(email) {
  return CryptoJS.MD5(email).toString(CryptoJS.enc.Hex); // MD5 hash of email
}
 let PId=0;
 const nowDate = new Date();
let HId=0;
const REQUIRED_FIELDS = [
  "Program Name",
  "Program City",
  "Program State",
  "FREIDA ID",
  "Primary Teaching Site",
  "Participates in ERAS®"
];

const ALL_FIELDS = [
  "Program Name",
  "Program City",
  "Program State",
  "FREIDA ID",
  "Primary Teaching Site",
  "Program best described as",
  "Information Program best described as",
  "YOG",
  "Participates in ERAS®",
  "j1VisaNew",
  "h1VisaNew",
  "f1VisaNew",
  "Participating in NRMP",
  "NRMP Number (Advance)",
  "step1_Minimum score",
  "step1_Applicants must have passed Step 1 to be considered",
  "step1_Step 1 required",
  "step2_Minimum score",
  "step2_Applicants must have passed Step 2 to be considered",
  "step2_Step 2 required",
  "AppInfo_Latest date for applications for 2026-2027",
  "AppInfo_Interviews conducted last year for first year positions",
  "AppInfo_Required letters of recommendation",
  "noneEnglish",
  "nonaccredited",
  "Person to Contact",
  "Program Director",
  "Prgaddress",
  "Web Address",
  "Program Link",
  "NRMP Number (Primary Care Categorial)",
  "NRMP Number (Categorial)",
  "NRMP Number (Preliminary)"
];
let ProgramNameList="Internal Medicine"
const hospitalCache = new Map(); // HName → HId
    	const hpCache = new Set(); // "HId_PId"
       let HPId="";
let conditionsArray=[];
function ImportExcel() {
  const [excelData, setExcelData] = useState([]);
    const [errors, setErrors] = useState({});
    const [speciality, setSpeciality] = useState("");
  const { showLoading, hideLoading,updateWhereFieldEquals,handleUpdateOrCreateByConditions,DeleteDocumentWhere,removePidFromHospital,DeleteDocumentWhereMultiple,TooltipsPopovers,SelectWithComplexConditions,handleAdd,handleUpdateOrCreateByField, API_KEY,SelectWithWhereAnd,copyCollection,updateOrAddFieldInCollection,DatabaseName,getMaxStudentUniqueId,handleUpdate, FetchDataFromCollection,Timestamp } = useLoading();
	 const [toast, addToast] = useState(0);
  const toaster = useRef();

  const processDataToTable= async (row)=>
  {
  	
        //console.log("row-->",row)
        const codesArray = row['Location code'];
        let hospitalName=row['Program Name']?.trim();
        if (!hospitalName) return null;
        let HospitalData = {
        City:row['Program City'],
        HName:hospitalName,
        PIds:[PId],
        State:row['Program State'],
        createdAt:Timestamp.fromDate(new Date()),
        updatedAt:Timestamp.fromDate(new Date()),
        };
        let HospitalProgramInfo = {
  HId: PId,
  PId: PId,
  HPId: PId,
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
};

console.log("row=---------->",row['FREIDA ID'])
HospitalProgramInfo['Frieda']='';
HospitalProgramInfo['teachingSiteNew']='';
HospitalProgramInfo['ProgramType']='';
HospitalProgramInfo['YOG']='';
HospitalProgramInfo['Eras']='';
HospitalProgramInfo['j1VisaNew']='';
HospitalProgramInfo['h1VisaNew']='';
HospitalProgramInfo['f1VisaNew']='';
HospitalProgramInfo['Nrmp']='';
HospitalProgramInfo['NrmpAdvance']='';
HospitalProgramInfo['Step1ScoreLastYearMin']='';
HospitalProgramInfo['Step1AcceptN']='';
HospitalProgramInfo['Step1Req']='';
HospitalProgramInfo['Step2Min']='';
HospitalProgramInfo['Step2AcceptN']='';
HospitalProgramInfo['Step2Req']='';
HospitalProgramInfo['AppDeadline']='';
HospitalProgramInfo['NumInterviews']='';
HospitalProgramInfo['LORNum']='';
HospitalProgramInfo['SpanishReq']='';
HospitalProgramInfo['ResearchOpp']='';
HospitalProgramInfo['personToContactNew']='';
HospitalProgramInfo['programDirectorNew']='';
HospitalProgramInfo['address']='';
HospitalProgramInfo['website']='';

HospitalProgramInfo['friedaLink']='';
HospitalProgramInfo['NrmpPriCase']='';
HospitalProgramInfo['NrmpPrelim']='';
HospitalProgramInfo['NrmpCategorical']='';

if (row?.['FREIDA ID']) {
  HospitalProgramInfo['Frieda'] = String(row['FREIDA ID']);
  //HospitalProgramInfo['imgpercentage'] = row['FREIDA ID'];
}
if (row?.['Primary Teaching Site']) {
  HospitalProgramInfo['teachingSiteNew'] = row['Primary Teaching Site'];
}
if (row?.['Program best described as']) {
  HospitalProgramInfo['ProgramType'] = row['Program best described as'];
}
else if (row?.['Information Program best described as']) {
  HospitalProgramInfo['ProgramType'] = row['Information Program best described as'];
}
if (row?.['YOG']) {
  HospitalProgramInfo['YOG'] = row['YOG'];
}
if (row?.['Participates in ERAS®']) {
  HospitalProgramInfo['Eras'] = row['Participates in ERAS®'];
}
if (row?.['j1VisaNew']) {
  HospitalProgramInfo['j1VisaNew'] = row['j1VisaNew'];
}
if (row?.['h1VisaNew']) {
  HospitalProgramInfo['h1VisaNew'] = row['h1VisaNew'];
}
if (row?.['f1VisaNew']) {
  HospitalProgramInfo['f1VisaNew'] = row['f1VisaNew'];
}
if (row?.['Participating in NRMP']) {
  HospitalProgramInfo['Nrmp'] = row['Participating in NRMP'];
}
if (row?.['NRMP Number (Advance)']) {
  HospitalProgramInfo['NrmpAdvance'] = row['NRMP Number (Advance)'];
}
if (row?.['step1_Minimum score']) {
  HospitalProgramInfo['Step1ScoreLastYearMin'] = row['step1_Minimum score'];
}
if (row?.['step1_Applicants must have passed Step 1 to be considered']) {
  HospitalProgramInfo['Step1AcceptN'] = row['step1_Applicants must have passed Step 1 to be considered'];
}
if (row?.['step1_Step 1 required']) {
  HospitalProgramInfo['Step1Req'] = row['step1_Step 1 required'];
}
if (row?.['step2_Minimum score']) {
  HospitalProgramInfo['Step2Min'] = row['step2_Minimum score'];
}

if (row?.['step2_Applicants must have passed Step 2 to be considered']) {
  HospitalProgramInfo['Step2AcceptN'] = row['step2_Applicants must have passed Step 2 to be considered'];
}
if (row?.['step2_Step 2 required']) {
  HospitalProgramInfo['Step2Req'] = row['step2_Step 2 required'];
}
if (row?.['AppInfo_Latest date for applications for 2026-2027']) {
  HospitalProgramInfo['AppDeadline'] = row['AppInfo_Latest date for applications for 2026-2027'];
}
if (row?.['AppInfo_Interviews conducted last year for first year positions']) {
  HospitalProgramInfo['NumInterviews'] = row['AppInfo_Interviews conducted last year for first year positions'];
}
if (row?.['AppInfo_Required letters of recommendation']) {
  HospitalProgramInfo['LORNum'] = row['AppInfo_Required letters of recommendation'];
}
if (row?.['noneEnglish']) {
  HospitalProgramInfo['SpanishReq'] = row['noneEnglish'];
}
if (row?.['nonaccredited']) {
  HospitalProgramInfo['ResearchOpp'] = row['nonaccredited'];
}
if (row?.['Person to Contact']) {
  HospitalProgramInfo['personToContactNew'] = row['Person to Contact'];
}
if (row?.['Program Director']) {
  HospitalProgramInfo['programDirectorNew'] = row['Program Director'];
}
if (row?.['Prgaddress']) {
  HospitalProgramInfo['address'] = row['Prgaddress'];
}
if (row?.['Web Address']) {
  HospitalProgramInfo['website'] = row['Web Address'];
}
if (row?.['Program Link']) {
  HospitalProgramInfo['friedaLink'] = row['Program Link'];
}
if (row?.['NRMP Number (Primary Care Categorial)']) {
  HospitalProgramInfo['NrmpPriCase'] = row['NRMP Number (Primary Care Categorial)'];
}
if (row?.['NRMP Number (Categorial)']) {
  HospitalProgramInfo['NrmpCategorical'] = row['NRMP Number (Categorial)'];
}
if (row?.['NRMP Number (Preliminary)']) {
  HospitalProgramInfo['NrmpPrelim'] = row['NRMP Number (Preliminary)'];
}
        HId = hospitalCache.get(hospitalName);
        if (!HId) 
        {
        	const HospitalTableData = await FetchDataFromCollection("Hospital", 20, "HName", "==", hospitalName, 0);
        	console.log("HospitalTableData----->",HospitalTableData)
        	if(HospitalTableData.length)
    		{
    		let currentPId=PId;
    		//console.log("HospitalTableData----->",HospitalTableData)
    		for (const hospital of HospitalTableData) 
    		{
  				const existingPIds = hospital.PIds || [];
				if (!existingPIds.includes(currentPId)) 
				{
    				const updatedPIds = [...existingPIds, currentPId];
    				const updatedHospitalData = {
      					...hospital,
      					PIds: updatedPIds,
      					HId: hospital.id,
      					updatedAt: Timestamp.fromDate(new Date()),
    					};
    				await handleUpdate("Hospital", hospital.id, updatedHospitalData);
    				//console.log(`Updated hospital "${hospital.HName}" with new PId: ${currentPId}`);
  				}
  				else if (!hospital.HId) 
				{
    				const updatedPIds = [...existingPIds, currentPId];
    				const updatedHospitalData = {
      					...hospital,
      					HId: hospital.id,
      					updatedAt: Timestamp.fromDate(new Date()),
    					};
    				await handleUpdate("Hospital", hospital.id, updatedHospitalData);
    				//console.log(`Updated hospital "${hospital.HName}" with new PId: ${currentPId}`);
  				}
			}
    		HId=HospitalTableData[0]?.HId?HospitalTableData[0]?.HId:HospitalTableData[0]?.id;
    		//const HospitalProgrammData = await FetchDataFromCollection("HospitalProgram", 20, "HName", "==", hospitalName, 0);
    		let WhereOrObject=[{"name":"HId","condition":"==","value":HId},{"name":"PId","condition":"==","value":PId}];
    		
    		//await DeleteDocumentWhereMultiple("HospitalProgramInfo",WhereOrObject)
    		//await DeleteDocumentWhereMultiple("HospitalProgram",WhereOrObject)
    		//await removePidFromHospital(HId,PId);
    		  //console.log("WhereOrObject===>",WhereOrObject)
    		const results = await SelectWithWhereAnd("HospitalProgram", WhereOrObject);
    		 console.log("results===>",results)
    		if(results.status==="success")
    		{
    			if(results.data.length)
    			{
    				//let WhereOrObject=[{"name":"HId","condition":"==","value":HId},{"name":"PId","condition":"==","value":PId},{"name":"Frieda","condition":"==","value":HospitalProgramInfo['Frieda']}];
    				let WhereOrObject=[{"name":"PId","condition":"==","value":PId},{"name":"Frieda","condition":"==","value":HospitalProgramInfo['Frieda']}];
    		  		//console.log("WhereOrObject===>",WhereOrObject)
    				const resultsInfo = await SelectWithWhereAnd("HospitalProgramInfo", WhereOrObject);
    				console.log("resultsInfo--->",resultsInfo)
    				console.log("WhereOrObject--->",WhereOrObject)
    				let updateFreade=false;
    				if(resultsInfo.status==="success")
    				{
    					if(!resultsInfo.data.length)
    					{
    						//let WhereOrObjectL=[{"name":"HId","condition":"==","value":HId},{"name":"PId","condition":"==","value":PId},{"name":"Frieda","condition":"==","value":Number(HospitalProgramInfo['Frieda'])}];
    						let WhereOrObjectL=[{"name":"PId","condition":"==","value":PId},{"name":"Frieda","condition":"==","value":Number(HospitalProgramInfo['Frieda'])}];
    						const resultsInfoL = await SelectWithWhereAnd("HospitalProgramInfo", WhereOrObjectL);
    						resultsInfo.data=resultsInfoL.data;
    						console.log("WhereOrObjectL--->",WhereOrObjectL)
    						console.log("resultsInfoL--->",resultsInfoL)
    						updateFreade=true;
    					}
    					if(resultsInfo.data.length)
    					{
    						for (const hospitalInfo of resultsInfo.data) 
    						{
    							//console.log("hospitalInfo----->",hospitalInfo)
    							//console.log("HospitalProgramInfo----->",HospitalProgramInfo)
    							let hostinfoId=hospitalInfo?.id
    							let HPIdG=hospitalInfo?.HPId
    							let DataInfoTableToUpdate={"TimeStamp":Date.now(), "TimeStampD": nowDate.toISOString()}
    							if(hostinfoId)
    							{
    								if (!hospitalInfo?.Frieda || String(hospitalInfo.Frieda).trim() === "") 
    								{
    									DataInfoTableToUpdate['Frieda']=HospitalProgramInfo['Frieda'];
									}
									if(updateFreade)
									{
										DataInfoTableToUpdate['Frieda']=HospitalProgramInfo['Frieda'];
									}
									//if (!hospitalInfo?.teachingSiteNew || String(hospitalInfo.teachingSiteNew).trim() === "") 
    								{
    									DataInfoTableToUpdate['teachingSiteNew']=HospitalProgramInfo['teachingSiteNew'];
									}
									//if (!hospitalInfo?.Nrmp || String(hospitalInfo.Nrmp).trim() === "") 
    								{
    									DataInfoTableToUpdate['Nrmp']=HospitalProgramInfo['Nrmp'];
									}
									//if (!hospitalInfo?.NrmpPrelim || String(hospitalInfo.NrmpPrelim).trim() === "") 
    								{
    									DataInfoTableToUpdate['NrmpPrelim']=HospitalProgramInfo['NrmpPrelim'];
									}
									//if (!hospitalInfo?.NrmpCategorical || String(hospitalInfo.NrmpCategorical).trim() === "") 
    								{
    									DataInfoTableToUpdate['NrmpCategorical']=HospitalProgramInfo['NrmpCategorical'];
									}
									//if (!hospitalInfo?.NrmpPriCase || String(hospitalInfo.NrmpPriCase).trim() === "") 
    								{
    									DataInfoTableToUpdate['NrmpPriCase']=HospitalProgramInfo['NrmpPriCase'];
									}
									//if (!hospitalInfo?.NrmpAdvance || String(hospitalInfo.NrmpAdvance).trim() === "") 
    								{
    									DataInfoTableToUpdate['NrmpAdvance']=HospitalProgramInfo['NrmpAdvance'];
									}
									//if (!hospitalInfo?.YOG || String(hospitalInfo.YOG).trim() === "") 
    								{
    									DataInfoTableToUpdate['YOG']=HospitalProgramInfo['YOG'];
									}
									//if (!hospitalInfo?.YOG || String(hospitalInfo.YOG).trim() === "") 
    								{
    									DataInfoTableToUpdate['YOG']=HospitalProgramInfo['YOG'];
									}
									//if (!hospitalInfo?.Eras || String(hospitalInfo.Eras).trim() === "") 
    								{
    									DataInfoTableToUpdate['Eras']=HospitalProgramInfo['Eras'];
									}
									//if (!hospitalInfo?.ProgramType || String(hospitalInfo.ProgramType).trim() === "") 
    								{
    									DataInfoTableToUpdate['ProgramType']=HospitalProgramInfo['ProgramType'];
									}
									//if (!hospitalInfo?.j1VisaNew || String(hospitalInfo.j1VisaNew).trim() === "") 
    								{
    									DataInfoTableToUpdate['j1VisaNew']=HospitalProgramInfo['j1VisaNew'];
									}
									//if (!hospitalInfo?.h1VisaNew || String(hospitalInfo.h1VisaNew).trim() === "") 
    								{
    									DataInfoTableToUpdate['h1VisaNew']=HospitalProgramInfo['h1VisaNew'];
									}
									//if (!hospitalInfo?.f1VisaNew || String(hospitalInfo.f1VisaNew).trim() === "") 
    								{
    									DataInfoTableToUpdate['f1VisaNew']=HospitalProgramInfo['f1VisaNew'];
									}
									//if (!hospitalInfo?.Step1ScoreLastYearMin || String(hospitalInfo.Step1ScoreLastYearMin).trim() === "") 
    								{
    									DataInfoTableToUpdate['Step1ScoreLastYearMin']=HospitalProgramInfo['Step1ScoreLastYearMin'];
									}
									//if (!hospitalInfo?.Step2Min || String(hospitalInfo.Step2Min).trim() === "") 
    								{
    									DataInfoTableToUpdate['Step2Min']=HospitalProgramInfo['Step2Min'];
									}
									//if (!hospitalInfo?.AppDeadline || String(hospitalInfo.AppDeadline).trim() === "") 
    								{
    									DataInfoTableToUpdate["AppDeadline"]=HospitalProgramInfo["AppDeadline"];
									}
									//if (!hospitalInfo?.NumInterviews || String(hospitalInfo.NumInterviews).trim() === "") 
    								{
    									DataInfoTableToUpdate["NumInterviews"]=HospitalProgramInfo["NumInterviews"];
									}
									//if (!hospitalInfo?.LORNum || String(hospitalInfo.LORNum).trim() === "") 
    								{
    									DataInfoTableToUpdate["LORNum"]=HospitalProgramInfo["LORNum"];
									}
									//if (!hospitalInfo?.SpanishReq || String(hospitalInfo.SpanishReq).trim() === "") 
    								{
    									DataInfoTableToUpdate["SpanishReq"]=HospitalProgramInfo["SpanishReq"];
									}
									//if (!hospitalInfo?.ResearchOpp || String(hospitalInfo.ResearchOpp).trim() === "") 
    								{
    									DataInfoTableToUpdate["ResearchOpp"]=HospitalProgramInfo["ResearchOpp"];
									}
									//if (!hospitalInfo?.address || String(hospitalInfo.address).trim() === "") 
    								{
    									DataInfoTableToUpdate["address"]=HospitalProgramInfo["address"];
									}
									//if (!hospitalInfo?.programDirectorNew || String(hospitalInfo.programDirectorNew).trim() === "") 
    								{
    									DataInfoTableToUpdate["programDirectorNew"]=HospitalProgramInfo["programDirectorNew"];
									}
									//if (!hospitalInfo?.personToContactNew || String(hospitalInfo.personToContactNew).trim() === "") 
    								{
    									DataInfoTableToUpdate["personToContactNew"]=HospitalProgramInfo["personToContactNew"];
									}
									//if (!hospitalInfo?.website || String(hospitalInfo.website).trim() === "") 
    								{
    									DataInfoTableToUpdate["website"]=HospitalProgramInfo["website"];
									}
									//if (!hospitalInfo?.friedaLink || String(hospitalInfo.friedaLink).trim() === "") 
    								{
    									DataInfoTableToUpdate["friedaLink"]=HospitalProgramInfo["friedaLink"];
									}
									DataInfoTableToUpdate["Step1Req"]=HospitalProgramInfo["Step1Req"];
									DataInfoTableToUpdate["Step2Req"]=HospitalProgramInfo["Step2Req"];
									DataInfoTableToUpdate['Step2AcceptN']=HospitalProgramInfo["Step2AcceptN"];
									DataInfoTableToUpdate['Step1AcceptN']=HospitalProgramInfo["Step1AcceptN"];
    								if(!hospitalInfo?.Verified)
    								{
    									DataInfoTableToUpdate['Verified']="Yes";
    									DataInfoTableToUpdate['VerifiedAdmin']="AutoAdmin@gmail.com";
    									//let rR=await handleUpdate("HospitalProgramInfo", hostinfoId, DataInfoTableToUpdate);
    									//console.log("rR----->",rR)
    								}
    								else if(hospitalInfo?.Verified && hospitalInfo?.Verified==="No")
    								{
    									DataInfoTableToUpdate['Verified']="Yes";
    									DataInfoTableToUpdate['VerifiedAdmin']="AutoAdmin@gmail.com";
    									//let rRT=await handleUpdate("HospitalProgramInfo", hostinfoId, DataInfoTableToUpdate);
    									//console.log("rRT----->",rRT)
    								}
    								let rRT=await handleUpdate("HospitalProgramInfo", hostinfoId, DataInfoTableToUpdate);
    								console.log("rRT----->",rRT)
    							}
    							
    							
  								//const existingPIds = hospital.PIds || [];
								/*if (!existingPIds.includes(currentPId)) 
								{
    								const updatedPIds = [...existingPIds, currentPId];
    								const updatedHospitalData = {
      										...hospital,
      									PIds: updatedPIds,
      									updatedAt: Timestamp.fromDate(new Date()),
    								};
    								await handleUpdate("Hospital", hospital.id, updatedHospitalData);
    								console.log(`Updated hospital "${hospital.HName}" with new PId: ${currentPId}`);
  								}*/
							}
    					}
    				}
    			}
    			else
    			{
    				let Hpidg=HId+"_"+PId
    				let HospitalProgram={
    					HId:HId,
    					PId:PId,
    					HPId:Hpidg
    					}
    				HospitalProgramInfo['HId']=HId;
    				HospitalProgramInfo['PId']=PId;
    				HospitalProgramInfo['HPId']=Hpidg;
    				HospitalProgramInfo['HPInfoId']=Hpidg;
    				HospitalProgramInfo['Verified']="Yes";
    				HospitalProgramInfo['TimeStamp']=Date.now();
    				HospitalProgramInfo['TimeStampD']=nowDate.toISOString();
    				HospitalProgramInfo['VerifiedAdmin']="AutoAdmin@gmail.com";
    				console.log("HospitalProgramInfo--->",HospitalProgramInfo)
    				console.log("HospitalProgram--->",HospitalProgram)
    		 		messageFull += `<br/> Added/Updated Specialty=${ProgramNameList} Program=${hospitalName}`;
    				let resHtt=await handleUpdate("HospitalProgramInfo",Hpidg,HospitalProgramInfo)
    				console.log("resHtt====>",resHtt)
    				resHtt=await handleUpdate("HospitalProgram",Hpidg,HospitalProgram)
    				console.log("resHtt====>",resHtt)
    				
    			}
    		}
    		
    	}
    		else
    		{
    			let HospitalTableData=await handleAdd("Hospital",HospitalData)
    		
    			HId=HospitalTableData[0]?.HId?HospitalTableData[0]?.HId:HospitalTableData[0]?.id;
    			HospitalData['HId']=HId;
    			let res=await handleUpdate("Hospital",HId,HospitalData)
    			let Hpidg=HId+"_"+PId
    			let HospitalProgram={
    			HId:HId,
    			PId:PId,
    			HPId:Hpidg
    			}
    			HospitalProgramInfo['HId']=HId;
    			HospitalProgramInfo['PId']=PId;
    			HospitalProgramInfo['HPId']=Hpidg;
    			HospitalProgramInfo['HPInfoId']=Hpidg;
    			HospitalProgramInfo['TimeStamp']=Date.now();
    			HospitalProgramInfo['TimeStampD']=nowDate.toISOString();
    		 	messageFull += `<br/> Added Specialty=${ProgramNameList} Program=${hospitalName}`;
    			let resHtt=await handleUpdate("HospitalProgramInfo",Hpidg,HospitalProgramInfo)
    			resHtt=await handleUpdate("HospitalProgram",Hpidg,HospitalProgram)
    			console.log("resHtt====>",resHtt)
    			console.log("resHtt====>",resHtt)
    		
    		}
    		hospitalCache.set(hospitalName, HId);
    	}
        
          //console.log("dataTobesend---->",dataTobesend)
     
          return HospitalProgramInfo;
        
  }
  const downloadExcelFormat = () => {
  

const SAMPLE_ROWS = [
  [
    "https://freida.ama-assn.org/program/9991200026",
    "9991200026",
    "Emory University School of Medicine Program",
    "Atlanta",
    "GA",
    "University-based",
    "Grady Health System",
    "Yes",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "https://med.emory.edu/departments/medicine/education/residency-program/transitional-year/index.html",
    "",
    "Atlanta, GA",
    "Manpreet Singh Malik MD",
    "Kymberly McMillan"
  ],
  [
    "https://freida.ama-assn.org/program/9993500241",
    "9993500241",
    "Memorial Sloan Kettering Cancer Center Program",
    "New York",
    "NY",
    "University-based",
    "Memorial Sloan Kettering Cancer Center",
    "Yes",
    "Yes",
    "1466999P0",
    "",
    "",
    "",
    "",
    "",
    "",
    "Yes",
    "Yes",
    "Yes",
    "",
    "",
    "200",
    "Yes",
    "200",
    "Yes",
    "Yes",
    "11/15/2025",
    "150",
    "3",
    "http://www.mskcc.org/medtransitionalyearinternship",
    "",
    "New York, NY",
    "Cori Salvit MD",
    "Rachelle Sanchez"
  ]
];

  const wsData = [ALL_FIELDS, ...SAMPLE_ROWS];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column Width Auto Adjust
  ws["!cols"] = ALL_FIELDS.map((col) => ({
    wch: Math.max(col.length + 5, 20)
  }));

  ALL_FIELDS.forEach((field, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });

    if (!ws[cellRef]) return;

    const isRequired = REQUIRED_FIELDS.includes(field);

    ws[cellRef].s = {
      font: {
        bold: true,
        color: { rgb: isRequired ? "FFFFFF" : "000000" }
      },
      fill: {
        fgColor: { rgb: isRequired ? "FF0000" : "D9D9D9" }
      },
      alignment: {
        horizontal: "center",
        vertical: "center"
      }
    };

    // Add header comment (tooltip)
    ws[cellRef].c = [
      {
        t: isRequired
          ? "Required Field - Do not leave empty"
          : "Optional Field"
      }
    ];
  });

  // Add dropdown validation (Yes/No fields)
  const yesNoFields = [
    "Participates in ERAS®",
    "j1VisaNew",
    "h1VisaNew",
    "f1VisaNew",
    "Participating in NRMP"
  ];

  yesNoFields.forEach((field) => {
    const colIndex = ALL_FIELDS.indexOf(field);
    if (colIndex === -1) return;

    for (let row = 1; row <= 200; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: colIndex });

      if (!ws[cellRef]) ws[cellRef] = {};

      ws[cellRef].t = "s";

      ws[cellRef].dv = {
        type: "list",
        allowBlank: true,
        formula1: '"Yes,No"'
      };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  XLSX.writeFile(wb, "Advanced_Program_Template.xlsx");
};
  const getFormattedDateTime = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};
  const handleFileUpload1 = async (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

    	reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      console.log("workbook-->",workbook)
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });
      ///console.log("jsonData---->",jsonData)
       const headers = jsonData[0].map((header) =>
        typeof header === "string" ? header.trim() : header
      ); // Clean up header names
      const dataRows = jsonData.slice(1); // Get the rest of the rows
      const processedData = dataRows.map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || ""; // Assign blank string if value is missing
        });
        return rowData;
      });
      let WhereOrObject=[{"name":"DoctorAssigned","condition":"!=","value":"they"}];
    	const results = await SelectWithWhereAnd("Rotations", WhereOrObject);
    	let WhereOrObjectH=[{"name":"address","condition":"!=","value":"they"}];
    	const resultsH = await SelectWithWhereAnd("Housings", WhereOrObjectH);
    	const RotationData={};
    	//console.log("results===>",results)
    	//console.log("resultsH===>",resultsH)
    	const HousingDataToSave={};
    	const HousingData={};
    	resultsH.data.forEach(item => {
      HousingData[item.title] = item.id;
  });
    	if(results.status=="success")
    	{
    		results.data.forEach(item => {
    if (item.location_code) {
      RotationData[item.location_code] = item.location_code;
    }
  });

    }	
    console.log("HousingData---->",HousingData)
    console.log("RotationData---->",RotationData)
      for (const row of processedData) 
        {
        	console.log("row---->",row)
        	const rotationCode = RotationData[row['Rotation']];
        	console.log("rotationCode---->",rotationCode)
  if (!rotationCode) continue;

	if(row['Housing1'] && HousingData[row['Housing1']])
	{
		if(!HousingDataToSave[HousingData[row['Housing1']]])
		{
			HousingDataToSave[HousingData[row['Housing1']]]={LocationCodes: {}}
		}
		HousingDataToSave[HousingData[row['Housing1']]].LocationCodes[rotationCode] = rotationCode;
	}
	if(row['Housing2'] && HousingData[row['Housing2']])
	{
		if(!HousingDataToSave[HousingData[row['Housing2']]])
		{
			HousingDataToSave[HousingData[row['Housing2']]]={LocationCodes: {}}
		}
		HousingDataToSave[HousingData[row['Housing2']]].LocationCodes[rotationCode] = rotationCode;
	}
	if(row['Housing3'] && HousingData[row['Housing3']])
	{
		if(!HousingDataToSave[HousingData[row['Housing3']]])
		{
			HousingDataToSave[HousingData[row['Housing3']]]={LocationCodes: {}}
		}
		HousingDataToSave[HousingData[row['Housing3']]].LocationCodes[rotationCode] = rotationCode;
	}
        	/*let date = getFormattedDateTime(); 
        	let Ratings=String(row.StarsRating);
        	let Location_Code=String(row.Location_Code);
        	let Student_Name=String(row.Student_Name);
        	let Feedback=String(row.Feedback);
        	let insertData={feedback:Feedback,location_code:Location_Code,ratings:Ratings,student_name:Student_Name,title:"",date:date};
        	let conditionList=[{field:"location_code",operator:"==",value:Location_Code},{field:"student_name",operator:"==",value:Student_Name}]
        	let res=await handleUpdateOrCreateByConditions("RotationReviews",conditionList,insertData);
        	console.log("Insert Result:", res);*/
        }
        await Promise.all(
  Object.entries(HousingDataToSave).map(([docId, data]) => {
    const updates = { updatedAt: new Date() };

    Object.keys(data.LocationCodes).forEach(code => {
      updates[`LocationCodes.${code}`] = code;
    });
console.log("updates-->",updates);
//return;

    return updateDoc(doc(db, "Housings", docId), updates);
  })
);
        console.log("HousingDataToSave===>",HousingDataToSave)
  }
  reader.readAsBinaryString(file);
  }
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    let MaxStudentUniqueId=await getMaxStudentUniqueId("Program","PIdN");
    let NextProgramId=MaxStudentUniqueId+1;
   if(speciality==="")
   {
   	ProgramNameList=speciality;
   	hideLoading();
   	TooltipsPopovers("success", "Please Enter Speciality", "Status");
   }
   else
   {
   		ProgramNameList=speciality;
    const ProgramTableData = await FetchDataFromCollection("Program", 20, "PName", "==", ProgramNameList, 0);
    	if(ProgramTableData.length)
    	{
    		PId=ProgramTableData[0].PId;
    	}
    	else
    	{
    	let NextId=NextProgramId.toString()
    	let ProgramDataToSend={
    	"MinHosLatestInfo":"10",
    	PId:NextId,
    	PIdN:NextProgramId,
    	PName:ProgramNameList,
    	}
    	let res=await handleUpdate("Program",NextId,ProgramDataToSend)
    	console.log("res--->",res)
    	PId=NextId;
    }
    	const reader = new FileReader();

    	reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      console.log("workbook-->",workbook)
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });
      ///console.log("jsonData---->",jsonData)
       const headers = jsonData[0].map((header) =>
        typeof header === "string" ? header.trim() : header
      ); // Clean up header names
      const dataRows = jsonData.slice(1); // Get the rest of the rows
      const processedData = dataRows.map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || ""; // Assign blank string if value is missing
        });
        return rowData;
      });
       //console.log("jsonData-->",jsonData)
       
       showLoading();
        for (const row of processedData) 
        {
        	await processDataToTable(row);
        }
     
hideLoading();
if(messageFull==="")
{
	messageFull="No New Changes Found."
}
TooltipsPopovers("success", messageFull, "Status");
      //setExcelData(processedData);
    };

    	reader.readAsBinaryString(file);
	}
  };

  return (
  <>
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
                    type="text"
                    id="specialityName"
                    label="Speciality Name"
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                  />
                </div>
              </CCol>
              <CCol md={4}>
                <div>
                  <CFormInput
                    type="file"
                    size="lg"
                    accept=".xls,.xlsx"
                    id="formFileLg"
                    label="Import Program List Excel 2"
                    onChange={handleFileUpload1}
                  />
                  {errors.file && (
                    <CFormFeedback invalid>{errors.file}</CFormFeedback>
                  )}
                </div>
              </CCol>
              
               <CCol md={4}>
               <div>

              
    </div>
     </CCol>
     <CCol md={4}>
  <CButton
    color="success"
    style={{ marginTop: "30px" }}
    onClick={downloadExcelFormat}
  >
    Download Format
  </CButton>
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
 
    </>
  );
}

export default ImportExcel;