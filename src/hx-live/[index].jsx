import { html } from "jsx-async-runtime";
import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="Use hx-live with Jeasx"
      description="Add reactive bindings to HTML with hx-live."
      script="/hx-live/index.js"
    >
      <h1>Use hx-live with Jeasx</h1>
      <p>
        <a href="https://four.htmx.org/extensions/hx-live">hx-live</a> is an HTMX extension to ease
        reactive scripting for the web. It is inspired by Alpine, jQuery and hyperscript. The jokes
        widget below works like the one in the <a href="/alpine">Alpine example</a>, written with
        hx-live attributes instead.
      </p>
      <div data-counter="3" data-jokes="[]" data-error="">
        {/* Global helpers for the attributes below, so their names are specific to this example. */}
        <script>
          {html(/*js*/ `async function loadJokes(data, category) {
              try {
                const response = await fetch(\`/jokes/api/\${category}?amount=\${data.counter}\`);
                if (!response.ok) throw new Error(response.statusText);
                data.jokes = await response.json();
                data.error = "";
              } catch {
                data.jokes = [];
                data.error = "The jokes could not be loaded. Please try again.";
              }
            }
            function jokeToListItem(text) {const li = document.createElement("li"); li.textContent = text; return li.outerHTML;}`)}
        </script>
        <div class="grid">
          <button
            class="btn btn-secondary"
            type="button"
            hx-on:click="data.counter--"
            hx-live:disabled="data.counter === 1"
            aria-label="Fewer jokes"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            type="button"
            hx-on:click="data.counter++"
            hx-live:disabled="data.counter === 5"
            aria-label="More jokes"
          >
            +
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            hx-on:click="await loadJokes(data, 'programming')"
          >
            <span hx-live:text="data.counter === 1 ? `Tell me a nerd joke` : `Tell me ${data.counter} nerd jokes`" />
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            hx-on:click="await loadJokes(data, 'general')"
          >
            <span hx-live:text="data.counter === 1 ? `Tell me a pun` : `Tell me ${data.counter} puns`" />
          </button>
        </div>
        <p role="alert" hx-live:text="data.error"></p>
        <ul hx-live:html="data.jokes.map(jokeToListItem).join('')"></ul>
      </div>
    </Layout>
  );
}
