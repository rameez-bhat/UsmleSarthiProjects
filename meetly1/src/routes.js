export const pagePaths = Object.freeze({
  "Event types": "/event-types",
  "My meetings": "/my-meetings",
  Bookings: "/bookings",
  Availability: "/availability",
  "Hosts & sharing": "/hosts",
  Integrations: "/integrations",
  Administration: "/administration",
  Settings: "/settings",
});
export function pageFromPath(path) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized === "/"
    ? "Event types"
    : Object.keys(pagePaths).find((page) => pagePaths[page] === normalized) ||
        "Not found";
}
