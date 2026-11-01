import { createHash } from "node:crypto";

export const PATH = "/ab-testing";

// Feature flags and experiments of this example. In a real app they come from a config file,
// a database or a flag service, so they can change without a deploy.

/**
 * Flags are turned on for a percentage of visitors ("rollout"), so a new feature can be
 * tried with a few visitors first and then rolled out to everyone.
 *
 * @type {Record<string, { description: string, rollout: number }>}
 */
export const FLAGS = {
  banner: { description: "Shows a banner about a new feature.", rollout: 50 },
  reviews: { description: "Shows customer reviews below the product.", rollout: 20 },
  checkout: { description: "A new checkout which isn't finished yet.", rollout: 0 },
};

/**
 * An experiment splits visitors into variants. Each visitor always sees the same variant,
 * so the results compare two groups of visitors, not random page views.
 */
export const EXPERIMENT = {
  name: "cta",
  variants: {
    A: { headline: "A coffee grinder for every kitchen", button: "Buy now" },
    B: { headline: "Fresh coffee, ground in seconds", button: "Get yours today" },
  },
};

/** @typedef {keyof typeof EXPERIMENT.variants} Variant */

/**
 * Maps a visitor and a key to a number from 0 to 99. The hash makes the result stable for the
 * visitor, but different per key: otherwise the same 20% of visitors would get every new feature.
 *
 * @param {string} visitor
 * @param {string} key
 */
export function bucket(visitor, key) {
  return createHash("sha256").update(`${key}:${visitor}`).digest().readUInt32BE(0) % 100;
}

/**
 * @param {string} visitor
 * @returns {Variant}
 */
export function variantOf(visitor) {
  return bucket(visitor, EXPERIMENT.name) < 50 ? "A" : "B";
}

/**
 * Returns the state of all flags for a visitor. Overrides (e.g. from the query string) win,
 * so testers can preview a feature which isn't rolled out to them.
 *
 * @param {string} visitor
 * @param {Record<string, boolean>} [overrides]
 * @returns {Record<string, boolean>}
 */
export function flagsOf(visitor, overrides = {}) {
  return Object.fromEntries(
    Object.entries(FLAGS).map(([name, { rollout }]) => [
      name,
      overrides[name] ?? bucket(visitor, name) < rollout,
    ]),
  );
}
