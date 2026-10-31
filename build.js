import * as esbuild from "esbuild";
import { readdir, rm, stat, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import env from "./env.js";

env();

const CWD = process.cwd();
const CONFIG = (await import(pathToFileURL(join(CWD, "jeasx.config.js")).href)).default;
const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/** @type {esbuild.BuildOptions} */
const SERVER_OPTIONS = {
  entryPoints: ["src/**/[*].*"],
  minify: !NODE_ENV_IS_DEVELOPMENT,
  logLevel: "info",
  color: true,
  bundle: true,
  outdir: "dist",
  publicPath: "/",
  assetNames: "[dir]/[name]-[hash]",
  format: "esm",
  platform: "neutral",
  packages: "external",
  ...CONFIG.ESBUILD_SERVER_OPTIONS?.(),
};

/** @type {esbuild.BuildOptions} */
const BROWSER_OPTIONS = {
  entryPoints: ["src/**/index.*"],
  minify: !NODE_ENV_IS_DEVELOPMENT,
  logLevel: "info",
  color: true,
  bundle: true,
  outdir: "dist",
  publicPath: "/",
  assetNames: "[dir]/[name]-[hash]",
  format: "esm",
  platform: "browser",
  packages: "bundle",
  ...CONFIG.ESBUILD_BROWSER_OPTIONS?.(),
};

// Start from an empty output directory, so stale routes, assets and metadata
// from previous builds are never served.
await rm(join(CWD, "dist"), { recursive: true, force: true, maxRetries: 3 });

for (const options of [SERVER_OPTIONS, BROWSER_OPTIONS]) {
  if (NODE_ENV_IS_DEVELOPMENT) {
    await (await esbuild.context(options)).watch();
  } else {
    await esbuild.build(options);
  }
}

// Export path mappings for routes and files
if (!NODE_ENV_IS_DEVELOPMENT) {
  /** @type {Record<string,string>} */
  const routes = {};
  /** @type {Record<string,string>} */
  const files = {};

  // Unlike glob, readdir includes dotfiles (e.g. ".well-known"), so the "dotfiles"
  // option of FASTIFY_SEND_OPTIONS decides about them like in development.
  // "dist" comes first: if a file exists in both directories, "dist" wins.
  const entries = [];
  for (const directory of ["dist", "public"]) {
    const names = await readdir(join(CWD, directory), { recursive: true }).catch(() => []);
    entries.push(...names.map((name) => join(directory, name)));
  }

  for (const entry of entries) {
    const path = entry.split(sep).join("/");

    // Handle server routes.
    if (/^dist\/.*\[.+\]\.js$/.test(path)) {
      routes[path.slice("dist".length, -".js".length)] = path;
      continue;
    }

    // Skip sourcemaps for server routes.
    if (/^dist\/.*\[.+\]\.js\.map$/.test(path)) {
      continue;
    }

    // Treat all other entries as static files.
    if ((await stat(join(CWD, path))).isFile()) {
      const key = path.slice(path.indexOf("/"));
      if (!(path.startsWith("public/") && key in files)) {
        files[key] = path;
      }
    }
  }

  await writeFile(
    join(CWD, "dist", "[--metadata--].js"),
    `export default ${JSON.stringify({ routes, files })};`,
  );
}
