import React from "react";
export function PhoneContact({ instructions }) {
  const phone = String(instructions || "").match(
    /Direct\/WhatsApp Phone Call: (\+[1-9]\d{6,14})/,
  )?.[1];
  if (!phone) return null;
  return (
    <div className="phone-contact">
      <p>
        Direct/WhatsApp Phone Call: <strong>{phone}</strong>
      </p>
      <div className="invite-actions">
        <a className="primary" href={`tel:${phone}`}>
          Call host
        </a>
        <a
          className="secondary"
          href={`https://wa.me/${phone.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open WhatsApp
        </a>
      </div>
    </div>
  );
}
