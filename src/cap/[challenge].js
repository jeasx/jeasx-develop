import cap from "./cap";

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ reply }) {
  reply.send(await cap.createChallenge());
}
