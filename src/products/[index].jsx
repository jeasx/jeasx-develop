import Layout from "../Layout";
import Image from "../sharp/Image";
import { loadProducts } from "./products";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
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
        <h1>Products</h1>
        <p>The products couldn't be loaded right now. Please try again later.</p>
      </Layout>
    );
  }

  // Categories with their product counts, in the order they first appear.
  const counts = new Map();
  for (const { category } of products) {
    if (category) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  // Ignore unknown categories, so a bad link shows all products instead of none.
  const query = request.query["category"];
  const selected = typeof query === "string" && counts.has(query) ? query : undefined;
  // Carried to the detail page, so its back link returns to this filter.
  const filter = selected ? `?category=${encodeURIComponent(selected)}` : "";
  const visible = selected ? products.filter(({ category }) => category === selected) : products;

  return (
    <Layout
      title="Products"
      description="Browse products loaded from a remote API and rendered on the server."
      robots="index,nofollow"
      css="/products/index.css"
    >
      <h1>Products</h1>
      <p>
        The products are loaded on the server from the <a href="https://dummyjson.com">DummyJSON</a>{" "}
        API and cached for a few minutes. Their images are cropped and converted on the fly by the
        image component of the <a href="/sharp">sharp example</a>. Click a product to see its
        details: its image and title morph into the detail page with a{" "}
        <a href="/view-transitions">view transition</a>.
      </p>
      <nav class="product-filter" aria-label="Filter by category">
        <a href="?" aria-current={selected ? undefined : "page"}>
          All <small>{products.length}</small>
        </a>
        {[...counts].map(([category, count]) => (
          <a
            href={`?category=${encodeURIComponent(category)}`}
            aria-current={category === selected ? "page" : undefined}
          >
            {category} <small>{count}</small>
          </a>
        ))}
      </nav>
      <div class="product-grid">
        {visible.map(({ id, title, price, description, thumbnail, category, rating }) => (
          <article id={`product-${id}`} class="product-card">
            <div class="product-media">
              <Image
                src={thumbnail}
                width="640"
                height="320"
                position="entropy"
                alt=""
                immutable
                loading="lazy"
                style={`view-transition-name: product-image-${id}`}
              />
              {/* Two decimals like on the detail page, so $10 reads "$10.00" everywhere. */}
              {typeof price === "number" && <b class="product-badge">${price.toFixed(2)}</b>}
            </div>
            <div class="product-body">
              <p class="product-meta product-card-meta">
                {category && <span class="product-chip">{category}</span>}
                {typeof rating === "number" && (
                  <span title={`${rating} of 5`}>★ {rating.toFixed(1)}</span>
                )}
              </p>
              <h3>
                {/* The link covers the whole card via CSS, so the card is one big target. */}
                <a
                  href={`${id}${filter}`}
                  class="product-title product-link"
                  style={`view-transition-name: product-title-${id}`}
                >
                  {title}
                </a>
              </h3>
              <p class="product-desc">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
