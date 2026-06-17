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
console.log("rotation===>",rotation)
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

      <TableCell sx={{ border: "1px solid black" }} width={160}>
        {rotation.phoneCode}
        {rotation.phoneNumber}
      </TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.StartDate
          ? dayjs(rotation.StartDate.toDate()).format("MM/DD/YYYY")
          : "-"}
      </TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.EnrollmentDate
          ? dayjs(rotation.EnrollmentDate.toDate()).format("MM/DD/YYYY")
          : "-"}
      </TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={140}>{rotation.ContractStatus}</TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={150}>
        {rotation.ContractSignedDate
          ? dayjs(rotation.ContractSignedDate.toDate()).format("MM/DD/YYYY")
          : "-"}
      </TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={140}>{rotation.VisaLetterStatus}</TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={240}>
        ({DoctorsDetails?.[LocationCodeDoctorsName[rotation.LocationCode]]?.DoctorInfo?.representingName || ""})
        {" "}{rotation.LocationCode}
      </TableCell>
       <TableCell sx={{ border: "1px solid black" }} width={240}>
                  <div key={rotation?.VisaLetterStatus} className="mb-2">
                  <table className="border border-gray-300 w-full text-sm rounded-lg overflow-hidden">
                  <tbody>
  {Object.entries(rotation?.RotationVisaSection || {}).map(([letterKey, letterObj], index) => (

     /* <h5 className="font-semibold">Letter{index +1}</h5>
      <div className="text-sm flex flex-wrap gap-4" style={{ display: "ruby-text" }} >
        <span style={{ marginRight: "15px" }}>
          <strong>Letter Type:</strong> {letterObj?.RotationVisa?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Acceptance Type:</strong> {letterObj?.AcceptanceLetter?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Status:</strong> {letterObj?.RotationVisaStatus?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
          <strong>Letter Status:</strong> {letterObj?.VisaLetterStatus?.label || "-"}
        </span>
        <span style={{ marginRight: "15px" }}>
  <strong>Letter Date:</strong> {formatUSDate(letterObj?.RotationVisaAmountDate)}
</span>
      </div>*/

                    <tr className="border-b" key={`${rotation.uid}-${rotation.RotationKey}-${letterKey}`}>
                      <th className="font-semibold p-2 w-1/3" style={{ border: "1px solid black", padding: "6px" }}>Letter{index +1}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.RotationVisa?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.VisaLetterType?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.RotationVisaStatus?.label || "-"}</th>
                      <th className="p-2" style={{ border: "1px solid black", padding: "6px" }}>{letterObj?.VisaLetterStatus?.label || "-"}</th>
                    </tr>

  ))}
   </tbody>
                    </table>
    </div>
</TableCell>
<TableCell sx={{ border: "1px solid black" }} width={240}>{rotation?.HousingCode}</TableCell>
<TableCell sx={{ border: "1px solid black" }} width={240}>{rotation?.RotationStatus}</TableCell>

      <TableCell sx={{ border: "1px solid black" }} width={180}>{rotation.RotationReview}</TableCell>

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
      <TableCell sx={{ border: "1px solid black" }} width={200}>{rotation?.EnrollmentAdminInTouch?.label}</TableCell>
    </>
  );
};

export default React.memo(RotationRow);
