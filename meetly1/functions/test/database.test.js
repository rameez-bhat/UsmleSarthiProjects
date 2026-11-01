import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { DATABASE_ID, schedulerDatabase } from "../database.js";

test("scheduler Admin SDK targets calendly rather than the existing default database", async () => {
  const app = initializeApp({ projectId: "demo-meetly-database-test" });
  try {
    assert.equal(DATABASE_ID, "calendly");
    const db = schedulerDatabase();
    assert.equal(db.databaseId, "calendly");
    assert.equal(db.projectId, "demo-meetly-database-test");
  } finally {
    await deleteApp(app);
  }
});

test("deployment cannot accidentally target the default database rules", async () => {
  for (const file of ["firebase.json", "firebase.calendly.json"]) {
    const config = JSON.parse(
      await readFile(new URL(`../../${file}`, import.meta.url), "utf8"),
    );
    assert.ok(Array.isArray(config.firestore));
    assert.deepEqual(
      config.firestore.map((x) => x.database),
      ["calendly"],
    );
    assert.equal(config.firestore[0].rules, "firestore.rules");
  }
});
