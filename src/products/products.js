import cache from "../@helpers/cache";

const API = "https://dummyjson.com/products";
// Don't wait forever for a slow server. The timeout also covers the body.
const TIMEOUT = 5000;

// Keep the products for a while, so not every visit has to wait for the API.
// The list has a cache of its own: requests for many different product ids
// (e.g. "/products/123456") would otherwise push it out of a shared cache.
const cachedList = cache({ ttl: 5 * 60_000, max: 1 });
const cachedProducts = cache({ ttl: 5 * 60_000 });

/**
 * Loads all products; returns undefined for error responses and unexpected data.
 * Network errors and timeouts are thrown.
 *
 * @returns {Promise<Record<string, any>[] | undefined>}
 */
export function loadProducts() {
  return cachedList("products", async () => {
    const response = await fetch(API, { signal: AbortSignal.timeout(TIMEOUT) });
    const data = response.ok ? await response.json().catch(() => undefined) : undefined;
    return Array.isArray(data?.products) ? data.products : undefined;
  });
}

/**
 * Loads a product; returns null if it doesn't exist and undefined for other error responses
 * and unexpected data. Network errors and timeouts are thrown.
 *
 * @param {number | string} id
 * @returns {Promise<Record<string, any> | null | undefined>}
 */
export function loadProduct(id) {
  return cachedProducts(`product/${id}`, async () => {
    const response = await fetch(`${API}/${id}`, { signal: AbortSignal.timeout(TIMEOUT) });
    // Only a 404 from upstream means the product doesn't exist.
    if (response.status === 404) {
      return null;
    }
    const product = response.ok ? await response.json().catch(() => undefined) : undefined;
    return Array.isArray(product?.images) ? product : undefined;
  });
}
