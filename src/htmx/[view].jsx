import fields from "./fields";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  return (
    <form hx-post="./edit" hx-swap="outerHTML" method="post" class="cte-card">
      <input type="hidden" name="action" value="edit" />
      <dl class="cte-fields">
        {fields.map(({ label, name }) => (
          <div>
            <dt>{label}</dt>
            <dd>{body[name] || <span class="cte-empty">empty</span>}</dd>
            {/* The values travel back with "Edit", so the server needs no storage. */}
            <input type="hidden" name={name} value={body[name]} />
          </div>
        ))}
      </dl>
      <div class="cte-actions">
        <button type="submit">✎ Edit</button>
      </div>
    </form>
  );
}
