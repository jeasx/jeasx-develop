import { html, isJsxNode, jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const removeStyles = request.query["styles"] === "off";

  return (
    <Layout
      title="Override JSX renderer to modify markup"
      description="Override jsxToString to modify the markup of existing JSX components."
    >
      <h1>Intercept and modify JSX at runtime</h1>
      <p>
        The underlying <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>{" "}
        lets you intercept the rendering of JSX elements, so you can modify or replace existing
        markup.
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
