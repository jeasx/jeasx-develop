import { jsxToString } from "jsx-async-runtime";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catchErrors, ErrorBoundary } from "./ErrorBoundary";
import Parallel from "./Parallel";

/** @returns {Promise<JSX.Element>} */
async function Fails() {
  throw new Error("Boom");
}

/** @this {{ signal: AbortSignal }} */
async function Slow() {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 1000);
    this.signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(this.signal.reason);
    });
  });
  return <p>late</p>;
}

describe("ErrorBoundary", () => {
  it("renders the children if they succeed", async () => {
    const html = await jsxToString(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>a &amp; b</p>
      </ErrorBoundary>,
    );
    assert.equal(html, "<p>a &amp; b</p>");
  });

  it("renders the fallback if a child fails", async () => {
    const html = await jsxToString(
      <div>
        <ErrorBoundary fallback={<p>fallback</p>}>
          <p>never shown</p>
          <Fails />
        </ErrorBoundary>
      </div>,
    );
    assert.equal(html, "<div><p>fallback</p></div>");
  });

  it("passes the error to a fallback function", async () => {
    const html = await jsxToString(
      <ErrorBoundary
        fallback={({ error }) => <p>{error instanceof Error ? error.message : String(error)}</p>}
      >
        <Fails />
      </ErrorBoundary>,
    );
    assert.equal(html, "<p>Boom</p>");
  });

  it("retries before giving up", async () => {
    let calls = 0;
    const Flaky = async () => (++calls < 3 ? Promise.reject(new Error("again")) : <p>{calls}</p>);
    const html = await jsxToString(
      <ErrorBoundary retries={2}>
        <Flaky />
      </ErrorBoundary>,
    );
    assert.equal(html, "<p>3</p>");
  });

  it("aborts slow children after the timeout", async () => {
    const start = Date.now();
    const html = await jsxToString(
      <ErrorBoundary timeout={20} fallback={({ timedOut }) => <p>{String(timedOut)}</p>}>
        <Slow />
      </ErrorBoundary>,
    );
    assert.equal(html, "<p>true</p>");
    assert.ok(Date.now() - start < 500);
  });

  it("keeps the context of the caller", async () => {
    /** @this {{ user: string }} */
    function User() {
      return <p>{this.user}</p>;
    }
    const html = await catchErrors.call({ user: "Ada" }, <User />);
    assert.equal(await jsxToString(html), "<p>Ada</p>");
  });
});

describe("Parallel", () => {
  it("renders children at the same time and keeps their order", async () => {
    const wait = (ms, text) =>
      new Promise((resolve) => setTimeout(() => resolve(<i>{text}</i>), ms));
    const Slow = ({ ms, text }) => wait(ms, text);
    const start = Date.now();
    const html = await jsxToString(
      <Parallel>
        <Slow ms={60} text="a" />
        <Slow ms={10} text="b" />
        <Slow ms={60} text="c" />
      </Parallel>,
    );
    assert.equal(html, "<i>a</i><i>b</i><i>c</i>");
    assert.ok(Date.now() - start < 110);
  });
});
