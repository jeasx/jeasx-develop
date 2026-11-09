import Layout from "../Layout";

const SUFFIX = " » Jeasx - JSX with Ease";

/** The components to pick from, rendered in this order. */
const WIDGETS = {
  product: { label: "Product card", adds: "title, description and styles", Component: ProductCard },
  sale: { label: "Sale banner", adds: "title, keywords and styles", Component: SaleBanner },
  theme: { label: "Night theme", adds: "styles only", Component: NightTheme },
};

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // All components start switched off; the form adds the picked ones to the query.
  const picked = new Set([request.query["widget"] ?? []].flat().map(String));
  const active = Object.keys(WIDGETS).filter((key) => picked.has(key));

  return (
    <Layout
      title="Manage the head"
      description="Default description of the route"
      script="/head/index.js"
    >
      <h1>Manage the head</h1>
      <p>
        Like React Helmet, but built in userland: put a <code>&lt;head&gt;</code> tag into any
        component, and its title, meta tags, styles and scripts are moved into the head of the
        document. Duplicate titles, descriptions and keywords are replaced by the last one. A small
        guard takes care of this; have a look at the source to see how it works.
      </p>
      <p>
        Switch the components on and off and watch the browser tab and the resulting{" "}
        <code>&lt;head&gt;</code> change.
      </p>

      <div class="head-playground" id="playground">
        <div>
          {/* The anchor keeps the playground in view after the reload. */}
          <form
            method="get"
            action="#playground"
            class="head-picker"
            onchange="this.requestSubmit()"
          >
            {Object.entries(WIDGETS).map(([key, { label, adds }]) => (
              <label>
                <input type="checkbox" name="widget" value={key} checked={active.includes(key)} />
                <span>
                  <strong>{label}</strong>
                  <small>adds {adds}</small>
                </span>
              </label>
            ))}
            <noscript>
              <button type="submit">Apply</button>
            </noscript>
          </form>
          <div class="head-widgets">
            {active.length === 0 && (
              <p class="center">
                No component is active, so the head only has what the route passes to the layout.
              </p>
            )}
            {active.map((key) => {
              const { Component } = WIDGETS[key];
              return <Component />;
            })}
          </div>
        </div>
        <aside class="head-output">
          <h2>Resulting head</h2>
          <p>
            <small>Title, meta tags and styles of the merged head, read in your browser.</small>
          </p>
          <pre>
            <code id="head-result" class="language-markup">Loading…</code>
          </pre>
        </aside>
      </div>
      <head>
        <style>{
          /* css */ `
          .head-playground { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
          @media (max-width: 768px) { .head-playground { grid-template-columns: minmax(0, 1fr); } }
          .head-output { position: sticky; top: 5rem; }
          /* Jump to the playground after a reload instead of scrolling there. */
          html { scroll-behavior: auto; }
          #playground { scroll-margin-top: 5rem; }
          .head-output h2 { margin-top: 0; text-align: left; }
          .head-output pre { margin: 0; max-height: calc(100vh - 12rem); overflow: auto; }
          .head-picker { display: grid; gap: 0.5rem; }
          .head-picker label { box-sizing: border-box; width: 100%; display: flex; gap: 0.6rem; align-items: start; margin: 0; padding: 0.75rem 1rem;
            border: 1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius: 0.6rem; cursor: pointer; }
          .head-picker label:has(:checked) { border-color: var(--primary); }
          .head-picker input { margin: 0.2rem 0 0; }
          .head-picker small { display: block; opacity: 0.7; }
          .head-widgets { display: grid; gap: 1rem; margin-top: 1rem; }
          #head-result { white-space: pre-wrap; word-break: break-word; }`
        }</style>
      </head>
    </Layout>
  );
}

function ProductCard() {
  return (
    <section class="product-card">
      <h3>Product card</h3>
      <p>Sets the title and description of a product page.</p>
      <head>
        <title>{`Espresso machine${SUFFIX}`}</title>
        <meta name="description" content="A shiny espresso machine for your kitchen." />
        <style>{
          /* css */ `.product-card { padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--accent);
            background: color-mix(in srgb, var(--accent) 15%, transparent); text-align: center; }`
        }</style>
      </head>
    </section>
  );
}

function SaleBanner() {
  return (
    <section class="sale-banner">
      <h3>Sale banner</h3>
      <p>Comes after the product card, so its title wins.</p>
      <head>
        <title>{`🔥 50% off today${SUFFIX}`}</title>
        <meta name="keywords" content="sale, discount, espresso" />
        <style>{
          /* css */ `.sale-banner { padding: 1.25rem; border-radius: 0.75rem; text-align: center; color: #fff;
            background: linear-gradient(135deg, #f97316, #db2777); }
            .sale-banner h3 { color: inherit; }`
        }</style>
      </head>
    </section>
  );
}

function NightTheme() {
  return (
    <section class="night-theme">
      <h3>Night theme</h3>
      <p>Only adds styles, so the title stays as it is.</p>
      <head>
        <style>{
          /* css */ `.night-theme { padding: 1.25rem; border-radius: 0.75rem; text-align: center;
            background: linear-gradient(135deg, #0f172a, #312e81); color: #e0e7ff; }
            .night-theme h3 { color: inherit; }`
        }</style>
      </head>
    </section>
  );
}
