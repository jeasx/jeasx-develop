import isCrossSite, { crossSiteResponse } from "../../@helpers/crossSite";
import isAuthorized from "../../basic-auth/isAuthorized";
import Layout from "../../Layout";

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Browsers send remembered Basic Auth credentials along with forms from other sites too.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }
  if (!isAuthorized(request.headers["authorization"])) {
    reply.header("WWW-Authenticate", 'Basic realm="Restricted Area"');
    reply.status(401);
    return (
      <Layout title="Error 401">
        <section class="center">
          <h1>Error 401</h1>
          <p>Please sign in to write a new post.</p>
          <p>
            <a href="">Reload the page</a> and sign in with username "demo" and password "demo".
          </p>
        </section>
      </Layout>
    );
  }
}
