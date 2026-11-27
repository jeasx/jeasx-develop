import Layout from "../Layout";
import { negotiate } from "./negotiate";
import { CITIES, OFFERS, toCsv } from "./cities";

// The answer depends on the Accept header, so caches must store one copy per header value.
const VARY = { vary: "accept" };

/**
 * One URL, many representations: the Accept header of the request picks the format.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  switch (negotiate(request.headers.accept, OFFERS)) {
    case "text/html":
      reply.headers(VARY);
      return <CitiesPage />;

    case "application/json":
      return Response.json(CITIES, { headers: VARY });

    case "text/csv":
      return new Response(toCsv(), {
        headers: { "content-type": "text/csv; charset=utf-8", ...VARY },
      });

    case "text/plain":
      return new Response(toText(), {
        headers: { "content-type": "text/plain; charset=utf-8", ...VARY },
      });

    default:
      // Nothing offered is acceptable: tell the client what is available.
      return new Response(`406 Not Acceptable\nAvailable types: ${OFFERS.join(", ")}\n`, {
        status: 406,
        headers: { "content-type": "text/plain; charset=utf-8", ...VARY },
      });
  }
}

function CitiesPage() {
  return (
    <Layout
      title="Cities"
      description="Average temperatures of four cities as HTML, JSON, CSV or plain text."
    >
      <h1>Cities</h1>
      <p class="center">
        Your browser asked for HTML.{" "}
        <a href="/response#content-negotiation">Try the other formats</a>.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">City</th>
            <th scope="col">Coldest month (°C)</th>
            <th scope="col">Warmest month (°C)</th>
          </tr>
        </thead>
        <tbody>
          {CITIES.map(({ name, coldest, warmest }) => (
            <tr>
              <td>{name}</td>
              <td>{coldest}</td>
              <td>{warmest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

function toText() {
  const rows = CITIES.map(
    ({ name, coldest, warmest }) =>
      `${name.padEnd(8)} ${String(coldest).padStart(5)} °C ${String(warmest).padStart(5)} °C`,
  );
  return rows.join("\n") + "\n";
}
