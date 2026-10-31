/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  let json;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(request.body?.["search"] ?? "")}&addressdetails=1&format=jsonv2`,
      {
        headers: { "user-agent": "jeasx.dev (mail@jeasx.dev)" },
        // Don't wait forever for a slow server. The timeout also covers the body.
        signal: AbortSignal.timeout(5000),
      },
    );
    // Error responses (e.g. when the rate limit is hit) may not be JSON, so only parse successful ones.
    json = response.ok ? await response.json() : undefined;
  } catch {
    // Network errors and timeouts end up in the message below.
  }
  if (!Array.isArray(json)) {
    return <p>Nominatim couldn't be reached right now. Please try again later.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th>Postcode</th>
          <th>City</th>
          <th>Road</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {json.map(({ addresstype, address = {} }) => (
          <tr>
            <td>{address.country}</td>
            <td>{address.postcode}</td>
            <td>{address.city ?? address.town ?? address.village}</td>
            <td>
              {address.road} {address.house_number}
            </td>
            <td>{addresstype}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
