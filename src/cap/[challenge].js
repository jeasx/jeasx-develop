import { createChallenge } from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ reply }) {
  return reply.send(await createChallenge());
}
