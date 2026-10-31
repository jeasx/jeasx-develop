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
        directly in your markup. Jeasx lets you use Alpine.js by simply importing it as a browser
        bundle.
      </p>
      <div
        x-data="{
              jokes:[],
              counter: Math.min(Math.max(Math.trunc(+sessionStorage.getItem('counter')) || 3, 1), 5),
              async load(category) {
                this.jokes = await (await fetch(`/jokes/api/${category}?amount=${this.counter}`)).json()
              },
            }"
        x-effect="sessionStorage.setItem('counter', counter)"
      >
        <div class="grid">
          <button
            class="btn btn-secondary"
            type="button"
            x-on:click="counter--"
            x-bind:disabled="counter === 1"
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            type="button"
            x-on:click="counter++"
            x-bind:disabled="counter === 5"
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
