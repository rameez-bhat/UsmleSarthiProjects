export function hostConnectionLabel(profile = {}, identity = {}, uid = "") {
  const clean = (value) => (typeof value === "string" ? value.trim() : "");
  const name = [profile.name, identity.name, identity.displayName]
    .map(clean)
    .find((value) => value && value !== uid);
  const email = clean(profile.email) || clean(identity.email);
  if (name && email && name.toLowerCase() !== email.toLowerCase())
    return `${name} (${email})`;
  return name || email || "A selected host";
}

export function googleConnectionError(hosts) {
  const missing = hosts.filter((host) => !host.providers.includes("google"));
  if (!missing.length) return null;
  return missing
    .map(
      (host) =>
        `${host.name || "Host"}: please connect your Google account to SAMAY in Integrations before this event can be saved.`,
    )
    .join("\n");
}
