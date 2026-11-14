import { jsxToString } from "jsx-async-runtime";
import { render } from "../fractal";
import Picture, { Paths } from "../Picture";

/**
 * A Web Worker that renders one part of the image per message. It runs the same
 * fractal.js and Picture.jsx as the server, and jsx-async-runtime turns the
 * component into markup right here, off the main thread.
 *
 * Message: `{ view, size: { width, height, top?, rows? }, props? }`
 * Answer:  the markup as string. A whole picture, or for a strip (`rows` given) a group
 * moved to its place, which the page puts into one shared SVG.
 */
self.addEventListener("message", async ({ data: { view, size, props } }) => {
  const paths = await render(view, { ...size, breakAfter: Infinity });
  postMessage(
    await jsxToString(
      size.rows ? (
        <g transform={`translate(0 ${size.top})`}>
          <Paths paths={paths} />
        </g>
      ) : (
        <Picture {...props} paths={paths} width={size.width} height={size.height} />
      ),
    ),
  );
});
