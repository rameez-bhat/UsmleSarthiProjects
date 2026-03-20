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
import {
  collection,
  query,
  orderBy,
  doc,
  limit,
  startAfter,
  getDocs,
  updateDoc,
  or,
  where,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase' // <-- your firebase init exporting `db` (Firestore)

export default function CoreUIFirestoreTable({ collectionName = 'Rotations', pageSize = 100 }) {
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

    try {
      const colRef = collection(db, collectionName)

      let q
      //const text = searchText.trim().toLowerCase()
      const text = searchText.trim()

      // If searching, build OR query
      if (text) {
        const searchConditions = or(
           where('location_code', '>=', text)
        )
        if (targetPageIndex === 0) {
          q = query(colRef, searchConditions, orderBy('location_code'), limit(pageSize + 1))
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(colRef, searchConditions, orderBy('location_code'), startAfter(cursor), limit(pageSize + 1))
        }
      } else {
        // Default query (no search)
        if (targetPageIndex === 0) {
          q = query(colRef, orderBy('location_code'), limit(pageSize + 1))
        } else {
          const cursor = knownCursors[targetPageIndex - 1]
          q = query(colRef, orderBy('location_code'), startAfter(cursor), limit(pageSize + 1))
        }
      }

      const snap = await getDocs(q)
      let docs = snap.docs

      let pageHasNext = docs.length > pageSize
      let pageDocs = pageHasNext ? docs.slice(0, pageSize) : docs

      let allRows = pageDocs.map((d) => ({ id: d.id, ...d.data() }))
     /* console.log("allRows--->",allRows)
      const duplicateGroups = getDuplicateGroups(allRows);
      const mergedDuplicates = mergeDuplicateGroups(duplicateGroups);
      for (const [locationCode, rows] of Object.entries(duplicateGroups)) {
      console.log("locationCode--->",locationCode)
      console.log("rows--->",rows)
      const mergedData=mergedDuplicates[locationCode];
      if (!mergedData) continue;
      const { id, ...dataToUpdate } = mergedData;
      for (const row of rows) {
        console.log("row --->", row);
        const DocumentId=row.id
        
        mergedData['id']=DocumentId;
        console.log("mergedData==>",mergedData);
       await updateDoc(
            doc(db, "Rotations", DocumentId),
            {
                ...mergedData,
                lastMergedAt: new Date(),
                updatedAt: new Date(),
            }
        );
    }
      }

console.log("Duplicate Groups --->", duplicateGroups);
console.log("Merged Duplicates --->", mergedDuplicates);*/
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
function getDuplicateGroups(allRows) {
    const map = {};

    for (const row of allRows) {
        const code = row.location_code?.trim();
        if (!code) continue;

        if (!map[code]) {
            map[code] = [];
        }
        map[code].push(row);
    }

    // Keep ONLY duplicates
    Object.keys(map).forEach(code => {
        if (map[code].length === 1) {
            delete map[code];
        }
    });

    return map; // { location_code: [row1, row2, ...] }
}
function mergeDuplicateGroups(duplicateGroups) {
    const mergedDuplicates = {};

    Object.values(duplicateGroups).forEach(rows => {
        const base = { ...rows[0] };
        base.mergedFromIds = rows.map(r => r.id);

        rows.slice(1).forEach(row => {
            Object.keys(row).forEach(key => {
                if (key === "id") return;

                const incoming = row[key];
const existing = base[key];

// normalize incoming value
let normalizedIncoming = incoming;

// Trim ONLY if it's a string
if (typeof incoming === "string") {
    normalizedIncoming = incoming.trim();
}

// Merge only when base is empty
if (
    (existing === null || existing === undefined || existing === "") &&
    normalizedIncoming !== null &&
    normalizedIncoming !== undefined &&
    normalizedIncoming !== ""
) {
    base[key] = normalizedIncoming;
}
            });
        });

        mergedDuplicates[base.location_code]=base;
    });

    return mergedDuplicates;
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
  function handleEdit(row) {
    // Navigate to a separate edit page, passing location_code as a param
    navigate(`/admin/editrotation/${row.location_code}`)
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
            <CTableHeaderCell scope="col">Location Code</CTableHeaderCell>
            <CTableHeaderCell scope="col">Duration</CTableHeaderCell>
            <CTableHeaderCell scope="col">Type</CTableHeaderCell>
            <CTableHeaderCell scope="col">View Order</CTableHeaderCell>
            <CTableHeaderCell scope="col">Rotation Setting</CTableHeaderCell>
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
                <CTableDataCell>{row.location_code || '-'}</CTableDataCell>
                <CTableDataCell>{row.duration || '-'}</CTableDataCell>
                <CTableDataCell>{row.type || '-'}</CTableDataCell>
                <CTableDataCell>{row.rank || ''}</CTableDataCell>
                <CTableDataCell>{row.rotation_setting || '-'}</CTableDataCell>
               <CTableDataCell>
                  <CButton size="sm" onClick={() => handleEdit(row)}>Edit</CButton>
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
