import Layout from "../Layout";

const LENGTH = 20;

export default function () {
  return (
    <Layout
      title="Password generator in the browser"
      description="Generate cryptographically secure passwords in the browser with JSX components rendered by jsx-async-runtime."
      css="/password-generator/index.css"
      script="/password-generator/index.js"
    >
      <h1>Password generator</h1>
      <p class="lead">
        Fresh, cryptographically secure passwords from <code>crypto.getRandomValues</code> —
        generated entirely in your browser, nothing ever leaves this page.
      </p>
      <p>
        The results are rendered with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>: a plain JSX
        component is serialized to HTML with <code>jsxToString</code> after every change, no
        framework, no virtual DOM, no hydration. Every password keeps one character from each
        enabled set, and moving a control rolls all five instantly.
      </p>
      <div class="vault">
        <svg
          class="vault-icon"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1.5" />
        </svg>
        <form id="password-form" class="vault-controls">
          <div class="length">
            <span class="length-label">
              Length <output for="length">{LENGTH}</output>
            </span>
            <input type="range" name="length" min="8" max="64" value={LENGTH} autocomplete="off" />
            <div class="ticks" aria-hidden="true">
              <span>8</span>
              <span>64</span>
            </div>
          </div>
          <fieldset class="chips">
            <legend class="sr-only">Character sets</legend>
            <label class="chip">
              <input type="checkbox" name="sets" value="lower" checked />
              abc
            </label>
            <label class="chip">
              <input type="checkbox" name="sets" value="upper" checked />
              ABC
            </label>
            <label class="chip">
              <input type="checkbox" name="sets" value="digits" checked />
              123
            </label>
            <label class="chip">
              <input type="checkbox" name="sets" value="symbols" checked />
              !@#
            </label>
            <button class="reroll" type="submit">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
                <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
                <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
                <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
              </svg>
              Roll
            </button>
          </fieldset>
        </form>
        <div id="passwords" aria-live="polite">
          <p class="empty-hint">
            Press <strong>Roll</strong> to generate five fresh passwords.
          </p>
        </div>
      </div>
    </Layout>
  );
}
