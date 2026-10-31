import { loadProduct } from "../products/products";
import Image from "../sharp/Image";

export async function Product({ id }) {
  // A fragment replaces part of the page, so every failure (missing product, error response,
  // network error or timeout) ends up in the same message instead of an error status.
  const product = await loadProduct(id).catch(() => undefined);
  if (!product) {
    return <p>The product couldn't be loaded right now. Please try again later.</p>;
  }

  return (
    <article>
      <header>
        <h3>{product.title}</h3>
        <b>${product.price}</b>
      </header>
      <Image
        src={product.thumbnail}
        alt={product.title}
        width="200"
        height="200"
        position="entropy"
        immutable
        loading="lazy"
      />
      <p>{product.description}</p>
    </article>
  );
}
