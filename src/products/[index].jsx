import cache from "../cache";
import Layout from "../Layout";
import Image from "../sharp/Image";

// Keep the products for a while, so not every visit has to wait for the API.
const cached = cache({ ttl: 5 * 60_000 });

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ reply }) {
  let products;
  try {
    products = await cached("products", loadProducts);
  } catch {
    // Network errors and timeouts: the upstream server didn't answer in time.
    reply.status(504);
  }

  if (!Array.isArray(products)) {
    // Error responses and unexpected data: the upstream server answered, but not usefully.
    if (reply.statusCode === 200) {
      reply.status(502);
    }
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

/**
 * Loads the products; returns undefined for error responses and unexpected data.
 * Network errors and timeouts are thrown.
 */
async function loadProducts() {
  const response = await fetch("https://dummyjson.com/products", {
    signal: AbortSignal.timeout(5000),
  });
  const { products } = response.ok ? await response.json().catch(() => ({})) : {};
  return Array.isArray(products) ? products : undefined;
}
