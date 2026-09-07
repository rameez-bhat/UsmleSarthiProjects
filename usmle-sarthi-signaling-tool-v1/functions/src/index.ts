import { initializeApp } from 'firebase-admin/app';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { publicConfig, specialtyConfig } from './config/v1';
import { calculatePortfolio as runPortfolio, calculateProgram as runProgram } from './engine/scoring';
initializeApp();
const authRequired = (request:any) => { if(!request.auth) throw new HttpsError('unauthenticated','Authentication required.'); };
export const getPublicConfig = onCall({region:'us-central1'}, request => { authRequired(request); return publicConfig(); });
export const calculateProgram = onCall({region:'us-central1'}, request => { authRequired(request); try { return runProgram(request.data); } catch(e:any) { throw new HttpsError('invalid-argument',e.message); } });
export const calculatePortfolio = onCall({region:'us-central1'}, request => { authRequired(request); const cfg = specialtyConfig.find(x=>x.specialty===request.data.specialty && x.season===Number(request.data.season)); if(!cfg) throw new HttpsError('failed-precondition','Specialty configuration not found.'); return runPortfolio({...request.data,specialtyConfig:{...cfg,...request.data.inventoryOverride}}); });
