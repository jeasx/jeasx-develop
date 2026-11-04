/** @jsxImportSource react */
import { useEffect, useState } from "react";

const TICKS = Array.from({ length: 60 }, (_, index) => index);

/**
 * Angles of the hands in degrees for the seconds since midnight. They keep growing
 * instead of jumping back to 0, so the hands don't spin backwards at a full minute.
 */
function angles(seconds) {
  return { hours: seconds / 120, minutes: seconds / 10, seconds: seconds * 6 };
}

/** Seconds since the last midnight in the local time zone. */
function secondsOfDay(date) {
  return Math.round(
    (date.getTime() - new Date(date).setHours(0, 0, 0, 0)) / 1000,
  );
}

export default function Clock() {
  // The server doesn't know the time zone of the visitor, so the hands only appear
  // after hydration. Rendering null on both sides keeps the markup identical.
  const [now, setNow] = useState(null);
  // Count on from the time of day at mount, so the angles don't reset at midnight.
  const [start, setStart] = useState(null);

  useEffect(() => {
    const mounted = new Date();
    setStart({ at: mounted.getTime(), seconds: secondsOfDay(mounted) });
    setNow(mounted);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { hours, minutes, seconds } =
    now && start
      ? angles(start.seconds + Math.round((now.getTime() - start.at) / 1000))
      : angles(0);

  return (
    <figure className={`clock${now ? " ready" : ""}`}>
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={now ? now.toLocaleTimeString() : "Clock"}
      >
        <circle className="clock-face" cx="100" cy="100" r="96" />
        {TICKS.map((tick) => (
          <line
            key={tick}
            className={tick % 5 === 0 ? "clock-tick major" : "clock-tick"}
            x1="100"
            y1={tick % 5 === 0 ? 12 : 10}
            x2="100"
            y2={tick % 5 === 0 ? 24 : 16}
            transform={`rotate(${tick * 6} 100 100)`}
          />
        ))}
        <line
          className="clock-hand hours"
          x1="100"
          y1="112"
          x2="100"
          y2="52"
          style={{ transform: `rotate(${hours}deg)` }}
        />
        <line
          className="clock-hand minutes"
          x1="100"
          y1="116"
          x2="100"
          y2="30"
          style={{ transform: `rotate(${minutes}deg)` }}
        />
        <line
          className="clock-hand seconds"
          x1="100"
          y1="122"
          x2="100"
          y2="22"
          style={{ transform: `rotate(${seconds}deg)` }}
        />
        <circle className="clock-pin" cx="100" cy="100" r="4" />
      </svg>
      <figcaption>
        {now ? now.toLocaleDateString(undefined, { dateStyle: "full" }) : " "}
      </figcaption>
    </figure>
  );
}
