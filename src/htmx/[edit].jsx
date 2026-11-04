import fields from "./fields";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  return (
    <form
      hx-post="./view"
      hx-swap="outerHTML"
      method="post"
      class="cte-card editing"
    >
      <input type="hidden" name="action" value="view" />
      <div class="cte-inputs">
        {fields.map(({ label, name, type, value }) => (
          <label>
            {label}
            <input
              // @ts-ignore
              type={type}
              name={name}
              value={body[name] ?? value}
            />
          </label>
        ))}
      </div>
      <div class="cte-actions">
        <button type="submit">✓ Save</button>
      </div>
    </form>
  );
}
