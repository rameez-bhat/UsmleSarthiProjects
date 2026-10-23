export function schedulerOrigin(value = process.env.APP_ORIGIN) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw Error(
      "APP_ORIGIN is missing or invalid. Set it to the scheduler address, including http:// or https://, and redeploy both OAuth functions.",
    );
  }
  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  )
    throw Error(
      "APP_ORIGIN must be an HTTP or HTTPS scheduler address without credentials.",
    );
  return parsed.origin;
}
export function safeOAuthError(value) {
  const allowed = [
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "invalid_scope",
    "access_denied",
    "temporarily_unavailable",
    "server_error",
    "invalid_resource",
    "interaction_required",
    "consent_required",
  ];
  return allowed.includes(value) ? value : null;
}
