import React, { useSyncExternalStore } from "react";
import {
  subscribeRequestActivity,
  getRequestActivity,
} from "../request-activity";
export function RequestActivity() {
  const activity = useSyncExternalStore(
    subscribeRequestActivity,
    getRequestActivity,
    getRequestActivity,
  );
  if (!activity.count) return null;
  return (
    <div
      className="request-activity"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="request-progress" aria-hidden="true" />
      <div className="request-status-card">
        <span className="request-spinner" aria-hidden="true" />
        <div>
          <strong>{activity.labels[0]}</strong>
          <span>
            {activity.count > 1
              ? `${activity.count} requests in progress`
              : "Please wait…"}
          </span>
        </div>
      </div>
    </div>
  );
}
