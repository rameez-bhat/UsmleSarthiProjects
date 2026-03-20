import React, { useState } from 'react';
import * as XLSX from 'xlsx';

//import CryptoJS from 'crypto-js';
import { useLoading } from '../../layout/LoadingContext';

function convertEmailToDocumentId(email) {
  return CryptoJS.MD5(email).toString(CryptoJS.enc.Hex); // MD5 hash of email
}

function ImportExcel() {
  const [excelData, setExcelData] = useState([]);
  const { showLoading, hideLoading,handleUpdateOrCreateByField, API_KEY,SelectWithWhereAnd,copyCollection,updateOrAddFieldInCollection,DatabaseName,getMaxStudentUniqueId,handleUpdate, FetchDataFromCollection,Timestamp } = useLoading();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const processedData = await Promise.all(
        jsonData.map(async (row) => {
        console.log("row-->",row)
        const codesArray = row['Location code'];
        let dataTobesend = {
        StudentToBeCharged:row['Sarthi/Website Price'],
        PhysicianToBePaid:row['Physician Price'],
        };
        let emaillist=row['Mail Small'];
         let dataTobesendLet = {
         email:row['Mail Small'],
         namesmall:row['Name Small'],
         name:row['Name Small'],
         createdAt:Timestamp.fromDate(new Date()),
         updatedAt:Timestamp.fromDate(new Date()),
         };
         /* let dataTobesend = {
            DoctorInfo: {
              adminName: row['Admin name\n(no repeats)'],
              doctorName: row['Doctor Name\n(no repeats)'],
              contact: row['Contact'],
              representingName: row['1 Name to Represent'],
              representingEmail: row['1 Email to represent'],
              locationCodes: {}
            }
          };
			
          const codesArray = row['All Codes'].replace(/\n/g, '').split(',');
          codesArray.forEach((code) => {
            const trimmedCode = code.trim();
            dataTobesend.DoctorInfo.locationCodes[trimmedCode] = trimmedCode;
          });

          // Firestore function call to update or create document
          await handleUpdateOrCreateByField(
            "RotationDoctors",
            'representingEmail',
            dataTobesend.DoctorInfo.representingEmail,
            dataTobesend
          );*/
          /*await handleUpdateOrCreateByField(
            "Rotations",
            'location_code',
            codesArray,
            dataTobesend
          );*/
         /* await handleUpdateOrCreateByField(
            "Rotations",
            'location_code',
            codesArray,
            dataTobesend
          );*/
         /* await handleUpdateOrCreateByField(
            "Panelists",
            'email',
            emaillist,
            dataTobesendLet
          );*/
          console.log("dataTobesend---->",dataTobesendLet)
     
          return dataTobesendLet;
        })
      );

      setExcelData(processedData);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <h2>Import Excel File in React</h2>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      
      <div>
        <h3>Excel Data:</h3>
        <pre>{JSON.stringify(excelData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default ImportExcel;