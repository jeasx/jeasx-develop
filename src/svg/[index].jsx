import Layout from "../Layout";
import { BarChart, LineChart, Sparkline } from "./charts";
import { CITIES, MONTHS } from "./data";

const format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // A repeated parameter arrives as array. No (known) city selected means all cities.
  const ids = [request.query["city"]].flat().filter((id) => typeof id === "string");
  const selected = CITIES.filter((city) => ids.includes(city.id));
  const cities = selected.length > 0 ? selected : CITIES;

  // The bar chart compares the yearly average of the same cities.
  const averages = cities.map(({ name, values }) => ({
    label: name,
    value: values.reduce((sum, value) => sum + value, 0) / values.length,
  }));
  const sortByWarmth = request.query["sort"] === "warmest";
  const bars = sortByWarmth ? averages.toSorted((a, b) => b.value - a.value) : averages;

  return (
    <Layout
      title="SVG charts rendered on the server"
      description="Render line charts, bar charts and sparklines as inline SVG with JSX on the server."
      css="/svg/index.css"
    >
      <h1>SVG charts rendered on the server</h1>
      <p class="lead">
        SVG is just markup, so JSX components can draw charts on the server: a few lines of math
        turn data into coordinates.
      </p>
      <p>
        The charts are part of the HTML, so they show up instantly, need no chart library in the
        browser, and work with JavaScript turned off. Tooltips use the SVG{" "}
        <code>&lt;title&gt;</code> element, and the hover effects are plain CSS.
      </p>

      <div class="charts">
        <h2>Line chart</h2>
        <figure class="chart-figure">
          <figcaption>
            Average temperature per month (°C, approximate long-term averages)
          </figcaption>
          {/* A plain form filters the cities: the server renders the chart again. */}
          <form method="get" class="legend">
            {CITIES.map((city) => (
              <label>
                <input
                  type="checkbox"
                  name="city"
                  value={city.id}
                  checked={cities.includes(city)}
                />
                <span class="swatch" style={`background: ${city.color}`}></span>
                {city.name}
              </label>
            ))}
            {sortByWarmth && <input type="hidden" name="sort" value="warmest" />}
            <button type="submit" class="btn-sm">
              Update chart
            </button>
          </form>
          <LineChart
            labels={MONTHS}
            series={cities}
            unit="°"
            title={`Average temperature per month in ${cities.map((city) => city.name).join(", ")}`}
          />
          <details>
            <summary>Show data as table</summary>
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th scope="col">City</th>
                    {MONTHS.map((month) => (
                      <th scope="col">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <tr>
                      <th scope="row">{city.name}</th>
                      {city.values.map((value) => (
                        <td class="number">{format.format(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </figure>

        <h2>Bar chart</h2>
        <figure class="chart-figure">
          <figcaption>
            Average temperature per year (°C) ·{" "}
            {sortByWarmth ? (
              <a href={withQuery(ids, false)}>show in original order</a>
            ) : (
              <a href={withQuery(ids, true)}>sort from warmest to coldest</a>
            )}
          </figcaption>
          <BarChart items={bars} color="var(--series-1)" title="Average temperature per year" />
        </figure>

        <h2>Sparklines</h2>
        <figure class="chart-figure">
          <figcaption>
            Small charts fit into a table cell. The dots mark the warmest and the coldest month.
          </figcaption>
          <table>
            <thead>
              <tr>
                <th scope="col">City</th>
                <th scope="col">Year</th>
                <th scope="col" class="number">
                  Coldest
                </th>
                <th scope="col" class="number">
                  Warmest
                </th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((city) => {
                const min = Math.min(...city.values);
                const max = Math.max(...city.values);
                return (
                  <tr>
                    <th scope="row">{city.name}</th>
                    <td>
                      <Sparkline
                        values={city.values}
                        color={city.color}
                        label={`Temperatures in ${city.name} from January to December`}
                      />
                    </td>
                    <td class="number">
                      {format.format(min)}° ({MONTHS[city.values.indexOf(min)]})
                    </td>
                    <td class="number">
                      {format.format(max)}° ({MONTHS[city.values.indexOf(max)]})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </figure>
      </div>
    </Layout>
  );
}

/**
 * Builds a link which keeps the selected cities and changes the sort order.
 *
 * @param {string[]} ids
 * @param {boolean} sortByWarmth
 */
function withQuery(ids, sortByWarmth) {
  const params = new URLSearchParams(ids.map((id) => ["city", id]));
  if (sortByWarmth) {
    params.set("sort", "warmest");
  }
  return `?${params}`;
}
