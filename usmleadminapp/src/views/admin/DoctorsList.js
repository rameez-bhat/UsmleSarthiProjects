import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '../../layout/LoadingContext';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, CircularProgress,Select, MenuItem, FormControl, InputLabel ,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';

const PaginatedTable = (ActualUser, AuthUser) => {
AuthUser=ActualUser.AuthUser;
ActualUser=ActualUser.ActualUser;
const { loadingAuth,setloadingAuth} = useState(null);
const { LoggedInuser,setLoggedInuser } = useState(ActualUser);
const { showLoading, hideLoading, API_KEY,DatabaseName,FetchUniqueDataFull,fetchTotalRecordsCount,fetchAdminDataWithJoin,handleUpdate  } = useLoading();
  const [data, setData] = useState([]);
  let [lastDoc, setLastDoc] = useState(null);
  const [page, setPage] = useState(1);
	const [open, setOpen] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const pageSize = 100; // Number of entries per page
  const mainCollectionName = 'RotationDoctors';
  const joinCollectionName = 'Users';
  const [filters, setFilters] = useState({ id: '', name: '' });
  const [filterField, setFilterField] = useState('Role');
  const [filterCondition, setFilterCondition] = useState('==');
  const [filterValue, setFilterValue] = useState('');
  const [idOptions, setIdOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
	loadData();
    loadTotalRecords();
    loadFilterOptions();
  },[]);

  const loadData = async (direction = 'next') => {
    setLoading(true);
    let result;
    console.log("filterCondition--->",direction) 
    let LastDocSet=lastDoc
    if(direction===null)
    {
    	LastDocSet=null
    }
    if (direction === 'next') {
        //result = await fetchPaginatedDataWithJoin(mainCollectionName,joinCollectionName,pageSize,lastDoc,filterField,filterCondition,filterValue,LoggedInuser);
        result = await FetchUniqueDataFull(mainCollectionName,"representingEmail",pageSize,LastDocSet,filterField,filterCondition,filterValue,LoggedInuser);
    } else {
      result = await FetchUniqueDataFull(mainCollectionName,"representingEmail",pageSize,LastDocSet,filterField,filterCondition,filterValue,LoggedInuser);
    }
    console.log("result---->",result)
    if (result.data.length < pageSize) {
      setIsLastPage(true);
    } else {
      setIsLastPage(false);
    }
    if (direction === 'next') {
      setData(result.data);
      setLastDoc(result.lastDoc);
      
    } else {
      setData(result.data);
      setLastDoc(result.lastDoc);
    }
	console.log("data--->",data)
    setLoading(false);
  };
const loadTotalRecords = async () => {
    try {
      const count = await fetchTotalRecordsCount(mainCollectionName, "", "",LoggedInuser);
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

   const handleConfirm = () => {
    setFilters({
      ...filters,
      [currentId]: selectedValue,
    });
    var dataTobesend={
        AsignedToAgentId: selectedValue, // Replace 'fieldName' with the actual field you want to update
        AsignedToAgentName: '',
        uid: currentId
      }
    handleUpdate("AgentUserConnection",currentId,dataTobesend);
     lastDoc=null;
     setLastDoc(null);
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
      "representingEmail": "Representing Email",
      "DoctorInfo.representingName": "Representing Name",
      "DoctorInfo.adminName": "Admin Name",
      "DoctorInfo.contact": "Contact",
       "DoctorInfo.locationCodes": "Location Code"
    };
    const nameOptions = {
      "==": "Equal To",
      "!=": "Not Equal To",
      ">=": "Contains",
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
  };
  const applyFilters = () => {
  setLastDoc(null)
  loadData(null);
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
        <TextField label="Value" name="value" id="value" value={filters.value} onChange={handleFilterChange} />
        <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Representing Email</TableCell>
              <TableCell>Representing Name</TableCell>
              <TableCell>Admin Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>View Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow >
                <TableCell><a
                      href={`/admin/doctordetails/${item.id}`}
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
                    >{item.DoctorInfo.representingEmail}</a></TableCell>
                <TableCell>{item.DoctorInfo.representingName}</TableCell>
                <TableCell>{item.DoctorInfo.adminName}</TableCell>
                <TableCell>{item.DoctorInfo.contact}</TableCell>
                <TableCell>
  {/* Initialize an array to store location codes */}
  {(() => {
    let locationcodea = [];

    // Populate locationcodea with location codes
    Object.entries(item.DoctorInfo.locationCodes).forEach(([key, value]) => {
      locationcodea.push(value);
    });

    // Render individual location links
    const locationLinks = Object.entries(item.DoctorInfo.locationCodes).map(([key, value]) => (

       <Link
  to={{
    pathname: `/admin/listrotationstudents`,
  }}
  state={{ locationcodea: [value],objectSerialize:item, }}
  style={{
    padding: '3px 20px',
    backgroundColor: '#4CAF50',
    marginBottom: '3px',
    marginRight: '3px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    display: 'inline-block',
    fontWeight: 'bold',
  }}
  key="viewfull"
>
 {value}
</Link>
    ));
console.log("locationcodea---->",locationcodea)
    // Return all individual links and the "View Full" link
    return (
      <>
        {locationLinks}
        <Link
  to={{
    pathname: `/admin/listrotationstudents`,
    state: {
      locationcodea: locationcodea,
      item:item,
    },
  }}
  state={{ locationcodea: locationcodea,objectSerialize:item, }}
  style={{
    padding: '3px 20px',
    backgroundColor: '#504caf',
    marginBottom: '3px',
    marginRight: '3px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    display: 'inline-block',
    fontWeight: 'bold',
  }}
  key="viewfull"
>
 View Fulll
</Link>
        {/*<a
          href={`/admin/listrotationstudents/${encodeURIComponent(JSON.stringify(item))}/${encodeURIComponent(JSON.stringify(locationcodea))}`}
          style={{
            padding: '3px 20px',
            backgroundColor: '#504caf',
            marginBottom: '3px',
            marginRight: '3px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
          }}
        >
          View Full
        </a>
         {/*<a
          href={`/trackdoctorpayments/${item.id}`}
          style={{
            padding: '3px 20px',
            backgroundColor: '#504caf',
            marginBottom: '3px',
            marginRight: '3px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
          }}
        >
         Track Doctor Payments
        </a>*/}
      </>
    );
  })()}
  
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
                User: {}
              </Typography>
            </Box>
            To
            <Box component="span" sx={{ display: 'inline-block', backgroundColor: '#e0f7fa', borderRadius: 1, p: 1, mx: 1 }}>
              <Typography component="span" fontWeight="bold">
                Agent: {}
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


