import { jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

/**
 * @this {import("../types").ThisContext}
 */
export default function () {
  return (
    <Layout
      title="What JSX can render"
      description="Promises, iterables, bytes, dates, URLs and more as JSX children and attribute values."
    >
      <h1>What JSX can render</h1>
      <p>
        Besides strings, numbers and elements, Jeasx renders many JavaScript values directly, so you
        rarely have to convert data before putting it into markup. Each sample shows the rendered
        result and the generated HTML.
      </p>

      <h2>Children</h2>

      <Sample title="Promises" render={() => <p>{loadGreeting()}</p>}>
        A promise is awaited and its value rendered in place.
      </Sample>

      <Sample
        title="Sets and other iterables"
        render={() => (
          <ul>
            {new Set(["apple", "banana", "apple", "cherry"]).values().map((fruit) => (
              <li>{fruit}</li>
            ))}
          </ul>
        )}
      >
        Any iterable renders its items, e.g. a <code>Set</code>, a <code>Map</code> or an iterator
        with helper methods like <code>.map()</code>. No need for <code>Array.from()</code>.
      </Sample>

      <Sample
        title="Generators"
        render={() => (
          <ol>
            <Fibonacci count={8} />
          </ol>
        )}
      >
        A generator function can be used as a component and yields its items one by one.
      </Sample>

      <Sample
        title="Dates, URLs and errors"
        render={() => (
          <p>
            Created at {new Date(Date.UTC(2026, 9, 30))}
            <br />
            Fetched from {new URL("https://www.jeasx.dev/?q=<jsx>")}
            <br />
            Failed with {new Error("Something went wrong")}
          </p>
        )}
      >
        Objects with their own <code>toString</code> render as escaped text.
      </Sample>

      <Sample
        title="Bytes"
        render={() => <pre>{Buffer.from("Bytes are decoded as UTF-8 text: ✓ <b>escaped</b>")}</pre>}
      >
        A <code>Uint8Array</code> or <code>Buffer</code> renders as UTF-8 text, e.g. a file read
        with <code>fs.readFile()</code> or a <code>fetch()</code> response body.
      </Sample>

      <Sample
        title="BigInts and zero"
        render={() => (
          <p>
            {2n ** 64n} / {0}
          </p>
        )}
      >
        BigInts render as numbers, and <code>0</code> isn't swallowed like in other templating
        languages.
      </Sample>

      <Sample
        title="Nothing at all"
        render={() => (
          <p>
            [{null}
            {undefined}
            {false}
            {true}
            {() => "a function"}
            {{ plain: "object" }}]
          </p>
        )}
      >
        <code>null</code>, <code>undefined</code>, booleans, functions and plain objects render
        nothing.
      </Sample>

      <h2>Attributes</h2>

      <Sample
        title="Promise attributes"
        render={() => <img src={loadAvatarUrl()} alt={loadAvatarAlt()} width="64" height="64" />}
      >
        A promise as attribute value is awaited. All promise attributes of a tag are loaded in
        parallel.
      </Sample>

      <Sample
        title="Objects and arrays as JSON"
        render={() => (
          <div data-config={{ theme: "dark", columns: 3 }} data-ids={[1, 2, 3]}>
            Inspect me
          </div>
        )}
      >
        Plain objects and arrays are encoded as JSON, e.g. to pass data to client-side scripts.
      </Sample>

      <Sample
        title="URLs, dates and booleans"
        render={() => (
          <a
            // @ts-expect-error The runtime renders a URL via toString(), but the types expect a string.
            href={new URL("/values", "https://expo.jeasx.dev")}
            data-date={new Date(0)}
            download
          >
            Download
          </a>
        )}
      >
        Values with their own <code>toString</code> use their string form, <code>true</code> renders
        the attribute name only.
      </Sample>

      <Sample
        title="Skipped values"
        render={() => (
          <button
            type="button"
            // @ts-expect-error On purpose: functions are skipped, but the types expect a string.
            onclick={() => alert("Hi")}
            title={null}
            disabled={false}
            data-tags={new Set(["a", "b"])}
          >
            Click me
          </button>
        )}
      >
        Functions, <code>null</code>, <code>false</code> and objects without their own string form
        (e.g. a <code>Set</code>) are skipped, so an event handler never prints its source code.
      </Sample>
    </Layout>
  );
}

/**
 * Renders the sample and shows the generated markup.
 * `render` is called twice, as iterables like generators can be rendered only once.
 */
async function Sample({ title, render, children }) {
  const markup = await jsxToString(render());
  return (
    <article>
      <header>
        <strong>{title}</strong>
        <br />
        <small>{children}</small>
      </header>
      {render()}
      <footer>
        <pre>
          <code>{markup}</code>
        </pre>
      </footer>
    </article>
  );
}

function* Fibonacci({ count }) {
  let [a, b] = [0, 1];
  for (let i = 0; i < count; i++) {
    yield <li>{a}</li>;
    [a, b] = [b, a + b];
  }
}

async function loadGreeting() {
  await sleep(100);
  return "Hello from a promise!";
}

async function loadAvatarUrl() {
  await sleep(100);
  return "/svg/logo.svg?text=JSX";
}

async function loadAvatarAlt() {
  await sleep(100);
  return "Avatar loaded asynchronously";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
