import Cap from "@cap.js/server";

// Challenges are free to request and expired ones are only removed every few minutes,
// so cap the memory: once full, the oldest entries are dropped first.
const MAX_ENTRIES = 10_000;

/**
 * @param {Map<string, unknown>} map
 * @param {string} key
 * @param {unknown} value
 */
function add(map, key, value) {
  map.set(key, value);
  if (map.size > MAX_ENTRIES) {
    map.delete(map.keys().next().value);
  }
}

if (!globalThis.cap) {
  const cache = { tokens: new Map(), challenges: new Map() };
  globalThis.cap = new Cap({
    storage: {
      challenges: {
        store: async (token, challengeData) => {
          add(cache.challenges, token, challengeData);
        },
        read: async (token) => {
          const data = cache.challenges.get(token);
          return data?.expires > Date.now() ? data : null;
        },
        delete: async (token) => {
          cache.challenges.delete(token);
        },
        deleteExpired: async () => {
          const now = Date.now();
          cache.challenges.entries().forEach(([key, data]) => {
            if (data.expires < now) {
              cache.challenges.delete(key);
            }
          });
        },
      },
      tokens: {
        store: async (key, expires) => {
          add(cache.tokens, key, expires);
        },
        get: async (key) => {
          const expires = cache.tokens.get(key);
          return expires > Date.now() ? expires : null;
        },
        delete: async (key) => {
          cache.tokens.delete(key);
        },
        deleteExpired: async () => {
          const now = Date.now();
          cache.tokens.entries().forEach(([key, expires]) => {
            if (expires < now) {
              cache.tokens.delete(key);
            }
          });
        },
      },
    },
  });
}

export default globalThis.cap;
