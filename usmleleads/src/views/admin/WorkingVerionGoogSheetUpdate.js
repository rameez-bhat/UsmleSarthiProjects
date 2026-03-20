import React, { useEffect, useState } from 'react';
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
import { useLoading } from '../../layout/LoadingContext';
const CLIENT_ID=import.meta.env.VITE_APP_CLIENT_ID;
const ClientSecret=import.meta.env.VITE_APP_CLIENT_SECRET;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const GoogleSheetTable = () => {
  const [tableData, setTableData] = useState([]);
  const [formulasData, setFormulasData] = useState([]);
  const [mergedRanges, setMergedRanges] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [errors, setErrors] = useState({});
  const { showLoading, hideLoading, sheetID, sheetName, API_KEY } = useLoading();
  const headerRowCount = 4;
  const FirstFewColumnToIgnore=4
  const AllowedRowValue = ['SPREDU0045', 'SPREDU0042'];
  const [token, setToken] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('googleAuthToken'));
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
		/*window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        console.log("response.access_token--->",response.access_token)
        localStorage.setItem('accessToken', response.access_token);
        setAccessToken(response.access_token);
      },
    });*/
 console.log("accessToken---->",accessToken)
        const sheetResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?includeGridData=true&key=${API_KEY}`
        );

        const sheetInfo = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName);

        const rows = sheetInfo.data[0].rowData.map(row => row.values.map(cell => cell.formulaValue || cell.formattedValue || ''));
        const formulas = sheetInfo.data[0].rowData.map(row => row.values.map(cell => cell?.userEnteredValue?.formulaValue || ''));
        const mergedRanges = sheetInfo.merges || [];

        setTableData(rows);  // Original table data
        setFormulasData(formulas);
        setMergedRanges(mergedRanges);

        const initialEditedRows = rows.map((row, rowIndex) => {
          return row.reduce((acc, cell, cellIndex) => {
            acc[cellIndex] = cell;
            return acc;
          }, {});
        });
        setEditedRows(initialEditedRows);

        hideLoading();
      } catch (error) {
        console.error("Error fetching Google Sheet data:", error);
        hideLoading();
      }
    };

fetchData();
  }, [sheetID, sheetName, API_KEY]);
const handleClientLoad = () => {
  return new Promise((resolve, reject) => {
    try {
      // Initialize the token client to request access token
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            console.error('Error authenticating:', response.error);
            reject('Authentication failed');
            return;
          }

          // Set access token and save it in localStorage
          setAccessToken(response.access_token);
          console.log('User authenticated:', response);
          localStorage.setItem('accessToken', response.access_token);

          // Resolve the promise after authentication
          resolve(response.access_token);
        },
      });

      // Request the access token
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Error during client load:', error);
      reject('Error during client load');
    }
  });
};




/*const handleClientLoad = async () => {
const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        setAccessToken(response.access_token);
        console.log('User authenticated:', response);
        localStorage.setItem('accessToken', response.access_token);
        return true;
      },
    });
    return tokenClient.requestAccessToken();

  };*/


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
console.log("originalRowIndex---->",originalRowIndex)
console.log("cellIndex---->",cellIndex)
console.log("value---->",value)
    // Update the corresponding formula cells dynamically
    const updatedFormulasRow = formulasData[originalRowIndex];
    console.log("updatedFormulasRow---->",updatedFormulasRow)
    if (updatedFormulasRow) {
      updatedFormulasRow.forEach((formula, formulaIndex) => {

        if (formula) {
        console.log("formula---->",formula)
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
            console.log("expression---->",expression)
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
                        value={editedRows[originalRowIndex]?.[cellIndex] || cell || ''}
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
 const handleSubmitUpdates = async () => {
  try {
    showLoading();
      if(typeof accessToken==="undefined" || accessToken===null || accessToken==='')
      {
         const Authentication=await handleClientLoad();
      }

    // Filter only the allowed rows for updates
    const filteredRows = Object.entries(editedRows)
      .filter(([rowIndex]) => AllowedRowValue.includes(tableData[parseInt(rowIndex)][1]))
      .map(([rowIndex, updatedCells]) => {

        const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
          const isFormulaCell = formulasData[rowIndex]?.[cellIndex];
          return isFormulaCell ? cell : updatedCells[cellIndex] || cell;
        });

        return { rowIndex: parseInt(rowIndex), updatedRow };
      });

    const requests = filteredRows.map(({ rowIndex, updatedRow }) => {
      const filteredRow = updatedRow.map((cell, cellIndex) => {
    if (cellIndex < FirstFewColumnToIgnore) {
        return null;
    }

    if (formulasData[rowIndex]?.[cellIndex]) {
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
    }).filter(request => request !== null); // Filter out null requests
	const DataToSend= requests.filter(req => req.values[0].length > 0);
    const data = {
      data: requests.filter(req => req.values[0].length > 0), // Only send rows that have updates
      valueInputOption: 'USER_ENTERED',  // Keeps formulas intact
    };
	console.log("requests----->", requests);
    console.log("data----->", data);
    //let rangdd=requests[0].range;
    //const body = {values:requests[0].values};
    // `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${rangdd}?valueInputOption=USER_ENTERED`

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      console.log('Sheet updated:', result);
    } catch (error) {
      console.error('Error updating sheet:', error);
    }

    // Uncomment this to actually send the data once confirmed
    /* const ResultUpdate=await axios.post(
       `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values:batchUpdate?key=${API_KEY}`,
      data
     );*/
	/*const body = {
      values: requests[0].values[0],
    };
try {
      const response = await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetID,
        range: requests[0].range,
        valueInputOption: 'USER_ENTERED', // This means the values will be parsed as if the user typed them into the UI
        resource: body,
      });
      console.log('Sheet updated:', response);
    } catch (error) {
      console.error('Error updating sheet:', error);
    }*/
//console.log("ResultUpdate----->", ResultUpdate);
    hideLoading();
    alert("Data successfully updated!");
  } catch (error) {
    console.error("Error submitting updates:", error);
    hideLoading();
    setErrors({ status: "error", submissionMessage: "Failed to update data!" });
  }
};





  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Leads</strong>
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
          <CButton color="primary" onClick={handleSubmitUpdates}>Submit Updates</CButton>
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
