import { PATH } from "./flags";
import { track } from "./stats";

/**
 * Counts a conversion for the variant of the visitor. The variant comes from the guard,
 * not from the request, so visitors can't count clicks for the other variant.
 *
 * @param {import("../types").RouteProps & { visitor: string, variant: string }} props
 */
export default function ({ request, reply, visitor, variant }) {
  if (request.method === "POST") {
    track("conversions", variant, visitor);
  }
  // 303 makes the browser load the page with GET, so a reload doesn't send the form again.
  return reply.redirect(`${PATH}?bought`, 303);
}
