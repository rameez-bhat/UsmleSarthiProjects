import React from "react";
import dayjs from "dayjs";
import { MenuItem, Select, FormControl, TableRow, TableCell } from "@mui/material";

const RotationRow = ({
  rotation,
  DoctorsDetails,
  LocationCodeDoctorsName,
  CurrentData,
  HandleCheckPointChange,
}) => {

  return (
    <>
      <TableCell sx={{ border: "1px solid black" }} width={120}>S{rotation.StudentUniqueId}</TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={200}>{rotation.displayName}</TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={260}>
        <a
          href={`/admin/userdetails/${rotation.uid}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "4px 10px",
            backgroundColor: "#af4cab",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {rotation.email}
        </a>
      </TableCell>

 <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.EnrollmentDate
          ? dayjs(rotation.EnrollmentDate.toDate()).format("MM/DD/YYYY")
          : "-"}
      </TableCell>
       <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.EnrollmentAdminInTouch?.label}
      </TableCell>
       <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.LocationCode}
      </TableCell>
      <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.StartDate
          ? dayjs(rotation.StartDate.toDate()).format("MM/DD/YYYY")
          : "-"}
      </TableCell>

     

      <TableCell sx={{ border: "1px solid black" }} width={140}>{rotation.ContractStatus}</TableCell>
       <TableCell sx={{ border: "1px solid black" }} width={140}>{rotation?.RotationPaymentStatus}</TableCell>
 <TableCell sx={{ border: "1px solid black" }} width={200}>
        <FormControl fullWidth>
          <Select
            value={
              CurrentData?.PhysicianCheckPoint?.[rotation.uid]?.[rotation.RotationKey] ??
              rotation.PhysicianCheckPoint ??
              ""
            }
            onChange={(e) =>
              HandleCheckPointChange(e, "PhysicianCheckPoint", rotation.uid, rotation.RotationKey)
            }
          >
            <MenuItem value="">-Select-</MenuItem>
            <MenuItem value="Not sent">Not sent</MenuItem>
            <MenuItem value="Waiting on Physician">Waiting on Physician</MenuItem>
            <MenuItem value="Confirmed with Physician">Confirmed with Physician</MenuItem>
            <MenuItem value="Rescheduled">Rescheduled</MenuItem>
          </Select>
        </FormControl>
      </TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={200}>
        <FormControl fullWidth>
          <Select
            value={
              CurrentData?.StudentCheckPoint?.[rotation.uid]?.[rotation.RotationKey] ??
              rotation.StudentCheckPoint ??
              ""
            }
            onChange={(e) =>
              HandleCheckPointChange(e, "StudentCheckPoint", rotation.uid, rotation.RotationKey)
            }
          >
            <MenuItem value="">-Select-</MenuItem>
            <MenuItem value="Not sent">Not sent</MenuItem>
            <MenuItem value="Waiting on Student">Waiting on Student</MenuItem>
            <MenuItem value="Confirmed with Student">Confirmed with Student</MenuItem>
            <MenuItem value="Rescheduled">Rescheduled</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
<TableCell sx={{ border: "1px solid black" }} width={240}>{rotation?.RotationStatus}</TableCell>

    
    </>
  );
};

export default React.memo(RotationRow);
