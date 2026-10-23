import crypto from 'node:crypto';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {onCall,onRequest,HttpsError} from 'firebase-functions/v2/https';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {logger} from 'firebase-functions';
import {DateTime} from 'luxon';
import {defaultSchedule,validateSchedule,slotsForDay,lockDates,overlap} from './scheduling.js';
import {authorization,exchange,seal,unseal,hash,busyForHost,connections,createExternal,removeExternal} from './calendars.js';
initializeApp();const db=getFirestore();
const region=process.env.FUNCTIONS_REGION||'asia-south1';
const secrets=['GOOGLE_CLIENT_SECRET','MICROSOFT_CLIENT_SECRET','OAUTH_TOKEN_KEY'];
const origin=()=>{const u=new URL(process.env.APP_ORIGIN);if(!['https:','http:'].includes(u.protocol))throw Error('Invalid APP_ORIGIN');return u.origin;};
const opts={region,secrets,enforceAppCheck:process.env.ENFORCE_APP_CHECK==='true',maxInstances:20};
const collection=name=>db.collection(`scheduler_${name}`);
const bad=message=>{throw new HttpsError('invalid-argument',message);};
const text=(v,max=200)=>typeof v==='string'?v.trim().slice(0,max):'';
function user(r){if(!r.auth)throw new HttpsError('unauthenticated','Please sign in.');return r.auth.uid;}
function verified(r){const uid=user(r);if(!r.auth.token.email_verified)throw new HttpsError('failed-precondition','Verify your email, then sign in again.');return uid;}
const safeId=(v)=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,120}$/.test(v))bad('Invalid identifier.');return v;};
const wrap=fn=>onCall(opts,async r=>{try{return await fn(r);}catch(e){if(e instanceof HttpsError)throw e;logger.error(e.message);throw new HttpsError('internal','The request could not be completed. Please try again or reconnect your calendar.');}});
async function throttle(r,kind,limit=60){
 const minute=Math.floor(Date.now()/60000),ip=r.rawRequest.ip||'unknown';const ref=collection('limits').doc(hash(`${ip}:${kind}:${minute}`));
 await db.runTransaction(async tx=>{const s=await tx.get(ref);if((s.data()?.count||0)>=limit)throw new HttpsError('resource-exhausted','Too many requests. Please try again shortly.');tx.set(ref,{count:(s.data()?.count||0)+1,expiresAt:new Date(Date.now()+3600000)});});
}
function eventInput(v,uid){
 const e={ownerId:uid,title:text(v.title,80),description:text(v.description,2000),duration:Number(v.duration),minNotice:Number(v.minNotice??120),horizonDays:Number(v.horizonDays??60),bufferBefore:Number(v.bufferBefore??0),bufferAfter:Number(v.bufferAfter??10),dailyLimit:Number(v.dailyLimit??8),cancelHours:Number(v.cancelHours??0),location:v.location||'custom',locationValue:text(v.locationValue,500),color:/^#[0-9a-f]{6}$/i.test(v.color)?v.color:'#187b68',active:v.active!==false,questions:Array.isArray(v.questions)?v.questions.slice(0,10).map(q=>({label:text(q.label,160),required:!!q.required})):[]};
 const bounds={duration:[15,240],minNotice:[0,10080],horizonDays:[1,365],bufferBefore:[0,120],bufferAfter:[0,120],dailyLimit:[1,50],cancelHours:[0,72]};
 if(!e.title||!['custom','phone','in-person','google-meet','teams'].includes(e.location))bad('Enter an event title and a supported location.');
 for(const [k,[a,b]] of Object.entries(bounds))if(!Number.isInteger(e[k])||e[k]<a||e[k]>b)bad(`Invalid ${k}.`);
 if(e.questions.some(q=>!q.label))bad('Question labels cannot be empty.');
 if(e.location==='custom'&&e.locationValue&&!/^https:\/\//.test(e.locationValue))bad('Use an https meeting link.');return e;
}
export const schedulerSaveProfile=wrap(async r=>{
 const uid=verified(r),v=r.data||{},slug=text(v.slug,60).toLowerCase();if(!/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug)||!text(v.name,80)||!DateTime.now().setZone(v.timezone).isValid)bad('Enter a name, a valid time zone and a link slug of 3–60 letters/numbers/hyphens.');
 const profile=collection('hosts').doc(uid),slugRef=collection('slugs').doc(slug);
 await db.runTransaction(async tx=>{
  const [old,claim]=await Promise.all([tx.get(profile),tx.get(slugRef)]);if(claim.exists&&claim.data().ownerId!==uid)throw new HttpsError('already-exists','That booking link is already taken.');
  const data={name:text(v.name,80),bio:text(v.bio,500),slug,timezone:v.timezone,email:r.auth.token.email,updatedAt:Date.now()};
  if(!old.exists){data.schedule=defaultSchedule();data.overrides={};data.createdAt=Date.now();tx.create(collection('events').doc(`${uid}_intro`),eventInput({title:'Introductory call',duration:30},uid));}
  if(old.exists&&old.data().slug!==slug)tx.delete(collection('slugs').doc(old.data().slug));tx.set(slugRef,{ownerId:uid});tx.set(profile,data,{merge:true});
 });return {ok:true};
});
export const schedulerSaveAvailability=wrap(async r=>{const uid=verified(r);const {schedule,overrides={}}=r.data;try{validateSchedule(schedule,overrides);}catch(e){bad(e.message);}const ref=collection('hosts').doc(uid);if(!(await ref.get()).exists)bad('Complete your profile first.');await ref.update({schedule,overrides,updatedAt:Date.now()});return {ok:true};});
export const schedulerSaveEvent=wrap(async r=>{const uid=verified(r),id=r.data.id?safeId(r.data.id):crypto.randomUUID(),ref=collection('events').doc(id);if(!(await collection('hosts').doc(uid).get()).exists)bad('Complete your profile first.');const data=eventInput(r.data,uid);await db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists&&old.data().ownerId!==uid)throw new HttpsError('permission-denied','This event belongs to another host.');tx.set(ref,data);});return {id};});
export const schedulerPublicPage=wrap(async r=>{await throttle(r,'page');const s=await collection('slugs').doc(safeId(r.data.slug)).get();if(!s.exists)throw new HttpsError('not-found','Booking page not found.');const host=await collection('hosts').doc(s.data().ownerId).get();if(!host.exists)throw new HttpsError('not-found','Host not found.');const h=host.data(),events=await collection('events').where('ownerId','==',host.id).where('active','==',true).get();return {host:{id:host.id,name:h.name,bio:h.bio,slug:h.slug,timezone:h.timezone},events:events.docs.map(d=>({id:d.id,...d.data()}))};});
export const schedulerPublicEvent=wrap(async r=>{await throttle(r,'page');const s=await collection('events').doc(safeId(r.data.eventId)).get();if(!s.exists||!s.data().active)throw new HttpsError('not-found','Event unavailable.');const h=await collection('hosts').doc(s.data().ownerId).get();if(!h.exists)throw new HttpsError('not-found','Host unavailable.');const p=h.data();return {host:{id:h.id,name:p.name,bio:p.bio,slug:p.slug,timezone:p.timezone},events:[{id:s.id,...s.data()}]};});
async function context(eventId,date,ignoreId=null){
 const ev=await collection('events').doc(safeId(eventId)).get();if(!ev.exists||!ev.data().active)throw new HttpsError('not-found','This event is unavailable.');const event=ev.data(),hs=await collection('hosts').doc(event.ownerId).get();if(!hs.exists)bad('Host is unavailable.');
 const host=hs.data();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!DateTime.fromISO(date,{zone:host.timezone}).isValid)bad('Invalid date.');
 const day=DateTime.fromISO(date,{zone:host.timezone}),start=day.startOf('day').toMillis(),end=day.endOf('day').toMillis();
 const query=collection('bookings').where('ownerId','==',event.ownerId).where('startAt','>=',start-86400000).where('startAt','<=',end+86400000);
 const booked=await query.get(),busy=await busyForHost(event.ownerId,start-86400000,end+86400000);
 const existing=booked.docs.filter(d=>d.id!==ignoreId&&d.data().status==='confirmed').map(d=>d.data());
 const today=existing.filter(b=>DateTime.fromMillis(b.startAt,{zone:host.timezone}).toISODate()===date);
 const blocked=[...busy,...existing.map(b=>({start:b.lockStart,end:b.lockEnd}))];
 return {host,event,eventId:ev.id,query,date,busy,start,end,slots:today.length>=event.dailyLimit?[]:slotsForDay({date,host,event,busy:blocked})};
}
export const schedulerSlots=wrap(async r=>{await throttle(r,'slots',120);const c=await context(r.data.eventId,r.data.date);return {timezone:c.host.timezone,slots:c.slots};});
function manageAllowed(r,b){if(r.auth?.uid===b.ownerId)return;const token=text(r.data.token,200);if(!token||hash(token)!==b.tokenHash)throw new HttpsError('permission-denied','This booking link is invalid.');}
export const schedulerGetBooking=wrap(async r=>{await throttle(r,'manage');const id=safeId(r.data.id),s=await collection('bookings').doc(id).get();if(!s.exists)throw new HttpsError('not-found','Booking not found.');const b=s.data();manageAllowed(r,b);const {tokenHash,tokenCipher,...publicData}=b;return {id,...publicData};});
async function book(r,reschedule=false){
 await throttle(r,'book',12);const v=r.data||{};let old=null,ref;
 // A retry after a lost response returns the original booking, not a second reservation.
 if(!reschedule&&v.requestId){const s=await collection('bookings').doc(safeId(v.requestId)).get();if(s.exists){const b=s.data();if(b.attendeeEmail!==text(v.email,254).toLowerCase()||b.eventId!==v.eventId||b.startAt!==Number(v.startAt))throw new HttpsError('already-exists','Request identifier is already used.');const token=unseal(b.tokenCipher).token;return {id:s.id,token,url:`${origin()}/manage/${s.id}?token=${encodeURIComponent(token)}`};}}
 if(reschedule){ref=collection('bookings').doc(safeId(v.id));const s=await ref.get();if(!s.exists)throw new HttpsError('not-found','Booking not found.');old=s.data();manageAllowed(r,old);if(old.status!=='confirmed'||Date.now()>old.startAt-old.cancelHours*3600000)throw new HttpsError('failed-precondition','The rescheduling window has closed.');}
 if(v.timezone&&!DateTime.now().setZone(v.timezone).isValid)bad('Invalid attendee time zone.');
 const eventId=old?.eventId||v.eventId,startAt=Number(v.startAt);if(!Number.isFinite(startAt))bad('Choose a valid time.');
 const ev=await collection('events').doc(safeId(eventId)).get();if(!ev.exists)bad('Event is unavailable.');const hs=await collection('hosts').doc(ev.data().ownerId).get();if(!hs.exists)bad('Host is unavailable.');
 const date=DateTime.fromMillis(startAt,{zone:hs.data().timezone}).toISODate(),c=await context(eventId,date,old?ref.id:null);
 if(!c.slots.some(s=>s.start===startAt))throw new HttpsError('already-exists','That time is no longer available. Choose another time.');
 const ps=await connections(c.event.ownerId);if(c.event.location==='google-meet'&&!ps.includes('google'))throw new HttpsError('failed-precondition','This host must connect Google Calendar first.');if(c.event.location==='teams'&&!ps.includes('microsoft'))throw new HttpsError('failed-precondition','This host must connect Outlook first.');
 const attendeeName=old?.attendeeName||text(v.name,100),attendeeEmail=old?.attendeeEmail||text(v.email,254).toLowerCase();if(!attendeeName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail))bad('Enter your name and a valid email.');
 const answers=old?.answers||(Array.isArray(v.answers)?v.answers.slice(0,10).map(a=>text(a,1500)):[]);if(c.event.questions.some((q,i)=>q.required&&!answers[i]))bad('Please answer all required questions.');
 const id=old?ref.id:safeId(v.requestId),token=old?unseal(old.tokenCipher).token:crypto.randomBytes(32).toString('base64url');ref=ref||collection('bookings').doc(id);
 const event=c.event,endAt=startAt+event.duration*60000,lockStart=startAt-event.bufferBefore*60000,lockEnd=endAt+event.bufferAfter*60000;
 const dates=[...new Set([...lockDates(lockStart,lockEnd),...(old?lockDates(old.lockStart,old.lockEnd):[])])];
 const data={ownerId:event.ownerId,eventId,eventTitle:event.title,hostName:c.host.name,hostEmail:c.host.email,timezone:c.host.timezone,attendeeTimezone:text(v.timezone,80)||c.host.timezone,attendeeName,attendeeEmail,notes:text(v.notes??old?.notes,2000),answers,startAt,endAt,lockStart,lockEnd,status:'confirmed',location:event.location,locationValue:event.locationValue,cancelHours:event.cancelHours,revision:(old?.revision||0)+1,tokenHash:hash(token),tokenCipher:old?.tokenCipher||seal({token}),syncStatus:'pending',externalIds:{},meetingUrl:event.locationValue,createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 const reserved=await db.runTransaction(async tx=>{
  const current=await tx.get(ref);if(!old&&current.exists){if(current.data().attendeeEmail===attendeeEmail&&current.data().startAt===startAt&&current.data().eventId===eventId)return current.data();throw new HttpsError('already-exists','A booking with this request identifier already exists.');}
  if(old&&(!current.exists||current.data().revision!==old.revision||current.data().status!=='confirmed'))throw new HttpsError('aborted','This booking changed. Refresh and try again.');
  const locks=dates.map(d=>collection('locks').doc(`${event.ownerId}_${d}`));await Promise.all(locks.map(l=>tx.get(l)));
  const [hostNow,eventNow,bookings]=await Promise.all([tx.get(collection('hosts').doc(event.ownerId)),tx.get(ev.ref),tx.get(c.query)]);
  if(!hostNow.exists||!eventNow.exists||!eventNow.data().active)throw new HttpsError('failed-precondition','Event is unavailable.');
  if(JSON.stringify(hostNow.data())!==JSON.stringify(c.host))throw new HttpsError('aborted','Host availability changed. Choose a time again.');
  if(JSON.stringify(eventNow.data())!==JSON.stringify(event))throw new HttpsError('aborted','Event settings changed. Choose a time again.');
  const others=bookings.docs.filter(d=>d.id!==id&&d.data().status==='confirmed').map(d=>d.data());
  if(others.filter(b=>DateTime.fromMillis(b.startAt,{zone:hostNow.data().timezone}).toISODate()===date).length>=event.dailyLimit||!slotsForDay({date,host:hostNow.data(),event,busy:[...c.busy,...others.map(b=>({start:b.lockStart,end:b.lockEnd}))]}).some(s=>s.start===startAt))throw new HttpsError('already-exists','That time was just booked. Choose another time.');
  for(const l of locks)tx.set(l,{version:FieldValue.increment(1),updatedAt:Date.now()},{merge:true});tx.set(ref,data);tx.create(collection('jobs').doc(`${id}_${data.revision}`),{bookingId:id,revision:data.revision,action:'sync',oldIds:old?.externalIds||{},oldStart:old?.startAt||null,status:'pending'});
  return data;
 });
 const reservedToken=unseal(reserved.tokenCipher).token;
 return {id,token:reservedToken,url:`${origin()}/manage/${id}?token=${encodeURIComponent(reservedToken)}`};
}
export const schedulerBook=wrap(r=>book(r));export const schedulerReschedule=wrap(r=>book(r,true));
export const schedulerCancel=wrap(async r=>{
 await throttle(r,'cancel',20);const ref=collection('bookings').doc(safeId(r.data.id));await db.runTransaction(async tx=>{
  const s=await tx.get(ref);if(!s.exists)throw new HttpsError('not-found','Booking not found.');const b=s.data();manageAllowed(r,b);if(b.status==='cancelled')return;
  if(r.auth?.uid!==b.ownerId&&Date.now()>b.startAt-b.cancelHours*3600000)throw new HttpsError('failed-precondition','The cancellation window has closed. Contact the host.');
  const revision=b.revision+1;tx.update(ref,{status:'cancelled',revision,syncStatus:'pending',updatedAt:Date.now()});tx.create(collection('jobs').doc(`${ref.id}_${revision}`),{bookingId:ref.id,revision,action:'cancel',oldIds:b.externalIds||{},status:'pending'});
 });return {ok:true};
});
export const schedulerConnect=wrap(async r=>{const uid=verified(r),provider=r.data.provider;if(!['google','microsoft'].includes(provider))bad('Unsupported calendar.');const state=crypto.randomBytes(32).toString('base64url'),verifier=crypto.randomBytes(48).toString('base64url');const url=authorization(provider,state,verifier);await collection('oauth').doc(hash(state)).set({ownerId:uid,provider,verifier,expiresAt:Date.now()+600000});return {url};});
export const schedulerOAuthCallback=onRequest({region,secrets,maxInstances:5},async(req,res)=>{
 try{
  const state=text(req.query.state,200);if(!state||typeof req.query.code!=='string')throw Error('Consent was cancelled or state is missing.');
  const ref=collection('oauth').doc(hash(state));let pending;await db.runTransaction(async tx=>{const s=await tx.get(ref);if(!s.exists||s.data().expiresAt<Date.now())throw Error('Calendar authorization expired.');pending=s.data();tx.delete(ref);});
  const tokens=await exchange(pending.provider,req.query.code,pending.verifier),id=`${pending.ownerId}_${pending.provider}`;
  const batch=db.batch();batch.set(collection('private').doc(id),{tokens:seal(tokens),ownerId:pending.ownerId});batch.set(collection('connections').doc(id),{ownerId:pending.ownerId,provider:pending.provider,connectedAt:Date.now(),status:'connected'});await batch.commit();res.redirect(`${origin()}/?calendar=connected`);
 }catch(e){logger.warn(e.message);res.redirect(`${origin()}/?calendar=error`);}
});
export const schedulerDisconnect=wrap(async r=>{const uid=verified(r);if(!['google','microsoft'].includes(r.data.provider))bad('Invalid provider.');const id=`${uid}_${r.data.provider}`;await db.runTransaction(async tx=>{const jobs=await tx.get(collection('bookings').where('ownerId','==',uid).where('startAt','>=',Date.now()));if(jobs.docs.some(d=>d.data().status==='confirmed'&&d.data().externalIds?.[r.data.provider]))throw new HttpsError('failed-precondition','This calendar has upcoming synced bookings. Keep it connected until those bookings finish or are cancelled.');tx.delete(collection('private').doc(id));tx.delete(collection('connections').doc(id));});return {ok:true};});
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function mail(b,id,kind){
 if(process.env.EMAIL_ENABLED!=='true')return;
 const token=unseal(b.tokenCipher).token,url=`${origin()}/manage/${id}?token=${encodeURIComponent(token)}`;
 const time=DateTime.fromMillis(b.startAt,{zone:b.attendeeTimezone}).toFormat('cccc, dd LLL yyyy · HH:mm ZZZZ');
 const title=kind==='cancel'?'Booking cancelled':kind.startsWith('reminder')?'Meeting reminder':b.revision>1?'Booking rescheduled':'Booking confirmed';
 try{await collection('mail').doc(`${id}_${b.revision}_${kind}`).create({to:[b.attendeeEmail,b.hostEmail],message:{subject:`${title}: ${b.eventTitle}`,text:`${title}\n${b.eventTitle}\n${time}\nWith ${b.hostName}\n${b.meetingUrl||b.locationValue||''}\nManage your booking: ${url}`,html:`<h2>${esc(title)}</h2><p>${esc(b.eventTitle)}</p><p>${esc(time)}<br>With ${esc(b.hostName)}</p><p>${esc(b.meetingUrl||b.locationValue||'')}</p><p><a href="${esc(url)}">Manage booking</a></p>`}});}catch(e){if(e.code!==6)throw e;}
}
export const schedulerSyncBooking=onDocumentCreated({document:'scheduler_jobs/{id}',region,secrets,retry:true,maxInstances:10},async event=>{
 const fresh=await event.data.ref.get();if(!fresh.exists||['complete','superseded'].includes(fresh.data().status)||(fresh.data().attempts||0)>=5)return;
 const job=fresh.data(),ref=collection('bookings').doc(job.bookingId),snap=await ref.get();if(!snap.exists)return;let b=snap.data();await event.data.ref.update({attempts:FieldValue.increment(1)});
 // Older jobs never create stale events. Cleanup is still safe for old IDs.
 try{
  await removeExternal(b.ownerId,job.oldIds);
  if(b.revision!==job.revision){await removeExternal(b.ownerId,job.partialIds||{});await event.data.ref.update({status:'superseded'});return;}
  if(job.action==='cancel'){await ref.update({syncStatus:'synced',externalIds:{}});await mail(b,ref.id,'cancel');}
  else{
   const synced=await createExternal({...b,externalIds:{...b.externalIds,...job.partialIds}},ref.id,async progress=>{await event.data.ref.update({partialIds:progress.ids});await db.runTransaction(async tx=>{const latest=await tx.get(ref);if(latest.data()?.revision===job.revision)tx.update(ref,{externalIds:progress.ids,meetingUrl:progress.meetingUrl});});});
   const applied=await db.runTransaction(async tx=>{const latest=await tx.get(ref);if(latest.data()?.revision!==job.revision)return false;tx.update(ref,{externalIds:synced.ids,meetingUrl:synced.meetingUrl,syncStatus:'synced'});return true;});
   if(!applied){await removeExternal(b.ownerId,synced.ids);return;}
   b={...b,externalIds:synced.ids,meetingUrl:synced.meetingUrl};await mail(b,ref.id,'confirmation');
  }await event.data.ref.update({status:'complete',completedAt:Date.now()});
 }catch(e){logger.warn(`Calendar sync ${ref.id}: ${e.message}`);await db.runTransaction(async tx=>{const s=await tx.get(ref);if(s.data()?.revision===job.revision)tx.update(ref,{syncStatus:'error'});tx.update(event.data.ref,{status:'error',message:e.message});});throw e;}
});
export const schedulerRetrySync=wrap(async r=>{const uid=verified(r),ref=collection('bookings').doc(safeId(r.data.id)),s=await ref.get();if(!s.exists||s.data().ownerId!==uid)throw new HttpsError('permission-denied','Booking not found.');const b=s.data();await collection('jobs').doc(`${ref.id}_${b.revision}_retry_${Date.now()}`).set({bookingId:ref.id,revision:b.revision,action:b.status==='cancelled'?'cancel':'sync',oldIds:{},status:'pending'});return {ok:true};});
export const schedulerReminders=onSchedule({schedule:'every 5 minutes',region,secrets,maxInstances:1},async()=>{const now=Date.now(),s=await collection('bookings').where('status','==','confirmed').where('startAt','>',now).where('startAt','<=',now+86400000).get();for(const d of s.docs){const b=d.data(),minutes=(b.startAt-now)/60000;for(const offset of [1440,60])if(minutes<=offset&&minutes>offset-10)await mail(b,d.id,`reminder_${offset}`);}});
