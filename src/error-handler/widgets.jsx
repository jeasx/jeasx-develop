// Demo components for the error boundaries: they wait like remote APIs and fail on purpose.

/**
 * Waits like a remote API would, but stops as soon as the signal aborts.
 *
 * @param {number} ms
 * @param {AbortSignal} [signal]
 */
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

/** @this {{ signal?: AbortSignal }} */
export async function Weather() {
  await sleep(300, this.signal);
  return (
    <Widget title="Weather" status="ok" note="Rendered on the first try." value="21 °C, sunny" />
  );
}

/**
 * @this {{ signal?: AbortSignal }}
 * @returns {Promise<JSX.Element>}
 */
export async function Stocks() {
  await sleep(200, this.signal);
  throw new Error("The stock API answered with status 503.");
}

/** @this {{ signal?: AbortSignal }} */
export async function Recommendations() {
  // Would take 5 seconds, but the boundary aborts it after 800 ms.
  await sleep(5000, this.signal);
  return <Widget title="Recommendations" status="ok" value="You'll never see this." />;
}

/**
 * Fails twice, then succeeds: the boundary retries it.
 *
 * @this {{ signal?: AbortSignal }}
 * @param {{ tries: { count: number } }} props
 */
export async function News(props) {
  const { tries } = props;
  tries.count++;
  await sleep(150, this.signal);
  if (tries.count < 3) {
    throw new Error(`Connection reset (attempt ${tries.count}).`);
  }
  return (
    <Widget
      title="News"
      status="retried"
      note={`Succeeded on attempt ${tries.count} after two failures.`}
      value="Jeasx ships another release"
    />
  );
}

/**
 * @this {{ signal?: AbortSignal }}
 * @returns {Promise<JSX.Element>}
 */
export async function Comments() {
  await sleep(100, this.signal);
  throw new Error("The comment service is down.");
}

/** @param {{ title: string, status: string, value: string, note?: string }} props */
function Widget({ title, status, value, note = "" }) {
  return (
    <article class={`eb-widget eb-${status}`}>
      <header>
        <strong>{title}</strong>
        <span class="eb-badge">{status}</span>
      </header>
      <p class="eb-value">{value}</p>
      {note && <small class="eb-muted">{note}</small>}
    </article>
  );
}

/** @param {{ title: string, reason?: string }} props */
export function Failed({ title, reason = "" }) {
  return (
    <Widget
      title={title}
      status="fallback"
      value="Unavailable right now"
      note={reason || "The error was caught and logged."}
    />
  );
}

/** @param {{ start: number }} props */
export function Elapsed({ start }) {
  return <strong>{((Date.now() - start) / 1000).toFixed(2)} s</strong>;
}
