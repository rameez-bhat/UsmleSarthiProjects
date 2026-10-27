import React, { useEffect, useMemo, useState } from 'react';
import {
  collection, doc, getDoc, getDocs, query, where, limit,
  Timestamp, documentId, setDoc, serverTimestamp
} from 'firebase/firestore';
import {
  Box, Button, Paper, Typography, TextField, MenuItem, Grid,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Alert, CircularProgress, Chip
} from '@mui/material';
// CHANGE THIS IMPORT to match the Firebase initialization file in your project.
import { db } from '../../firebase';

const SAVED_ID = 'physicianpaymentsreport';
const MAX_DAYS = 93;
const MAX_PER_SLOT = 150;
const EMPTY = {
  rotationPeriod: 'month', rotationFrom: '', rotationTo: '',
  duePeriod: 'all', dueFrom: '', dueTo: '',
  physician: '', site: '', student: '', rotationStatus: '',
  studentPaymentStatus: '', physicianPaymentStatus: '',
  paymentDateFrom: '', paymentDateTo: '', paymentMethod: '', teamMember: ''
};
const dateValue = v => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const dateStr = v => { const d = dateValue(v); return d ? d.toLocaleDateString('en-GB') : ''; };
const iso = d => {
  if (!d) return '';
  const x = dateValue(d);
  if (!x) return '';
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
};
const money = n => Number(n || 0).toLocaleString('en-US', {style:'currency',currency:'USD'});
const num = n => Number.isFinite(Number(n)) ? Number(n) : 0;
const val = v => typeof v === 'object' && v !== null ? (v.value ?? v.label ?? '') : (v ?? '');
const entries = o => Object.entries(o || {}).filter(([,v]) => v && typeof v === 'object');
const chunk = (xs,n=10) => Array.from({length:Math.ceil(xs.length/n)},(_,i)=>xs.slice(i*n,i*n+n));
const startOf = (d) => new Date(d.getFullYear(),d.getMonth(),d.getDate());
const addDays = (d,n) => {const v = new Date(d);v.setDate(v.getDate()+n);return v;};
function periodRange(period, from, to) {
  const today = startOf(new Date());
  if (period === 'all') return null;
  if (period === 'custom') {
    if (!from || !to) throw new Error('Select both dates for a custom range.');
    const a = startOf(new Date(`${from}T00:00:00`));
    const b = startOf(new Date(`${to}T00:00:00`));
    if (a > b) throw new Error('Start date must not exceed end date.');
    return [a,addDays(b,1)];
  }
  if (period === 'today') return [today,addDays(today,1)];
  if (period === 'week') {
    const monday = addDays(today,-((today.getDay()+6)%7));
    return [monday,addDays(monday,7)];
  }
  if (period === 'month') return [new Date(today.getFullYear(),today.getMonth(),1),new Date(today.getFullYear(),today.getMonth()+1,1)];
  return null;
}
function inRange(v, range) {
  if (!range) return true;
  const d = dateValue(v);
  return !!d && d >= range[0] && d < range[1];
}
const intersect = (a,b) => {
  if (!a) return b;
  if (!b) return a;
  const start = new Date(Math.max(a[0].getTime(),b[0].getTime()));
  const end = new Date(Math.min(a[1].getTime(),b[1].getTime()));
  return start < end ? [start,end] : null;
};
const normalizeStatus = s => {
  const t = String(s || '').toLowerCase();
  if (t.includes('hold')) return 'On Hold';
  if (t.includes('approved')) return 'Approved';
  if (t.includes('paid')) return 'Paid';
  return 'Pending';
};
const getName = u => u?.displayName || u?.name || u?.Name || u?.StudentName || '';
const safeCSV = x => {
  const s = String(x ?? '');
  const guarded = /^[\s]*[=+@\-]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g,'""')}"`;
};
function exportCSV(filename, columns, rows) {
  const csv = [columns.map(safeCSV).join(','),...rows.map(r=>r.map(safeCSV).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a');a.href=url;a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}

export default function PhysicianPaymentsReport() {
  const [filters,setFilters] = useState(EMPTY);
  const [rows,setRows] = useState([]);
  const [batches,setBatches] = useState([]);
  const [busy,setBusy] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [truncated,setTruncated] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const change = (key,value) => setFilters(old=>({...old,[key]:value}));

  useEffect(()=>{
    let alive = true;
    (async()=>{
      try {
        const snap = await getDoc(doc(db,'SavedFilters',SAVED_ID));
        if (!alive || !snap.exists()) return;
        const saved = snap.data();
        setFilters({...EMPTY,...(saved.filters || {})});
      } catch(e) { if(alive) setNotice(`Saved filters could not be loaded: ${e.message}`); }
    })();
    return ()=>{alive=false;};
  },[]);

  const saveFilters = async()=>{
    setSaving(true);setError('');
    try {
      await setDoc(doc(db,'SavedFilters',SAVED_ID),{
        filtertype:'physicianpaymentsreport',filterName:'Physician Payments Report',
        filters,updatedAt:serverTimestamp()
      },{merge:true});
      setNotice('Filters saved. They will be restored the next time you open this page.');
    } catch(e) {setError(`Unable to save filters: ${e.message}`);} finally {setSaving(false);}
  };

  const load = async()=>{
    setError('');setNotice('');setLoaded(false);setTruncated(false);setBusy(true);
    try {
      const rotationRange = periodRange(filters.rotationPeriod,filters.rotationFrom,filters.rotationTo);
      const dueRange = periodRange(filters.duePeriod,filters.dueFrom,filters.dueTo);
      // Both date filters refer to the SAME rotation StartDate.
      if (!rotationRange && !dueRange) throw new Error('Select a bounded Rotation Start Date or Payment Due period to prevent excessive Firestore reads.');
      const combined = intersect(rotationRange,dueRange);
      if (!combined) {setRows([]);setBatches([]);setLoaded(true);return;}
      const days = (combined[1]-combined[0])/86400000;
      if (days > MAX_DAYS) throw new Error(`Please select a period of ${MAX_DAYS} days or less to protect Firestore quota.`);
      const lower = Timestamp.fromDate(combined[0]);
      const upper = Timestamp.fromDate(combined[1]);
      const docsById = new Map();
      let hitCap = false;
      // Six narrowly bounded indexed queries, NOT an unbounded collection read.
      // Firestore may ask you to create a composite index for a specific query.
      for (let i=0;i<=5;i++) {
        const field = `RotationData.Rotations.Rotation${i}.StartDate`;
        const snap = await getDocs(query(collection(db,'UserServices'),
          where(field,'>=',lower),where(field,'<',upper),limit(MAX_PER_SLOT)));
        if (snap.size===MAX_PER_SLOT) hitCap=true;
        snap.forEach(d=>docsById.set(d.id,{id:d.id,...d.data()}));
      }
      setTruncated(hitCap);
      const rotations = [];
      docsById.forEach((service,uid)=>{
        entries(service?.RotationData?.Rotations).forEach(([rotationKey,r])=>{
          if (!inRange(r.StartDate,combined)) return;
          const site = String(val(r.LocationCode));
          if (!site) return;
          rotations.push({uid,rotationKey,rotation:r,service,site});
        });
      });
      if (!rotations.length) {setRows([]);setBatches([]);setLoaded(true);return;}
      const siteCodes = [...new Set(rotations.map(r=>r.site))];
      const siteMap = new Map();
      for (const codes of chunk(siteCodes,10)) {
        const s = await getDocs(query(collection(db,'Rotations'),where('location_code','in',codes)));
        s.forEach(d=>siteMap.set(d.data().location_code,{id:d.id,...d.data()}));
      }
      // Only the doctors referenced by matching rotation sites are fetched.
      const physicianIds = [...new Set([...siteMap.values()].map(r=>r.DoctorDetails?.id).filter(Boolean))];
      const physicianMap = new Map();
      for (const ids of chunk(physicianIds,10)) {
        const s = await getDocs(query(collection(db,'RotationDoctors'),where(documentId(),'in',ids)));
        s.forEach(d=>physicianMap.set(d.id,{id:d.id,...d.data()}));
      }
      // User profiles are joined by document ID; if your Users IDs differ from
      // UserServices IDs, change this lookup to your actual relationship.
      const userMap = new Map();
      for (const ids of chunk([...docsById.keys()],10)) {
        const s = await getDocs(query(collection(db,'Users'),where(documentId(),'in',ids)));
        s.forEach(d=>userMap.set(d.id,{id:d.id,...d.data()}));
      }
      // Canonical payment batches: each PaymentN.Amount is counted exactly once.
      const paymentBatches = [];
      physicianMap.forEach((physician,physicianId)=>{
        entries(physician?.DoctorInfo?.Payments).forEach(([paymentKey,p])=>{
          const list = p.List || {};
          const links = [];
          Object.entries(list).forEach(([uid,locations])=>{
            Object.keys(locations || {}).forEach(code=>links.push(`${uid}|${code}`));
          });
          paymentBatches.push({
            id:`${physicianId}|${paymentKey}`,physicianId,paymentKey,
            physician:physician.DoctorInfo?.representingName || physician.DoctorInfo?.doctorName || physician.DoctorInfo?.adminName || physicianId,
            amount:num(p.PaymentDetails?.Amount),paymentDate:p.PaymentDetails?.PaymentDate,
            method:String(val(p.PaymentDetails?.ModeOfPayment)),
            notes:p.PaymentDetails?.Notes || '',links,
            studentCount:new Set(links.map(x=>x.split('|')[0])).size
          });
        });
      });
      const result = rotations.map(x=>{
        const site = siteMap.get(x.site);
        const physicianId = site?.DoctorDetails?.id || '';
        const doctor = physicianMap.get(physicianId);
        const profile = userMap.get(x.uid) || x.service.profile || {};
        const matchingBatches = paymentBatches.filter(b=>b.physicianId===physicianId && b.links.includes(`${x.uid}|${x.site}`));
        const studentPayments = entries(x.rotation.RotationPayment).map(([,p])=>p);
        const studentPaid = studentPayments.reduce((sum,p)=>sum+(String(p.FeeType||'').toLowerCase()==='application fee'?0:num(p.Amount)),0);
        const rate = site?.PhysicianToBePaid;
        return {
          id:`${x.uid}|${x.rotationKey}`,uid:x.uid,rotationKey:x.rotationKey,
          student:getName(profile) || x.uid,studentId:profile.StudentUniqueId || '',
          email:profile.email || '',site:x.site,siteTitle:site?.title || '',
          physicianId,physician:doctor?.DoctorInfo?.representingName || doctor?.DoctorInfo?.doctorName || site?.DoctorDetails?.representingEmail || '',
          startDate:x.rotation.StartDate,rotationStatus:String(val(x.rotation.RotationStatus)),
          paymentStatusRaw:String(val(x.rotation.RotationPaymentStatus)),
          paymentStatus:normalizeStatus(val(x.rotation.RotationPaymentStatus)),
          studentCharged:site?.StudentToBeCharged==null?null:num(site.StudentToBeCharged),
          studentPaid,physicianRate:rate==null?null:num(rate),
          batchIds:matchingBatches.map(b=>b.id),
          physicianPaymentStatus:matchingBatches.length?'Included in payment batch':'Not recorded',
          teamMember:'' // No confirmed Team Member Firestore path was supplied.
        };
      });
      setRows(result);setBatches(paymentBatches);setLoaded(true);
      if(hitCap) setNotice('Result limit reached for at least one rotation slot. Narrow the date range: totals may be incomplete.');
    } catch(e) {
      console.error('Physician payment report:',e);
      setError(e.code==='resource-exhausted'
        ? 'Firestore quota exceeded. Wait until quota is available or review billing and usage. No automatic retries are performed.'
        : e.message);
    } finally {setBusy(false);}
  };

  const filteredRows = useMemo(()=>rows.filter(r=>{
    const contains=(a,b)=>String(a||'').toLowerCase().includes(String(b||'').trim().toLowerCase());
    if (filters.physician && !contains(r.physician,filters.physician)) return false;
    if (filters.site && !contains(`${r.site} ${r.siteTitle}`,filters.site)) return false;
    if (filters.student && !contains(`${r.student} ${r.studentId} ${r.email}`,filters.student)) return false;
    if (filters.rotationStatus && !contains(r.rotationStatus,filters.rotationStatus)) return false;
    if (filters.studentPaymentStatus && r.paymentStatus!==filters.studentPaymentStatus) return false;
    if (filters.physicianPaymentStatus && r.physicianPaymentStatus!==filters.physicianPaymentStatus) return false;
    if (filters.teamMember && !contains(r.teamMember,filters.teamMember)) return false;
    return true;
  }),[rows,filters]);
  const visibleBatchIds = useMemo(()=>new Set(filteredRows.flatMap(r=>r.batchIds)),[filteredRows]);
  const filteredBatches = useMemo(()=>batches.filter(b=>{
    if(!visibleBatchIds.has(b.id)) return false;
    if(filters.paymentMethod && b.method!==filters.paymentMethod) return false;
    if(filters.paymentDateFrom && (!dateValue(b.paymentDate) || iso(b.paymentDate)<filters.paymentDateFrom)) return false;
    if(filters.paymentDateTo && (!dateValue(b.paymentDate) || iso(b.paymentDate)>filters.paymentDateTo)) return false;
    return true;
  }),[batches,visibleBatchIds,filters]);
  const displayedRows = useMemo(()=>{
    const paymentFilterActive=!!(filters.paymentMethod||filters.paymentDateFrom||filters.paymentDateTo);
    return paymentFilterActive?filteredRows.filter(r=>r.batchIds.some(id=>filteredBatches.some(b=>b.id===id))):filteredRows;
  },[filteredRows,filteredBatches,filters]);
  const stats = useMemo(()=>({
    payable:displayedRows.reduce((s,r)=>s+num(r.physicianRate),0),
    studentCollected:displayedRows.reduce((s,r)=>s+r.studentPaid,0),
    paidBatches:filteredBatches.reduce((s,b)=>s+b.amount,0),
    unknownRates:displayedRows.filter(r=>r.physicianRate===null).length
  }),[displayedRows,filteredBatches]);
  const set = (key,label,options=null) => <TextField key={key} label={label} size="small" fullWidth select={!!options}
    value={filters[key]||''} onChange={e=>change(key,e.target.value)}>
    {options?.map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}
  </TextField>;
  const periodOptions=[['all','All (requires other bounded date filter)'],['today','Today'],['week','This Week'],['month','This Month'],['custom','Custom Range']];
  const field = (key,label,options=null) => <Grid item xs={12} sm={6} md={3}>{set(key,label,options)}</Grid>;
  const dateField = (key,label) => <Grid item xs={12} sm={6} md={3}><TextField size="small" fullWidth label={label} type="date"
    InputLabelProps={{shrink:true}} value={filters[key]||''} onChange={e=>change(key,e.target.value)}/></Grid>;
  const downloadRotations = ()=>exportCSV('Physician_Rotations_Report.csv',
    ['Student ID','Student Name','Email','Rotation','Location','Physician','Rotation Start / Due Date','Rotation Status','Student Payment Status','Student Fee','Student Paid (excl. application fee)','Physician Rate','Physician Payment Status','Linked Batch IDs'],
    displayedRows.map(r=>[r.studentId,r.student,r.email,r.rotationKey,r.site,r.physician,dateStr(r.startDate),r.rotationStatus,r.paymentStatusRaw,r.studentCharged??'',r.studentPaid,r.physicianRate??'',r.physicianPaymentStatus,r.batchIds.join('; ')]));
  const downloadBatches = ()=>exportCSV('Physician_Payment_Batches.csv',
    ['Physician','Payment ID','Payment Date','Amount','Payment Method','Students in Batch','Notes'],
    filteredBatches.map(b=>[b.physician,b.paymentKey,dateStr(b.paymentDate),b.amount,b.method,b.studentCount,b.notes]));

  return <Box sx={{p:2}}>
    <Typography variant="h5" sx={{mb:2}}>Physician Payments Report</Typography>
    <Paper sx={{p:2,mb:2}}>
      <Typography variant="subtitle1" sx={{mb:2}}>Filters</Typography>
      <Grid container spacing={2}>
        {field('rotationPeriod','Rotation Start Date',periodOptions)}
        {filters.rotationPeriod==='custom'&&<>{dateField('rotationFrom','Rotation From')}{dateField('rotationTo','Rotation To')}</>}
        {field('duePeriod','Payment Due to Physician (Rotation Start)',periodOptions.filter(x=>x[0]!=='today'))}
        {filters.duePeriod==='custom'&&<>{dateField('dueFrom','Due From')}{dateField('dueTo','Due To')}</>}
        {field('physician','Physician Name')}{field('site','Location Site / Code')}
        {field('student','Student Name / ID / Email')}{field('rotationStatus','Rotation Status')}
        {field('studentPaymentStatus','Student Payment Status',[['','All'],['Pending','Pending'],['Approved','Approved'],['Paid','Paid'],['On Hold','On Hold']])}
        {field('physicianPaymentStatus','Physician Payment Status',[['','All'],['Included in payment batch','Included in payment batch'],['Not recorded','Not recorded']])}
        {dateField('paymentDateFrom','Physician Payment Date From')}{dateField('paymentDateTo','Physician Payment Date To')}
        {field('paymentMethod','Physician Payment Method',[['','All'],...['Stripe','Zelle','Wire','Transfer','Cheque'].map(v=>[v,v])])}
        {field('teamMember','Team Member (unmapped)')}
      </Grid>
      <Box sx={{display:'flex',gap:1,flexWrap:'wrap',mt:2}}>
        <Button variant="contained" onClick={load} disabled={busy}>{busy?'Loading...':'Load / Refresh Report'}</Button>
        <Button variant="outlined" onClick={saveFilters} disabled={saving}>{saving?'Saving...':'Save Filters'}</Button>
        <Button variant="text" onClick={()=>setFilters(EMPTY)}>Reset Filters</Button>
      </Box>
    </Paper>
    {busy&&<CircularProgress size={24} sx={{mb:2}}/>}
    {!!error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    {!!notice&&<Alert severity={truncated?'warning':'info'} sx={{mb:2}}>{notice}</Alert>}
    <Alert severity="info" sx={{mb:2}}>
      Actual payments are counted once per RotationDoctors PaymentN batch. A batch may cover several students, so the report does not invent individual allocations or subtract whole batch payments from each student. Outstanding balance cannot be determined exactly for a filtered subset when batches also include students outside it.
    </Alert>
    {loaded&&<>
      <Grid container spacing={2} sx={{mb:2}}>
        {[
          ['Matching Rotations',displayedRows.length],
          ['Physician Rate Total',money(stats.payable)],
          ['Student Rotation Payments',money(stats.studentCollected)],
          ['Linked Physician Batch Payments',money(stats.paidBatches)]
        ].map(([label,value])=><Grid item xs={12} sm={6} md={3} key={label}><Paper sx={{p:2}}><Typography variant="caption">{label}</Typography><Typography variant="h6">{value}</Typography></Paper></Grid>)}
      </Grid>
      {stats.unknownRates>0&&<Alert severity="warning" sx={{mb:2}}>{stats.unknownRates} rotations have no matching PhysicianToBePaid rate; totals exclude their unknown rates.</Alert>}
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1,gap:1}}>
        <Typography variant="h6">Student Rotations</Typography><Button onClick={downloadRotations} variant="outlined">Export Rotations CSV</Button>
      </Box>
      <TableContainer component={Paper} sx={{mb:3,maxHeight:520}}><Table stickyHeader size="small">
        <TableHead><TableRow>{['Student','Location','Physician','Rotation Start / Due','Rotation Status','Student Payment Status','Student Paid','Physician Rate','Physician Payment','Linked Batches'].map(t=><TableCell key={t}>{t}</TableCell>)}</TableRow></TableHead>
        <TableBody>{displayedRows.map(r=><TableRow key={r.id} hover>
          <TableCell>{r.student}<Typography variant="caption" display="block">{r.studentId}</Typography></TableCell>
          <TableCell>{r.site}</TableCell><TableCell>{r.physician}</TableCell>
          <TableCell>{dateStr(r.startDate)}</TableCell><TableCell>{r.rotationStatus}</TableCell>
          <TableCell><Chip size="small" label={r.paymentStatusRaw||'Not specified'}/></TableCell>
          <TableCell>{money(r.studentPaid)}</TableCell><TableCell>{r.physicianRate===null?'Unknown':money(r.physicianRate)}</TableCell>
          <TableCell>{r.physicianPaymentStatus}</TableCell><TableCell>{r.batchIds.map(x=>x.split('|').pop()).join(', ')||'—'}</TableCell>
        </TableRow>)}{!displayedRows.length&&<TableRow><TableCell colSpan={10}>No matching rotations.</TableCell></TableRow>}</TableBody>
      </Table></TableContainer>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1,gap:1}}>
        <Typography variant="h6">Physician Payment Batches</Typography><Button onClick={downloadBatches} variant="outlined">Export Payments CSV</Button>
      </Box>
      <TableContainer component={Paper}><Table size="small"><TableHead><TableRow>
        {['Physician','Payment ID','Payment Date','Amount','Method','Students in Batch','Notes'].map(x=><TableCell key={x}>{x}</TableCell>)}
      </TableRow></TableHead><TableBody>{filteredBatches.map(b=><TableRow key={b.id}>
        <TableCell>{b.physician}</TableCell><TableCell>{b.paymentKey}</TableCell><TableCell>{dateStr(b.paymentDate)}</TableCell>
        <TableCell>{money(b.amount)}</TableCell><TableCell>{b.method}</TableCell><TableCell>{b.studentCount}</TableCell><TableCell>{b.notes}</TableCell>
      </TableRow>)}{!filteredBatches.length&&<TableRow><TableCell colSpan={7}>No linked payment batches.</TableCell></TableRow>}</TableBody></Table></TableContainer>
    </>}
  </Box>;
}
