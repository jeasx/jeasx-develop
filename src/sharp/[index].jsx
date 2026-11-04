import Layout from "../Layout";
import Image from "./Image";
import { placeholder } from "./placeholder";

/** Public domain photos from the NASA Image and Video Library (images.nasa.gov). */
const IMAGES = [
  {
    src: "/images/saturn.jpg",
    width: 400,
    height: 267,
    title: "Saturn, seen by Cassini in 2016",
    credit: "https://images.nasa.gov/details/PIA21046",
  },
  {
    src: "/images/blue-marble.jpg",
    width: 400,
    height: 400,
    title: "The Blue Marble, seen by Apollo 17 in 1972",
    credit: "https://images.nasa.gov/details/as17-148-22727",
  },
  {
    src: "/images/earthrise.jpg",
    width: 400,
    height: 600,
    title: "Earthrise, seen by Apollo 8 in 1968",
    credit: "https://images.nasa.gov/details/as08-14-2383",
  },
];

/** Sharp's crop strategies: "entropy" and "attention" look at the content of the image. */
const STRATEGIES = {
  entropy: "focus on the most detailed area",
  attention: "focus on skin tones, bright colors and contrast",
  centre: "always cut out the middle",
};

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const query = /** @type {Record<string, string | undefined>} */ (
    request.query
  );
  const position = Object.hasOwn(STRATEGIES, query["crop"] ?? "")
    ? query["crop"]
    : "entropy";
  const showPlaceholders = query["placeholders"] === "only";

  // Placeholders are tiny, so all of them are created in parallel before rendering.
  const images = await Promise.all(
    IMAGES.map(async (image) => ({
      ...image,
      placeholder: await placeholder({ ...image, position }),
    })),
  );

  return (
    <Layout
      title="Scale images with sharp"
      description="Crop, resize and convert images on the fly with sharp, with blurred placeholders inlined into the HTML."
      css="/sharp/index.css"
    >
      <h1>Scale images with sharp</h1>
      <p>
        With the <a href="https://sharp.pixelplumbing.com">sharp</a> library,
        you can build an image component and converter in userland. The images
        below are cropped, resized and converted to AVIF or WebP on the fly,
        depending on what your browser accepts. The image converter is also used
        in the <a href="/products">products</a> example.
      </p>
      <p>
        Each image starts as a blurred placeholder: a 24 pixel version, inlined
        into the HTML as <code>data:</code> URI of a few hundred bytes. It shows
        up instantly and keeps the layout stable, until the full image has
        loaded and covers it. No JavaScript is involved.
      </p>

      <nav class="strategies" aria-label="Crop strategy">
        {Object.entries(STRATEGIES).map(([name, description]) => (
          <a
            href={`?crop=${name}${showPlaceholders ? "&placeholders=only" : ""}`}
            title={description}
            aria-current={name === position ? "true" : undefined}
          >
            {name}
          </a>
        ))}
        <span aria-hidden="true">·</span>
        <a
          href={`?crop=${position}${showPlaceholders ? "" : "&placeholders=only"}`}
        >
          {showPlaceholders ? "show full images" : "show placeholders only"}
        </a>
      </nav>
      <p class="center">
        <small>
          Crop strategy <strong>{position}</strong>: {STRATEGIES[position]}.
        </small>
      </p>

      <section class="gallery">
        {images.map(
          ({ src, width, height, title, credit, placeholder }, index) => (
            <figure>
              {showPlaceholders ? (
                <div
                  class="placeholder-only"
                  style={`background-image: url(${placeholder}); --ratio: ${width} / ${height}`}
                  role="img"
                  aria-label={`Blurred placeholder: ${title}`}
                ></div>
              ) : (
                <Image
                  class="blur-up"
                  style={`background-image: url(${placeholder})`}
                  src={src}
                  width={width}
                  height={height}
                  position={position}
                  alt={title}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              )}
              <figcaption>
                <span>
                  {title} (<a href={credit}>NASA, public domain</a>)
                </span>
                <span>
                  {width} × {height} pixels
                </span>
                <span>
                  placeholder: {Math.round((placeholder.length * 3) / 4)} bytes
                </span>
              </figcaption>
            </figure>
          ),
        )}
      </section>
    </Layout>
  );
}
