import crypto from "node:crypto";
export function jitsiToken(
  booking,
  auth,
  hostname,
  env = process.env,
  now = Date.now(),
) {
  if (!env.JITSI_JWT_SECRET || !env.JITSI_JWT_APP_ID)
    throw Error(
      "Configure JITSI_JWT_APP_ID and JITSI_JWT_SECRET for your secured Jitsi server.",
    );
  const at = Math.floor(now / 1000),
    moderator =
      auth.uid === booking.ownerId || auth.uid === booking.organizerId;
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: env.JITSI_JWT_APP_ID,
      aud: "jitsi",
      sub: hostname,
      room: booking.roomKey,
      iat: at,
      nbf: at - 10,
      exp: at + 7200,
      context: {
        user: {
          id: auth.uid,
          name: auth.token?.name || auth.token?.email || "Participant",
          email: auth.token?.email || "",
          moderator: String(moderator),
        },
      },
    }),
  ).toString("base64url");
  const body = `${header}.${payload}`;
  return `${body}.${crypto.createHmac("sha256", env.JITSI_JWT_SECRET).update(body).digest("base64url")}`;
}
