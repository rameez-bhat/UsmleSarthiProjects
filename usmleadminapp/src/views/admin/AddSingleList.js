import React, { useEffect,useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
} from "@coreui/react";

import { useLoading } from "../../layout/LoadingContext";

const REQUIRED_FIELDS = [
  "programName",
  "city",
  "state",
  "frieda",
];

export default function AddSingleProgram() {
  const {
    handleUpdate,
    handleAdd,
    FetchDataFromCollection,
    Timestamp,
    TooltipsPopovers,
    showLoading, hideLoading,
    getMaxStudentUniqueId,
  } = useLoading();

  const [form, setForm] = useState({
    speciality: "",
    programName: "",
    city: "",
    state: "",
    frieda: "",
    programType: "",

  });

  const [errors, setErrors] = useState({});
  const [programList, setProgramList] = useState([]);
const [selectedSpeciality, setSelectedSpeciality] = useState("");
const [isOther, setIsOther] = useState(false);
  useEffect(() => {
    fetchprogramlist();

  }, []);
	const fetchprogramlist = async () => {
	
	const list=await FetchDataFromCollection(
        "Program",
        1000
      );
      console.log("list---->",list)
      const formatted = list
    .filter((item) => item.PName) // remove empty ones
    .map((item) => ({
      label: item.PName,
      value: item.PName,
    }));

  setProgramList(formatted);
	}
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    let temp = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field]) temp[field] = "Required";
    });
     console.log("temp--->",temp)
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
  showLoading()
    if (!validate()) {
    console.log("errors--->",errors)
    hideLoading()
      TooltipsPopovers("error", "Please fill required fields", "Error");
      return;
    }

    try {
      // 1. PROGRAM
      let maxId = await getMaxStudentUniqueId("Program", "PIdN");
      let nextId = maxId + 1;
      let programRes = await FetchDataFromCollection(
        "Program",
        1,
        "PName",
        "==",
        form.speciality,
        0
      );

      let PId;

      if (programRes.length) {
        PId = programRes[0].PId;
      } else {
        PId = String(nextId);
        await handleUpdate("Program", PId, {
          PId,
          PIdN: nextId,
          PName: form.speciality,
        });
      }

      // 2. HOSPITAL
      let hospitalRes = await FetchDataFromCollection(
        "Hospital",
        1,
        "HName",
        "==",
        form.programName,
        0
      );

      let HId;

      if (hospitalRes.length) {
        HId = hospitalRes[0].id;
      } else {
        let res = await handleAdd("Hospital", {
          HName: form.programName,
          City: form.city,
          State: form.state,
          PIds: [PId],
          createdAt: Timestamp.fromDate(new Date()),
        });
        HId = res[0].id;
      }

      const HPId = `${HId}_${PId}`;

      // 3. HOSPITAL PROGRAM
      await handleUpdate("HospitalProgram", HPId, {
        HId,
        PId,
        HPId,
      });

      // 4. HOSPITAL PROGRAM INFO
      await handleUpdate("HospitalProgramInfo", HPId, {
        HId,
        PId,
        HPId,
        Frieda: form.frieda,
        Verified: "Yes",
        TimeStamp: Date.now(),
      });

      TooltipsPopovers("success", "Program Added Successfully", "Success");

      setForm({
        speciality: "",
        programName: "",
        city: "",
        state: "",
        frieda: ""
      });
    } catch (err) {
      console.error(err);
      TooltipsPopovers("error", "Something went wrong", "Error");
    }
    hideLoading()
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Add Single Program</strong>
          </CCardHeader>

          <CCardBody>
            <CForm className="row g-3">

              <CCol md={4}>
  <CFormSelect
    label="Speciality *"
    value={selectedSpeciality}
    onChange={(e) => {
      const value = e.target.value;
      setSelectedSpeciality(value);

      if (value === "OTHER") {
        setIsOther(true);
        handleChange("speciality", "");
      } else {
        setIsOther(false);
        handleChange("speciality", value);
      }
    }}
  >
    <option value="">Select Speciality</option>

    {programList.map((item, index) => (
      <option key={index} value={item.value}>
        {item.label}
      </option>
    ))}

    <option value="OTHER">Other</option>
  </CFormSelect>
</CCol>
{isOther && (
  <CCol md={4}>
    <CFormInput
      label="Enter New Speciality"
      value={form.speciality}
      onChange={(e) => handleChange("speciality", e.target.value)}
    />
  </CCol>
)}

              <CCol md={4}>
                <CFormInput
                  label="Program Name *"
                  value={form.programName}
                  onChange={(e) => handleChange("programName", e.target.value)}
                  invalid={!!errors.programName}
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  label="City *"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  label="State *"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  label="FREIDA ID *"
                  value={form.frieda}
                  onChange={(e) => handleChange("frieda", e.target.value)}
                />
              </CCol>


              <CCol xs={12}>
                <CButton color="primary" onClick={handleSubmit}>
                  Submit Program
                </CButton>
              </CCol>

            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}