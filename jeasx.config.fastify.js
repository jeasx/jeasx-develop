import { randomBytes } from "node:crypto";
import querystring from "node:querystring";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export default {
  /** @type {() => import("@fastify/send").SendOptions} */
  FASTIFY_SEND_OPTIONS: () => ({
    immutable: !NODE_ENV_IS_DEVELOPMENT,
    maxAge: NODE_ENV_IS_DEVELOPMENT ? 0 : "365d",
  }),

  /** @type {() => import("fastify").FastifyServerOptions} */
  FASTIFY_SERVER_OPTIONS: () => ({
    logger: { level: NODE_ENV_IS_DEVELOPMENT ? "error" : "info" },
    bodyLimit: 2 * 1024 * 1024,
    // Behind a proxy which terminates TLS (e.g. Vercel or a load balancer in front of Docker),
    // only the X-Forwarded-Proto header tells that the request used https. Trust it there,
    // so secure: "auto" (see cookies below) sets the Secure flag. Vercel sets VERCEL=1;
    // set TRUST_PROXY=true for other proxies. Don't trust it without a proxy, as clients
    // could then fake their IP address via X-Forwarded-For.
    trustProxy: process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true",
    // Close open connections on shutdown, otherwise long-lived responses
    // like Server-Sent Events keep the server from stopping.
    forceCloseConnections: true,
  }),

  /** @type {(fastify: import("fastify").FastifyInstance) => import("fastify").FastifyInstance} */
  FASTIFY_SERVER: (fastify) =>
    fastify
      .register(import("@fastify/cookie"), {
        // Signed cookies are only valid as long as the secret stays the same, so set
        // COOKIE_SECRET for every instance (e.g. on Vercel) and keep it across restarts.
        // The random fallback invalidates all signed cookies on each start.
        secret: process.env.COOKIE_SECRET || randomBytes(32).toString("hex"),
        parseOptions: {
          path: "/",
          httpOnly: true,
          secure: "auto",
          sameSite: "strict",
        },
      })
      .addContentTypeParser(
        "application/x-www-form-urlencoded",
        { parseAs: "string" },
        async (_request, body) => querystring.parse(body),
      )
      .addContentTypeParser("multipart/form-data", async () => {}),
};
