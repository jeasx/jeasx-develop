import jokes from "../jokes/jokes";
import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Render props with async components"
      description="Pass a function as children to let an async component load data and leave the markup to the caller."
      css="/render-props/index.css"
    >
      <h1>Render props with async components</h1>
      <p>
        A component receives its <code>children</code> as written, like in React: one child is
        passed as it is, several children as an array, and without children there is no{" "}
        <code>children</code> prop at all. So a single function child works as a{" "}
        <em>render prop</em>: the component loads the data, and the caller decides how it looks.
      </p>
      <p>
        The same <code>&lt;Jokes&gt;</code> loader is used twice below with different markup.{" "}
        <a href="">Reload</a> for new jokes.
      </p>

      <h2>As a list</h2>
      <Jokes category="programming" amount={3}>
        {(items) => (
          <ul class="joke-list">
            {items.map((joke) => (
              <li>{joke}</li>
            ))}
          </ul>
        )}
      </Jokes>

      <h2>As cards</h2>
      <Jokes category="general" amount={2}>
        {(items) => (
          <div class="joke-grid">
            {items.map((joke, index) => (
              <article>
                <header>
                  <strong>Joke #{index + 1}</strong>
                </header>
                {joke}
              </article>
            ))}
          </div>
        )}
      </Jokes>
    </Layout>
  );
}

/**
 * Loads the data and calls the render prop with it.
 *
 * @param {{ category: string, amount: number, children: (jokes: string[]) => JSX.Element }} props
 */
async function Jokes({ category, amount, children }) {
  const data = await loadJokes(category, amount);
  return children(data);
}

/**
 * Simulates a slow API call.
 *
 * @param {string} category
 * @param {number} amount
 * @returns {Promise<string[]>}
 */
async function loadJokes(category, amount) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return jokes(category, amount);
}
