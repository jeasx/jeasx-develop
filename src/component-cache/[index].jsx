import { html } from "jsx-async-runtime";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import Layout from "../Layout";
import Cached from "./Cached";

const REGIONS = ["Europe", "Americas", "Asia"];

const SNIPPET = `<Cached cacheKey={\`report:\${region}\`}>
  <Report region={region} />
</Cached>`;

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Only known regions, so visitors can't fill the cache with arbitrary keys.
  const query = String(request.query["region"]);
  const region = REGIONS.includes(query) ? query : REGIONS[0];

  return (
    <Layout
      title="Component caching"
      description="Cache the rendered HTML of expensive components, so later requests skip the work."
      css="/component-cache/index.css"
    >
      <h1>Component caching</h1>
      <p class="lead">
        Some components are expensive: they wait for slow APIs or crunch numbers. If their output is
        the same for many visitors, render them once and keep the HTML for a while.
      </p>
      <p>
        <code>&lt;Cached&gt;</code> renders its children to a string with <code>jsxToString</code>,
        stores the markup under a key and inserts it with <code>html()</code> on later requests. The
        report below takes about a second to render. Reload the page: the first request renders it,
        the following ones get the cached copy for 30 seconds. Switch the region to start over.
      </p>

      <div class="cc-toolbar">
        {/* Plain links: each region is its own URL and cache key. */}
        <nav class="cc-segments" aria-label="Region">
          {REGIONS.map((name) => (
            <a href={`?region=${name}`} aria-current={name === region ? "page" : undefined}>
              {name}
            </a>
          ))}
        </nav>
        <a href={`?region=${region}`} class="cc-reload" title="Request this region again">
          <span class="cc-reload-icon" aria-hidden="true">
            ↻
          </span>
          Reload
        </a>
      </div>
      {/* The page streams up to here, so the skeleton shows while the report renders.
          CSS hides it as soon as the report arrives after it. */}
      <article class="cc-dashboard">
        <Skeleton />
        <Cached cacheKey={`report:${region}`} status={CacheStatus}>
          <Report region={region} />
        </Cached>
      </article>

      <h2>How it works</h2>
      <pre class="language-jsx">
        <code class="language-jsx">
          {html(Prism.highlight(SNIPPET, Prism.languages.jsx, "jsx"))}
        </code>
      </pre>
      <ul>
        <li>
          <strong>The key decides what is shared.</strong> Each region gets its own entry, because
          the report depends on it. Never cache content for one visitor (e.g. a name from the
          session) under a key that others share.
        </li>
        <li>
          <strong>Concurrent requests share one render.</strong> If ten visitors arrive while the
          report is still rendering, it is rendered once, not ten times.
        </li>
        <li>
          <strong>Failures aren't cached.</strong> If rendering throws, the entry is dropped and the
          next request tries again (see <a href="/error-handler">Error boundaries</a> for
          fallbacks).
        </li>
        <li>
          <strong>Cached parts don't stream.</strong> The children are rendered to a string first,
          so the page waits for them like for any async component.
        </li>
      </ul>
      <p>
        To cache data instead of markup (e.g. an API response used by several components), see the
        cache helper used by <a href="/repositories">GitHub repos</a>.
      </p>
    </Layout>
  );
}

/**
 * Shows how long this request waited for the report and how long the cached copy lives on.
 *
 * @param {import("./Cached").CacheInfo} info
 */
function CacheStatus({ hit, ms, expiresIn, ttl }) {
  return (
    <header class={`cc-status ${hit ? "cc-hit" : "cc-miss"}`}>
      <div class="cc-meter">
        <span class="cc-label">Render time</span>
        <span class="cc-ms">
          {ms.toLocaleString("en-US")}
          <small> ms</small>
        </span>
        <span class="cc-verdict">{hit ? "⚡ Served from cache" : "🐢 Freshly rendered"}</span>
      </div>
      <div class="cc-expiry">
        <span class="cc-label">Cached copy expires in {expiresIn} s</span>
        {/* Counts down with CSS alone: it starts at the remaining share and runs out in time. */}
        <div
          class="cc-ttl"
          style={`--start: ${(expiresIn / ttl).toFixed(3)}; --remaining: ${expiresIn}s`}
        >
          <span></span>
        </div>
      </div>
    </header>
  );
}

/**
 * Placeholder in the shape of the dashboard, shown while the next report is rendered.
 */
function Skeleton() {
  return (
    <div class="cc-skeleton" aria-hidden="true">
      <div class="cc-sk cc-sk-meter"></div>
      <div class="cc-sk cc-sk-title"></div>
      <div class="cc-sk-kpis">
        <div class="cc-sk"></div>
        <div class="cc-sk"></div>
        <div class="cc-sk"></div>
      </div>
      <div class="cc-sk cc-sk-chart"></div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * An expensive component: it waits for a slow "API" and crunches the numbers.
 * The figures are random, so you can tell a cached copy by its unchanged numbers.
 *
 * @param {{ region: string }} props
 */
async function Report({ region }) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const sales = MONTHS.map((_, index) => Math.round(400 + index * 40 + Math.random() * 600));
  const total = sales.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...sales);
  const growth = ((sales[11] - sales[0]) / sales[0]) * 100;

  return (
    <div class="cc-report">
      <h3>Sales {region} · 2026</h3>
      <dl class="cc-kpis">
        <div>
          <dt>Units sold</dt>
          <dd>{total.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Best month</dt>
          <dd>{MONTHS[sales.indexOf(max)]}</dd>
        </div>
        <div>
          <dt>Growth</dt>
          <dd class={growth >= 0 ? "cc-up" : "cc-down"}>
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(0)} %
          </dd>
        </div>
      </dl>
      <ol class="cc-chart" aria-label="Units sold per month">
        {sales.map((value, index) => (
          <li style={`--h: ${((value / max) * 100).toFixed(1)}%`} title={`${value} units`}>
            <span class="cc-bar"></span>
            <span class="cc-month">{MONTHS[index]}</span>
          </li>
        ))}
      </ol>
      <p class="cc-muted">Rendered at {new Date().toISOString().slice(11, 19)} UTC</p>
    </div>
  );
}
