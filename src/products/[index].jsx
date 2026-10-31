import Layout from "../Layout";
import Image from "../sharp/Image";

export default async function () {
  let products;
  try {
    const response = await fetch("https://dummyjson.com/products", {
      signal: AbortSignal.timeout(5000),
    });
    ({ products } = response.ok ? await response.json() : {});
  } catch {
    // Network errors and timeouts end up in the message below.
  }

  if (!Array.isArray(products)) {
    return (
      <Layout title="Products" robots="noindex">
        <h1>Product overview</h1>
        <p>The products couldn't be loaded right now. Please try again later.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Products" description="Product overview" robots="index,nofollow">
      <h1>Product overview</h1>
      <div class="row center">
        {products.map(({ id, title, price, description, thumbnail }) => (
          <article class="col-12 col-md-6 col-lg-4">
            <header>
              <Image
                src={thumbnail}
                width="640"
                height="320"
                position="entropy"
                alt={title}
                immutable
                loading="lazy"
              />
              <hr />
              <b>${price}</b>
            </header>
            <div>
              <h3>
                <a href={id}>{title}</a>
              </h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
