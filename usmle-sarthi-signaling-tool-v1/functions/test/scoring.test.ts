import { describe,it,expect } from 'vitest';
import { calculateProgram, calculatePortfolio } from '../src/engine/scoring';
import { buildExportRow } from '../src/engine/export';
import { addProgramSelection, shouldAutoRecalculate } from '../src/engine/selection';

const good:any={E1:'ALIGNED',E2:'ALIGNED',E3:'ALIGNED',E4:'ALIGNED',Q1:'STRONG',Q2:'P50_74',Q3:'SUBSTANTIAL',Q4:'MODERATE',Q5:'STABLE',S1:'ONE_CLOSE',S2:'PARTIAL',R1:'PROGRAM_NO_LEADERSHIP',R2:'RESIDENT_ACCESS',R3:'FAVORABLE_LEADERSHIP',A1:'SAME_COUNTRY',A2:'REASONABLE',A3:'ALIGNED',A4:'STRONG',P1:'NEITHER'};

describe('v1 acceptance tests',()=>{
 it('T01 NOT_VERIFIED => research required/no tier',()=>{const r=calculateProgram({answers:{...good,E2:'NOT_VERIFIED'}});expect(r.eligibility.status).toBe('RESEARCH_REQUIRED');expect(r.recommended_tier).toBeNull();});
 it('T02 visa mismatch => do not signal',()=>{const r=calculateProgram({answers:{...good,E1:'NOT_ALIGNED',E5:'NO_OVERRIDE'}});expect(r.recommendation_code).toBe('DO_NOT_SIGNAL');});
 it('T03 YOG mismatch + override => overridden and calculated',()=>{const r=calculateProgram({answers:{...good,E2:'NOT_ALIGNED',E5:'PD_APD_ENCOURAGEMENT'},override:{reason_code:'PD_APD_ENCOURAGEMENT',note:'Program director documented an exception.',date:'2026-09-01'}});expect(r.eligibility.status).toBe('OVERRIDDEN');expect(r.final_priority.score).toBeTypeOf('number');});
 it('T04 S1/S2 NO_DATA are neutral and confidence missing each',()=>{const r=calculateProgram({answers:{...good,S1:'NO_DATA',S2:'NO_DATA'}});expect(r.components.find((x:any)=>x.question_code==='S1').points).toBe(6);expect(r.components.find((x:any)=>x.question_code==='S2').points).toBe(3);expect(r.confidence_missing).toBe(2);});
 it('T05 no outreach response is zero',()=>{const r=calculateProgram({answers:{...good,R3:'NO_RESPONSE_NONE'}});expect(r.components.find((x:any)=>x.question_code==='R3').points).toBe(0);});
 it('T06 direct leadership rotation is 12',()=>{const r=calculateProgram({answers:{...good,R1:'DIRECT_LEADERSHIP'}});expect(r.components.find((x:any)=>x.question_code==='R1').points).toBe(12);});
 it('T07 does not use signals => apply without signal and display Low',()=>{const r=calculateProgram({answers:{...good,Q3:'DOES_NOT_USE',R1:'NONE',R2:'NONE',R3:'NO_RESPONSE_NONE'}});expect(r.recommendation_code).toBe('APPLY_WITHOUT_SIGNAL');expect(r.signal_value.label).toBe('Low');});
 it('T08 exact 75 => strong',()=>{const r=calculateProgram({answers:good});expect(r.final_priority.score).toBe(75);expect(r.final_priority.code).toBe('STRONG_SIGNAL');});
 it('T09 exact 60 => reasonable',()=>{const r=calculateProgram({answers:{...good,Q1:'MODERATE',Q2:'P25_49',Q3:'MODERATE',Q4:'LOW',Q5:'INCREASING',S1:'PARTIAL'}});expect(r.final_priority.score).toBe(60);expect(r.final_priority.code).toBe('REASONABLE_SIGNAL');});
 it('T10 exact 45 => portfolio reach',()=>{const r=calculateProgram({answers:{...good,Q1:'NEGLIGIBLE',Q2:'P10_24',Q3:'LITTLE_NONE',Q4:'VERY_LOW',Q5:'SHARPLY_INCREASING',S1:'PARTIAL'}});expect(r.final_priority.score).toBe(45);expect(r.final_priority.code).toBe('PORTFOLIO_REACH');});
 it('T11 rejects program 51 and preserves 50',()=>{const existing=Array.from({length:50},(_,i)=>({program_id:String(i)}));const x=addProgramSelection(existing,{program_id:'51'});expect(x.ok).toBe(false);expect(x.items).toHaveLength(50);});
 it('T12 IM ties use q3, r1, r2, preference, name',()=>{const base={eligibility:{status:'ALIGNED'},recommendation_code:'REASONABLE_SIGNAL',final_priority:{score:70},application_fit:{score:65},signal_value:{score:55},confidence:'HIGH'};const r=calculatePortfolio({results:[{...base,program_id:'a',program_name:'Alpha',tie_break:{q3_points:6,r1_points:9,r2_points:8}},{...base,program_id:'b',program_name:'Beta',tie_break:{q3_points:8,r1_points:3,r2_points:2}}],specialtyConfig:{signal_model:'TIERED',gold_count:1,silver_count:1}});expect(r.allocations.b).toBe('GOLD');});
 it('T13 SOURCE_NA differs from NOT_VERIFIED',()=>{const a=calculateProgram({answers:{...good,E1:'SOURCE_NA'}});const b=calculateProgram({answers:{...good,E1:'NOT_VERIFIED'}});expect(a.eligibility.status).toBe('ALIGNED');expect(b.eligibility.status).toBe('RESEARCH_REQUIRED');});
 it('T14 export uses same calculated values',()=>{const r=calculateProgram({answers:good});const row=buildExportRow({assessment_id:'A',program_id:'P',result:r});expect(row.final_priority_score).toBe(r.final_priority.score);expect(row.signal_value_label).toBe(r.signal_value.label);});
 it('T15 finalized assessment does not auto-recalculate when config changes',()=>{expect(shouldAutoRecalculate({status:'FINALIZED',algorithm_version:'v1.0'})).toBe(false);});
});
