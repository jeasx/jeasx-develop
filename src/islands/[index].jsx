import Layout from "../Layout";
import Island from "./Island";

const TALKS = [
  {
    time: "09:00",
    title: "Keynote: HTML first, JavaScript later",
    speaker: "Ada Park",
  },
  {
    time: "10:15",
    title: "Streaming JSX from the edge",
    speaker: "Leo Brandt",
  },
  { time: "11:30", title: "One page, four frameworks", speaker: "Mina Osei" },
  {
    time: "14:00",
    title: "Hydration without the headache",
    speaker: "Tom Reyes",
  },
  {
    time: "15:30",
    title: "Panel: Do we still need SPAs?",
    speaker: "All speakers",
  },
];

/** The hydration strategies of "./Island.jsx" and the island on this page which uses each one. */
const STRATEGIES = [
  { value: "load", icon: "⚡", when: "right away", island: "Countdown", framework: "preact" },
  {
    value: "idle",
    icon: "☕",
    when: "when the browser has nothing else to do",
    island: "Rating",
    framework: "svelte",
  },
  {
    value: "visible",
    icon: "👀",
    when: "when the island scrolls into view",
    island: "Questions",
    framework: "react",
  },
  {
    value: "interaction",
    icon: "👆",
    when: "when you first point at or focus it",
    island: "Tickets",
    framework: "vue",
  },
  {
    value: "none",
    icon: "∅",
    when: "never, the island ships no JavaScript at all",
    island: "Schedule",
    framework: "react",
  },
];

const TICKETS = [
  { id: "student", name: "Student", price: 49 },
  { id: "regular", name: "Regular", price: 199 },
  { id: "workshop", name: "Regular + workshop", price: 349 },
];

const QUESTIONS = [
  {
    id: 1,
    text: "When is hydrating the whole page still the better choice?",
    votes: 12,
  },
  { id: 2, text: "How do islands share state with each other?", votes: 8 },
  { id: 3, text: "Does this work with view transitions?", votes: 3 },
];

export default function () {
  return (
    <Layout
      title="Islands with four frameworks"
      description="Render React, Preact, Vue and Svelte components on one page and hydrate each island on load, when idle, when visible or on interaction."
      css="/islands/index.css"
      script="/islands/index.js"
    >
      <h1 class="hero-title">
        Islands <span>with four frameworks</span>
      </h1>
      <p>
        This page is plain HTML rendered by Jeasx. It holds islands built with Preact, React, Vue
        and Svelte, and each framework renders its components on the server. A small loader script
        then decides, for each island, when to download the framework's bundle and hydrate it. Each
        island picks a strategy with its <code>hydrate</code> prop:
      </p>
      <ul class="strategies">
        {STRATEGIES.map(({ value, icon, when, island, framework }) => (
          <li data-framework={framework}>
            <span class="strategies-icon" aria-hidden="true">
              {icon}
            </span>
            <code>{value}</code>
            <span class="strategies-when">{when}</span>
            <small>
              {island} · {framework}
            </small>
          </li>
        ))}
      </ul>
      <p>Watch the badges, and open the network tab to see each bundle arrive.</p>
      <aside class="panel" aria-label="Hydration status">
        <ul class="panel-frameworks">
          {["preact", "react", "vue", "svelte"].map((framework) => (
            <li data-chip={framework}>
              <span class="panel-dot" />
              <strong>{framework}</strong>
              <small data-size>not loaded</small>
            </li>
          ))}
        </ul>
        <p class="panel-total" data-summary>
          No JavaScript loaded yet
        </p>
        <ol class="panel-timeline" data-timeline aria-label="Hydration timeline" />
      </aside>

      <article class="conf">
        <header class="conf-hero">
          <p class="conf-kicker">Hamburg · 12 March 2027</p>
          <h2>JSX Conf</h2>
          <Island
            framework="preact"
            component="Countdown"
            hydrate="load"
            props={{ target: "2027-03-12T09:00:00+01:00", now: Date.now() }}
          />
          <p class="conf-why">
            The countdown is above the fold and must tick at once, so it hydrates on{" "}
            <code>load</code>. Preact keeps that first bundle tiny.
          </p>
        </header>

        <section>
          <h3>Schedule</h3>
          <Island framework="react" component="Schedule" hydrate="none" props={{ talks: TALKS }} />
          <p class="conf-why">
            Written as a React component, but nothing on it is interactive. With{" "}
            <code>hydrate="none"</code>, React renders it on the server only and its code stays out
            of the browser.
          </p>
        </section>

        <div class="conf-grid">
          <section>
            <h3>Tickets</h3>
            <Island
              framework="vue"
              component="Tickets"
              hydrate="interaction"
              props={{ types: TICKETS }}
            />
            <p class="conf-why">
              Most visitors only look at the prices, so Vue loads on the first pointer or focus.
            </p>
          </section>
          <section>
            <h3>Last year</h3>
            <Island
              framework="svelte"
              component="Rating"
              hydrate="idle"
              props={{ votes: [2, 3, 14, 41, 87] }}
            />
            <p class="conf-why">
              Nice to have, not urgent: Svelte loads once the browser has nothing else to do.
            </p>
          </section>
        </div>

        <section class="conf-venue">
          <h3>Venue</h3>
          <p>
            The conference takes place in a former harbour warehouse with two stages, a quiet room
            and plenty of coffee. Doors open at 8:00. The venue is step-free and a short walk from
            the nearest train station.
          </p>
          <p>Scroll on to the panel questions: they only load React once you get there.</p>
        </section>

        <section>
          <h3>Ask the panel</h3>
          <Island
            framework="react"
            component="Questions"
            hydrate="visible"
            props={{ initial: QUESTIONS }}
          />
          <p class="conf-why">
            Far down the page, so React loads when the island scrolls into view. Visitors who never
            get here never download it.
          </p>
        </section>
      </article>
    </Layout>
  );
}
