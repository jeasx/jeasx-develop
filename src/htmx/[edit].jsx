import fields from "./fields";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = request.body || {};

  return (
    <form hx-post="./view" hx-swap="outerHTML" method="post">
      <input type="hidden" name="action" value="view" />
      {fields.map(({ label, name, type, value }) => (
        <label>
          {label}:
          <input
            // @ts-ignore
            type={type}
            name={name}
            value={body[name] ?? value}
          />
        </label>
      ))}
      <input type="submit" value="Submit" />
    </form>
  );
}
