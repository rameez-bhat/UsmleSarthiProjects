import test from "node:test";
import assert from "node:assert/strict";
import { selectedUsers } from "../selected-users.js";
test("selected labels resolve in UID batches without exposing full profiles", async () => {
  const calls = [];
  const db = {
    collection(name) {
      assert.equal(name, "Users");
      const q = {
        where(field, op, uids) {
          assert.deepEqual([field, op], ["uid", "in"]);
          calls.push(uids);
          return q;
        },
        select(...fields) {
          assert.deepEqual(fields, ["uid", "displayName", "email"]);
          return q;
        },
        async get() {
          return {
            docs: [
              {
                data: () => ({
                  uid: "one",
                  displayName: "User One",
                  email: "one@example.test",
                  privateField: "hidden",
                }),
              },
              { data: () => ({ uid: "duplicate", email: "a@example.test" }) },
              { data: () => ({ uid: "duplicate", email: "b@example.test" }) },
            ],
          };
        },
      };
      return q;
    },
  };
  const result = await selectedUsers(db, ["one", "missing", "duplicate"]);
  assert.deepEqual(result, {
    users: [{ uid: "one", name: "User One", email: "one@example.test" }],
  });
  assert.equal(calls.length, 1);
});
test("empty selections make no queries and malformed UIDs are rejected", async () => {
  const db = {
    collection() {
      throw Error("Unexpected query");
    },
  };
  assert.deepEqual(await selectedUsers(db, []), { users: [] });
  await assert.rejects(selectedUsers(db, ["bad/path"]));
});
