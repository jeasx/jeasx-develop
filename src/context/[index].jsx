import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext & { theme?: string }}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  this.theme = request.query["theme"] || "light";

  return (
    <Layout
      title="Use 'this' as context object for Jeasx"
      description="Avoid prop drilling with forwarding settings via 'this' context."
    >
      <h1>Avoid prop drilling via 'this'</h1>
      <p>
        In Jeasx you can use 'this' to provide data to subcomponents without prop drilling. You
        should use this with care to avoid concealed coupling of your components, but it is a handy
        feature for forwarding global settings like themes. Have a look at the source to see how it
        works.
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
        <a href="?theme=light" role="button" aria-disabled={String(this.theme === "light")}>
          Light
        </a>
        <a href="?theme=dark" role="button" aria-disabled={String(this.theme === "dark")}>
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
