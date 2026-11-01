import { expect, test, vi } from "vitest";
const calls = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("./firebase", () => ({ identityDb: {} }));
vi.mock("firebase/firestore", () => ({
  collection: (_, name) => name,
  orderBy: (field) => ({ field }),
  startAt: (value) => ({ start: value }),
  endAt: (value) => ({ end: value }),
  limit: (value) => ({ limit: value }),
  query: (...parts) => parts,
  getDocs: calls.get,
  where: (field, op, value) => ({ field, op, value }),
}));
import {
  searchUsersDirect,
  searchHostsDirect,
  selectedUsersDirect,
} from "./user-search-direct";

test("searches both fields and deduplicates matching user IDs", async () => {
  calls.get.mockReset();
  calls.get.mockResolvedValue({
    docs: [
      {
        id: "doc",
        data: () => ({
          uid: "user",
          displayName: "Aasifa",
          email: "aasifa@example.com",
        }),
      },
    ],
  });
  expect(await searchUsersDirect("A")).toEqual({ users: [], next: null });
  expect(calls.get).not.toHaveBeenCalled();
  const result = await searchUsersDirect(" Aas ");
  expect(result.users).toEqual([
    { uid: "user", name: "Aasifa", email: "aasifa@example.com" },
  ]);
  expect(calls.get).toHaveBeenCalledTimes(2);
  expect(calls.get.mock.calls[0][0]).toEqual([
    "Users",
    { field: "displayName" },
    { start: "Aas" },
    { end: "Aas\uf8ff" },
    { limit: 20 },
  ]);
  expect(calls.get.mock.calls[1][0][1]).toEqual({ field: "email" });
});

test("host search uses authoritative roles and excludes duplicate or non-host roles", async () => {
  const docs = (items) => ({
    docs: items.map((data) => ({ id: data.uid, data: () => data })),
  });
  calls.get.mockReset();
  calls.get
    .mockResolvedValueOnce(
      docs([
        { uid: "a", displayName: "Ana" },
        { uid: "b", displayName: "Ben" },
        { uid: "c", displayName: "Cat" },
      ]),
    )
    .mockResolvedValueOnce(docs([]))
    .mockResolvedValueOnce(
      docs([
        { uid: "a", Role: "Mentor" },
        { uid: "b", Role: "Student" },
        { uid: "c", Role: "Admin" },
        { uid: "c", Role: "Admin" },
      ]),
    );
  const result = await searchHostsDirect("An");
  expect(result.users.map(({ uid, role }) => [uid, role])).toEqual([
    ["a", "Mentor"],
  ]);
  expect(calls.get.mock.calls[2][0]).toEqual([
    "UsersRoles",
    { field: "uid", op: "in", value: ["a", "b", "c"] },
  ]);
});

test("selected users are fetched in batches, ordered by UID and exclude ambiguous records", async () => {
  calls.get.mockReset();
  const row = (uid, name) => ({
    data: () => ({ uid, displayName: name, email: `${uid}@example.com` }),
  });
  calls.get.mockResolvedValueOnce({
    docs: [row("b", "Bee"), row("a", "A"), row("a", "Duplicate")],
  });
  expect(await selectedUsersDirect(["a", "b", "b"])).toEqual({
    users: [{ uid: "b", name: "Bee", email: "b@example.com" }],
  });
  expect(calls.get.mock.calls[0][0]).toEqual([
    "Users",
    { field: "uid", op: "in", value: ["a", "b"] },
  ]);
  calls.get.mockClear();
  expect(await selectedUsersDirect([])).toEqual({ users: [] });
  expect(calls.get).not.toHaveBeenCalled();
});
