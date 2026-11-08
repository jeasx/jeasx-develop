import Layout from "../Layout";

// The menu lives on the server and is handed to the Alpine component as JSON in x-data.
const MENU = {
  drinks: [
    { id: "espresso", name: "Espresso", icon: "☕", price: 2.2 },
    { id: "cappuccino", name: "Cappuccino", icon: "🥛", price: 3.4 },
    { id: "latte", name: "Latte", icon: "🍶", price: 3.8 },
  ],
  sizes: [
    { id: "s", name: "Small", factor: 0.85 },
    { id: "m", name: "Medium", factor: 1 },
    { id: "l", name: "Large", factor: 1.25 },
  ],
  extras: [
    { id: "oat", name: "Oat milk", price: 0.5 },
    { id: "shot", name: "Extra shot", price: 0.7 },
    { id: "vanilla", name: "Vanilla syrup", price: 0.4 },
  ],
};

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
          <code>index.js</code> of this example) and add <code>x-</code> attributes to your JSX.
        </p>
        <p>
          The coffee bar below is a component registered with <code>Alpine.data()</code> in{" "}
          <code>index.js</code>. The menu comes from the server as JSON in <code>x-data</code>,{" "}
          <code>x-model</code> binds the choices, getters compute the prices and <code>x-for</code>{" "}
          renders the order.
        </p>
        <div class="al-bar" x-data={`coffeeBar(${JSON.stringify(MENU)})`}>
          <section class="al-card">
            <h2>Build your drink</h2>
            <fieldset class="al-drinks">
              <legend>Drink</legend>
              {MENU.drinks.map(({ id, name, icon, price }) => (
                <label class="al-tile">
                  <input type="radio" name="drink" value={id} x-model="drink" />
                  <span class="al-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <strong>{name}</strong>
                  <small>from €{price.toFixed(2)}</small>
                </label>
              ))}
            </fieldset>
            <fieldset class="al-sizes">
              <legend>Size</legend>
              <div class="al-segments">
                {MENU.sizes.map(({ id, name }) => (
                  <label class="al-seg">
                    <input type="radio" name="size" value={id} x-model="size" />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset class="al-extras">
              <legend>Extras</legend>
              {MENU.extras.map(({ id, name, price }) => (
                <label class="al-chip">
                  <input type="checkbox" value={id} x-model="extras" />
                  <span>
                    {name} <small>+€{price.toFixed(2)}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div class="al-summary">
              <div>
                <span class="al-muted" x-text="`${item.size.name} ${item.drink.name}`">
                  Medium Cappuccino
                </span>
                <strong class="al-price" x-text="euro(item.price)">
                  €3.40
                </strong>
              </div>
              <button type="button" class="al-btn" x-on:click="add()">
                Add to order
              </button>
            </div>
          </section>
          <section class="al-card al-order" aria-live="polite">
            <h2>
              Your order{" "}
              <span class="al-count" x-show="order.length" x-text="order.length" x-cloak />
            </h2>
            <p class="al-muted" x-show="!order.length">
              Nothing here yet. Add a drink!
            </p>
            <ul>
              <template x-for="entry in order" x-bind:key="entry.key">
                <li x-transition>
                  <span class="al-icon" aria-hidden="true" x-text="entry.drink.icon" />
                  <span>
                    <strong x-text="`${entry.size.name} ${entry.drink.name}`" />
                    <small
                      class="al-muted"
                      x-show="entry.extras.length"
                      x-text="entry.extras.map((e) => e.name).join(', ')"
                    />
                  </span>
                  <span x-text="euro(entry.price)" />
                  <button
                    type="button"
                    class="al-remove"
                    x-on:click="remove(entry.key)"
                    x-bind:aria-label="`Remove ${entry.drink.name}`"
                  >
                    ×
                  </button>
                </li>
              </template>
            </ul>
            <div class="al-total" x-show="order.length" x-cloak>
              <span>Total</span>
              <strong x-text="euro(total)" />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
