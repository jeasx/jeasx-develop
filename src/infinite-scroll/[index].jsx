import Layout from "../Layout";
import { Releases, toPage } from "./releases";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // A reload (or a visit without JavaScript) shows all pages up to the requested one,
  // so the visitor doesn't lose the releases already scrolled through.
  const page = toPage(request.query["page"]);

  return (
    <Layout
      title="Infinite scroll with HTMX and async generators"
      description="Load more rows while scrolling with HTMX, streamed by an async generator."
      script="/infinite-scroll/index.js"
    >
      <h1>Infinite scroll with HTMX</h1>
      <p>
        Scroll down: as soon as the last row comes into view, HTMX fetches the next page from the
        server and puts it in its place. The rows come from an <code>async function*</code>, which
        loads one page after another from a slow API and streams every row as soon as it is ready.
      </p>
      <p>
        Without JavaScript, the "Load more releases" link reloads the page with one more page. As
        the address is updated while scrolling, a reload keeps all releases loaded so far.
      </p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Release</th>
            <th>Date</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          <Releases from={1} to={page} />
        </tbody>
      </table>
    </Layout>
  );
}
