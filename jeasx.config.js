import { randomBytes } from "node:crypto";
import querystring from "node:querystring";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// The server imports this config at startup, so build-only plugins are imported lazily:
// loading them (e.g. the Svelte and Vue compilers) would add about 200 ms to every server start.

export default {
  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_SERVER_OPTIONS: async () => {
    const [
      { default: sveltePlugin },
      { default: vuePlugin },
      { default: mdxPlugin },
      { default: rehypePrismPlus },
    ] = await Promise.all([
      import("esbuild-svelte"),
      import("unplugin-vue/esbuild"),
      import("@mdx-js/esbuild"),
      import("rehype-prism-plus"),
    ]);
    return {
      define: { "process.env.BUILD_ID": `"${Date.now().toString(36)}"` },
      sourcemap: NODE_ENV_IS_DEVELOPMENT && "inline",
      loader: { ".svg": "file" },
      plugins: [
        // Component styles end up in a CSS file (e.g. "/svelte/index.css" from the browser build),
        // so they apply before hydration and without JavaScript. The server build's copy is unused.
        sveltePlugin({ compilerOptions: { generate: "server", css: "external" } }),
        // Same for the styles of Vue single-file components (e.g. "/vue/index.css").
        vuePlugin({ ssr: true, sourceMap: false }),
        mdxPlugin({
          development: NODE_ENV_IS_DEVELOPMENT,
          jsxImportSource: "jsx-async-runtime",
          elementAttributeNameCase: "html",
          stylePropertyNameCase: "css",
          rehypePlugins: [rehypePrismPlus],
        }),
      ],
    };
  },

  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_BROWSER_OPTIONS: async () => {
    const [{ default: sveltePlugin }, { default: vuePlugin }] = await Promise.all([
      import("esbuild-svelte"),
      import("unplugin-vue/esbuild"),
    ]);
    return {
      // Vue's compile-time feature flags: setting them avoids a console warning
      // and drops unused code (e.g. the Options API) from the bundle.
      define: {
        __VUE_OPTIONS_API__: "false",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      },
      plugins: [
        sveltePlugin({ compilerOptions: { generate: "client", css: "external" } }),
        vuePlugin({ sourceMap: false }),
      ],
    };
  },

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
        // so limit the number and size of parts per request (up to about 8 MB).
        limits: { files: 1, fields: 100, fieldSize: 64 * 1024 },
      })
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
      ),
};
