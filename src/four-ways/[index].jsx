import { html } from "jsx-async-runtime";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import Layout from "../Layout";
import ShoppingList from "./react/ShoppingList";
import ServerList from "./ServerList";
import { INITIAL } from "./shopping";
import { loadItems } from "./store";

const WAYS = [
  {
    id: "jeasx",
    name: "Jeasx",
    how: "Isomorphic JSX: the browser renders the same component as the server and saves in the background. Without JavaScript, the forms post to the server.",
    state: "server",
  },
  {
    id: "lit",
    name: "Lit",
    how: "A web component which renders in the browser. Until its bundle runs, the card is empty.",
    state: "browser",
  },
  {
    id: "htmx",
    name: "HTMX",
    how: "The same forms, sent in the background. The server answers with the new list only.",
    state: "server",
  },
  {
    id: "react",
    name: "React",
    how: "Rendered on the server, then hydrated. Clicks only work once React has loaded.",
    state: "browser",
  },
];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // The server lists depend on the cookies, so caches must not hand them to other visitors.
  reply.header("cache-control", "private, no-store");

  const lists = {
    jeasx: <ServerList way="jeasx" items={loadItems(request, "jeasx")} />,
    htmx: <ServerList way="htmx" items={loadItems(request, "htmx")} />,
    react: (
      <div data-root data-props={INITIAL}>
        {html(renderToString(createElement(ShoppingList, { initial: INITIAL })))}
      </div>
    ),
    lit: <shopping-list data-root />,
  };

  return (
    <Layout
      title="Same app, four ways"
      description="One shopping list built with Jeasx, Lit, HTMX and React, with the JavaScript and time to interactive of each measured side by side."
      css="/four-ways/index.css"
      script="/four-ways/index.js"
    >
      <h1 class="fw-title">
        Same app, <span>four ways</span>
      </h1>
      <p class="lead">
        One shopping list, built four times: with Jeasx, Lit, HTMX and React. All four share the
        same update function and the same styles. What differs is where the list lives and how much
        JavaScript it takes.
      </p>
      <p>
        Each card measures the JavaScript it downloaded and when it became usable. To see the
        difference, turn off JavaScript in your browser or throttle the network in the dev tools.
      </p>
      <div class="fw-grid">
        {WAYS.map((way) => (
          <section class="fw-card" id={way.id} data-way={way.id}>
            <h2>{way.name}</h2>
            <p class="fw-how">{way.how}</p>
            <dl class="fw-stats">
              <div>
                <dt>JavaScript</dt>
                <dd data-size>…</dd>
              </div>
              <div>
                <dt>Interactive</dt>
                <dd data-ready>…</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>{way.state}</dd>
              </div>
            </dl>
            {lists[way.id]}
          </section>
        ))}
      </div>
      <p>
        Reload the page: the Jeasx and HTMX lists keep your changes, as they live in a cookie on the
        server. The React and Lit lists start over, as their state only lives in the browser.
      </p>
    </Layout>
  );
}
