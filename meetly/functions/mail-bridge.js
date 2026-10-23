import { getFirestore } from "firebase-admin/firestore";
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function existingMailPayload(draft) {
  const to = Array.isArray(draft.to) ? draft.to.join(", ") : draft.to;
  if (typeof to !== "string" || !to.trim() || !draft.message?.subject)
    throw Error("Invalid meeting email draft.");
  const subject = String(draft.message.subject).replace(/[\r\n]+/g, " ");
  const content = String(draft.message.text || "")
    .split(/(https?:\/\/[^\s]+)/g)
    .map((part) =>
      /^https?:\/\//.test(part)
        ? `<a href="${escapeHtml(part)}">${escapeHtml(part)}</a>`
        : escapeHtml(part).replace(/\n/g, "<br>"),
    )
    .join("");
  const html =
    draft.message.html ||
    `<html><body style="font-family:Arial,sans-serif;padding:20px;line-height:1.6;"><h2>${escapeHtml(subject)}</h2><p>${content}</p><p>Thanks &amp; Regards,<br>USMLE Sarthi Team</p></body></html>`;
  // Keep exactly the existing mail service's payload shape.
  return { to, message: { subject, html } };
}
export async function dispatchMailDraft(ref, defaultDb = getFirestore()) {
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data().forwardedAt) return;
  const target = defaultDb.collection("mail").doc(`meetly_${ref.id}`);
  try {
    await target.create(existingMailPayload(snapshot.data()));
  } catch (e) {
    if (e.code !== 6) throw e;
  }
  await ref.update({
    forwardedAt: Date.now(),
    defaultMailId: target.id,
    dispatchError: false,
  });
}
