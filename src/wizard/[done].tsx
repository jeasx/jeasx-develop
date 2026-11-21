import DefaultLayout from "../Layout";
import Barcode from "./components/Barcode";
import Route, { Facts } from "./components/Route";
import { findCabin, findDestination, formatPrice } from "./domain/catalog";
import { formatDate } from "./domain/dates";
import quote from "./domain/price";
import { href } from "./domain/steps";
import { travelers } from "./domain/travelers";
import type { Booking } from "./storage";

/**
 * The guard only renders this page with a booking from the "booking" cookie.
 */
export default function ({ booking }: { booking: Booking }) {
  const { trip, travelers: names } = booking.data;
  const destination = findDestination(trip.destination);
  const people = travelers(trip);
  return (
    <DefaultLayout title="Booked - Trip booking" css="/wizard/index.css" robots="noindex">
      <div class="wizard done" style={`--hue: ${destination?.hue ?? 260}`}>
        <header class="wizard-head">
          <p class="wizard-eyebrow">Jeasx Air · Confirmed</p>
          <h1>Pack your bags, {names.t0_first}!</h1>
          <p>
            Your tickets are on their way to {names.email}. Well, they would be: this is a demo, so
            nothing was booked and your answers were deleted from your browser.
          </p>
        </header>
        <article class="ticket">
          <div class="ticket-main">
            <Route destination={destination} oneway={trip.type === "oneway"} />
            <Facts
              facts={[
                ["Depart", formatDate(trip.depart)],
                ["Return", trip.type === "return" ? formatDate(trip.return) : "One-way"],
                ["Cabin", findCabin(trip.cabin)?.label],
                ["Paid", formatPrice(quote(booking.data)?.total ?? 0)],
              ]}
            />
            <ul class="ticket-people">
              {people.map(({ key }) => (
                <li>
                  {names[`${key}_first`]} {names[`${key}_last`]}
                </li>
              ))}
            </ul>
          </div>
          <div class="ticket-stub">
            <span class="ticket-label">Booking reference</span>
            <strong class="ticket-ref">{booking.ref}</strong>
            <Barcode value={booking.ref} />
          </div>
        </article>
        <p class="done-again">
          <a href={href("trip")} role="button">
            Plan another trip
          </a>
        </p>
      </div>
    </DefaultLayout>
  );
}
