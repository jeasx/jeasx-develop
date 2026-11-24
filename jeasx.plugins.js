import { readFile } from "node:fs/promises";

// Build plugins shared by Bun and esbuild. The compilers are imported lazily, so importing
// this file from jeasx.config.js doesn't slow down server starts.

/**
 * Compiles Svelte components. Bun and esbuild share this plugin API, so it works with both.
 * With css: "external", component styles become a CSS import, so they are bundled into the CSS file next to the bundle (e.g. "/svelte/index.css").
 * @param {import("svelte/compiler").CompileOptions} compilerOptions
 * @returns {Promise<import("bun").BunPlugin & import("esbuild").Plugin>}
 */
export async function sveltePlugin(compilerOptions) {
  const { compile, compileModule } = await import("svelte/compiler");
  const styles = new Map();
  return {
    name: "svelte",
    setup(build) {
      build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const { js, css } = compile(source, {
          ...compilerOptions,
          filename: path,
        });
        let contents = js.code;
        if (css?.code) {
          styles.set(path + ".css", css.code);
          contents += `\nimport ${JSON.stringify(path + ".css")};`;
        }
        return { contents, loader: "js" };
      });
      // Runes in .svelte.js modules (e.g. shared state) need the compiler, too.
      build.onLoad({ filter: /\.svelte\.[jt]s$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const { js } = compileModule(source, {
          generate: compilerOptions.generate,
          filename: path,
        });
        return { contents: js.code, loader: "js" };
      });
      build.onResolve({ filter: /\.svelte\.css$/ }, ({ path }) => ({
        path,
        namespace: "svelte-css",
      }));
      build.onLoad({ filter: /.*/, namespace: "svelte-css" }, ({ path }) => ({
        contents: styles.get(path) ?? "",
        loader: "css",
      }));
    },
  };
}

/**
 * Compiles MDX files to JavaScript. Bun and esbuild share this plugin API, so it works with both.
 * @param {import("@mdx-js/mdx").CompileOptions} options
 * @returns {Promise<import("bun").BunPlugin & import("esbuild").Plugin>}
 */
export async function mdxPlugin(options) {
  const { compile } = await import("@mdx-js/mdx");
  return {
    name: "mdx",
    setup(build) {
      build.onLoad({ filter: /\.mdx?$/ }, async ({ path }) => {
        const file = await compile(
          { path, value: await readFile(path, "utf8") },
          options,
        );
        return { contents: String(file), loader: "js" };
      });
    },
  };
}
