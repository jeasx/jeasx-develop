import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createNonce, createPolicy } from "./policy";

describe("createNonce", () => {
  it("returns a new random value every time", () => {
    const nonce = createNonce();
    assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
    assert.notEqual(nonce, createNonce());
  });
});

describe("createPolicy", () => {
  it("only allows scripts with the nonce", () => {
    const policy = createPolicy("abc");
    assert.match(policy, /script-src 'nonce-abc' 'strict-dynamic'/);
    assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval/);
  });
});
