import { ALGORITHM_VERSION, answerScores, componentMap, thresholds } from '../config/v1';

const findAnswer = (q:string,a:string) => answerScores.find(x=>x.question_code===q && x.answer_code===a);
const threshold = (kind:string, score:number) => {
  const list = thresholds[kind];
  return list.find((x:any,i:number)=> i===0 ? score>=x.min && score<=x.max : score>=x.min && score<x.max) || list[list.length-1];
};

export function evaluateEligibility(answers:any, override:any = null) {
  const required = ['E1','E2','E3','E4'];
  if (required.some(q => !answers[q])) return {status:'INCOMPLETE',blocking:true,warnings:['Complete all eligibility questions.']};
  if (required.some(q => answers[q] === 'NOT_VERIFIED')) return {status:'RESEARCH_REQUIRED',blocking:true,warnings:['Complete research before signaling.']};
  const mismatches = required.filter(q => answers[q] === 'NOT_ALIGNED');
  if (mismatches.length) {
    const hasOverride = answers.E5 && answers.E5 !== 'NO_OVERRIDE' && override && override.note && String(override.note).trim().length > 0 && override.date;
    if (!hasOverride) return {status:'NOT_ALIGNED',blocking:true,mismatches,warnings:['Eligibility mismatch must be resolved or overridden.']};
    return {status:'OVERRIDDEN',blocking:false,mismatches,warnings:['Eligibility mismatch overridden; original mismatch remains visible.'],override};
  }
  return {status:'ALIGNED',blocking:false,warnings:[]};
}

export function calculateProgram(input:any) {
  const answers = input.answers || {};
  const eligibility = evaluateEligibility(answers,input.override);
  if (eligibility.status === 'INCOMPLETE') return {algorithm_version:ALGORITHM_VERSION,eligibility,recommendation_code:'COMPLETE_ASSESSMENT',recommended_tier:null};
  if (eligibility.status === 'RESEARCH_REQUIRED') return {algorithm_version:ALGORITHM_VERSION,eligibility,recommendation_code:'COMPLETE_RESEARCH',recommended_tier:null};
  if (eligibility.status === 'NOT_ALIGNED') return {algorithm_version:ALGORITHM_VERSION,eligibility,recommendation_code:'DO_NOT_SIGNAL',recommended_tier:null};

  const scoredCodes = Object.keys(componentMap);
  const missingScored = scoredCodes.filter(q=>!answers[q]);
  if (missingScored.length) return {algorithm_version:ALGORITHM_VERSION,eligibility,status:'INCOMPLETE',missing_questions:missingScored,recommendation_code:'COMPLETE_ASSESSMENT',recommended_tier:null};

  let final=0, fit=0, signal=0, confidenceMissing=0;
  const components:any[]=[]; const positives:any[]=[]; const negatives:any[]=[]; const warnings:any[]=[...(eligibility.warnings||[])];
  for (const q of scoredCodes) {
    const row = findAnswer(q,answers[q]);
    if (!row) throw new Error(`Unknown answer ${q}:${answers[q]}`);
    const points = Number(row.points || 0); final += points; if(componentMap[q].fit) fit += points; if(componentMap[q].signal) signal += points;
    confidenceMissing += Number(row.confidence_missing || 0);
    components.push({question_code:q,answer_code:answers[q],points,max_points:componentMap[q].max});
    if(row.positive_reason) positives.push({text:row.positive_reason,strength: componentMap[q].max ? points/componentMap[q].max : 0});
    if(row.negative_reason) negatives.push({text:row.negative_reason,strength: componentMap[q].max ? 1-(points/componentMap[q].max) : 0});
    if(row.warning_text) warnings.push(row.warning_text);
  }
  const fitScore=100*fit/58, signalScore=100*signal/42;
  const finalBand=threshold('FINAL_PRIORITY',final), fitBand=threshold('APPLICATION_FIT',fitScore), signalBand=threshold('SIGNAL_VALUE',signalScore);
  let confidence = input.contradictoryEvidence ? 'LIMITED' : confidenceMissing<=1 ? 'HIGH' : confidenceMissing<=3 ? 'MODERATE' : 'LIMITED';
  let recommendation = finalBand.code;
  let displayedSignal = {...signalBand,score:signalScore};
  if (answers.Q3 === 'DOES_NOT_USE') {
    const majorRelationship = answers.R3 === 'ENCOURAGED_SIGNAL' || Number(findAnswer('R1',answers.R1)?.points||0)>=9 || Number(findAnswer('R2',answers.R2)?.points||0)>=8;
    if (!majorRelationship) { recommendation='APPLY_WITHOUT_SIGNAL'; displayedSignal={code:'LOW',label:'Low',score:signalScore}; }
  }
  return {
    algorithm_version:ALGORITHM_VERSION,status:'COMPLETE',eligibility,
    application_fit:{score:fitScore,label:fitBand.label,code:fitBand.code},
    signal_value:{score:signalScore,label:displayedSignal.label,code:displayedSignal.code},
    final_priority:{score:final,label:finalBand.label,code:finalBand.code},
    recommendation_code:recommendation,recommended_tier:null,confidence,confidence_missing:confidenceMissing,
    positive_reasons:positives.sort((a,b)=>b.strength-a.strength).slice(0,3).map(x=>x.text),
    negative_reasons:negatives.sort((a,b)=>b.strength-a.strength).slice(0,3).map(x=>x.text),
    warnings:[...new Set(warnings)].slice(0,6),components,
    tie_break:{q3_points:Number(findAnswer('Q3',answers.Q3)?.points||0),r1_points:Number(findAnswer('R1',answers.R1)?.points||0),r2_points:Number(findAnswer('R2',answers.R2)?.points||0)}
  };
}

export function calculatePortfolio(input:any) {
  const results = [...(input.results || [])]; const config = input.specialtyConfig || {};
  const eligible = results.filter((r:any)=>!['COMPLETE_ASSESSMENT','COMPLETE_RESEARCH','DO_NOT_SIGNAL','APPLY_WITHOUT_SIGNAL'].includes(r.recommendation_code));
  eligible.sort((a:any,b:any)=> b.final_priority.score-a.final_priority.score || (b.tie_break?.q3_points||0)-(a.tie_break?.q3_points||0) || (b.tie_break?.r1_points||0)-(a.tie_break?.r1_points||0) || (b.tie_break?.r2_points||0)-(a.tie_break?.r2_points||0) || (a.student_preference||999)-(b.student_preference||999) || String(a.program_name).localeCompare(String(b.program_name)));
  const allocations:any = {};
  if(config.signal_model==='TIERED') {
    const gold=Number(config.gold_count||0), silver=Number(config.silver_count||0); eligible.forEach((r:any,i:number)=> allocations[r.program_id]= i<gold?'GOLD':i<gold+silver?'SILVER':null);
  } else { const count=Number(config.general_count||0); eligible.forEach((r:any,i:number)=>allocations[r.program_id]=i<count?'GENERAL':null); }
  const chosen = results.filter((r:any)=>allocations[r.program_id]); const warnings:any[]=[];
  if(chosen.length && chosen.filter((r:any)=>r.application_fit.score<60).length/chosen.length>0.3) warnings.push({code:'TOO_MANY_REACHES',message:'Your proposed signal portfolio may be overly ambitious.'});
  if(chosen.some((r:any)=>['INCOMPLETE','RESEARCH_REQUIRED','NOT_ALIGNED'].includes(r.eligibility?.status))) warnings.push({code:'UNRESOLVED_ELIGIBILITY',message:'Resolve eligibility before finalizing.',severity:'BLOCK'});
  if(chosen.some((r:any)=>r.recommendation_code==='APPLY_WITHOUT_SIGNAL'||r.signal_value.score<45)) warnings.push({code:'WEAK_SIGNAL_USE',message:'Consider reallocating this scarce signal.'});
  if(chosen.length && chosen.filter((r:any)=>r.confidence==='LIMITED').length/chosen.length>0.25) warnings.push({code:'LIMITED_CONFIDENCE',message:'Complete additional program research.'});
  const cutoff = chosen.length ? Math.min(...chosen.map((r:any)=>r.final_priority.score)) : null;
  if(cutoff!==null && results.some((r:any)=>!allocations[r.program_id] && ((r.tie_break?.r1_points||0)>=9 || (r.tie_break?.r2_points||0)>=8) && r.final_priority?.score >= cutoff-10)) warnings.push({code:'OMITTED_STRONG_RELATIONSHIP',message:'Review whether a strong program-specific relationship is being underused.'});
  const inventory = config.signal_model==='TIERED' ? Number(config.gold_count||0)+Number(config.silver_count||0) : Number(config.general_count||0);
  if(eligible.length<inventory) warnings.push({code:'UNUSED_INVENTORY',message:'Research additional realistic programs; do not force weak signals.'});
  return {allocations,warnings,can_finalize:!warnings.some(x=>x.severity==='BLOCK')};
}
