/** @jsxImportSource preact */
import { time } from "./signals";

export default function Clock({ locale, city, timeZone }) {
  // The signal only ticks in the browser (see signals.js), so the server renders the current time.
  const now = typeof window === "undefined" ? new Date() : time.value;
  return (
    <figure class="pr-clock">
      <time dateTime={now.toISOString()}>
        {now.toLocaleTimeString(locale, { timeZone, hourCycle: "h23" })}
      </time>
      <figcaption>
        <strong>{city}</strong>
        <span>
          {now.toLocaleDateString(locale, {
            timeZone,
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </figcaption>
    </figure>
  );
}
