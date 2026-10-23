import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
export const ADMIN_ROLES = Object.freeze([
  "Admin",
  "CustomerSupport",
  "SuperAdmin",
]);
export const HOST_ROLES = Object.freeze([
  "Mentor",
  "Journalist",
  ...ADMIN_ROLES,
]);
export function permissions(role) {
  return {
    role: typeof role === "string" ? role : null,
    isAdmin: ADMIN_ROLES.includes(role),
    canHost: HOST_ROLES.includes(role),
  };
}
// UID queries support existing document IDs without assuming they equal Auth UIDs.
// Duplicate identity records are rejected, including duplicates with the same role.
export async function accessForUid(uid, identityDb = getFirestore()) {
  const records = await identityDb
    .collection("UsersRoles")
    .where("uid", "==", uid)
    .limit(2)
    .get();
  if (records.docs.length !== 1) return permissions(null);
  return permissions(records.docs[0].data().Role);
}
export async function requireHost(uid) {
  const access = await accessForUid(uid);
  if (!access.canHost)
    throw new HttpsError(
      "permission-denied",
      "Your existing UsersRoles account is not authorized to host meetings. Contact an administrator.",
    );
  return access;
}
export async function requireAdmin(uid) {
  const access = await accessForUid(uid);
  if (!access.isAdmin)
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required.",
    );
  return access;
}
