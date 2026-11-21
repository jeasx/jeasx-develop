import { LIMITS } from "./catalog";
import type { Form } from "./types";

export type Traveler = {
  /** Prefix of the traveler's fields, e.g. "t0" for "t0_first". */
  key: string;
  kind: "adult" | "child" | "infant";
  /** Counts per kind, e.g. 2 for "Child 2". */
  n: number;
};

/**
 * The travelers of a trip, each with a key for its fields (e.g. "t0_first").
 * The counts come from a form, so they are clamped instead of trusted.
 */
export function travelers(trip: Form = {}): Traveler[] {
  const clamp = (value: unknown, min: number, max: number) =>
    Math.min(Math.max(Math.trunc(Number(value)) || 0, min), max);
  const adults = clamp(trip.adults ?? 1, 1, LIMITS.adults);
  const children = clamp(trip.children, 0, LIMITS.children);
  const infants = clamp(trip.infants, 0, Math.min(LIMITS.infants, adults));
  const list: Traveler[] = [];
  const counts = [
    ["adult", adults],
    ["child", children],
    ["infant", infants],
  ] as const;
  for (const [kind, count] of counts) {
    for (let n = 1; n <= count && list.length < LIMITS.travelers; n++) {
      list.push({ key: `t${list.length}`, kind, n });
    }
  }
  return list;
}
