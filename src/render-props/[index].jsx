import { pick } from "../jokes/jokes";
import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Render props with async components"
      description="Pass a function as children to let an async component load data and leave the markup to the caller."
      css="/render-props/index.css"
    >
      <h1>Render props with async components</h1>
      <p class="lead">
        A single function child works as a <em>render prop</em>: the component loads the data, and
        the caller decides how it looks.
      </p>
      <p>
        A component receives its <code>children</code> as written, so the same{" "}
        <code>&lt;Jokes&gt;</code> loader is used twice below with different markup.{" "}
        <a href="">Reload</a> for new jokes.
      </p>

      <div class="joke-columns">
        <section>
          <h2>As a list</h2>
          <Jokes category="programming" amount={3}>
            {(items) => (
              <ul class="joke-list">
                {items.map((joke) => (
                  <li>
                    {joke.setup} <em>{joke.punchline}</em>
                  </li>
                ))}
              </ul>
            )}
          </Jokes>
        </section>
        <section>
          <h2>As cards</h2>
          <Jokes category="general" amount={2}>
            {(items) => (
              <div class="joke-grid">
                {items.map((joke, index) => (
                  <article>
                    <header>
                      <strong>Joke #{index + 1}</strong>
                    </header>
                    <p>{joke.setup}</p>
                    <p>
                      <em>{joke.punchline}</em>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Jokes>
        </section>
      </div>
    </Layout>
  );
}

/** @typedef {import("../jokes/state").Joke} Joke */

/**
 * Loads the data and calls the render prop with it.
 *
 * @param {{ category: string, amount: number, children: (jokes: Joke[]) => JSX.Element }} props
 */
async function Jokes({ category, amount, children }) {
  const data = pick(category, amount);
  return children(data);
}
