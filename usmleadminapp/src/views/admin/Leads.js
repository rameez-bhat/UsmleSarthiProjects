import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import { useLoading } from '../../layout/LoadingContext';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from 'axios';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, CircularProgress,Select, MenuItem, FormControl, InputLabel ,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import { CrystalButton } from '../../components/css/CustomStyles';
import  '../../components/css/style.css';
let LastDocVar=null;
let AllServices=[];
const PaginatedTable = (ActualUser, AuthUser ) => {
AuthUser=ActualUser.AuthUser;
ActualUser=ActualUser.ActualUser;
console.log("PaginatedTable====>")
const { loadingAuth,setloadingAuth} = useState(null);
const { LoggedInuser,setLoggedInuser } = useState(ActualUser);
 const { getjointabledata,addOrUpdateDocIds,updateAllHospitalProgramInfoDocs,showLoading, hideLoading,copyFieldToAnotherCollection,DeleteDocumentWhere,deletedocumentfromid,SelectWithComplexConditions, API_KEY,DatabaseName,Timestamp, updateOrAddFieldInCollection,SelectWithWhereAnd,fetchPaginatedDataWithJoin,fetchTotalRecordsCount,fetchAdminDataWithJoin,handleUpdate,copyCollection } = useLoading();
  const [data, setData] = useState([]);
  let [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [page, setPage] = useState(1);
	const [open, setOpen] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const pageSize = 100; // Number of entries per page
	const mainCollectionName = 'UsersRoles';
  const joinCollectionName = 'Users';
  const [filters, setFilters] = useState({ id: '', name: '' });
  const [filterField, setFilterField] = useState('Role');
  const [filterCondition, setFilterCondition] = useState('==');
  const [filterValue, setFilterValue] = useState(['Default','Silver']);
  const [idOptions, setIdOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [adminOptions, setAdminOptions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [LeadSelectValue, setLeadSelectSelectedValue] = useState(null);
  const [AgentSelectValue, setAgentSelectSelectedValue] = useState(null);

   const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => {
  console.log("PaginatedTable USE====>")
	loadData();
    loadTotalRecords();
    loadFilterOptions();
  },[]);


  // Toggle function for the date picker visibility
  const togglePicker = () => {
    setShowPicker(!showPicker);
  };
  const DownloadReport = async (type) =>
{
  showLoading();
  try
  {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');
    let conditionsArray =
    		[
  				[
  				]
  			];
  		const AllData=[];
  		const LeadsList1 = await SelectWithComplexConditions(
  "UserServices",
  conditionsArray,
  "",
  "",
  "",
  10000, // Page size
  null // Start with no lastDoc initially
);
console.log("LeadsList1---->",LeadsList1)
 AllServices = [...LeadsList1.data]; // Store initial batch
let lastDoc = LeadsList1.lastDoc; // Get the last document for pagination

// Loop to fetch all documents iteratively
while (lastDoc !== null) {
  console.log("Fetching next page...");

  // Fetch next batch using lastDoc as startAfter
  const nextBatch = await SelectWithComplexConditions(
    "UserServices",
    conditionsArray,
    "",
    "",
    "",
    10000, // Page size
    lastDoc
  );



  // Add next batch to allLeads
  AllServices = [...AllServices, ...nextBatch.data];

  // Update lastDoc for the next loop iteration
  lastDoc = nextBatch.lastDoc;

  // Break if no more data
  if (nextBatch.data.length === 0 || !lastDoc) {
    console.log("✅ No more documents to fetch.");
    break;
  }
}

const UserList =await SelectWithComplexConditions("Users",conditionsArray,"","updatedAt","desc",10000);
let allUserList = [...UserList.data];
let lastDocUserList = UserList.lastDoc;
while (lastDocUserList !== null)
{
  const nextBatch = await SelectWithComplexConditions("Users",conditionsArray,"","updatedAt","desc",10000,lastDocUserList);
  allUserList = [...allUserList, ...nextBatch.data];
  lastDocUserList = nextBatch.lastDoc;
  if (nextBatch.data.length === 0 || !lastDocUserList)
  {
    console.log("✅ No more Followup documents to fetch.");
    break;
  }
}
const groupedUserList = allUserList.reduce((acc, UserDetail) => {
  const uidLi = UserDetail.uid;

  if (!acc[uidLi]) {
    acc[uidLi] = [];
  }

  // Push follow-up only if less than 5 per lead
  if (acc[uidLi].length < 5) {
    acc[uidLi].push(UserDetail);
  }

  return acc;
}, {});
/*const ServiceList =await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services",conditionsArray,"","","",null,null,10000);
let allServices = [...ServiceList.data];
let lastDocService = ServiceList.lastDoc;
while (lastDocService !== null)
{
  const nextBatch = await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services",conditionsArray,"","","",null,null,10000,lastDocService);
  allServices = [...allServices, ...nextBatch.data];
  lastDocService = nextBatch.lastDoc;
  if (nextBatch.data.length === 0 || !lastDocService)
  {
    console.log("✅ No more Followup documents to fetch.");
    break;
  }
}
const groupedServices = allServices.reduce((acc, serrives) => {
  const leadId = serrives.leadid;

  if (!acc[leadId]) {
    acc[leadId] = [];
  }

  // Push follow-up only if less than 5 per lead
  if (acc[leadId].length < 5) {
    acc[leadId].push(serrives);
  }

  return acc;
}, {});
*/

      await Promise.all(
  AllServices.map(async (userservices) => {
    const UserDetail=groupedUserList?.[userservices.uid]?.[0];
    const YOG=UserDetail?.['GraduationDate'] ? typeof UserDetail?.GraduationDate==="string"?dayjs(UserDetail?.['GraduationDate']).format("YYYY"):dayjs(new Date(UserDetail?.['GraduationDate']?.seconds*1000)).format("YYYY") : null;
    const step1scr=UserDetail?.ScoreData?.Step1Score?.Selected?.Name || '';
    let step1str=step1scr;
    if(step1scr==='Fail')
    {
      step1str = step1str+"(Attempts:"+ UserDetail?.ScoreData?.['Step1Attempts'] + ')';
    }
    else if(step1scr==='Score')
    {
      step1str = step1str+"("+ UserDetail?.ScoreData?.['Step1Score']['Selected']['Value'] +  ')';
    }

    const step2scr=UserDetail?.ScoreData?.Step2Score?.Selected?.Name || '';
    let step2str=step2scr;
    if(step2scr==='Score')
    {
      step2str = step2str+"("+ UserDetail?.ScoreData?.['Step2Score']['Selected']['Value'] +  ')';
    }
    const step3scr=UserDetail?.ScoreData?.Step3Score?.Selected?.Name || '';
    let step3str=step3scr;
    if(step3scr==='Score')
    {
      step3str = step3str+"("+ UserDetail?.ScoreData?.['Step3Score']['Selected']['Value'] +  ')';
    }
    const ExportData = {
      "Name": UserDetail?.displayName || "",
      "Email": UserDetail?.email || "",
      "PhoneNumber": UserDetail?.PhoneCountry?.label+ UserDetail?.phoneNumber ,
      "YearOfGraduation": YOG || "",
      "Step1Result": step1str,
      "Step2Result":step2str,
      "Step3Result": step3str,
      "CountryOfMedicalSchool":UserDetail?.['CountryOfMedicalSchool']?.['label'] || '',
      "NameOfMedicalSchool": UserDetail?.['NameOfMedicalSchool']?.['label'] || '',
    };
    if(userservices.Match)
    {
      AllData.push(ExportData);
    }

  })
);

      const headers = Object.keys(AllData[0] || {});
      worksheet.columns = headers.map((header) => ({header, key: header}));
      AllData.forEach((row) => worksheet.addRow(row));
      worksheet.columns.forEach((column) => {
        let maxLength = column.header.length; // Start with the header length
        column.eachCell({includeEmpty: true}, (cell) => {
          if (cell.value) {
            const cellLength = cell.value.toString().length;
            maxLength = Math.max(maxLength, cellLength);
          }
        });
        column.width = maxLength + 2; // Add padding for readability
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {argb: "FFFF00"}, // Yellow background
        };
        cell.font = {bold: true};
      });

      // Generate Excel file and prompt download
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'LeadsData.xlsx');
      hideLoading();
    }
    catch (error)
    {
      console.error('Error exporting data:', error);
      hideLoading();
      alert('Failed to export data.');
    }
};
 const exportHospitalDataToExcel = async (data, fileName = "HospitalPrograms.xlsx") => {
  // Step 1: Pick only required fields
  const formattedData = data.map(item => ({
    AssignedOn: item.AssignedOn
      ? new Date(item.AssignedOn).toLocaleDateString("en-GB") // convert ms → dd/mm/yyyy
      : "",
    Frieda: item.Frieda || "",
    Status: item.Status || "",
    Verified: item.Verified ? item.Verified : "No",
    VerifiedAdmin: item.VerifiedAdmin || "",
    Email: item.Users?.email || "", // <- pulled from users collection
  }));

  // Step 2: Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Step 3: Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hospital Programs");

  // Step 4: Save file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
};
  const loadData = async (direction = 'next') => {
    showLoading();
    const currentYear = new Date().getFullYear();
    //let datan=await getjointabledata("HospitalProgramInfo","AssignedYear","==",currentYear,joinCollectionName,"UId");
    //console.log("datan---->",datan)
    //exportHospitalDataToExcel(datan);
    //updateAllHospitalProgramInfoDocs();
   //let WhereOrObject=[{"name":"PId","condition":"==","value":"1"}];
   //addOrUpdateDocIds("HospitalProgramInfo",WhereOrObject)
    /*const resultsr = await SelectWithWhereAnd("HospitalProgramInfo", []);
    console.log("HospitalProgramInfo--->",resultsr['data'])
    const UserFav={};
    let KeyD=""
    for (let i = 0; i < resultsr['data'].length; i++)
    {
      //console.log(i, resultsr['data'][i]);
      KeyD=resultsr['data'][i].HId+"_"+resultsr['data'][i].PId;
      UserFav[KeyD]=resultsr['data'][i]
    }*/
    //console.log("UserFav--->",UserFav)
    //copyCollection("UserFav","UserFav",UserFav);
   //copyFieldToAnotherCollection("Users","UsersRoles","StudentUniqueId");
   //updateOrAddFieldInCollection("Users","StudentUniqueId","The application fee does not guarantee your spot for your desired start date. To secure and confirm your rotation, full payment is required. We recommend completing your payment at least 30 days in advance. However, last-minute requests may be accommodated based on availability. Rotation schedules and start dates are subject to change, depending on availability.");
    let result;
     console.log("fetchPaginatedDataWithJoin--->",direction)
     /*let WhereOrObjectJ=[{"name":"PId","condition":"==","value":"1"}];
    	const resultsJ = await SelectWithWhereAnd("HospitalProgramInfo", WhereOrObjectJ);
    	let WhereOrObjectK=[{"name":"PIds","condition":"array-contains","value":"1"}];
    	const resultsK = await SelectWithWhereAnd("Hospital", WhereOrObjectK);
    	console.log("resultsJ-->",resultsJ)
    	console.log("resultsK-->",resultsK)
    	let HospitalData={};
    	let HospitalDataDiff={};
    	resultsK.data.forEach((item, index) => {
    	HospitalData[item?.HId]=item
    	})


    	resultsJ.data.forEach((item, index) => {
    	if(typeof HospitalData[item?.HId]=="undefined" )
    	{
    	  HospitalDataDiff[item?.HId]=item
    	}

    	})
for (const [key, value] of Object.entries(HospitalDataDiff)) {
  try {
    console.log("Trying to delete value.id -->", value.id);
    await deletedocumentfromid("HospitalProgramInfo", value.id);
    console.log("Deleted value.id -->", value.id);
  } catch (err) {
    console.error(`Failed to delete id ${value?.id}:`, err.message);
  }
} 	console.log("HospitalDataDiff--->",HospitalDataDiff)*/
    if (direction === 'next')
    {
    	 let CondtionNow=filterCondition;
    	 if(typeof filterValue==="object")
    	 {
    	  CondtionNow="in";
    	 }
    	 let filterValTemp=filterValue;
    	 if(filterField==="StudentUniqueId")
    	 {
    	    filterValTemp = Number(filterValTemp.replace(/s/gi, ""));
    	 }
    	  console.log("filterField--->",filterField)
    	  console.log("CondtionNow--->",CondtionNow)
    	  console.log("filterValue--->",filterValTemp)
    	  console.log("LastDocVar--->",LastDocVar)
      result = await fetchPaginatedDataWithJoin(mainCollectionName,joinCollectionName,pageSize,LastDocVar,filterField,CondtionNow,filterValTemp,0, "createdAt", "desc");
    }
    else if(direction === 'whereor')
    {
    	//getRecordsWithEnrollmentDateAfter( "UserServicesBK1","RotationData.Rotations.Rotation0.EnrollmentDate",">=", "2024-09-01T00:00:00Z");
    	const StartDateToSend = Timestamp.fromDate(new Date(startDate));
    	const EndDateToSend = Timestamp.fromDate(new Date(endDate));
    	let WhereOrObject=[{"name":filterField,"condition":">=","value":StartDateToSend},{"name":filterField,"condition":"<=","value":EndDateToSend}];
    	const results = await SelectWithWhereAnd("UserServices", WhereOrObject);

    }
    else
    {
      console.log("fetchPaginatedDataWithJoin--->")
      result = await fetchPaginatedDataWithJoin(mainCollectionName,joinCollectionName,pageSize,firstDoc,filterField,filterCondition,filterValue,LoggedInuser,"createdAt","desc");
    }
     console.log("resultkkk--->",result)
    if (result.data.length < pageSize) {
      setIsLastPage(true);
    } else {
      setIsLastPage(false);
    }
    if (direction === 'next') {
      setData(result.data);
      setLastDoc(result.lastDoc);
      LastDocVar=result.lastDoc;
      if (result.data.length > 0) {
        setFirstDoc(result.data[0].id);
      }
    } else {
      setData(result.data);
      setLastDoc(result.lastDoc);
      LastDocVar=result.lastDoc;
    }

    hideLoading();
  };
  const handleDeleteUser = async (item) => {
  console.log("item.id---->",item)
  const userid=item.uid?item.uid:item.id;
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${item.displayName || item.joinData?.email}?`
  );

  if (!confirmDelete) return;

  try {
    showLoading();

    // Delete from UsersRoles
    const responseSend = await axios.post('https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/deleteUser', { userid:userid});
    console.log("responseSend---->",responseSend)
    if(responseSend?.data?.status=="success")
    {
      await DeleteDocumentWhere("UsersRoles","uid","==", userid);
      await DeleteDocumentWhere("Users","uid","==", userid);
      await DeleteDocumentWhere("UserServices","uid","==", userid);
    }
    // OPTIONAL: delete from Users collection also
    // await deletedocumentfromid("Users", item.id);

    setData(prev => prev.filter(d => d.id !== item.id));

    alert("User deleted successfully");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete user");
  } finally {
    hideLoading();
  }
};
const handleRemoveAdmin = async (item) => {
const userid=item.uid?item.uid:item.id;
  const confirmRemove = window.confirm(
    `Remove admin access for ${item.displayName || item.joinData?.email}?`
  );

  if (!confirmRemove) return;

  try {
    showLoading();

    await handleUpdate(
      "UsersRoles",
      item.id,
      {
        Role: "Default",
        updatedAt: new Date()
      }
    );

    setData(prev =>
      prev.map(d =>
        d.id === item.id ? { ...d, Role: "User" } : d
      )
    );

    alert("Admin role removed");
  } catch (err) {
    console.error("Role update failed:", err);
    alert("Failed to remove admin role");
  } finally {
    hideLoading();
  }
};
const loadTotalRecords = async () => {
    try {
      const count = await fetchTotalRecordsCount(mainCollectionName, filterField, filterValue,LoggedInuser);
      setTotalRows(count);
    } catch (error) {
      console.error('Error fetching total record count: ', error);
    }
  };
  const handleNextPage = () => {
    if (!isLastPage) {
      setPage(page + 1);
      loadData('next');
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      loadData('previous');
    }
  };
  

const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name==="id")
    {
    	setFilterField(value)
    	if(value==="RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate")
    	{
    		togglePicker()
    	}
    }
    else if(name==="condition")
    {
    	setFilterCondition(value)

    }
    else
    {
    	setFilterValue(value)
    }
    //if(name=="id" || name=="condition")
   setFilters({ ...filters, [name]: value });
  };

  const AsignFilterChange = (event, item,obj) => {
  console.log("event====>",event)
  console.log("item====>",item)
  console.log("event.target.value====>",adminOptions[event.target.value])
  console.log("adminOptions====>",adminOptions)
  //console.log("item====>",item)
    setFilters({
      ...filters,
      [item.id]: event.target.value,
    });
    setLeadSelectSelectedValue(item.displayName)
    setAgentSelectSelectedValue(adminOptions[event.target.value])
    setSelectedValue(event.target.value);
    setCurrentId(item.id);
    setOpen(true);
  };
   const handleConfirm = () => {
    setFilters({
      ...filters,
      [currentId]: selectedValue,
    });
    var dataTobesend={
        AsignedToAgentId: selectedValue, // Replace 'fieldName' with the actual field you want to update
        AsignedToAgentName: AgentSelectValue,
        uid: currentId
      }
    handleUpdate("AgentUserConnection",currentId,dataTobesend);
     lastDoc=null;
     setLastDoc(null);
     LastDocVar=null;
     applyFilters();
    setOpen(false);
  };

  const handleCancel = () => {
    //setSelectedValue(null);
    setCurrentId(null);
    setOpen(false);
  };
const loadFilterOptions = async () => {
    const idOptions = {
      //"Role": "User Type",
      "StudentUniqueId": "Student ID",
      "email": "User Email",
      "displayName": "User Name",
    };
    const nameOptions = {
      "==": "Equal To",
      "!=": "Not Equal To",
      ">=": "Contains",
      "Range": "Range",
    };

    const adminList={};
const adminOptions = await fetchAdminDataWithJoin(mainCollectionName,joinCollectionName,30,null,"Role","==","Admin");
   adminOptions.data.map((item) => {
    adminList[item.id]=item.displayName;
    return "g";
    })
    //adminOptions

    setIdOptions(idOptions);
    setNameOptions(nameOptions);
    setAdminOptions(adminList);
  };
  const applyFilters = () => {
  setLastDoc(null)
  LastDocVar=null;
  if(startDate!==null && endDate!==null && filterField==="RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate")
  {
  	loadData("whereor");
  }
  else
  {
  	loadData();
  }

  loadTotalRecords();
    // Implement filtering logic here
    // For simplicity, this example does not include filtering logic in Firestore
  };
  const totalPages = Math.ceil(totalRows / pageSize);

  if (loadingAuth) return <p>Loading...</p>;
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', gap: 4 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="id-filter-label">Select Filter</InputLabel>
          <Select
            labelId="id-filter-label"
            id="id-filter"
            name="id"
            value={filters.id}
            label="Select Filter"
            onChange={handleFilterChange}
          >
            {/* Replace the following options with dynamic data as needed */}
            {Object.entries(idOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        {filters.id!=='RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate' && (
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="condition-filter-label">Condition</InputLabel>
          <Select
            labelId="condition-filter-label"
            id="condition-filter"
            name="condition"
            value={filterCondition}
            label="Condition"
            onChange={handleFilterChange}
          >
            {/* Replace the following options with dynamic data as needed */}
             {Object.entries(nameOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
          </Select>
        </FormControl>
        )}
         {filters.id==='RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate' && (
         <div className="date-range-container">


      {showPicker && (
        <div className="date-range-picker">
          <DatePicker
        selected={startDate}
        onChange={date => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
         showYearDropdown
  		showMonthDropdown
        placeholderText="Start Date"
      />
      <DatePicker
        selected={endDate}
        onChange={date => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
         showYearDropdown
  showMonthDropdown
        placeholderText="End Date"
      />
        </div>
      )}

    </div>
  )
}
     {filters.id!=='RotationData.Rotations.Rotation0.RotationPayment.Payment0.PaymentDate' && (
        <TextField label="Value" name="value" id="value" value={filters.value} onChange={handleFilterChange} />
        )}
        <Button variant="contained" className="FilterButton" onClick={applyFilters}>Apply Filters</Button>
        <Button variant="contained" className="FilterButton" onClick={DownloadReport}>Download Match Data</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Date Of Creation</TableCell>
              <TableCell>Rotation</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Research</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>S{item?.StudentUniqueId}</TableCell>
                <TableCell>{item?.DisplayNamePre?item?.DisplayNamePre: item.displayName}</TableCell>
                <TableCell>{item.joinData?.phone || item.joinData?.phoneNumber}</TableCell>
                <TableCell> <a
                      href={`/admin/userdetails/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '2px 20px',
                        backgroundColor: '#af4cab',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}
                    >{item.joinData?.email}</a></TableCell>
                <TableCell>
                {item.createdAt?dayjs(new Date(item.createdAt.seconds * 1000)).format('MM-DD-YYYY'):null}
                </TableCell>

                 <TableCell>
                 {item?.ServicesOpted?.RotationData?.Rotations?.Rotation0?.EnrollmentDate?.seconds ? <label style={{
                        padding: '2px 20px',
                        backgroundColor: '#0ac74f',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>Yes</label>:<label style={{
                        padding: '2px 20px',
                        backgroundColor: '#e30e31',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>No</label>}
                 </TableCell>
                  <TableCell>
                  {item?.ServicesOpted?.Match?.EnrollmentDate?.seconds ? <label style={{
                        padding: '2px 20px',
                        backgroundColor: '#0ac74f',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>Yes</label>:<label style={{
                        padding: '2px 20px',
                        backgroundColor: '#e30e31',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>No</label>}
                 </TableCell>
                  <TableCell>
                  {item?.ServicesOpted?.Research?.Research0?.EnrollmentDate?.seconds ? <label style={{
                        padding: '2px 20px',
                        backgroundColor: '#0ac74f',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>Yes</label>:<label style={{
                        padding: '2px 20px',
                        backgroundColor: '#e30e31',
                        marginBottom: '3px',
                        marginRight: '3px',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                      }}>No</label>}
                 </TableCell>
                 <TableCell>
  <Button
    size="small"
    color="error"
    variant="outlined"
    onClick={() => handleDeleteUser(item)}
    sx={{ mr: 1 }}
  >
    Delete
  </Button>

  {item.Role === 'Admin' && (
    <Button
      size="small"
      color="warning"
      variant="outlined"
      onClick={() => handleRemoveAdmin(item)}
    >
      Remove Admin
    </Button>
  )}
</TableCell>

    
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
        open={open}
        onClose={handleCancel}
      >
        <DialogTitle>Agent Asign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to Asign
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
           <Box component="span" sx={{ display: 'inline-block', backgroundColor: '#e0f7fa', borderRadius: 1, p: 1, mx: 1 }}>
              <Typography component="span" fontWeight="bold">
                User: {LeadSelectValue}
              </Typography>
            </Box>
            To
            <Box component="span" sx={{ display: 'inline-block', backgroundColor: '#e0f7fa', borderRadius: 1, p: 1, mx: 1 }}>
              <Typography component="span" fontWeight="bold">
                Agent: {AgentSelectValue}
              </Typography> ?
            </Box>
        </Box>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      </TableContainer>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={handlePreviousPage} disabled={page === 1} variant="contained">Previous</Button>
        <Button onClick={handleNextPage} disabled={isLastPage} variant="contained">Next</Button>
      </Box>
     <Box sx={{ mt: 2, textAlign: 'center' }}>
        <p>Page: {page} of {totalPages}</p>
      </Box>
    </Box>
  );
};

export default PaginatedTable;


