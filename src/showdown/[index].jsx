import { html } from "jsx-async-runtime";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import Layout from "../Layout";
import { createElement as preactElement } from "preact";
import { render as preactToString } from "preact-render-to-string";
import { render as svelteToString } from "svelte/server";
import { createSSRApp } from "vue";
import { renderToString as vueToString } from "vue/server-renderer";
import AlpineList from "./alpine/AlpineList";
import PreactList from "./preact/ShoppingList";
import ShoppingList from "./react/ShoppingList";
import SvelteList from "./svelte/ShoppingList.svelte";
import VueList from "./vue/ShoppingList.vue";
import ServerList from "./ServerList";
import { INITIAL } from "./shopping";
import { loadItems, NO_JS_COOKIE } from "./store";

const WAYS = [
  {
    id: "jeasx",
    withoutJs: "works",
    name: "Jeasx",
    how: "Isomorphic JSX: the browser renders the same component as the server and saves in the background. Without JavaScript, the forms post to the server.",
    state: "cookie",
  },
  {
    id: "preact",
    withoutJs: "view only",
    name: "Preact",
    how: "The React model in a smaller package: rendered on the server, then hydrated.",
    state: "session",
  },
  {
    id: "lit",
    withoutJs: "empty",
    name: "Lit",
    how: "A web component which renders in the browser. Until its bundle runs, the card is empty.",
    state: "session",
  },
  {
    id: "htmx",
    withoutJs: "works",
    name: "HTMX",
    how: "The same forms, sent in the background. The server answers with the new list only.",
    state: "cookie",
  },
  {
    id: "alpine",
    withoutJs: "empty",
    name: "Alpine.js",
    how: "The server sends the markup as a template with x- attributes, which Alpine fills in the browser.",
    state: "session",
  },
  {
    id: "vue",
    withoutJs: "view only",
    name: "Vue",
    how: "A single-file component, rendered on the server and hydrated in the browser.",
    state: "session",
  },
  {
    id: "svelte",
    withoutJs: "view only",
    name: "Svelte",
    how: "Compiled away: the server renders the HTML, and the browser hydrates it with small generated code.",
    state: "session",
  },
  {
    id: "react",
    withoutJs: "view only",
    name: "React",
    how: "Rendered on the server, then hydrated. Clicks only work once React has loaded.",
    state: "session",
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

  const lists = {
    jeasx: <ServerList way="jeasx" items={loadItems(request, "jeasx")} />,
    htmx: <ServerList way="htmx" items={loadItems(request, "htmx")} />,
    react: (
      <div data-root data-props={INITIAL}>
        {html(renderToString(createElement(ShoppingList, { initial: INITIAL })))}
      </div>
    ),
    preact: (
      <div data-root data-props={INITIAL}>
        {html(preactToString(preactElement(PreactList, { initial: INITIAL })))}
      </div>
    ),
    vue: (
      <div data-root data-props={INITIAL}>
        {html(await vueToString(createSSRApp(VueList, { initial: INITIAL })))}
      </div>
    ),
    svelte: (
      <div data-root data-props={INITIAL}>
        {html(svelteToString(SvelteList, { props: { initial: INITIAL } }).body)}
      </div>
    ),
    lit: <shopping-list data-root />,
    alpine: (
      <div data-root>
        <AlpineList />
      </div>
    ),
  };

  return (
    <Layout
      title="Framework showdown"
      description="One shopping list built with Jeasx, Preact, Lit, HTMX, Alpine.js, Vue, Svelte and React, with the JavaScript and time to interactive of each measured side by side."
      css="/showdown/index.css"
      script={noJs ? "" : "/showdown/index.js"}
    >
      <h1 class="fw-title">
        Framework <span>showdown</span>
      </h1>
      <p class="lead">
        One shopping list, built eight times: with Jeasx, Preact, Lit, HTMX, Alpine.js, Vue, Svelte
        and React. All eight share the same update function and the same styles. What differs is
        where the list lives and how much JavaScript it takes.
      </p>
      <p>
        Each card measures the JavaScript it downloaded and when it became usable. To see the
        difference, throttle the network in the dev tools, or see what is left without JavaScript.
      </p>
      <p>
        Reload the page: every list keeps your changes. Jeasx and HTMX save them in a cookie on the
        server, the others in the session storage of the browser.
      </p>
      <form method="post" action="/showdown/nojs">
        <button class={`btn fw-nojs${noJs ? " fw-nojs-on" : ""}`}>
          {noJs ? "✕ Turn JavaScript back on" : "Simulate no JavaScript"}
        </button>
      </form>
      <div class="fw-grid">
        {WAYS.map((way) => (
          <section class="fw-card" id={way.id} data-way={way.id}>
            <header class="fw-head">
              <h2>{way.name}</h2>
              <span class="fw-state" title="Where the list is saved">
                {way.state}
              </span>
            </header>
            <p class="fw-how">{way.how}</p>
            <dl class="fw-stats">
              <div>
                <dt>JavaScript</dt>
                <dd data-size>{noJs ? "none" : "…"}</dd>
              </div>
              <div>
                <dt>{noJs ? "No JS" : "Interactive"}</dt>
                <dd data-ready>{noJs ? way.withoutJs : "…"}</dd>
              </div>
            </dl>
            {lists[way.id]}
          </section>
        ))}
      </div>
    </Layout>
  );
}
