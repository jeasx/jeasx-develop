import Layout from "../Layout";
import { CAPACITY, REFILL_PER_SECOND } from "./bucket";

export default function () {
  return (
    <Layout
      title="Rate limiting with a token bucket"
      description="Protect an API with a token bucket in a guard, answering with 429 Too Many Requests and RateLimit headers."
      css="/rate-limit/index.css"
      script="/rate-limit/index.js"
    >
      <div class="sx">
        <h1>Rate limiting with a token bucket</h1>
        <p>
          A guard in <code>/rate-limit/api</code> runs before every route below it and gives each IP
          address a bucket of <strong>{CAPACITY} tokens</strong>. Every request takes one, and{" "}
          <strong>{REFILL_PER_SECOND} token per second</strong> flows back in. Short bursts pass,
          but a client sending faster than that runs dry and gets <code>429 Too Many Requests</code>{" "}
          with a <code>Retry-After</code> header, before the route even runs.
        </p>
        <p>
          Each response carries <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code> and{" "}
          <code>RateLimit-Reset</code> headers, which drive the bucket below. Fire a burst to empty
          it, then watch it refill.
        </p>
        <section class="sx-card">
          <header>
            <h2>
              <code>GET /rate-limit/api/quote</code>
            </h2>
            <span id="remaining" class="rl-remaining">
              {CAPACITY} / {CAPACITY} tokens
            </span>
          </header>
          <div id="bucket" class="rl-bucket" style={`--capacity: ${CAPACITY}`} aria-hidden="true">
            {Array.from({ length: CAPACITY }, () => (
              <i class="rl-token" data-full></i>
            ))}
          </div>
          <div class="rl-actions">
            <button type="button" data-burst="1">
              Send 1 request
            </button>
            <button type="button" data-burst="10">
              Burst of 10
            </button>
            <label>
              <input id="auto" type="checkbox" /> Every 0.5 s
            </label>
          </div>
          <ol id="log" class="rl-log" aria-live="polite"></ol>
        </section>
        <p class="rl-note">
          The buckets live in the memory of one server process. With several instances, keep them in
          a shared store like Redis, so all instances count together.
        </p>
      </div>
    </Layout>
  );
}
