import React, { useMemo, useRef, useEffect, forwardRef } from "react";
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
const TABLE_WIDTH = columns.reduce((t, c) => t + c.width, 0);
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
const topScrollRef = useRef(null);
const tableContainerRef = useRef(null);
useEffect(() => {
  const top = topScrollRef.current;
  const body = tableContainerRef.current;

  if (!top || !body) return;

  const topHandler = () => {
    body.scrollLeft = top.scrollLeft;
  };

  const bodyHandler = () => {
    top.scrollLeft = body.scrollLeft;
  };

  top.addEventListener("scroll", topHandler);
  body.addEventListener("scroll", bodyHandler);

  return () => {
    top.removeEventListener("scroll", topHandler);
    body.removeEventListener("scroll", bodyHandler);
  };
}, []);
  const itemContent = useMemo(
    () => (index) => {
      const rotation = sortedData[index];
     
      return (
        <RotationRow
         key={`${rotation.uid}--${rotation.RotationKey}`}
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
const Scroller = forwardRef((props, ref) => (
  <div
    {...props}
    ref={(el) => {
      if (el) {
        console.log("Scroller", el);
        console.log("scrollWidth", el.scrollWidth);
        console.log("clientWidth", el.clientWidth);
        console.log("children", el.children);
        
      }

      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    }}
  />
));

  return (
    <Box>
    <Box ref={topScrollRef}
  sx={{
    overflowX: "auto",
    overflowY: "hidden",
    height: 18,
    mb: 1,
  }}
  onScroll={(e) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = e.target.scrollLeft;
    }
  }}
>
  <div style={{ width: TABLE_WIDTH, height: 1 }} />
</Box>

<Box
  ref={tableContainerRef}
  sx={{
    height: containerHeight,
    overflow: "auto",
  }}
  onScroll={(e) => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  }}
>
  <Table
    stickyHeader
    sx={{
      minWidth: TABLE_WIDTH,
      tableLayout: "fixed",
    }}
  >
    <TableHead>
      <TableRow>
        {columns.map((col) => (
          <TableCell
            key={col.key}
            onClick={() => requestSort(col.key)}
            sx={{
              width: col.width,
              minWidth: col.width,
              maxWidth: col.width,
              fontWeight: "bold",
              cursor: "pointer",
              border: "1px solid black",
              backgroundColor: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {col.label} <SortIndicator columnKey={col.key} />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>

    <TableBody>
      {sortedData.map((rotation) => (
         <TableRow  key={rotation.id || rotation.uid}>
        <RotationRow
          key={`${rotation.uid}-${rotation.RotationKey}`}
          rotation={rotation}
          DoctorsDetails={DoctorsDetails}
          LocationCodeDoctorsName={LocationCodeDoctorsName}
          CurrentData={CurrentData}
          HandleCheckPointChange={HandleCheckPointChange}
        />
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Box>
      </Box>
  );
};

export default RotationTable;
