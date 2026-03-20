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
  CFormLabel,
  CFormInput,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
const DatabaseName="LeadTracker";
import Research from "./ChangePassowrd";
const GoogleSheetTable = () => {
  const [tableData, setTableData] = useState([]);
  const [errors, seterrors] = useState(false)
  const [mergedRanges, setMergedRanges] = useState([]);
  const { showLoading, hideLoading,firestoreQueries,sheetID,sheetName,API_KEY } = useLoading();
  const headerRowCount = 4;
  const informationToBeFilledFrom = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the values from the specified sheet
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${API_KEY}`
        );
        console.log("response=====>",response)
        const sheetResponse = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${API_KEY}`);
        const rows = response.data.values;

        // Fetch merged ranges
        const sheetInfo = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName);
        const mergedRanges = sheetInfo ? sheetInfo.merges || [] : [];
		    console.log("mergedRanges=====>",sheetResponse)
        setTableData(rows);
        setMergedRanges(mergedRanges);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [sheetID, sheetName, API_KEY]);

  // Helper function to check if a cell is part of a merged range
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

    return { rowSpan: 1, colSpan: 1 }; // Default values when not merged
  };

const renderHeaders = () => {
  return (
    <>
      {Array.from({ length: headerRowCount }, (_, rowIndex) => {
        let skipColumns = 0; // Keep track of how many columns to skip
        return (
          <CTableRow key={rowIndex}>
            {tableData[rowIndex]?.map((headerCell, cellIndex) => {
              if (skipColumns > 0) {
                // If skipColumns is greater than 0, decrement and skip rendering this cell
                skipColumns--;
                return null;
              }

              const { rowSpan, colSpan } = getMergedCellSpan(rowIndex, cellIndex);

              // If colSpan is greater than 1, set the number of cells to skip
              if (colSpan > 1) {
                skipColumns = colSpan - 1; // We already rendered the current cell, so subtract 1
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
    return tableData.slice(headerRowCount).map((row, rowIndex) => (
      <CTableRow key={rowIndex}>
        {row.map((cell, cellIndex) => {
          const { rowSpan, colSpan } = getMergedCellSpan(rowIndex + headerRowCount, cellIndex);
          return (
            <CTableDataCell
              key={cellIndex}
              rowSpan={rowSpan}
              colSpan={colSpan}
            >
            {cellIndex>=informationToBeFilledFrom ?(<CCol md={12}>
                <CFormInput
                    type="text"
                    placeholder="First Name"
                    value={cell || ''}
                    invalid={!!errors.firstname} // Set `invalid` if there's an error
                    required
                    onChange={(event) => handleFormChange(event,'firstname' )}
                />
                {errors.firstname && (
                      <CFormFeedback invalid>{errors.firstname}</CFormFeedback>
                  )}
              </CCol>):(cell || '')}
            
              
            </CTableDataCell>
          );
        })}
      </CTableRow>
    ));
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
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default GoogleSheetTable;


