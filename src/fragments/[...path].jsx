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
  const id = Math.min(
    Math.max(Math.trunc(Number(request.query["id"])) || 1, 1),
    10,
  );

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
        <h1 class="tf-title">Template fragments</h1>
        <p>
          Creating routes that emit HTML fragments is straightforward in Jeasx,
          which makes it a perfect match for{" "}
          <a href="https://four.htmx.org">HTMX</a>. Sometimes, however, creating
          many routes by hand can be tedious.
        </p>
        <p>
          <a href="https://htmx.org/essays/template-fragments">
            Template fragments
          </a>{" "}
          allow you to render a fragment or partial bit of the content within a
          template, rather than the entire template. In Jeasx you can implement
          this feature in userland with just a few lines of code bundled in two
          simple components. Each part below is requested from this very route:
          the buttons ask for <code>~product</code>, the clock for{" "}
          <code>~time</code>.
        </p>
      </Fragment>
      <Fragment name="product">
        <form
          hx-get="./~product"
          hx-swap="outerHTML"
          hx-target="closest form"
          class="tf-card"
        >
          <header class="tf-bar">
            <h2>Product browser</h2>
            <nav>
              <button
                name="id"
                type="submit"
                value={id - 1}
                disabled={id === 1}
                aria-label="Previous"
              >
                &laquo;
              </button>
              <output>{id} / 10</output>
              <button
                name="id"
                type="submit"
                value={id + 1}
                disabled={id === 10}
                aria-label="Next"
              >
                &raquo;
              </button>
            </nav>
          </header>
          <Product id={id} />
        </form>
      </Fragment>
      <Fragment name="time">
        <p
          hx-get="./~time"
          hx-trigger="every 1s"
          hx-swap="outerHTML"
          class="tf-time"
        >
          Current server time
          <output>{new Date().toLocaleTimeString("en-GB")}</output>
        </p>
      </Fragment>
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
