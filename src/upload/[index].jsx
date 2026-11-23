import Layout from "../Layout";
import {
  convert,
  ConvertError,
  FORMATS,
  MAX_UPLOAD_MB,
  ROTATIONS,
  SIZES,
  STRATEGIES,
} from "./convert";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const bytes = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "kilobyte",
  maximumFractionDigits: 1,
});

/**
 * Shows the form and, after a POST, the converted image right below it.
 *
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const posted = request.method === "POST";
  let form = new FormData();
  let result;
  let error;
  if (posted) {
    try {
      form = await readForm(request);
      result = await convert(form);
    } catch (e) {
      if (!(e instanceof ConvertError)) {
        throw e;
      }
      error = e.message;
      reply.status(e.status);
      if (e.status === 503) {
        reply.header("retry-after", "10");
      }
    }
  }
  // The result contains the visitor's image, so caches must not keep it.
  if (posted) {
    reply.header("cache-control", "private, no-store");
  }

  // Keep the chosen options after a POST, so trying another one is quick.
  // A missing field (e.g. a request without the form) falls back to the default.
  const chosen = (name, fallback) => String(form.get(name) ?? fallback);

  return (
    <Layout
      title="Upload and transform images with sharp"
      description="Upload an image and convert, resize and rotate it with sharp."
      css="/upload/index.css"
    >
      <h1>Upload and transform images with sharp</h1>
      <p class="lead">
        Choose an image (e.g. JPEG, PNG, WebP, AVIF, GIF or TIFF) and the server converts, crops,
        resizes and rotates it.
      </p>
      <p>
        The form is sent as <code>multipart/form-data</code>, so the route reads it with{" "}
        <code>formData()</code> and gets the image as a <code>File</code>. Jeasx doesn't ship an image processor, so
        the conversion is done in userland with <a href="https://sharp.pixelplumbing.com">sharp</a>.
        The result is embedded as a <code>data:</code> URI, so your image is never stored.
      </p>
      <form method="post" enctype="multipart/form-data">
        <div class="row">
          <Select name="format" label="Format" options={FORMATS} value={chosen("format", "avif")} />
          <Select name="size" label="Size (pixels)" options={SIZES} value={chosen("size", 320)} />
          <Select
            name="strategy"
            label="Crop strategy"
            options={STRATEGIES}
            value={chosen("strategy", "entropy")}
          />
          <Select
            name="rotate"
            label="Rotation (degrees)"
            options={ROTATIONS}
            value={chosen("rotate", 0)}
          />
        </div>
        <label>
          Image (up to {MAX_UPLOAD_MB} MB)
          <input type="file" name="upload" accept="image/*" required />
        </label>
        <button class="btn btn-primary" type="submit">
          Convert image
        </button>
      </form>

      {error && (
        <article role="alert">
          <strong>Conversion failed:</strong> {error}
        </article>
      )}

      {result && (
        <article>
          <figure class="center">
            <img
              src={result.dataUri}
              width={result.result.width}
              height={result.result.height}
              alt="Your converted image"
            />
            <figcaption>
              <a href={result.dataUri} download={`converted.${result.format}`}>
                Download {result.format.toUpperCase()}
              </a>
            </figcaption>
          </figure>
          <table>
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Format</th>
                <th scope="col">Dimensions</th>
                <th scope="col">File size</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Upload</th>
                <td>{result.original.format.toUpperCase()}</td>
                <td>
                  {result.original.width} × {result.original.height}
                </td>
                <td>{bytes.format(result.original.bytes / 1000)}</td>
              </tr>
              <tr>
                <th scope="row">Result</th>
                <td>{result.format.toUpperCase()}</td>
                <td>
                  {result.result.width} × {result.result.height}
                  {result.rotate % 90 !== 0 && " (rotated, so the canvas grew)"}
                </td>
                <td>
                  {bytes.format(result.result.bytes / 1000)} (
                  {percent.format(result.result.bytes / result.original.bytes)} of the upload)
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      )}
    </Layout>
  );
}

/**
 * Reads the posted form with the Web FormData API (jeasx.config.js leaves the body unread).
 * Node reads no more than the Content-Length, so checking it first limits the memory used.
 *
 * @param {import("fastify").FastifyRequest} request
 */
async function readForm(request) {
  if (!(Number(request.headers["content-length"]) <= MAX_UPLOAD_MB * 1024 * 1024 + 64 * 1024)) {
    throw new ConvertError(
      413,
      `The image is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller one.`,
    );
  }
  try {
    const headers = { "content-type": String(request.headers["content-type"]) };
    return await new Response(/** @type {any} */ (request.raw), { headers }).formData();
  } catch {
    // Not a multipart/form-data body, so convert reports the missing fields.
    return new FormData();
  }
}

/**
 * @param {{ name: string, label: string, options: (string | number)[], value: string }} props
 */
function Select({ name, label, options, value }) {
  return (
    <label class="col-12 col-md-3">
      {label}
      <select name={name}>
        {options.map((option) => (
          <option selected={String(option) === value}>{option}</option>
        ))}
      </select>
    </label>
  );
}
