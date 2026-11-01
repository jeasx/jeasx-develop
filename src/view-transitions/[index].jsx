import Layout from "../Layout";
import { PLANETS, planetStyles } from "./planets";

export default function () {
  return (
    <Layout
      title="View transitions without JavaScript"
      description="Morph elements between server-rendered pages with cross-document view transitions."
      css="/view-transitions/index.css"
    >
      <h1>View transitions without JavaScript</h1>
      <p>
        Click a planet: its picture and name move and grow into the detail page, although the
        browser loads a new page from the server. This is a cross-document{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API">
          view transition
        </a>
        , turned on for all examples by a single rule in the global stylesheet:{" "}
        <code>@view-transition {"{ navigation: auto; }"}</code>.
      </p>
      <p>
        Elements with the same <code>view-transition-name</code> on the old and the new page are
        animated from one position and size to the other, everything else fades. Jeasx only has to
        render matching names on both pages, here taken from the slug of each planet. Browsers
        without support simply load the next page as usual.
      </p>
      <div class="row center">
        {PLANETS.map((planet) => {
          const styles = planetStyles(planet);
          return (
            <a href={planet.slug} class="col-6 col-md-3 planet-link">
              <article>
                <span class="planet" style={styles.image}></span>
                <strong class="planet-name" style={styles.name}>
                  {planet.name}
                </strong>
              </article>
            </a>
          );
        })}
      </div>
    </Layout>
  );
}
