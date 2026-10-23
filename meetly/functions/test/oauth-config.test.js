import test from "node:test";
import assert from "node:assert/strict";
import { schedulerOrigin, safeOAuthError } from "../oauth-config.js";
test("OAuth return URL accepts LAN, localhost and HTTPS scheduler origins", () => {
  for (const value of [
    "http://192.168.29.2:5173",
    "http://localhost:5173",
    "https://scheduler.example.com",
  ])
    assert.equal(schedulerOrigin(value), value);
});
test("missing, malformed and non-HTTP OAuth origins produce a controlled configuration error", () => {
  for (const value of [
    "",
    null,
    "192.168.29.2:5173",
    "javascript:alert(1)",
    "https://user:pass@example.com",
  ])
    assert.throws(() => schedulerOrigin(value), /APP_ORIGIN/);
});
test("OAuth diagnostics retain known error codes without arbitrary provider data", () => {
  assert.equal(safeOAuthError("invalid_client"), "invalid_client");
  assert.equal(safeOAuthError("invalid_grant"), "invalid_grant");
  for (const value of [
    "token=secret",
    { code: "invalid_client" },
    undefined,
    "sensitive unexpected response",
  ])
    assert.equal(safeOAuthError(value), null);
});
