import isAuthorized from "../../basic-auth/isAuthorized";
import Layout from "../../Layout";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (!isAuthorized(request.headers["authorization"])) {
    reply.header("WWW-Authenticate", 'Basic realm="Restricted Area"');
    reply.status(401);
    return (
      <Layout title="Error 401">
        <section class="center">
          <h1>Error 401</h1>
          <p>You are not allowed to view this page!</p>
        </section>
      </Layout>
    );
  }
}
