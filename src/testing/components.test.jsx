import { jsxToString } from "jsx-async-runtime";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Planets from "../negotiation/[planets]";
import { Greeting, Price, UserCard } from "./components";

describe("Greeting", () => {
  it("renders the name", async () => {
    const html = await jsxToString(<Greeting name="Ada" />);
    assert.equal(html, '<p class="greeting">Hello, Ada!</p>');
  });

  it("escapes markup in the name", async () => {
    const html = await jsxToString(<Greeting name="<script>alert(1)</script>" />);
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });
});

describe("Price", () => {
  it("uses US dollars without a context", async () => {
    const html = await jsxToString(<Price amount={1234.5} />);
    assert.equal(html, '<data value="1234.5">$1,234.50</data>');
  });

  it("reads locale and currency from 'this'", async () => {
    // jsxToString passes its "this" to all components, like Jeasx does for a request.
    const html = await jsxToString.call(
      { locale: "de-DE", currency: "EUR" },
      <Price amount={1234.5} />,
    );
    // Intl separates number and currency symbol with a non-breaking space, which \s matches.
    assert.match(html, /^<data value="1234.5">1\.234,50\s€<\/data>$/);
  });
});

describe("UserCard", () => {
  it("renders the loaded user", async () => {
    const loadUser = async (id) => ({ name: `User ${id}`, email: "user@example.com" });
    const html = await jsxToString(<UserCard id={7} loadUser={loadUser} />);
    assert.match(html, /<h3>User 7<\/h3>/);
    assert.match(html, /href="mailto:user@example.com"/);
  });

  it("renders a fallback if loading fails", async () => {
    const loadUser = async () => {
      throw new Error("offline");
    };
    const html = await jsxToString(<UserCard id={7} loadUser={loadUser} />);
    assert.match(html, /User 7 is unavailable/);
  });
});

describe("Route /negotiation/planets", () => {
  // A route is a function: call it with fake request and reply objects.
  const call = (accept) => {
    const headers = {};
    const reply = { headers: (values) => Object.assign(headers, values) };
    const request = { path: "/negotiation/planets", headers: { accept } };
    const context = { request, reply };
    return { response: Planets.call(context, { request, reply }), context, headers };
  };

  it("answers JSON requests with a Response", async () => {
    const { response } = call("application/json");
    assert.ok(response instanceof Response);
    assert.equal(response.headers.get("vary"), "accept");
    const planets = await response.json();
    assert.equal(planets.length, 8);
  });

  it("renders the HTML page with the layout", async () => {
    const { response, context, headers } = call("text/html");
    // The layout reads the request from "this", as the root guard puts it there.
    const html = await jsxToString.call(context, response);
    assert.match(html, /^<!DOCTYPE html>/);
    assert.match(html, /<td>Jupiter<\/td>/);
    assert.equal(headers["vary"], "accept");
  });

  it("answers unsupported types with 406", () => {
    const { response } = call("image/png");
    assert.equal(response.status, 406);
  });
});
