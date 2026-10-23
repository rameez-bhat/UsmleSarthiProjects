import test from "node:test";
import assert from "node:assert/strict";
import { searchHosts } from "../host-search.js";
const doc = (id, data) => ({ id, data: () => data });
function databases(users, roles, profiles) {
  const calls = [];
  const identityDb = {
    collection(name) {
      let field, ids;
      const q = {
        orderBy(f) {
          field = f;
          return q;
        },
        startAt(value) {
          calls.push([name, field, value]);
          return q;
        },
        endAt(value) {
          assert.equal(value, "Te\uf8ff");
          return q;
        },
        limit(n) {
          assert.equal(n, 20);
          return q;
        },
        select() {
          return q;
        },
        where(f, op, value) {
          assert.equal(name, "UsersRoles");
          assert.equal(f, "uid");
          assert.equal(op, "in");
          ids = value;
          return q;
        },
        async get() {
          return {
            docs:
              name === "Users"
                ? users
                    .filter((u) => u[field].startsWith("Te"))
                    .map((u) => doc(u.uid, u))
                : roles
                    .filter((r) => ids.includes(r.uid))
                    .map((r, i) => doc(String(i), r)),
          };
        },
      };
      return q;
    },
  };
  const schedulerDb = {
    collection(name) {
      assert.equal(name, "scheduler_hosts");
      return { doc: (id) => ({ id }) };
    },
    async getAll(...refs) {
      return refs.map((ref) => ({
        id: ref.id,
        exists: profiles.includes(ref.id),
      }));
    },
  };
  return { identityDb, schedulerDb, calls };
}
test("host prefix search admits exactly the five authoritative roles with ready profiles", async () => {
  const roles = [
    "Admin",
    "CustomerSupport",
    "SuperAdmin",
    "Mentor",
    "Journalist",
    "Silver",
    "admin",
  ];
  const users = roles.map((role, i) => ({
    uid: `u${i}`,
    displayName: `Test ${i}`,
    email: `Test${i}@example.test`,
    Role: "Admin",
  }));
  const db = databases(
    users,
    roles.map((Role, i) => ({ uid: `u${i}`, Role })),
    users.map((u) => u.uid),
  );
  const result = await searchHosts(db.identityDb, db.schedulerDb, "Te");
  assert.deepEqual(
    result.users.map((u) => u.role),
    roles.slice(0, 5),
  );
  assert.equal(result.next, null);
  assert.equal(result.users.length, 5);
  assert.deepEqual(db.calls, [
    ["Users", "displayName", "Te"],
    ["Users", "email", "Te"],
  ]);
});
test("missing or duplicate role records and incomplete Meetly profiles are excluded", async () => {
  const users = [0, 1, 2].map((i) => ({
    uid: `u${i}`,
    displayName: `Test ${i}`,
    email: `Test${i}@example.test`,
  }));
  const db = databases(
    users,
    [
      { uid: "u0", Role: "Mentor" },
      { uid: "u0", Role: "Admin" },
      { uid: "u1", Role: "Journalist" },
    ],
    ["u0", "u2"],
  );
  assert.deepEqual(
    (await searchHosts(db.identityDb, db.schedulerDb, "Te")).users,
    [],
  );
});
test("short host search performs no database reads", async () => {
  const db = {
    collection() {
      throw Error("Unexpected read");
    },
  };
  assert.deepEqual(await searchHosts(db, db, "T"), { users: [], next: null });
});
