/** @jsxImportSource preact */
import { time } from "./signals";

export default function Clock({ locale }) {
  // The signal only ticks in the browser (see signals.js), so the server renders the current time.
  const now = typeof window === "undefined" ? new Date() : time.value;
  return (
    <div class="center">
      <strong>{locale}</strong>
      <br />
      <time>{now.toLocaleTimeString(locale)}</time>
    </div>
  );
}
