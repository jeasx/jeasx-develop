import Layout from "../Layout";
import { Product } from "./Product";

/**
 * @this {import("../types").ThisContext & { fragment?: string }}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Answer "/fragments" and its fragments "/fragments/~product" and "/fragments/~time" only.
  const match = /^\/fragments(?:\/~(product|time))?\/?$/.exec(request.path);
  if (!match) {
    return;
  }
  // Name of the requested fragment; undefined renders the whole page.
  this.fragment = match[1];

  // Keep the product id between 1 and 10, even for tampered query parameters.
  const id = Math.min(Math.max(Math.trunc(Number(request.query["id"])) || 1, 1), 10);

  return (
    <Fragments
      container={({ children }) => (
        <Layout
          title="Template fragments with HTMX and Jeasx"
          description="Template fragments allow you to render a fragment or partial bit of the content within a template, rather than the entire template."
          script="./index.js"
        >
          {children}
        </Layout>
      )}
    >
      <Fragment>
        <h1>Template Fragments</h1>
        <p>
          Creating routes that emit HTML fragments is straightforward in Jeasx which makes it a
          perfect match for <a href="https://htmx.org">HTMX</a>. Sometimes, however, creating many
          routes by hand can be tedious.
        </p>
        <p>
          <a href="https://htmx.org/essays/template-fragments">Template fragments</a> allow you to
          render a fragment or partial bit of the content within a template, rather than the entire
          template. In Jeasx you can implement this feature in userland with just a few lines of
          code bundled in two simple components.
        </p>
      </Fragment>
      <Fragment name="product">
        <form hx-get="./~product" hx-swap="outerHTML" hx-target="closest form">
          <h2>Product-Browser</h2>
          <fieldset role="group">
            <button
              class="btn btn-primary"
              name="id"
              type="submit"
              value={id - 1}
              disabled={id === 1}
            >
              &laquo;
            </button>
            <button
              class="btn btn-primary"
              name="id"
              type="submit"
              value={id + 1}
              disabled={id === 10}
            >
              &raquo;
            </button>
          </fieldset>
          <Product id={id} />
        </form>
      </Fragment>
      <Fragment name="time">
        <p hx-get="./~time" hx-trigger="every 1s" hx-swap="outerHTML" class="center">
          <b>Server time:</b>
          <br />
          {new Date().toTimeString()}
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
