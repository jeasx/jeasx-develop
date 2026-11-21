import Layout from "../Layout";
import Cart from "./Cart";

/**
 * @param {import("./state").State} props
 */
export default function ({ items, discount, error, ordered }) {
  return (
    <Layout
      title="Shopping cart"
      description="A shopping cart rendered on the server, then the same JSX component and price calculation run in the browser."
      css="/cart/index.css"
      script="/cart/index.js"
    >
      <div class="cart-page">
        <h1>Shopping cart</h1>
        <p class="lead">
          A small shop whose cart, discount codes and totals are calculated by the same code on the
          server and in the browser, which works with and without JavaScript.
        </p>
        <p>
          All prices are integer cents, so the server and the browser always agree on the total,
          down to the VAT. With JavaScript, the browser updates the cart right away and sends each
          change in the background, so the server can store the cart in a signed cookie. Without
          JavaScript, every click submits a plain HTML form.
        </p>
        <p>
          The browser's totals are only a preview. Discount codes are secrets, so they never leave
          the server: applying a code or placing an order is sent to the server, which checks it
          with its own prices and answers with the new cart. The browser may say which products are
          in the cart, but never what they cost.
        </p>
        <Cart items={items} discount={discount} error={error} ordered={ordered} />
      </div>
    </Layout>
  );
}
