import { trackRequest } from "./request-activity";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserSessionPersistence,
  signInWithCustomToken,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
const env = import.meta.env;
// Public project configuration is shared by the deployment, never per browser.
const hostedConfig = globalThis.__MEETLY_FIREBASE_CONFIG__ || {};
const config = {
  ...hostedConfig,
  apiKey:
    env.VITE_APP_FIREBASE_apiKey ||
    env.VITE_FIREBASE_API_KEY ||
    hostedConfig.apiKey,
  authDomain:
    env.VITE_APP_FIREBASE_authDomain ||
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    hostedConfig.authDomain,
  projectId:
    env.VITE_APP_FIREBASE_projectId ||
    env.VITE_FIREBASE_PROJECT_ID ||
    hostedConfig.projectId,
  appId:
    env.VITE_APP_FIREBASE_appId ||
    env.VITE_FIREBASE_APP_ID ||
    hostedConfig.appId,
};
export const live = !!(
  config.apiKey &&
  config.projectId &&
  config.appId &&
  config.authDomain
);
export const managedAccount =
  typeof window !== "undefined" &&
  (new URLSearchParams(location.search).get("adminSession") === "1" ||
    sessionStorage.getItem("samay.managed") === "true");
if (managedAccount) sessionStorage.setItem("samay.managed", "true");
const app = live
  ? initializeApp(config, managedAccount ? "samay-managed" : "[DEFAULT]")
  : null;
if (app && env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY)
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY,
    ),
    isTokenAutoRefreshEnabled: true,
  });
export const auth = app
  ? managedAccount
    ? initializeAuth(app, { persistence: browserSessionPersistence })
    : getAuth(app)
  : null;
if (managedAccount && window.opener) {
  window.addEventListener("message", async (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== window.opener ||
      event.data?.type !== "samay-admin-token"
    )
      return;
    try {
      await signInWithCustomToken(auth, event.data.token);
      sessionStorage.setItem("samay.managedName", event.data.name);
      location.replace("/event-types");
    } catch {
      document.body.textContent =
        "Unable to open this account. Close this tab and try again from Administration.";
    }
  });
  window.opener.postMessage({ type: "samay-admin-ready" }, location.origin);
}
export const DATABASE_ID = "calendly";
export const db = app ? getFirestore(app, DATABASE_ID) : null;
export const identityDb = app ? getFirestore(app) : null;
export const functions = app
  ? getFunctions(app, env.VITE_FUNCTIONS_REGION || "asia-south1")
  : null;
if (app && env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFirestoreEmulator(identityDb, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
const pendingReads = new Map();
const readMethods = new Set([
  "Access",
  "Workspace",
  "PublicPage",
  "PublicEvent",
  "Slots",
  "SelectedUsers",
  "SearchUsers",
  "SearchHosts",
  "MyMeetings",
  "GetBooking",
  "AttendeeDetails",
]);
export async function api(name, data = {}) {
  const key = readMethods.has(name)
    ? `${auth?.currentUser?.uid || "guest"}:${name}:${JSON.stringify(data)}`
    : null;
  if (key && pendingReads.has(key)) return pendingReads.get(key);
  const request = trackRequest(
    name,
    async () => (await httpsCallable(functions, `scheduler${name}`)(data)).data,
  ).finally(() => {
    if (key) pendingReads.delete(key);
  });
  if (key) pendingReads.set(key, request);
  return request;
}
