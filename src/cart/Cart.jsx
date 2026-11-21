import { FREE_SHIPPING_FROM, MAX_QTY, PRODUCTS, VAT_RATE, formatMoney, totals } from "./state";

/**
 * Renders the shop. In the browser, `previous` is the state shown before the click, so only
 * what changed gets animated: the whole cart is re-rendered after every click, and an
 * animation on every line would replay each time. The server renders without animations.
 *
 * @param {import("./state").State & { previous?: import("./state").State }} props
 */
export default function Cart({ previous, ...state }) {
  const { items, discount: applied, error, ordered } = state;
  const current = totals(state);
  const { lines, count, subtotal, discount, shipping, total, vat } = current;
  const missing = FREE_SHIPPING_FROM - (subtotal - discount);
  const before = previous && totals(previous);
  const progress = shippingProgress(current);

  /** @param {string} id */
  function lineClass(id) {
    if (!previous) {
      return undefined;
    }
    const old = previous.items.find((item) => item.id === id);
    const qty = items.find((item) => item.id === id)?.qty;
    return !old ? "added" : old.qty !== qty ? "changed" : undefined;
  }
  /** @param {boolean | undefined} changed */
  const bump = (changed) => (changed ? "bump" : undefined);

  return (
    <div class="shop" id="app" data-state={JSON.stringify({ items, discount: applied })}>
      <section class="catalog" aria-label="Products">
        <form method="post">
          <ul>
            {PRODUCTS.map((product) => (
              <li>
                {/* The whole card is the button, so it's easy to hit on a phone. */}
                <button
                  name="add"
                  value={product.id}
                  aria-label={`Add ${product.name} for ${formatMoney(product.price)} to cart`}
                  disabled={items.some((item) => item.id === product.id && item.qty >= MAX_QTY)}
                >
                  <span class="emoji">{product.emoji}</span>
                  <span class="name">{product.name}</span>
                  <span class="price">{formatMoney(product.price)}</span>
                  <span class="add">Add</span>
                </button>
              </li>
            ))}
          </ul>
        </form>
      </section>

      <section class="cart" aria-label="Cart">
        <h2>
          Cart{" "}
          <span class={before && before.count !== count ? "badge bump" : "badge"}>{count}</span>
        </h2>

        {ordered && (
          <p class="notice success" role="status">
            Thanks! Your order of {ordered.count} {ordered.count === 1 ? "item" : "items"} for{" "}
            {formatMoney(ordered.total)} is on its way (not really, this is a demo).
          </p>
        )}

        {lines.length === 0 ? (
          <p class="empty">Your cart is empty.</p>
        ) : (
          <form method="post">
            <ul class="lines">
              {lines.map(({ product, qty, sum }) => (
                <li class={lineClass(product.id)}>
                  <span class="name">
                    {product.emoji} {product.name}
                  </span>
                  <span class="stepper">
                    <button
                      name="decrease"
                      value={product.id}
                      aria-label={`One ${product.name} less`}
                    >
                      −
                    </button>
                    <output aria-label={`Quantity of ${product.name}`}>{qty}</output>
                    <button
                      name="increase"
                      value={product.id}
                      aria-label={`One ${product.name} more`}
                      disabled={qty >= MAX_QTY}
                    >
                      +
                    </button>
                  </span>
                  <span class="sum">{formatMoney(sum)}</span>
                  <button
                    class="remove"
                    name="remove"
                    value={product.id}
                    aria-label={`Remove ${product.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </form>
        )}

        {lines.length > 0 && (
          <>
            <form method="post" class="code">
              {applied ? (
                <p>
                  Code <strong>{applied.code}</strong> ({applied.label}){" "}
                  <button class="link" name="removeCode" value="1">
                    Remove
                  </button>
                </p>
              ) : (
                <>
                  <label for="code">Discount code</label>
                  <span class="field">
                    <input
                      id="code"
                      name="code"
                      placeholder="SAVE10 or FREESHIP"
                      autocomplete="off"
                      maxlength={20}
                      aria-invalid={error ? "true" : undefined}
                      aria-describedby={error ? "code-error" : undefined}
                    />
                    <button name="applyCode" value="1">
                      Apply
                    </button>
                  </span>
                  {error && (
                    <p class="notice error" id="code-error" role="alert">
                      {error}
                    </p>
                  )}
                </>
              )}
            </form>

            <dl class="totals">
              <dt>Subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
              {discount > 0 && (
                <>
                  <dt>Discount</dt>
                  <dd class={bump(before && before.discount !== discount)}>
                    −{formatMoney(discount)}
                  </dd>
                </>
              )}
              <dt>Shipping</dt>
              <dd class={bump(before && before.shipping !== shipping)}>
                {shipping ? formatMoney(shipping) : "Free"}
              </dd>
              <dt class="total">Total</dt>
              <dd class={before && before.total !== total ? "total bump" : "total"}>
                {formatMoney(total)}
              </dd>
              <dt class="vat">incl. {VAT_RATE * 100}% VAT</dt>
              <dd class="vat">{formatMoney(vat)}</dd>
            </dl>

            <div class="shipping">
              <p>
                {shipping > 0 && missing > 0
                  ? `Add ${formatMoney(missing)} more for free shipping.`
                  : "🎉 Free shipping!"}
              </p>
              <div
                class="meter"
                style={`--progress: ${progress}%${
                  before ? `; --from: ${shippingProgress(before)}%` : ""
                }`}
              />
            </div>

            <form method="post">
              <button class="checkout" name="order" value="1">
                Place order
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

/**
 * Share of the way to free shipping, in percent.
 * @param {ReturnType<typeof totals>} totals
 */
function shippingProgress({ subtotal, discount, shipping }) {
  return shipping
    ? Math.min(100, Math.round(((subtotal - discount) / FREE_SHIPPING_FROM) * 100))
    : 100;
}
