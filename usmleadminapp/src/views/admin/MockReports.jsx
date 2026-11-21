import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, TextField, MenuItem, Stack, Alert, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip, CircularProgress } from '@mui/material';
import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, Timestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';

// Adjust only if your enrollment date is stored at a different path.
const ENROLLMENT_DATE_PATHS = ['Match.EnrollmentDate', 'Match.EnrolmentDate', 'Match.Plan.EnrollmentDate', 'Match.Plan.EnrolmentDate', 'EnrollmentDate', 'EnrolmentDate', 'enrollmentDate', 'enrolmentDate', 'createdAt', 'CreatedAt'];
const PAGE_SIZE = 250;
const SAVED_FILTER_ID = 'mockfilterpage';
const getPath = (obj, path) => path.split('.').reduce((v, k) => v?.[k], obj);
const parseDate = value => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) { const d = new Date(+dmy[3], +dmy[2]-1, +dmy[1]); return Number.isNaN(d.getTime()) ? null : d; }
    const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};
const dateKey = value => {
  const d = parseDate(value);
  return d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
};
const showDate = value => dateKey(value) || '—';
const escapeCSV = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const downloadCSV = (columns, rows, filename) => {
  const csv = [columns.map(escapeCSV).join(','), ...rows.map(row => columns.map(c => escapeCSV(row[c])).join(','))].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function MockReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [report, setReport] = useState('pending');
  const [plan, setPlan] = useState('all');
  const [panelist, setPanelist] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [enrollmentPath, setEnrollmentPath] = useState(ENROLLMENT_DATE_PATHS[0]);
  const [unresolved, setUnresolved] = useState(0);
  const [rawStudents, setRawStudents] = useState([]);
  const [rawServices, setRawServices] = useState(new Map());
  const [initializing, setInitializing] = useState(true);
  const [savingFilters, setSavingFilters] = useState(false);
  const [notice, setNotice] = useState('');

  // Enrollment field changes only rebuild local rows; no Firestore re-fetch.
  useEffect(() => {
    if (!loaded) return;
    let missing = 0;
    const flat = [];
    for (const u of rawStudents) {
      const svc = rawServices.get(u.id) || {};
      const rawEnrollment = getPath(svc, enrollmentPath) ?? getPath(u, enrollmentPath);
      const enrollment = dateKey(rawEnrollment);
      if (!enrollment) missing++;
      const planName = svc.Match?.Plan?.Name || 'Not specified';
      const mocks = Array.isArray(u.studentMocks) ? u.studentMocks : [];
      const allowed = Number(u.studentMocksConfig?.totalMocksAllowed ?? 0);
      for (let i = 0; i < Math.max(mocks.length, allowed); i++) {
        const m = mocks[i] || {};
        flat.push({
          'Student UID': u.id, 'Student': u.displayName || u.name || '—', 'Email': u.email || '',
          'Plan': planName, 'Enrollment Date': enrollment, 'Mock': m.title || `Mock Interview ${i + 1}`,
          'Status': m.isTaken === true ? 'Done' : 'Pending', 'Mock Date': dateKey(m.takenDate),
          'Panelist': m.mentorName || m.mentorEmail || 'Unassigned',
          'Panelist Email': m.mentorEmail || '', 'Assigned As': m.AssignMentorSelect || '',
          'Mock With PD': m.MockTypePd === 'yes' ? 'Yes' : 'No'
        });
      }
    }
    setRows(flat);
    setUnresolved(missing);
  }, [loaded, rawStudents, rawServices, enrollmentPath]);

  const saveFilters = async () => {
    setSavingFilters(true);
    setError('');
    setNotice('');
    try {
      const asTimestamp = (value) => value ? Timestamp.fromDate(new Date(`${value}T12:00:00`)) : null;
      await setDoc(doc(db, 'SavedFilters', SAVED_FILTER_ID), {
        startDate: asTimestamp(from),
        endDate: asTimestamp(to),
        Cond: report,
        filtertype: 'mockfilterpage',
        DynamicField: '',
        filterName: 'Mock Reports',
        direction: 'whereor',
        report, plan, panelist, search, enrollmentPath,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      setNotice('Mock report filters saved successfully.');
    } catch (e) {
      console.error('Unable to save mock filters:', e);
      setError(e.message || 'Unable to save filters');
    } finally {
      setSavingFilters(false);
    }
  };


  const load = useCallback(async () => {
    setLoading(true); setError(''); setLoaded(false);
    try {
      // Query only students with allocated mocks. The nested map field is numeric.
      // Pagination uses the same ordering across all batches.
      const students = [];
      let cursor = null;
      do {
        const constraints = [
          where('studentMocksConfig.totalMocksAllowed', '>', 0),
          orderBy('studentMocksConfig.totalMocksAllowed'),
          orderBy(documentId()),
          limit(PAGE_SIZE),
        ];
        if (cursor) constraints.push(startAfter(cursor));
        const snap = await getDocs(query(collection(db, 'Users'), ...constraints));
        snap.forEach(docSnap => students.push({ ...docSnap.data(), id: docSnap.id }));
        cursor = snap.size === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
      } while (cursor);

      const services = new Map();
      // Fetch matching service docs in batches; document IDs correspond to student UIDs.
      for (let i = 0; i < students.length; i += 30) {
        const ids = students.slice(i, i+30).map(s => s.id);
        if (!ids.length) continue;
        const snap = await getDocs(query(collection(db, 'UserServices'), where(documentId(), 'in', ids)));
        snap.forEach(d => services.set(d.id, d.data()));
      }
      setRawStudents(students);
      setRawServices(services);
      setLoaded(true);
    } catch (e) { console.error(e); setError(e.message || 'Unable to load mock records'); }
    finally { setLoading(false); }
  }, []);

  // Restore saved selections first, then fetch data once on initial mount.
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const saved = await getDoc(doc(db, 'SavedFilters', SAVED_FILTER_ID));
        if (active && saved.exists()) {
          const f = saved.data();
          const validReports = ['pending', 'byDate', 'byPanelist', 'panelistDate'];
          const savedReport = f.report || f.Cond;
          if (validReports.includes(savedReport)) setReport(savedReport);
          if (typeof f.plan === 'string') setPlan(f.plan);
          if (typeof f.panelist === 'string') setPanelist(f.panelist);
          if (typeof f.search === 'string') setSearch(f.search);
          if (ENROLLMENT_DATE_PATHS.includes(f.enrollmentPath)) setEnrollmentPath(f.enrollmentPath);
          setFrom(dateKey(f.startDate));
          setTo(dateKey(f.endDate));
        }
      } catch (e) {
        console.warn('Could not restore mock report filters:', e);
        if (active) setNotice('Saved filters could not be restored; loading with default filters.');
      } finally {
        if (active) setInitializing(false);
        if (active) load();
      }
    };
    initialize();
    return () => { active = false; };
  }, [load]);

  const plans = useMemo(() => [...new Set(rows.map(r => r.Plan))].sort(), [rows]);
  const panelists = useMemo(() => [...new Set(rows.filter(r => r['Assigned As'] === 'panelist' && r['Panelist Email']).map(r => r['Panelist Email']))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter(r => {
    if (plan !== 'all' && r.Plan !== plan) return false;
    if (report === 'pending' ? r.Status !== 'Pending' : r.Status !== 'Done') return false;
    if ((report === 'panelistDate' || report === 'byPanelist') && r['Assigned As'] !== 'panelist') return false;
    if (panelist !== 'all' && r['Panelist Email'] !== panelist) return false;
    const date = report === 'pending' ? r['Enrollment Date'] : r['Mock Date'];
    if (from && (!date || date < from)) return false;
    if (to && (!date || date > to)) return false;
    const haystack = `${r.Student} ${r.Email} ${r['Student UID']} ${r.Panelist}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }).sort((a,b) => (report === 'pending' ? a['Enrollment Date'].localeCompare(b['Enrollment Date']) : a['Mock Date'].localeCompare(b['Mock Date'])) || a.Student.localeCompare(b.Student)), [rows, report, plan, panelist, from, to, search]);
  const columns = report === 'pending'
    ? ['Student', 'Email','Panelist','Panelist Email', 'Plan', 'Enrollment Date', 'Mock', 'Status']
    : report === 'byDate'
      ? ['Mock Date', 'Student', 'Email', 'Plan', 'Mock', 'Panelist', 'Assigned As']
      : report === 'byPanelist'
        ? ['Panelist', 'Panelist Email', 'Student', 'Plan', 'Mock', 'Mock Date']
        : ['Panelist', 'Panelist Email', 'Mock Date', 'Student', 'Plan', 'Mock'];
  const totalStudents = new Set(filtered.map(r => r['Student UID'])).size;
  const groupKey = report === 'pending' ? 'Plan' : report === 'byDate' ? 'Mock Date' : 'Panelist';
  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of filtered) map.set(r[groupKey] || 'Not specified', (map.get(r[groupKey] || 'Not specified') || 0) + 1);
    return [...map.entries()].sort((a,b) => a[0].localeCompare(b[0]));
  }, [filtered, groupKey]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mock Reports
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Reports use Users.studentMocks for students with allocated mocks.
        Saved filters are restored automatically. Refresh only when new data is needed.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
          <TextField
            select label="Report" size="small" value={report}
            onChange={(e) => { setReport(e.target.value); setPanelist("all"); }}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="pending">Plan → Enrollment Date → Mocks Pending</MenuItem>
            <MenuItem value="byDate">Mocks Done → Date</MenuItem>
            <MenuItem value="byPanelist">Mocks Done → Panelist</MenuItem>
            <MenuItem value="panelistDate">Panelist → Mocks Done → Date</MenuItem>
          </TextField>
          <TextField select label="Plan" size="small" value={plan}
            onChange={(e) => setPlan(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="all">All Plans</MenuItem>
            {plans.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          {report !== "pending" && (
            <TextField select label="Panelist" size="small" value={panelist}
              onChange={(e) => setPanelist(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="all">All Panelists</MenuItem>
              {panelists.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          )}
          <TextField label={report === "pending" ? "Enrollment From" : "Mock Date From"}
            type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }} />
          <TextField label={report === "pending" ? "Enrollment To" : "Mock Date To"}
            type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }} />
          <TextField label="Search student / email" size="small" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
          <TextField select size="small" label="Enrollment date field"
            value={enrollmentPath} onChange={(e) => setEnrollmentPath(e.target.value)}
            sx={{ minWidth: 320 }}>
            {ENROLLMENT_DATE_PATHS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <Button variant="contained" disabled={loading || initializing} onClick={load}>
            {loading ? <CircularProgress size={22} /> : "Refresh Data"}
          </Button>
          <Button variant="outlined" disabled={savingFilters || initializing} onClick={saveFilters}>
            {savingFilters ? <CircularProgress size={22} /> : "Save Filters"}
          </Button>
          <Button variant="outlined" disabled={!loaded || !filtered.length}
            onClick={() => downloadCSV(columns, filtered, `MockReports_${report}.csv`)}>
            Export CSV
          </Button>
        </Stack>
      </Paper>

      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {(loading || initializing) && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading mock reports...</Typography>
        </Stack>
      )}
      {loaded && report === "pending" && unresolved > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Enrollment date not found for {unresolved} student(s) using {enrollmentPath}.
          Verify the field path before using enrollment-date filtering.
          Missing dates are excluded when a date range is selected.
        </Alert>
      )}
      {loaded && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`${filtered.length} ${report === "pending" ? "Pending" : "Completed"} Mocks`} />
          <Chip label={`${totalStudents} Students`} />
        </Stack>
      )}
      {loaded && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Summary by {groupKey}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {grouped.map(([key, value]) => (
              <Chip key={key} label={`${key}: ${value}`} variant="outlined" />
            ))}
          </Stack>
        </Paper>
      )}
      {loaded && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 700 }}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((record, index) => (
                <TableRow key={`${record["Student UID"]}-${record.Mock}-${index}`} hover>
                  {columns.map((column) => (
                    <TableCell key={column}>{record[column] ?? "—"}</TableCell>
                  ))}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">No matching mocks</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
