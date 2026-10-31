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
      description="Edit a form in place with HTMX and server-rendered HTML fragments."
      script="/htmx/index.js"
    >
      <h1>HTMX and Jeasx - a perfect match</h1>
      <p>
        Jeasx is a perfect match for <a href="https://htmx.org">HTMX</a>, as every route can return
        an HTML fragment. Click "Submit" and "Edit" to swap the form in place. Without JavaScript,
        the same forms reload the whole page.
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
