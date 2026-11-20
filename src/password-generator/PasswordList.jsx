/** Renders the freshly generated passwords, with a strength estimate for each. */
export default function PasswordList({ passwords, length, alphabetSize }) {
  const entropy = Math.log2(alphabetSize) * length;
  return (
    <ul class="passwords" aria-live="polite">
      {passwords.map((password) => (
        <li class="password-row">
          <code class="pin">{colorize(password)}</code>
          <span class={`strength ${strength(entropy)}`}>{strength(entropy)}</span>
          <button class="copy" type="button" data-copy={password} aria-label="Copy password">
            Copy
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

function strength(entropy) {
  if (entropy < 40) {
    return "weak";
  }
  if (entropy < 70) {
    return "good";
  }
  if (entropy < 100) {
    return "strong";
  }
  return "overkill";
}
