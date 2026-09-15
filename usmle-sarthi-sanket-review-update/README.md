# USMLE Sarthi Program Signaling Tool — Modular Complete Project

## Run

1. Copy `.env.example` to `.env` and fill in the Firebase web-app values.
2. If you already have the full source files, replace:
   - `src/apis/countryData.ts`
   - `src/apis/MedicalSchools.ts`
3. Run:
   ```bash
   npm install
   npm run build
   npm run dev
   ```

## Deploy only this Firebase Hosting site

```bash
npm run build
firebase deploy --only hosting:signaling
```

The project is mapped to the Firebase Hosting site `usmlesarthisignaling`.

## Important data behavior

- Legacy applicant profile is read from collection `Users` using `uid == auth.currentUser.uid` only when a Signaling-owned profile does not exist.
- After first save, profile is stored at `signaling_profiles/{uid}` and used thereafter.
- Each assessment stores its profile snapshot at `assessments/{assessmentId}/profile/current`.
- Duplicate assessment for the same specialty is prevented.
- First questionnaire answer set is saved at `assessments/{assessmentId}/answers/current` and reused for later programs.
- Program-specific answers are stored separately.
- Assessed programs show View Result + Remove instead of Assess.
