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
  const body = /** @type {Record<string, unknown>} */ (request.body || {});
  const posted = request.method === "POST";

  let result;
  let error;
  if (posted) {
    try {
      result = await convert(body);
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
  const chosen = (name, fallback) =>
    posted ? String(body[name]) : String(fallback);

  return (
    <Layout
      title="Upload and transform images with sharp"
      description="Upload a JPEG image and convert, resize and rotate it with sharp."
    >
      <h1>Upload and transform images with sharp</h1>
      <p>
        Choose a JPEG image and the server converts, crops, resizes and rotates
        it. The form is sent as <code>multipart/form-data</code>, so the route
        gets the file as a <code>Buffer</code> in <code>request.body</code>.
        Jeasx doesn't ship an image processor, so the conversion is done in
        userland with <a href="https://sharp.pixelplumbing.com">sharp</a>. The
        result is embedded as a <code>data:</code> URI, so your image is never
        stored.
      </p>
      <form method="post" enctype="multipart/form-data">
        <div class="row">
          <Select
            name="format"
            label="Format"
            options={FORMATS}
            value={chosen("format", "avif")}
          />
          <Select
            name="size"
            label="Size (pixels)"
            options={SIZES}
            value={chosen("size", 320)}
          />
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
          JPEG image (up to {MAX_UPLOAD_MB} MB)
          <input
            type="file"
            name="upload"
            accept=".jpg,.jpeg,image/jpeg"
            required
          />
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
                <td>JPEG</td>
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
                  {percent.format(result.result.bytes / result.original.bytes)}{" "}
                  of the upload)
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
