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
      sveltePlugin({ compilerOptions: { generate: "server", css: "injected" } }),
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
    plugins: [sveltePlugin({ compilerOptions: { generate: "client", css: "injected" } })],
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
    // Strip cache busters like "/index~mhe4k2x1.css" from the last path segment, but leave
    // the query string alone. The buster is the BUILD_ID (Date.now() in base 36, 8 characters
    // until 2059), so other names with a tilde like "/my~notes.txt" stay untouched.
    rewriteUrl: (req) => req.url.replace(/^([^?]*\/[^/?]*)~[a-z0-9]{8}(\.[^/?]*)(?=\?|$)/, "$1$2"),
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
