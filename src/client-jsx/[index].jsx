import Layout from "../Layout";
import planets from "./planets";

export default function () {
  return (
    <Layout
      title="Asynchronous JSX components in the browser"
      description="Render asynchronous JSX components in the browser with jsx-async-runtime."
      css="/client-jsx/index.css"
      script="/client-jsx/index.js"
    >
      <h1>Asynchronous JSX components in the browser</h1>
      <p>
        You can also use JSX components built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> in the browser
        for lightweight rendering of client-side markup. Pick some planets: each one is an async
        component that fetches its own data from a slow API, and all of them load in parallel before
        the markup is rendered right in your browser.
      </p>
      <form
        onsubmit={
          /* js */ `
          event.preventDefault();
          const button = event.target.querySelector("button");
          button.setAttribute("aria-busy", "true");
          button.disabled = true;
          renderPlanets(
            document.getElementById("planets"),
            new FormData(event.target).getAll("planet")
          ).finally(() => {
            button.removeAttribute("aria-busy");
            button.disabled = false;
          });`
        }
      >
        <fieldset class="planet-picker">
          <legend>Planets</legend>
          {planets.map(({ name }) => (
            <label>
              <input type="checkbox" name="planet" value={name} checked />
              {name}
            </label>
          ))}
        </fieldset>
        <button class="btn btn-primary" type="submit">
          Launch
        </button>
      </form>
      <div id="planets" aria-live="polite"></div>
    </Layout>
  );
}
