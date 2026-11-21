// The boarding pass next to the form. The server renders it with the stored answers;
// the browser renders it again with the same component while you type (see index.ts).
import { findCabin, findDestination, formatPrice } from "../domain/catalog";
import { formatDate, daysBetween, parseDate } from "../domain/dates";
import quote from "../domain/price";
import { travelers } from "../domain/travelers";
import Route, { Facts } from "./Route";
import type { Data } from "../domain/types";

export default function Summary({ data }: { data: Data }) {
  const trip = data.trip ?? {};
  const destination = findDestination(trip.destination);
  const cabin = findCabin(trip.cabin);
  const price = quote(data);
  const people = travelers(trip);
  const depart = parseDate(trip.depart);
  const back = trip.type === "return" ? parseDate(trip.return) : undefined;
  const nights =
    depart !== undefined && back !== undefined && back > depart ? daysBetween(depart, back) : 0;

  return (
    <aside
      id="summary"
      class="pass"
      aria-label="Your trip"
      style={destination ? `--hue: ${destination.hue}` : undefined}
    >
      <div class="pass-top">
        <Route destination={destination} oneway={trip.type === "oneway"} />
        <Facts
          facts={[
            ["Depart", formatDate(trip.depart) || "—"],
            trip.type === "oneway"
              ? ["Trip", "One-way"]
              : ["Return", formatDate(trip.return) || "—"],
            ["Travelers", people.length],
            ["Cabin", cabin?.label ?? "—"],
          ]}
        />
        {nights > 0 && (
          <p class="pass-nights">
            {nights} night{nights > 1 ? "s" : ""} in {destination?.city ?? "the sun"}
          </p>
        )}
      </div>
      <div class="pass-tear" aria-hidden="true" />
      <div class="pass-bottom">
        {price ? (
          <>
            <ul class="pass-lines">
              {price.lines.map((line) => (
                <li>
                  <span>{line.label}</span>
                  <span>{formatPrice(line.amount)}</span>
                </li>
              ))}
            </ul>
            <p class="pass-total">
              <span>Total</span>
              <strong>{formatPrice(price.total)}</strong>
            </p>
          </>
        ) : (
          <p class="pass-empty">Pick a destination to see your fare.</p>
        )}
      </div>
    </aside>
  );
}
