import Layout from "../Layout";
import Parallel from "../error-handler/Parallel";
import Lazy from "./Lazy";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const noscript = request.query["noscript"] !== undefined;

  return (
    <Layout
      title="Lazy loading with Declarative Shadow DOM"
      description="A page of static text with sync and async server components that load when they scroll into view."
      css="/lazy-load/index.css"
      script="/lazy-load/index.js"
    >
      <article class="lazy-article">
        {/* With "?noscript", the widgets are rendered on the server: <Parallel> starts them all at once. */}
        <Parallel>
          <header class="lazy-hero">
            {/* Not needed once the widgets are rendered on the server. */}
            {!noscript && (
              <noscript>
                <div class="lazy-noscript" role="alert">
                  <span class="lazy-noscript-icon" aria-hidden="true">
                    ⚡
                  </span>
                  <p>
                    <strong>JavaScript is turned off</strong>
                    <span>
                      The widgets can't load lazily, but the server can render them all at once.
                    </span>
                  </p>
                  <a href="?noscript=true">Show all widgets</a>
                </div>
              </noscript>
            )}
            <ul class="lazy-chips" aria-label="Techniques">
              <li>Declarative Shadow DOM</li>
              <li>IntersectionObserver</li>
              <li>setHTMLUnsafe()</li>
              <li>Sync &amp; async JSX</li>
            </ul>
            <h1>Lazy loading with Declarative Shadow DOM</h1>
            <p class="lead">
              This page is mostly static text, which arrives in the first response. The widgets in
              between are only placeholders at first: each one is rendered on the server and fetched
              when you scroll to it.
            </p>
            <ol class="lazy-flow" aria-label="Lifecycle of a widget">
              <li>
                <span class="lazy-flow-icon" aria-hidden="true">
                  ▢
                </span>
                <strong>Placeholder</strong>
                <small>skeleton in the first response</small>
              </li>
              <li>
                <span class="lazy-flow-icon" aria-hidden="true">
                  ◎
                </span>
                <strong>In view</strong>
                <small>IntersectionObserver fetches it</small>
              </li>
              <li>
                <span class="lazy-flow-icon" aria-hidden="true">
                  ◆
                </span>
                <strong>Rendered</strong>
                <small>server JSX with its shadow root</small>
              </li>
            </ol>
            <p class="lazy-scroll-hint" aria-hidden="true">
              Scroll down and watch the panel in the corner
            </p>
          </header>

          <h2>Static content first</h2>
          <p>
            Text, headings and images are cheap to render, and visitors and search engines want them
            right away. Widgets that need slow data or a lot of work are a different story:
            rendering them all up front would delay the whole page, even though most visitors never
            scroll down to see them.
          </p>
          <p>
            So the page only contains a <code>&lt;Lazy name="clock" /&gt;</code> where a widget
            belongs. On the server, it renders a <code>&lt;lazy-load&gt;</code> element with a
            skeleton, like the one for the server time right here:
          </p>
          <Lazy name="clock" />
          <p>
            The clock is a <strong>sync</strong> component: a plain function that returns JSX right
            away. Its time is the moment the widget was requested, not when the page was loaded.
          </p>

          <h2>Slot fallback as skeleton</h2>
          <p>
            The <code>&lt;lazy-load&gt;</code> element has a declarative shadow root with a{" "}
            <code>&lt;slot&gt;</code>. The skeleton is the fallback content of that slot, so the
            browser shows it as long as the element has no children. No CSS class needs to be
            toggled when the content arrives.
          </p>
          <Lazy name="primes" />
          <p>
            Computing primes is sync too, but a slow <strong>async</strong> component doesn't hold
            up anything either. The weather below waits almost a second for its (simulated) backend:
          </p>
          <Lazy name="weather" />

          <h2>Fetching shortly before it is visible</h2>
          <p>
            A small script defines the <code>&lt;lazy-load&gt;</code> element and watches it with an{" "}
            <code>IntersectionObserver</code>. 200 pixels before the element scrolls into view, it
            fetches <code>/lazy-load/widget?name=…</code>. That route renders the widget like any
            other JSX: it awaits whatever the component returns, JSX or a promise of JSX. The badge
            on each widget shows how long that took.
          </p>
          <Lazy name="stocks" />
          <p>
            Every widget is a request of its own, so the stock ticker and the weather load in
            parallel when they are on screen together, and a slow widget never blocks a fast one.
          </p>

          <h2>Attaching the shadow root</h2>
          <p>
            The answer of the widget route contains its own{" "}
            <code>&lt;template shadowrootmode="open"&gt;</code>. Plain <code>innerHTML</code> would
            ignore it and leave an inert template behind. <code>setHTMLUnsafe()</code> parses it
            like the HTML parser does, so the widget arrives with its shadow root attached and its
            styles encapsulated.
          </p>
          <Lazy name="dice" />
          <p>
            The new content becomes a child of <code>&lt;lazy-load&gt;</code>, the slot shows it
            instead of the skeleton, and the page is done. Until the next widget, that is:
          </p>
          <Lazy name="quote" />

          <h2>Passing props</h2>
          <p>
            <code>&lt;Lazy&gt;</code> passes a <code>props</code> object on to the component. When
            the widget is loaded lazily, the props travel as JSON in the query string of the widget
            URL, so they have to be serializable: strings, numbers, booleans, arrays and objects.
          </p>
          <pre>
            <code>{`<Lazy name="clock" props={{ timeZone: "Asia/Tokyo" }} />
<Lazy name="dice" props={{ count: 5 }} />`}</code>
          </pre>
          <div class="lazy-grid">
            <Parallel>
              <Lazy name="clock" props={{ timeZone: "Asia/Tokyo" }} />
              <Lazy name="dice" props={{ count: 5 }} />
            </Parallel>
          </div>
          <p>
            Anyone can change a query string, so props from the browser are user input. Every
            component checks its own: the dice keep the count between 1 and 10, text props are
            limited in length, and an unknown time zone throws, which shows the error card from
            below. The same component works with different props, like a weather widget per city and
            a ticker with its own symbols:
          </p>
          <div class="lazy-grid">
            <Parallel>
              <Lazy name="weather" props={{ city: "Lisbon" }} />
              <Lazy name="stocks" props={{ symbols: ["JSON", "SVG", "HTTP", "WASM"] }} />
            </Parallel>
          </div>
          <Lazy name="primes" props={{ count: 30 }} />

          <h2>When a component fails</h2>
          <p>
            Backends go down. The widget below calls a service which always throws after a second.
            The widget renderer catches the error, logs it on the server and sends a red error card
            instead. Only this widget is affected: the text around it and the other widgets are
            already on the page.
          </p>
          <Lazy name="broken" />
          <p class="lazy-note">
            Reload the page and scroll down slowly to watch each widget load as it comes into view.
          </p>
        </Parallel>
      </article>

      {/* Filled and shown by the script: one dot per widget, colored by its state. */}
      <aside class="lazy-meter" aria-label="Widget loading progress" hidden>
        <strong>
          <output>0</output> / <span>0</span> widgets loaded
        </strong>
        <div class="lazy-meter-dots" aria-hidden="true"></div>
      </aside>
    </Layout>
  );
}
