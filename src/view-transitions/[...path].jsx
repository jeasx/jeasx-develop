import Layout from "../Layout";
import { PLANETS, planetStyles } from "./planets";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Only answer "/view-transitions/<slug>", not deeper paths like "/view-transitions/a/<slug>".
  const slug = /^\/view-transitions\/([^/]+)\/?$/.exec(request.path)?.[1];
  const index = PLANETS.findIndex((planet) => planet.slug === slug);
  if (index === -1) {
    return;
  }

  const planet = PLANETS[index];
  const previous = PLANETS[index - 1];
  const next = PLANETS[index + 1];
  const styles = planetStyles(planet);

  return (
    <Layout
      title={planet.name}
      description={`${planet.name}: ${planet.fact}`}
      css="/view-transitions/index.css"
    >
      <article class="center">
        <span class="planet planet-large" style={styles.image}></span>
        <h1>
          <span class="planet-name" style={styles.name}>
            {planet.name}
          </span>
        </h1>
        <p>{planet.fact}</p>
        <div class="row">
          <Fact label="Diameter" value={`${planet.diameter.toLocaleString("en-US")} km`} />
          <Fact label="Moons" value={planet.moons} />
          <Fact label="Distance from the sun" value={`${planet.distance} AU`} />
        </div>
      </article>
      {/* Links between planets transition too: the old planet fades out, the new one fades in. */}
      <nav class="planet-nav">
        {previous ? <a href={`../${previous.slug}`}>&laquo; {previous.name}</a> : <span />}
        <a href="..">Show all planets</a>
        {next ? <a href={`../${next.slug}`}>{next.name} &raquo;</a> : <span />}
      </nav>
    </Layout>
  );
}

function Fact({ label, value }) {
  return (
    <div class="col-12 col-md-4">
      <small>{label}</small>
      <br />
      <strong>{value}</strong>
    </div>
  );
}
