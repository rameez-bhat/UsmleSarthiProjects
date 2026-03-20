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
import { Button } from '@mui/material'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'

export default function CoreUIFirestoreTable({
  collectionName = "Panelists",
  pageSize = 100
}) {

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [pageIndex, setPageIndex] = useState(0)
  const [cursors, setCursors] = useState([])
  const [hasNext, setHasNext] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    setPageIndex(0)
    setCursors([])
    fetchPage(0, [])
  }, [collectionName, pageSize, searchText])

  async function fetchPage(targetPageIndex, knownCursors) {
    setLoading(true)
    setError(null)

    try {
      let colRef

      if (typeof collectionName === "string") {
        colRef = collection(db, collectionName)
      } else if (Array.isArray(collectionName)) {
        colRef = collection(db, ...collectionName)
      } else {
        throw new Error("Invalid collection path")
      }

      let q
      const text = searchText.trim().toLowerCase()

      // 🔎 SEARCH QUERY
      if (text) {
        if (targetPageIndex === 0) {
          q = query(
            colRef,
            where("namesmall", ">=", text),
            where("namesmall", "<=", text + "\uf8ff"),
            orderBy("namesmall"),
            limit(pageSize + 1)
          )
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(
            colRef,
            where("namesmall", ">=", text),
            where("namesmall", "<=", text + "\uf8ff"),
            orderBy("namesmall"),
            startAfter(cursor),
            limit(pageSize + 1)
          )
        }
      }

      // 📄 DEFAULT QUERY
      else {
        if (targetPageIndex === 0) {
          q = query(
            colRef,
            orderBy("namesmall"),
            limit(pageSize + 1)
          )
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(
            colRef,
            orderBy("namesmall"),
            startAfter(cursor),
            limit(pageSize + 1)
          )
        }
      }

      const snap = await getDocs(q)
      const docs = snap.docs

      const pageHasNext = docs.length > pageSize
      const pageDocs = pageHasNext ? docs.slice(0, pageSize) : docs

      const allRows = pageDocs.map((d) => ({
        id: d.id,
        ...d.data()
      }))

      setRows(allRows)

      const newCursors = [...knownCursors]
      if (pageDocs.length > 0) {
        newCursors[targetPageIndex] =
          pageDocs[pageDocs.length - 1]
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
    fetchPage(pageIndex + 1, cursors)
  }

  function handlePrev() {
    if (pageIndex === 0) return
    fetchPage(pageIndex - 1, cursors)
  }

  function handleEdit(row) {
    navigate(`/admin/editpanelist/${row.id}`)
  }
  async function handleDelete(row) {

  const confirmDelete = window.confirm(
    `Are you sure you want to delete panelist "${row.name}" ?`
  )

  if (!confirmDelete) return

  try {
    setLoading(true)

    const docRef = doc(db, "Panelists", row.id)
    await deleteDoc(docRef)

    // 🔥 Refresh current page after delete
    fetchPage(pageIndex, cursors)

    alert("Panelist deleted successfully")

  } catch (error) {
    console.error("Delete error:", error)
    alert("Failed to delete panelist")
  } finally {
    setLoading(false)
  }
}

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4>Records - {collectionName}</h4>
        <CInputGroup style={{ width: 320 }}>
          <CFormInput
            placeholder="Search by Name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </CInputGroup>
      </div>

      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Panelist Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Created On</CTableHeaderCell>
            <CTableHeaderCell>Updated On</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
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
              <CTableDataCell colSpan={6}>
                No records found.
              </CTableDataCell>
            </CTableRow>
          ) : (
            rows.map((row, idx) => (
              <CTableRow key={row.id}>
                <CTableDataCell>
                  {pageIndex * pageSize + idx + 1}
                </CTableDataCell>
                <CTableDataCell>{row.name || '-'}</CTableDataCell>
                <CTableDataCell>{row.email || '-'}</CTableDataCell>
                <CTableDataCell>
                  {row.createdAt?.toDate?.().toLocaleString() || '-'}
                </CTableDataCell>
                <CTableDataCell>
                  {row.updatedAt?.toDate?.().toLocaleString() || '-'}
                </CTableDataCell>
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
    onClick={() => handleDelete(row)}
  >
    Delete
  </Button>
</CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <div>
          <CButton
            color="secondary"
            disabled={pageIndex === 0 || loading}
            onClick={handlePrev}
            style={{ marginRight: 8 }}
          >
            Previous
          </CButton>

          <CButton
            color="primary"
            disabled={!hasNext || loading}
            onClick={handleNext}
          >
            Next
          </CButton>
        </div>

        <small>Page: {pageIndex + 1}</small>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>
          {error}
        </div>
      )}

    </div>
  )
}