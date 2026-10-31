import Layout from "../Layout";
import Image from "../sharp/Image";
import { loadProducts } from "./products";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ reply }) {
  let products;
  try {
    products = await loadProducts();
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
    <Layout title="Products" description="Browse products loaded from a remote API and rendered on the server." robots="index,nofollow">
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
