// Turns a Lit template result into HTML on the server. A minimal serializer for what
// "./template.js" uses: text and attribute values (quoted or not), nested templates and arrays,
// boolean attributes (?name=) and event listeners (@name=, left out). Lit's own SSR (@lit-labs/ssr)
// covers all of Lit, but renders into Shadow DOM and needs hydration support in the browser.

/** @param {unknown} value */
function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

/**
 * @param {unknown} value A template result, an array of them, or a value to escape.
 * @returns {string}
 */
export function renderToString(value) {
  if (value === null || value === undefined || value === false) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map(renderToString).join("");
  }
  if (typeof value === "object" && "strings" in value && "values" in value) {
    const { strings, values } = /** @type {{ strings: string[], values: unknown[] }} */ (value);
    let html = strings[0];
    values.forEach((part, i) => {
      // A binding with a prefix, like "?disabled=" or "@submit=", at the end of the string.
      const binding = /\s([?@.])([\w:-]+)=$/.exec(html);
      if (binding) {
        html = html.slice(0, binding.index);
        if (binding[1] === "?" && part) {
          html += ` ${binding[2]}`;
        }
      } else if (/\s[\w:-]+=$/.test(html)) {
        // Lit allows unquoted attribute values (class=${...}), HTML needs quotes for any value.
        html += `"${renderToString(part)}"`;
      } else {
        html += renderToString(part);
      }
      html += strings[i + 1];
    });
    return html;
  }
  return escape(value);
}
