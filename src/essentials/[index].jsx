import { html, jsxToString } from "jsx-async-runtime";
import * as prettier from "prettier";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="JSX essentials"
      description="A step-by-step tour through the essentials of jsx-async-runtime, the JSX engine of Jeasx."
      css="/essentials/index.css"
    >
      <h1>JSX essentials</h1>
      <p class="lead">
        New to Jeasx? This tour walks you through everything you need to know about{" "}
        <code>jsx-async-runtime</code>, the engine that turns your JSX into HTML. If you know JSX
        from React, most of it will feel familiar. The differences are small, but important.
      </p>
      <p>
        Each step shows a short piece of code, the rendered result and the HTML the server sends to
        the browser.
      </p>

      <nav class="toc" aria-label="Steps">
        <ol>
          {STEPS.map(({ id, title }) => (
            <li>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ol>
      </nav>

      {STEPS.map((step, index) => (
        <Step number={index + 1} {...step} />
      ))}

      <h2>Where to go next</h2>
      <p>
        You now know the essentials. Dive deeper with <a href="/values">What JSX renders</a>,{" "}
        <a href="/context">'this' as context</a>, <a href="/streaming">Streaming HTML</a> or{" "}
        <a href="/testing">Unit tests</a>, or read the{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime documentation</a>.
      </p>
    </Layout>
  );
}

/**
 * Shows the code of a step, its rendered result and the generated HTML.
 * `render` is called twice: once to show the result, once to show the markup.
 */
async function Step({ number, id, title, intro, code, render, note = null }) {
  // Prettier breaks the one-line output into indented lines, so the structure is easy to see.
  const markup = await prettier.format(await jsxToString.call({}, render()), {
    parser: "html",
    printWidth: 60,
    htmlWhitespaceSensitivity: "ignore",
  });
  return (
    <section id={id} class="step">
      <h2>
        <span class="step-number">{number}</span> {title}
      </h2>
      <p>{intro}</p>
      <article>
        <span class="step-label">Code</span>
        <pre class="language-jsx">
          <code class="language-jsx">
            {html(Prism.highlight(code.trim(), Prism.languages.jsx, "jsx"))}
          </code>
        </pre>
        <div class="step-output">
          <div>
            <span class="step-label">Result</span>
            <div class="step-result">{render()}</div>
          </div>
          <div>
            <span class="step-label">HTML</span>
            <pre class="language-markup">
              <code class="language-markup">
                {html(Prism.highlight(markup.trim(), Prism.languages.markup, "markup"))}
              </code>
            </pre>
          </div>
        </div>
      </article>
      {note && <p class="step-note">{note}</p>}
    </section>
  );
}

// 1. Components are functions

function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}

// 2. Children

function Box({ title, children }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

// 4. Conditions and lists

function Inbox({ messages }) {
  return (
    <div>
      {messages.length === 0 && <p>No messages.</p>}
      {messages.length > 0 && <p>{messages.length} new messages:</p>}
      <ul>
        {messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
    </div>
  );
}

// 6. Async components

async function Weather({ city }) {
  const { temperature } = await loadWeather(city);
  return (
    <p>
      {city}: {temperature} °C
    </p>
  );
}

// 7. Parallel loading

function Forecast() {
  // Both requests start right away and run at the same time.
  const berlin = loadWeather("Berlin");
  const paris = loadWeather("Paris");
  return (
    <ul>
      <City weather={berlin} />
      <City weather={paris} />
    </ul>
  );
}

async function City({ weather }) {
  const { city, temperature } = await weather;
  return (
    <li>
      {city}: {temperature} °C
    </li>
  );
}

// 8. The 'this' context

/**
 * @this {{ user?: string }}
 */
function Page() {
  this.user = "Ada";
  return (
    <header>
      <Nav />
    </header>
  );
}

function Nav() {
  return (
    <nav>
      <UserMenu />
    </nav>
  );
}

/**
 * @this {{ user?: string }}
 */
function UserMenu() {
  return <span>Signed in as {this.user}</span>;
}

/**
 * @typedef {object} StepData
 * @property {string} id
 * @property {string} title
 * @property {JSX.Element} intro
 * @property {string} code
 * @property {() => JSX.Element | Promise<JSX.Element>} render
 * @property {JSX.Element} [note]
 */

/** @type {StepData[]} */
const STEPS = [
  {
    id: "components",
    title: "Components are functions",
    intro: (
      <>
        A component is a plain function that receives its attributes as an object (the{" "}
        <em>props</em>) and returns JSX. Its name starts with an uppercase letter, so JSX can tell
        it apart from HTML tags like <code>&lt;p&gt;</code>.
      </>
    ),
    code: `
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}

<Greeting name="Ada" />
`,
    render: () => <Greeting name="Ada" />,
    note: (
      <>
        There are no hooks, no state and no virtual DOM: a component runs once and returns markup.
      </>
    ),
  },
  {
    id: "children",
    title: "Children and fragments",
    intro: (
      <>
        Everything between the opening and closing tag of a component arrives as the{" "}
        <code>children</code> prop. Use a fragment <code>&lt;&gt;…&lt;/&gt;</code> to return
        several elements without a wrapper.
      </>
    ),
    code: `
function Box({ title, children }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

<Box title="Fragments">
  <>
    <p>First</p>
    <p>Second</p>
  </>
</Box>
`,
    render: () => (
      <Box title="Fragments">
        <>
          <p>First</p>
          <p>Second</p>
        </>
      </Box>
    ),
  },
  {
    id: "attributes",
    title: "HTML attribute names",
    intro: (
      <>
        Unlike React, attributes keep their HTML names: <code>class</code>, <code>for</code> and{" "}
        <code>onclick</code> instead of <code>className</code>, <code>htmlFor</code> and{" "}
        <code>onClick</code>. Styles are plain strings, and <code>true</code> renders a boolean
        attribute, while <code>false</code>, <code>null</code> and <code>undefined</code> leave it
        out.
      </>
    ),
    code: `
<label for="email" class="label">Email</label>
<input
  id="email"
  type="email"
  style="max-width: 16rem"
  required={true}
  disabled={false}
/>
`,
    render: () => (
      <>
        <label for="email" class="label">
          Email
        </label>
        <input id="email" type="email" style="max-width: 16rem" required={true} disabled={false} />
      </>
    ),
  },
  {
    id: "lists",
    title: "Conditions and lists",
    intro: (
      <>
        JSX has no special template syntax: use <code>&&</code>, the ternary operator and{" "}
        <code>.map()</code> like in any JavaScript. Arrays are rendered item by item, and{" "}
        <code>null</code>, <code>undefined</code> and booleans render nothing.
      </>
    ),
    code: `
function Inbox({ messages }) {
  return (
    <div>
      {messages.length === 0 && <p>No messages.</p>}
      {messages.length > 0 && <p>{messages.length} new messages:</p>}
      <ul>
        {messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
    </div>
  );
}

<Inbox messages={["Hi!", "Lunch?"]} />
`,
    render: () => <Inbox messages={["Hi!", "Lunch?"]} />,
    note: (
      <>
        No <code>key</code> props needed: the server just renders the list once.
      </>
    ),
  },
  {
    id: "escaping",
    title: "Escaping and raw HTML",
    intro: (
      <>
        All text and attribute values are escaped, so user input can never inject markup. When you
        really need raw HTML (e.g. the doctype or trusted content from a CMS), wrap it in{" "}
        <code>html()</code>.
      </>
    ),
    code: `
import { html } from "jsx-async-runtime";

const input = "<b>bold</b>";

<p>Escaped: {input}</p>
<p>Raw: {html(input)}</p>
`,
    render: () => {
      const input = "<b>bold</b>";
      return (
        <>
          <p>Escaped: {input}</p>
          <p>Raw: {html(input)}</p>
        </>
      );
    },
    note: (
      <>
        Never pass untrusted input to <code>html()</code>. Inline <code>&lt;script&gt;</code> and{" "}
        <code>&lt;style&gt;</code> content is escaped too, so wrap it in <code>html()</code> as
        well.
      </>
    ),
  },
  {
    id: "async",
    title: "Async components",
    intro: (
      <>
        Here comes the twist: components can be <code>async</code>. Fetch data right where you need
        it, with no loaders, effects or suspense boundaries. The runtime waits for the component
        and renders the result in place.
      </>
    ),
    code: `
async function Weather({ city }) {
  const { temperature } = await loadWeather(city);
  return (
    <p>
      {city}: {temperature} °C
    </p>
  );
}

<Weather city="Berlin" />
`,
    render: () => <Weather city="Berlin" />,
    note: (
      <>
        Promises work anywhere, as children and as attribute values, e.g.{" "}
        <code>&lt;img src=&#123;loadAvatarUrl()&#125; /&gt;</code>. If a component throws, the
        whole render fails; wrap risky parts in an error boundary to show a fallback instead (see{" "}
        <a href="/error-handler">Error boundaries</a>).
      </>
    ),
  },
  {
    id: "parallel",
    title: "Loading in parallel",
    intro: (
      <>
        Async components run one after another, in the order they appear. To load data at the same
        time, start the requests first and pass the promises as props. Each component awaits its
        own promise, the requests run in parallel, and the output keeps the order of your JSX.
      </>
    ),
    code: `
function Forecast() {
  // Both requests start right away and run at the same time.
  const berlin = loadWeather("Berlin");
  const paris = loadWeather("Paris");
  return (
    <ul>
      <City weather={berlin} />
      <City weather={paris} />
    </ul>
  );
}

async function City({ weather }) {
  const { city, temperature } = await weather;
  return <li>{city}: {temperature} °C</li>;
}
`,
    render: () => <Forecast />,
  },
  {
    id: "context",
    title: "Sharing data via 'this'",
    intro: (
      <>
        All components of one request share a context object as <code>this</code>. Store a value
        once and read it deep down the tree, without passing it through every component in between.
        In Jeasx, <code>this</code> also holds the <code>request</code> and <code>reply</code>.
      </>
    ),
    code: `
function Page() {
  this.user = "Ada";
  return <header><Nav /></header>;
}

function Nav() {
  return <nav><UserMenu /></nav>;
}

function UserMenu() {
  return <span>Signed in as {this.user}</span>;
}
`,
    render: () => <Page />,
    note: (
      <>
        Components using <code>this</code> must be regular functions, not arrow functions. Each
        request gets a fresh context, so nothing leaks between visitors.
      </>
    ),
  },
  {
    id: "render",
    title: "Rendering to a string",
    intro: (
      <>
        Jeasx renders your routes for you, but you can call the runtime yourself, e.g. in tests, for
        emails or in scripts. <code>jsxToString</code> returns the HTML as a string, or a promise if
        rendering had to wait. With <code>await</code>, both cases work the same.
      </>
    ),
    code: `
import { jsxToString } from "jsx-async-runtime";

const markup = await jsxToString(<Weather city="Paris" />);

<pre>{markup}</pre>
`,
    render: async () => {
      const markup = await jsxToString(<Weather city="Paris" />);
      return <pre>{markup}</pre>;
    },
    note: (
      <>
        The result is plain text, so <code>&lt;pre&gt;</code> shows the escaped tags. Wrap it in{" "}
        <code>html()</code> only to insert trusted, pre-rendered markup, e.g. from a cache. To
        send markup while slow components are still loading, use <code>jsxToStream</code> instead
        (see <a href="/streaming">Streaming HTML</a>).
      </>
    ),
  },
];

/**
 * Fakes a slow weather API.
 *
 * @param {string} city
 */
async function loadWeather(city) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { city, temperature: { Berlin: 12, Paris: 15 }[city] ?? 20 };
}
