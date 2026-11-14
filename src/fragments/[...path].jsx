import Layout from "../Layout";
import { Product } from "./Product";

// Answer "/fragments" and its fragments "/fragments/~product" and "/fragments/~time" only.
const FRAGMENT_PATTERN = new URLPattern({
  pathname: "/fragments{/~:fragment(product|time)}?{/}?",
});

/**
 * @this {import("../types").ThisContext & { fragment?: string }}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const match = FRAGMENT_PATTERN.exec({ pathname: request.path });
  if (!match) {
    return;
  }
  // Name of the requested fragment; undefined renders the whole page.
  this.fragment = match.pathname.groups.fragment;

  // Keep the product id between 1 and 10, even for tampered query parameters.
  const id = Math.min(Math.max(Math.trunc(Number(request.query["id"])) || 1, 1), 10);

  return (
    <Fragments
      container={({ children }) => (
        <Layout
          title="Template fragments"
          description="Render only a part of a page template as a fragment for HTMX, without a route for each part."
          css="/fragments/index.css"
          script="/fragments/index.js"
        >
          {children}
        </Layout>
      )}
    >
      <Fragment>
        <h1>Template fragments</h1>
        <p>
          Creating routes that emit HTML fragments is straightforward in Jeasx, which makes it a
          perfect match for <a href="https://four.htmx.org">HTMX</a>. Sometimes, however, creating
          many routes by hand can be tedious.
        </p>
        <p>
          <a href="https://htmx.org/essays/template-fragments">Template fragments</a> allow you to
          render a fragment or partial bit of the content within a template, rather than the entire
          template. In Jeasx you can implement this feature in userland with just a few lines of
          code bundled in two simple components. Both cards below come from this very route: the
          pager asks for <code>~product</code>, the clock for <code>~time</code>. Watch the log to
          see how small the answers are.
        </p>
      </Fragment>
      <Wrapper class="tf-layout">
        <Fragment name="product">
          <form
            hx-get="./~product"
            hx-swap="outerHTML"
            hx-target="closest form"
            class="tf-card tf-products"
          >
            <header class="tf-bar">
              <h2>Product browser</h2>
              <a class="tf-raw" href={`./~product?id=${id}`} target="_blank">
                raw fragment ↗
              </a>
            </header>
            <div class="tf-stage">
              <Product id={id} />
              <span class="tf-spinner" aria-hidden="true"></span>
            </div>
            <nav class="tf-pager" aria-label="Products">
              <button
                name="id"
                type="submit"
                value={id - 1}
                disabled={id === 1}
                aria-label="Previous"
              >
                ‹
              </button>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((page) => (
                <button
                  name="id"
                  type="submit"
                  value={page}
                  class={page === id ? "current" : undefined}
                  aria-current={page === id ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
              <button name="id" type="submit" value={id + 1} disabled={id === 10} aria-label="Next">
                ›
              </button>
            </nav>
          </form>
        </Fragment>
        <Wrapper class="tf-side">
          <Fragment name="time">
            <div hx-get="./~time" hx-trigger="every 1s" hx-swap="outerHTML" class="tf-card tf-time">
              <header class="tf-bar">
                <h2>Server time</h2>
                <a class="tf-raw" href="./~time" target="_blank">
                  raw fragment ↗
                </a>
              </header>
              <output>
                {new Date()
                  .toLocaleTimeString("en-GB")
                  .split("")
                  .map((char) => (char === ":" ? <i>:</i> : <b>{char}</b>))}
              </output>
              <small>refreshed every second</small>
            </div>
          </Fragment>
          <Fragment>
            <section class="tf-card tf-log">
              <header class="tf-bar">
                <h2>Fragment log</h2>
                <span class="tf-pulse" aria-hidden="true"></span>
              </header>
              <ol id="tf-log" aria-live="off">
                <li class="tf-log-empty">Waiting for the first request…</li>
              </ol>
            </section>
          </Fragment>
        </Wrapper>
      </Wrapper>
    </Fragments>
  );
}

/**
 * @this {import("../types").ThisContext & { fragment?: string }}
 */
function Fragments({ container, children }) {
  if (this.fragment) {
    return <>{children}</>;
  } else {
    const Container = container;
    return <Container>{children}</Container>;
  }
}

/**
 * @this {import("../types").ThisContext & { fragment?: string }}
 */
function Fragment({ name = undefined, children }) {
  if (!this.fragment || name === this.fragment) {
    return <>{children}</>;
  }
}

/**
 * A layout wrapper which only exists on the full page, so fragments come without it.
 * @this {import("../types").ThisContext & { fragment?: string }}
 */
function Wrapper({ children, ...props }) {
  return this.fragment ? <>{children}</> : <div {...props}>{children}</div>;
}
