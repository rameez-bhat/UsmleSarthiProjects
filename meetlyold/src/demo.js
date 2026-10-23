const base=()=>({name:'Mohammad Shafi Bhat',slug:'shafi',bio:'Let’s make time for a useful conversation. Choose a meeting below and find a time that works for you.',timezone:'Asia/Kolkata',schedule:Object.fromEntries(Array.from({length:7},(_,i)=>[String(i+1),i<5?[{start:'09:00',end:'17:00'}]:[]])),overrides:{}});
const events=()=>[
 {id:'intro',title:'Introductory call',description:'A little time to meet, exchange ideas, and decide what comes next.',duration:30,color:'#267c68',location:'custom',locationValue:'',minNotice:120,horizonDays:60,bufferBefore:0,bufferAfter:10,dailyLimit:8,cancelHours:0,active:true,questions:[]},
 {id:'check-in',title:'Quick check-in',description:'One clear question. A focused conversation. Back to your day.',duration:15,color:'#ab7b45',location:'phone',locationValue:'',minNotice:60,horizonDays:30,bufferBefore:0,bufferAfter:5,dailyLimit:10,cancelHours:0,active:true,questions:[]},
 {id:'discussion',title:'Project discussion',description:'Room to work through the details and agree on a plan.',duration:60,color:'#7875b5',location:'in-person',locationValue:'Office',minNotice:1440,horizonDays:60,bufferBefore:10,bufferAfter:15,dailyLimit:4,cancelHours:2,active:true,questions:[{label:'What would you like to discuss?',required:true}]}
];
export function loadDemo(){try{const d=JSON.parse(localStorage.getItem('meetly.demo'));if(d?.profile)return d;}catch{}return {profile:base(),events:events(),bookings:[]};}
export function saveDemo(data){localStorage.setItem('meetly.demo',JSON.stringify(data));}
export function demoSlots(date,event,profile,bookings){
 const day=new Date(date+'T12:00:00'),weekday=String(day.getDay()||7),ranges=profile.overrides?.[date]??profile.schedule[weekday]??[];
 const output=[];const zone=profile.timezone;
 // Resolve a local wall-clock time to UTC without assuming a fixed UTC offset.
 const wallMs=time=>{let guess=Date.parse(date+'T'+time+':00Z');for(let n=0;n<3;n++){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess));const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));const displayed=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);guess+=Date.parse(date+'T'+time+':00Z')-displayed;}return guess;};
 for(const r of ranges){const end=wallMs(r.end);for(let start=wallMs(r.start);start+event.duration*60000<=end;start+=15*60000){const finish=start+event.duration*60000;if(start<Date.now()+event.minNotice*60000||start>Date.now()+event.horizonDays*86400000)continue;const blocked=bookings.some(b=>b.status==='confirmed'&&start-event.bufferBefore*60000<(b.lockEnd??b.endAt)&&finish+event.bufferAfter*60000>(b.lockStart??b.startAt));if(!blocked)output.push({start,end:finish});}}
 return output;
}
