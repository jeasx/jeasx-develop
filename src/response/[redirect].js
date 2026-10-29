/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Response.redirect requires an absolute URL.
  return Response.redirect(`${request.protocol}://${request.host}/response`, 303);
}
