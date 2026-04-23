import { time } from "./signals";

export default function Clock({ locale }) {
  return (
    <div class="center">
      <strong>{locale}</strong>
      <br />
      <time>{time.value.toLocaleTimeString(locale)}</time>
    </div>
  );
}
