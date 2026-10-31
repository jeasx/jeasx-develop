import Image from "../sharp/Image";

export async function Product({ id }) {
  let product;
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      signal: AbortSignal.timeout(5000),
    });
    product = response.ok ? await response.json() : undefined;
  } catch {
    // Network errors and timeouts end up in the message below.
  }
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
