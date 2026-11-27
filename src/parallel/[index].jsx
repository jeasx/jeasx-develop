import Layout from "../Layout";
import { Figure, SERVICES } from "./services";

/** Time budgets the visitor can choose from, in ms. */
const BUDGETS = [25, 250, 1000];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const budget = BUDGETS.includes(Number(request.query["budget"]))
    ? Number(request.query["budget"])
    : 1000;
  const start = Date.now();

  // One signal for all requests: it fires when the budget is spent or the client disconnects.
  const signal = AbortSignal.any([AbortSignal.timeout(budget), abortOnClose(request)]);

  // Start every request right away, before any card is rendered. Each promise always resolves
  // (never rejects), so a failing service becomes a result of its own, like Promise.allSettled.
  const arrivals = { count: 0 };
  const results = SERVICES.map((service) => settle(service, signal, start, arrivals));

  return (
    <Layout
      title="Load data in parallel with async components"
      description="Query six public APIs at once, with a time budget and isolated failures."
      css="/parallel/index.css"
    >
      <h1>Load data in parallel with async components</h1>
      <p class="lead">
        This page queries six public APIs at once and merges their answers into one page. It takes
        about as long as the slowest service, not the sum of all of them.
      </p>
      <p>
        Async components are rendered one after another, so if each card fetched its own data, the
        requests would run in sequence. Instead, all requests are started up front and each card
        only awaits its own promise: the cards stream in as their data arrives, in the order of the
        markup.
      </p>
      <p>
        A shared <code>AbortSignal</code> gives all requests one time budget and cancels them when
        the browser goes away. Errors and timeouts stay inside their card, so one broken service
        never takes the page down. Pick a shorter budget to see services time out.
      </p>
      <nav class="sx-toggle" aria-label="Time budget">
        {BUDGETS.map((value) => (
          <a href={`?budget=${value}`} aria-current={value === budget ? "page" : undefined}>
            {value < 1000 ? `${value} ms` : `${value / 1000} s`} budget
          </a>
        ))}
      </nav>
      <div class="ag-grid">
        {SERVICES.map((service, index) => (
          <Card service={service} result={results[index]} budget={budget} />
        ))}
      </div>
      <Summary results={results} start={start} />
    </Layout>
  );
}

/** Renders one service as soon as its result is available. */
async function Card({ service, result, budget }) {
  const { status, value, time, rank } = await result;
  const label = { ok: "live", error: "failed", timeout: "timeout" }[status];
  return (
    <article class="ag-card" data-status={status}>
      <header>
        <span class="ag-icon" aria-hidden="true">
          {service.icon}
        </span>
        <div>
          <h2>{service.name}</h2>
          <small>{service.source}</small>
        </div>
        <span class="ag-pill">{label}</span>
      </header>
      <div class="ag-body">
        {status === "ok" ? (
          value
        ) : (
          <>
            <Figure value={status === "timeout" ? "⏱" : "✕"} />
            <p class="ag-message">{value}</p>
          </>
        )}
      </div>
      <footer>
        <span class="ag-rank" title="Order of arrival">
          #{rank}
        </span>
        <div class="ag-meter" style={`--to: ${Math.min(time / budget, 1).toFixed(3)}`}></div>
        <span class="ag-time">{status === "timeout" ? `> ${budget} ms` : `${time} ms`}</span>
      </footer>
    </article>
  );
}

/** Rendered after all cards, so it can report on the whole run. */
async function Summary({ results, start }) {
  const settled = await Promise.all(results);
  const count = (status) => settled.filter((result) => result.status === status).length;
  const sum = settled.reduce((total, result) => total + result.duration, 0);
  const total = Date.now() - start;
  return (
    <section class="ag-summary" aria-label="Summary">
      <div class="ag-stat ag-hero">
        <strong>{total} ms</strong>
        <small>total render time</small>
      </div>
      <div class="ag-stat">
        <strong>{(sum / Math.max(total, 1)).toFixed(1)}×</strong>
        <small>speed-up vs. {sum} ms one after another</small>
      </div>
      <div class="ag-stat" data-status="ok">
        <strong>{count("ok")}</strong>
        <small>ok</small>
      </div>
      <div class="ag-stat" data-status="error">
        <strong>{count("error")}</strong>
        <small>failed</small>
      </div>
      <div class="ag-stat" data-status="timeout">
        <strong>{count("timeout")}</strong>
        <small>timed out</small>
      </div>
    </section>
  );
}

/** Runs a service and turns any outcome into a plain result object. */
async function settle(service, signal, start, arrivals) {
  const begin = Date.now();
  try {
    const value = await service.load(signal);
    return result("ok", value);
  } catch (error) {
    const timeout = signal.aborted;
    return result(
      timeout ? "timeout" : "error",
      timeout ? "Cancelled: time budget exceeded." : `Failed: ${error.message}`,
    );
  }

  function result(status, value) {
    const now = Date.now();
    return { status, value, time: now - start, duration: now - begin, rank: ++arrivals.count };
  }
}

/** Returns a signal that aborts when the client closes the connection. */
function abortOnClose(request) {
  const controller = new AbortController();
  request.raw.once("close", () => controller.abort(new Error("Client disconnected")));
  return controller.signal;
}
