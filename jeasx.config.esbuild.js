import { mdxPlugin, sveltePlugin } from "./jeasx.plugins.js";

const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// The server imports this config at startup, so build-only plugins are imported lazily:
// loading them (e.g. the Svelte and Vue compilers) would add about 200 ms to every server start.
export default {
  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_SERVER_OPTIONS: async () => ({
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
  }),

  /** @type {() => Promise<import("esbuild").BuildOptions>} */
  ESBUILD_BROWSER_OPTIONS: async () => ({
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
  }),
};
