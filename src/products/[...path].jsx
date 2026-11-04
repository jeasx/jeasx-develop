import Layout from "../Layout";
import Image from "../sharp/Image";
import { loadProduct } from "./products";

// Only answer "/products/<id>" with a numeric id, not deeper paths like "/products/a/1".
const ID_PATTERN = new URLPattern({ pathname: "/products/:id(\\d+){/}?" });

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const id = ID_PATTERN.exec({ pathname: request.path })?.pathname.groups.id;
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
    <Layout
      title={product.title}
      description={product.description}
      robots="noindex,nofollow"
      css="/products/index.css"
    >
      <nav class="product-back">
        {/* The anchor scrolls the list to this product, so the image morphs back into its card. */}
        <a href={`../#product-${id}`}>← Show all products</a>
      </nav>
      <article>
        <header class="center">
          <h1>
            <span class="product-title" style={`view-transition-name: product-title-${id}`}>
              {product.title}
            </span>
          </h1>
          <p class="product-details product-meta">
            {[product.brand, product.category].filter(Boolean).join(" · ")}
          </p>
        </header>
        <div class="product-intro">
          {/* Same image and view-transition-name as on the list, so it morphs into place. */}
          <Image
            src={product.thumbnail}
            alt={product.title}
            position="entropy"
            immutable
            width="640"
            height="320"
            class="product-hero"
            style={`view-transition-name: product-image-${id}`}
          />
          <div class="product-details">
            <Price price={product.price} discount={product.discountPercentage} />
            <p class="product-meta">
              {typeof product.rating === "number" && (
                <span title={`${product.rating} of 5`}>
                  {stars(product.rating)} {product.rating.toFixed(1)}
                </span>
              )}{" "}
              {product.availabilityStatus && (
                <mark class={product.stock > 0 ? "" : "product-out"}>
                  {product.availabilityStatus}
                  {product.stock > 0 && ` (${product.stock} left)`}
                </mark>
              )}
            </p>
            <p>{product.description}</p>
          </div>
        </div>

        <hr class="product-details" />

        <div class="product-details product-columns">
          <section>
            <h2>Details</h2>
            <dl class="product-specs">
              <Spec label="SKU" value={product.sku} />
              <Spec label="Weight" value={product.weight && `${product.weight} g`} />
              <Spec
                label="Dimensions"
                value={
                  product.dimensions &&
                  `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`
                }
              />
              <Spec label="Minimum order" value={product.minimumOrderQuantity} />
              <Spec label="Warranty" value={product.warrantyInformation} />
              <Spec label="Shipping" value={product.shippingInformation} />
              <Spec label="Returns" value={product.returnPolicy} />
            </dl>
          </section>

          <section>
            {product.reviews?.length > 0 && (
              <>
                <h2>Reviews</h2>
                {product.reviews.map((review) => (
                  <blockquote class="product-review">
                    <p>
                      <span title={`${review.rating} of 5`}>{stars(review.rating)}</span>{" "}
                      {review.comment}
                    </p>
                    {/* Reviewer emails are left out on purpose. */}
                    <footer>
                      {review.reviewerName}
                      {review.date && <>, {new Date(review.date).toLocaleDateString("en-US")}</>}
                    </footer>
                  </blockquote>
                ))}
              </>
            )}
          </section>
        </div>
      </article>
    </Layout>
  );
}

function Price({ price, discount }) {
  if (typeof price !== "number") {
    return null;
  }
  // The API's price is already discounted: show the original price crossed out.
  const original = discount > 0 ? price / (1 - discount / 100) : undefined;
  return (
    <p class="product-price">
      <b>${price.toFixed(2)}</b>
      {original && (
        <>
          {" "}
          <s>${original.toFixed(2)}</s> <small>−{Math.round(discount)}%</small>
        </>
      )}
    </p>
  );
}

function Spec({ label, value }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function stars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
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
