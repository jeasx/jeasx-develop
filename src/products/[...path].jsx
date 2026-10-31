import Layout from "../Layout";
import Image from "../sharp/Image";
import { loadProduct } from "./products";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // Only answer "/products/<id>" with a numeric id, not deeper paths like "/products/a/1".
  const id = /^\/products\/(\d+)\/?$/.exec(request.path)?.[1];
  if (!id) {
    return;
  }

  let product;
  try {
    product = await loadProduct(id);
  } catch {
    // Network errors and timeouts aren't a missing product, so don't answer with 404.
    reply.status(504);
    return <Unavailable />;
  }

  // The product doesn't exist: let [404] answer.
  if (product === null) {
    return;
  }

  // Other error responses and unexpected data aren't a missing product either.
  if (!product) {
    reply.status(502);
    return <Unavailable />;
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

function Unavailable() {
  return (
    <Layout title="Product" robots="noindex">
      <h1>Product</h1>
      <p>The product couldn't be loaded right now. Please try again later.</p>
      <section class="center">
        <a href="..">Show all products</a>
      </section>
    </Layout>
  );
}
