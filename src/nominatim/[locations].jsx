const MIN_LENGTH = 3;
const MAX_LENGTH = 200;
// Nominatim's usage policy allows at most one request per second for the whole application.
const INTERVAL = 1000;
// Don't let requests pile up: give up if a search would have to wait longer than this.
const MAX_WAIT = 3000;

/**
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const search = String(request.body?.["search"] ?? "")
    .trim()
    .slice(0, MAX_LENGTH);
  if (search === "") {
    // Clear the results when the search field is emptied.
    return "";
  }
  if (search.length < MIN_LENGTH) {
    return <p>Please enter at least {MIN_LENGTH} characters.</p>;
  }

  const wait = reserveSlot();
  if (wait === -1) {
    return <p>There are too many searches right now. Please try again in a moment.</p>;
  }
  await new Promise((resolve) => setTimeout(resolve, wait));

  let json;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&addressdetails=1&format=jsonv2`,
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

/** Time when the next request to Nominatim may be sent. */
let nextSlot = 0;

/**
 * Reserves the next free slot and returns how long to wait for it,
 * or -1 if the wait would be too long.
 */
function reserveSlot() {
  const now = Date.now();
  const slot = Math.max(now, nextSlot);
  if (slot - now > MAX_WAIT) {
    return -1;
  }
  nextSlot = slot + INTERVAL;
  return slot - now;
}
