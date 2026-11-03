import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext & { theme?: string }}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Only known themes, so the page never shows a name it has no colors for.
  this.theme = request.query["theme"] === "dark" ? "dark" : "light";

  return (
    <Layout
      title="Avoid prop drilling via 'this'"
      description="Avoid prop drilling by forwarding settings via the 'this' context."
    >
      <h1>Avoid prop drilling via 'this'</h1>
      <p>
        In Jeasx, every component can read and write <code>this</code>, a context object shared by
        all components of a request. It lets you pass data to deeply nested components without
        handing it down as props through every level. Use it with care, as it hides dependencies
        between components, but it is handy for global settings like a theme. Switch the theme
        below: the nested component reads it from <code>this</code>.
      </p>
      <hr />
      <Subcomponent />
    </Layout>
  );
}

/**
 * @this {import("../types").ThisContext & { theme?: string }}
 */
function Subcomponent() {
  return (
    <>
      <div style="display: flex; justify-content: space-evenly; align-items: center;">
        <a
          href="?theme=light"
          role="button"
          aria-disabled={this.theme === "light" ? "true" : "false"}
        >
          Light
        </a>
        <a
          href="?theme=dark"
          role="button"
          aria-disabled={this.theme === "dark" ? "true" : "false"}
        >
          Dark
        </a>
      </div>
      <hr />
      <div
        style={
          this.theme === "dark"
            ? "background-color: var(--mu-secondary)"
            : "background-color: var(--mu-primary)"
        }
      >
        <Subsubcomponent />
      </div>
    </>
  );
}

/**
 * @this {import("../types").ThisContext & { theme?: string }}
 */
function Subsubcomponent() {
  return (
    <div style={`text-align: center; ${this.theme === "dark" ? "color:white" : "color:black"}`}>
      {this.theme}
    </div>
  );
}
