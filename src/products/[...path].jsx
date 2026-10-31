import Layout from "../Layout";
import Image from "../sharp/Image";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Only answer "/products/<id>" with a numeric id, not deeper paths like "/products/a/1".
  const id = /^\/products\/(\d+)\/?$/.exec(request.path)?.[1];
  if (!id) {
    return;
  }
  let response;
  try {
    response = await fetch(`https://dummyjson.com/products/${id}`, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Network errors and timeouts aren't a missing product, so don't answer with 404.
    reply.status(504);
    return (
      <Layout title="Product" robots="noindex">
        <p>The product couldn't be loaded right now. Please try again later.</p>
      </Layout>
    );
  }
  const product = response.ok ? await response.json().catch(() => undefined) : undefined;

  // Unknown ids and unexpected responses get a 404.
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
