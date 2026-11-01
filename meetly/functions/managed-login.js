import { HttpsError } from "firebase-functions/v2/https";

export async function issueManagedLogin({
  actorUid,
  targetUid,
  managed,
  requireAdmin,
  auth,
  audit,
}) {
  if (managed)
    throw new HttpsError(
      "permission-denied",
      "Exit the managed account before opening another account.",
    );
  await requireAdmin(actorUid);
  if (targetUid === actorUid)
    throw new HttpsError("invalid-argument", "This is already your account.");
  const target = await auth.getUser(targetUid);
  if (target.disabled)
    throw new HttpsError("failed-precondition", "This account is disabled.");
  const session = audit.doc();
  await session.set({
    action: "admin-account-login",
    actorUid,
    targetUid,
    at: Date.now(),
    sessionId: session.id,
  });
  const token = await auth.createCustomToken(targetUid, {
    samayAdminActor: actorUid,
    samayAdminSession: session.id,
  });
  return { token, name: target.displayName || target.email || "Selected user" };
}
