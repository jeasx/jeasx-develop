import Layout from "../Layout";

const CATEGORIES = [
  { key: "programming", icon: "💻", one: "a nerd joke", many: "nerd jokes" },
  { key: "general", icon: "🥁", one: "a pun", many: "puns" },
];

export default function () {
  return (
    <Layout
      title="Use Alpine.js with Jeasx"
      description="Add interactive behavior to server-rendered markup with Alpine.js."
      css="/alpine/index.css"
      script="/alpine/index.js"
    >
      <div class="al">
        <h1>Use Alpine.js with Jeasx</h1>
        <p>
          <a href="https://alpinejs.dev">Alpine.js</a> is a minimal tool for composing behavior
          directly in your markup. To use it with Jeasx, import it in a browser bundle (see{" "}
          <code>index.js</code> of this example) and add <code>x-</code> attributes to your JSX. The
          whole state of the widget below lives in its <code>x-data</code> attribute.
        </p>
        <h2>Joke machine</h2>
        <div
          class="al-card"
          x-data="{
            jokes: [],
            error: '',
            loading: '',
            counter: 3,
            async load(category) {
              this.loading = category;
              try {
                const response = await fetch(`/jokes/api/${category}?amount=${this.counter}`);
                if (!response.ok) throw new Error(response.statusText);
                this.jokes = await response.json();
                this.error = '';
              } catch {
                this.jokes = [];
                this.error = `The jokes couldn't be loaded. Please try again.`;
              } finally {
                this.loading = '';
              }
            },
          }"
        >
          <div class="al-stepper">
            <button
              type="button"
              x-on:click="counter--"
              x-bind:disabled="counter === 1"
              aria-label="Fewer jokes"
            >
              −
            </button>
            <output aria-live="polite">
              <strong x-text="counter">3</strong>
              <span x-text="counter === 1 ? 'joke' : 'jokes'">jokes</span>
            </output>
            <button
              type="button"
              x-on:click="counter++"
              x-bind:disabled="counter === 5"
              aria-label="More jokes"
            >
              +
            </button>
          </div>
          <div class="al-actions">
            {CATEGORIES.map(({ key, icon, one, many }) => (
              <button
                type="button"
                class="al-btn"
                x-on:click={`load('${key}')`}
                x-bind:disabled="loading !== ''"
                x-bind:aria-busy={`loading === '${key}'`}
              >
                <span aria-hidden="true">{icon}</span>{" "}
                <span x-text={`counter === 1 ? 'Tell me ${one}' : \`Tell me \${counter} ${many}\``}>
                  Tell me 3 {many}
                </span>
              </button>
            ))}
          </div>
          <p class="al-error" role="alert" x-show="error" x-text="error" x-cloak />
          <ol class="al-jokes" aria-live="polite" x-show="jokes.length" x-cloak>
            <template x-for="(joke, index) in jokes" x-bind:key="index">
              <li x-text="joke" x-bind:style="`animation-delay: ${index * 80}ms`" />
            </template>
          </ol>
          <p class="al-empty" x-show="!jokes.length && !error">
            Pick a category to get some laughs.
          </p>
        </div>
      </div>
    </Layout>
  );
}
