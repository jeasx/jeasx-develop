import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="Use Alpine.js with Jeasx"
      description="Add interactive behavior to server-rendered markup with Alpine.js."
      script="/alpine/index.js"
    >
      <h1>Use Alpine.js with Jeasx</h1>
      <p>
        <a href="https://alpinejs.dev">Alpine.js</a> is a minimal tool for composing behavior
        directly in your markup. To use it with Jeasx, import it in a browser bundle (see{" "}
        <code>index.js</code> of this example) and add <code>x-</code> attributes to your JSX.
      </p>
      <div
        x-data="{
              jokes: [],
              error: '',
              counter: 3,
              async load(category) {
                try {
                  const response = await fetch(`/jokes/api/${category}?amount=${this.counter}`);
                  if (!response.ok) throw new Error(response.statusText);
                  this.jokes = await response.json();
                  this.error = '';
                } catch {
                  this.jokes = [];
                  this.error = 'The jokes could not be loaded. Please try again.';
                }
              },
            }"
      >
        <div class="grid">
          <button
            class="btn btn-secondary"
            type="button"
            x-on:click="counter--"
            x-bind:disabled="counter === 1"
            aria-label="Fewer jokes"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            type="button"
            x-on:click="counter++"
            x-bind:disabled="counter === 5"
            aria-label="More jokes"
          >
            +
          </button>
        </div>
        <div class="grid">
          <button class="btn btn-primary" type="button" x-on:click="load('programming')">
            <span x-text="counter === 1 ? `Tell me a nerd joke` : `Tell me ${counter} nerd jokes`" />
          </button>
        </div>
        <div class="grid">
          <button class="btn btn-primary" type="button" x-on:click="load('general')">
            <span x-text="counter === 1 ? `Tell me a pun` : `Tell me ${counter} puns`" />
          </button>
        </div>
        <p role="alert" x-show="error" x-text="error" />
        <template x-if="jokes.length">
          <ul>
            <template x-for="joke in jokes">
              <li x-text="joke" />
            </template>
          </ul>
        </template>
      </div>
    </Layout>
  );
}
