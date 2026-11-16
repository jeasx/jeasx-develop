import Layout from "../Layout";
import Gauge from "./Gauge";
import Strings from "./Strings";

export default function () {
  return (
    <Layout
      title="Guitar tuner with client-side JSX"
      description="A chromatic guitar tuner which listens to your microphone and renders its dial with JSX components in the browser."
      css="/guitar-tuner/index.css"
      script="/guitar-tuner/index.js"
    >
      <h1>Guitar tuner with client-side JSX</h1>
      <p class="lead">
        A chromatic tuner that listens to your microphone, built from plain JSX components which
        render on the server and in your browser.
      </p>
      <p>
        The server renders the resting dial, then the browser detects the pitch with the Web Audio
        API by autocorrelation and renders the very same components with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> many times per
        second. No audio leaves your device. Press a string to hear its reference tone repeatedly,
        press it again to stop.
      </p>
      <section class="tuner">
        <div id="display">
          <Gauge />
          <Strings />
        </div>
        {/* Live input level, drawn while listening; outside #display so renders don't reset it. */}
        <canvas class="wave" id="wave" aria-hidden="true"></canvas>
        {/* Both states are in the markup; the "on" class shows one of them. */}
        <button class="listen" type="button" id="listen">
          <span class="start">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
            </svg>
            Start tuning
          </span>
          <span class="stop">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2.5" />
            </svg>
            Stop
          </span>
        </button>
        <p class="hint" id="hint">
          Standard tuning E A D G B E, A4 = 440 Hz.
        </p>
      </section>
    </Layout>
  );
}
