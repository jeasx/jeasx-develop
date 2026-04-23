import Layout from "../../Layout";

const BASIC_AUTH = `Basic ${Buffer.from("demo:demo").toString("base64")}`;

/**
 * @param {import("../../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const authorization = request.headers["authorization"];
  if (authorization !== BASIC_AUTH) {
    reply.header("WWW-Authenticate", 'Basic realm="Restricted Area');
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
