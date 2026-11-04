import { html, isJsxNode, jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const removeStyles = request.query["styles"] === "off";

  return (
    <Layout
      title="Intercept and modify JSX at runtime"
      description="Override jsxToString to modify the markup of existing JSX components."
      css="/interceptor/index.css"
    >
      <h1>Intercept and modify JSX at runtime</h1>
      <p>
        The underlying <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>{" "}
        lets you intercept the rendering of JSX elements, so you can modify or replace existing
        markup.
      </p>
      <p>
        Every JSX element is turned into HTML by calling <code>this.jsxToString</code>. A component
        can create a child context with <code>Object.create(this)</code>, assign its own{" "}
        <code>jsxToString</code> there and render its children with it. The override sees every
        element before it becomes HTML, so it can change props, swap tags or drop elements entirely.
        Because the override only lives on the child context, everything rendered outside of the
        component stays untouched.
      </p>
      <p>
        In this example, a <code>HouseKeeper</code> component wraps a weather widget from a
        third-party library. The widget ships with its own look in inline <code>style</code>{" "}
        attributes and uses React's <code>className</code>. <code>HouseKeeper</code> removes all
        inline styles and rewrites <code>className</code> to <code>class</code>, so the stylesheet
        of this site takes over, without changing the third-party code.
      </p>
      <section class="stage">
        <p class="toggle">
          <a href="?styles=on" role="button" aria-disabled={removeStyles ? "false" : "true"}>
            Vendor styles
          </a>
          <a href="?styles=off" role="button" aria-disabled={removeStyles ? "true" : "false"}>
            Site styles
          </a>
        </p>
        {removeStyles ? (
          <HouseKeeper>
            <WeatherWidget />
          </HouseKeeper>
        ) : (
          <WeatherWidget />
        )}
      </section>
    </Layout>
  );
}

/**
 * Renders its children without inline styles.
 * The override lives on a child context, so markup outside of HouseKeeper stays untouched.
 *
 * @this {import("../types").ThisContext}
 */
async function HouseKeeper({ children }) {
  const context = Object.create(this);
  context.jsxToString = (jsxElement) => {
    // The override also receives text, arrays etc., so check for elements first.
    if (isJsxNode(jsxElement) && jsxElement.props) {
      // Rewrite className to class and delete all inline styles
      // on a copy, so the original element stays untouched.
      const { className, style, ...props } = jsxElement.props;
      if (className !== undefined || style !== undefined) {
        props.class ??= className;
        return jsxToString.call(context, { ...jsxElement, props });
      }
    }
    return jsxToString.call(context, jsxElement);
  };
  return html(await jsxToString.call(context, <>{children}</>));
}

const FORECAST = [
  { day: "Mon", icon: "☀️", high: 24, low: 14 },
  { day: "Tue", icon: "⛅", high: 21, low: 13 },
  { day: "Wed", icon: "🌧️", high: 17, low: 11 },
  { day: "Thu", icon: "⛈️", high: 16, low: 10 },
  { day: "Fri", icon: "🌤️", high: 22, low: 12 },
];

/**
 * Stands in for a component from a library you don't control:
 * it hard-codes its look with inline styles and uses React's "className".
 */
function WeatherWidget() {
  return (
    <div
      className="weather"
      style="width: 100%; max-width: 26rem; padding: 1.5rem; border-radius: 1.5rem; color: #fff; font-family: system-ui, sans-serif; background: linear-gradient(160deg, #38bdf8 0%, #6366f1 55%, #a855f7 100%); box-shadow: 0 20px 40px -12px rgb(99 102 241 / 0.6);"
    >
      <div
        className="weather-now"
        style="display: flex; align-items: center; justify-content: space-between;"
      >
        <div>
          <div
            className="weather-place"
            style="font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.85;"
          >
            Hamburg
          </div>
          <div className="weather-temp" style="font-size: 4rem; font-weight: 200; line-height: 1;">
            19°
          </div>
          <div className="weather-summary" style="opacity: 0.9;">
            Partly cloudy · feels like 17°
          </div>
        </div>
        <div
          className="weather-icon"
          style="font-size: 4.5rem; filter: drop-shadow(0 8px 12px rgb(0 0 0 / 0.25));"
        >
          ⛅
        </div>
      </div>
      <ul
        className="weather-forecast"
        style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin: 1.5rem 0 0; padding: 0;"
      >
        {FORECAST.map(({ day, icon, high, low }) => (
          <li
            className="weather-day"
            style="list-style: none; padding: 0.6rem 0; border-radius: 0.9rem; text-align: center; background: rgb(255 255 255 / 0.18); backdrop-filter: blur(6px);"
          >
            <div style="font-size: 0.75rem; font-weight: 600;">{day}</div>
            <div style="font-size: 1.5rem; margin: 0.25rem 0;">{icon}</div>
            <div style="font-size: 0.8rem;">
              {high}° <span style="opacity: 0.65;">{low}°</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
