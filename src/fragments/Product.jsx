import Image from "../sharp/Image";

export async function Product({ id }) {
  const product = await (await fetch(`https://dummyjson.com/products/${id}`)).json();

  return (
    <article>
      <header>
        <h3>{product.title}</h3>
        <b>{product.price} €</b>
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
