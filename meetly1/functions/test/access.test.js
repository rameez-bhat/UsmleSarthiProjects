import test from "node:test";
import assert from "node:assert/strict";
import { permissions, accessForUid } from "../access.js";
const database = (records) => ({
  collection(name) {
    assert.equal(name, "UsersRoles");
    return {
      where(field, operator, uid) {
        assert.deepEqual([field, operator, uid], ["uid", "==", "auth-uid"]);
        return {
          limit(n) {
            assert.equal(n, 2);
            return {
              async get() {
                return {
                  docs: records.map((record) => ({ data: () => record })),
                };
              },
            };
          },
        };
      },
    };
  },
});
test("all administrator roles can administer and host", () => {
  for (const role of ["Admin", "CustomerSupport", "SuperAdmin"])
    assert.deepEqual(permissions(role), { role, isAdmin: true, canHost: true });
});
test("Mentor and Journalist can host without administrator access", () => {
  for (const role of ["Mentor", "Journalist"])
    assert.deepEqual(permissions(role), {
      role,
      isAdmin: false,
      canHost: true,
    });
});
test("student, missing and incorrectly cased roles cannot host or administer", () => {
  for (const role of [
    "Silver",
    "admin",
    "mentor",
    "",
    null,
    undefined,
    {},
    ["Admin"],
  ]) {
    assert.equal(permissions(role).canHost, false);
    assert.equal(permissions(role).isAdmin, false);
  }
});
test("identity uses the server authenticated UID rather than email or document ID", async () => {
  assert.equal(
    (
      await accessForUid(
        "auth-uid",
        database([{ uid: "auth-uid", Role: "Admin" }]),
      )
    ).isAdmin,
    true,
  );
});
test("missing and duplicate identities fail closed", async () => {
  for (const records of [
    [],
    [{ Role: "Admin" }, { Role: "Silver" }],
    [{ Role: "Admin" }, { Role: "Admin" }],
  ])
    assert.equal(
      (await accessForUid("auth-uid", database(records))).canHost,
      false,
    );
});
test("changed identity role takes effect on the next server check", async () => {
  const record = { Role: "Mentor" },
    db = database([record]);
  assert.equal((await accessForUid("auth-uid", db)).canHost, true);
  record.Role = "Silver";
  assert.equal((await accessForUid("auth-uid", db)).canHost, false);
});
