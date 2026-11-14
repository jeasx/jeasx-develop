import { AISLES_BEFORE, TIERS } from "./screenings";

const LABELS = {
  free: "free",
  taken: "taken",
  selected: "selected",
  yours: "booked by you",
};

/**
 * One seat: a submit button of its row's form, so picking a seat works without JavaScript.
 * @param {{ seat: import("./screenings").Seat }} props
 */
export default function Seat({ seat }) {
  const { id, number, tier, wheelchair, status } = seat;
  return (
    <button
      name="seat"
      value={id}
      class={`seat ${tier} ${status}${AISLES_BEFORE.includes(number) ? " aisle" : ""}`}
      disabled={status === "taken" || status === "yours"}
      aria-pressed={status === "selected" ? "true" : "false"}
      aria-label={`Seat ${id}, ${TIERS[tier].label}, ${LABELS[status]}${wheelchair ? ", wheelchair space" : ""}`}
      title={`${id} · ${TIERS[tier].label} ${TIERS[tier].price} €`}
    >
      {wheelchair ? "♿" : number}
    </button>
  );
}
