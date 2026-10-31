import mdxPlugin from "@mdx-js/esbuild";
import sveltePlugin from "esbuild-svelte";
import querystring from "node:querystring";
import rehypePrismPlus from "rehype-prism-plus";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export default {
  /** @type {() => import("esbuild").BuildOptions} */
  ESBUILD_SERVER_OPTIONS: () => ({
    define: { "process.env.BUILD_ID": `"${Date.now().toString(36)}"` },
    sourcemap: NODE_ENV_IS_DEVELOPMENT && "inline",
    loader: { ".svg": "file" },
    plugins: [
      // Component styles end up in a CSS file (e.g. "/svelte/index.css" from the browser build),
      // so they apply before hydration and without JavaScript. The server build's copy is unused.
      sveltePlugin({ compilerOptions: { generate: "server", css: "external" } }),
      mdxPlugin({
        development: NODE_ENV_IS_DEVELOPMENT,
        jsxImportSource: "jsx-async-runtime",
        elementAttributeNameCase: "html",
        stylePropertyNameCase: "css",
        rehypePlugins: [rehypePrismPlus],
      }),
    ],
  }),

  /** @type {() => import("esbuild").BuildOptions} */
  ESBUILD_BROWSER_OPTIONS: () => ({
    plugins: [sveltePlugin({ compilerOptions: { generate: "client", css: "external" } })],
  }),

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
      .register(import("@fastify/multipart"), {
        attachFieldsToBody: "keyValues",
        // All parts are buffered in memory and bodyLimit only applies to each file,
        // so limit the number and size of parts per request (max. about 8 MB).
        limits: { files: 1, fields: 100, fieldSize: 64 * 1024 },
      })
      .register(import("@fastify/cookie"), {
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
      ),
};
