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
        In this example, a <code>HouseKeeper</code> component wraps a third-party component it
        doesn't control. It removes all inline <code>style</code> attributes and rewrites{" "}
        <code>className</code> to <code>class</code>, without changing the third-party code. Use the
        link below to toggle it on and off.
      </p>
      <section class="center">
        {removeStyles ? (
          <HouseKeeper>
            <ThirdPartyComponent />
            <a href="?styles=on">Turn inline styles on</a>
          </HouseKeeper>
        ) : (
          <>
            <ThirdPartyComponent />
            <a href="?styles=off">Turn inline styles off</a>
          </>
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

function ThirdPartyComponent() {
  return (
    <div className="third-party" style="border: 4px dashed var(--mu-accent);">
      {["red", "green", "blue", "orange"].map((color) => (
        <>
          <span style={`background-color: ${color}`}>{color}</span>
          &nbsp;
        </>
      ))}
    </div>
  );
}
