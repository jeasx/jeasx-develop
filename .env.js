import mdxPlugin from "@mdx-js/esbuild";
import sveltePlugin from "esbuild-svelte";
import rehypePrismPlus from "rehype-prism-plus";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export default {
  /** @type {() => import("esbuild").BuildOptions} */
  ESBUILD_SERVER_OPTIONS: () => ({
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

  /** @type {() => import("fastify").FastifyServerOptions} */
  FASTIFY_SERVER_OPTIONS: () => ({
    logger: { level: NODE_ENV_IS_DEVELOPMENT ? "error" : "info" },
    bodyLimit: 4 * 1024 * 1024,
  }),

  /** @type {() => import("@fastify/static").FastifyStaticOptions} */
  FASTIFY_STATIC_OPTIONS: () => ({
    immutable: !NODE_ENV_IS_DEVELOPMENT,
    maxAge: NODE_ENV_IS_DEVELOPMENT ? 0 : "365d",
  }),

  /** @type {() => import("@fastify/cookie").FastifyCookieOptions} */
  FASTIFY_COOKIE_OPTIONS: () => ({
    parseOptions: {
      path: "/",
      httpOnly: true,
      secure: "auto",
      sameSite: "strict",
    },
  }),

  /** @type {() => import("@fastify/formbody").FastifyFormbodyOptions} */
  // FASTIFY_FORMBODY_OPTIONS: () => ({}),

  /** @type {() => import("@fastify/multipart").FastifyMultipartAttachFieldsToBodyOptions} */
  FASTIFY_MULTIPART_OPTIONS: () => ({
    attachFieldsToBody: "keyValues",
  }),
};
