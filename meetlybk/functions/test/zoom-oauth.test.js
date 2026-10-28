import test from "node:test";
import assert from "node:assert/strict";
import { authorization, exchange } from "../calendars.js";
import { ensureZoom } from "../zoom.js";
test("personal Zoom uses separate OAuth client credentials and Basic token exchange", async () => {
  const env = { ...process.env },
    oldFetch = globalThis.fetch;
  Object.assign(process.env, {
    ZOOM_OAUTH_CLIENT_ID: "personal-client",
    ZOOM_OAUTH_CLIENT_SECRET: "personal-secret",
    OAUTH_REDIRECT_URI: "https://example.com/callback",
  });
  try {
    const url = new URL(authorization("zoom", "state-value", "verifier"));
    assert.equal(url.origin, "https://zoom.us");
    assert.equal(url.searchParams.get("client_id"), "personal-client");
    assert.equal(url.searchParams.get("state"), "state-value");
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://zoom.us/oauth/token");
      assert.equal(
        options.headers.Authorization,
        `Basic ${Buffer.from("personal-client:personal-secret").toString("base64")}`,
      );
      assert.equal(options.body.get("grant_type"), "authorization_code");
      assert.equal(options.body.has("client_secret"), false);
      return new Response(
        JSON.stringify({
          access_token: "access",
          refresh_token: "refresh",
          expires_in: 3600,
        }),
      );
    };
    assert.equal(
      (await exchange("zoom", "code", "verifier")).refresh_token,
      "refresh",
    );
  } finally {
    globalThis.fetch = oldFetch;
    for (const key of [
      "ZOOM_OAUTH_CLIENT_ID",
      "ZOOM_OAUTH_CLIENT_SECRET",
      "OAUTH_REDIRECT_URI",
    ])
      env[key] === undefined
        ? delete process.env[key]
        : (process.env[key] = env[key]);
  }
});
test("personal Zoom creates under the authorized user and never exposes the host start URL", async () => {
  const oldFetch = globalThis.fetch;
  const data = new Map();
  const store = {
    collection() {
      return {
        doc(id) {
          return {
            id,
            async update(value) {
              data.set(id, { ...data.get(id), ...value });
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
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.zoom.us/v2/users/me/meetings");
    assert.equal(options.headers.Authorization, "Bearer personal-access");
    return new Response(
      JSON.stringify({
        id: 99,
        join_url: "https://zoom.us/j/99",
        start_url: "private-host-url",
      }),
    );
  };
  try {
    const result = await ensureZoom(
      {
        ownerId: "host",
        hostEmail: "different@example.com",
        eventTitle: "Personal",
        revision: 1,
        startAt: Date.now() + 86400000,
        endAt: Date.now() + 88200000,
      },
      "booking",
      store,
      "personal-access",
    );
    assert.deepEqual(result, { id: "99", url: "https://zoom.us/j/99" });
    assert.equal(
      JSON.stringify([...data.values()]).includes("private-host-url"),
      false,
    );
  } finally {
    globalThis.fetch = oldFetch;
  }
});
