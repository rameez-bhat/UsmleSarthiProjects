import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DatePicker } from "antd";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import sorting icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CButton,
  CTableHead,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CToaster,
  CFormLabel,
  CFormSelect,
  CForm,
  CFormFeedback,
  CFormInput,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem
} from '@coreui/react';
const { RangePicker } = DatePicker;
import Select1 from 'react-select';
import {
  Box,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useLoading } from '../../layout/LoadingContext';
import { CenteredBox, CenteredBoxInfo } from '../../components/css/CustomStyles';
import '../../components/css/style.css';
let EmailList = [];
let totalPages = 10;
let visiblePages = 6;
const dateFormat = "MM/DD/YYYY";
let startPage = 0;
let endPage = 0;
let filterEffect=false;
const entriesPerPage = 100;
let FilterChangingOption = {};
const UserDetails = () => {
  const { did } = useParams();
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [errors, seterrors] = useState(false)
  const [CurrentData, setCurrentData] = useState({})
  const [currentPage, setCurrentPage] = useState(1);
  const { showLoading, hideLoading, API_KEY, DatabaseName, SelectWithComplexConditions, Timestamp } = useLoading();
  const [OperationMessage, setOperationMessage] = useState('');
  const [AllPaymentData, setAllPaymentData] = useState([]);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ id: 'ResearchStartDate', name: '' });
  const [FiltersType, setFiltersType] = useState(filters.id);
  const [startDate, setStartDate] = useState(dayjs(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  const [endDate, setEndDate] = useState(dayjs(new Date()));
  const [startDateView, setStartDateView] = useState(dayjs(new Date(new Date().setMonth(new Date().getMonth() - 1))));
  const [endDateView, setEndDateView] = useState(dayjs(new Date()));
  const [conditionType, setconditionType] = useState('');
  const [filterField, setFilterField] = useState(filters.id);
  const [idOptions, setIdOptions] = useState([]);
  const [DynamicField, setDynamicField] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'AdminInTouch', direction: 'ascending' });

  const [selectedFeeType, setSelectedFeeType] = useState(null);

		
   // Set the number of entries per page

  // Updated requestSort function to handle FeeType
  const requestSort = (key, feeType = null) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
    setSelectedFeeType(feeType); // Track selected FeeType for sorting
  };

  // Updated sortedData with FeeType sorting logic
 /* const sortedData = useMemo(() => {
    const sortableItems = AllPaymentData.flatMap(user => {
      EmailList.push({ email: user?.profile?.email });
      if(CurrentData?.match)
      {
      	if(CurrentData?.match!==user.Match ? "yes" : "no")
      	{
      		return null; //discard this record
      	}
      }
      if(CurrentData?.rotation)
      {
      	if(CurrentData?.rotation!==user.RotationData ? "yes" : "no")
      	{
      		return null;//discard this record
      	}
      }
      if(CurrentData?.research)
      {
      	if(CurrentData?.research!==user.Research ? "yes" : "no")
      	{
      		return null;//discard this record
      	}
      }
      return {
        uid: user?.profile?.uid,
        StudentUniqueId: user?.profile?.StudentUniqueId,
        email: user?.profile?.email,
        displayName: user?.profile?.displayName,
        AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
        RotationService: user.RotationData ? "Yes" : "No",
        ResearchService: user.Research ? "Yes" : "No",
        MatchService: user.Match ? "Yes" : "No",
      };
    });

    // Sorting based on sortConfig and selected FeeType
    if (sortConfig.key === 'PaymentDate' && selectedFeeType) {
      return sortableItems.sort((a, b) => {
        const aDate = a.FeeType === selectedFeeType ? new Date(a.PaymentDate.seconds * 1000) : new Date(0);
        const bDate = b.FeeType === selectedFeeType ? new Date(b.PaymentDate.seconds * 1000) : new Date(0);

        return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
      });
    } else if (sortConfig.key) {
      return sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return sortableItems;
  }, [AllPaymentData, sortConfig, selectedFeeType,filterEffect]);*/
const sortedData = useMemo(() => {
  // Reset EmailList before recomputing
  EmailList = [];

  const sortableItems = AllPaymentData
    .filter(user => {
      if (CurrentData.rotation && CurrentData.rotation !== (user.RotationData ? "yes" : "no")) return false;
      if (CurrentData.match && CurrentData.match !== (user.Match ? "yes" : "no")) return false;
      if (CurrentData.research && CurrentData.research !== (user.Research ? "yes" : "no")) return false;
      return true;
    })
    .map(user => {
      // Add email to EmailList
      EmailList.push({ email: user?.profile?.email });

      return {
        uid: user?.profile?.uid,
        StudentUniqueId: user?.profile?.StudentUniqueId,
        email: user?.profile?.email,
        displayName: user?.profile?.displayName,
        AdminInTouch: user?.profile?.AdminInTouch?.label || 'N/A',
        RotationService: user.RotationData ? "Yes" : "No",
        ResearchService: user.Research ? "Yes" : "No",
        MatchService: user.Match ? "Yes" : "No",
        YearYouAreApplyingForResidency:user?.profile?.YearYouAreApplyingForResidency
      };
    });

  if (sortConfig.key) {
    return sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  return sortableItems;
}, [AllPaymentData, sortConfig, CurrentData]);
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
  }, [did]);

  const copyEmailsToClipboard = async () => {
    const emailList = EmailList.map(rotation => rotation.email).join('\n');
    navigator.clipboard.writeText(emailList).then(() => {
      alert('Emails copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy emails: ', err);
    });
  }

const handleFormChange = async (event,name) =>
{
  let value;
    if(typeof event.target!="undefined")
    {
  	  value=event.target.value;
    }
    else if(typeof event.$d!="undefined")
    {
  	  value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  	  value = firestoreQueries.Timestamp.fromDate(new Date(value))
    }
    else if(typeof event.label!="undefined")
    {
  	  value=event;
    }
    else if(typeof event?.[0]?.['label']!="undefined")
    {
  	  value=event;
    }
    else if(typeof event[0]!="undefined")
  	{
  		value={};
  		value['from']= firestoreQueries.Timestamp.fromDate(new Date(event[0].toLocaleString('en-GB', { timeZone: 'GMT' })));
			value['to']= firestoreQueries.Timestamp.fromDate(new Date(event[1].toLocaleString('en-GB', { timeZone: 'GMT' })));
  	}
    else
    {
  	  value=event.label;
    }

    setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
};
const handleFormSubmit = async () =>
{
  const errors = {};
  console.log("CurrentData===>",CurrentData)
  if(Object.keys(CurrentData).length)
  {
    filterEffect=!filterEffect;
  }
  else
  {
  	if(typeof CurrentData.rotation=="undefined")
  {
    errors.rotation="Please Select Rotation.";
  }
  if(typeof CurrentData.match=="undefined")
  {
    errors.match="Please Select Match.";
  }
  if(typeof CurrentData.research=="undefined")
  {
    errors.research="Please Select Research.";
  }
    errors.message="Select One Or More Filters";
    seterrors(errors);
  }
  


}

  const fetchUserData = async (Cond = "ResearchStartDate") => {
    try {
      let result;
      showLoading()
      let conditionsArray;
      let OrderColumn = null;
      let orderDirection = null;
      conditionsArray = [
        [
          { name: "uid", condition: "!=", value: 'jjj' }
        ]
      ];
      result = await SelectWithComplexConditions("UserServices", conditionsArray, "Users", OrderColumn, orderDirection);
      console.log("result---->",result)
      hideLoader()
      if (result.status === "success") {
        setAllPaymentData(result.data)
        totalPages=Math.ceil(result.data.length/entriesPerPage);
         startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  		 endPage = Math.min(totalPages, startPage + visiblePages - 1);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    hideLoading()
  };

  const isDateComparedTrue = (EnrollmentDate, operator, comparisonDate) => {
    const enrollmentDate = EnrollmentDate;
    if (enrollmentDate && enrollmentDate.seconds) {
      const enrollmentDateObject = new Date(enrollmentDate.seconds * 1000);
      switch (operator) {
        case '>=':
          return enrollmentDateObject >= comparisonDate;
        case '<=':
          return enrollmentDateObject <= comparisonDate;
        case '>':
          return enrollmentDateObject > comparisonDate;
        case '<':
          return enrollmentDateObject < comparisonDate;
        case '==':
          return enrollmentDateObject === comparisonDate;
        default:
          throw new Error(`Invalid operator: ${operator}. Supported operators are: >=, <=, >, <.==`);
      }
    }
    return false;
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const showLoader = () => {
    let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('hidden');
    }
  };

  const hideLoader = () => {
    let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, entriesPerPage]);

  return (
    <CenteredBox>
      <CenteredBoxInfo>
        <CCard className="mb-4">
          <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Filters</strong> <small></small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              {errors?.message && (
                <CFormFeedback invalid>{errors?.message}</CFormFeedback>
              )}
            </p>
            <CForm className="row g-3 needs-validation">
              <CCol md={4}>
                <CFormLabel >Rotation Service</CFormLabel>
                <CFormSelect
                  value={CurrentData?.rotation}
                  placeholder="Status"
                  invalid={!!errors?.rotation}
                  valid={!errors?.rotation}
                  required
                  onChange={(event) => handleFormChange(event, 'rotation')}>
                  <option value=''>=Select=</option>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                </CFormSelect>
                {errors?.rotation && (
                  <CFormFeedback invalid>{errors?.rotation}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Match Service</CFormLabel>
                <CFormSelect
                  value={CurrentData?.match}
                  placeholder="Status"
                  invalid={!!errors?.match}
                  valid={!errors?.match}
                  required
                  onChange={(event) => handleFormChange(event, 'match')}>
                  <option value=''>=Select=</option>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                </CFormSelect>
                {errors?.match && (
                  <CFormFeedback invalid>{errors?.match}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Research Service</CFormLabel>
                <CFormSelect
                  value={CurrentData?.research}
                  placeholder="Status"
                  invalid={!!errors?.research}
                  valid={!errors?.research}
                  required
                  onChange={(event) => handleFormChange(event, 'research')}>
                  <option value=''>=Select=</option>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                </CFormSelect>
                {errors?.research && (
                  <CFormFeedback invalid>{errors?.research}</CFormFeedback>
                )}
              </CCol>
              <p className="text-body-secondary small">
              </p>
              {/*<CCol xs={12}>
                <CButton color="primary" type="button"
                  onClick={(event) => handleFormSubmit()}>
                  Filter
                </CButton>
              </CCol>
              <p className="text-body-secondary small">
              </p>*/}
            </CForm>
          </CCardBody>
        </CCard>
        <div style={{
          width: '45%',
          margin: '0 auto',
          fontSize: '22px',
          fontWeight: 'bolder'
        }}>Total Services Users={sortedData.length}</div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => requestSort('StudentUniqueId')}>
                  Student ID {sortConfig.key === 'StudentUniqueId' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('displayName')}>
                  Name {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                 <TableCell onClick={() => requestSort('YearYouAreApplyingForResidency')}>
                  Application Session {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('RotationService')}>
                  Rotation Service {sortConfig.key === 'RotationService' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('ResearchService')}>
                  Research Service {sortConfig.key === 'ResearchService' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
                <TableCell onClick={() => requestSort('MatchService')}>
                  Match Service {sortConfig.key === 'MatchService' && (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((rotation, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>S{rotation?.StudentUniqueId}</TableCell>
                      <TableCell>
                        <a
                          href={`/admin/userdetails/${rotation.uid}`}
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
                        >
                          {rotation.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/admin/userdetails/${rotation.uid}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '2px 20px',
                            backgroundColor: 'blue',
                            marginBottom: '3px',
                            marginRight: '3px',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '5px',
                            display: 'inline-block',
                            fontWeight: 'bold',
                          }}
                        >
                          {rotation.displayName}
                        </a>
                      </TableCell>
                       {}
                      <TableCell>{(rotation?.YearYouAreApplyingForResidency && rotation?.YearYouAreApplyingForResidency!="Undecided/Later") ? `Match Season `+rotation?.YearYouAreApplyingForResidency+` (Sept `+(rotation?.YearYouAreApplyingForResidency-1)+`)`: `Undecided/Later` }</TableCell>
                      <TableCell>{rotation?.RotationService}</TableCell>
                      <TableCell>{rotation?.ResearchService}</TableCell>
                      <TableCell>{rotation?.MatchService}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <p></p>
          <Button
            variant="contained"
            color="primary"
            onClick={copyEmailsToClipboard}
            style={{ marginBottom: '10px' }}
          >
            Copy Emails to Clipboard
          </Button>
          <div className="container mt-4 text-center">
            <CPagination align="center">
              {/* Previous Button */}
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </CPaginationItem>

              {/* First Page */}
              {startPage > 1 && (
                <>
                  <CPaginationItem onClick={() => handlePageChange(1)}>1</CPaginationItem>
                  {startPage > 2 && <CPaginationItem disabled>...</CPaginationItem>}
                </>
              )}

              {/* Page Numbers */}
              {[...Array(endPage - startPage + 1)].map((_, index) => {
                const page = startPage + index;
                return (
                  <CPaginationItem
                    key={page}
                    active={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </CPaginationItem>
                );
              })}

              {/* Last Page */}
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <CPaginationItem disabled>...</CPaginationItem>}
                  <CPaginationItem onClick={() => handlePageChange(totalPages)}>{totalPages}</CPaginationItem>
                </>
              )}

              {/* Next Button */}
              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </TableContainer>
        <Dialog
          open={open}
          onClose={handleCancel}
        >
          <DialogTitle>Operation Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {OperationMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </CenteredBoxInfo>
    </CenteredBox>
  );
};

export default UserDetails;