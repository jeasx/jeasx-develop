import { SLUGS } from "./domain/constants";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ reply }) {
  return reply.redirect(SLUGS.START);
}
