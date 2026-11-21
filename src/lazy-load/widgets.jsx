import ShadowRoot from "../shadow-dom/ShadowRoot";

/**
 * The widgets which can be loaded lazily, by name. Some are plain functions that render
 * right away, others are async functions that wait for slow data first. The fragment route
 * renders both the same way: jsx-async-runtime awaits whatever a component returns.
 *
 * @type {Record<string, { title: string, icon: string, kind: "sync" | "async", Component: (props: any) => any }>}
 */
export const WIDGETS = {
  clock: { title: "Server time", icon: "🕒", kind: "sync", Component: Clock },
  primes: { title: "Prime numbers", icon: "🔢", kind: "sync", Component: Primes },
  dice: { title: "Dice roll", icon: "🎲", kind: "sync", Component: Dice },
  weather: { title: "Weather", icon: "🌤️", kind: "async", Component: Weather },
  stocks: { title: "Stock ticker", icon: "📈", kind: "async", Component: Stocks },
  quote: { title: "Quote of the moment", icon: "💬", kind: "async", Component: Quote },
  broken: { title: "Flaky service", icon: "🔌", kind: "async", Component: Broken },
};

/** Render time in ms which fills the timing bar of a widget completely. */
const TIMING_SCALE = 2000;

/**
 * Wraps a widget in a card with its own shadow root, so the card styles stay inside.
 *
 * @param {{ name: string, ms?: number, failed?: boolean, children?: any }} props
 */
export function Widget({ name, ms, failed = false, children }) {
  const { title, icon, kind } = WIDGETS[name];
  const timing = Math.min(ms / TIMING_SCALE, 1).toFixed(3);
  return (
    // data-failed lets the page script count failed widgets without looking into the shadow root.
    <widget-card data-failed={failed || undefined}>
      <ShadowRoot styles={CARD_STYLES}>
        <article class={failed ? "failed" : kind}>
          <header>
            <span class="icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <span class="badge">{failed ? "failed" : kind}</span>
          </header>
          <div class="body">
            <slot></slot>
          </div>
          <footer>
            <span class="timing" style={`--timing: ${timing}`}></span>
            <small>rendered in {ms} ms</small>
          </footer>
        </article>
      </ShadowRoot>
      {children}
    </widget-card>
  );
}

/**
 * Renders a widget and measures how long its component took. A sync component returns JSX,
 * an async one a promise of JSX: awaiting works for both.
 *
 * A component that throws (or rejects) becomes an error card instead, so one broken widget
 * doesn't break the page, neither when loaded lazily nor when rendered inline with "?noscript".
 *
 * @param {{ name: string, props?: Record<string, unknown> }} props
 */
export async function LoadedWidget({ name, props = {} }) {
  const { Component } = WIDGETS[name];
  const start = performance.now();
  try {
    const content = await Component(props);
    return (
      <Widget name={name} ms={elapsed(start)}>
        {content}
      </Widget>
    );
  } catch (error) {
    console.error(`Widget "${name}" failed:`, error);
    return (
      <Widget name={name} ms={elapsed(start)} failed>
        <p role="alert">This widget couldn't be loaded. The rest of the page is fine.</p>
      </Widget>
    );
  }
}

/** @param {number} start */
const elapsed = (start) => Math.round(performance.now() - start);

/**
 * Props from the query string can be anything, so numbers are checked and kept in range.
 *
 * @param {unknown} value
 * @param {{ min: number, max: number, fallback: number }} range
 */
const toInt = (value, { min, max, fallback }) =>
  Number.isInteger(value) ? Math.min(Math.max(/** @type {number} */ (value), min), max) : fallback;

/**
 * Accepts only short strings, everything else becomes the fallback.
 *
 * @param {unknown} value
 * @param {string} fallback
 */
const toText = (value, fallback) =>
  typeof value === "string" && value.trim() && value.length <= 40 ? value.trim() : fallback;

// Sync components: they return JSX right away.

/** @param {{ timeZone?: unknown }} props */
function Clock({ timeZone }) {
  const zone = toText(timeZone, "UTC");
  // An unknown time zone throws a RangeError, which turns into an error card.
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: zone });
  return (
    <p class="big">
      {time} <small>{zone}</small>
    </p>
  );
}

/** @param {{ count?: unknown }} props */
function Primes({ count }) {
  const total = toInt(count, { min: 1, max: 100, fallback: 15 });
  const primes = [];
  for (let n = 2; primes.length < total; n++) {
    if (primes.every((p) => n % p !== 0)) primes.push(n);
  }
  return <p>{primes.join(", ")}, …</p>;
}

/** @param {{ count?: unknown }} props */
function Dice({ count }) {
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const rolls = Array.from({ length: toInt(count, { min: 1, max: 10, fallback: 2 }) }, () =>
    Math.floor(Math.random() * faces.length),
  );
  return (
    <p class="big" aria-label={`Rolled ${rolls.map((r) => r + 1).join(", ")}`}>
      {rolls.map((r) => faces[r]).join(" ")}
    </p>
  );
}

// Async components: they wait for a (simulated) slow backend, then return JSX.

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {{ city?: unknown }} props */
async function Weather({ city }) {
  await sleep(800);
  const temperature = Math.round(5 + Math.random() * 20);
  return (
    <p class="big">
      {toText(city, "Berlin")}: {temperature} °C,{" "}
      {["sunny", "cloudy", "rainy", "windy"][temperature % 4]}
    </p>
  );
}

/** @param {{ symbols?: unknown }} props */
async function Stocks({ symbols }) {
  await sleep(1400);
  const list = Array.isArray(symbols)
    ? symbols.slice(0, 6).map((symbol) => toText(symbol, "?"))
    : ["JSX", "HTML", "CSS"];
  return (
    <ul class="ticker">
      {list.map((symbol) => {
        const change = (Math.random() * 6 - 3).toFixed(2);
        const down = change.startsWith("-");
        return (
          <li>
            <span>{symbol}</span>
            <span class={down ? "down" : "up"}>
              {down ? "▼" : "▲"} {change.replace("-", "")} %
            </span>
          </li>
        );
      })}
    </ul>
  );
}

async function Quote() {
  await sleep(2000);
  const quotes = [
    "Simplicity is prerequisite for reliability. (Edsger W. Dijkstra)",
    "The best code is no code at all. (Jeff Atwood)",
    "Make it work, make it right, make it fast. (Kent Beck)",
  ];
  return <blockquote>{quotes[Math.floor(Math.random() * quotes.length)]}</blockquote>;
}

// An async component which always fails, like a backend that is down.
async function Broken() {
  await sleep(1000);
  throw new Error("Service unavailable");
}

// A plain string: the styles live inside the shadow root and apply only there.
const CARD_STYLES = /* css */ `
  :host { display: block; height: 100%; }
  article { --accent: #22c55e; position: relative; display: flex; flex-direction: column;
    gap: 0.75rem; height: 100%; box-sizing: border-box; padding: 1.1rem 1.25rem 1rem;
    border-radius: 1rem; overflow: hidden; color: #d4d9e2;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background:
      radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%),
      #181d27;
    box-shadow: 0 0.75rem 2rem -1rem color-mix(in srgb, var(--accent) 60%, transparent);
    animation: arrive 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  article.async { --accent: #8b5cf6; }
  article.failed { --accent: #ef4444; }
  @keyframes arrive { from { opacity: 0; transform: translateY(0.75rem) scale(0.98); } }
  @media (prefers-reduced-motion: reduce) { article { animation: none; } }
  header { display: flex; align-items: center; gap: 0.6rem; }
  .icon { display: grid; place-items: center; width: 2.1rem; height: 2.1rem; border-radius: 0.6rem;
    font-size: 1.15rem; background: color-mix(in srgb, var(--accent) 22%, transparent); }
  h3 { flex: 1; margin: 0; font-size: 1rem; font-weight: 600; color: #f0f1f3; }
  .badge { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.15rem 0.55rem; border-radius: 1rem; color: color-mix(in srgb, var(--accent) 70%, white);
    background: color-mix(in srgb, var(--accent) 22%, transparent); }
  .body { flex: 1; }
  ::slotted(*) { margin: 0; }
  ::slotted(.big) { font-size: 1.6rem; font-weight: 600; color: #f0f1f3;
    font-variant-numeric: tabular-nums; }
  footer { display: grid; gap: 0.35rem; }
  footer small { font-size: 0.75rem; color: #7b8495; }
  .timing { display: block; height: 0.25rem; border-radius: 1rem; background: #fff1; overflow: hidden; }
  .timing::after { content: ""; display: block; height: 100%; width: calc(var(--timing) * 100%);
    min-width: 0.25rem; border-radius: inherit; background: var(--accent);
    animation: fill 0.8s ease-out both; }
  @keyframes fill { from { width: 0; } }
  @media (prefers-reduced-motion: reduce) { .timing::after { animation: none; } }
`;
