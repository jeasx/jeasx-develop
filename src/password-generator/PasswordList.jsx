/** Renders the freshly generated passwords: traffic light, the password itself and a copy icon. */
export default function PasswordList({ passwords, length, alphabetSize }) {
  const entropy = Math.log2(alphabetSize) * length;
  const level = lightLevel(entropy);
  return (
    <ul class="passwords" aria-live="polite">
      {passwords.map((password) => (
        <li>
          <button
            class="password-row"
            type="button"
            data-copy={password}
            aria-label="Click to copy the password"
          >
            <span class={`lights lights-${level}`} aria-hidden="true">
              <span class="bulb red" />
              <span class="bulb yellow" />
              <span class="bulb green" />
            </span>
            <code class="pin">{colorize(password)}</code>
            <span class="copy-hint" aria-hidden="true">
              <svg
                class="icon-copy"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <svg
                class="icon-check"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </button>
        </li>
      ))}
      <li class="entropy-note">
        ~{Math.round(entropy)} bits of entropy · {alphabetSize} possible characters · {length}{" "}
        positions
      </li>
    </ul>
  );
}

/** Colors digits and symbols differently, so the mix is visible at a glance. */
function colorize(password) {
  return [...password].map((char) => {
    const kind = /\d/.test(char) ? "digit" : /[a-zA-Z]/.test(char) ? "alpha" : "symbol";
    return <span class={kind}>{char}</span>;
  });
}

/** Maps entropy to the traffic light: 0 = red, 1 = yellow, 2 = green. */
function lightLevel(entropy) {
  if (entropy < 40) {
    return 0;
  }
  if (entropy < 70) {
    return 1;
  }
  return 2;
}
