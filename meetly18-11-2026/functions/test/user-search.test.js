import test from "node:test";
import assert from "node:assert/strict";
import { searchUsers } from "../user-search.js";
test("two-character minimum performs no database reads", async () => {
  const db = {
    collection() {
      throw Error("Unexpected read");
    },
  };
  for (const value of ["", " a ", null])
    assert.deepEqual(await searchUsers(db, value), { users: [], next: null });
});
test("name and email use bounded prefix queries, preserve case, deduplicate and return basic fields", async () => {
  const calls = [];
  const doc = (id, name) => ({
    id,
    data: () => ({
      uid: id,
      displayName: name,
      email: id + "@example.test",
      privateField: "hidden",
    }),
  });
  const db = {
    collection(name) {
      assert.equal(name, "Users");
      let field;
      const q = {
        orderBy(v) {
          field = v;
          calls.push([v]);
          return q;
        },
        startAt(v) {
          calls.at(-1).push(v);
          return q;
        },
        endAt(v) {
          calls.at(-1).push(v);
          return q;
        },
        limit(v) {
          assert.equal(v, 20);
          return q;
        },
        select(...fields) {
          assert.deepEqual(fields, ["uid", "displayName", "email"]);
          return q;
        },
        async get() {
          return {
            docs:
              field === "displayName"
                ? [doc("z", "Zed"), doc("a", "Alpha")]
                : [doc("a", "Alpha")],
          };
        },
      };
      return q;
    },
  };
  const result = await searchUsers(db, " Mo ");
  assert.deepEqual(calls, [
    ["displayName", "Mo", "Mo\uf8ff"],
    ["email", "Mo", "Mo\uf8ff"],
  ]);
  assert.deepEqual(
    result.users.map((u) => u.uid),
    ["a", "z"],
  );
  assert.equal(result.next, null);
  assert.equal("privateField" in result.users[0], false);
});
