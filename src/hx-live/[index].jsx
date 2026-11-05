import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Reactive scripting"
      description="Add reactive bindings to plain HTML with the hx-live extension for HTMX."
      css="/hx-live/index.css"
      script="/hx-live/index.js"
    >
      <h1>Reactive scripting</h1>
      <p>
        <a href="https://four.htmx.org/extensions/hx-live">hx-live</a> is an HTMX extension to ease
        reactive scripting for the web. It is inspired by Alpine, jQuery and hyperscript. State
        lives in <code>data-*</code> attributes, <code>hx-on:*</code> changes it and{" "}
        <code>hx-live:*</code> keeps the markup in sync. The widget below works like the one in the{" "}
        <a href="/alpine">Alpine example</a>, written with hx-live attributes instead.
      </p>
      <section class="hl-card" data-counter="3" data-jokes="[]" data-error="" data-loading="false">
        <header class="hl-bar">
          <h2>Joke machine</h2>
          <nav>
            <button
              type="button"
              hx-on:click="data.counter--"
              hx-live:disabled="data.counter === 1"
              aria-label="Fewer jokes"
            >
              &minus;
            </button>
            <output hx-live:text="`${data.counter} / 5`">3 / 5</output>
            <button
              type="button"
              hx-on:click="data.counter++"
              hx-live:disabled="data.counter === 5"
              aria-label="More jokes"
            >
              +
            </button>
          </nav>
        </header>
        <div class="hl-actions">
          <button
            type="button"
            hx-on:click="await loadJokes(data, 'programming')"
            hx-live:disabled="data.loading"
            hx-live:text="data.counter === 1 ? 'Tell me a nerd joke' : `Tell me ${data.counter} nerd jokes`"
          >
            Tell me 3 nerd jokes
          </button>
          <button
            type="button"
            hx-on:click="await loadJokes(data, 'general')"
            hx-live:disabled="data.loading"
            hx-live:text="data.counter === 1 ? 'Tell me a pun' : `Tell me ${data.counter} puns`"
          >
            Tell me 3 puns
          </button>
        </div>
        <p class="hl-error" role="alert" hx-live:text="data.error"></p>
        <ul
          class="hl-jokes"
          aria-live="polite"
          hx-live:html="data.jokes.map(jokeToListItem).join('')"
        ></ul>
      </section>
    </Layout>
  );
}
