import Layout from "../Layout";
import Image from "./Image";

export default function () {
  return (
    <Layout
      title="Image transformation with Sharp in Jeasx"
      description="Using sharp to transform images with Jeasx."
    >
      <h1>Image transformation with Sharp</h1>
      <p>
        Jeasx allows to easily create a image component and converter in userland based on the
        fantastic <a href="https://sharp.pixelplumbing.com">sharp</a> library. Here you see a simple
        example with static images. The image converter is also used in the{" "}
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
