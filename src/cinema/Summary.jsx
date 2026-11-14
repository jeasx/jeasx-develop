import { MAX_SEATS, TIERS, formatPrice } from "./screenings";

/**
 * An async component: it loads your selection from `this.store`, like <SeatRow>.
 * @this {import("./screenings").StoreContext}
 */
export default async function Summary() {
  const { screening, seats, total, booked, message } = await this.store.selection();
  return (
    <aside class={`summary ${this.store.renderer}`} data-part="summary" aria-live="polite">
      <h2>
        {screening.poster} {screening.title}
      </h2>
      <p class="time">Today at {screening.time}</p>
      {message && <p class="message">{message}</p>}
      {seats.length ? (
        <ul class="tickets">
          {seats.map(({ id, tier, price }) => (
            <li class={tier}>
              <strong>{id}</strong>
              <span>{TIERS[tier].label}</span>
              <span>{formatPrice(price)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p class="empty">Pick up to {MAX_SEATS} seats on the map.</p>
      )}
      <p class="total">
        <span>
          {seats.length} {seats.length === 1 ? "ticket" : "tickets"}
        </span>
        <strong>{formatPrice(total)}</strong>
      </p>
      <form method="post" action="/cinema/api" class="actions">
        <button name="book" value="1" disabled={!seats.length}>
          Book
        </button>
        <button name="clear" value="1" class="secondary" disabled={!seats.length}>
          Clear
        </button>
      </form>
      {booked.length > 0 && <p class="booked">Your booked seats: {booked.join(", ")}</p>}
      <small class="rendered">
        rendered in the {this.store.renderer} at {new Date().toLocaleTimeString("en-GB")}
      </small>
    </aside>
  );
}
