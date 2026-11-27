import { html } from "jsx-async-runtime";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import { pick } from "../jokes/jokes";
import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Component slots and render props"
      description="Fill several slots of a component with JSX, or pass a function to let an async component load the data."
      css="/slots/index.css"
    >
      <h1>Component slots and render props</h1>
      <p class="lead">
        Props can hold more than strings and numbers. A <em>slot</em> receives finished markup, a{" "}
        <em>render prop</em> receives a function that turns the component's data into markup.
      </p>

      <h2>Named slots</h2>
      <p>
        Besides <code>children</code>, any prop can hold JSX, so a card can offer a slot for its
        header and one for its footer. A slot is an ordinary prop: give it a default value as a
        fallback.
      </p>
      <Example
        code={`function Card({ header, footer = <small>No footer</small>, children }) {
  return (
    <article>
      <header>{header}</header>
      {children}
      <footer>{footer}</footer>
    </article>
  );
}

<Card header={<strong>Jeasx 3.0</strong>} footer={<a href="#">Changelog</a>}>
  <p>Faster streaming and smaller bundles.</p>
</Card>

<Card header={<strong>No footer given</strong>}>
  <p>The default value renders instead.</p>
</Card>`}
      >
        <Card header={<strong>Jeasx 3.0</strong>} footer={<a href="#">Changelog</a>}>
          <p>Faster streaming and smaller bundles.</p>
        </Card>
        <Card header={<strong>No footer given</strong>}>
          <p>The default value renders instead.</p>
        </Card>
      </Example>

      <h2 id="render-props">Render props</h2>
      <p>
        If the markup needs data from the component, pass a function instead. Here the async{" "}
        <code>&lt;Jokes&gt;</code> component loads the data, and the caller decides how it looks:
        the same loader renders a list and cards.
      </p>
      <Example
        code={`async function Jokes({ amount, children }) {
  const jokes = await loadJokes(amount);
  return children(jokes);
}

<Jokes amount={2}>
  {(jokes) => (
    <ul>
      {jokes.map((joke) => <li>{joke.setup} <em>{joke.punchline}</em></li>)}
    </ul>
  )}
</Jokes>

<Jokes amount={2}>
  {(jokes) => jokes.map((joke) => (
    <article>
      <p>{joke.setup}</p>
      <p><em>{joke.punchline}</em></p>
    </article>
  ))}
</Jokes>`}
      >
        <Jokes amount={2}>
          {(jokes) => (
            <ul class="joke-list">
              {jokes.map((joke) => (
                <li>
                  {joke.setup} <em>{joke.punchline}</em>
                </li>
              ))}
            </ul>
          )}
        </Jokes>
        <Jokes amount={2}>
          {(jokes) =>
            jokes.map((joke) => (
              <article>
                <p>{joke.setup}</p>
                <p>
                  <em>{joke.punchline}</em>
                </p>
              </article>
            ))
          }
        </Jokes>
      </Example>
    </Layout>
  );
}

/** Shows the code next to its rendered result. */
function Example({ code, children }) {
  return (
    <div class="example">
      <pre class="language-jsx">
        <code class="language-jsx">{html(Prism.highlight(code, Prism.languages.jsx, "jsx"))}</code>
      </pre>
      <div class="example-result">{children}</div>
    </div>
  );
}

/**
 * A card with two named slots: `header` and `footer` (with a default), plus `children`.
 *
 * @param {{ header: JSX.Element, footer?: JSX.Element, children: JSX.Element }} props
 */
function Card({ header, footer = <small>No footer</small>, children }) {
  return (
    <article>
      <header>{header}</header>
      {children}
      <footer>{footer}</footer>
    </article>
  );
}

/** @typedef {import("../jokes/state").Joke} Joke */

/**
 * Loads the data and calls the render prop with it.
 *
 * @param {{ amount: number, children: (jokes: Joke[]) => JSX.Element }} props
 */
async function Jokes({ amount, children }) {
  const jokes = await loadJokes(amount);
  return children(jokes);
}

/**
 * Simulates a slow API call.
 *
 * @param {number} amount
 * @returns {Promise<Joke[]>}
 */
async function loadJokes(amount) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return pick("general", amount);
}
