import * as esbuild from "esbuild";
import { glob, stat, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import env from "./env.js";

env();

const CWD = process.cwd();
const CONFIG = (await import(`file://${join(CWD, "jeasx.config.js")}`)).default;
const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const BUILD_TIME = `"${process.env.BUILD_TIME || Date.now().toString(36)}"`;

const BROWSER_PUBLIC_ENV = Object.keys(process.env)
  .filter((key) => key.startsWith("BROWSER_PUBLIC_"))
  .reduce(
    (env, key) => {
      env[`process.env.${key}`] = `"${process.env[key]}"`;
      return env;
    },
    Object({ "process.env.BROWSER_PUBLIC_BUILD_TIME": BUILD_TIME }),
  );

/** @type esbuild.BuildOptions */
const SERVER_OPTIONS = {
  entryPoints: ["src/**/[*].*"],
  define: { "process.env.BUILD_TIME": BUILD_TIME },
  minify: !NODE_ENV_IS_DEVELOPMENT,
  logLevel: "info",
  color: true,
  bundle: true,
  metafile: true,
  outdir: "dist",
  publicPath: "/",
  assetNames: "[dir]/[name]-[hash]",
  platform: "neutral",
  format: "esm",
  packages: "external",
  ...CONFIG.ESBUILD_SERVER_OPTIONS?.(),
};

/** @type esbuild.BuildOptions */
const BROWSER_OPTIONS = {
  entryPoints: ["src/**/index.*"],
  define: BROWSER_PUBLIC_ENV,
  minify: !NODE_ENV_IS_DEVELOPMENT,
  logLevel: "info",
  color: true,
  bundle: true,
  outdir: "dist",
  publicPath: "/",
  assetNames: "[dir]/[name]-[hash]",
  platform: "browser",
  format: "esm",
  ...CONFIG.ESBUILD_BROWSER_OPTIONS?.(),
};

for (const options of [SERVER_OPTIONS, BROWSER_OPTIONS]) {
  if (NODE_ENV_IS_DEVELOPMENT) {
    (await esbuild.context(options)).watch();
  } else {
    await esbuild.build(options);
  }
}

// Export metadata for routes and assets
if (!NODE_ENV_IS_DEVELOPMENT) {
  /** @type Record<string,string> */
  const routes = {};
  /** @type Record<string,string> */
  const assets = {};

  const isServerRoute = /^dist\/.*\[.+\]\.js$/;
  const isServerSourcemap = /^dist\/.*\[.+\]\.js\.map$/;
  const isAssetDirectory = /^(dist|public)\//;

  for await (const entry of glob("{public,dist}/**/*")) {
    const path = entry.split(sep).join("/");

    if (isServerRoute.test(path)) {
      routes[path.slice(4 /* "dist".length */, -3 /* ".js".length */)] = path;
      continue;
    }

    if (isServerSourcemap.test(path)) {
      continue;
    }

    // Treat all other files as static assets.
    if ((await stat(join(CWD, path))).isFile()) {
      const match = path.match(isAssetDirectory);
      if (match) {
        assets[path.slice(match[1].length)] = path;
      }
    }
  }

  await writeFile(
    join(CWD, "dist", "[--metadata--].js"),
    `export default ${JSON.stringify({ routes, assets })};`,
  );
}
