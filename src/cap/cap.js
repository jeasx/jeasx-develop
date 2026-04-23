import Cap from "@cap.js/server";

if (!globalThis.cap) {
  const cache = { tokens: new Map(), challenges: new Map() };
  globalThis.cap = new Cap({
    storage: {
      challenges: {
        store: async (token, challengeData) => {
          cache.challenges.set(token, challengeData);
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
          cache.challenges.entries().forEach(([key, expires]) => {
            if (expires < now) {
              cache.challenges.delete(key);
            }
          });
        },
      },
      tokens: {
        store: async (key, expires) => {
          cache.tokens.set(key, expires);
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
