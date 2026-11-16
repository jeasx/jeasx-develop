import Layout from "../Layout";
import JokePicker from "./JokePicker";
import { pick } from "./jokes";
import { INITIAL, clamp, createReduce } from "./state";

const reduce = createReduce(pick);

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  // A JSON body can also be a number or string, which the reducer can't handle.
  const body = /** @type {Record<string, unknown>} */ (
    request.body && typeof request.body === "object" ? request.body : {}
  );
  // Without JavaScript, the counter travels in a hidden form field.
  const { counter, category, jokes } = await reduce(
    { ...INITIAL, counter: clamp(body["counter"]) },
    body,
  );

  return (
    <Layout
      title="Forms with and without JavaScript"
      description="Tell jokes with a form: rendered on the server, then the same JSX component runs in the browser."
      css="/jokes/index.css"
      script="/jokes/index.js"
    >
      <div class="jokes">
        <h1>Forms with and without JavaScript</h1>
        <p class="lead">
          A joke picker rendered by the same reducer and JSX component on the server and in the
          browser, which only fetches new jokes from the server.
        </p>
        <p>
          The server renders the first page, after that the browser handles every button. Without
          JavaScript, every button submits a plain HTML form, and the number of jokes is passed
          along in a hidden form field. The punchlines are revealed with a native{" "}
          <code>&lt;details&gt;</code> element.
        </p>
        <JokePicker counter={counter} category={category} jokes={jokes} />
      </div>
    </Layout>
  );
}
