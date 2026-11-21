import test from "node:test";
import assert from "node:assert/strict";
import { existingMailPayload, dispatchMailDraft } from "../mail-bridge.js";
test("mail payload matches the existing to/message html format and escapes user text", () => {
  const data = existingMailPayload({
    to: ["student@example.test"],
    message: {
      subject: "Meeting <One>",
      text: "Dear <Student>\nhttps://example.test/book?a=1&b=2",
    },
    bookingId: "private",
  });
  assert.deepEqual(Object.keys(data).sort(), ["message", "to"]);
  assert.deepEqual(Object.keys(data.message).sort(), ["html", "subject"]);
  assert.equal(data.to, "student@example.test");
  assert.ok(data.message.html.includes("&lt;Student&gt;"));
  assert.ok(
    data.message.html.includes('href="https://example.test/book?a=1&amp;b=2"'),
  );
  assert.equal("bookingId" in data, false);
});
test("bridge writes only to the provided default mail collection and forwards once", async () => {
  let draft = {
      to: ["student@example.test"],
      message: { subject: "Invitation", text: "Accept your invitation" },
    },
    creates = 0,
    payload;
  const source = {
    id: "booking_invitation_uid",
    async get() {
      return { exists: true, data: () => draft };
    },
    async update(update) {
      draft = { ...draft, ...update };
    },
  };
  const defaultDb = {
    collection(name) {
      assert.equal(name, "mail");
      return {
        doc(id) {
          assert.equal(id, "meetly_booking_invitation_uid");
          return {
            id,
            async create(value) {
              creates++;
              payload = value;
            },
          };
        },
      };
    },
  };
  await dispatchMailDraft(source, defaultDb);
  await dispatchMailDraft(source, defaultDb);
  assert.equal(creates, 1);
  assert.equal(payload.to, "student@example.test");
  assert.ok(payload.message.html);
  assert.ok(draft.forwardedAt);
  assert.equal(draft.dispatchError, false);
});
test("an already-existing queue entry is retained rather than overwritten on retry", async () => {
  let marked = false;
  const ref = {
    id: "draft",
    async get() {
      return {
        exists: true,
        data: () => ({
          to: "host@example.test",
          message: { subject: "Meeting", html: "<p>Details</p>" },
        }),
      };
    },
    async update() {
      marked = true;
    },
  };
  const db = {
    collection() {
      return {
        doc() {
          return {
            id: "meetly_draft",
            async create() {
              const error = Error("Exists");
              error.code = 6;
              throw error;
            },
          };
        },
      };
    },
  };
  await dispatchMailDraft(ref, db);
  assert.equal(marked, true);
});
