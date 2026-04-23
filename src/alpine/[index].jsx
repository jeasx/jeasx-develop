import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="Use Alpine.js in Jeasx"
      description="How to use Alpine.js with Jeasx?"
      script="./index.js"
    >
      <h1>Use Alpine.js with Jeasx</h1>
      <p>
        <a href="https://alpinejs.dev">Alpine.js</a> is a minimal tool for composing behavior
        directly in your markup. Jeasx allows to use Alpine.js by simply importing it as browser
        bundle.
      </p>
      <form
        method="post"
        x-data="{
              jokes:[],
              counter: +(sessionStorage.getItem('counter') || 3),
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
            name="counter"
            x-on:click="counter++"
            x-bind:disabled="counter === 5"
          >
            +
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            name="category"
            x-on:click="load('programming')"
          >
            Tell me <span x-text="counter === 1 ? `a joke` : `${counter} jokes`" />
          </button>
        </div>
        <div class="grid">
          <button
            class="btn btn-primary"
            type="button"
            name="category"
            x-on:click="load('general')"
          >
            Tell me <span x-text="counter === 1 ? `a pun` : `${counter} puns`" />
          </button>
        </div>
        <template x-if="jokes.length">
          <ul>
            <template x-for="joke in jokes">
              <li x-text="joke" />
            </template>
          </ul>
        </template>
      </form>
    </Layout>
  );
}
