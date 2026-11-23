import formBody from "../@helpers/formBody";
import Layout from "../Layout";
import Lottery from "./Lottery";
import { INITIAL, isValidNumber, reduce } from "./state";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const body = formBody(request);
  const { numbers, number, revealed } = reduce(
    { ...INITIAL, numbers: parseNumbers(body["numbers"]) },
    body,
  );

  return (
    <Layout
      title="Lottery"
      description="Pick six numbers: rendered on the server, then the same JSX component runs in the browser."
      css="/lottery/index.css"
      script="/lottery/index.js"
    >
      <div class="lottery">
        <h1>
          Lottery <span class="lottery-badge">6 out of 49</span>
        </h1>
        <p class="lead">Pick six numbers, then reveal the draw.</p>
        <p>
          The server renders the first page. After that, the browser handles every click with the
          same reducer and JSX component, so no request is needed. Without JavaScript, every click
          submits a plain HTML form and the server renders the updated page.
        </p>
        <Lottery numbers={numbers} number={number} revealed={revealed} />
      </div>
    </Layout>
  );
}

/**
 * Parses the submitted numbers; returns an empty list for invalid input.
 *
 * @param {unknown} value
 * @returns {number[]}
 */
function parseNumbers(value) {
  try {
    const numbers = JSON.parse(String(value));
    return Array.isArray(numbers) ? [...new Set(numbers.filter(isValidNumber))].slice(0, 6) : [];
  } catch {
    return [];
  }
}
