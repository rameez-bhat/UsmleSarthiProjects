import test from "node:test";
import assert from "node:assert/strict";
import { ensureZoom } from "../zoom.js";
function memoryStore() {
  const data = new Map();
  const store = {
    collection() {
      return {
        doc(id) {
          return {
            id,
            async update(patch) {
              data.set(id, { ...data.get(id), ...patch });
            },
          };
        },
      };
    },
    async runTransaction(fn) {
      return fn({
        async get(ref) {
          return { exists: data.has(ref.id), data: () => data.get(ref.id) };
        },
        set(ref, value) {
          data.set(ref.id, value);
        },
      });
    },
  };
  return { store, data };
}
test("Zoom creation returns only participant join details, reuses ledger and never retries an uncertain create", async () => {
  const previousFetch = globalThis.fetch,
    old = { ...process.env };
  Object.assign(process.env, {
    ZOOM_ACCOUNT_ID: "test-account",
    ZOOM_CLIENT_ID: "test-client",
    ZOOM_CLIENT_SECRET: "test-secret",
  });
  let calls = 0,
    uncertain = false;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("oauth/token"))
      return new Response(
        JSON.stringify({ access_token: "test-access", expires_in: 3600 }),
      );
    calls++;
    assert.ok(String(url).includes("host%40example.test/meetings"));
    const body = JSON.parse(options.body);
    assert.equal(body.settings.waiting_room, true);
    assert.equal(body.settings.join_before_host, false);
    if (uncertain) throw Error("Connection dropped after submission");
    return new Response(
      JSON.stringify({
        id: 1234,
        join_url: "https://zoom.us/j/1234?pwd=participant",
        start_url: "private-host-start-url",
      }),
    );
  };
  try {
    const { store, data } = memoryStore(),
      booking = {
        ownerId: "host",
        hostEmail: "host@example.test",
        eventTitle: "Test meeting",
        revision: 1,
        startAt: Date.now() + 86400000,
        endAt: Date.now() + 88200000,
      };
    const result = await ensureZoom(booking, "booking", store);
    assert.deepEqual(result, {
      id: "1234",
      url: "https://zoom.us/j/1234?pwd=participant",
    });
    await ensureZoom(booking, "booking", store);
    assert.equal(calls, 1);
    assert.equal(
      JSON.stringify([...data.values()]).includes("private-host-start-url"),
      false,
    );
    uncertain = true;
    await assert.rejects(ensureZoom(booking, "unknown", store));
    const count = calls;
    await assert.rejects(
      ensureZoom(booking, "unknown", store),
      /administrator verification/,
    );
    assert.equal(calls, count);
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of [
      "ZOOM_ACCOUNT_ID",
      "ZOOM_CLIENT_ID",
      "ZOOM_CLIENT_SECRET",
    ])
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
  }
});
