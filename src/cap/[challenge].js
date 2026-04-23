import cap from "./cap.js";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ reply }) {
  reply.send(await cap.createChallenge());
}
