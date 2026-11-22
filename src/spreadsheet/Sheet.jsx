import { COLS, ROWS } from "./grid";
import Value from "./Value";

/**
 * The whole sheet as a plain form, so it works without JavaScript.
 * Rendered on the server by "./[index].jsx".
 *
 * @param {{ cells: Record<string, string>, values: Record<string, number | string> }} props
 */
export default function Sheet({ cells, values }) {
  return (
    <form class="sheet" method="post" action="/spreadsheet" autocomplete="off">
      <table>
        <tr>
          <th></th>
          {COLS.map((col) => (
            <th>{col}</th>
          ))}
        </tr>
        {ROWS.map((row) => (
          <tr>
            <th>{row}</th>
            {COLS.map((col) => (
              <td>
                <input name={col + row} value={cells[col + row] ?? ""} aria-label={col + row} />
                <Value cell={col + row} value={values[col + row]} />
              </td>
            ))}
          </tr>
        ))}
      </table>
      {/* Without JavaScript, Enter needs a submit button to send a form with several inputs.
          With JavaScript, the sheet is calculated while typing, so the button isn't shown. */}
      <noscript>
        <button type="submit" class="btn btn-primary">
          Calculate
        </button>
      </noscript>
    </form>
  );
}
