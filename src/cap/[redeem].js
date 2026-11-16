import { redeemChallenge } from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  // capjs-core checks the body itself and answers malformed input with success: false.
  const result = await redeemChallenge(request.body);
  return reply.code(result.success ? 200 : 400).send(result);
}
