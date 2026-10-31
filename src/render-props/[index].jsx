import jokes from "../jokes/jokes";
import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext}
 */
export default function () {
  return (
    <Layout
      title="Render props with async components"
      description="Pass a function as children to let an async component load data and leave the markup to the caller."
    >
      <h1>Render props with async components</h1>
      <p>
        A component receives its <code>children</code> as written, like in React: a single child as
        is, several children as an array and no <code>children</code> prop without children. So a
        single function child works as a <em>render prop</em>: the component loads the data, the
        caller decides how it looks.
      </p>
      <p>
        The same <code>&lt;Jokes&gt;</code> loader is used twice below with different markup.{" "}
        <a href="">Reload</a> for new jokes.
      </p>

      <h2>As a list</h2>
      <Jokes category="programming" amount={3}>
        {(items) => (
          <ul>
            {items.map((joke) => (
              <li>{joke}</li>
            ))}
          </ul>
        )}
      </Jokes>

      <h2>As cards</h2>
      <Jokes category="general" amount={2}>
        {(items) =>
          items.map((joke, index) => (
            <article>
              <header>
                <strong>Joke #{index + 1}</strong>
              </header>
              {joke}
            </article>
          ))
        }
      </Jokes>
    </Layout>
  );
}

/**
 * Loads the data and calls the render prop with it.
 */
async function Jokes({ category, amount, children }) {
  const data = await loadJokes(category, amount);
  return children(data);
}

/** Simulates a slow API call. */
async function loadJokes(category, amount) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return jokes(category, amount);
}
