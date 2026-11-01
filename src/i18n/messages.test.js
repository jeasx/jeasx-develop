import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator, negotiateLocale } from "./messages";

describe("negotiateLocale", () => {
  it("picks the best supported language", () => {
    assert.equal(negotiateLocale("de-CH,de;q=0.9,en;q=0.8"), "de");
    assert.equal(negotiateLocale("es;q=1, fr;q=0.5, en;q=0.4"), "fr");
  });

  it("falls back to English", () => {
    assert.equal(negotiateLocale(undefined), "en");
    assert.equal(negotiateLocale("ja, *;q=0.1"), "en");
  });
});

describe("createTranslator", () => {
  it("uses the plural rules of each language", () => {
    const pl = createTranslator("pl");
    assert.equal(pl("apples", { count: 1 }), "1 jabłko");
    assert.equal(pl("apples", { count: 3 }), "3 jabłka");
    assert.equal(pl("apples", { count: 5 }), "5 jabłek");
    assert.equal(pl("apples", { count: 22 }), "22 jabłka");

    // French uses the singular for zero.
    assert.equal(createTranslator("fr")("apples", { count: 0 }), "0 pomme");
  });

  it("formats numbers for the locale", () => {
    assert.equal(createTranslator("de")("apples", { count: 1000 }), "1.000 Äpfel");
  });

  it("falls back to the key for unknown messages", () => {
    assert.equal(createTranslator("de")("unknown"), "unknown");
  });
});
