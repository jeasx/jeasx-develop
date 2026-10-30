import { isJsxNode, jsxToString } from "jsx-async-runtime";
import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const removeStyles = request.query["styles"] === "off";

  return (
    <Layout
      title="Override JSX renderer to modify markup"
      description="Overriding #jsxToString lets you modify existing JSX components"
    >
      <h1>Intercept and modify JSX at runtime</h1>
      <p>
        The underlying <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>{" "}
        allows you to intercept the rendering of JSX elements. This allows you to modify or replace
        existing markup.
      </p>
      <section class="center">
        {removeStyles ? (
          <HouseKeeper>
            <ThirdPartyComponent />
            <a href="?styles=on"> Turn inline styles on</a>
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

function HouseKeeper({ children }) {
  this.jsxToString = (jsxElement) => {
    // The override also receives text, arrays etc., so check for elements first.
    if (isJsxNode(jsxElement) && jsxElement.props) {
      // Rewrite className to class and delete all inline styles
      // on a copy, so the original element stays untouched.
      const { className, style, ...props } = jsxElement.props;
      if (className !== undefined || style !== undefined) {
        props.class ??= className;
        return jsxToString.call(this, { ...jsxElement, props });
      }
    }
    return jsxToString.call(this, jsxElement);
  };
  return <>{children}</>;
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
