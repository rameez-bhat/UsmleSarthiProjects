# USMLE Sarthi Program Signaling Tool — v1.0

React + TypeScript + Firebase implementation starter based on Framework #1, Programmer Implementation Specification v1, and Scoring Configuration v1.

## Included
- React 19 + Vite application shell
- Firebase email-link authentication
- Firestore save/resume structure and security rules
- Applicant profile and program selection (1–50)
- Configuration-driven question renderer
- Server-side eligibility + scoring engine
- Application Fit (58), Signal Value (42), Final Priority (100)
- Confidence, reasons/warnings, overrides
- Portfolio allocation engine and warnings
- Versioned v1.0 scoring configuration
- Export row builder using the exact 31-column workbook order
- Vitest regression coverage for the supplied acceptance behaviors

## Before production
1. Create a Firebase project and copy `.env.example` to `.env`.
2. Enable Firebase Authentication > Email link sign-in.
3. Add the hosting domain to Firebase Auth authorized domains.
4. Import the Sarthi program list into Firestore `/programs` using immutable program IDs.
5. Populate 2027 signal inventory counts in `functions/src/config/v1.ts` (`gold_count`, `silver_count`, `general_count`). These intentionally remain `null` because the supplied configuration marks them REQUIRED BEFORE LAUNCH.
6. Replace/directly integrate email-link access with Sarthi's existing email allow-list/authentication if available. The provided UI uses Firebase email-link auth but does not contain the private Sarthi email registry.
7. Confirm the `DOES_NOT_USE` "major relationship" exception threshold. The starter isolates the current interpretation as R1 >= 9 or R2 >= 8 or R3 = ENCOURAGED_SIGNAL.

## Local setup
```bash
npm install
npm --prefix functions install
cp .env.example .env
npm run dev
```

## Build and test
```bash
npm run build
npm --prefix functions run build
npm --prefix functions test
```

## Firebase
```bash
firebase login
firebase use --add
npm run deploy
```

## Firestore `/programs` shape
```json
{
  "program_id": "immutable-id",
  "specialty": "Internal Medicine",
  "name": "Example Program",
  "city": "City",
  "state": "ST",
  "active": true,
  "source_updated_at": "2026-08-01"
}
```

## Important
Do not move scoring points into the React bundle. `getPublicConfig` strips points and exposes only prompts/answer labels. `calculateProgram` performs scoring in Firebase Functions.
