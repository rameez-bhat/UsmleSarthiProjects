import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker } from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLoading } from '../../layout/LoadingContext';
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  FormControl,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography
} from '@mui/material';
import { CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import '../../components/css/style.css';

// Constants
const DATE_FORMAT = "MM/DD/YYYY";
const DATE_FORMAT_WITH_TIME = "MM/DD/YYYY h:m:s";

// Filter options configuration
const FILTER_OPTIONS = {
  startDate: "Rotation Start Date",
  status: "Enquiry Status",
  email: "Email",
  location_code: "Location Code"
};

const STATUS_OPTIONS = {
  "Accepted": "Accepted",
  "Pending": "Pending",
  "Rejected": "Rejected"
};

const UserDetails = () => {
  const { did } = useParams();
  const { showLoading, hideLoading, SelectWithComplexConditions, handleUpdate } = useLoading();
  
  // State management
  const [operationMessage, setOperationMessage] = useState('');
  const [allPaymentData, setAllPaymentData] = useState([]);
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({ 
    id: 'startDate', 
    name: '' 
  });
  const [filterField, setFilterField] = useState('startDate');

  const [startDate, setStartDate] = useState(
  dayjs().subtract(1, 'month').set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0)
);

const [endDate, setEndDate] = useState(
  dayjs().set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0)
);
  const [dynamicField, setDynamicField] = useState(null);
  const [sortConfig, setSortConfig] = useState({ 
    key: 'AdminInTouch', 
    direction: 'ascending' 
  });
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [emailList, setEmailList] = useState([]);

  // Memoized filter options
  const filterOptions = useMemo(() => FILTER_OPTIONS, []);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  // Fetch user data
  const fetchUserData = useCallback(async (filterField = "startDate") => {
    try {
      showLoading();
      setEmailList([]);
      
      const dateTimestampStart = startDate.toDate().getTime();
      const dateTimestampEnd = endDate.toDate().getTime();

      let conditionsArray = [
        [
          { name: 'startDate', condition: ">=", value: dateTimestampStart },
          { name: 'startDate', condition: "<=", value: dateTimestampEnd }
        ]
      ];

      // Additional conditions based on filter field
      if (filterField === "status" && dynamicField) {
        conditionsArray[0].push(
          { name: 'status', condition: "==", value: dynamicField }
        );
      } else if (filterField === "location_code" && dynamicField) {
        conditionsArray[0].push(
          { name: 'location_code', condition: "==", value: dynamicField }
        );
      } else if (filterField === "email" && dynamicField) {
        conditionsArray[0].push(
          { name: 'email', condition: "==", value: dynamicField }
        );
      }
		console.log("conditionsArray---->",conditionsArray)
      const result = await SelectWithComplexConditions(
        "Enquiries", 
        conditionsArray, 
        "", 
        "timestamp", 
        "desc"
      );

      if (result.status === "success") {
        setAllPaymentData(result.data);
        const emails = result.data.map(user => ({ email: user?.email }));
        setEmailList(emails);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setOperationMessage("Failed to fetch user data");
      setOpenDialog(true);
    } finally {
      hideLoading();
    }
  }, [startDate, endDate, dynamicField, showLoading, hideLoading, SelectWithComplexConditions]);

  // Initial data load
  useEffect(() => {
    fetchUserData();
  }, []);

  // Sorting functionality
  const requestSort = useCallback((key, feeType = null) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setSelectedFeeType(feeType);
  }, [sortConfig]);

  // Sorted data
  const sortedData = useMemo(() => {
    const sortableItems = allPaymentData.map(user => ({
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      StartDate: user.startDate,
      LocationCode: user?.location_code,
      status: user?.status,
      EnquiryTime: user?.timestamp,
    }));

    return [...sortableItems].sort((a, b) => {
      if (sortConfig.key === 'PaymentDate' && selectedFeeType) {
        const aDate = a.FeeType === selectedFeeType ? new Date(a.PaymentDate.seconds * 1000) : new Date(0);
        const bDate = b.FeeType === selectedFeeType ? new Date(b.PaymentDate.seconds * 1000) : new Date(0);
        return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [allPaymentData, sortConfig, selectedFeeType]);

  // Filter handlers
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setFilterField(value);
    setDynamicField(null); // Reset dynamic field when filter changes
  }, []);

  const handleDynamicChange = useCallback((e) => {
    setDynamicField(e.target.value);
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (!startDate || !endDate) {
      setOperationMessage("Please select date ranges");
      setOpenDialog(true);
      return;
    }

    if ((filterField === "status" || filterField === "location_code" || filterField === "email") && !dynamicField) {
      setOperationMessage(`Please select ${filterField} value`);
      setOpenDialog(true);
      return;
    }

    fetchUserData(filterField);
  }, [startDate, endDate, filterField, dynamicField, fetchUserData]);

  // Copy emails to clipboard
  const copyEmailsToClipboard = useCallback(async () => {
    const emails = emailList.map(item => item.email).join('\n');
    try {
      await navigator.clipboard.writeText(emails);
      setOperationMessage('Emails copied to clipboard!');
      setOpenDialog(true);
    } catch (err) {
      console.error('Failed to copy emails: ', err);
      setOperationMessage('Failed to copy emails');
      setOpenDialog(true);
    }
  }, [emailList]);

  // Dialog handlers
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  return (
    <CenteredBox>
      <Box>
        {/* Filter Section */}
        <Box sx={{ mb: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
              {Object.entries(filterOptions).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="date-range-container">
            <div className="date-range-picker">
              <DatePicker
                value={startDate}
                //onChange={setStartDate}
                onChange={(date) => {
  const adjustedStart = dayjs(date).set('hour', 0).set('minute', 0).set('second', 1).set('millisecond', 0);
  setStartDate(adjustedStart);
}}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                format={DATE_FORMAT}
                showYearDropdown
                showMonthDropdown
                placeholderText="Start Date"
              />
              <DatePicker
                value={endDate}
                //onChange={setEndDate}
                onChange={(date) => {
  const adjustedEnd = dayjs(date).set('hour', 23).set('minute', 59).set('second', 1).set('millisecond', 0);
  setEndDate(adjustedEnd);
}}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                format={DATE_FORMAT}
                showYearDropdown
                showMonthDropdown
                placeholderText="End Date"
              />
            </div>
          </div>

          {filterField === "status" && (
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={dynamicField || ''}
                label="Status"
                onChange={handleDynamicChange}
              >
                <MenuItem value="">Select Status</MenuItem>
                {Object.entries(statusOptions).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(filterField === "location_code" || filterField === "email") && (
            <TextField
              label={`Enter ${filterField === "location_code" ? "Location Code" : "Email"}`}
              value={dynamicField || ''}
              onChange={handleDynamicChange}
              sx={{ minWidth: 220 }}
            />
          )}

          <Button 
            variant="contained" 
            onClick={applyFilters}
            sx={{ height: '56px' }}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>

      <CenteredBoxInfo>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Rotation Users Total: {sortedData.length}
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => requestSort('email')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Email {sortConfig.key === 'email' && (
                    sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => requestSort('displayName')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Name {sortConfig.key === 'displayName' && (
                    sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => requestSort('StartDate')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Rotation Start Date {sortConfig.key === 'StartDate' && (
                    sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => requestSort('status')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Enquiry Status {sortConfig.key === 'status' && (
                    sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => requestSort('EnquiryTime')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Enquired On {sortConfig.key === 'EnquiryTime' && (
                    sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                    {user?.uid ? (
                      <Button
                        href={`/admin/userdetails/${user.uid}`}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          backgroundColor: '#af4cab',
                          color: 'white',
                          '&:hover': { backgroundColor: '#8e3a8b' },
                          textTransform: 'none'
                        }}
                      >
                        {user?.email || "Click Here"}
                      </Button>
                    ):(user?.email)}
                    </TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>
                      {user.StartDate ? dayjs(new Date(user.StartDate)).format(DATE_FORMAT_WITH_TIME) : 'N/A'}
                    </TableCell>
                    <TableCell>{user.status || 'N/A'}</TableCell>
                    <TableCell>
                      {user.EnquiryTime ? dayjs(new Date(user.EnquiryTime)).format(DATE_FORMAT_WITH_TIME) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/*<Button
          variant="contained"
          color="primary"
          onClick={copyEmailsToClipboard}
          disabled={emailList.length === 0}
          sx={{ mb: 2 }}
        >
          Copy Emails to Clipboard
        </Button>

        {/* Operation Status Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Operation Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {operationMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};

export default UserDetails;