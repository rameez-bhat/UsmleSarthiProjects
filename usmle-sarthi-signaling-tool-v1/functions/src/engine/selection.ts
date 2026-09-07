export function addProgramSelection(existing:any[], program:any){
  if(existing.length>=50) return {ok:false,error:'MAX_50',items:existing};
  if(existing.some(x=>x.program_id===program.program_id)) return {ok:false,error:'DUPLICATE',items:existing};
  return {ok:true,error:null,items:[...existing,program]};
}
export function shouldAutoRecalculate(assessment:any){ return assessment?.status !== 'FINALIZED'; }
