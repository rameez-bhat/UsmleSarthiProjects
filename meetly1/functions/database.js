// All scheduler records belong in this named Firestore database.
// S3 student/lead access must use a separately reviewed integration adapter.
import { getFirestore } from "firebase-admin/firestore";
export const DATABASE_ID = "calendly";
export const schedulerDatabase = () => getFirestore(DATABASE_ID);
