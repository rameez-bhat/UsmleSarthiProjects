import React, { useMemo } from "react";
import { TableVirtuoso } from "react-virtuoso";
import RotationRow from "./RotationRow";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";

const columns = [
  { key: "StudentUniqueId", label: "Student ID", width: 120 },
  { key: "displayName", label: "Name", width: 200 },
  { key: "email", label: "Email", width: 260 },
  { key: "phoneNumber", label: "Phone", width: 160 },
  { key: "StartDate", label: "Rotation Start Date", width: 150 },
  { key: "EnrollmentDate", label: "Enrollment Date", width: 150 },
  { key: "ContractStatus", label: "Contract Status", width: 140 },
  { key: "ContractSignedDate", label: "Contract Signed Date", width: 150 },
  { key: "VisaLetterStatus", label: "Visa Letter Status", width: 140 },
  { key: "LocationCode", label: "Location Code", width: 240 },
  { key: "RotationVisa", label: "Visa", width: 240 },
  { key: "HousingCode", label: "Housing Code", width: 240 },
  { key: "RotationStatus", label: "Rotation Status", width: 240 },
  { key: "RotationReview", label: "Rotation Review", width: 180 },
  { key: "PhysicianCheckPoint", label: "Physician CP", width: 200 },
  { key: "StudentCheckPoint", label: "Student CP", width: 200 },
  { key: "EnrollmentAdminInTouch", label: "Enrollment Admin", width: 200 },
];

const RotationTable = ({
  sortedData = [],
  DoctorsDetails = null,
  LocationCodeDoctorsName = {},
  CurrentData = {},
  HandleCheckPointChange,
  sortConfig,
  requestSort,
  containerHeight = 700,
}) => {

  const itemContent = useMemo(
    () => (index) => {
      const rotation = sortedData[index];
      return (
        <RotationRow
          rotation={rotation}
          DoctorsDetails={DoctorsDetails}
          LocationCodeDoctorsName={LocationCodeDoctorsName}
          CurrentData={CurrentData}
          HandleCheckPointChange={HandleCheckPointChange}
        />
      );
    },
    [sortedData, DoctorsDetails, LocationCodeDoctorsName, CurrentData, HandleCheckPointChange]
  );

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === "ascending" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  return (
    <Box sx={{ height: containerHeight, width: "100%" }}>
      <TableVirtuoso
        data={sortedData}
        fixedHeaderContent={() => (
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{ border: "1px solid black" }}
                onClick={() => requestSort(col.key)}
                style={{ width: col.width, fontWeight: "bold", cursor: "pointer" }}
              >
                {col.label} <SortIndicator columnKey={col.key} />
              </TableCell>
            ))}
          </TableRow>
        )}
        itemContent={(index) => (
          <RotationRow
            rotation={sortedData[index]}
            DoctorsDetails={DoctorsDetails}
            LocationCodeDoctorsName={LocationCodeDoctorsName}
            CurrentData={CurrentData}
            HandleCheckPointChange={HandleCheckPointChange}
          />
        )}
        components={{
          Table: (props) => <Table {...props} stickyHeader />,
          TableHead,
          TableRow,
          TableCell,
          TableBody,
        }}
      />
    </Box>
  );
};

export default RotationTable;
