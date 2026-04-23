/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const json = await (
    await fetch(
      `https://nominatim.openstreetmap.org/search?q=${request.body["search"]}&addressdetails=1&format=jsonv2`,
      { headers: { "user-agent": "jeasx.dev (mail@jeasx.dev)" } },
    )
  ).json();

  return (
    <table>
      <thead>
        <td>Country</td>
        <td>Postcode</td>
        <td>City</td>
        <td>Road</td>
        <td>Type</td>
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
