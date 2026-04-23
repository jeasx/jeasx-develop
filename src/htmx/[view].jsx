import fields from "./fields";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  return (
    <form hx-post="./edit" hx-swap="outerHTML" method="post">
      <fieldset>
        <input type="hidden" name="action" value="edit" />
        {fields.map(({ label, name }) => (
          <div>
            {label}: <b>{body[name]}</b>
            <input type="hidden" name={name} value={body[name]} />
          </div>
        ))}
      </fieldset>
      <input type="submit" value="Edit" />
    </form>
  );
}
