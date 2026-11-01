import test from "node:test";
import assert from "node:assert/strict";
import { issueManagedLogin } from "../managed-login.js";
function fixture() {
  const calls = [];
  return {
    calls,
    options: {
      actorUid: "admin",
      targetUid: "host",
      managed: false,
      requireAdmin: async (uid) => calls.push(["check", uid]),
      auth: {
        getUser: async (uid) => {
          calls.push(["user", uid]);
          return { email: "host@example.com" };
        },
        createCustomToken: async (uid, claims) => {
          calls.push(["token", uid, claims]);
          return "custom-token";
        },
      },
      audit: {
        doc: () => ({
          id: "audit-session",
          set: async (entry) => calls.push(["audit", entry]),
        }),
      },
    },
  };
}
test("managed login checks administrator and audits actor before issuing target token", async () => {
  const { calls, options } = fixture();
  assert.deepEqual(await issueManagedLogin(options), {
    token: "custom-token",
    name: "host@example.com",
  });
  assert.deepEqual(
    calls.map((c) => c[0]),
    ["check", "user", "audit", "token"],
  );
  assert.deepEqual(calls[3], [
    "token",
    "host",
    { samayAdminActor: "admin", samayAdminSession: "audit-session" },
  ]);
});
test("non-admin cannot obtain a token", async () => {
  const { calls, options } = fixture();
  options.requireAdmin = async () => {
    throw Error("denied");
  };
  await assert.rejects(issueManagedLogin(options), /denied/);
  assert.equal(calls.length, 0);
});
test("nested managed sessions and disabled targets are rejected", async () => {
  const { calls, options } = fixture();
  await assert.rejects(
    issueManagedLogin({ ...options, managed: true }),
    /Exit/,
  );
  assert.equal(calls.length, 0);
  options.auth.getUser = async () => ({ disabled: true });
  await assert.rejects(issueManagedLogin(options), /disabled/);
  assert.equal(
    calls.some((c) => c[0] === "token"),
    false,
  );
});
test("audit failure prevents token issuance", async () => {
  const { calls, options } = fixture();
  options.audit.doc = () => ({
    set: async () => {
      throw Error("audit unavailable");
    },
  });
  await assert.rejects(issueManagedLogin(options), /audit unavailable/);
  assert.equal(
    calls.some((c) => c[0] === "token"),
    false,
  );
});
