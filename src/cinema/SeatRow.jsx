import Seat from "./Seat";

/**
 * An async component: it loads the seats of its row from `this.store`, which reads a
 * cookie on the server and fetches the API in the browser.
 *
 * @this {import("./screenings").StoreContext}
 * @param {{ row: string }} props
 */
export default async function SeatRow({ row }) {
  const seats = await this.store.seats(row);
  return (
    <form method="post" action="/cinema/api" class="seat-row" data-part={`row:${row}`}>
      <span class="row-label">{row}</span>
      {seats.map((seat) => (
        <Seat seat={seat} />
      ))}
      <span class="row-label">{row}</span>
    </form>
  );
}
