import Metric from './Metric';
import Reasons from './Reasons';
import { eligibilityStatusLabel, recommendationLabel } from '../../utils/labels';

export default function Result({ result, program, onBack, onEdit, onCompare, canCompare }: any) {
  if(!result)return null;
  const blocked=!result.final_priority;
  return <>
    <div className="pageTitle"><div><div className="eyebrow">PROGRAM RESULT</div><h1>{program?.program_name||'Program'}</h1><p className="muted">{[program?.city,program?.state].filter(Boolean).join(', ')}{program?.Frieda?` · FREIDA ${program.Frieda}`:''}</p></div></div>
    {blocked && result.eligibility?.status==='RESEARCH_REQUIRED' && <div className="notice warning"><b>RESEARCH NEEDED:</b> One or more eligibility requirements have not been confirmed. Update those answers before scoring.</div>}
    {blocked && result.eligibility?.status==='NOT_ALIGNED' && <div className="notice danger"><b>Not eligible based on your reported information.</b> Recommendation: Do not signal unless you have a documented override.</div>}
    {!blocked && <div className="resultGrid"><div className="scoreHero card"><span>Final Priority</span><strong>{Number(result.final_priority.score).toFixed(1)}</strong><b>{result.final_priority.label}</b></div><Metric title="Eligibility" value={eligibilityStatusLabel(result.eligibility?.status)}/><Metric title="Application Fit" value={`${Number(result.application_fit?.score||0).toFixed(1)} · ${result.application_fit?.label||'—'}`}/><Metric title="Signal Value" value={`${Number(result.signal_value?.score||0).toFixed(1)} · ${result.signal_value?.label||'—'}`}/><Metric title="Confidence" value={result.confidence||'—'}/><Metric title="Recommendation" value={recommendationLabel(result.recommendation_code)}/></div>}
    {!blocked && <div className="twoCol"><Reasons title="Top positive reasons" items={result.positive_reasons||[]}/><Reasons title="Factors limiting score" items={result.negative_reasons||[]}/></div>}
    {!!(result.warnings||[]).length && <Reasons title="Warnings" items={result.warnings||[]}/>} 
    <div className="actions"><button onClick={onBack}>All selected programs</button>{canCompare&&<button className="secondary" onClick={onCompare}>Compare programs</button>}<button className="ghost" onClick={onEdit}>Edit answers</button></div>
  </>;
}
