import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CSpinner,
  CPagination,
  CPaginationItem,
  CInputGroup,
  CFormInput,
} from '@coreui/react'
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, CircularProgress,Select, MenuItem, FormControl, InputLabel ,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  or,
  where,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase' // <-- your firebase init exporting `db` (Firestore)

export default function CoreUIFirestoreTable({ collectionName="MatchPlans", pageSize = 100 }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  // pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [cursors, setCursors] = useState([])
  const [hasNext, setHasNext] = useState(true)

  // search state
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    setPageIndex(0)
    setCursors([])
    fetchPage(0, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, pageSize, searchText])
  async function fetchPage(targetPageIndex, knownCursors) {
    setLoading(true)
    setError(null)
	let colRef;
    try {
      		//colRef = collection(db, collectionName)
       		if (typeof collectionName === "string") 
       		{
    			colRef = collection(db, collectionName);
  			} 
  			else if (Array.isArray(collectionName)) 
  			{
    			if (collectionName.length >= 1 && collectionName.length <= 5) 
    			{
      				colRef = collection(db, ...collectionName);
    			} 
    			else 
    			{
      				throw new Error("Invalid Firestore collection path array");
    			}
  			} 
  			else 
  			{
    			throw new Error("mainCollectionName must be a string or array");
  			}

      let q
      //const text = searchText.trim().toLowerCase()
      const text = searchText.trim()
	  let searchConditions;
      // If searching, build OR query
      if (text) {
        	and(
    where("Type", "!=", "Type"),
    or(
      where("Name", ">=", text)
    )
  );
        if (targetPageIndex === 0) {
          q = query(colRef, searchConditions, orderBy('Name'), limit(pageSize + 1))
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(colRef, searchConditions, orderBy('Name'), startAfter(cursor), limit(pageSize + 1))
        }
      } else {
        // Default query (no search)
        searchConditions = where("Type", "!=", "Type");
        if (targetPageIndex === 0) {
          q = query(colRef,searchConditions, orderBy('Name'), limit(pageSize + 1))
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(colRef,searchConditions, orderBy('Name'), startAfter(cursor), limit(pageSize + 1))
        }
      }

      const snap = await getDocs(q)
      let docs = snap.docs

      let pageHasNext = docs.length > pageSize
      let pageDocs = pageHasNext ? docs.slice(0, pageSize) : docs

      let allRows = pageDocs.map((d) => ({ id: d.id, ...d.data() }))

      setRows(allRows)

      const newCursors = [...knownCursors]
      if (pageDocs.length > 0) {
        const lastVisible = pageDocs[pageDocs.length - 1]
        newCursors[targetPageIndex] = lastVisible
      }

      setCursors(newCursors)
      setHasNext(pageHasNext)
      setPageIndex(targetPageIndex)
    } catch (err) {
      console.error(err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (!hasNext) return
    const nextPage = pageIndex + 1
    fetchPage(nextPage, cursors)
  }

  function handlePrev() {
    if (pageIndex === 0) return
    const prevPage = pageIndex - 1
    fetchPage(prevPage, cursors)
  }
  const handleDeleteUser = async (item) => {
  console.log("item.id---->",item)
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${item.Type} Plan ${item.Name || item.Pid}`
  );

  if (!confirmDelete) return;

  try {
    showLoading();

    // Delete from UsersRoles
  	await DeleteDocumentWhere("MatchPlans","Pid","==", item.Pid);

    //setData(prev => prev.filter(d => d.id !== item.id));

    alert("Plan deleted successfully");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete user");
  } finally {
    hideLoading();
  }
};
  function handleEdit(row) {
    // Navigate to a separate edit page, passing location_code as a param
    navigate(`/admin/editmatch/${row.Pid}`)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4>Records - {collectionName}</h4>
        <CInputGroup style={{ width: 320 }}>
          <CFormInput
            placeholder="Search By Location Code"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </CInputGroup>
      </div>

      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Plan Name</CTableHeaderCell>
            <CTableHeaderCell scope="col">Plan Fee</CTableHeaderCell>
            <CTableHeaderCell scope="col">View Order</CTableHeaderCell>
            <CTableHeaderCell scope="col">Type</CTableHeaderCell>
            <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {loading ? (
            <CTableRow>
              <CTableDataCell colSpan={6} style={{ textAlign: 'center' }}>
                <CSpinner />
              </CTableDataCell>
            </CTableRow>
          ) : rows.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={6}>No records found.</CTableDataCell>
            </CTableRow>
          ) : (
            rows.map((row, idx) => (
              <CTableRow key={row.id}>
                <CTableDataCell>{pageIndex * pageSize + idx + 1}</CTableDataCell>
                <CTableDataCell>{row.Name || '-'}</CTableDataCell>
                <CTableDataCell>{row.fee || '-'}</CTableDataCell>
                <CTableDataCell>{row.rank || '-'}</CTableDataCell>
                <CTableDataCell>{row.Type || '-'}</CTableDataCell>
                <CTableDataCell>{row.ActiveInActive || 'Active'}</CTableDataCell>
               <CTableDataCell>
                  <Button
    size="small"
    color="success"
    variant="outlined"
    onClick={() => handleEdit(row)}
    sx={{ mr: 1 }}
  >
    Edit
  </Button>
                   <Button
    size="small"
    color="error"
    variant="outlined"
    onClick={() => handleDeleteUser(row)}
    sx={{ mr: 1 }}
  >
    Delete
  </Button>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div>
          <CButton color="secondary" disabled={pageIndex === 0 || loading} onClick={handlePrev} style={{ marginRight: 8 }}>
            Previous
          </CButton>
          <CButton color="primary" disabled={!hasNext || loading} onClick={handleNext}>
            Next
          </CButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <small style={{ marginRight: 12 }}>Page: {pageIndex + 1}</small>

          <CPagination aria-label="Page navigation example" size="sm">
            <CPaginationItem disabled={pageIndex === 0} onClick={() => fetchPage(0, cursors)}>
              1
            </CPaginationItem>
          </CPagination>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  )
}
