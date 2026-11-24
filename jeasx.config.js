import { randomBytes } from "node:crypto";
import querystring from "node:querystring";
import { mdxPlugin, sveltePlugin } from "./jeasx.plugins.js";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// The server imports this config at startup, so build-only plugins are imported lazily:
// loading them (e.g. the Svelte and Vue compilers) would add about 200 ms to every server start.
export default {
  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_SERVER_OPTIONS: async () => {
    return {
      define: { "process.env.BUILD_ID": `"${Date.now().toString(36)}"` },
      sourcemap: NODE_ENV_IS_DEVELOPMENT && "inline",
      loader: { ".svg": "file" },
      plugins: [
        (await import("unplugin-vue/esbuild")).default({ ssr: true, sourceMap: false }),
        // Component styles end up in a CSS file (e.g. "/svelte/index.css" from the browser build),
        // so they apply before hydration and without JavaScript. The server build's copy is unused.
        await sveltePlugin({ generate: "server", css: "external" }),
        await mdxPlugin({
          development: NODE_ENV_IS_DEVELOPMENT,
          jsxImportSource: "jsx-async-runtime",
          elementAttributeNameCase: "html",
          stylePropertyNameCase: "css",
          rehypePlugins: [(await import("rehype-prism-plus")).default],
        }),
      ],
    };
  },

  /** @type {() => Promise<import("bun").BuildConfig>} */
  BUN_SERVER_OPTIONS: async () => {
    return {
      define: {
        "process.env.BUILD_ID": `"${Date.now().toString(36)}"`,
      },
      sourcemap: NODE_ENV_IS_DEVELOPMENT ? "inline" : "none",
      loader: { ".svg": "file" },
      plugins: [
        (await import("unplugin-vue")).default.bun({ ssr: true, sourceMap: false }),
        // Component styles end up in a CSS file (e.g. "/svelte/index.css" from the browser build),
        // so they apply before hydration and without JavaScript. The server build's copy is unused.
        await sveltePlugin({ generate: "server", css: "external" }),
        await mdxPlugin({
          development: NODE_ENV_IS_DEVELOPMENT,
          jsxImportSource: "jsx-async-runtime",
          elementAttributeNameCase: "html",
          stylePropertyNameCase: "css",
          rehypePlugins: [(await import("rehype-prism-plus")).default],
        }),
      ],
    };
  },

  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_BROWSER_OPTIONS: async () => {
    return {
      // Vue's compile-time feature flags: setting them avoids a console warning
      // and drops unused code (e.g. the Options API) from the bundle.
      define: {
        __VUE_OPTIONS_API__: "false",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      },
      loader: { ".svg": "file" },
      plugins: [
        (await import("unplugin-vue/esbuild")).default({ sourceMap: false }),
        await sveltePlugin({ generate: "client", css: "external" }),
      ],
    };
  },

  /** @type {() => Promise<import("bun").BuildConfig>} */
  BUN_BROWSER_OPTIONS: async () => {
    return {
      // Vue's compile-time feature flags: setting them avoids a console warning
      // and drops unused code (e.g. the Options API) from the bundle.
      define: {
        __VUE_OPTIONS_API__: "false",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      },
      loader: { ".svg": "file" },
      plugins: [
        (await import("unplugin-vue")).default.bun({ sourceMap: false }),
        await sveltePlugin({ generate: "client", css: "external" }),
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
