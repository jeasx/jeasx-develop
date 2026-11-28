// The Lit template of the list, as a plain function. The element renders it in the browser
// ("./index.js"), and the server turns the very same template into HTML ("./renderToString.js"),
// so the list works without JavaScript. It imports lit-html only, which also loads in Node.
import { html } from "lit-html";
import { MAX_ITEMS, MAX_LENGTH } from "../shopping";

/**
 * @param {{
 *   items: import("../shopping").Item[],
 *   onSubmit?: (event: SubmitEvent) => void,
 *   each?: (items: any[], key: (item: any) => unknown, template: (item: any) => unknown) => unknown,
 * }} props
 *   - each: renders the items, e.g. with Lit's keyed repeat directive in the browser.
 */
export function listTemplate({
  items,
  onSubmit,
  each = (list, _key, template) => list.map(template),
}) {
  const done = items.filter((item) => item.done).length;
  return html`
    <form class="fw-list" method="post" action="/showdown/list" @submit=${onSubmit}>
      <input type="hidden" name="framework" value="lit" />
      <div class="fw-add">
        <input
          name="text"
          placeholder="Add an item"
          maxlength=${MAX_LENGTH}
          aria-label="New item"
          ?disabled=${items.length >= MAX_ITEMS}
        />
        <button name="add" value="1">Add</button>
      </div>
      <p class="fw-count">${done} of ${items.length} done</p>
      <ul>
        ${each(
          items,
          (item) => item.id,
          (item) => html`
            <li class=${item.done ? "fw-done" : ""}>
              <button
                name="toggle"
                value=${item.id}
                class="fw-check"
                aria-pressed=${String(item.done)}
              >
                ${item.text}
              </button>
              <button
                name="remove"
                value=${item.id}
                class="fw-remove"
                aria-label="Remove ${item.text}"
              >
                ×
              </button>
            </li>
          `,
        )}
      </ul>
      <button name="clear" value="1" class="fw-clear" ?disabled=${done === 0}>Clear done</button>
    </form>
  `;
}
