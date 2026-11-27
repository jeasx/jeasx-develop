import { randomBytes } from "node:crypto";
import { ServerResponse } from "node:http";
import querystring from "node:querystring";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export default {
  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_SERVER_OPTIONS: async () => ({
    define: { "process.env.BUILD_ID": `"${Date.now().toString(36)}"` },
    sourcemap: NODE_ENV_IS_DEVELOPMENT && "inline",
    loader: { ".svg": "file" },
    plugins: [
      (await import("unplugin-vue/esbuild")).default({ ssr: true, sourceMap: false }),
      (await import("esbuild-svelte")).default({
        compilerOptions: { generate: "server", css: "external" },
      }),
      (await import("@mdx-js/esbuild")).default({
        development: NODE_ENV_IS_DEVELOPMENT,
        jsxImportSource: "jsx-async-runtime",
        elementAttributeNameCase: "html",
        stylePropertyNameCase: "css",
        rehypePlugins: [(await import("rehype-prism-plus")).default],
      }),
    ],
  }),

  /** @type {() => Promise<import("bun").BuildConfig>} */
  BUN_SERVER_OPTIONS: async () => ({
    define: {
      "process.env.BUILD_ID": `"${Date.now().toString(36)}"`,
    },
    sourcemap: NODE_ENV_IS_DEVELOPMENT ? "inline" : "none",
    plugins: [
      (await import("unplugin-vue")).default.bun({ ssr: true, sourceMap: false }),
      (await import("esbuild-svelte")).default({
        compilerOptions: { generate: "server", css: "external" },
      }),
      (await import("@mdx-js/esbuild")).default({
        development: NODE_ENV_IS_DEVELOPMENT,
        jsxImportSource: "jsx-async-runtime",
        elementAttributeNameCase: "html",
        stylePropertyNameCase: "css",
        rehypePlugins: [(await import("rehype-prism-plus")).default],
      }),
    ],
  }),

  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_BROWSER_OPTIONS: async () => ({
    define: {
      __VUE_OPTIONS_API__: "false",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    },
    loader: { ".svg": "file" },
    plugins: [
      (await import("unplugin-vue/esbuild")).default({ sourceMap: false }),
      (await import("esbuild-svelte")).default({
        compilerOptions: { generate: "client", css: "external" },
      }),
    ],
  }),

  /** @type {() => Promise<import("bun").BuildConfig>} */
  BUN_BROWSER_OPTIONS: async () => ({
    define: {
      __VUE_OPTIONS_API__: "false",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    },
    plugins: [
      (await import("unplugin-vue")).default.bun({ sourceMap: false }),
      (await import("esbuild-svelte")).default({
        compilerOptions: { generate: "client", css: "external" },
      }),
    ],
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
    trustProxy: process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true",
    // Close open connections on shutdown, otherwise long-lived responses
    // like Server-Sent Events keep the server from stopping.
    forceCloseConnections: true,
  }),

  /** @type {(fastify: import("fastify").FastifyInstance) => import("fastify").FastifyInstance} */
  FASTIFY_SERVER: (fastify) => {
    // Route upgrade requests (e.g. WebSocket) through Fastify, so a route can take over
    // the socket with reply.hijack(). Bun never passes them to the request handler, and Node
    // only does since 24.9 if no "upgrade" listener exists, so this works the same everywhere.
    fastify.server.on("upgrade", (request, socket, head) => {
      // Give back bytes the client sent right after the handshake.
      if (head?.length) socket.unshift(head);
      Object.defineProperty(request, "socket", { value: socket });
      // Attach the socket, so routes which don't hijack still send a normal response.
      const response = new ServerResponse(request);
      response.assignSocket(socket);
      response.shouldKeepAlive = false;
      fastify.routing(request, response);
    });
    return fastify
      .register(import("@fastify/cookie"), {
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
      .addContentTypeParser("multipart/form-data", async () => {});
  },
};
