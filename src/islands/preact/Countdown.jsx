/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";

/** @type {[string, number][]} */
const UNITS = [
  ["days", 86400000],
  ["hours", 3600000],
  ["minutes", 60000],
  ["seconds", 1000],
];

/**
 * Counts down to the conference. The server passes its time as "now",
 * so the first render in the browser matches the HTML; the clock starts afterwards.
 */
export default function Countdown({ target, now: serverNow }) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let left = Math.max(0, Date.parse(target) - now);
  return (
    <div class="countdown" role="timer">
      {UNITS.map(([unit, size]) => {
        const value = Math.floor(left / size);
        left -= value * size;
        return (
          <div class="countdown-unit">
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{unit}</span>
          </div>
        );
      })}
    </div>
  );
}
