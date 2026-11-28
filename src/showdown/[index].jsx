import { html } from "jsx-async-runtime";
import { createElement as preactElement } from "preact";
import { render as preactToString } from "preact-render-to-string";
import { createElement } from "react";
import { renderToString as reactToString } from "react-dom/server";
import { render as svelteToString } from "svelte/server";
import { createSSRApp } from "vue";
import { renderToString as vueToString } from "vue/server-renderer";
import Layout from "../Layout";
import AlpineList from "./alpine/AlpineList";
import { renderToString as litToString } from "./lit/renderToString";
import { listTemplate } from "./lit/template";
import PreactList from "./preact/ShoppingList";
import ShoppingList from "./react/ShoppingList";
import ServerList from "./ServerList";
import { loadItems, NO_JS_COOKIE, FRAMEWORKS } from "./store";
import SvelteList from "./svelte/ShoppingList.svelte";
import VueList from "./vue/ShoppingList.vue";

/** The cards, sorted by the size of their production bundle. */
const CARDS = [
  {
    id: "jeasx",
    name: "Jeasx",
    how: "Isomorphic JSX: the browser runs the same component as the server and renders each change itself.",
  },
  {
    id: "preact",
    name: "Preact",
    how: "The React model in a smaller package: rendered on the server, then hydrated.",
  },
  {
    id: "lit",
    name: "Lit",
    how: "A web component without hydration: the server renders the same Lit template, Lit replaces it with a live one.",
  },
  {
    id: "htmx",
    name: "HTMX",
    how: "The form is sent in the background, and the server answers with the new list as HTML.",
  },
  {
    id: "alpine",
    name: "Alpine.js",
    how: "The server renders the markup with x- attributes, Alpine renders the items again from its template.",
  },
  {
    id: "vue",
    name: "Vue",
    how: "A single-file component, rendered on the server, then hydrated.",
  },
  {
    id: "svelte",
    name: "Svelte",
    how: "Compiled away: rendered on the server, then hydrated with small generated code.",
  },
  {
    id: "react",
    name: "React",
    how: "Rendered on the server, then hydrated.",
  },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // The server lists depend on the cookies, so caches must not hand them to other visitors.
  reply.header("cache-control", "private, no-store");

  // Simulates a browser without JavaScript: the page leaves out the loader of the cards.
  const noJs = Boolean(request.cookies[NO_JS_COOKIE]);

  const items = Object.fromEntries(
    FRAMEWORKS.map((framework) => [framework, loadItems(request, framework)]),
  );

  const lists = {
    jeasx: <ServerList framework="jeasx" items={items.jeasx} />,
    htmx: <ServerList framework="htmx" items={items.htmx} />,
    react: (
      <div data-root data-props={items.react}>
        {html(reactToString(createElement(ShoppingList, { initial: items.react })))}
      </div>
    ),
    preact: (
      <div data-root data-props={items.preact}>
        {html(preactToString(preactElement(PreactList, { initial: items.preact })))}
      </div>
    ),
    vue: (
      <div data-root data-props={items.vue}>
        {html(await vueToString(createSSRApp(VueList, { initial: items.vue })))}
      </div>
    ),
    svelte: (
      <div data-root data-props={items.svelte}>
        {html(svelteToString(SvelteList, { props: { initial: items.svelte } }).body)}
      </div>
    ),
    lit: (
      <shopping-list data-root items={JSON.stringify(items.lit)}>
        {html(litToString(listTemplate({ items: items.lit })))}
      </shopping-list>
    ),
    alpine: (
      <div data-root>
        <AlpineList items={items.alpine} />
      </div>
    ),
  };

  return (
    <Layout
      title="Framework showdown"
      description="One server-rendered shopping list, enhanced by Jeasx, Preact, Lit, HTMX, Alpine.js, Vue, Svelte and React, with the JavaScript of each measured side by side."
      css="/showdown/index.css"
      script={noJs ? "" : "/showdown/index.js"}
    >
      <h1 class="fw-title">
        Framework <span>showdown</span>
      </h1>
      <p class="lead">
        One shopping list, built eight times: with Jeasx, Preact, Lit, HTMX, Alpine.js, Vue, Svelte
        and React. Every version starts as the same HTML form from the server. The difference is how
        much JavaScript each one needs to make it interactive.
      </p>
      <p>
        All eight share the same update logic, the same styles and the same state: a cookie on the
        server. Without JavaScript, every form posts to the server and keeps working. With
        JavaScript, each framework takes over in its own way: Jeasx runs the same JSX component from
        the server in the browser and renders each change itself, HTMX swaps in HTML from the
        server, Preact, React, Vue and Svelte hydrate, and Alpine.js and Lit replace the server HTML
        with their own templates.
      </p>
      <p>
        Each card shows how much JavaScript it downloaded, sorted from the smallest bundle to the
        largest. Throttle the network in the dev tools to feel the difference, or turn off
        JavaScript to see that nothing breaks.
      </p>
      <form method="post" action="/showdown/nojs">
        <button class={noJs ? "btn fw-nojs-on" : "btn"}>
          {noJs ? "✕ Turn JavaScript back on" : "Simulate no JavaScript"}
        </button>
      </form>
      <div class="fw-grid">
        {CARDS.map((card) => (
          <section class="fw-card" id={card.id} data-framework={card.id}>
            <header class="fw-head">
              <h2>{card.name}</h2>
              <span class="fw-size" title="JavaScript downloaded for this list" data-size>
                {noJs ? "0 KB JS" : "… KB JS"}
              </span>
            </header>
            <p class="fw-how">{card.how}</p>
            {lists[card.id]}
          </section>
        ))}
      </div>
    </Layout>
  );
}
