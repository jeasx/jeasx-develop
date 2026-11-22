import Layout from "../Layout";
import Sheet from "./Sheet";
import { evaluate } from "./formula";

/**
 * @param {import("../types").RouteProps & { cells: Record<string, string> }} props
 */
export default function ({ cells }) {
  return (
    <Layout
      title="Spreadsheet"
      description="A spreadsheet whose formulas and JSX components run on the server and in the browser."
      css="/spreadsheet/index.css"
      script="/spreadsheet/index.js"
    >
      <h1>Spreadsheet</h1>
      <p class="lead">
        A tiny spreadsheet where the same code runs on the server and in your browser.
      </p>
      <p>
        The server calculates the sheet and renders it with JSX components. In your browser, the
        same formulas and components take over: while you type, only the cells whose values change
        are re-rendered with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>. Without
        JavaScript, press Enter and the server calculates the sheet instead.
      </p>
      <p>
        Change a cost, or try a formula like <code>=SUM(B2:B5)</code> or <code>=(B2+B3)/2</code>.
      </p>
      <Sheet cells={cells} values={evaluate(cells)} />
    </Layout>
  );
}
