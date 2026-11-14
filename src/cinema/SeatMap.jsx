import SeatRow from "./SeatRow";
import { ROWS, SCREENINGS, TIERS, formatPrice } from "./screenings";

/**
 * The screening picker and all rows. Every row loads its seats in parallel.
 * @this {import("./screenings").StoreContext}
 */
export default async function SeatMap() {
  const screening = await this.store.screening();
  return (
    <div class={`seat-map ${this.store.renderer}`} data-part="map">
      <form method="post" action="/cinema/api" class="screening-picker">
        <span class="poster" aria-hidden="true">
          {screening.poster}
        </span>
        <label>
          Screening
          <select name="screening">
            {SCREENINGS.map(({ id, title, time }) => (
              <option value={id} selected={id === screening.id}>
                {time} · {title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" class="show">
          Show
        </button>
      </form>
      <div class="screen" aria-hidden="true">
        Screen
      </div>
      <div class="rows">
        {ROWS.map((row) => (
          <SeatRow row={row} />
        ))}
      </div>
      <ul class="legend">
        {Object.entries(TIERS).map(([tier, { label, price }]) => (
          <li>
            <span class={`seat ${tier} free`} /> {label} {formatPrice(price)}
          </li>
        ))}
        <li>
          <span class="seat selected" /> Selected
        </li>
        <li>
          <span class="seat taken" /> Taken
        </li>
        <li>
          <span class="seat yours" /> Yours
        </li>
      </ul>
    </div>
  );
}
