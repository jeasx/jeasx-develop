import {
  BAG_PRICE,
  FARE_SHARE,
  INSURANCE_RATE,
  SEATS_TOGETHER_PRICE,
  findCabin,
  findDestination,
} from "./catalog";
import { travelers } from "./travelers";
import type { Data } from "./types";

export type Line = { label: string; amount: number };
export type Quote = { lines: Line[]; total: number; legs: number };

/**
 * Prices whatever is known so far, so the summary can show a running total from the first step.
 * Returns undefined until a destination is picked.
 */
export default function quote(data: Data): Quote | undefined {
  const trip = data.trip ?? {};
  const destination = findDestination(trip.destination);
  if (!destination) {
    return undefined;
  }
  const cabin = findCabin(trip.cabin) ?? findCabin("economy");
  const legs = trip.type === "oneway" ? 1 : 2;
  const leg = destination.fare * cabin.factor * legs;
  const people = travelers(trip);
  const count = (kind: keyof typeof FARE_SHARE) => people.filter((p) => p.kind === kind).length;

  const lines: Line[] = [];
  const kinds = [
    ["adult", "Adult"],
    ["child", "Child"],
    ["infant", "Infant"],
  ] as const;
  for (const [kind, label] of kinds) {
    const n = count(kind);
    if (n > 0) {
      lines.push({
        label: `${n} × ${label}${n > 1 ? "s" : ""}`,
        amount: Math.round(n * leg * FARE_SHARE[kind]),
      });
    }
  }
  const fares = lines.reduce((sum, line) => sum + line.amount, 0);

  const extras = data.extras ?? {};
  const seated = people.length - count("infant");
  const bags = Math.min(Math.max(Number(extras.bags) || 0, 0), 2);
  if (bags > 0) {
    lines.push({
      label: `${bags * seated} checked bag${bags * seated > 1 ? "s" : ""}`,
      amount: bags * seated * legs * BAG_PRICE,
    });
  }
  if (extras.seats === "on" && seated > 1) {
    lines.push({
      label: "Seats together",
      amount: seated * legs * SEATS_TOGETHER_PRICE,
    });
  }
  if (destination.passport && extras.insurance === "yes") {
    lines.push({
      label: "Travel insurance",
      amount: Math.round(fares * INSURANCE_RATE),
    });
  }

  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    legs,
  };
}
