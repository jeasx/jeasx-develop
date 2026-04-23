import Layout from "../Layout";
import Edit from "./[edit]";
import Time from "./[time]";
import View from "./[view]";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = request.body || { action: "edit" };
  return (
    <Layout
      title="HTMX and Jeasx - a perfect match"
      description="Jeasx integrates easily with HTMX"
      script="./index.js"
    >
      <h1>HTMX and Jeasx - a perfect match</h1>
      <p>
        Jeasx is the perfect match for <a href="https://htmx.org">HTMX</a> because it makes it easy
        to create routes that emit HTML fragments. This example works even without JavaScript.
      </p>
      {body["action"] === "edit" ? (
        <Edit request={request} reply={reply} />
      ) : (
        <View request={request} reply={reply} />
      )}
      <hr />
      The current server time is:{" "}
      <span hx-get="./time" hx-trigger="every 1s">
        <Time />
      </span>
    </Layout>
  );
}
