import { isDeepStrictEqual } from "node:util";

// Compare source snapshots, not the host-specific joining instructions used
// to create a booking. Object key ordering is not a settings change.
export function sameBookingSettings(before, after) {
  return isDeepStrictEqual(before, after);
}
