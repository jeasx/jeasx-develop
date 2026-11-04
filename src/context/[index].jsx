import Layout from "../Layout";

const THEMES = ["light", "dark"];

/**
 * @typedef {import("../types").ThisContext & { theme?: string }} ThemeContext
 */

/**
 * @this {ThemeContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Only known themes, so the page never shows a name it has no colors for.
  const theme = String(request.query["theme"]);
  this.theme = THEMES.includes(theme) ? theme : THEMES[0];

  return (
    <Layout
      title="Avoid prop drilling via 'this'"
      description="Avoid prop drilling by forwarding settings via the 'this' context."
      css="/context/index.css"
    >
      <h1>Avoid prop drilling via 'this'</h1>
      <p>
        In Jeasx, every component can read and write <code>this</code>, a context object shared by
        all components of one request. It lets you pass data to deeply nested components without
        handing it down as props through every level. Each request gets its own context, so values
        never leak to other visitors.
      </p>
      <p>
        Use it with care, as it hides dependencies between components, but it is handy for global
        settings like a theme. The route stores the theme in <code>this.theme</code>, and two levels
        below, <code>&lt;Card&gt;</code> reads it, although no component in between passes it on.
      </p>
      <pre class="tree">
        {'route        → this.theme = "' + this.theme + '"\n'}
        {"└─ <Page>    → doesn't know the theme\n"}
        {"   └─ <Card> → reads this.theme"}
      </pre>
      <ThemeSwitcher />
      <Page>
        <Card />
      </Page>
    </Layout>
  );
}

/**
 * @this {ThemeContext}
 */
function ThemeSwitcher() {
  return (
    <p class="theme-switcher">
      {THEMES.map((theme) => (
        <a
          href={`?theme=${theme}`}
          role="button"
          aria-current={theme === this.theme ? "true" : undefined}
          aria-disabled={theme === this.theme ? "true" : "false"}
        >
          {theme[0].toUpperCase() + theme.slice(1)}
        </a>
      ))}
    </p>
  );
}

/**
 * Knows nothing about themes: it just renders its children.
 */
function Page({ children }) {
  return <section>{children}</section>;
}

/**
 * @this {ThemeContext}
 */
function Card() {
  return (
    <div class={`theme-box theme-${this.theme}`}>
      <span class="icon" aria-hidden="true">
        {this.theme === "dark" ? "🌙" : "☀️"}
      </span>
      I'm rendered with the <strong>{this.theme}</strong> theme from <code>this.theme</code>.
    </div>
  );
}
