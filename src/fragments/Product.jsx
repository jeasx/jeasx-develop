import cache from "../cache";
import Image from "../sharp/Image";

// Keep the products for a while, so browsing back and forth doesn't wait for the API.
const cached = cache({ ttl: 5 * 60_000 });

export async function Product({ id }) {
  const product = await cached(String(id), () => loadProduct(id));
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

/**
 * Loads a product; returns undefined if it can't be loaded right now.
 *
 * @param {number} id
 */
async function loadProduct(id) {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok ? await response.json() : undefined;
  } catch {
    // Network errors and timeouts end up in the message of the component.
    return undefined;
  }
}
