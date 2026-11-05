import cache from "../@helpers/cache";

const MIN_LENGTH = 3;
const MAX_LENGTH = 200;
// The public Photon instance asks for fair use and throttles heavy users. The limiter below
// only counts the requests of this server process, so with several instances
// (e.g. on Vercel), each one has its own limit.
const INTERVAL = 250;
// Don't let requests pile up: give up if a search would have to wait longer than this.
const MAX_WAIT = 2000;

// Typing and deleting repeats the same searches, so keep their results for a while.
const cached = cache({ ttl: 10 * 60_000, max: 500 });

/** Thrown if a search would have to wait too long for a free slot. */
class BusyError extends Error {}

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
    return <p class="as-message">Please enter at least {MIN_LENGTH} characters.</p>;
  }

  let features;
  try {
    // Photon ignores case, so "Berlin" and "berlin" share one cache entry.
    const query = search.toLowerCase();
    features = await cached(query, () => searchPlaces(query));
  } catch (error) {
    if (!(error instanceof BusyError)) {
      throw error;
    }
    return (
      <p class="as-message">There are too many searches right now. Please try again in a moment.</p>
    );
  }
  if (!features) {
    return <p class="as-message">Photon couldn't be reached right now. Please try again later.</p>;
  }
  if (features.length === 0) {
    return <p class="as-message">No addresses found. Try another search.</p>;
  }

  return (
    <>
      <p class="as-count">
        {features.length} {features.length === 1 ? "result" : "results"}
      </p>
      <ul class="as-list">
        {features.map(({ properties = {} }) => {
          const {
            name,
            street,
            housenumber,
            postcode,
            city,
            county,
            state,
            country,
            osm_key,
            osm_value,
          } = properties;
          const address = [street, housenumber].filter(Boolean).join(" ");
          const place = [
            address,
            [postcode, city ?? county ?? state].filter(Boolean).join(" "),
            country,
          ]
            .filter(Boolean)
            .join(", ");
          // "yes" only says that a tag is set (e.g. "building=yes"), so show the key then.
          const type = osm_value && osm_value !== "yes" ? osm_value : osm_key;
          return (
            <li>
              <div>
                <strong>{name || address || place}</strong>
                <small>{place}</small>
              </div>
              {type && <span class="as-type">{String(type).replaceAll("_", " ")}</span>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * Searches Photon; returns undefined if it can't be reached right now.
 * Undefined isn't cached (see "../@helpers/cache.js"), so the next search tries again.
 *
 * @param {string} search
 * @returns {Promise<{ properties?: Record<string, string> }[] | undefined>}
 */
async function searchPlaces(search) {
  const wait = reserveSlot();
  if (wait === -1) {
    throw new BusyError();
  }
  await new Promise((resolve) => setTimeout(resolve, wait));

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(search)}&limit=10&lang=en`,
      {
        headers: { "user-agent": "jeasx.dev (mail@jeasx.dev)" },
        // Don't wait forever for a slow server. The timeout also covers the body.
        signal: AbortSignal.timeout(5000),
      },
    );
    // Error responses (e.g. when throttled) may not be JSON, so only parse successful ones.
    const json = response.ok ? await response.json() : undefined;
    return Array.isArray(json?.features) ? json.features : undefined;
  } catch {
    // Network errors and timeouts end up in the message of the route.
    return undefined;
  }
}

/** Time when the next request to Photon may be sent. */
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
