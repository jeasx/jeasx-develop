import Layout from "../Layout";

/** Time budgets the visitor can choose from, in ms. */
const BUDGETS = [250, 1000, 5000];

/**
 * Public APIs without keys. Each service knows how to fetch and summarize its data.
 * They all receive an AbortSignal, so a slow service is cancelled when the budget is spent.
 */
const SERVICES = [
  {
    id: "weather",
    icon: "🌤️",
    name: "Weather in Berlin",
    source: "open-meteo.com",
    async load(signal) {
      const { current } = await getJson(
        "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m",
        signal,
      );
      return (
        <>
          <Figure value={Math.round(current.temperature_2m)} unit="°C" />
          <Details
            rows={[
              ["Feels like", `${Math.round(current.apparent_temperature)} °C`],
              ["Humidity", `${current.relative_humidity_2m} %`],
              ["Wind", `${current.wind_speed_10m} km/h`],
            ]}
          />
        </>
      );
    },
  },
  {
    id: "rates",
    icon: "💶",
    name: "Exchange rates",
    source: "frankfurter.app",
    async load(signal) {
      const data = await getJson(
        "https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,CHF",
        signal,
      );
      return (
        <>
          <Figure value="1" unit="EUR =" />
          <Details
            rows={Object.entries(data.rates).map(([currency, rate]) => [
              currency,
              rate.toLocaleString("en", { maximumFractionDigits: 4 }),
            ])}
          />
        </>
      );
    },
  },
  {
    id: "news",
    icon: "📰",
    name: "Hacker News",
    source: "hacker-news.firebaseio.com",
    async load(signal) {
      const [id] = await getJson("https://hacker-news.firebaseio.com/v0/topstories.json", signal);
      // A second, dependent request: it still runs in parallel to the other services.
      const story = await getJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, signal);
      return (
        <>
          <p class="ag-headline">
            <a href={story.url ?? `https://news.ycombinator.com/item?id=${id}`}>{story.title}</a>
          </p>
          <Details
            rows={[
              ["Points", story.score],
              ["Comments", story.descendants ?? 0],
              ["By", story.by],
            ]}
          />
        </>
      );
    },
  },
  {
    id: "npm",
    icon: "📦",
    name: "Downloads of jeasx",
    source: "api.npmjs.org",
    async load(signal) {
      const data = await getJson("https://api.npmjs.org/downloads/point/last-week/jeasx", signal);
      return (
        <>
          <Figure value={data.downloads.toLocaleString("en")} unit="last week" />
          <Details
            rows={[
              ["From", data.start],
              ["To", data.end],
              ["Per day", Math.round(data.downloads / 7).toLocaleString("en")],
            ]}
          />
        </>
      );
    },
  },
  {
    id: "github",
    icon: "⭐",
    name: "jeasx on GitHub",
    source: "api.github.com",
    async load(signal) {
      const data = await getJson("https://api.github.com/repos/jeasx/jeasx", signal);
      return (
        <>
          <Figure value={data.stargazers_count.toLocaleString("en")} unit="stars" />
          <Details
            rows={[
              ["Forks", data.forks_count],
              ["Open issues", data.open_issues_count],
              ["Last push", new Date(data.pushed_at).toLocaleDateString("en-CA")],
            ]}
          />
        </>
      );
    },
  },
  {
    id: "flaky",
    icon: "🧨",
    name: "Flaky legacy service",
    source: "simulated",
    async load(signal) {
      // Takes up to 1.5 s and fails every second time, to show isolated failures and timeouts.
      const delay = 200 + Math.random() * 1300;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, delay);
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(signal.reason);
        });
      });
      if (Math.random() < 0.5) {
        throw new Error("503 Service Unavailable");
      }
      return (
        <>
          <Figure value="OK" unit="operational" />
          <Details
            rows={[
              ["Failure rate", "50 %"],
              ["Simulated delay", `${Math.round(delay)} ms`],
            ]}
          />
        </>
      );
    },
  },
];

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const budget = BUDGETS.includes(Number(request.query["budget"]))
    ? Number(request.query["budget"])
    : 1000;
  const start = Date.now();

  // One signal for all requests: it fires when the budget is spent or the client disconnects.
  const signal = AbortSignal.any([AbortSignal.timeout(budget), abortOnClose(request)]);

  // Start every request right away. Each promise always resolves (never rejects),
  // so a failing service becomes a result of its own, like Promise.allSettled.
  const arrivals = { count: 0 };
  const results = SERVICES.map((service) => settle(service, signal, start, arrivals));

  return (
    <Layout
      title="Parallel API aggregator"
      description="A backend-for-frontend page that queries six public APIs in parallel, with a time budget and isolated failures."
      css="/aggregator/index.css"
    >
      <div class="sx">
        <h1>Parallel API aggregator</h1>
        <p>
          This page acts as a <em>backend for frontend</em>: it queries six public APIs on the
          server and merges their answers into one page. All requests start at once, and each card
          is an async component that only awaits its own promise. The page streams card by card and
          the whole page takes about as long as the slowest service, not the sum of all of them.
        </p>
        <p>
          A shared <code>AbortSignal</code> gives every request a time budget and also cancels
          everything when the browser goes away. Errors and timeouts stay inside their card, so one
          broken service never takes the page down.
        </p>
        <nav class="sx-toggle" aria-label="Time budget">
          {BUDGETS.map((value) => (
            <a href={`?budget=${value}`} aria-current={value === budget ? "page" : undefined}>
              {value < 1000 ? `${value} ms` : `${value / 1000} s`}
            </a>
          ))}
        </nav>
        <div class="ag-grid">
          {SERVICES.map((service, index) => (
            <Card service={service} result={results[index]} budget={budget} />
          ))}
        </div>
        <Summary results={results} start={start} />
      </div>
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

/** The headline number of a card. */
function Figure({ value, unit = "" }) {
  return (
    <p class="ag-figure">
      <strong>{value}</strong> {unit && <span>{unit}</span>}
    </p>
  );
}

/** Label/value pairs below the headline. */
function Details({ rows }) {
  return (
    <dl class="ag-details">
      {rows.map(([label, value]) => (
        <div>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Rendered after all cards, so it can report on the whole run. */
async function Summary({ results, start }) {
  const settled = await Promise.all(results);
  const count = (status) => settled.filter((result) => result.status === status).length;
  const sum = settled.reduce((total, result) => total + result.time, 0);
  const total = Date.now() - start;
  return (
    <section class="ag-summary" aria-label="Summary">
      <div class="ag-stat ag-hero">
        <strong>{total} ms</strong>
        <small>total render time</small>
      </div>
      <div class="ag-stat">
        <strong>{(sum / Math.max(total, 1)).toFixed(1)}×</strong>
        <small>faster than {sum} ms sequential</small>
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
  try {
    const value = await service.load(signal);
    return { status: "ok", value, time: Date.now() - start, rank: ++arrivals.count };
  } catch (error) {
    const timeout = signal.aborted;
    return {
      status: timeout ? "timeout" : "error",
      value: timeout ? "Cancelled: time budget exceeded." : `Failed: ${error.message}`,
      time: Date.now() - start,
      rank: ++arrivals.count,
    };
  }
}

async function getJson(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { accept: "application/json", "user-agent": "jeasx-expo" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

/** Returns a signal that aborts when the client closes the connection. */
function abortOnClose(request) {
  const controller = new AbortController();
  request.raw.once("close", () => controller.abort(new Error("Client disconnected")));
  return controller.signal;
}
