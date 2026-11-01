import Layout from "../Layout";
import { negotiate } from "./negotiate";
import { OFFERS, PLANETS } from "./planets";

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
      return <PlanetsPage />;

    case "application/json":
      return Response.json(PLANETS, { headers: VARY });

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

function PlanetsPage() {
  return (
    <Layout
      title="Planets"
      description="The planets of our solar system as HTML, JSON, CSV or plain text."
    >
      <h1>Planets</h1>
      <p class="center">
        Your browser asked for HTML. <a href="/negotiation">Try the other formats</a>.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Planet</th>
            <th scope="col">Diameter (km)</th>
            <th scope="col">Moons</th>
          </tr>
        </thead>
        <tbody>
          {PLANETS.map(({ name, diameter, moons }) => (
            <tr>
              <td>{name}</td>
              <td>{diameter.toLocaleString("en-US")}</td>
              <td>{moons}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

function toCsv() {
  const rows = PLANETS.map(({ name, diameter, moons }) => [name, diameter, moons].join(","));
  return ["name,diameter,moons", ...rows].join("\n") + "\n";
}

function toText() {
  const rows = PLANETS.map(
    ({ name, diameter, moons }) =>
      `${name.padEnd(8)} ${String(diameter).padStart(8)} km ${String(moons).padStart(4)} moons`,
  );
  return rows.join("\n") + "\n";
}
