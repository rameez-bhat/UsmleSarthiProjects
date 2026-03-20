import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';

function ImportExcel  () {
  const [excelData, setExcelData] = useState([]);
  const { showLoading, hideLoading, allCountries, CountryOption, firestoreQueries, DatabaseName } = useLoading();

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
          // Create local copies for each row to avoid overwriting
          let StudentEmailNormal = row['REALEMAIL'];
          let password = row['DDO CODE'] + "@12";
          let StudentNameNormal = row['DDO NAME'];
          let ddocode = row['DDO CODE'];

          let dataTobesend = {
            ddocode: row['DDO CODE'],
            name: row['DDO NAME'],
            email: row['REALEMAIL'],
            zone: row['ZONE'],
            role: "DDO",
            listoflinks: { [ddocode]: ddocode },
          };

          try {
            // Post request to create a new user
            const response = await axios.post('https://us-central1-ceoaccountsbla.cloudfunctions.net/createUser', { StudentEmail: StudentEmailNormal, password, StudentName: StudentNameNormal });
            console.log("Success---->", response);

            let uid = response.data.data.uid; // Get the generated uid
            dataTobesend['uid'] = uid;

            // Update Firestore with user data
            await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
          } catch (error) {
            // Handle existing user case
            let uid = error.response?.data?.user?.uid; // Use optional chaining to handle cases without a uid
            console.error("User creation error:", error);
            console.log("uid====>",uid)
            dataTobesend['uid'] = uid;
            // Add link for existing user
            if (uid) {
              let updateData = { listoflinks: { [ddocode]: ddocode } };
              let res12=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
              console.log("res12====>",res12)
            }
          }

          // Return processed data (for visualization or other use)
          return dataTobesend;
        })
      );

      setExcelData(processedData); // Store processed data in state
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
