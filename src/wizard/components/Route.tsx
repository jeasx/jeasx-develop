import { ORIGIN, type Destination } from "../domain/catalog";

/**
 * "FRA ⇄ JFK" with the cities below, as on the boarding pass and the ticket.
 */
export default function Route({
  destination,
  oneway = false,
}: {
  destination?: Destination;
  oneway?: boolean;
}) {
  return (
    <div class="pass-route">
      <div>
        <span class="pass-code">{ORIGIN.code}</span>
        <span class="pass-city">{ORIGIN.city}</span>
      </div>
      <span class="pass-plane" aria-hidden="true">
        {oneway ? "✈" : "⇄"}
      </span>
      <div class="pass-to">
        <span class="pass-code">{destination?.code ?? "???"}</span>
        <span class="pass-city">
          {destination ? `${destination.flag} ${destination.city}` : "Anywhere"}
        </span>
      </div>
    </div>
  );
}

/**
 * Small labeled facts in a grid, e.g. "Depart: Mon, 1 Mar 2027".
 */
export function Facts({ facts }: { facts: [term: string, value: string | number][] }) {
  return (
    <dl class="pass-facts">
      {facts.map(([term, value]) => (
        <div>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
