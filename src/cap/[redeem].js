import cap from "./cap.js";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const token = request.body?.["token"];
  const solutions = request.body?.["solutions"];

  if (!token || !solutions) {
    return reply.code(400).send({ success: false });
  }

  reply.send(await cap.redeemChallenge({ token, solutions }));
}
