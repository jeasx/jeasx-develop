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
      title="Use HTMX with Jeasx"
      description="Edit a form in place with HTMX and server-rendered HTML fragments."
      css="/htmx/index.css"
      script="/htmx/index.js"
    >
      <div class="cte">
        <h1>Use HTMX with Jeasx</h1>
        <p>
          Jeasx is a perfect match for <a href="https://four.htmx.org">HTMX</a>,
          as every route can return an HTML fragment. Click "Save" to see your
          entries and "Edit" to change them again: HTMX swaps only the form,
          while the server time below updates itself every second. Without
          JavaScript, the same forms reload the whole page.
        </p>
        {body["action"] === "edit" ? (
          <Edit request={request} reply={reply} />
        ) : (
          <View request={request} reply={reply} />
        )}
        <p class="cte-time">
          Current server time
          <output hx-get="./time" hx-trigger="every 1s">
            <Time />
          </output>
        </p>
      </div>
    </Layout>
  );
}
