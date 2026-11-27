/**
 * Public APIs without keys. Each service knows how to fetch and summarize its data.
 * They all receive an AbortSignal, so a slow service is cancelled when the budget is spent.
 */
export const SERVICES = [
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

/** The headline number of a card. */
export function Figure({ value, unit = "" }) {
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
