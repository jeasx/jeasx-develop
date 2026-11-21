import type { Errors } from "../domain/types";

/**
 * Lists all errors at the top, each a label for its field: clicking one focuses the field,
 * without JavaScript and without leaving the page (a link would reload it via <base>).
 */
export default function ErrorSummary({ errors }: { errors: Errors }) {
  const entries = Object.entries(errors);
  return (
    <div id="error-summary" role="alert" tabindex="-1" hidden={entries.length === 0}>
      {entries.length > 0 && (
        <>
          <strong>
            {entries.length === 1 ? "One thing needs" : `${entries.length} things need`} your
            attention
          </strong>
          <ul>
            {entries.map(([name, message]) => (
              <li>
                <label for={name}>{message}</label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
