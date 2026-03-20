import React, { useEffect, useState } from 'react';
import { Link,useParams } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CFormInput,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CAlert,
} from '@coreui/react';
import axios from 'axios';
import { gapi } from "gapi-script";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useLoading } from '../../layout/LoadingContext';
const CLIENT_ID=import.meta.env.VITE_APP_CLIENT_ID;
const ClientSecret=import.meta.env.VITE_APP_CLIENT_SECRET;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const GoogleSheetTable = (ActualUser, AuthUser ) => {
  const [tableData, setTableData] = useState([]);
  const [formulasData, setFormulasData] = useState([]);
  const [mergedRanges, setMergedRanges] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [FormatedData, setFormatedData] = useState({});
  const [SubmittedData, setSubmittedData] = useState(false);
  const [FormatedDataProperties, setFormatedDataProperties] = useState({});
  const [errors, setErrors] = useState({});
  const { ddoid } = useParams();
  const { showLoading, hideLoading, API_KEY,DatabaseName,firestoreQueries } = useLoading();

  const [headerRowCount, setheaderRowCount] = useState(0);
  const [FirstFewColumnToIgnore, setFirstFewColumnToIgnore] = useState(0);
  const [AllowedRowValue, setAllowedRowValue] = useState([]);
  //let AllowedRowValue = ['SPREDU0045', 'SPREDU0042'];
  const [token, setToken] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('googleAuthToken'));
  const [accessToken, setAccessToken] = useState();
  //const [accessToken, setAccessToken] = useState(ActualUser.AuthUser.accessToken);
  const [sheetID, setsheetID] = useState('');
  const [sheetName, setsheetName] = useState('');
  useEffect(() => {

fetchData();
  }, []);
  const flattenRowData = (rowData) => {
  return rowData.map(row => row.values.map(cell => {
    return cell.formattedValue || ''; // Use formatted value or empty string if none
  }));
};
const selectAndFlattenRows = (sheetData, selectedRows) => {
  const selected = selectedRows.map(rowIndex => sheetData[rowIndex]);
  return flattenRowData(selected); // Flatten the data to array of arrays
};
 const selectSpecificRows = (sheetData, selectedRows) => {
  return selectedRows.map(rowIndex => {
    const row = sheetData[rowIndex].values; // Extract the cell values

  return row;
    //return row.map(cell => (cell.formattedValue ? cell.formattedValue : '')); // Ensure each cell contains a value
  });
};
 const selectSpecificRowsData = (sheetData, selectedRows) => {
  return selectedRows.map(rowIndex => {
    const row = sheetData[rowIndex].values; // Extract the cell values
    const transformedRows =Object.entries(editedRows[rowIndex]).map(([key, value])=>value)
    //return editedRows[rowIndex]?editedRows[rowIndex]:sheetData[rowIndex].values;
    //return row;
      return transformedRows;
    //return editedRows[rowIndex].map(cell => (cell.formattedValue ? cell.formattedValue : '')); // Ensure each cell contains a value
  });
};

function rgbToHex(r, g, b) {
    r = r !== undefined ? Math.floor(r * 255) : 255;
    g = g !== undefined ? Math.floor(g * 255) : 255;
    b = b !== undefined ? Math.floor(b * 255) : 255;

    const red = r.toString(16).padStart(2, '0');
    const green = g.toString(16).padStart(2, '0');
    const blue = b.toString(16).padStart(2, '0');
    return `${red}${green}${blue}`.toUpperCase();
}
const exportSelectedRowsToExcel = (googleSheetData, formatting, selectedRows) => {
  const selectedData = selectSpecificRows(googleSheetData, selectedRows);
  const selectedFormatting = selectSpecificRowsData(formatting, selectedRows);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(selectedFormatting);


  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Save the Excel file
  XLSX.writeFile(wb, "SelectedExport.xlsx");
};
  const exportToExcel = () => {

    let SelectRowsAre=[];
    let ToexportData=[];
    Array.from({ length: headerRowCount }, (_, rowIndex) => {
    ToexportData.push(tableData[rowIndex]);
    SelectRowsAre.push(rowIndex)
    })
     const filteredRows = Object.entries(editedRows)
      .filter(([rowIndex]) => AllowedRowValue.includes(tableData[parseInt(rowIndex)][1])) // Filter allowed rows
      .map(([rowIndex, updatedCells]) => {
        const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
          const formulaCell = formulasData[rowIndex]?.[cellIndex];
          return editedRows[rowIndex]?.[cellIndex]?editedRows[rowIndex]?.[cellIndex] : cell; // Send formula instead of value
        });

        return { rowIndex: parseInt(rowIndex), updatedRow };
      });

    // Prepare requests for batch update
    const requests = filteredRows.map(({ rowIndex, updatedRow }) => {
      // Filter out cells that should not be updated (ignored columns)
      const filteredRow = updatedRow.map((cell, cellIndex) => {
        /*if (cellIndex < FirstFewColumnToIgnore) {
          return null; // Ignore first few columns
        }*/
        return cell; // Keep the cell (formula or updated value)
      }).filter(cell => cell !== null); // Remove null values from the row

      // Get the range (column letters)
      const lastColIndex = updatedRow.length - 1;
      const colLetter = lastColIndex >= 0 ? getColumnLetter(lastColIndex) : null;
      const colLetterFirst = lastColIndex >= 0 ? getColumnLetter(FirstFewColumnToIgnore) : null;

      // If there's no valid column, skip this request
      if (!colLetter) return null;
      SelectRowsAre.push(rowIndex)
      // Return the update request for this row
      ToexportData.push(filteredRow)
      return filteredRow
    }).filter(request => request !== null); // Filter out null requests


  exportSelectedRowsToExcel(FormatedData,FormatedData,SelectRowsAre);
  };
const fetchData = async () => {
      try {
        showLoading();

    let expiryTimestamp;// Convert seconds to milliseconds
    const today = new Date();
        let GetUserData;
        if(typeof ddoid!=="undefined")
        {
           let  GetUserData1=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "uid", "==", ddoid);
            console.log("GetUserData---->",GetUserData)
            if(GetUserData1.length)
            {
              GetUserData=GetUserData1[0];
            }

        }
        else
        {
          GetUserData=ActualUser.ActualUser;
        }
       let  AllowedRowValue1 = Object.values(GetUserData.listoflinks);
       setAllowedRowValue(AllowedRowValue1)
        let sheetID1='';
        let sheetName1='';
        const SettingsGot=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 100, "sid", "==", 1);
        console.log("SettingsGot---->",SettingsGot)
        if(SettingsGot.length)
        {
          sheetID1=extractSheetID(SettingsGot[0].sheeturl);

          setsheetID(sheetID1);
          expiryTimestamp=new Date(SettingsGot[0].expiry.seconds * 1000);
          sheetName1=SettingsGot[0].sheetname;
          setsheetName(sheetName1)
          setheaderRowCount(SettingsGot[0].headerrows);
          setFirstFewColumnToIgnore(SettingsGot[0].labelcolumn);
          if(typeof SettingsGot[0].accesstoken)
          {
            setAccessToken(SettingsGot[0].accesstoken)
          }

        }
       if (expiryTimestamp > today)
       {
        try
        {
          const sheetResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID?sheetID:sheetID1}?includeGridData=true&key=${API_KEY}`
        );
        const sheetInfo = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName?sheetName:sheetName1);
        const rows = sheetInfo.data[0].rowData.map(row => row.values.map(cell => cell.formulaValue || cell.formattedValue || ''));
        const formulas = sheetInfo.data[0].rowData.map(row => row.values.map(cell => cell?.userEnteredValue?.formulaValue || ''));
        const mergedRanges = sheetInfo.merges || [];
        setFormatedData(sheetInfo.data[0].rowData)
        setTableData(rows);  // Original table data
        setFormulasData(formulas);
        setMergedRanges(mergedRanges);
        setFormatedDataProperties(sheetInfo.data);
        const initialEditedRows = rows.map((row, rowIndex) => {
          return row.reduce((acc, cell, cellIndex) => {
            acc[cellIndex] = cell;
            return acc;
          }, {});
        });
        setEditedRows(initialEditedRows);
        hideLoading();
        }
        catch(error)
        {
              console.log("error------>",error)
              if(typeof error.response!=="undefined")
              {
                  if(typeof error.response.data!=="undefined")
                  {
                      if(typeof error.response.data.code!==403)
                     {
                        setErrors({ status: "error", submissionMessage: "You Don't Have Permissions For The Data .Please Contact Accounts CEO Baramulla.!" });
                     }
                  }
              }
              hideLoading();
        }
      }
      else
      {
            setErrors({ status: "error", submissionMessage: "Date For Submission Is Over .Please Contact Accounts CEO Baramulla.!" });
             hideLoading();
      }



      } catch (error) {
        console.error("Error fetching Google Sheet data:", error);
        hideLoading();
      }
    };
const extractSheetID = (url) => {
  const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null; // If there's a match, return the sheetID; otherwise, return null
};





const evaluateExpression = (expression, rowValues) => {
  const tokens = expression.split(/([-+*/])/).map(token => token.trim()); // Split by operators

  const evaluatedTokens = tokens.map(token => {
    if (/^[A-Z]+\d+$/.test(token)) { // If it's a cell reference (e.g., E189)
      const colIndex = token.charCodeAt(0) - 65; // Convert letter to index
      return parseFloat(rowValues[colIndex]) || 0; // Get the value from editedRows
    }
    return token; // Return the operator as is
  });

  // Evaluate the expression
  let result = evaluatedTokens[0]; // Start with the first token
  for (let i = 1; i < evaluatedTokens.length; i += 2) {
    const operator = evaluatedTokens[i];
    const value = evaluatedTokens[i + 1];
    switch (operator) {
      case '+':
        result += value;
        break;
      case '-':
        result -= value;
        break;
      case '*':
        result *= value;
        break;
      case '/':
        result /= value;
        break;
      default:
        break;
    }
  }

  return result;
};
  const handleInputChange = (originalRowIndex, cellIndex, value) => {
    const updatedRows = {
      ...editedRows,
      [originalRowIndex]: {
        ...editedRows[originalRowIndex],
        [cellIndex]: value,
      },
    };

    // Update the corresponding formula cells dynamically
    const updatedFormulasRow = formulasData[originalRowIndex];
    setSubmittedData(false);
    if (updatedFormulasRow) {
      updatedFormulasRow.forEach((formula, formulaIndex) => {

        if (formula) {
          try {
            const rowValues = updatedRows[originalRowIndex];

            if (formula.includes("SUM")) {
            // Extract column indices from the formula (F189:H189)
            const matches = formula.match(/SUM\(([^)]+)\)/);
            if (matches) {
              const range = matches[1].split(':');
              const startCol = range[0].charCodeAt(0) - 65; // Convert letter to index
              const endCol = range[1].charCodeAt(0) - 65;

              // Sum the values from the specified columns only
              const cellValues = [];
              for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
                const cellValue = parseFloat(rowValues[colIndex]) || 0; // Use the original row data
                cellValues.push(cellValue);
              }
				console.log("cellValues---->",cellValues)
              // Calculate the sum
              const sum = cellValues.reduce((acc, val) => acc + val, 0);
              updatedRows[originalRowIndex][formulaIndex] = sum; // Update the formula cell with sum
            }

            }
            else if (/^=\w+\d+([-+*/]\w+\d+)+$/.test(formula)) { // Check for expressions like =E189-I189
            const expression = formula.slice(1); // Remove the '=' sign
            const evaluatedValue = evaluateExpression(expression, updatedRows[originalRowIndex]);
            updatedRows[originalRowIndex][formulaIndex] = evaluatedValue; // Update the formula cell with evaluated value
          }










            /*if (formula.includes("SUM") || formula.includes("AVERAGE")) {
              const cellValues = Object.values(rowValues).map(value => parseFloat(value) || 0);
              console.log("cellValues---->",cellValues)
              const sum = cellValues.reduce((acc, val) => acc + val, 0);
              updatedRows[originalRowIndex][formulaIndex] = sum; // Update the formula cell with sum
            }*/
          } catch (error) {
            console.error("Error updating formula:", error);
          }
        }
      });
    }
console.log("updatedRows---->",updatedRows)
    setEditedRows(updatedRows);  // Update state
  };
  const getMergedCellIndex = (rowIndex, cellIndex) => {
    const mergedRange = mergedRanges.find(range => {
      const startRow = range.startRowIndex;
      const endRow = range.endRowIndex;
      const startCol = range.startColumnIndex;
      const endCol = range.endColumnIndex;

      return (
        rowIndex >= startRow && rowIndex < endRow &&
        cellIndex >= startCol && cellIndex < endCol
      );
    });
  if (mergedRange) {
      return {
        endRowIndex: mergedRange.endRowIndex,
        startRowIndex:mergedRange.startRowIndex,
        endColumnIndex: mergedRange.endColumnIndex,
         startColumnIndex:mergedRange.startColumnIndex
      };
    }


    return { startRowIndex: -2, endRowIndex: -2, endColumnIndex: -2, startColumnIndex: -2};
  };
  const getMergedCellSpan = (rowIndex, cellIndex) => {
    const mergedRange = mergedRanges.find(range => {
      const startRow = range.startRowIndex;
      const endRow = range.endRowIndex;
      const startCol = range.startColumnIndex;
      const endCol = range.endColumnIndex;

      return (
        rowIndex >= startRow && rowIndex < endRow &&
        cellIndex >= startCol && cellIndex < endCol
      );
    });

    if (mergedRange) {
      return {
        rowSpan: mergedRange.endRowIndex - mergedRange.startRowIndex,
        colSpan: mergedRange.endColumnIndex - mergedRange.startColumnIndex,
      };
    }

    return { rowSpan: 1, colSpan: 1 };
  };

  const renderHeaders = () => {
    return (
      <>
        {Array.from({ length: headerRowCount }, (_, rowIndex) => {
          let skipColumns = 0;
          return (
            <CTableRow key={rowIndex}>
              {tableData[rowIndex]?.map((headerCell, cellIndex) => {
                if (skipColumns > 0) {
                  skipColumns--;
                  return null;
                }

                const { rowSpan, colSpan } = getMergedCellSpan(rowIndex, cellIndex);

                if (colSpan > 1) {
                  skipColumns = colSpan - 1;
                }

                return (
                  <CTableHeaderCell
                    key={cellIndex}
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                  >
                    {headerCell || ''}
                  </CTableHeaderCell>
                );
              })}
            </CTableRow>
          );
        })}
      </>
    );
  };

  const renderTableBody = () => {
  console.log("AllowedRowValue---->",AllowedRowValue)
    return tableData
      .map((row, originalRowIndex) => {
        if (!AllowedRowValue.includes(row[1])) return null;
        return (
          <CTableRow key={originalRowIndex}>
            {row.map((cell, cellIndex) => {
              const { rowSpan, colSpan } = getMergedCellSpan(originalRowIndex , cellIndex);
              const isFormulaCell = !!formulasData[originalRowIndex ]?.[cellIndex];

              return (
                <CTableDataCell
                	rownumber={originalRowIndex}
                	columnnumber={cellIndex}
                  key={cellIndex}
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                >
                  {cellIndex >= FirstFewColumnToIgnore ? (
                    isFormulaCell ? (
                      <span>{roundToTwoDecimalPlaces(editedRows[originalRowIndex]?.[cellIndex]) || cell}</span> // Show formula cells as non-editable
                    ) : (
                      <CFormInput
                        type="text"
                        vakklue={editedRows[originalRowIndex]?.[cellIndex] }
                        value={editedRows[originalRowIndex]?.[cellIndex]}
                        invalid={!!errors[originalRowIndex]}
                        onChange={(e) => handleInputChange(originalRowIndex, cellIndex, e.target.value)}
                      />
                    )
                  ) : (
                    cell || ''
                  )}
                </CTableDataCell>
              );
            })}
          </CTableRow>
        );
      });
  };
const roundToTwoDecimalPlaces = (num) => {
  const number = parseFloat(num); // Convert to a float number
  if (isNaN(number)) {
    return 0; // Return 0 or handle the error appropriately if num is not a valid number
  }
  return parseFloat(number.toFixed(3)); // Round to 2 decimal places
};
const getColumnLetter = (colIndex) => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};
async function updateSheet(range,values) {
  try {
    const request = {
      spreadsheetId: sheetID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [
          values
        ],
      },
    };
    const response = await sheets.spreadsheets.values.update(request);
    console.log('cells updated----->',response);
    console.log(`${response.data.updatedCells} cells updated.`);
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
}
const updateGoogleSheet = async (range,valuesF) => {
  try {
    const response = await fetch(" https://updategooglesheet-f6dijyh4qq-uc.a.run.app ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId: sheetID,
        range: range,
        values: valuesF,
      }),
    });

    const result = await response.json();
    return result;
    //console.log(`${result.updatedCells} cells updated.`);
  } catch (error) {
    return error;
  }
};
const handleSubmitUpdates = async () => {
  try {
    showLoading();
   const filteredRows = Object.entries(editedRows)
      .filter(([rowIndex]) => AllowedRowValue.includes(tableData[parseInt(rowIndex)][1])) // Filter allowed rows
      .map(([rowIndex, updatedCells]) => {
        const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
          const formulaCell = formulasData[rowIndex]?.[cellIndex];
          return formulaCell ? formulaCell : updatedCells[cellIndex] || cell; // Send formula instead of value
        });

        return { rowIndex: parseInt(rowIndex), updatedRow };
      });


    const requests = filteredRows.map(({ rowIndex, updatedRow }) => {

      const filteredRow = updatedRow.map((cell, cellIndex) => {
        if (cellIndex < FirstFewColumnToIgnore) {
          return null;
        }
        return cell;
      }).filter(cell => cell !== null);


      const lastColIndex = updatedRow.length - 1;
      const colLetter = lastColIndex >= 0 ? getColumnLetter(lastColIndex) : null;
      const colLetterFirst = lastColIndex >= 0 ? getColumnLetter(FirstFewColumnToIgnore) : null;

      if (!colLetter) return null;


      return {
        range: `${sheetName}!${colLetterFirst}${rowIndex + 1}:${colLetter}${rowIndex + 1}`,
        values: [filteredRow],
      };
    }).filter(request => request !== null);

    const dataToSend = requests.filter(req => req.values[0].length > 0);
    console.log("dataToSend---->",dataToSend)
    const res= await updateGoogleSheet(dataToSend[0].range,dataToSend[0].values)
    console.log("res---->",res)
    if(res.status==="success")
    {
      setSubmittedData(true);
      setErrors({ status: "success", submissionMessage: "Successfully Updated!" });
    }
    else
    {
      setErrors({ status: "error", submissionMessage: "Please Submit Again As It Was Not Saved!" });
    }
    hideLoading();
  } catch (error) {
    console.error("Error submitting updates:", error);
    hideLoading();
    setErrors({ status: "error", submissionMessage: "Failed to update data!" });
  }
};
;






  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Add Data</strong>
        </CCardHeader>
        <CCardBody className="overfolowscroll">
          <CTable color="success" bordered>
            <CTableHead>
              {renderHeaders()}
            </CTableHead>
            <CTableBody>
              {renderTableBody()}
            </CTableBody>
          </CTable>
          <CCol md={12} className="posRel">
          <CCol md={2}>
          <CButton color="primary" className="ButtonFloat" onClick={handleSubmitUpdates}>Update</CButton>
           </CCol>
           {SubmittedData && (
            <CCol md={2}>
          <CButton color="primary" className="ButtonFloat1" onClick={exportToExcel}>Export</CButton>
          </CCol>
          )}
          </CCol>
          {errors.status && (
            <CAlert color={errors.status === "error" ? "danger" : "success"}>
              <strong>{errors.submissionMessage}</strong>
            </CAlert>
          )}

        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default GoogleSheetTable;
