import Layout from "../Layout";
import Image from "./Image";

export default function () {
  return (
    <Layout
      title="Image transformation with sharp in Jeasx"
      description="Using sharp to transform images with Jeasx."
    >
      <h1>Image transformation with sharp</h1>
      <p>
        With the <a href="https://sharp.pixelplumbing.com">sharp</a> library, you can build an image
        component and converter in userland. The images below are cropped, resized and converted to
        AVIF or WebP on the fly. The image converter is also used in the{" "}
        <a href="/products">products</a> example.
      </p>
      <section class="container center">
        {[1, 2, 3].map((idx) => (
          <figure>
            <Image
              src={`/images/image${idx}.jpg`}
              width={(idx + 2) * 200}
              height={idx * 200}
              position="entropy"
              loading="lazy"
            />
            <figcaption>Image {idx}</figcaption>
          </figure>
        ))}
      </section>
    </Layout>
  );
}
