import React from "react";
import { CheckCircle2, X } from "lucide-react";
export function Toast({ text, close }) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={19} />
      <span>{text}</span>
      <button
        className="icon-button"
        aria-label="Dismiss message"
        onClick={close}
      >
        <X size={16} />
      </button>
    </div>
  );
}
