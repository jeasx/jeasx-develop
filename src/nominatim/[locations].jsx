/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const json = await (
    await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(request.body?.["search"] ?? "")}&addressdetails=1&format=jsonv2`,
      { headers: { "user-agent": "jeasx.dev (mail@jeasx.dev)" } },
    )
  ).json();

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
        {json.map(({ addresstype, address }) => (
          <tr>
            <td>{address.country}</td>
            <td>{address.postcode}</td>
            <td>{address.city}</td>
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
