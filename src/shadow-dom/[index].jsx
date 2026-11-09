import Layout from "../Layout";
import ShadowRoot from "./ShadowRoot";

const PLANETS = [
  { name: "Mercury", moons: 0, color: "#a8a29e" },
  { name: "Earth", moons: 1, color: "#3b82f6" },
  { name: "Jupiter", moons: 95, color: "#f59e0b" },
];

export default function () {
  return (
    <Layout
      title="Declarative Shadow DOM"
      description="Render encapsulated web components on the server with <template shadowrootmode>, no JavaScript needed."
      css="/shadow-dom/index.css"
      script="/shadow-dom/index.js"
    >
      <h1>Declarative Shadow DOM</h1>
      <p>
        A <code>&lt;template shadowrootmode="open"&gt;</code> tells the HTML parser to attach a
        shadow root to its parent element. With JSX on the server, you get web components with
        encapsulated styles and slots in the very first response: no framework, no hydration, and it
        works with JavaScript turned off.
      </p>

      <h2>Style isolation</h2>
      <p>
        This page sets <code>h3</code> to a dashed, crossed-out style. The headings inside the cards
        are in a shadow root, so they keep their own styles, and the card styles don't leak out.
      </p>
      <h3 class="center">An h3 in the light DOM</h3>
      <div class="planet-grid">
        {PLANETS.map((planet) => (
          <PlanetCard {...planet}>
            <span slot="fact">
              {planet.moons === 0
                ? "No moons at all."
                : `${planet.moons} ${planet.moons === 1 ? "moon" : "moons"}.`}
            </span>
          </PlanetCard>
        ))}
      </div>

      <h2>Slots</h2>
      <p>
        The text below the planet name comes from the light DOM through a named{" "}
        <code>&lt;slot&gt;</code>. Content without a slot name goes into the default slot, as in
        this callout:
      </p>
      <InfoCallout>
        <span slot="title">Good to know</span>
        Light DOM content stays in the document, so search engines and the browser's find in page
        still see it.
      </InfoCallout>

      <h2>Progressive enhancement</h2>
      <p>
        A small script defines <code>&lt;planet-card&gt;</code>. Its constructor finds the shadow
        root the parser already attached (<code>this.shadowRoot</code>) and only adds behaviour: a
        click on a card counts visits. Nothing is rendered twice. Turn off JavaScript and the cards
        still look the same.
      </p>
    </Layout>
  );
}

/**
 * @param {{ name: string, color: string, children?: any }} props
 */
function PlanetCard({ name, color, children }) {
  return (
    <planet-card style={`--planet: ${color}`}>
      <ShadowRoot styles={CARD_STYLES}>
        <button type="button" class="card">
          <span class="dot" aria-hidden="true"></span>
          <h3>{name}</h3>
          <slot name="fact"></slot>
          <small part="visits" hidden>
            Visits: <output>0</output>
          </small>
        </button>
      </ShadowRoot>
      {children}
    </planet-card>
  );
}

/**
 * @param {{ children?: any }} props
 */
function InfoCallout({ children }) {
  return (
    <info-callout>
      <ShadowRoot styles={CALLOUT_STYLES}>
        <div class="callout">
          <strong>
            <slot name="title">Note</slot>
          </strong>
          <slot></slot>
        </div>
      </ShadowRoot>
      {children}
    </info-callout>
  );
}

// Plain strings: the styles live inside the shadow root and apply only there.
const CARD_STYLES = /* css */ `
  :host { display: block; }
  .card { all: unset; box-sizing: border-box; display: grid; justify-items: center; gap: 0.4rem;
    width: 100%; padding: 1.25rem; border-radius: 0.75rem; cursor: pointer; font: inherit;
    border: 1px solid color-mix(in srgb, var(--planet) 60%, transparent);
    background: color-mix(in srgb, var(--planet) 12%, transparent); }
  .card:focus-visible { outline: 2px solid var(--planet); outline-offset: 2px; }
  .dot { width: 3rem; height: 3rem; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #fff8, var(--planet)); }
  h3 { margin: 0; font-size: 1.25rem; color: var(--planet); }
  small { opacity: 0.7; }
`;

const CALLOUT_STYLES = /* css */ `
  :host { display: block; margin: 1rem 0; }
  .callout { display: grid; gap: 0.25rem; padding: 1rem 1.25rem; border-radius: 0.5rem;
    border-left: 4px solid #8b5cf6; background: color-mix(in srgb, #8b5cf6 12%, transparent); }
`;
