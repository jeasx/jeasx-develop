import { html } from "jsx-async-runtime";
import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="Use hx-live in Jeasx"
      description="Add reactive bindings to HTML with hx-live"
      script="./index.js"
    >
      <h1>Use hx-live in Jeasx</h1>
      <p>
        <a href="https://four.htmx.org/extensions/hx-live">hx-live</a> is an HTMX extension to ease
        reactive scripting for the web. It is inspired by Alpine, jQuery and hyperscript.
      </p>
      <div data-counter="3" data-jokes="[]">
        <script>
          {html(/*js*/ `async function load(category, count) {return await (await fetch(\`/jokes/api/\${category}?amount=\${count}\`)).json();}
            function toListItem(text) {const li = document.createElement("li"); li.textContent = text; return li.outerHTML;}`)}
        </script>
        <div class="grid">
          <button
            class="btn btn-secondary"
            type="button"
            hx-on:click="data.counter--"
            hx-live:disabled="data.counter === 1"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            type="button"
            hx-on:click="data.counter++"
            hx-live:disabled="data.counter === 5"
          >
            +
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            hx-on:click="data.jokes = await load('programming', data.counter)"
          >
            <span hx-live:text="data.counter === 1 ? `Tell me a nerd joke` : `Tell me ${data.counter} nerd jokes`" />
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            hx-on:click="data.jokes = await load('general', data.counter)"
          >
            <span hx-live:text="data.counter === 1 ? `Tell me a pun` : `Tell me ${data.counter} puns`" />
          </button>
        </div>
        <ul hx-live:html="data.jokes.map(toListItem).join('')"></ul>
      </div>
    </Layout>
  );
}
