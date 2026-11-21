import { readListCookie, readSignedCookie, writeListCookie } from "../@helpers/cookies";
import isCrossSite, { crossSiteResponse } from "../@helpers/crossSite";
import { checkout, findDiscount } from "./checkout";
import { DEFAULT_ITEMS, isServerAction, toItems } from "./state";

const PATH = "/cart";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Other sites must not fill your cart with a forged form.
  if (isCrossSite(request)) {
    return crossSiteResponse();
  }

  const list = readListCookie(request, "cart");
  /** @type {import("./state").State} */
  const state = {
    items: list ? toItems(list) : structuredClone(DEFAULT_ITEMS),
    // Only the code is stored; its terms are looked up again, so a dropped code stops working.
    discount: findDiscount(readSignedCookie(request, "cart-code")),
  };

  // The guard also runs for static files like index.css, which shouldn't carry a cookie.
  if (request.method === "POST") {
    // A JSON body can also be a number or string, which the reducer can't handle.
    const body = /** @type {Record<string, unknown>} */ (
      request.body && typeof request.body === "object" ? request.body : {}
    );
    // The browser sends its cart along with a code or an order, as the background save of
    // an earlier click may still be on its way. It only says which products, never a price.
    if (typeof body["cart"] === "string") {
      try {
        const items = JSON.parse(body["cart"]);
        if (Array.isArray(items)) {
          state.items = toItems(items.filter((item) => item && typeof item === "object"));
        }
      } catch {}
    }
    const next = checkout(state, body);
    writeListCookie(reply, "cart", next.items, PATH);
    reply.setCookie("cart-code", next.discount?.code ?? "", { path: PATH, signed: true });
    if (request.headers.accept?.includes("application/json")) {
      // Codes and orders are decided here, so the browser shows what the server answers.
      // Other changes were rendered by the browser already, it only needs the cookies.
      return isServerAction(body) ? reply.send(next) : reply.status(204).send();
    }
    // Messages like a wrong code or the order confirmation only live for one response,
    // so render them right away instead of redirecting.
    if (next.error || next.ordered) {
      return next;
    }
    // 303 makes the browser load the cart with GET, so a reload doesn't send the form again.
    return reply.redirect(PATH, 303);
  }

  return state;
}
