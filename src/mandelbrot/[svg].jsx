import { html } from "jsx-async-runtime";
import { HEIGHT, WIDTH, parseView, render } from "./fractal";
import Picture from "./Picture";

/**
 * Renders the requested view in full resolution as a standalone SVG file.
 *
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const view = parseView(/** @type {Record<string, string>} */ (request.query));
  reply.type("image/svg+xml; charset=utf-8");
  // Shown in the browser, the filename is used when saving it from there.
  reply.header("content-disposition", 'inline; filename="mandelbrot.svg"');
  return (
    <>
      {html('<?xml version="1.0" encoding="UTF-8"?>')}
      <Picture
        paths={await render(view, { width: WIDTH, height: HEIGHT })}
        width={WIDTH}
        height={HEIGHT}
        label="Mandelbrot set"
      />
    </>
  );
}
