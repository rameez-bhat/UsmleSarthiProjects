import { useEffect, useState } from 'react';
import { specialties } from '../../config/app';
import { programStatusLabel } from '../../utils/labels';

function fmt(value:any){
  try { if(value?.toDate) return value.toDate().toLocaleDateString(); if(value?.seconds) return new Date(value.seconds*1000).toLocaleDateString(); if(value) return new Date(value).toLocaleDateString(); } catch(_){}
  return '—';
}

export default function Dashboard({ assessments, createAssessment, resume, archiveAssessment, message }: any) {
  const existing=new Set(assessments.filter((x:any)=>!x.archived_at).map((x:any)=>String(x.specialty||'')));
  const first=specialties.find(x=>!existing.has(x))||'';
  const [specialty,setSpecialty]=useState(first);
  useEffect(()=>{if(!specialty||existing.has(specialty))setSpecialty(specialties.find(x=>!existing.has(x))||'');},[assessments]);
  const visible=assessments.filter((x:any)=>!x.archived_at);

  return <>
    <div className="pageTitle"><div><div className="eyebrow">Sarthi SANKET</div><h1>Your signaling workspace</h1><p className="muted">Program Signaling Tool · one active assessment per specialty.</p></div></div>
    {message&&<div className="notice danger">{message}</div>}
    <div className="card"><h3>Start new assessment</h3><div className="actions"><select value={specialty} onChange={e=>setSpecialty(e.target.value)}><option value="">Select specialty</option>{specialties.map(x=><option key={x} value={x} disabled={existing.has(x)}>{x}{existing.has(x)?' — already started':''}</option>)}</select><button disabled={!specialty} onClick={()=>createAssessment(specialty)}>Start new assessment</button></div></div>
    <div className="grid">{visible.map((a:any)=><div className="card" key={a.id}><span className="badge">{programStatusLabel(a.workspace_status || (a.status==='DRAFT'?'IN_PROGRESS':a.status))}</span><h3>{a.specialty}</h3><p className="muted">Match {a.season||2027}</p><p><b>{a.selected_count||0}</b> programs selected · <b>{a.assessed_count||0}</b> assessed</p><p className="muted">Last updated {fmt(a.updated_at)}</p><div className="actions"><button className="secondary" onClick={()=>resume(a)}>Resume assessment</button><button className="ghost" onClick={()=>archiveAssessment?.(a)}>Archive</button></div></div>)}</div>
    {!visible.length&&<div className="card empty">No active assessments yet.</div>}
  </>;
}
