import React from "react";
import { TableVirtuoso } from "react-virtuoso";
import RotationRow from "./RotationRowReport";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";

const columns = [
  { key: "StudentUniqueId", label: "Student ID", width: 120 },
  { key: "displayName", label: "Name", width: 200 },
  { key: "email", label: "Email", width: 260 },
  { key: "EnrollmentAdminInTouch", label: "Enrollment Admin", width: 200 },
  { key: "EnrollmentDate", label: "Enrollment Date", width: 150 },
  { key: "LocationCode", label: "Location Code", width: 240 },
  { key: "StartDate", label: "Rotation Start Date", width: 150 },
  { key: "ContractStatus", label: "Contract Status", width: 140 },
  { key: "RotationPaymentStatus", label: "Rotation Payment Status", width: 180 },
  { key: "PhysicianCheckPoint", label: "Physician CP", width: 200 },
  { key: "StudentCheckPoint", label: "Student CP", width: 200 },
  { key: "RotationStatus", label: "Rotation Status", width: 240 },
];

const TOTAL_WIDTH = columns.reduce(
  (sum, col) => sum + col.width,
  0
);

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
const Scroller = React.forwardRef((props, ref) => (
  <div
    {...props}
    ref={ref}
    style={{
      ...props.style,
      overflowX: "auto",
      overflowY: "auto",
    }}
  />
));
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) return null;

    return sortConfig.direction === "ascending" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        border: "1px solid #ddd",
      }}
    >

        <Box
  sx={{
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
  }}
>
            <TableVirtuoso
          style={{
            height: containerHeight,
            width: "100%",
          }}
          data={sortedData}
          fixedHeaderContent={() => (
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  sx={{
                    minWidth: col.width,
                    width: col.width,
                    maxWidth: col.width,
                    border: "1px solid black",
                    fontWeight: "bold",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    backgroundColor: "#fff",
                  }}
                >
                  {col.label}
                  <SortIndicator columnKey={col.key} />
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
            Table: (props) => (
              <Table
                {...props}
                stickyHeader
                sx={{
                  tableLayout: "fixed",
                  width: TOTAL_WIDTH,
                  minWidth: TOTAL_WIDTH,
                }}
              />
            ),
            TableHead,
            TableRow,
            TableCell,
            TableBody,
          }}
        />
      </Box>
    </Box>
  );
};

export default RotationTable;