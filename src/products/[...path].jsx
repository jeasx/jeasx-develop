import Layout from "../Layout";
import Image from "../sharp/Image";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const id = request.path.slice(request.path.lastIndexOf("/") + 1);
  const response = await fetch(`https://dummyjson.com/product/${encodeURIComponent(id)}`);
  const product = response.ok ? await response.json() : undefined;

  // Unknown ids get a 404, but "." is redirected to the list of all products,
  // so check for a single product before rendering it.
  if (!Array.isArray(product?.images)) {
    return;
  }

  return (
    <Layout title={product.title} description={product.description} robots="noindex,nofollow">
      <article class="center">
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        {product.images.map((image) => (
          <Image
            src={image}
            alt={product.title}
            position="entropy"
            immutable
            loading="lazy"
            width="200"
            height="200"
          />
        ))}
      </article>
      <section class="center">
        <a href="..">Show all products</a>
      </section>
    </Layout>
  );
}
