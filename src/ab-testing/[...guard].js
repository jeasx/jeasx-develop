import { randomBytes } from "node:crypto";
import { readSignedCookie } from "../@helpers/cookies";
import { FLAGS, PATH, flagsOf, variantOf } from "./flags";

/**
 * Runs before every route of this example: gives each visitor a random id in a cookie and
 * derives the variant and the feature flags from it. The routes below receive them as props,
 * so they don't need to know how visitors are assigned.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  if (reply.file) {
    return;
  }

  const query = /** @type {Record<string, unknown>} */ (request.query ?? {});

  // Signed, so a visitor can't pick a variant by editing the cookie.
  let visitor = readSignedCookie(request, "visitor");
  if (!visitor || query["reset"] !== undefined) {
    visitor = randomBytes(16).toString("base64url");
    reply.setCookie("visitor", visitor, {
      path: PATH,
      signed: true,
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  // Preview links like "?flag=reviews" turn flags on for one request, without changing
  // the assignment. Unknown names are ignored.
  const names = [query["flag"]].flat().filter((name) => typeof name === "string");
  /** @type {Record<string, boolean>} */
  const overrides = Object.fromEntries(
    names.filter((name) => Object.hasOwn(FLAGS, name)).map((name) => [name, true]),
  );

  // The page depends on the cookie, so caches must not hand it to other visitors.
  reply.header("cache-control", "private, no-store");

  return { visitor, variant: variantOf(visitor), flags: flagsOf(visitor, overrides) };
}
