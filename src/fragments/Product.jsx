import { loadProduct } from "../products/products";
import Image from "../sharp/Image";

export async function Product({ id }) {
  // A fragment replaces part of the page, so every failure (missing product, error response,
  // network error or timeout) ends up in the same message instead of an error status.
  const product = await loadProduct(id).catch(() => undefined);
  if (!product) {
    return (
      <p class="tf-empty">The product couldn't be loaded right now. Please try again later.</p>
    );
  }

  return (
    <article class="tf-product">
      <Image
        src={product.thumbnail}
        alt={product.title}
        width="160"
        height="160"
        position="entropy"
        immutable
        loading="lazy"
      />
      <div>
        <h3>{product.title}</h3>
        {typeof product.price === "number" && <b class="tf-price">${product.price.toFixed(2)}</b>}
        <p>{product.description}</p>
      </div>
    </article>
  );
}
