import { SLUGS } from "./domain/constants";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ reply }) {
  reply.redirect(SLUGS.START);
}
