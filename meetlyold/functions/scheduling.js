import {DateTime} from 'luxon';
export const defaultSchedule=()=>Object.fromEntries(Array.from({length:7},(_,i)=>[String(i+1),i<5?[{start:'09:00',end:'17:00'}]:[]]));
export const overlap=(a,b)=>a.start<b.end&&b.start<a.end;
export function validateSchedule(schedule,overrides={}){
 const intervals=r=>Array.isArray(r)&&r.length<=6&&r.every((v,i)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v.start)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v.end)&&v.start<v.end&&(i===0||r[i-1].end<=v.start));
 if(!schedule||Object.keys(schedule).length!==7||!Object.keys(schedule).every(k=>/^[1-7]$/.test(k))||!Object.values(schedule).every(intervals))throw Error('Use seven weekdays with ordered, non-overlapping time ranges.');
 if(Object.keys(overrides).length>180||!Object.entries(overrides).every(([d,r])=>DateTime.fromISO(d).isValid&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&intervals(r)))throw Error('Invalid date overrides.');
}
export function slotsForDay({date,host,event,busy=[],now=Date.now()}){
 const day=DateTime.fromISO(date,{zone:host.timezone});if(!day.isValid)return [];
 const schedule=host.overrides?.[date]??host.schedule?.[String(day.weekday)]??[];
 const min=now+event.minNotice*60000,max=now+event.horizonDays*86400000;
 const slots=[];const before=event.bufferBefore*60000,after=event.bufferAfter*60000;
 for(const range of schedule){
  let start=DateTime.fromISO(`${date}T${range.start}`,{zone:host.timezone});
  const end=DateTime.fromISO(`${date}T${range.end}`,{zone:host.timezone});
  // Reject nonexistent local opening times on DST transition days.
  if(start.toFormat('HH:mm')!==range.start||end.toFormat('HH:mm')!==range.end)continue;
  for(;start.plus({minutes:event.duration}).toMillis()<=end.toMillis();start=start.plus({minutes:15})){
   const ms=start.toMillis(),finish=ms+event.duration*60000;
   const candidate={start:ms-before,end:finish+after};
   if(ms>=min&&ms<=max&&!busy.some(b=>overlap(candidate,b)))slots.push({start:ms,end:finish});
  }
 }
 return [...new Map(slots.map(s=>[s.start,s])).values()];
}
export function lockDates(start,end){
 const dates=[];let d=DateTime.fromMillis(start,{zone:'utc'}).startOf('day');
 while(d.toMillis()<end){dates.push(d.toISODate());d=d.plus({days:1});}return dates;
}
