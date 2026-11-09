import planetData from "../planet-data";

const PATTERN = new URLPattern({ pathname: "/client-jsx/api/:name{/}?" });

/**
 * Answers one planet after a short random delay, so parallel loading becomes visible.
 * @param {import("../../types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const name = PATTERN.exec({ pathname: request.path })?.pathname.groups.name;
  const planet = planetData.find((planet) => planet.name === name);
  if (!planet) {
    reply.status(404);
    return {};
  }
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 600));
  return planet;
}
