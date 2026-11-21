# Shared Firebase configuration — v1.8.1

The app no longer reads Firebase config from browser local storage. Firebase Authentication remains shared across the project's sites. Scheduler records still use the named calendly database; Users, UsersRoles and mail remain in (default).

On Firebase Hosting, the app loads /__/firebase/init.json when build-time values are missing. This is the hosting project's public web config, shared across devices. Ensure this site is deployed to usmlesarthi-residency-match. Existing browser configuration is ignored.

For local development or non-Firebase hosting, create .env.local in the meetly folder before starting/building:

```env
VITE_FIREBASE_API_KEY=YOUR_EXISTING_WEB_APP_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_EXISTING_WEB_APP_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=usmlesarthi-residency-match
VITE_FIREBASE_APP_ID=YOUR_EXISTING_WEB_APP_APP_ID
VITE_FUNCTIONS_REGION=asia-south1
VITE_DEMO_MODE=false
```

Copy the actual public values from Firebase Console > Project settings > Your apps > Web app > SDK setup and configuration. Existing VITE_APP_FIREBASE_apiKey/authDomain/projectId/appId names also work. Do not put OAuth client secrets or service account keys in frontend environment files. Vite environment changes require a restart/rebuild. The app cannot invent your missing web app values.

```sh
npm run build
firebase deploy --only hosting:usmlesarthischeduling --project usmlesarthi-residency-match
```

Use your existing firebase.json and hosting target mapping. No backend function deployment is required for this patch. Test in an incognito window and on another device. Private dashboard routes show the login page when logged out; public booking links stay accessible as intended. If shared configuration cannot load, users see a temporary sign-in error instead of a demo dashboard or configuration form. Offline demo is an explicit VITE_DEMO_MODE=true option only.
