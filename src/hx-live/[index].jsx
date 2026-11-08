import Layout from "../Layout";

// Presets set several pieces of state at once; the sliders follow via hx-live:value.
const PRESETS = [
  { name: "Sunset", from: 20, to: 330, angle: 135, radius: 24, glow: 40 },
  { name: "Ocean", from: 190, to: 240, angle: 160, radius: 32, glow: 30 },
  { name: "Lime", from: 90, to: 160, angle: 45, radius: 12, glow: 20 },
  { name: "Neon", from: 280, to: 320, angle: 90, radius: 48, glow: 60 },
];

const SLIDERS = [
  { key: "from", label: "Start hue", max: 360, unit: "°" },
  { key: "to", label: "End hue", max: 360, unit: "°" },
  { key: "angle", label: "Angle", max: 360, unit: "°" },
  { key: "radius", label: "Corners", max: 64, unit: "px" },
  { key: "glow", label: "Glow", max: 80, unit: "px" },
];

// The same CSS drives the preview and the code panel, so they always match.
const CSS = `\`background: linear-gradient(\${data.angle}deg, hsl(\${data.from} 90% 60%), hsl(\${data.to} 90% 55%));
border-radius: \${data.radius}px;
box-shadow: 0 \${data.glow / 2}px \${data.glow}px hsl(\${data.to} 90% 55% / 0.5);\``;

export default function () {
  const start = PRESETS[0];
  return (
    <Layout
      title="Reactive scripting"
      description="Add reactive bindings to plain HTML with the hx-live extension for HTMX."
      css="/hx-live/index.css"
      script="/hx-live/index.js"
    >
      <h1>Reactive scripting</h1>
      <p>
        <a href="https://four.htmx.org/extensions/hx-live">hx-live</a> is an HTMX extension to ease
        reactive scripting for the web. It is inspired by Alpine, jQuery and hyperscript. State
        lives in <code>data-*</code> attributes, <code>hx-on:*</code> changes it and{" "}
        <code>hx-live:*</code> keeps the markup in sync.
      </p>
      <p>
        The gradient playground below is plain server-rendered HTML: every slider writes one{" "}
        <code>data-*</code> attribute, and the preview, the labels and the CSS code are bindings
        that recompute whenever the state changes. Open your dev tools and watch the attributes
        change.
      </p>
      <section
        class="hl-playground"
        data-from={start.from}
        data-to={start.to}
        data-angle={start.angle}
        data-radius={start.radius}
        data-glow={start.glow}
        data-copied="false"
      >
        <div class="hl-preview-wrap">
          <div class="hl-preview" hx-live:style={CSS}>
            <span>hx-live</span>
            <small hx-live:text="`${data.from}° → ${data.to}°`">
              {start.from}° → {start.to}°
            </small>
          </div>
        </div>
        <div class="hl-controls">
          <div class="hl-presets" role="group" aria-label="Presets">
            {PRESETS.map(({ name, ...values }) => (
              <button
                type="button"
                hx-on:click={Object.entries(values)
                  .map(([key, value]) => `data.${key} = ${value}`)
                  .join("; ")}
                {...{
                  // JSX names can't contain a dot, so the class binding goes in via a spread.
                  "hx-live:.active": `data.from === ${values.from} && data.to === ${values.to}`,
                }}
                hx-live:style={`\`--a: hsl(${values.from} 90% 60%); --b: hsl(${values.to} 90% 55%)\``}
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              class="hl-random"
              hx-on:click="data.from = Math.floor(Math.random() * 360); data.to = (data.from + 60 + Math.floor(Math.random() * 180)) % 360; data.angle = Math.floor(Math.random() * 360)"
            >
              🎲 Random
            </button>
          </div>
          {SLIDERS.map(({ key, label, max, unit }) => (
            <label class="hl-slider">
              <span>
                {label}
                <output hx-live:text={`data.${key} + '${unit}'`}>
                  {start[key]}
                  {unit}
                </output>
              </span>
              <input
                type="range"
                min="0"
                max={max}
                value={start[key]}
                hx-on:input={`data.${key} = event.target.valueAsNumber`}
                hx-live:value={`data.${key}`}
                style={key === "from" || key === "to" ? "--track: var(--hue-track)" : undefined}
              />
            </label>
          ))}
        </div>
        <div class="hl-code">
          <header>
            <span>CSS</span>
            <button
              type="button"
              hx-on:click="await copyCss(this.closest('.hl-code').querySelector('code').textContent); data.copied = true; await new Promise((r) => setTimeout(r, 1500)); data.copied = false"
              hx-live:text="data.copied ? 'Copied!' : 'Copy'"
            >
              Copy
            </button>
          </header>
          <pre>
            <code hx-live:text={CSS}></code>
          </pre>
        </div>
      </section>
    </Layout>
  );
}
