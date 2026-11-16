import Layout from "../Layout";
import Lottery from "./Lottery";

/**
 * @param {import("./state").State} props
 */
export default function ({ numbers, number, delta, submit }) {
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
        <p class="lead">
          Pick six numbers, then reveal the draw. The server renders the first page. After that, the
          browser handles every click with the same reducer and JSX component, so no request is
          needed.
        </p>
        <p>
          Without JavaScript, every click submits a plain HTML form and the server renders the
          updated page.
        </p>
        <Lottery numbers={numbers} number={number} delta={delta} submit={submit} />
      </div>
    </Layout>
  );
}
