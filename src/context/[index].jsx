import Layout from "../Layout";

/**
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

function Subcomponent() {
  return (
    <>
      <div style="display: flex; justify-content: space-evenly; align-items: center;">
        <a href="?theme=light" role="button" disabled={this.theme === "light"}>
          Light
        </a>
        <a href="?theme=dark" role="button" disabled={this.theme === "dark"}>
          Dark
        </a>
      </div>
      <hr />
      <div
        style={{
          "background-color": this.theme === "dark" ? "var(--mu-secondary)" : "var(--mu-primary)",
        }}
      >
        <Subsubcomponent />
      </div>
    </>
  );
}

function Subsubcomponent() {
  return (
    <div
      style={{
        color: this.theme === "dark" ? "white" : "black",
        "text-align": "center",
      }}
    >
      {this.theme}
    </div>
  );
}
