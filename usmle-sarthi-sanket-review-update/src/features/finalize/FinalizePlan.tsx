import { exportColumns } from '../../scoring/config';
import { eligibilityStatusLabel, recommendationLabel } from '../../utils/labels';

function esc(v:any){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function exportExcel(assessment:any, programs:any[]){
  const rows=programs.map((p:any)=>{const r=p.result||{}; const data:any={assessment_id:assessment?.id||'',user_email:'',specialty:assessment?.specialty||'',match_season:assessment?.season||'',program_id:p.program_id,program_name:p.program_name,city:p.city,state:p.state,source_updated_at:p.source_updated_at||'',completion_status:p.status,eligibility_status:r.eligibility?.status||p.eligibility_status||'',application_fit_score:r.application_fit?.score??'',application_fit_label:r.application_fit?.label||'',signal_value_score:r.signal_value?.score??'',signal_value_label:r.signal_value?.label||'',final_priority_score:r.final_priority?.score??'',final_priority_label:r.final_priority?.label||'',recommendation_code:r.recommendation_code||'',recommended_tier:'',confidence:r.confidence||'',positive_reasons:(r.positive_reasons||[]).join(' | '),negative_reasons:(r.negative_reasons||[]).join(' | '),warnings:(r.warnings||[]).join(' | '),override_reason:r.eligibility?.override?.reason_code||'',override_note:r.eligibility?.override?.note||'',student_notes:p.student_notes||'',mentor_notes:'',student_final_choice:p.student_final_choice||'',student_final_tier:'',evaluated_at:'',algorithm_version:r.algorithm_version||assessment?.algorithm_version||''}; return data;});
  const html=`<table><thead><tr>${exportColumns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${exportColumns.map(c=>`<td>${esc(row[c])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const blob=new Blob([html],{type:'application/vnd.ms-excel'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`Sarthi-SANKET-${assessment?.specialty||'portfolio'}.xls`; a.click(); URL.revokeObjectURL(url);
}

export default function FinalizePlan({ assessment, programs, onBack }:any){
  const unresolved=programs.filter((p:any)=>['RESEARCH_NEEDED','ELIGIBILITY_MISMATCH','OVERRIDE_REQUIRED','IN_PROGRESS','ADDED'].includes(p.status));
  return <>
    <div className="pageTitle"><div><div className="eyebrow">FINAL REVIEW / EXPORT</div><h1>Review your SANKET analysis</h1><p className="muted">Signal inventory validation and Gold/Silver/general allocation are deferred until specialty configuration is supplied.</p></div></div>
    {!!unresolved.length&&<div className="notice warning"><b>{unresolved.length} program(s) remain unresolved.</b> You can download a draft workbook, but this portfolio should not be treated as finalized.</div>}
    <div className="card"><h3>Current portfolio</h3>{programs.map((p:any)=><div className="row" key={p.program_id}><div><b>{p.program_name}</b><small>{[p.city,p.state].filter(Boolean).join(', ')} · FREIDA {p.Frieda}</small></div><div><b>{p.result?.final_priority?`${Number(p.result.final_priority.score).toFixed(1)} · ${p.result.final_priority.label}`:'No score'}</b><small>{eligibilityStatusLabel(p.result?.eligibility?.status||p.eligibility_status)} · {recommendationLabel(p.result?.recommendation_code)}</small></div></div>)}</div>
    <div className="notice info">SANKET supports application strategy and does not guarantee an interview or match. Applicants remain responsible for confirming current program policies.</div>
    <div className="actions"><button className="ghost" onClick={onBack}>Back to comparison</button><button onClick={()=>exportExcel(assessment,programs)}>Download Excel draft</button></div>
  </>;
}
