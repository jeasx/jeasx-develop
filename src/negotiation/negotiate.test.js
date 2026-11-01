import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { negotiate } from "./negotiate";

const OFFERS = ["text/html", "application/json", "text/csv"];

describe("negotiate", () => {
  it("picks the first offer without an Accept header", () => {
    assert.equal(negotiate(undefined, OFFERS), "text/html");
    assert.equal(negotiate("", OFFERS), "text/html");
  });

  it("picks HTML for a browser", () => {
    const accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    assert.equal(negotiate(accept, OFFERS), "text/html");
  });

  it("respects weights", () => {
    assert.equal(negotiate("text/*;q=0.5, application/json;q=0.9", OFFERS), "application/json");
  });

  it("lets specific ranges override wildcards", () => {
    assert.equal(negotiate("text/*, text/html;q=0", OFFERS), "text/csv");
  });

  it("returns undefined if nothing is acceptable", () => {
    assert.equal(negotiate("image/png", OFFERS), undefined);
  });

  it("ignores malformed ranges", () => {
    assert.equal(negotiate("nonsense, application/json;q=abc, text/csv", OFFERS), "text/csv");
  });
});
