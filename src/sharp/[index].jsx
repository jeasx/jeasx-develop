import Layout from "../Layout";
import Image from "./Image";
import { cropArea } from "./cropArea";
import { placeholder } from "./placeholder";

/**
 * CC0 photos from Wikimedia Commons. All of them are landscape photos with the subject off
 * the middle, so cutting out a portrait shows how differently the strategies decide.
 */
const IMAGES = [
  {
    src: "/images/beach.jpg",
    width: 300,
    height: 450,
    title: "Child on the beach",
    hint: "The child in red stands at the right edge: centre loses them.",
    author: "Danielle MacInnes",
    credit:
      "https://commons.wikimedia.org/wiki/File:Child_on_the_beach_(Unsplash).jpg",
  },
  {
    src: "/images/barn.jpg",
    width: 300,
    height: 450,
    title: "Barn in Färlev",
    hint: "Only entropy finds the barn, attention goes for the bright sky.",
    author: "W.carter",
    credit: "https://commons.wikimedia.org/wiki/File:Barn_in_F%C3%A4rlev_2.jpg",
  },
  {
    src: "/images/sailboat.jpg",
    width: 300,
    height: 450,
    title: "Sailboat from above",
    hint: "The waves are full of detail, so entropy misses the boat. Attention finds it.",
    author: "Lance Asper",
    credit:
      "https://commons.wikimedia.org/wiki/File:Lost_at_Sea_(Unsplash).jpg",
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

  // Placeholders and crop areas are cached, so all of them are created in parallel.
  const images = await Promise.all(
    IMAGES.map(async (image) => ({
      ...image,
      placeholder: await placeholder({ ...image, position }),
      crop: await cropArea({ ...image, position }),
    })),
  );

  /** @param {{ crop?: string, placeholders?: boolean }} params */
  const link = ({ crop = position, placeholders = showPlaceholders }) =>
    `?crop=${crop}${placeholders ? "&placeholders=only" : ""}`;

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

      <article class="controls">
        <div>
          <span class="controls-label">Crop strategy</span>
          <nav role="group" aria-label="Crop strategy">
            {Object.keys(STRATEGIES).map((name) => (
              <a
                class={name === position ? "btn btn-primary" : "btn secondary"}
                href={link({ crop: name })}
                aria-current={name === position ? "page" : undefined}
              >
                {name}
              </a>
            ))}
          </nav>
          <small>{STRATEGIES[position]}</small>
        </div>
        <a
          class="toggle"
          href={link({ placeholders: !showPlaceholders })}
          role="switch"
          aria-checked={showPlaceholders ? "true" : "false"}
        >
          Placeholders only
        </a>
      </article>

      <p class="center">
        <small>
          The originals are landscape photos, cut to portraits. The frame on
          each original shows which part sharp keeps.
        </small>
      </p>

      <section class="gallery">
        {images.map(
          (
            {
              src,
              width,
              height,
              title,
              hint,
              author,
              credit,
              placeholder,
              crop,
            },
            index,
          ) => (
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
              <div class="original">
                <Image
                  src={src}
                  width={300}
                  height={Math.round(
                    (300 * crop.originalHeight) / crop.originalWidth,
                  )}
                  alt=""
                  loading="lazy"
                />
                <span
                  class="crop-frame"
                  style={`left: ${+(crop.left * 100).toFixed(2)}%; top: ${+(crop.top * 100).toFixed(2)}%; width: ${+(crop.width * 100).toFixed(2)}%; height: ${+(crop.height * 100).toFixed(2)}%`}
                ></span>
              </div>
              <figcaption>
                <p>{hint}</p>
                <small>
                  {title} by <a href={credit}>{author}</a> (CC0) · {width} ×{" "}
                  {height} px · placeholder{" "}
                  {Math.round((placeholder.length * 3) / 4)} bytes
                </small>
              </figcaption>
            </figure>
          ),
        )}
      </section>
    </Layout>
  );
}
