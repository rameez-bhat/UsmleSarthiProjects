import {initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
import {getFunctions,httpsCallable,connectFunctionsEmulator} from 'firebase/functions';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';
const env=import.meta.env;
let saved={};try{saved=JSON.parse(localStorage.getItem('meetly.firebase')||'{}');}catch{}
const config = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_APP_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_APP_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_APP_FIREBASE_appId,
};
//const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID,...saved};
export const live=!!(config.apiKey&&config.projectId&&config.appId&&config.authDomain);
const app=live?initializeApp(config):null;
if(app&&env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY)initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY),isTokenAutoRefreshEnabled:true});
export const auth=app?getAuth(app):null;
export const db=app?getFirestore(app):null;
export const functions=app?getFunctions(app,env.VITE_FUNCTIONS_REGION||'asia-south1'):null;
if(app&&env.VITE_USE_EMULATORS==='true'){connectAuthEmulator(auth,'http://localhost:9099');connectFirestoreEmulator(db,'localhost',8080);connectFunctionsEmulator(functions,'localhost',5001);}
export async function api(name,data={}){return (await httpsCallable(functions,`scheduler${name}`)(data)).data;}
