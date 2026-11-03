import cap from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const token = request.body?.["token"];
  const solutions = request.body?.["solutions"];

  // Anything but a string token and a list of solutions would make the Cap library throw (500).
  if (typeof token !== "string" || !token || !Array.isArray(solutions)) {
    return reply.code(400).send({ success: false });
  }

  return reply.send(await cap.redeemChallenge({ token, solutions }));
}
