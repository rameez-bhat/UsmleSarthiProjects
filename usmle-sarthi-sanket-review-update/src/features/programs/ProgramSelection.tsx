import { useMemo, useState } from 'react';
import { getProgramName, getProgramCity, getProgramState } from './programUtils';
import { programStatusLabel, eligibilityStatusLabel, statusClass } from '../../utils/labels';
import './programs.css';

const score=(v:any)=>v===undefined||v===null?'—':Number(v).toFixed(1);

export default function ProgramSelection({ programs, programLoading, selected, addProgram, openProgram, viewProgramResult, removeProgram, message, specialty, onCompare, onBackToAssessments }: any) {
  const [search,setSearch]=useState(''); const [filter,setFilter]=useState('ALL'); const [sort,setSort]=useState('selected');
  const filtered=useMemo(()=>{const t=search.trim().toLowerCase(); return programs.filter((p:any)=>!t||[getProgramName(p),getProgramCity(p),getProgramState(p),p.Frieda].join(' ').toLowerCase().includes(t));},[programs,search]);
  const assessed=selected.filter((p:any)=>p.status==='ASSESSED' || p.has_result).length;
  const rows=useMemo(()=>{
    let out=[...selected]; if(filter!=='ALL') out=out.filter((p:any)=>(p.status||'ADDED')===filter);
    if(sort==='score') out.sort((a:any,b:any)=>(b.result?.final_priority?.score||-1)-(a.result?.final_priority?.score||-1));
    if(sort==='name') out.sort((a:any,b:any)=>String(a.program_name).localeCompare(String(b.program_name)));
    if(sort==='status') out.sort((a:any,b:any)=>programStatusLabel(a.status).localeCompare(programStatusLabel(b.status)));
    return out;
  },[selected,filter,sort]);

  const actionLabel=(p:any)=>{const s=p.status||'ADDED'; if(s==='ASSESSED'||p.has_result)return 'View result'; if(s==='IN_PROGRESS')return 'Continue assessment'; if(s==='RESEARCH_NEEDED')return 'Resolve eligibility'; if(s==='ELIGIBILITY_MISMATCH'||s==='OVERRIDE_REQUIRED')return 'Resolve eligibility'; return 'Start assessment';};

  return <>
    <div className="pageTitle"><div><div className="eyebrow">PROGRAM WORKSPACE</div><h1>All selected programs</h1><p className="muted">{specialty} · {assessed} of {selected.length} assessed · {selected.length}/50 selected</p></div><div className="actions"><button className="ghost" onClick={onBackToAssessments}>Back to assessments</button><button disabled={assessed<2} onClick={onCompare}>Compare programs</button></div></div>
    {message && <div className="notice danger">{message}</div>}

    <div className="card workspaceToolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by program, city, state or FREIDA ID"/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All statuses</option>{['ADDED','IN_PROGRESS','RESEARCH_NEEDED','ELIGIBILITY_MISMATCH','OVERRIDE_REQUIRED','ASSESSED'].map(x=><option key={x} value={x}>{programStatusLabel(x)}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="selected">Selected order</option><option value="score">Final Priority</option><option value="name">Program name</option><option value="status">Status</option></select><span className="autosave">● Autosave enabled</span></div>

    <div className="twoCol"><div className="card"><h3>Add programs</h3>{programLoading&&<div className="notice">Loading programs…</div>}<div className="list">{filtered.slice(0,75).map((p:any)=>{const id=`${p.Frieda}_${p.PId}`;const exists=selected.some((x:any)=>x.program_id===id);return <div className="row" key={id}><div><b>{getProgramName(p)}</b><small>{[getProgramCity(p),getProgramState(p)].filter(Boolean).join(', ')||'Location unavailable'}</small><small>FREIDA: {p.Frieda}</small></div><button className="secondary" disabled={exists} onClick={()=>addProgram({...p,program_name:getProgramName(p),city:getProgramCity(p),state:getProgramState(p)})}>{exists?'Added':'Add'}</button></div>;})}</div></div>
      <div className="card"><h3>Progress</h3><div className="progressBig">{assessed}<span> / {selected.length}</span></div><p className="muted">Programs assessed</p><p className="muted">Programs with unresolved eligibility remain visible here until resolved.</p></div></div>

    <div className="card" style={{marginTop:20}}><div className="tableWrap"><table className="programTable"><thead><tr><th>Program</th><th>Status</th><th>Eligibility</th><th>Application Fit</th><th>Signal Value</th><th>Final Priority</th><th>Confidence</th><th>Primary action</th><th>Edit</th><th>Remove</th></tr></thead><tbody>{rows.map((p:any)=>{const r=p.result||{};return <tr key={p.program_id}><td><b>{p.program_name}</b><small>{[p.city,p.state].filter(Boolean).join(', ')}</small><small>FREIDA: {p.Frieda}</small></td><td><span className={`statusBadge ${statusClass(p.status)}`}>{programStatusLabel(p.status)}</span></td><td>{eligibilityStatusLabel(r?.eligibility?.status || p.eligibility_status)}</td><td>{r.application_fit?`${score(r.application_fit.score)} · ${r.application_fit.label}`:'—'}</td><td>{r.signal_value?`${score(r.signal_value.score)} · ${r.signal_value.label}`:'—'}</td><td>{r.final_priority?`${score(r.final_priority.score)} · ${r.final_priority.label}`:'—'}</td><td>{r.confidence||'—'}</td><td><button className="secondary" onClick={()=>p.has_result?viewProgramResult(p):openProgram(p)}>{actionLabel(p)}</button></td><td><button className="ghost" onClick={()=>openProgram({...p,forceEdit:true})}>Edit answers</button></td><td><button className="ghost dangerButton" onClick={()=>removeProgram(p)}>Remove</button></td></tr>;})}</tbody></table></div>{!rows.length&&<p className="muted">No selected programs match this filter.</p>}</div>
  </>;
}
